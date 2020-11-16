/**
 * Copyright 2020 OpenJS Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/


const path = require('path');

module.exports = function(RED) {
    function HTML(config) {
        var configAsJson = JSON.stringify(config);
        var html = String.raw`<input type='hidden' ng-init='init(` + configAsJson + `)'>`;
        if (config.press && config.press === "press") {
            html += String.raw`<md-button aria-label="capture audio" id="microphone_control_{{$id}}" class="nr-ui-microphone-button" ng-disabled="!enabled" ng-mousedown="toggleMicrophone(true)" ng-mouseup="toggleMicrophone()"><i class="fa fa-2x fa-microphone"></i></md-button>`;
        }
        else {
            html += String.raw`<md-button aria-label="capture audio" id="microphone_control_{{$id}}" class="nr-ui-microphone-button" ng-disabled="!enabled" ng-click="toggleMicrophone()"><i class="fa fa-2x fa-microphone"></i></md-button>`;
        }
        return html;
    }

    function checkConfig(node, conf) {
        if (!conf || !conf.hasOwnProperty("group")) {
            node.error(RED._("ui_microphone.error.no-group"));
            return false;
        }
        return true;
    }

    var ui = undefined; // instantiate a ui variable to link to the dashboard

    function MicrophoneNode(config) {
        try {
            var node = this;
            if(ui === undefined) {
                ui = RED.require("node-red-dashboard")(RED);
            }
            RED.nodes.createNode(this, config);

            // placing a "debugger;" in the code will cause the code to pause its execution in the web browser
            // this allows the user to inspect the variable values and see how the code is executing
            //debugger;

            var done = null;

            if (checkConfig(node, config)) {
                var html = HTML(config);                    // *REQUIRED* get the HTML for this node using the function from above
                done = ui.addWidget({                       // *REQUIRED* add our widget to the ui dashboard using the following configuration
                    node: node,                             // *REQUIRED*
                    order: config.order,                    // *REQUIRED* placeholder for position in page
                    group: config.group,                    // *REQUIRED*
                    width: config.width,                    // *REQUIRED*
                    height: config.height,                  // *REQUIRED*
                    format: html,                           // *REQUIRED*
                    templateScope: "local",                 // *REQUIRED*
                    emitOnlyNewValues: false,               // *REQUIRED*
                    forwardInputMessages: false,            // *REQUIRED*
                    storeFrontEndInputAsState: false,       // *REQUIRED*
                    convertBack: function (value) {
                        return value;
                    },
                    beforeEmit: function(msg) {
                        return { msg: msg };
                    },
                    beforeSend: function (msg, orig) {
                        if (orig) { return orig.msg; }
                    },
                    /**
                     * The initController is where most of the magic happens.
                     * This is the section where you will write the Javascript needed for your node to function.
                     * The 'msg' object will be available here.
                     */
                    initController: function($scope) {

                        $scope.init = function (config) {
                            //console.log("ui_microphone: initialised config:",config);
                            $scope.config = config;
                        }

                        $scope.enabled =  !!navigator.mediaDevices;

                        if (!$scope.enabled) {
                            setTimeout(function() {
                                $("#microphone_control_"+$scope.$id+" i").removeClass("fa-microphone").addClass("fa-microphone-slash");
                            },50);
                        }

                        var worker;
                        var mediaRecorder;
                        var audioContext;
                        var stopTimeout;
                        var active = false;

                        var button = $("#microphone_control_"+$scope.$id);
                        $scope.toggleMicrophone = function(e) {
                            if (e === true) { active = false; }
                            if (!$scope.enabled) return;
                            if (!active) {
                                active = true;
                                $("#microphone_control_"+$scope.$id+" i").removeClass("fa-microphone fa-2x").addClass("fa-rotate-right fa-2x fa-spin");
                                navigator.mediaDevices.getUserMedia({ audio: true, video: false }).then(handleSuccess).catch(handleError);
                            } else {
                                if (mediaRecorder) {
                                    mediaRecorder.stop();
                                }
                            }
                        }
                        $scope.stop = function() {
                            if (active) {
                                mediaRecorder.stop();
                            }
                        }
                        var handleError = function(err) {
                            console.warn("Failed to access microphone:",err);
                            active = false;
                            $("#microphone_control_"+$scope.$id+" i").addClass("fa-microphone fa-2x").removeClass("fa-rotate-right fa-2x fa-spin");
                        }
                        var handleSuccess = function(stream) {
                            mediaRecorder = new MediaRecorder(stream,  {mimeType: 'audio/webm'});
                            mediaRecorder.ondataavailable = function(evt) {
                                if (evt.data.size > 0) {
                                    sendBlob(new Blob([evt.data]));
                                }
                            };

                            mediaRecorder.onstop = function() {
                                if (active) {
                                    active = false;
                                    $("#microphone_control_"+$scope.$id+" i").addClass("fa-microphone fa-2x").removeClass("fa-rotate-right fa-spin");
                                    if (stopTimeout) {
                                        clearTimeout(stopTimeout);
                                        stopTimeout = null;
                                    }

                                    stream.getTracks().forEach( function(track) { track.stop() });
                                }
                            };
                            // Timeslice is not current exposed.
                            // var timeslice = 0;
                            // if ($scope.config.timeslice) {
                            //     timeslice = parseInt($scope.config.timeslice)*1000;
                            // }
                            // if (timeslice) {
                            //     mediaRecorder.start(timeslice);
                            // } else {
                            mediaRecorder.start();
                            // }

                            if ($scope.config && $scope.config.maxLength && ($scope.config.press !== "press")) {
                                stopTimeout = setTimeout(function() {
                                    if (active) {
                                        mediaRecorder.stop();
                                    }
                                },$scope.config.maxLength*1000)
                            } else if (!$scope.config) {
                                console.warn("Microphone node not initialised with user configuration. Using defaults")
                            }
                        };

                        var sendBlob = function(blob) {
                            if (!audioContext) {
                                audioContext= new AudioContext()
                            }
                            var fileReader = new FileReader()
                            // Set up file reader on loaded end event
                            fileReader.onloadend = function() {
                                audioContext.decodeAudioData(fileReader.result, function(audioBuffer) {
                                    convertToWav(audioBuffer)
                                })
                            }
                            fileReader.readAsArrayBuffer(blob)
                        }

                        var convertToWav = function(buffer) {
                            if (!worker) {
                                worker = new Worker('ui_microphone/recorderWorker.js');
                            }
                            worker.postMessage({ command: 'init', config: {sampleRate: 44100} });
                            worker.onmessage = function( e ) {
                                $scope.send({payload:e.data});
                                worker.postMessage({ command: 'clear' });
                            };
                            worker.postMessage({
                                command: 'record',
                                buffer: [
                                    buffer.getChannelData(0),
                                    buffer.getChannelData(0)
                                ]
                            });
                            worker.postMessage({ command: 'exportMonoWAV', type: 'audio/wav' });
                        }
                    }
                });
            }
        }
        catch (e) {
            // eslint-disable-next-line no-console
            console.warn(e);		// catch any errors that may occur and display them in the web browsers console
        }

        node.on("close", function() {
            if (done) { done(); }
        });
    }

    /**
     *  REQUIRED
     * Registers the node with a name, and a configuration.
     * Type MUST start with ui_
     */
    RED.nodes.registerType("ui_microphone", MicrophoneNode);

    var uipath = 'ui';
    if (RED.settings.ui) { uipath = RED.settings.ui.path; }
    var fullPath = path.join('/', uipath, '/ui_microphone/*').replace(/\\/g, '/');
    RED.httpNode.get(fullPath, function (req, res) {
        var options = {
            root: __dirname + '/lib/',
            dotfiles: 'deny'
        };
        res.sendFile(req.params[0], options)
    });

};

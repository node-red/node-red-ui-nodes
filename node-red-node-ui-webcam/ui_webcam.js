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
        if (!config.hasOwnProperty("mirror")) { config.mirror = true; }
        var mirror = config.mirror ? -1 : 1;
        var html = String.raw`
<style>
    .nr-dashboard-ui_webcam {
        padding:0;
    }
    .ui-webcam {
        position: relative;
    }
    .ui-webcam .ui-webcam-playback-container {
        background: repeating-linear-gradient(
            45deg,
            #bbb,
            #bbb 10px,
            #aaa 10px,
            #aaa 20px
        );
    }
    .ui-webcam.active .ui-webcam-playback-container {
        background: #000;
    }
    .ui-webcam video {
        position: absolute;
        width: 100%;
        height: 100%;
        -webkit-transform: scaleX(`+mirror+`);
        transform: scaleX(`+mirror+`);
    }
    .ui-webcam-playback-container {
        width: 100%;
        height: 100%;
        position: relative;
    }
    .ui-webcam-playback-container img {
        position: absolute;
        top:0;
        left: 0;
        width: 100%;
        display: none;
    }
    .ui-webcam-playback-container button {
        position: absolute;
        left: calc(50% - 20px);
        top: calc(50% - 20px);
    }
    .ui-webcam .ui-webcam-toolbar {
        display: none;
        position: absolute;
        right: 5px;
        bottom: 3px;
    }
    .ui-webcam-count {
        position: absolute;
        left: calc(50% - 40px);
        top: calc(50% - 40px);
        width: 80px;
        height: 80px;
        text-align: center;
        line-height: 80px;
        font-size: 80px;
        font-weight: bold;
        color: rgba(0,0,0,0.8);
        text-shadow: -2px -2px 0 white, 2px -2px 0 white, -2px 2px 0 white, 2px 2px 0 white;
    }
</style>
<div class="ui-webcam" id="webcam_{{$id}}" style="width: 100%; height: 100%;">
    <input type='hidden' ng-init='init(` + configAsJson + `)'>
    <div class="ui-webcam-playback-container" id="ui_webcam_playback_container_{{$id}}">
        <video id="ui_webcam_playback_{{$id}}" autoplay></video>
        <canvas id="ui_webcam_canvas_{{$id}}" style="display:none;"></canvas>
        <img id="ui_webcam_image_{{$id}}" src="">
        <span class="ui-webcam-count"></span>
        <md-button aria-label="capture video" id="ui_webcam_btn_enable_{{$id}}" ng-click="enableCamera()"><i class="fa fa-2x fa-camera"></i></md-button>
    </div>
    <span id="ui_webcam_toolbar_{{$id}}" class="ui-webcam-toolbar">
    <md-button aria-label="capture video" id="ui_webcam_btn_trigger_{{$id}}" ng-click="cameraAction()"><i class="fa fa-2x fa-camera"></i></md-button>
    <md-menu md-position-mode="target-right target" >
      <md-button aria-label="Camera options" ng-click="openMenu($mdMenu, $event)">
        <i class="fa fa-9x fa-caret-down"></i>
      </md-button>
      <md-menu-content class="md-dense" width="4">
        <md-menu-item><md-button ng-click="disableCamera()">Turn off camera</md-button></md-menu-item>
        <md-menu-divider></md-menu-divider>
        <md-menu-item"><md-button disabled="disabled">Select Camera</md-button></md-menu-item>
        <md-menu-item ng-repeat="item in data.cameras">
              <md-button ng-click="changeCamera($index)">{{item.label}}</md-button>
            </md-menu-item>
      </md-menu-content>
    </md-menu>
    </span>
</div>
`;
        return html;
    }

    function checkConfig(node, conf) {
        if (!conf || !conf.hasOwnProperty("group")) {
            node.error(RED._("ui_webcam.error.no-group"));
            return false;
        }
        return true;
    }

    var ui = undefined; // instantiate a ui variable to link to the dashboard

    function WebcamNode(config) {
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
                        if (Buffer.isBuffer(msg.payload)) {
                            msg.payload = msg.payload.toString('base64');
                        }
                        return { msg: msg };
                    },
                    beforeSend: function (msg, orig) {
                        if (orig) {
                            // if (orig.msg.status) {
                            //     node.status(orig.msg.status);
                            //     return null;
                            // }
                            var urlPreamble = "data:image/"+(config.format||"png")+";base64,";
                            orig.msg.payload = Buffer.from(orig.msg.payload.substring(urlPreamble.length),'base64')
                            delete orig.msg.capture;
                            return orig.msg;
                        }
                    },
                    /**
                     * The initController is where most of the magic happens.
                     * This is the section where you will write the Javascript needed for your node to function.
                     * The 'msg' object will be available here.
                     */
                    initController: function($scope) {

                        $scope.$on('$destroy', function() {
                            stopActiveTracks();
                        });

                        $scope.init = function (config) {
                            // console.log("ui_webcam: initialised config:",config);
                            $scope.config = config;
                            if ($scope.config.showImage === undefined) {
                                $scope.config.showImageTimeout = 2000;
                                $scope.config.showImage = true;
                            } else if ($scope.config.showImage === -1) {
                                $scope.config.showImage = false;
                            } else {
                                $scope.config.showImageTimeout = parseFloat($scope.config.showImage)*1000;
                                $scope.config.showImage = true;
                            }
                            if ($scope.config.hideCaptureButton) {
                                setTimeout(function() {
                                    $("#ui_webcam_btn_trigger_"+$scope.$id).hide();
                                },100);
                            }
                            if ($scope.config.autoStart) {
                                setTimeout(function() {
                                    $scope.enableCamera();
                                },100);
                            }
                        }
                        $scope.data = {};
                        $scope.data.cameras = []
                        $scope.enabled =  !!navigator.mediaDevices;

                        var active = false;
                        var activeTimeout;
                        var activeCamera = null;
                        var oldActiveCamera = null;

                        $scope.changeCamera = function(deviceId) {
                            oldActiveCamera = activeCamera;
                            activeCamera = $scope.data.cameras[deviceId].deviceId;
                            window.localStorage.setItem("node-red-node-ui-webcam-activeCam",deviceId);
                            $scope.disableCamera();
                            $scope.enableCamera();
                        }

                        $scope.enableCamera = function() {
                            if (!$scope.enabled) {
                                return;
                            }
                            if (!active) {
                                $("#ui_webcam_btn_enable_"+$scope.$id).hide();
                                active = true;
                                var container = $("#ui_webcam_playback_container_"+$scope.$id);
                                var w = container.width();
                                var h = container.height();
                                var vw = w;
                                var vh = h;
                                var ar = w/h;
                                var top = 0;
                                var left = 0;
                                var desiredAr = 640/480;
                                if (ar<desiredAr) {
                                    vh = w/desiredAr;
                                    top = (h-vh)/2;
                                } else if (ar > desiredAr) {
                                    vw = h*desiredAr;
                                    left = (w - vw)/2;
                                }
                                var playbackEl = $("video#ui_webcam_playback_"+$scope.$id);
                                playbackEl.width(vw);
                                playbackEl.height(vh);
                                playbackEl.css({
                                    top: top+"px",
                                    left: left+"px"
                                })
                                var img = $("img#ui_webcam_image_"+$scope.$id);
                                img.width(vw);
                                img.height(vh);
                                img.css({
                                    top: top+"px",
                                    left: left+"px"
                                })
                                var constraint = { audio: false, video: {width: {exact: 640}, height: {exact: 480}}}
                                if (activeCamera) {
                                    constraint.video.deviceId = {exact: activeCamera}
                                }

                                navigator.mediaDevices.getUserMedia(constraint).then(function(stream) {
                                    // $scope.send({status:{shape:"dot",fill:"green",text:"active"}})
                                    $("#webcam_"+$scope.$id).addClass("active")
                                    var playbackEl = document.querySelector("video#ui_webcam_playback_"+$scope.$id);
                                    playbackEl.srcObject = stream;
                                    $scope.data.stream = stream;
                                    $("#ui_webcam_toolbar_"+$scope.$id).show();
                                    if (activeCamera === null) {
                                        var cam = parseInt(window.localStorage.getItem("node-red-node-ui-webcam-activeCam") || 0);
                                        if (cam < stream.getTracks().length) {
                                            activeCamera = stream.getTracks()[cam].getSettings().deviceId;
                                        }
                                    }
                                }).catch(handleError);
                            }
                        }
                        function stopActiveTracks() {
                            if ($scope.data.stream) {
                                var tracks = $scope.data.stream.getTracks();
                                tracks.forEach(function(track) {
                                    track.stop();
                                });
                            }
                            $scope.data.stream = null;
                        }
                        $scope.disableCamera = function() {
                            stopActiveTracks();
                            var playbackEl = document.querySelector("video#ui_webcam_playback_"+$scope.$id);
                            playbackEl.srcObject = null;
                            // $scope.send({status:{shape:"ring",fill:"red",text:"inactive"}})
                            active = false;
                            $("#ui_webcam_btn_enable_"+$scope.$id).show();
                            $("#ui_webcam_toolbar_"+$scope.$id).hide();
                            $("#webcam_"+$scope.$id).removeClass("active")
                        }

                        function countdownSnap(c) {
                            if (c === 0) {
                                $("#ui_webcam_playback_container_"+$scope.$id+" .ui-webcam-count").text("")
                                var imgSrc = takePhoto();
                                $scope.send({payload:imgSrc});
                                return;
                            }
                            $("#ui_webcam_playback_container_"+$scope.$id+" .ui-webcam-count").text(c)
                            activeTimeout = setTimeout(function() {
                                countdownSnap(c-1);
                            },1000);
                        }

                        $scope.cameraAction = function() {
                            if (active) {
                                if ($scope.config.countdown) {
                                    countdownSnap(5);
                                } else {
                                    var imgSrc = takePhoto();
                                    $scope.send({payload:imgSrc});
                                }
                            }
                        }

                        function takePhoto() {
                            clearTimeout(activeTimeout);
                            var playbackEl = document.querySelector("video#ui_webcam_playback_"+$scope.$id);
                            var canvas = document.querySelector("canvas#ui_webcam_canvas_"+$scope.$id);
                            canvas.width = playbackEl.videoWidth;
                            canvas.height = playbackEl.videoHeight;
                            var ctx = canvas.getContext('2d');
                            if ($scope.config.mirror === true) {
                                ctx.translate(playbackEl.videoWidth, 0);
                                ctx.scale(-1, 1);
                            }
                            ctx.drawImage(playbackEl, 0, 0);
                            var img = document.querySelector("img#ui_webcam_image_"+$scope.$id);
                            img.src = canvas.toDataURL('image/'+($scope.config.format||'png'));
                            if ($scope.config.showImage) {
                                img.style.display = "block";
                                if ($scope.config.showImageTimeout) {
                                    activeTimeout = setTimeout(function() {
                                        img.style.display = "none";
                                    },$scope.config.showImageTimeout);
                                }
                            }
                            return img.src;
                        }

                        function handleError(err) {
                            console.warn("Failed to access webcam:",err);
                            if (oldActiveCamera) {
                                activeCamera = oldActiveCamera;
                                oldActiveCamera = null;
                                $scope.disableCamera();
                                $scope.enableCamera();
                            } else {
                                active = false;
                            }
                        }

                        $scope.openMenu = function($mdMenu, ev) {
                            originatorEv = ev;
                            navigator.mediaDevices.enumerateDevices().then(function(devices) {
                                $scope.data.cameras = [];
                                for (let i = 0; i !== devices.length; ++i) {
                                    var device = devices[i];
                                    if (device.kind === "videoinput") {
                                        $scope.data.cameras.push(device);
                                    }
                                }
                                $mdMenu.open(ev);
                            }).catch(handleError);

                        };

                        $scope.$watch('msg', function(msg) {
                            if (!msg) { return; }
                            if (msg.camera !== undefined) {
                                if (!isNaN(parseInt(msg.camera))) {
                                    var c = parseInt(msg.camera);
                                    if (c >= 0 || c < 16) {
                                        oldActiveCamera = activeCamera;
                                        $scope.disableCamera();
                                        activeCamera = null;
                                        window.localStorage.setItem("node-red-node-ui-webcam-activeCam",c);
                                        if (active !== false) {
                                            $scope.enableCamera();
                                        }
                                    }
                                }
                            }
                            if (!active) { return; }
                            var img = document.querySelector("img#ui_webcam_image_"+$scope.$id);
                            if (msg.capture) {
                                msg.payload = takePhoto();
                                $scope.send(msg);
                            } else if (typeof msg.payload === 'string') {
                                clearTimeout(activeTimeout);
                                if (msg.payload === "") {
                                    img.style.display = "none";
                                } else {
                                    img.src = "data:image/"+($scope.config.format||"png")+";base64,"+msg.payload;
                                    img.style.display = "block";
                                }
                            }
                        });
                    }
                });
            }
        }
        catch (e) {
            console.warn(e);
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
    RED.nodes.registerType("ui_webcam", WebcamNode);
};

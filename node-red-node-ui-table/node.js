/**
 * Copyright JS Foundation and other contributors, http://js.foundation
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

var path = require('path');

module.exports = function (RED) {
    function checkConfig(node, conf) {
        if (!conf || !conf.hasOwnProperty('group')) {
            node.error(RED._('table.error.no-group'));
            return false;
        }
        else {
            return true;
        }
    }

    function HTML(config,dark) {
        var configAsJson = JSON.stringify(config);
        var mid = (dark) ? "_midnight" : "";
        var html = String.raw`
                <link href='ui-table/css/tabulator`+mid+`.min.css' rel='stylesheet' type='text/css'>
                <script type='text/javascript' src='ui-table/js/tabulator.js'></script>
                <div id='ui_table-{{$id}}'></div>
                <input type='hidden' ng-init='init(` + configAsJson + `)'>
            `;
        return html;
    };

    function TableNode(config) {
        var done = null;
        var node = this;
        try {
            RED.nodes.createNode(this, config);
            if (checkConfig(node, config)) {
                var ui = RED.require('node-red-dashboard')(RED);
                var sizes = ui.getSizes();
                var luma = 255;
                if (ui.hasOwnProperty("getTheme") && (ui.getTheme() !== undefined)) {
                    var rgb = parseInt(ui.getTheme()["page-sidebar-backgroundColor"].value.substring(1), 16);   // convert rrggbb to decimal
                    luma = 0.2126 * ((rgb >> 16) & 0xff) + 0.7152 * ((rgb >>  8) & 0xff) + 0.0722 * ((rgb >>  0) & 0xff); // per ITU-R BT.709
                }
                var html = HTML(config,(luma < 128));

                done = ui.addWidget({
                    node: node,
                    width: config.width,
                    height: (config.height > 2) ? config.height : 2,  // min height to 2 so auto will show something
                    format: html,
                    templateScope: 'local',
                    order: config.order,
                    group: config.group,
                    forwardInputMessages: false,
                    storeFrontEndInputAsState: false,
                    beforeEmit: function (msg, value) {
                        return {msg: {
                            payload: value, 
                            ui_control: (msg.hasOwnProperty("ui_control")) ? msg.ui_control : undefined,
                        }};
                    },
                    beforeSend: function (msg, orig) {
                        if (orig) { return orig.msg; }
                    },
                    initController: function ($scope, events) {
                        $scope.inited = false;
                        $scope.tabledata = [];
                        var tablediv;
                        var createTable = function(basediv, tabledata, columndata, outputs, ui_control) {
                            if (!ui_control || !ui_control.tabulator) {
                                var y = (columndata.length === 0) ? 25 : 32;
                                var opts = {
                                    data: tabledata,
                                    layout: 'fitColumns',
                                    columns: columndata,
                                    autoColumns: columndata.length == 0,
                                    movableColumns: true,
                                }
                                if ($scope.height==2) { // auto height
                                    opts.height = (tabledata.length > 0 )? tabledata.length * y + 26 : $scope.height*(sizes.sy+sizes.cy);
                                } else {
                                    opts.height = $scope.height*(sizes.sy+sizes.cy);
                                }
                            } else { // configuration via ui_control
                                var y = (ui_control.tabulator.columns.length > 0) ? 32 : 25;
                                var opts = ui_control.tabulator;
                                opts.data = tabledata;
                                if (!ui_control.tabulator.layout) opts.layout = 'fitColumns';
                                if (!ui_control.tabulator.movableColumns) opts.movableColumns = true;
                                if (!ui_control.tabulator.columns) opts.columns = columndata;
                                if (!ui_control.tabulator.autoColumns) autoColumns = columndata.length == 0;
                                if (ui_control.customHeight) {
                                    opts.height= ui_control.customHeight * y + 26;
                                } else { // 
                                    if ($scope.height==2) {  // auto height
                                        opts.height= (tabledata.length > 0 )? tabledata.length * y + 26 : $scope.height*(sizes.sy+sizes.cy);
                                    } else {
                                        opts.height = $scope.height*(sizes.sy+sizes.cy);
                                    }
                                }
                            } // end of configuration via ui_control

                            if (outputs > 0) {
                                opts.cellClick = function(e, cell) {
                                    $scope.send({topic:cell.getField(), payload:cell.getData(), row:(cell.getRow()).getPosition()});
                                };
                            }

                            $scope.table = new Tabulator(basediv, opts);
                        };
                        $scope.init = function (config) {
                            $scope.config = config;
                            tablediv = '#ui_table-' + $scope.$eval('$id')
                            var stateCheck = setInterval(function() {
                                if (document.querySelector(tablediv) && $scope.tabledata) {
                                    clearInterval(stateCheck);
                                    $scope.inited = true;
                                    createTable(tablediv,$scope.tabledata,$scope.config.columns,$scope.config.outputs,$scope.config.ui_control);
                                    $scope.tabledata = [];
                                }
                            }, 200); // lowest setting on my side ... still fails sometimes ;)
                        };
                        $scope.$watch('msg', function (msg) {
                            //console.log("ui-table message arrived:",msg);
                            if (msg && msg.hasOwnProperty("ui_control") && msg.ui_control.hasOwnProperty("callback")) return msg; // to avoid loopback from callbacks. No better solution jet. Help needed.
                            //console.log("ui-table msg: ", msg);

                            // configuration via ui_control
                            if (msg && msg.hasOwnProperty("ui_control")) {

                                var addValueOrFunction = function (config,param,value) {
                                    if (typeof String.prototype.parseFunction != 'function') {
                                        String.prototype.parseFunction = function () {
                                            var funcReg = /function *\(([^()]*)\)[ \n\t]*{(.*)}/gmi;
                                            var match = funcReg.exec(this.replace(/\n/g, ' '));
                                            if(match) {
                                                return new Function(match[1].split(','), match[2]);
                                            }
                                            return null;
                                        };
                                    }
                                    var valueFunction;
                                    if (typeof value === "string" && (valueFunction = value.parseFunction())) {
                                        config[param]=valueFunction.bind($scope); // to enable this.send() for callback functions.
                                    }
                                    else config[param]= value;
                                }

                                var addObject = function (destinationObject,sourceObject) {
                                    for (var element in sourceObject) {
                                        if (!destinationObject[element]) destinationObject[element]=(Array.isArray(sourceObject[element]))? [] : {};
                                        if (typeof sourceObject[element] === "object") {
                                            addObject(destinationObject[element],sourceObject[element])
                                        } else {
                                            addValueOrFunction(destinationObject,element,sourceObject[element]);
                                        }
                                    }
                                }

                                if (!$scope.config.ui_control) { $scope.config.ui_control={}; }

                                addObject($scope.config.ui_control,msg.ui_control);

                            } // end of configuration via ui_control

                            if (msg && msg.hasOwnProperty("payload")) {
                                if (Array.isArray(msg.payload)) {
                                    $scope.tabledata = msg.payload;
                                }

                                // commands to tabulator via msg.payload object
                                if (typeof msg.payload === "object" && msg.payload!==null && !Array.isArray(msg.payload)) {
                                    if (msg.payload.hasOwnProperty("command") && $scope.table!==undefined) {
                                        if (!msg.payload.hasOwnProperty("arguments") || !Array.isArray(msg.payload.arguments)) {
                                            msg.payload.arguments=[];
                                        }
                                        if (msg.payload.returnPromise) {
                                            $scope.table[msg.payload.command].apply($scope.table,msg.payload.arguments).then(function(...args){
                                                $scope.send({topic:"success", ui_control: {callback:$scope.msg.payload.command}, return:$scope.msg.payload});
                                            }).catch(function(error){
                                                if (Object.keys(error).length>0) {
                                                    $scope.send({topic:"error", ui_control: {callback:$scope.msg.payload.command}, return:$scope.msg.payload, error: error});
                                                }
                                            });
                                        } else {
                                            $scope.table[msg.payload.command].apply($scope.table,msg.payload.arguments);
                                        }
                                        return;
                                    }
                                    return;
                                } // end of commands to tabulator via msg.payload object
                                
                            }
                            
                            if ($scope.inited == false) {
                                return;
                            } else {
                                createTable(tablediv, $scope.tabledata, $scope.config.columns, $scope.config.outputs, $scope.config.ui_control);
                            }
                        });
                    }
                });
            }
        }
        catch (e) { console.log(e); }

        node.on('close', function () {
            if (done) { done(); }
        });
    }

    RED.nodes.registerType('ui_table', TableNode);

    var uipath = 'ui';
    if (RED.settings.ui) { uipath = RED.settings.ui.path; }
    var fullPath = path.join('/', uipath, '/ui-table/*').replace(/\\/g, '/');
    RED.httpNode.get(fullPath, function (req, res) {
        var options = {
            root: __dirname + '/lib/',
            dotfiles: 'deny'
        };
        res.sendFile(req.params[0], options)
    });
};
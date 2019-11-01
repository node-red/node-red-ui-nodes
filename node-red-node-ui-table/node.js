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
                var luma = 255;
                if (ui.hasOwnProperty("getTheme") && (ui.getTheme() !== undefined)) {
                    var rgb = parseInt(ui.getTheme()["page-sidebar-backgroundColor"].value.substring(1), 16);   // convert rrggbb to decimal
                    luma = 0.2126 * ((rgb >> 16) & 0xff) + 0.7152 * ((rgb >>  8) & 0xff) + 0.0722 * ((rgb >>  0) & 0xff); // per ITU-R BT.709
                }
                if (config.height == 0) { config.height = 2; } // min height to 2 so auto will show something
                var html = HTML(config,(luma < 128));

                done = ui.addWidget({
                    node: node,
                    width: config.width,
                    height: config.height,
                    format: html,
                    templateScope: 'local',
                    order: config.order,
                    group: config.group,
                    forwardInputMessages: false,
                    columns: config.columns,
                    beforeEmit: function (msg, value) {
                        return {msg: {
                            payload: value, 
                            ui_control: (msg.hasOwnProperty("ui_control")) ? msg.ui_control : undefined,
                            topic: (msg.hasOwnProperty("topic")) ? msg.topic : undefined,
                        }};
                    },
                    beforeSend: function (msg, orig) {
                        if (orig) { 
                            if (orig.msg.hasOwnProperty("layout"))
                                return [null,orig.msg];
                            else
                                return [orig.msg,null];
                            }
                    },
                    initController: function ($scope, events) {
                        $scope.inited = false;
                        $scope.tabledata = [];
                        var tablediv;
                        // (columndata.length === 0) ? true : false,
                        var createTable = function(basediv, tabledata, columndata, outputs, ui_control) {
                            var y = ((ui_control && ui_control.columns.length > 0) || columndata.length > 0) ? 32 : 25;
                            var opts = {
                                data: tabledata,
                                layout: (ui_control && ui_control.layout) ? ui_control.layout : 'fitColumns',
                                columns: (ui_control && ui_control.columns) ? ui_control.columns : columndata,
                                autoColumns: ((ui_control && ui_control.columns.length>0) || columndata.length > 0) ? false : true,
                                movableColumns: (ui_control && (typeof ui_control.movableColumns=="boolean")) ? ui_control.movableColumns : true,
                                groupBy: (ui_control && ui_control.groupBy) ? ui_control.groupBy : undefined,
                                groupHeader: (ui_control && ui_control.groupHeader) ? ui_control.groupHeader : undefined,
                                height: tabledata.length * y + 26,
                            }
                            if (outputs > 0) {
                                opts.cellClick = function(e, cell) {
                                    $scope.send({origin:"ui-table",topic:cell.getField(),payload:cell.getData()});
                                };
                                if (opts.movableColumns) {
                                    opts.columnMoved = function(column, columns){
                                        console.log(columns);
                                        var newColumns=[];
                                        columns.forEach(function (column) {
                                            newColumns.push({"field": column._column.field});
                                        });
                                        $scope.send({origin:"ui-table",topic:$scope.config.topic,layout:"columnMoved",payload:newColumns});
                                    }

                                }
                                opts.columnResized = function(column){
                                    $scope.send({origin:"ui-table",topic:$scope.config.topic,layout:"columnResized",payload:{"field":column._column.field,"width":column._column.width,"widthStyled":column._column.widthStyled}});
                                };
                            }
                            if (Array.isArray(opts.data)){
                                console.log(opts);
                                var table = new Tabulator(basediv, opts);
                            }
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
                            }, 200); // lowest setting on my browser ... fails sometimes
                        };
                        $scope.$watch('msg', function (msg) {
                            if (msg && msg.hasOwnProperty("origin") && (msg.origin=="ui-table")) return;
                            if (msg && msg.hasOwnProperty("topic")) $scope.config.topic=msg.topic;

                            if (msg && msg.hasOwnProperty("payload") && Array.isArray(msg.payload)) {
                                $scope.tabledata = msg.payload;
                            }
                            
                            if (msg && msg.hasOwnProperty("ui_control")) {
                                if (!$scope.config.ui_control) {
                                    $scope.config.ui_control={};
                                }
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

                                    if ((typeof value === "string") && value.includes('{') && value.includes('}')) {
                                        config[param]= value.parseFunction();
                                    } else {
                                        config[param]= value;
                                    }
                                }

                                if (msg.ui_control.hasOwnProperty("layout") && typeof msg.ui_control.layout == "string") {
                                    $scope.config.ui_control.layout=msg.ui_control.layout;
                                }
                                if (msg.ui_control.hasOwnProperty("movableColumns") && typeof msg.ui_control.movableColumns == "boolean") {
                                    $scope.config.ui_control.movableColumns=msg.ui_control.movableColumns;
                                }
                                if (msg.ui_control.hasOwnProperty("groupBy")) {
                                    addValueOrFunction($scope.config.ui_control,"groupBy",msg.ui_control.groupBy);
                                }
                                if (msg.ui_control.hasOwnProperty("groupHeader")) {
                                    addValueOrFunction($scope.config.ui_control,"groupHeader",msg.ui_control.groupHeader);
                                }

                                if (msg.ui_control.hasOwnProperty("columns") && Array.isArray(msg.ui_control.columns)) {
                                    // creates functions for color and legend properties if value includes {}
                                    msg.ui_control.columns.forEach(function (element) {
                                        if (element.hasOwnProperty("formatterParams")) {
                                            for (var prop in element.formatterParams) {
                                                if ((element.formatterParams.hasOwnProperty("color") ||
                                                element.formatterParams.hasOwnProperty("legend"))) {
                                                    addValueOrFunction(element.formatterParams,prop,element.formatterParams[prop])
                                                }
                                            }
                                        }
                                    });

                                   $scope.config.ui_control.columns = msg.ui_control.columns;
                                }
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
    var fullPath = path.join(RED.settings.httpNodeRoot, uipath, '/ui-table/*').replace(/\\/g, '/');;
    RED.httpNode.get(fullPath, function (req, res) {
        var options = {
            root: __dirname + '/lib/',
            dotfiles: 'deny'
        };
        res.sendFile(req.params[0], options)
    });
};

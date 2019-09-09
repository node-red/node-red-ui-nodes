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
                    beforeEmit: function (msg, value) {
                        return { msg: { payload: value } };
                    },
                    beforeSend: function (msg, orig) {
                        if (orig) { return orig.msg; }
                    },
                    initController: function ($scope, events) {
                        $scope.inited = false;
                        $scope.tabledata = [];
                        var tablediv;
                        var createTable = function(basediv, tabledata, columndata, outputs) {
                            var y = (columndata.length === 0) ? 25 : 32;
                            var opts = {
                                data: tabledata,
                                layout: 'fitColumns',
                                columns: columndata,
                                autoColumns: columndata.length == 0,
                                movableColumns: true,
                                height: tabledata.length * y + 26
                            }
                            if (outputs > 0) {
                                opts.cellClick = function(e, cell) {
                                    $scope.send({topic:cell.getField(),payload:cell.getData()});
                                };
                            }
                            var table = new Tabulator(basediv, opts);
                        };
                        $scope.init = function (config) {
                            $scope.config = config;
                            tablediv = '#ui_table-' + $scope.$eval('$id')
                            var stateCheck = setInterval(function() {
                                if (document.querySelector(tablediv) && $scope.tabledata) {
                                    clearInterval(stateCheck);
                                    $scope.inited = true;
                                    createTable(tablediv,$scope.tabledata,$scope.config.columns,$scope.config.outputs);
                                    $scope.tabledata = [];
                                }
                            }, 40);
                        };
                        $scope.$watch('msg', function (msg) {
                            if (msg && msg.hasOwnProperty("payload") && Array.isArray(msg.payload)) {
                                if ($scope.inited == false) {
                                    $scope.tabledata = msg.payload;
                                    return;
                                }
                                createTable(tablediv,msg.payload,$scope.config.columns,$scope.config.outputs);
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

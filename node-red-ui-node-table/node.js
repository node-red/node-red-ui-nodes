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

module.exports = function (RED) {
    function checkConfig(node, conf) {
        if (!conf || !conf.hasOwnProperty('group')) {
            node.error(RED._('table.error.no-group'));
            return false;
        } else {
            return true;
        }
    }

    function HTML(config) {
        var configAsJson = JSON.stringify(config);
        var html = String.raw`
            <link href='table/css/tabulator.min.css' rel='stylesheet'>
            <script type='text/javascript' src='table/js/tabulator.js'></script>
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
                var html = HTML(config);
                done = ui.addWidget({
                    node: node,
                    width: config.width,
                    height: config.height,
                    format: html,
                    templateScope: 'local',
                    order: config.order,
                    group: config.group,
                    beforeEmit: function (msg, value) {
                        return { msg: { payload: value } };
                    },
                    initController: function ($scope, events) {
                        $scope.init = function (config) {
                            $scope.config = config;
                        };
                        $scope.$watch('msg', function (msg) {
                            var tabledata;
                            if (msg && msg.payload) {
                                tabledata = msg.payload;
                            }
                            var columndata = $scope.config.columns;
                            var table = new Tabulator('#ui_table-' + $scope.$eval('$id'), {
                                data: tabledata,
                                layout: 'fitColumns',
                                columns: columndata,
                                autoColumns: columndata.length == 0,
                                movableColumns: true
                                // rowClick:function(e, row) { console.log("CLICK",row._row.data) }
                            });
                        });
                    }
                });
            }
        } catch (e) {
            console.log(e);
        }
        node.on('close', function () {
            if (done) {
                done();
            }
        });
    }

    RED.nodes.registerType('ui_table', TableNode);

    var path;
    if (RED.settings.ui) {
        path = RED.settings.ui.path;
    } else {
        path = 'ui';
    }

    RED.httpNode.get('/' + path + '/table/*', function (req, res) {
        var options = {
            root: __dirname + '/lib/',
            dotfiles: 'deny'
        };
        res.sendFile(req.params[0], options)
    });
};

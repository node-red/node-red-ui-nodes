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

module.exports = function(RED) {
    var id = 0;

    function checkConfig(node, conf) {
        if (!conf || !conf.hasOwnProperty("group")) {
            node.error(RED._("ui_vega.error.no-group"));
            return false;
        }
        return true;
    }

    function HTML(config) {
        var vegaSpec = config.vega ? config.vega : null;
        var vid = "vis"+id;
        id++;
        var html = String.raw`
<body>
    <div id="${vid}"></div>
    <script>
(function(scope, val) {

scope.view = null;

function loadScripts(list, callback) {
    if (list.length > 0) {
        var done = false;
        var src = list.shift();
        var head = document.getElementsByTagName('head')[0];
        var script = document.createElement('script');
        script.src = src;
        head.appendChild(script);
        script.onload = script.onreadystatechange = function() {
            if (!done) {
                if (!this.readyState ||
                    (this.readyState === "loaded") ||
                    (this.readyState === "complete")) {
                    done = true;
                    loadScripts(list, callback);
                    if (head && script.parentNode) {
                        head.removeChild(script);
                    }
                }
            }
        };
    }
    else {
        callback();
    }
}

function showVega(spec) {
    vegaEmbed('#${vid}', spec,
              {
                  actions: false
              }).then(result => {
                  scope.view = result.view;
              });
}

function updateData(target, data) {
    var changeset = vega.changeset().insert(data);
    if (!scope.view) {
        return;
    }
    scope.view.change(target, changeset).runAsync();
}

loadScripts(["https://cdn.jsdelivr.net/npm/vega@5.20.2",
             "https://cdn.jsdelivr.net/npm/vega-lite@5.1.0",
             "https://cdn.jsdelivr.net/npm/vega-embed@6.18.2"],
    function() {
        var vegaSpec = ${vegaSpec};
        if (vegaSpec) {
            showVega(vegaSpec);
        }
        scope.$watch("msg", function(msg) {
            if(msg) {
                if (!vegaEmbed) {
                    return;
                }
                if (msg.payload && msg.payload.$schema) {
                    showVega(msg.payload);
                } else {
                    updateData(msg.payload.target, msg.payload.data);
                }
            }
        });
    }
);

})(scope);
    </script>
</body>
`;
        return html;
    };

    var ui = undefined;
    function VegaNode(config) {
        try {
            var node = this;
            if(ui === undefined) {
                ui = RED.require("node-red-dashboard")(RED);
            }
            RED.nodes.createNode(this, config);
            var done = null;
            if (checkConfig(node, config)) {
                var html = HTML(config);
                done = ui.addWidget({
                    node: node,
                    order: config.order,
                    group: config.group,
                    width: config.width,
                    height: config.height,
                    format: html,
                    templateScope: "local",
                    emitOnlyNewValues: false,
                    forwardInputMessages: false,
                    storeFrontEndInputAsState: true,
                    convertBack: function (value) {
                        return value;
                    },
                    beforeEmit: function(msg, value) {
                        return { msg: { payload:value, socketid:msg.socketid } };
                    },
                    beforeSend: function (msg, orig) {
                        if (orig) {
                            return orig.msg;
                        }
                    },
                    initController: function($scope, events) {
                    }
                });
            }
        }
        catch (e) {
            console.log(e);
        }
        node.on("close", function () {
            if (done) {
                done();
            }
        });
    }
    RED.nodes.registerType('ui_vega', VegaNode);
};

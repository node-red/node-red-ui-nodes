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
    var count = 0;
    function HTML(config) {
        count++;
        var id = "nr-db-if"+count;
        var url = config.url ? config.url : "";
        var allow = "autoplay";
        var origin = config.origin ? config.origin : "*";
        var scale = config.scale;
        if (!scale || (scale === "")) {
            scale = 100;
        }
        var html = String.raw`
<style>.nr-dashboard-ui_iframe { padding:0; }</style>
<div id="${id}-div" style="width:100%; height:100%; display:inline-block;">
    <iframe id="${id}" src="${url}" allow="${allow}" style="width:100%; height:100%; overflow:hidden; border:0; display:block">
        Failed to load Web page
    </iframe>
</div>
<script>
(function(scope) {
    function setScale(iframe, scale) {
        if ((scale !== true) && (scale > 0)) {
            var ifr = $(iframe);
            var ratio = scale/100;
            var rratio = Math.floor(100/ratio);
            ifr.css({
                "transform": "scale("+ratio+")",
                "transform-origin": "0 0",
                "width": rratio +"%",
                "height": rratio +"%",
            });
        }
    }

    var iframe = document.getElementById("${id}");

    setScale(iframe, ${scale});
    if (iframe && iframe.contentWindow) {
        iframe.contentWindow.addEventListener("message", function(e) {
            scope.send({payload: e.data});
        });
    };

    scope.$watch("msg", function(msg) {
        if (iframe && msg) {
           if (msg.url) {
               iframe.setAttribute("src", msg.url);
           }
           if (msg.scale) {
               setScale(iframe, msg.scale);
           }
           if (iframe.contentWindow && msg.payload) {
                var data = JSON.stringify(msg.payload);
                iframe.contentWindow.postMessage(data, "${origin}");
           }
        }
    });
})(scope);
</script>
`;
        return html;
    }

    var ui = undefined;
    function IFrameNode(config) {
        try {
            var node = this;
            if (ui === undefined) {
                ui = RED.require("node-red-dashboard")(RED);
            }
            RED.nodes.createNode(this, config);
            var html = HTML(config);
            var done = ui.addWidget({
                node: node,
                width: config.width,
                height: config.height,
                order: config.order,
                format: html,
                templateScope: "local",
                group: config.group,
                emitOnlyNewValues: false,
                forwardInputMessages: false,
                storeFrontEndInputAsState: false,
                convertBack: function (value) {
                    return value;
                },
                beforeEmit: function(msg, value) {
                    return { msg:msg };
                },
                beforeSend: function (msg, orig) {
                    if (orig) { return orig.msg; }
                },
                initController: function($scope, events) {
                }
            });
            node.on("input", function (msg) {
                if (msg.hasOwnProperty("scale")) {
                    var scale = msg.scale;
                    if (!((scale !== true) && (scale > 0))) {
                        node.error(RED._("ui_iframe.error.scale"));
                    }
                }
            });
            node.on("close", done);
        }
        catch (e) {
            console.log(e);
        }
    }
    RED.nodes.registerType('ui_iframe', IFrameNode);
};

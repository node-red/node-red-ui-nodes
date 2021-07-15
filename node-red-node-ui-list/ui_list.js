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
    // map: input type -> md-list-item class
    var line2class = {
        "one" : null,
        "two" : "md-2-line",
        "three" : "md-3-line"
    };

    // check required configuration
    function checkConfig(node, conf) {
        if (!conf || !conf.hasOwnProperty("group")) {
            node.error(RED._("ui_list.error.no-group"));
            return false;
        }
        return true;
    }

    // generate HTML/Angular code for ui_list widget based on node
    // configuration.
    // Basic structure of generated code is as follows:
    //   <md-list>
    //       <md-list-item ng-repeat="item in msg.items" ...>
    //         specification of list item according to setting options
    //       </md-list-item>
    //   </md-list>
    // It uses ng-repeat of Angular in order to repeat over items in
    // a list pointed by msg.items sent from Node-RED backend.
    //
    function HTML(config) {
        var actionType = config.actionType;
        var allowClick = (actionType === "click");
        var allowCheck = (actionType === "check");
        var allowSwitch = (actionType === "switch");
        var allowMenu = (actionType === "menu");
        var allowHTML = config.allowHTML;
        var line_type = config.lineType;
        var line_class = line2class[config.lineType];
        var classes = line_class ? [line_class] : [];
        var click = String.raw`ng-click="click(item)"`;
        var title = (allowHTML ? String.raw`<span ng-bind-html="item.title | trusted"></span>` : String.raw`{{item.title}}`);
        var desc = (allowHTML ? String.raw`<span ng-bind-html="item.description | trusted"></span>` : String.raw`{{item.description}}`);
        var icon = String.raw`
        <img src="{{item.icon}}" class="md-avatar" ng-if="(item.icon !== undefined) && (item.icon !== null)">
        <md-icon aria-label="{{item.desc}}" style="color:`+config.tcol+String.raw`" ng-if="(item.icon === undefined) && (item.icon_name !== undefined)"><ui-icon icon="{{item.icon_name}}"></ui-icon></md-icon>
        <span class="md-avatar" style="font-size:x-large; height:unset;" ng-if="(item.icon === undefined) && (item.icon_unicode !== undefined)"><h1>{{item.icon_unicode}}</h1></span>
        <md-icon class="md-avatar-icon" aria-label="{{item.desc}}" ng-if="(item.icon === null) && (item.icon_name === undefined) && (item.icon_unicode === undefined)"></md-icon>
`;
        var body = null;
        if (line_type === "one") {
            body = String.raw`
        <p>${title}</p>
`;
        }
        else {
            body = String.raw`
        <div class="md-list-item-text">
            <h3>${title}</h3>
            <p>${desc}</p>
        </div>
`;
        }
        var md_checkbox = String.raw`
        <md-checkbox class="md-secondary" ng-model="item.isChecked" ng-change="click(item)"></md-checkbox>
`;
        var md_switch = String.raw`
        <md-switch class="md-secondary" ng-model="item.isChecked" ng-change="click(item)"></md-switch>
`;
        var md_menu = String.raw`
        <md-menu class="md-secondary">
            <md-button>
                <span style="float: right"><i class="fa fa-list"></i></span>
            </md-button>
            <md-menu-content>
                <md-menu-item ng-repeat="menu_item in item.menu">
                    <md-button ng-click="click(item, menu_item)">
                      {{menu_item}}
                    </md-button>
                </md-menu-item>
            </md-menu-content>
        </md-menu>
`;
        var class_decl = (classes.length > 0) ? ("class=\"" +classes.join([separator=" "]) +"\"") : "";
        var html = String.raw`
<md-list>
    <md-list-item aria-label="{{item.desc}}" ${class_decl} ng-repeat="item in msg.items" ${(allowClick ? click : "")}>
${icon}
${body}
${(allowCheck ? md_checkbox : "")}
${(allowSwitch ? md_switch : "")}
${(allowMenu ? md_menu : "")}
   </md-list-item>
</md-list>
`;
        return html;
    }

    // Holds a reference to node-red-dashboard module.
    // Initialized at #1.
    var ui = undefined;

    // Node initialization function
    function ListNode(config) {
        try {
            var node = this;
            if (ui === undefined) {
                // #1: Load node-red-dashboard module.
                // Should use RED.require API to cope with loading different
                // module.  And it should also be executed at node
                // initialization time to be loaded after initialization of
                // node-red-dashboard module.
                ui = RED.require("node-red-dashboard")(RED);
            }
            config.tcol = ui.getTheme()["group-textColor"].value || "#1bbfff";
            // Initialize node
            RED.nodes.createNode(this, config);
            var done = null;
            if (checkConfig(node, config)) {
                // Generate HTML/Angular code
                var html = HTML(config);
                // Initialize Node-RED Dashboard widget
                // see details: https://github.com/node-red/node-red-ui-nodes/blob/master/docs/api.md
                done = ui.addWidget({
                    node: node,             // controlling node
                    order: config.order,    // placeholder for position in page
                    group: config.group,    // belonging Dashboard group
                    width: config.width,    // width of widget
                    height: config.height,  // height of widget
                    format: html,           // HTML/Angular code
                    templateScope: "local",	// scope of HTML/Angular(local/global)*
                    emitOnlyNewValues: false,
                    forwardInputMessages: false,
                    storeFrontEndInputAsState: false,
                    convertBack: function (value) {
                        return value;
                    },
                    beforeEmit: function(msg, value) {
                        // make msg.payload accessible as msg.items in widget
                        // and map simple text array to object title
                        if (Array.isArray(value)) {
                            value = value.map(function(i) {
                                if (typeof i === "string") { i = {title:i} }
                                return i;
                            });
                        }
                        return { msg: { items:value, socketid:msg.socketid } };
                    },
                    beforeSend: function (msg, orig) {
                        if (orig) {
                            orig.msg.topic = config.topic;
                            return orig.msg;
                        }
                    },
                    initController: function($scope, events) {
                        // initialize $scope.click to send clicked widget item
                        // used as ng-click="click(item, selected)"
                        $scope.click = function(item, selected) {
                            if (selected !== undefined) { item.selected = selected; }
                            if (item.hasOwnProperty("$$hashKey")) { delete item.$$hashKey; }
                            $scope.send({payload:item});
                        };
                    }
                });
            }
        }
        catch (e) {
            console.log(e);
        }
        node.on("close", function() {
            if (done) {
                // finalize widget on close
                done();
            }
        });
    }
    // register ui_list node
    // type MUST start with ui_
    RED.nodes.registerType('ui_list', ListNode);
};

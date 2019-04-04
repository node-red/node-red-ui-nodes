# API for Defining New Dashboard Widgets

In the past, the Node-RED Dashboard did not allow for installing user defined widget nodes.  Versions 2.10.0 of the dashboard now provide a mechanism for creating installable widget nodes.  This opens the way for the community to create a richer set of graphical user interface nodes.

A good example of a simple list widget to copy from can be found here - https://github.com/node-red-hitachi/ui_list

## Creating a Widget Node

The basic node code (HTML, JavaScript, package.json, …) structure that is needed to define a Widget Node is the same as the one for normal node definitions as described in the [Node-RED documentation](https://nodered.org/docs/creating-nodes/).

When naming, please try to stick to the Node-RED conventions, e.g. : `node-red-contrib-ui-{your-widget-name}`

## Widget Definition API

Dashboard module (`node-red-dashboard`) exposes an API for defining new widgets.  
In order to use the API for a new widget node, the node must load `node-red-dashboard` module.  
The dashboard module should be loaded using `RED.require` runtime API instead of standard `require` call in the node initialization.
The `RED.require` is needed to resolve problems possibility of loading incompatible `node-red-dashboard` modules.

## API for Widget Definition

To support new widgets, the following runtime API is exported from the Node-RED Dashboard module:

- `addWidget(`*options*`)`

  *options* is an JavaScript object that can contain the following properties:

  | #    | name[* - optional]         | description                                                  |
  | :--- | :------------------------- | :----------------------------------------------------------- |
  | 1    | node*                      | controlling node.<br/>optional if scope is "global".                                             |
  | 2    | format                     | HTML code of widget.<br />Accepts HTML same as one for Template Dashboard widget node. |
  | 3    | group                      | group node object to which widget belongs                    |
  | 4    | width*                     | width of widget                                              |
  | 5    | height*                    | height of widget                                             |
  | 6    | order                      | order in group                                               |
  | 7    | templateScope              | scope of widget ("global" or "local")                        |
  | 8    | emitOnlyNewValues*         | send message if changed                                      |
  | 9    | forwardInputMessages*      | forward input messages to output                             |
  | 10   | storeFrontEndInputAsState* | store received message                                       |
  | 11   | convert*                   | callback to convert value to front-end                       |
  | 12   | beforeEmit*                | callback to prepare message                                  |
  | 13   | convertBack*               | callback to convert sent message                             |
  | 14   | beforeSend*                | callback to prepare message                                  |
  | 15   | initController*            | callback to initialize in controller                         |

  `addWidget` returns a callback that should be called on close of controlling node.
   Node that callback function specified by `initController` is executed in client side.  Thus, it can not refer variables outside function scope.

  ## Typical Node Code Structure

  ### HTML code

  - Same as normal node described at (https://nodered.org/docs/creating-nodes/node-html).  

  - Should provide interface for setting group node.

    **Example:**
    Following example defines calendar input widget using [`md-calendar`](https://material.angularjs.org/1.1.6/api/directive/mdCalendar) of AngularJS.


![Calendar Widget](https://user-images.githubusercontent.com/30289092/46152763-a7ca0c00-c2ac-11e8-8be1-b7a350de40a7.png)

  - HTML fragment for Node setting UI:

    defines following default parameters
    - group: belonging group
    - size: size of widget
    - name: name of widget

    ```
    <script type="text/x-red" data-template-name="ui_cal">
        <div class="form-row" id="template-row-group">
           <label for="node-input-group"><i class="fa fa-table"></i> Group</label>
           <input type="text" id="node-input-group">
        </div>
        <div class="form-row" id="template-row-size">
            <label><i class="fa fa-object-group"></i> Size</label>
            <input type="hidden" id="node-input-width">
            <input type="hidden" id="node-input-height">
            <button class="editor-button" id="node-input-size"></button>
        </div>
        <div class="form-row">
            <label for="node-input-name"><i class="fa fa-tag"></i> Name</label>
            <input type="text" id="node-input-name">
        </div>
    </script>
    ```

  - Info text:

    ```
    <script type="text/x-red" data-help-name="ui_cal">
        <p>Sample Widget - appears in the Info tab on the right</p>
    </script>
    ```

  - Type Initialization

    ```
    <script type="text/javascript">
        function mk_conf(NAME) {

            var ICON = "icon.png";

            var conf = {
                category: 'dashboard',
                color: 'rgb( 63, 173, 181)',
                defaults: {
                    group: {type: 'ui_group', required:false},
                    name: {value: ''},
                    order: {value: 0},
                    width: {
                        value: 0,
                        validate: function(v) {
                            var valid = true
                            var width = v||0;
                            var currentGroup = $('#node-input-group').val()|| this.group;
                            var groupNode = RED.nodes.node(currentGroup);
                            valid = !groupNode || +width <= +groupNode.width;
                            $("#node-input-size").toggleClass("input-error",!valid);
                            return valid;
                        }},
                    height: {value: 0}
                },
                inputs:1,
                outputs:1,
                icon: ICON,
                paletteLabel: NAME,
                label: function() { return this.name || NAME; },
                oneditprepare: function() {
                    $("#node-input-size").elementSizer({
                        width: "#node-input-width",
                        height: "#node-input-height",
                        group: "#node-input-group"
                    });
                },
                oneditsave: function() {
                },
                oneditresize: function(size) {
                }
            };
            return conf;
        };

        RED.nodes.registerType('ui_cal', mk_conf('cal')); // NOTE: The type MUST start with "ui_"
    </script>
    ```
    Use `ui_group` for configuring belonging group, and `elementSizer` for configuring widget size.

  ### JavaScript code

  - load Dashboard module using `RED.require` runtime API.
  - call `addWidget` API in order to define widget.

  ```
  module.exports = function(RED) {
      // define HTML code
      var HTML = String.raw`
  <md-calendar
       ng-model="value"
       ng-change="click(value)"
       aria-label="{{label}}"
       style="z-index:1">
  </md-calendar>
  `;

      var ui = undefined;
      function CalNode(config) {
          try {
              var node = this;
              if(ui === undefined) {
                  // load Dashboard API
                  ui = RED.require("node-red-dashboard")(RED);
              }
              RED.nodes.createNode(this, config);
              // create new widget
              var done = ui.addWidget({
                  node: node,
                  format: HTML,
                  templateScope: "local",
                  group: config.group,
                  emitOnlyNewValues: false,
                  forwardInputMessages: false,
                  storeFrontEndInputAsState: false,
                  convertBack: function (value) {
                      return value;
                  },
                  // needs beforeSend to message contents to be sent back to runtime
                  beforeSend: function (msg, orig) {
                      if (orig) {
                          return orig.msg;
                      }
                  },
                  // initialize angular scope object
                  initController: function($scope, events) {
                      $scope.value = false;
                      $scope.click = function (val) {
                          $scope.send({payload: val});
                      };
                  }
              });
          }
          catch (e) {
              console.log(e);
          }
          node.on("close", done);
      }
      RED.nodes.registerType('ui_cal', CalNode); // NOTE: The type MUST start with "ui_"
  };
  ```

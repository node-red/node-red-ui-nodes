/**
 * Copyright 2018 Seth350
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



 /*************************************************************************
  * !!REQUIRED!!
  * A ui-node must always begin with the following function.
  * module.exports = function(RED) {your code here}
  * There is no need to edit this line.
  */

 module.exports = function(RED) {

//*************************************************************************/
    // TODO: Is this needed????
    var settings = RED.settings;  // not sure if this is needed?


/**********************************************************************
 * !!REQUIRED!!
 *
 * A ui-node must always contain the function HTML(config) {}
 *
 * This function will generate the HTML (as a text string) which will be showed in the browser
 * on the dashboard.
 *
 * The 'config' input contains all the node properties, which can be changed by the user on
 * the node's config screen (in the flow editor).
 *
 * In this function 3 AngularJs directives are being demonstrated:
 *  -> ng-init is required to transfer the node configuration from the Node-RED flow to the dashboard.
 *  -> ng-model is used to make sure the data is (two way) synchronized between the scope and the html element.
 *          (the 'textContent' variable on the AngularJs $scope is called the 'model' of this html element.
 *  -> ng-change is used to do something (e.g. send a message to the Node-RED flow, as soon as the data in the model changes.
 *  -> ng-keydown is used to do something when the user presses a key. (e.g., type a value into a textbox, then press enter)
 **********************************************************************/

     function HTML(config) {
        // The configuration is a Javascript object, which needs to be converted to a JSON string
        var configAsJson = JSON.stringify(config);

        // var html = String.raw`
        // <input type='text' style='color:` + config.textColor + `;' ng-init='init(` + configAsJson + `)' ng-model='textContent' ng-change='change()'>
        // `;
        // return html;

        var html = String.raw`
        <input type='text' style='color:` + config.textColor + `;' ng-init='init(` + configAsJson + `)' ng-model='textContent' ng-keydown='enterkey($event)'>
        `;
        return html;
    };

/********************************************************************
* REQUIRED
* A ui-node must always contain the following function.
* This function will verify that the configuration is valid
* by making sure the node is part of a group. If it is not,
* it will throw a "no-group" error.
* You must enter your node name that you are registering here.
*/
    function checkConfig(node, conf) {
        if (!conf || !conf.hasOwnProperty("group")) {
            node.error(RED._("ui_my-little-ui-node.error.no-group"));
            return false;
        }
        return true;
    }

/********************************************************************
*********************************************************************
* !!REQUIRED!!
*
* UI Variable Define
*
* Define a variable to reference the ui.
* There is no need to edit this line.
*/

    var ui = undefined;

/******************************************************************** */


/*********************************************************************
* !!REQUIRED!!
+
* A ui-node must always contain a YourNodeNameHere(config) function, which will be executed in the Node-RED flow.
* This function will add the widget to the dashboard, based on the 'required' node properties.  On the other hand
* our own custom node properties will most probably not be used here, but only in the above HTML function (where
* all properties are available in the config variable).
*
*/
    function MyLittleUiNode(config) {
         try {
             var node = this;
            if(ui === undefined) {
                ui = RED.require("node-red-dashboard")(RED);
            }
            RED.nodes.createNode(this, config);

            // placing a "debugger;" in the code will cause the code to pause its execution in the web browser
            // this allows the user to inspect the variable values and see how the code is executing.
            // Remove those statements when you publish your node on NPM!!!
            //debugger;

        if (checkConfig(node, config)) {
            var html = HTML(config);                    // *REQUIRED* !!DO NOT EDIT!!
            var done = ui.addWidget({                   // *REQUIRED* !!DO NOT EDIT!!
                node: node,                             // *REQUIRED* !!DO NOT EDIT!!
                order: config.order,                    // *REQUIRED* !!DO NOT EDIT!!
                group: config.group,                    // *REQUIRED* !!DO NOT EDIT!!
                width: config.width,                    // *REQUIRED* !!DO NOT EDIT!!
                height: config.height,                  // *REQUIRED* !!DO NOT EDIT!!
                format: html,                           // *REQUIRED* !!DO NOT EDIT!!
                templateScope: "local",                 // *REQUIRED* !!DO NOT EDIT!!
                emitOnlyNewValues: false,               // *REQUIRED* Edit this if you would like your node to only emit new values.
                forwardInputMessages: false,            // *REQUIRED* Edit this if you would like your node to forward the input message to it's ouput.
                storeFrontEndInputAsState: false,       // *REQUIRED* If the widgect accepts user input - should it update the backend stored state ?

/********************************************************************

/********************************************************************
* !!REQUIRED!!
*
* Convert Back Function
* Callback to convert sent message.
*
* TODO: Need help explaining this one.
*/

                convertBack: function (value) {
                    return value;
                },

/********************************************************************
/********************************************************************
* !!REQUIRED!!
*
* Before Emit Function
* Callback to prepare message that is sent from the backend TO the widget
*
*/

                beforeEmit: function(msg, value) {
                    return { msg: msg };
                },

/********************************************************************
/********************************************************************
* !!REQUIRED!!
*
* Before Send Function
* Callback to prepare message FROM the UI before it is sent to next node
*
*/
                beforeSend: function (msg, orig) {
                    if (orig) {
                        return orig.msg;
                    }
                },

/********************************************************************
/********************************************************************
* !!REQUIRED!!
*
* Init Controller
* Callback to initialize in controller.
*
* The initController is where most of the magic happens, to let the dashboard communicate with
* the Node-RED flow.
*/
                initController: function($scope, events) {
                    debugger;

                    $scope.flag = true;   // not sure if this is needed?

/*******************************************************************
/*******************************************************************
*
* STORE THE CONFIGURATION FROM NODE-RED FLOW INTO THE DASHBOARD
* The configuration (from the node's config screen in the flow editor) should be saved in the $scope.
* This 'init' function should be called from a single html element (via ng-init) in the HTML function,
* since the configuration will be available there.
*
*/
                    $scope.init = function (config) {
                        $scope.config = config;

                        // The configuration contains the default text, which needs to be stored in the scope
                        // (to make sure it will be displayed via the model).
                        $scope.textContent = config.textLabel;
                    };

/*******************************************************************
/*******************************************************************
*
* HANDLE MESSAGE FROM NODE-RED FLOW TO DASHBOARD
* Use $scope.$watch 'msg' to manipulate your user interface when a message from the Node-RED flow arrives.
* As soon as the message arrives in the dashboard, the callback function will be executed.
* Inside the callback function, you can manipulate your node's HTML attributes and elements.  That way you
* can update the dashboard based on data from the input message.
* E.g. change the text color based on the value of msg.color.
*
*/
                    $scope.$watch('msg', function(msg) {
                        if (!msg) { return; } // Ignore undefined msg

                        // The payload contains the new text, which we will store on the scope (in the model)
                        $scope.textContent = msg.payload;
                    });

/*******************************************************************
/*******************************************************************
*
* SEND MESSAGE FROM DASHBOARD TO NODE-RED FLOW
* When the user has changed something in the dashboard, you can send the updated data to the Node-RED flow.
*
*/
                    $scope.change = function() {
                        // The data will be stored in the model on the scope
                        $scope.send({payload: $scope.textContent});
                    };
/*******************************************************************/
/*******************************************************************
*
* SEND MESSAGE FROM DASHBOARD TO NODE-RED FLOW
* While an input has focus, the user can press the enter key to send the updated data to the Node-RED flow.
*
*/
                    $scope.enterkey = function(keyEvent){
                        if (keyEvent.which === 13) {
                            $scope.send({payload: $scope.textContent});
                        }
                    };
/*******************************************************************/


                }
            });
        }
        }
        catch (e) {
            console.log(e);		// catch any errors that may occur and display them in the web browsers console
        }

/*******************************************************************
* !!REQUIRED!!
* TODO: Get with team on purpose of this node.
* There is no need to edit these lines.
*/
        node.on("close", function() {
            if (done) {
                done();
            }
        });
/*******************************************************************/
    }


/*******************************************************************
* !!REQUIRED!!
* Registers the node with a name, and a configuration.
* You must enter the SAME name of your node you registered (in the html file) and enter the name
* of the function (see line #87) that will return your nodes's configuration.
* Note: the name must begin with "ui_".
*/
    RED.nodes.registerType("ui_my-little-ui-node", MyLittleUiNode);
}

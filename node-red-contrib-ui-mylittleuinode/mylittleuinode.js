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
 * REQUIRED
 * A ui-node must always contain the following function.
 * function HTML(config) {}
 *
 * This function will build the HTML (as a text string) which will be showed in the browser
 * on the dashboard.
 *
 * The 'config' input contains all the node properties, which can be changed by the user on 
 * the node's config screen (in the flow editor).
 *
 * Caution: the user can visualise multiple instances of this widget node on his dashboard.
 * This will require us to give the node a unique identifier in the browser, so that our
 * node properties are send only to the corresponding widget in the browser.
 * We do this by appending the Angular expression {{$id}} to the id's of our html elements.
 * For example id="mytext_{{$id}}"
 * When the HTML for our node is generated on the dashboard, a unique number will be inserted
 * where the {{$id}} expression is located.  You could use the inspector (of you browser developer
 * tools) to find out which id has been generated, but you rarely will need to know it.
 * This generated number will change everyime you deploy a change to the dashboard anyways...
 * 
 * Remark: those unique id's are only required in this .js file, and not in the .html file.
 * (because the flow editor only renders and visualises only ONE config screen at a time).
 **********************************************************************/
    
     function HTML(config) { 
        var html = String.raw`
        <font id="mytext_{{$id}}" color="`+config.textColor+`">`+config.textLabel+`</font>
        `;
        return html;
    };

/********************************************************************


*********************************************************************
* !!REQUIRED!!
* 
* UI Variable Define
* 
* Define a variable to reference the ui.
* There is no need to edit this line.
*/

    var ui = undefined 
    
/******************************************************************** */


/*********************************************************************
* !!REQUIRED!!
* A ui-node must always contain the following function.
* function YourNodeNameHere(config){}
* This function will add the widget to the dashboard, based on the 'required' node properties (which can
* be changed by the user on the node's config screen in the flow editor).  On the other hand our own
* custom node properties will most probably not used here, but only in the above HTML function...
*
* Here you can also put any other Javascript code which is needed. 
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

            var html = HTML(config);                    // *REQUIRED* !!DO NOT EDIT!!
            var done = ui.addWidget({                   // *REQUIRED* !!DO NOT EDIT!!
                node: node,                             // *REQUIRED* !!DO NOT EDIT!!
                group: config.group,                    // *REQUIRED* !!DO NOT EDIT!!
                width: config.width,                    // *REQUIRED* !!DO NOT EDIT!!
                height: config.height,                  // *REQUIRED* !!DO NOT EDIT!!
                format: html,                           // *REQUIRED* !!DO NOT EDIT!!
                templateScope: "local",                 // *REQUIRED* !!DO NOT EDIT!!
                emitOnlyNewValues: false,               // *REQUIRED* Edit this if you would like your node to only emit new values. 
                forwardInputMessages: false,            // *REQUIRED* Edit this if you would like your node to forward the input message to it's ouput.
                storeFrontEndInputAsState: false,       // *REQUIRED* TODO: Not sure what this is for????

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
* Callback to prepare message
* 
* TODO: Need help explaining this one. 
*/

                beforeEmit: function(msg, value) {
                    return { msg: msg };
                },

/********************************************************************

/********************************************************************
* !!REQUIRED!!
* 
* Before Send Function
* Callback to prepare message.
* 
* TODO: Need help explaining this one.
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
                    //debugger;
                 
                    $scope.flag = true;   // not sure if this is needed?

/*******************************************************************

/*******************************************************************
* 
* $scope.$watch
* Use this function to manipulate your user interface when something changes.
* For example by watching 'msg', you can detect when an input message arrives from the Node-RED flow.
* As soon as the message arrives in the dashboard, the callback function will be executed.
* Inside the callback function, it is also possible to use jQuery and Angular to manipulate 
* your node's HTML attributes and elements.  That way you can update the dashboard based on data
* from the input message.  E.g. change the text color based on the value of msg.color.
* 
*/
                    $scope.$watch('msg', function(msg) {
                        // If you want to modify an html element, just get the element based on his id.
			// When you have Angular expression {{$id}} to define a unique id for the html element, 
			// then use the SAME id (inclusive {{$id}}) here. 
			// var e = document.getElementById("mytext_"+$scope.$eval('$id'))
                        // $(e).text(msg.payload)
                    });
/*******************************************************************/
                }
            });
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
*/
    RED.nodes.registerType("my-little-ui-node", MyLittleUiNode);
}

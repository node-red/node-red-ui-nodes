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
 * This function will build the HTML necessary to display your node on the dashboard.
 * It will also pass in the node's configuration so that the parameters may be referenced from the flow editor.
 * One thing to know when creating your own node is that it is most likley
 * that a user will have more than one of your nodes on their dashboard.
 * This will require us to give the node a unique identifier so that we
 * may pass values only to the node we want to change on the dashboard.
 * We do this by using the Angular expression {{$id}}.
 * When the HTML for our node is generated on the dashboard, a unique 
 * number will be placed where the {{$id}} expression is located.
 * In our case, our font element's id will be "mytext_{{$id}}". Once the
 * node is generated on the dashboard, you will be able to open your
 * browsers developer tools and browse through the HTML of the dashboard
 * to find what number was generated for our font element.
 * You do not need to know this number, but it is best that you know what
 * its function is. 
 * The number will change everyime you deploy a change to the dashboard
 * anyways.
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
* This function will set the needed variables with the parameters from the flow editor.
* It also will contain any Javascript needed for your node to function. 
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
            // this allows the user to inspect the variable values and see how the code is executing
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
*
* The initController is where most of the magic happens.
* This is the section where you can write the Javascript needed
* for any other functions your node may need.
*/
                initController: function($scope, events) {
                    //debugger;
                 
                    $scope.flag = true;   // not sure if this is needed?

/*******************************************************************

/*******************************************************************
* 
* $scope.$watch
* Use this function to manipulate your ui node when a msg arrives.
* This function will run when a msg object is sent to your ui node.
* It is also possible to use jQuery and Angular here to manipulate 
* your node's HTML attributes and elements. 
* E.g., change text color when msg.color is sent to your node.
* 
*/
                    $scope.$watch('msg', function(msg) {
                        
                        // Your extra function code goes here.
                        // You may use jQuery or access the DOM here as well to manipulate your node's HTML.
                        // NOTE: Remember when we discussed using the Angular expression {{$id}} to define a 
                        // unique id for our font element. There is a way for you to reference it.
                        // You must create a reference to the element you would like to modify, like so.
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
* You must enter the name of your node you registered and enter the name
* of the function that will return your nodes's configuration.
*/
    RED.nodes.registerType("mylittleuinode", MyLittleUiNode);
}
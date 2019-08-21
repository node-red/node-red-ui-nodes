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


 /**
  * REQUIRED
  * A ui-node must always begin with the following function.
  * module.exports = function(RED) {your code here}
  */
 module.exports = function(RED) {
    var settings = RED.settings;  // not sure if this is needed?

    /**
	 * REQUIRED
     * A ui-node must always contain the following function.
     * function HTML(config) {}
     * This function will build the HTML necessary to display the lineargauge on the dashboard.
     * It will also pass in the node's config so that the parameters may be referenced from the flow editor.
     */
    function HTML(config) {
        var html = String.raw`
            <style>
                .linearGauge1 {
                    top: 0px;
                    left: 10px;
                    position:absolute;
                    width:20px;
                    height:11px;
                }

                #valueContainer {
                    position: absolute;
                    width:64px;
                    height:11px;
                    justify-content: center;
                    text-align:center;
                    font-size:12px;
                }

                .pointer {
                    fill:#696969;
                    stroke-width: 1px;
                    stroke: #404040;
                }

                .scaleContainer {
                    height:188px;
                    width:100%;
                }
            </style>
            <div id="lg_{{$id}}>
            <div id="valueContainer">
                <text class="lgText" dx="10" dy="3">{{msg.payload}}`+config.unit+`</text>
            </div>
            <div class="linearGauge">
                <svg class="scaleContainer">
                    <title id="lgtooltip_{{$id}}"></title>
                    <rect class="scaleArea1_{{$id}}" x="0" y="141" width="20" height="47" stroke="#000" stroke-width="1px" fill="` + config.colorLowArea + `"></rect>
                    <rect class="scaleArea2_{{$id}}" x="0" y="47" width="20" height="94" stroke="#000" stroke-width="1px" fill="` + config.colorMidArea + `"></rect>
                    <rect class="scaleArea3_{{$id}}" x="0" y="0" width="20" height="47" stroke="#000" stroke-width="1px" fill="` + config.colorHighArea + `"></rect>
                    <path id="lgPtr_{{$id}}" d="M0,9.306048591020996L10.74569931823542,-9.306048591020996 -10.74569931823542,-9.306048591020996Z" class="pointer" transform="translate(10,0)rotate(90)">
                    </path>
                </svg>
            </div>
            <text class="lgText" dx="10" dy="3">`+config.name+`</text>
            </div>
        `;
        return html;
    };


    /**
     * REQUIRED
     * A ui-node must always contain the following function.
     * This function will verify that the configuration is valid
     * by making sure the node is part of a group. If it is not,
     * it will throw a "no-group" error.
     * You must enter your node name that you are registering here.
     */
    function checkConfig(node, conf) {
        if (!conf || !conf.hasOwnProperty("group")) {
            node.error(RED._("ui_lineargauge.error.no-group"));
            return false;
        }
        return true;
    }

    var ui = undefined; // instantiate a ui variable to link to the dashboard

    /**
	 * REQUIRED
     * A ui-node must always contain the following function.
     * function YourNodeNameHere(config){}
     * This function will set the needed variables with the parameters from the flow editor.
     * It also will contain any Javascript needed for your node to function.
     *
     */
    function LinearGaugeNode(config) {
        try {
             var node = this;
            if(ui === undefined) {
                ui = RED.require("node-red-dashboard")(RED);
            }
            RED.nodes.createNode(this, config);

            // placing a "debugger;" in the code will cause the code to pause its execution in the web browser
            // this allows the user to inspect the variable values and see how the code is executing
            //debugger;

            var done = null;

            if (checkConfig(node, config)) {
                var html = HTML(config);                    // *REQUIRED* get the HTML for this node using the function from above
                    done = ui.addWidget({                       // *REQUIRED* add our widget to the ui dashboard using the following configuration
                    node: node,                             // *REQUIRED*
                    order: config.order,                    // *REQUIRED* placeholder for position in page
                    group: config.group,                    // *REQUIRED*
                    width: config.width,                    // *REQUIRED*
                    height: config.height,                  // *REQUIRED*
                    format: html,                           // *REQUIRED*
                    templateScope: "local",                 // *REQUIRED*
                    emitOnlyNewValues: false,               // *REQUIRED*
                    forwardInputMessages: false,            // *REQUIRED*
                    storeFrontEndInputAsState: false,       // *REQUIRED*
                    convertBack: function (value) {
                        return value;
                    },
                    beforeEmit: function(msg, value) {
                        return { msg: msg };
                    },
                    beforeSend: function (msg, orig) {
                        if (orig) { return orig.msg; }
                    },
                    /**
                     * The initController is where most of the magic happens.
                     * This is the section where you will write the Javascript needed for your node to function.
                     * The 'msg' object will be available here.
                     */
                    initController: function($scope, events) {
                        //debugger;

                        $scope.flag = true;                                         // not sure if this is needed?
                        $scope.$watch('msg', function(msg) {

                            if (!msg) {
                                // Ignore undefined msg
                                return;
                            }

                            var payload = msg.payload;
                            var highLimit = msg.highlimit || 80;
    						var lowLimit=  msg.lowlimit || 20;
    						var setpoint =  msg.setpoint || 50;
                            var gaugeStart = 0										// this is the gauge starting position, should be left at zero
                            var gaugeEnd = 188                                      // this is the length of the gauge, if the gauge is to be longer, this value should be the sum of the heights of the scale areas

    						/**
    						 * The pointer is positioned within the scale container with the following equation.
    						 * Pointer Position = (msg.payload x Rate) + Offset
    						 * Rate = (Length Of Gauge - 0) / ((msg.lowlimit - delta) - (msg.highlimt + delta)
    						 * Offset = 0 - (msg.highlimit + delta) x Rate)
    						 * This equation will scale the msg.payload value into the gauge's length linearly.
    						 */

                            var highDiff = highLimit - setpoint							//find difference between setpoint and the high limit
    						var lowDiff = setpoint - lowLimit 							//find difference between setpoint and the low limit

    						/**
    						 * In order to span the the high and low areas of the gauge, we need to first calculate
    						 * how much area to allow above and below the high and low limits.
    						 * The high limit starts where the middle area meets the top area.
    						 * The low limit starts where the middle area meets the bottom area.
    						 * 	    __
    						 *     |  | <- Gauge Start
    						 * 	   |  |
    						 *     |__| <- High limit begins at this horizontal line
    						 *     |  | <-|
    						 *     |  |   |  Allowable
    						 *     |  |   |    Range
    						 *     |  | <-|
    						 *     |__| <- Low limit begins at this horizontal line
    						 *     |  |
    						 *     |  |
    						 *     |__| <- Gauge End
    						 *
    						 * Without some extra room at either end, the pointer would peg out at
    						 * either end if the payload >= highLimit or if payload <= lowLimit.
    						 * Adding some cushion on either end of the gauge allows the user to visually
    						 * see how far above or below the setpoint range the payload is.
    						 */

                            var delta = ( ( highDiff + lowDiff ) / 2 )   					//calculate the mean to allow the same span above/below setpoint area
                            var lowSpan = lowLimit - delta   								//calculated low area span
                            var highSpan = highLimit + delta   								//calulated high area span
                            var rate = ( gaugeEnd - gaugeStart ) / ( lowSpan - highSpan )
                            var offset = gaugeStart - ( highSpan * rate )
    						var value = ( payload * rate ) + offset							//final scaled value should be between the value of gaugeStart and gaugeEnd

    						/**
    						 * In order to reference an element within the HTML of the node, we must make a call
    						 * to the $scope to get the $id of the element we want to interact with.
    						 * We do this by calling
    						 *  $scope.$eval('$id')
    						 * This will return the unique identifier as a number to which is associated with
    						 * this particular node.
    						 * In order to interact with an element, we must also declare an object to reference
    						 * the element.
    						 * This is done by accessing the DOM via Javascript
    						 * 	document.getElementById("elementId_"+$scope.$eval('$id))
    						 * Note that in order for this to work, you must have also entered the element id
    						 * in the HTML. For example.
    						 * 	<div id="elementId_{{$id}}">
    						 * This is an Angular expression that will inject a unique ID number where ever you place {{$id}}.
    						 * During creation of the ui node on the dashboard, only one ID number will be used during the
    						 * time of creation.
    						 */

    						var ptr = document.getElementById("lgPtr_"+$scope.$eval('$id')) 					//get the pointer object

    						$(ptr).animate(																		//animate the pointer
                                {'ptrVal':value},																//get the final scaled value
                                {
                                    step: function(ptrVal){
                                        $(this).attr('transform', 'translate(10,'+ptrVal+') rotate(90)');		//update the transform attribute with the new final scaled value
                                    },
                                    duration: 333 																//sets the duration of the sliding animation of the pointer
                                }
                            );
    						var tt = document.getElementById("lgtooltip_"+$scope.$eval('$id')) 					//get the tooltip object
    						$(tt).html("Hi : "+highLimit+"&#013;Set: "+setpoint+"&#013;Lo : "+lowLimit);			//set the tooltip to include the high/low/setpoint
                        });
                    }
                });
            }
        }
        catch (e) {
            console.log(e);		// catch any errors that may occur and display them in the web browsers console
		}

		/**
		 * REQUIRED
		 * I'm not sure what this does, but it is needed.
		 */
        node.on("close", function() {
            if (done) { done(); }
        });
    }

	/**
	 *  REQUIRED
	 * Registers the node with a name, and a configuration.
     * Type MUST start with ui_
	 */
    RED.nodes.registerType("ui_lineargauge", LinearGaugeNode);
};

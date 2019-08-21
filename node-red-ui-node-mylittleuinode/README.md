node-red-ui-node-mylittleuinode
===============================

A Node-Red dashboard ui node to help you create your own ui node.

The intention of this node is to show the user the how/where/what of creating a custom ui node.
All of the code in the `.html` and `.js` files are commented extensively and places the key sections of code into blocks to be edited.

## Install
This node is not really intended to be insalled and used as-is - it is meant to be a teaching example for
developers to use to create their own UI widgets.

Either use the Editor - Menu - Manage Palette - Install option, or run the following command in your Node-RED user directory (typically `~/.node-red`) after installing Node-RED-dashboard.

    npm i node-red-ui-node-mylittleuinode

## Inputs
Send `msg.payload` to this node to change the text displayed in the textbox.

## Outputs
Node will send the textbox value as `msg.payload` when the textbox has focus, and the user presses the `Enter` key.


## Requirements
Node-Red v19.4 or greater
Node-Red-dashboard v2.13.0 or greater

## Example
```json
[{"id":"865215e4.a45508","type":"ui_my-little-ui-node","z":"a95b9b.0bfb7468","group":"eec59831.7f2e18","order":0,"width":0,"height":0,"name":"","textLabel":"My Little UI Node","textColor":"#000000","x":3410,"y":380,"wires":[["f9941dcd.0a9cf"]]},{"id":"d3d5d6de.eb37c8","type":"inject","z":"a95b9b.0bfb7468","name":"","topic":"","payload":"","payloadType":"date","repeat":"","crontab":"","once":false,"onceDelay":0.1,"x":3210,"y":380,"wires":[["865215e4.a45508"]]},{"id":"f9941dcd.0a9cf","type":"debug","z":"a95b9b.0bfb7468","name":"","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"false","x":3620,"y":380,"wires":[]},{"id":"eec59831.7f2e18","type":"ui_group","z":"","name":"Test","tab":"6522c70.1515a38","disp":true,"width":"6","collapse":false},{"id":"6522c70.1515a38","type":"ui_tab","z":"","name":"Sandbox","icon":"dashboard","disabled":false,"hidden":false}]
```

## Contributors
Thank you Bart!
https://github.com/bartbutenaers

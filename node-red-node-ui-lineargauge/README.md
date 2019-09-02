node-red-node-ui-lineargauge
============================

A Node-RED ui node that creates a linear gauge with high/low limits and animated sliding pointer.

This is very useful for quickly checking many different kinds of processes and how they are performing.
Ideally, the pointer should be in the center of the gauge. This would indicate that the process is at it's setpoint.

This gauge has three different zones. The one in the center is your acceptable value window. The top is the high limit zone and the bottom is the low limit zone. This way you can easily see how close the process is to it's high or low limit.

The node can be injected with:
High Limit: `msg.highlimit`
Setpoint: `msg.setpoint`
Low Limit: `msg.lowlimit`

Using `msg.payload` as the value to display and position the pointer.

![LinearGaugeImg](https://raw.githubusercontent.com/node-red/node-red-ui-nodes/master/node-red-node-ui-lineargauge/imgs/linearGauges.PNG)

## Requirements
Node-RED v19.4 or greater
Node-RED-Dashboard v2.13.0 or greater

## Install
Either use the Editor - Menu - Manage Palette - Install option, or run the following command in your Node-RED user directory (typically `~/.node-red`) after installing Node-RED-dashboard.

    npm i node-red-node-ui-lineargauge


# Example

```
[{"id":"52763e99.4178d","type":"random","z":"f311dd02.c08dc","name":"","low":"20","high":"45","inte":"true","property":"payload","x":510,"y":270,"wires":[["1a890699.82ed59"]]},{"id":"12f74118.253d4f","type":"inject","z":"f311dd02.c08dc","name":"","topic":"","payload":"","payloadType":"date","repeat":"1","crontab":"","once":true,"onceDelay":0.1,"x":288,"y":391,"wires":[["52763e99.4178d","c85f4550.e58f68","3aef3f43.1d6f2","24015dc7.9d9f62","a346e6a4.e12db8","bc11b34e.fa01d"]]},{"id":"1a890699.82ed59","type":"change","z":"f311dd02.c08dc","name":"","rules":[{"t":"set","p":"highlimit","pt":"msg","to":"100","tot":"num"},{"t":"set","p":"lowlimit","pt":"msg","to":"0","tot":"num"},{"t":"set","p":"setpoint","pt":"msg","to":"50","tot":"str"}],"action":"","property":"","from":"","to":"","reg":false,"x":680,"y":270,"wires":[["cc4e847b.78dc08"]]},{"id":"a4890db1.91799","type":"change","z":"f311dd02.c08dc","name":"","rules":[{"t":"set","p":"highlimit","pt":"msg","to":"100","tot":"num"},{"t":"set","p":"lowlimit","pt":"msg","to":"0","tot":"num"},{"t":"set","p":"setpoint","pt":"msg","to":"50","tot":"str"}],"action":"","property":"","from":"","to":"","reg":false,"x":680,"y":310,"wires":[["e806e987.c22f78"]]},{"id":"c85f4550.e58f68","type":"random","z":"f311dd02.c08dc","name":"","low":"20","high":"45","inte":"true","property":"payload","x":510,"y":310,"wires":[["a4890db1.91799"]]},{"id":"b2ce3551.d0ae58","type":"change","z":"f311dd02.c08dc","name":"","rules":[{"t":"set","p":"highlimit","pt":"msg","to":"100","tot":"num"},{"t":"set","p":"lowlimit","pt":"msg","to":"0","tot":"num"},{"t":"set","p":"setpoint","pt":"msg","to":"50","tot":"str"}],"action":"","property":"","from":"","to":"","reg":false,"x":680,"y":350,"wires":[["32ee2426.7b84ac"]]},{"id":"3aef3f43.1d6f2","type":"random","z":"f311dd02.c08dc","name":"","low":"20","high":"45","inte":"true","property":"payload","x":510,"y":350,"wires":[["b2ce3551.d0ae58"]]},{"id":"24015dc7.9d9f62","type":"random","z":"f311dd02.c08dc","name":"","low":"20","high":"45","inte":"true","property":"payload","x":510,"y":390,"wires":[["d4911cc7.19381"]]},{"id":"d4911cc7.19381","type":"change","z":"f311dd02.c08dc","name":"","rules":[{"t":"set","p":"highlimit","pt":"msg","to":"100","tot":"num"},{"t":"set","p":"lowlimit","pt":"msg","to":"0","tot":"num"},{"t":"set","p":"setpoint","pt":"msg","to":"50","tot":"str"}],"action":"","property":"","from":"","to":"","reg":false,"x":680,"y":390,"wires":[["85b4877f.619b38"]]},{"id":"6123b7f7.41b678","type":"change","z":"f311dd02.c08dc","name":"","rules":[{"t":"set","p":"highlimit","pt":"msg","to":"100","tot":"num"},{"t":"set","p":"lowlimit","pt":"msg","to":"0","tot":"num"},{"t":"set","p":"setpoint","pt":"msg","to":"50","tot":"str"}],"action":"","property":"","from":"","to":"","reg":false,"x":680,"y":430,"wires":[["aaeccbb1.73cf78"]]},{"id":"a346e6a4.e12db8","type":"random","z":"f311dd02.c08dc","name":"","low":"20","high":"45","inte":"true","property":"payload","x":510,"y":430,"wires":[["6123b7f7.41b678"]]},{"id":"2a509c8e.d63144","type":"change","z":"f311dd02.c08dc","name":"","rules":[{"t":"set","p":"highlimit","pt":"msg","to":"100","tot":"num"},{"t":"set","p":"lowlimit","pt":"msg","to":"0","tot":"num"},{"t":"set","p":"setpoint","pt":"msg","to":"50","tot":"str"}],"action":"","property":"","from":"","to":"","reg":false,"x":680,"y":470,"wires":[["6d52deb5.e447e"]]},{"id":"bc11b34e.fa01d","type":"random","z":"f311dd02.c08dc","name":"","low":"20","high":"45","inte":"true","property":"payload","x":510,"y":470,"wires":[["2a509c8e.d63144"]]},{"id":"cc4e847b.78dc08","type":"ui_lineargauge","z":"f311dd02.c08dc","group":"5705b53f.d3e0bc","order":0,"width":"2","height":"5","name":"Tank #2","colorLowArea":"#ffffc0","colorMidArea":"#99ff99","colorHighArea":"#ff8080","unit":"°","x":880,"y":270,"wires":[[]]},{"id":"e806e987.c22f78","type":"ui_lineargauge","z":"f311dd02.c08dc","group":"5705b53f.d3e0bc","order":1,"width":"2","height":"5","name":"Tank #3","colorLowArea":"#ffffc0","colorMidArea":"#99ff99","colorHighArea":"#ff8080","unit":"°","x":880,"y":310,"wires":[[]]},{"id":"32ee2426.7b84ac","type":"ui_lineargauge","z":"f311dd02.c08dc","group":"5705b53f.d3e0bc","order":2,"width":"2","height":"5","name":"Tank #4","colorLowArea":"#ffffc0","colorMidArea":"#99ff99","colorHighArea":"#ff8080","unit":"°","x":880,"y":350,"wires":[[]]},{"id":"85b4877f.619b38","type":"ui_lineargauge","z":"f311dd02.c08dc","group":"5705b53f.d3e0bc","order":3,"width":"2","height":"5","name":"Tank #5","colorLowArea":"#ffffc0","colorMidArea":"#99ff99","colorHighArea":"#ff8080","unit":"°","x":880,"y":390,"wires":[[]]},{"id":"aaeccbb1.73cf78","type":"ui_lineargauge","z":"f311dd02.c08dc","group":"5705b53f.d3e0bc","order":4,"width":"2","height":"5","name":"Tank #6","colorLowArea":"#ffffc0","colorMidArea":"#99ff99","colorHighArea":"#ff8080","unit":"°","x":880,"y":430,"wires":[[]]},{"id":"6d52deb5.e447e","type":"ui_lineargauge","z":"f311dd02.c08dc","group":"5705b53f.d3e0bc","order":5,"width":"2","height":"5","name":"Tank #7","colorLowArea":"#ffffc0","colorMidArea":"#99ff99","colorHighArea":"#ff8080","unit":"°","x":880,"y":470,"wires":[[]]},{"id":"5705b53f.d3e0bc","type":"ui_group","z":"","name":"Linear Gauges","tab":"64fe41f2.fdbe3","disp":true,"width":"12","collapse":false},{"id":"64fe41f2.fdbe3","type":"ui_tab","z":"","name":"Home","icon":"dashboard"}]
```

## Contributors
Thank you Bart for turning this into a working node-red node.
https://github.com/bartbutenaers

# node-red-contrib-ui-lineargauge
A Node-Red ui node that creates a linear gauge with high/low limits and animated sliding pointer.

This is very useful for quickly checking many different kinds of processes and how they are performing.
Ideally, the pointer should be in the center of the gauge. This would indicate that the process is at it's setpoint.

This gauge has three different zones. One in the center is your acceptable value window. The top is the high limit zone and the bottom is the low limit zone. This way you can easily see how close the process is to it's high or low limit.

The node can be injected with:
High Limit: `msg.highlimit`
Setpoint: `msg.setpoint`
Low Limit: `msg.lowlimit`

Using `msg.payload` as the value to display and position the pointer.

![LinearGaugeImg](https://github.com/seth350/node-red-contrib-ui-lineargauge/blob/master/linearGauges.PNG?raw=true)

# Requirements
Node-Red v19.4 or greater
Node-Red-dashboard v2.13.0 or greater

# Install
<p>Run the following command in your Node-RED user directory - typically <code>~/.node-red</code></p>
<pre>
<code>
    npm i node-red-contrib-ui-lineargauge
</code>
</pre>

# Example
<pre>
<code>
[{"id":"aa4a0304.04105","type":"tab","label":"Flow 1","disabled":false,"info":""},{"id":"b2013812.ab6398","type":"random","z":"aa4a0304.04105","name":"","low":"20","high":"45","inte":"true","property":"payload","x":506,"y":287,"wires":[["d0a03537.0e7ab8"]]},{"id":"a23cb944.a1a308","type":"inject","z":"aa4a0304.04105","name":"","topic":"","payload":"","payloadType":"date","repeat":"1","crontab":"","once":true,"onceDelay":0.1,"x":288,"y":391,"wires":[["b2013812.ab6398","b7652c59.847ad","158fbf06.93ce51","7e9a5d4e.d34b44","a32bbccb.66fb5","da938b76.73b4c8"]]},{"id":"e082d1b8.5d663","type":"linear-gauge","z":"aa4a0304.04105","group":"8b6fa991.18ccd8","order":0,"width":"1","height":"5","name":" Tank #2","colorLowArea":"#ffffc0","colorMidArea":"#99ff99","colorHighArea":"#ff8080","unit":"°","x":842,"y":286,"wires":[[]]},{"id":"d0a03537.0e7ab8","type":"change","z":"aa4a0304.04105","name":"","rules":[{"t":"set","p":"highlimit","pt":"msg","to":"100","tot":"num"},{"t":"set","p":"lowlimit","pt":"msg","to":"0","tot":"num"},{"t":"set","p":"setpoint","pt":"msg","to":"50","tot":"str"}],"action":"","property":"","from":"","to":"","reg":false,"x":680,"y":287,"wires":[["e082d1b8.5d663"]]},{"id":"78ce759c.c7957c","type":"linear-gauge","z":"aa4a0304.04105","group":"8b6fa991.18ccd8","order":0,"width":"1","height":"5","name":"Tank #3","colorLowArea":"#e6d7e8","colorMidArea":"#8000ff","colorHighArea":"#ff80ff","unit":"°","x":842,"y":330,"wires":[[]]},{"id":"e336e407.b2de58","type":"change","z":"aa4a0304.04105","name":"","rules":[{"t":"set","p":"highlimit","pt":"msg","to":"100","tot":"num"},{"t":"set","p":"lowlimit","pt":"msg","to":"0","tot":"num"},{"t":"set","p":"setpoint","pt":"msg","to":"50","tot":"str"}],"action":"","property":"","from":"","to":"","reg":false,"x":679,"y":330,"wires":[["78ce759c.c7957c"]]},{"id":"b7652c59.847ad","type":"random","z":"aa4a0304.04105","name":"","low":"20","high":"45","inte":"true","property":"payload","x":507,"y":330,"wires":[["e336e407.b2de58"]]},{"id":"8395fca1.0f666","type":"linear-gauge","z":"aa4a0304.04105","group":"8b6fa991.18ccd8","order":0,"width":"1","height":"5","name":"Tank #4","colorLowArea":"#80ffff","colorMidArea":"#ff8000","colorHighArea":"#ff00ff","unit":"°","x":843,"y":372,"wires":[[]]},{"id":"14cea708.cebda9","type":"change","z":"aa4a0304.04105","name":"","rules":[{"t":"set","p":"highlimit","pt":"msg","to":"100","tot":"num"},{"t":"set","p":"lowlimit","pt":"msg","to":"0","tot":"num"},{"t":"set","p":"setpoint","pt":"msg","to":"50","tot":"str"}],"action":"","property":"","from":"","to":"","reg":false,"x":681,"y":373,"wires":[["8395fca1.0f666"]]},{"id":"158fbf06.93ce51","type":"random","z":"aa4a0304.04105","name":"","low":"20","high":"45","inte":"true","property":"payload","x":509,"y":374,"wires":[["14cea708.cebda9"]]},{"id":"7e9a5d4e.d34b44","type":"random","z":"aa4a0304.04105","name":"","low":"20","high":"45","inte":"true","property":"payload","x":509,"y":413,"wires":[["6f99e65c.d07868"]]},{"id":"3f2392eb.ba84ee","type":"linear-gauge","z":"aa4a0304.04105","group":"8b6fa991.18ccd8","order":0,"width":"1","height":"5","name":" Tank #5","colorLowArea":"#c0c0c0","colorMidArea":"#99ff99","colorHighArea":"#808080","unit":"°","x":845,"y":412,"wires":[[]]},{"id":"6f99e65c.d07868","type":"change","z":"aa4a0304.04105","name":"","rules":[{"t":"set","p":"highlimit","pt":"msg","to":"100","tot":"num"},{"t":"set","p":"lowlimit","pt":"msg","to":"0","tot":"num"},{"t":"set","p":"setpoint","pt":"msg","to":"50","tot":"str"}],"action":"","property":"","from":"","to":"","reg":false,"x":683,"y":413,"wires":[["3f2392eb.ba84ee"]]},{"id":"f551014b.e16a7","type":"linear-gauge","z":"aa4a0304.04105","group":"8b6fa991.18ccd8","order":0,"width":"1","height":"5","name":"Tank #6","colorLowArea":"#c0c0c0","colorMidArea":"#ffff00","colorHighArea":"#c0c0c0","unit":"°","x":845,"y":456,"wires":[[]]},{"id":"33ffcd53.3ace62","type":"change","z":"aa4a0304.04105","name":"","rules":[{"t":"set","p":"highlimit","pt":"msg","to":"100","tot":"num"},{"t":"set","p":"lowlimit","pt":"msg","to":"0","tot":"num"},{"t":"set","p":"setpoint","pt":"msg","to":"50","tot":"str"}],"action":"","property":"","from":"","to":"","reg":false,"x":682,"y":456,"wires":[["f551014b.e16a7"]]},{"id":"a32bbccb.66fb5","type":"random","z":"aa4a0304.04105","name":"","low":"20","high":"45","inte":"true","property":"payload","x":510,"y":456,"wires":[["33ffcd53.3ace62"]]},{"id":"8d110c3b.fd5ab","type":"linear-gauge","z":"aa4a0304.04105","group":"8b6fa991.18ccd8","order":0,"width":"1","height":"5","name":"Tank #7","colorLowArea":"#00ff00","colorMidArea":"#ff8080","colorHighArea":"#00ff00","unit":"°","x":846,"y":498,"wires":[[]]},{"id":"eca59385.51c3","type":"change","z":"aa4a0304.04105","name":"","rules":[{"t":"set","p":"highlimit","pt":"msg","to":"100","tot":"num"},{"t":"set","p":"lowlimit","pt":"msg","to":"0","tot":"num"},{"t":"set","p":"setpoint","pt":"msg","to":"50","tot":"str"}],"action":"","property":"","from":"","to":"","reg":false,"x":684,"y":499,"wires":[["8d110c3b.fd5ab"]]},{"id":"da938b76.73b4c8","type":"random","z":"aa4a0304.04105","name":"","low":"20","high":"45","inte":"true","property":"payload","x":512,"y":500,"wires":[["eca59385.51c3"]]},{"id":"8b6fa991.18ccd8","type":"ui_group","z":"","name":"Linear Gauges","tab":"c067cc3b.a45ea","disp":true,"width":"6","collapse":false},{"id":"c067cc3b.a45ea","type":"ui_tab","z":"","name":"Home","icon":"dashboard"}]
</code>
</pre>

# Contributors
Thank you Bart for turning this into a working node-red node. 
https://github.com/bartbutenaers

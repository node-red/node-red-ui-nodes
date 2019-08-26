node-red-node-ui-vega
=====================

Node-RED Dashboard widget node for declarative data visualization using [Vega visualization grammar](https://vega.github.io/vega/).

![Vega Node Examples](https://raw.githubusercontent.com/node-red/node-red-ui-nodes/master/node-red-node-ui-vega/figs/vega-example.png)

Install
-------

Run the following command in your Node-RED user directory - typically `~/.node-red`

        npm install node-red-node-ui-vega

**Note**: This node uses APIs that require at least Node-RED 0.19 and Node-RED Dashboard 2.10.

Usage
-----

Vega is a visualization grammar and framework for visualizing data
developed by University of Washington Interactive Data Lab.
`ui_vega` node accepts [Vega](https://vega.github.io/vega/) and [Vega-Lite](https://vega.github.io/vega-lite/) data visualization specification in JSON format.

Vega/Vega-Lite specification in JSON format can be specified on node settings menu or `payload` property of input message.  If both parameters are set, `payload` property takes precedence.


Example
-------

You can find some examples of Vega node from Node-RED editor menu:

**Import > Examples > ui vega** 

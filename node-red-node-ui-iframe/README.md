node-red-node-ui-iframe
=======================

A Node-RED widget node for embedding a Web page.

![Example](https://raw.githubusercontent.com/node-red/node-red-ui-nodes/master/node-red-node-ui-iframe/figs/sample00.png)

Install
-------

Either use the Menu - Manage Palette option to install the node, or
run the following command in your Node-RED user directory - typically `~/.node-red`

        npm i node-red-node-ui-iframe

**Note**: This node uses APIs that require at least Node-RED 0.19 and Node-RED Dashboard 2.10.

Usage
-----

The `ui-iframe` node is a UI widget that can be used to embed an external Web page in a Node-RED dashboard.

The URL of a web page to embed can be specified in the settings menu or by the `url` property of an input message.

The `payload` property of the input message specifies data to send to the embedded page using the Web messaging API (postMessage). This allows commands to be sent to the embedded page. If data from the embedded web page is received via the Web messaging API, it is output as the `payload` value the of the outgoing message.

Example
-------

See examples under Node-RED editor menu of *Import/Examples/node-red-node-ui-iframe*.

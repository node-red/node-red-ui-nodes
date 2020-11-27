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

`ui-iframe` node is a UI widget that can be used to embed an external
Web page in a Node-RED dashboard.

The URL of embedded Web page can be specified by URL item of settings
menu or `url` property of an input message.

`payload` property of input message specifies a data sent to the
embedded page using Web messaging API.  If a data from the embedded
Web page is received via Web messaging API, it is outputted as
`payload` value  of outgoing message.

Example
-------

See examples under Node-RED editor menu of *Import/Examples/node-red-node-ui-iframe*.

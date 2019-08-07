node-red-ui-node-table
=====================

A Node-RED widget node which shows table.

![screenshot](screenshot.png)

Install
-------

Run the following command in your Node-RED user directory (typically `~/.node-red`) after installing Node-RED dashboard.

        npm install node-red-ui-node-table

Usage
-----

This table node supports array which contains row data as input data.
Each row object data should have the same set of keys because keys in an object are used as the column name.


Example data 
------------
```
[
    {
        "Name": "Kazuhito Yokoi",
        "Age": "35",
        "Favourite Color": "red",
        "Date Of Birth": "12/09/1983"
    },
    {
        "Name": "Oli Bob",
        "Age": "12",
        "Favourite Color": "red",
        "Date Of Birth": "12/08/2017"
    }
]
```

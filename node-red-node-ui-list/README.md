node-red-node-ui-list
=====================

A Node-RED widget node for showing a list of items.

![Example](https://raw.githubusercontent.com/node-red/node-red-ui-nodes/master/node-red-node-ui-list/figs/sample00.png)

Install
-------

Either use the Menu - Manage Palette option to install the node, or run the following command
in your Node-RED user directory - typically `~/.node-red`

        npm i node-red-node-ui-list

**Note**: This node uses APIs that require at least Node-RED 0.19 and Node-RED Dashboard 2.10.

Usage
-----

`ui-list` node is a UI widget that can be used to display a list of items in the Node-RED dashboard.

An array of Items is passed in by `msg.payload`.  It consists of objects containing the following properties.

- `title` - title of the item,
- `description` - description of the item. optional if line type is `Single-line ` or action type is `menu`,
- `icon` - URL of icon (optional),
- `icon_name` - Font Awesome 4.7 icon name (optional),
- `icon_unicode` - text to use as icon - useful for unicode symbols like flags, etc (optional).
- `menu` - list of menu items (optional).

If you just need a simple text list then `msg.payload` can be a simple array of strings, e.g. `["Item1","Item2","Item3"]`

The type of item display can be selected by `List Type` selector in the node configuration panel.

An action to be taken for a displayed item can be selected by the `Action` selector:

- `none` - No action is performed,
- `click to send an item` - sends the selected item to output port if clicked,
- `checkbox to send changed item` - sends an item to output port if checkbox is changed.  The checkbox state is included in the `isChecked` flag of the output `payload` object,
- `switch to send changed item` - sends an item to output port if switch is changed.  The switch state is included in the `isChecked` flag of the output `payload` object,
- `menu to send selected item` - sends an item to output port is item in menu is selected.  The selected item is included in the `selected` property of the output payload object.

If `Allow HTML in displayed text` checkbox is selected, HTML tags can be used in `title` and `description`.

Icon can be specified by `icon` or `icon_name` property.  `icon` specifies URL of icon image.  If `icon` is `null`, blank icon is displayed. `icon_name` specifies an icon name of Font Awesome 4.7 icons (e.g. `fa-home`). 
`icon_unicode` specifies text character to use as an icon, useful for displaying unicode symbols like flags, etc.
`icon` has precedence over `icon_name` and `icon_unicode`.

Example
-------

```json
[
    {
        "id": "ee47c5e8.e17bd",
        "type": "tab",
        "label": "Example of ui-list",
        "disabled": false,
        "info": ""
    },
    {
        "id": "93612884.34d35",
        "type": "ui_list",
        "z": "ee47c5e8.e17bd",
        "group": "7e4c65d6.0419cc",
        "name": "",
        "order": 1,
        "width": "6",
        "height": "5",
        "lineType": "three",
        "actionType": "click",
        "allowHTML": true,
        "x": 290,
        "y": 100,
        "wires": [
            [
                "cd592928.56da38"
            ]
        ]
    },
    {
        "id": "ccf3e49f.190be",
        "type": "inject",
        "z": "ee47c5e8.e17bd",
        "name": "Fruits",
        "topic": "",
        "payload": "[{\"title\":\"<b>Apple</b>\",\"description\":\"This is description of <font color=\\\"red\\\"><b>Apple</b></b>.\",\"icon\":\"https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Red_Apple.jpg/500px-Red_Apple.jpg\"},{\"title\":\"<b>Banana</b>\",\"description\":\"This is description of <font color=\\\"yellow\\\"><b>Banana</b></font>(no picture).\",\"icon\":null},{\"title\":\"<b>Orange</b>\",\"description\":\"This is description of <font color=\\\"orange\\\"><b>Orange</b></font>.\",\"icon\":\"https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Ambersweet_oranges.jpg/440px-Ambersweet_oranges.jpg\"},{\"title\":\"<b>Watermelon</b>\",\"description\":\"This is description of <font color=\\\"green\\\"><b>Watermelon</b></font>.\",\"icon\":\"https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Vampire_watermelon.jpg/440px-Vampire_watermelon.jpg\"}]",
        "payloadType": "json",
        "repeat": "",
        "crontab": "",
        "once": false,
        "onceDelay": 0.1,
        "x": 110,
        "y": 100,
        "wires": [
            [
                "93612884.34d35"
            ]
        ]
    },
    {
        "id": "cd592928.56da38",
        "type": "debug",
        "z": "ee47c5e8.e17bd",
        "name": "",
        "active": true,
        "tosidebar": true,
        "console": false,
        "tostatus": false,
        "complete": "false",
        "x": 450,
        "y": 100,
        "wires": []
    },
    {
        "id": "503b6c22.32a6fc",
        "type": "inject",
        "z": "ee47c5e8.e17bd",
        "name": "WiFi",
        "topic": "",
        "payload": "[{\"title\":\"No WiFi Signal\",\"description\":\"Lost network connection\",\"icon_name\":\"signal_wifi_0_bar\"},{\"title\":\"Weak WiFi Signal\",\"description\":\"May lose network connection\",\"icon_name\":\"signal_wifi_2_bar\"},{\"title\":\"Strong WiFi Signal\",\"description\":\"Connected to network\",\"icon_name\":\"signal_wifi_4_bar\"}]",
        "payloadType": "json",
        "repeat": "",
        "crontab": "",
        "once": false,
        "onceDelay": 0.1,
        "x": 110,
        "y": 180,
        "wires": [
            [
                "4783aeef.e2332"
            ]
        ]
    },
    {
        "id": "f46b267.9f03558",
        "type": "ui_list",
        "z": "ee47c5e8.e17bd",
        "group": "7e4c65d6.0419cc",
        "name": "",
        "order": 3,
        "width": "4",
        "height": "7",
        "lineType": "one",
        "actionType": "check",
        "allowHTML": false,
        "x": 290,
        "y": 260,
        "wires": [
            [
                "ea6d6cbc.9770a8"
            ]
        ]
    },
    {
        "id": "ceb5f753.ed31a8",
        "type": "inject",
        "z": "ee47c5e8.e17bd",
        "name": "Day of Week",
        "topic": "",
        "payload": "[{\"title\":\"Sunday\",\"isChecked\":true},{\"title\":\"Monday\"},{\"title\":\"Tuesday\"},{\"title\":\"Wednesday\"},{\"title\":\"Thursday\"},{\"title\":\"Friday\"},{\"title\":\"Saturday\",\"isChecked\":true}]",
        "payloadType": "json",
        "repeat": "",
        "crontab": "",
        "once": false,
        "onceDelay": 0.1,
        "x": 130,
        "y": 260,
        "wires": [
            [
                "f46b267.9f03558"
            ]
        ]
    },
    {
        "id": "ea6d6cbc.9770a8",
        "type": "debug",
        "z": "ee47c5e8.e17bd",
        "name": "",
        "active": true,
        "tosidebar": true,
        "console": false,
        "tostatus": false,
        "complete": "false",
        "x": 450,
        "y": 260,
        "wires": []
    },
    {
        "id": "4783aeef.e2332",
        "type": "ui_list",
        "z": "ee47c5e8.e17bd",
        "group": "7e4c65d6.0419cc",
        "name": "",
        "order": 2,
        "width": "6",
        "height": "5",
        "lineType": "two",
        "actionType": "none",
        "allowHTML": true,
        "x": 290,
        "y": 180,
        "wires": [
            [
                "c75bdf1a.71a15"
            ]
        ]
    },
    {
        "id": "c75bdf1a.71a15",
        "type": "debug",
        "z": "ee47c5e8.e17bd",
        "name": "",
        "active": true,
        "tosidebar": true,
        "console": false,
        "tostatus": false,
        "complete": "false",
        "x": 450,
        "y": 180,
        "wires": []
    },
    {
        "id": "b3639cb1.702ff",
        "type": "ui_list",
        "z": "ee47c5e8.e17bd",
        "group": "7e4c65d6.0419cc",
        "name": "",
        "order": 3,
        "width": "4",
        "height": "4",
        "lineType": "one",
        "actionType": "switch",
        "allowHTML": false,
        "x": 290,
        "y": 340,
        "wires": [
            [
                "b7d652df.067b4"
            ]
        ]
    },
    {
        "id": "640d11fe.215c28",
        "type": "inject",
        "z": "ee47c5e8.e17bd",
        "name": "Drink",
        "topic": "",
        "payload": "[{\"title\":\"Coffee\",\"isChecked\":true},{\"title\":\"Tea\",\"isChecked\":false},{\"title\":\"Green Tea\",\"isChecked\":true}]",
        "payloadType": "json",
        "repeat": "",
        "crontab": "",
        "once": false,
        "onceDelay": 0.1,
        "x": 110,
        "y": 340,
        "wires": [
            [
                "b3639cb1.702ff"
            ]
        ]
    },
    {
        "id": "b7d652df.067b4",
        "type": "debug",
        "z": "ee47c5e8.e17bd",
        "name": "",
        "active": true,
        "tosidebar": true,
        "console": false,
        "tostatus": false,
        "complete": "false",
        "x": 450,
        "y": 340,
        "wires": []
    },
    {
        "id": "f577f7cb.d19068",
        "type": "ui_list",
        "z": "ee47c5e8.e17bd",
        "group": "7e4c65d6.0419cc",
        "name": "",
        "order": 3,
        "width": "6",
        "height": "2",
        "lineType": "one",
        "actionType": "menu",
        "allowHTML": false,
        "x": 290,
        "y": 420,
        "wires": [
            [
                "ad3b8b.58131c78"
            ]
        ]
    },
    {
        "id": "f0859d08.93b8a8",
        "type": "inject",
        "z": "ee47c5e8.e17bd",
        "name": "Move",
        "topic": "",
        "payload": "[{\"title\":\"Direction\",\"menu\":[\"East\",\"West\",\"South\",\"North\"]},{\"title\":\"Speed\",\"menu\":[\"High\",\"Middle\",\"Low\"]}]",
        "payloadType": "json",
        "repeat": "",
        "crontab": "",
        "once": false,
        "onceDelay": 0.1,
        "x": 110,
        "y": 420,
        "wires": [
            [
                "f577f7cb.d19068"
            ]
        ]
    },
    {
        "id": "ad3b8b.58131c78",
        "type": "debug",
        "z": "ee47c5e8.e17bd",
        "name": "",
        "active": true,
        "tosidebar": true,
        "console": false,
        "tostatus": false,
        "complete": "false",
        "x": 450,
        "y": 420,
        "wires": []
    },
    {
        "id": "7e4c65d6.0419cc",
        "type": "ui_group",
        "z": "",
        "name": "Default",
        "tab": "2f52ec48.3a82cc",
        "disp": true,
        "width": "12",
        "collapse": false
    },
    {
        "id": "2f52ec48.3a82cc",
        "type": "ui_tab",
        "z": "",
        "name": "List",
        "icon": "dashboard"
    }
]
```

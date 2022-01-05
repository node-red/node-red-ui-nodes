node-red-node-ui-webcam
=======================

A Node-RED UI widget node that allows images to be captured from the dashboard.

## Install

Either use the Editor - Menu - Manage Palette - Install option, or run the following command in your Node-RED user directory (typically `~/.node-red`) after installing node-red-dashboard:

        npm i node-red-node-ui-webcam

## Usage

The node provides UI widget that will display a live image from the web camera
on the device running the dashboard.

The user can click a button to capture an image which is then sent by the node
as a Buffer object contain the image in png or jpeg format.

If a message is passed to the `ui_webcam` node with the `capture` property set,
and if the webcam has been activated on the dashboard, it will capture an image
without the user having to click on the button.

The user can select the default camera to use in the on-screen widget dropdown.
This will be used for future sessions with that browser until changed.

## Browser Support

This node will work in all modern browsers, but not IE.

If you are accessing the dashboard remotely (not via `localhost`), then you must
use HTTPS otherwise the browser will block access to the webcam.

## Privacy

Before the webcam can be activated, the browser will ask the user's permission for
the page to access the device. The node cannot capture images until the user
has given their permission.

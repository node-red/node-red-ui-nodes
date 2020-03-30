node-red-node-ui-microphone
============================

A Node-RED UI widget node that allows audio to be recorded from the dashboard.

## Install

Either use the Editor - Menu - Manage Palette - Install option, or run the following command in your Node-RED user directory (typically `~/.node-red`) after installing node-red-dashboard:

        npm i node-red-node-ui-microphone

## Usage

The node provides a single button that, when clicked, will begin to capture audio.

This node provides a single button widget in the dashboard that, when pressed,
will begin to capture audio. It will continue to capture audio until the button
is pressed again, or it reaches its configured maximum duration.

The audio is captured in WAV format and published by the node as a Buffer object.
This can be written straight to a file or passed to any other node that expects
audio data.

## Privacy

When the button is first pressed, the browser will ask the user's permission for
the page to access the microphone. The node cannot record audio until the user
has given their permission.


## Notices

This node uses `recorderWorker.js` Copyright © 2013 Matt Diamond, under the MIT License

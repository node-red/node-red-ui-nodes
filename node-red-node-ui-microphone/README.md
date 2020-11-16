node-red-node-ui-microphone
============================

A Node-RED UI widget node that allows audio to be recorded from the dashboard.

## Install

Either use the Editor - Menu - Manage Palette - Install option, or run the following command in your Node-RED user directory (typically `~/.node-red`) after installing node-red-dashboard:

        npm i node-red-node-ui-microphone

## Usage

The node provides a single button that, when clicked, will begin to capture audio.

This node provides a single button widget in the dashboard that, when pressed,
will begin to capture audio.
The button can be configured in two modes.

 - Click begins to capture audio, and then continues to capture audio until the button is pressed again, or it reaches its configured maximum duration.
 - Or the button can be configured to record only while the button is pressed.

The audio is captured in WAV format and published by the node as a Buffer object.
This can be written straight to a file or passed to any other node that expects
audio data.

## Browser Support

This node will work in most modern browsers as it uses the standard MediaRecorder API.

 - IE : not supported
 - Safari : MediaRecorder needs to be enabled (Develop -> Experimental Features -> MediaRecorder)

If you are accessing the dashboard remotely (not via `localhost`), then you must
use HTTPS otherwise the browser will block access to the microphone.


## Privacy

When the button is first pressed, the browser will ask the user's permission for
the page to access the microphone. The node cannot record audio until the user
has given their permission.


## Notices

This node uses `recorderWorker.js` Copyright © 2013 Matt Diamond, under the MIT License

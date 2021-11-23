const fs = require('fs');
const path = require('path');
const Mousetrap = require('mousetrap');
const OBSWebSocket = require('obs-websocket-js');

const obs = new OBSWebSocket();
var stopwatch;

require('dotenv').config({ path: path.resolve(__dirname, '../.env')});

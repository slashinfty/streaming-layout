const fs = require('fs');
const path = require('path');
const { ipcRenderer } = require('electron')

require('dotenv').config({ path: path.resolve(__dirname, '../.env')});

//ipcRenderer.on('switch', (event, message) => {
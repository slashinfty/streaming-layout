const { app, BrowserWindow, shell } = require('electron');
const contextMenu = require('electron-context-menu');
const isDev = require('electron-is-dev');
const { BroadcastChannel } = require('broadcast-channel');
const path = require('path');

const channel = new BroadcastChannel('channel');

contextMenu({
    prepend: (defaultActions, parameters, browserWindow) => [
        
    ]
});

const createWindow = () => {
    const win = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true
        },
        title: 'Streaming Layout',
        maximizable: true,
        resizable: true,
        backgroundColor: '#000'
    });

    win.setMenu(null);
    win.loadFile(path.resolve(__dirname, '../public/index.html'));

    if (isDev) win.webContents.openDevTools({ mode: 'detach' });
}

app.allowRendererProcessReuse = false;

app.whenReady().then(createWindow);

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
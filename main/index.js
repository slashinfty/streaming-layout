const { app, BrowserWindow, shell } = require('electron');
const contextMenu = require('electron-context-menu');
const prompt = require('electron-prompt');

let win;

contextMenu({
    prepend: (defaultActions, parameters, browserWindow) => [
        {
            label: 'Select Scene',
            submenu: [
                {
                    label: 'Starting Soon',
                    click: () => win.webContents.send('scene', 'Starting Soon')
                },
                {
                    label: 'Coding',
                    click: () => win.webContents.send('scene', 'Coding')
                },
                {
                    label: 'Electronics'
                },
                {
                    label: '10:9 Gaming'
                },
                {
                    label: '8:7 Gaming'
                },
                {
                    label: '4:3 Gaming'
                }
            ]
        },
        {
            label: 'Change Title',
            click: () => {
                prompt({
                    title: 'Change Stream Title',
                    label: 'Enter new title:',
                    inputAttrs: {
                        type: 'text'
                    },
                    skipTaskbar: false
                }, win).then(r => win.webContents.send('title', r)).catch(console.error);
            }
        },
        {
            label: 'Toggle Timer'
        },
        {
            label: 'Quit',
            click: app.quit
        }
    ]
});

const createWindow = () => {
    win = new BrowserWindow({
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
    win.loadFile(require('path').resolve(__dirname, '../public/index.html'));

    if (require('electron-is-dev')) win.webContents.openDevTools({ mode: 'detach' });
}

app.allowRendererProcessReuse = false;

app.whenReady().then(createWindow);

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

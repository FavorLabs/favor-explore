// Modules to control application life and create native browser window
const { app, BrowserWindow, Menu, Tray, shell } = require('electron');
const path = require('path');
const { ipcMain, dialog } = require('electron');
const { run } = require('./utils');
const fs = require('fs');

// app.disableHardwareAcceleration();

let win;
let tray;
let logs = [];

let menuExit = false;

function quit(status = true) {
  win.emit('kill');
  if (status) app.quit();
}

function start() {
  run({ win, logs });
}

function reStart() {
  quit(false);
  logs = [];
  win.webContents.send('logs', logs);
  win.webContents.send('startLoading');
  start();
}

async function createWindow() {
  Menu.setApplicationMenu(null);

  // Create the browser window.
  win = new BrowserWindow({
    show: false,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: false,
    },
  });

  win.on('close', (e) => {
    if (menuExit) return;
    const choice = dialog.showMessageBoxSync(win, {
      message: 'Are you sure you want to quit?',
      type: 'info',
      buttons: ['Cancel', 'Ok'],
    });
    if (choice === 0 && e) {
      e.preventDefault();
    }
  });

  start();

  // Create the menu
  tray = new Tray('./public/logo.png'); // sets tray icon image
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Restart',
      click: async () => {
        reStart();
      }, // click event
    },
    {
      label: 'Exit',
      click: () => {
        menuExit = true;
        quit();
      },
    },
  ]);
  tray.setContextMenu(contextMenu);

  // and load the index.html of the app.
  if (process.env.TERGET_ENV) {
    win.loadURL('http://localhost:8000');
  } else {
    win.loadFile('./dist/index.html');
  }

  win.webContents.addListener(
    'new-window',
    (event, url, frameName, disposition, options) => {
      event.preventDefault();
      let openWin = new BrowserWindow({
        webPreferences: {
          preload: path.join(__dirname, 'preload.js'),
          webSecurity: false,
        },
      });
      openWin.loadURL(url);
      openWin.webContents.session.addListener(
        'will-download',
        (evt, item, webContents) => {
          openWin.destroy();
        },
      );
    },
  );

  win.maximize();
  win.show();

  // Open the DevTools.

  process.env.TERGET_ENV && win.webContents.openDevTools();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    quit();
  }
});

ipcMain.on('restart', async (event) => {
  reStart();
});

ipcMain.on('config', (event) => {
  fs.readFile('./favorX/favorX.yaml', 'utf-8', function (err, data) {
    event.reply('config', { err, data });
  });
});

ipcMain.on('save', (event, message) => {
  fs.writeFile('./favorX/favorX.yaml', message, (err, data) => {
    event.reply('save', { err, data });
  });
});

ipcMain.on('reset', (event) => {
  fs.readFile('./favorX/.favorX', 'utf-8', function (err, data) {
    event.reply('reset', { err, data });
  });
});

ipcMain.on('logs', (event) => {
  event.reply('logs', logs);
});

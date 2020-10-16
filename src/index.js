const path = require('path');
const { app, BrowserWindow } = require('electron');
const { ipcMain } = require('electron')
const prettyApp = require('./prettyApp')
var mainWindow = undefined

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1080,
    height: 960,
    fullscreen: false,
    //icon: "./src/images/icon.ico",
    //autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
    }
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Open the DevTools.
  //mainWindow.webContents.openDevTools();

  //init prettyApp
  prettyApp.appInit(mainWindow, (res) => { console.log(res) })
  if (prettyApp.APP_OPTIONS.BOT_ENABLED) { prettyApp.tlgInit((res) => { console.log(res) }) }

  ipcMain.on('getData', () => {
    prettyApp.getOrders(prettyApp).then(_ =>{
      mainWindow.webContents.send('getOrders', {ordersArr: prettyApp.ordersArr, closedOrders: prettyApp.closedOrders.length})
    });
  })
  ipcMain.on('quitApp', () => {
    mainWindow.close();
  })

  ipcMain.on('toggleTlgBot', (event, data) => {
    prettyApp.APP_OPTIONS.BOT_ENABLED = data.enabled
  })

  ipcMain.on('appMainWindowLoaded', (event, data) => {
    event.reply('applyOptions', {
      bot_enabled: prettyApp.APP_OPTIONS.BOT_ENABLED,
      start_with_map: prettyApp.APP_OPTIONS.START_WITH_MAP
    })
  })
  ipcMain.on('updateLocationsFile', (event, data) => {
    prettyApp.updateLocationsFile()
  })
  ipcMain.on('debugButton', () => {
    prettyApp.prettyDebugger()
  })
};

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
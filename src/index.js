const path = require('path');
const { app, BrowserWindow } = require('electron');
const { ipcMain } = require('electron')
const PrettyApp = require('./prettyApp')

const createWindow = () => {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 1080,
        height: 960,
        fullscreen: false,
        //icon: "./src/images/icon.ico",
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: true,
        }
    });

    // and load the index.html of the app.
    console.log("Loading html of main window")
    mainWindow.loadFile(path.join(__dirname, 'index.html'));

    // Open the DevTools.
    //mainWindow.webContents.openDevTools();

    // init prettyApp
    console.log("Starting prettyApp")
    const prettyApp = new PrettyApp(mainWindow)

    //checking if we need to start the telegram bot
    if (prettyApp.APP_OPTIONS.BOT_ENABLED) { prettyApp.tlgInit((res) => { console.log(res) }) }

    ipcMain.on('getData', () => {
        prettyApp.getOrders(prettyApp).then(_ => {
            mainWindow.webContents.send('getOrders', { ordersArr: prettyApp.ordersArr, closedOrders: prettyApp.closedOrders })
        });
    })
    ipcMain.on('quitApp', () => {
        mainWindow.close();
    })

    ipcMain.on('toggleTlgBot', (event, data) => {
        prettyApp.APP_OPTIONS.BOT_ENABLED = data.enabled
    })

    ipcMain.on('appMainWindowLoaded', (event, data) => {
        prettyApp.getOrders(prettyApp).then(res => {
            if (res == "Couldn't refresh token") {
                //Show login screen
                event.reply('appError', { error: "You are not logged in" })
            } else {
                //send response data to app
                event.reply('applyOptions', {
                    bot_enabled: prettyApp.APP_OPTIONS.BOT_ENABLED,
                    start_with_map: prettyApp.APP_OPTIONS.START_WITH_MAP,
                    mapSettings: prettyApp.APP_OPTIONS.MAP_SETTINGS
                })
            }
        })
    })
    ipcMain.on('login', (event, data) => {
        //prettyApp.prettyRefresh(prettyApp.APP_OPTIONS.refreshToken)
        //prettyApp.prettyIsAuthorised().then(res => {console.log(res)})
        prettyApp.prettyLogin(data)
        //console.log(data)
    })
    ipcMain.on('updateMapSettings', (event, data) => {
        prettyApp.updateMapSettings(data)
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
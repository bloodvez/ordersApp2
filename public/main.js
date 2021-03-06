const { app, BrowserWindow, ipcMain } = require('electron')

const path = require('path')
const isDev = require('electron-is-dev')
require('@electron/remote/main').initialize()
const { refreshToken, login, getOrders } = require('./samokatAPI')

function createWindow() {
  // Create the loading window.
  let loadingWindow = new BrowserWindow({
    width: 256,
    height: 256,
    frame: false,
    webPreferences: {
      contextIsolation: true
    }
  })
  loadingWindow.loadURL(
    isDev
      ? `file://${path.join(__dirname, '../public/loading.html')}`
      : `file://${path.join(__dirname, '../build/loading.html')}`
  )
  loadingWindow.setIgnoreMouseEvents(true)

  // Create the app window.
  const win = new BrowserWindow({
    width: 1080,
    height: 1280,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    }
  })

  win.once('ready-to-show', () => {
    win.show()
    loadingWindow.destroy()
    loadingWindow = null
  })

  win.loadURL(
    isDev
      ? 'http://localhost:3000'
      : `file://${path.join(__dirname, '../build/index.html')}`
  )

  win.on('enter-full-screen', _ => {
    win.webContents.send('enteredFullscreen')
  })

  win.on('leave-full-screen', _ => {
    win.webContents.send('leftFullscreen')
  })

  ipcMain.handle('refreshToken', (event, token) => {
    return refreshToken(token)
  })
  ipcMain.handle('login', (event, credentials) => {
    return login(credentials)
  })
  ipcMain.handle('getOrders', (event, orders_token) => {
    return getOrders(orders_token)
  })
  ipcMain.handle('toggleFullscreen', (event, value) => {
    if (value === true) {
      win.setFullScreen(false)
    } else {
      win.setFullScreen(true)
    }
  })
  ipcMain.handle('exitApp', (event) => {
    app.quit()
  })
}

app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})
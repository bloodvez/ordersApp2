import { makeAutoObservable } from 'mobx'
import { io } from "socket.io-client";
const { readFileSync, writeFileSync } = window.require('fs')
const { ipcRenderer } = window.require('electron')
const order = require('./orderSchema')

export default class PrettyApp {
  constructor() {
    this._ordersArray = order.order
    this.toasts = []
    this.intervalID = ''
    this.amountPicking = 0
    this.amountDelivering = 0
    this.intervalRunning = false
    this.fullscreen = false
    this.connectingToWS = false
    this.config = {
      refreshToken: "",
      accessToken: ""
    }
    this.wsConnected = false

    if (!window.localStorage.config) {
      try {
        this.config = JSON.parse(readFileSync('config.json', 'utf8'))
        window.localStorage.config = JSON.stringify(this.config)
      } catch (error) {
        console.log(error)
      }
    } else {
      try {
        this.config = JSON.parse(window.localStorage.config)
      } catch (error) {
        window.localStorage.clear()
        alert('Couldn\'t parse local storage config')
      }
    }

    makeAutoObservable(this)

    ipcRenderer.on('enteredFullscreen', _ => {
      this.setFullscreen(true)
    })

    ipcRenderer.on('leftFullscreen', _ => {
      this.setFullscreen(false)
    })
  }

  setArray(array) {
    this._ordersArray = array

    this.amountPicking =
      array.picking.pending.length +
      array.picking.underway.length;

    this.amountDelivering =
      array.delivery.pending.length +
      array.delivery.reserved.length +
      array.delivery.underway.length;
  }

  get ordersArray() {
    return this._ordersArray
  }

  setToasts(array) {
    this.toasts = array
  }

  setWsConnected(state) {
    this.wsConnected = state
  }

  setСonnectingToWS(state) {
    this.connectingToWS = state
  }

  setFullscreen(state) {
    this.fullscreen = state
  }

  updateConfigFile() {
    writeFileSync("config.json", JSON.stringify(this.config));
  }

  addToast(obj) {
    this.toasts.push(obj)
  }

  async getOrders() {
    try {
      ipcRenderer.invoke('getOrders', this.config.accessToken).then(data => {
        //console.log(data);
        if (data === 'unauthorised') {
          this.refreshToken()
        } else {
          this.setArray(data)
        }
      })
    } catch (error) {
      console.log(error)
      alert('Something went wrong while fetching orders, try logging in again')
      if (this.intervalRunning) {
        this.stop()
      }
    }
  }

  async refreshToken() {
    ipcRenderer.invoke('refreshToken', this.config.refreshToken).then(data => {
      if (data) {
        //console.log('updated token')
        this.config.accessToken = data.accessToken
        window.localStorage.config = JSON.stringify(this.config)
      }
    })
  }

  async login(credentials) {
    let data = await ipcRenderer.invoke('login', credentials)
    //this.config.accessToken = data
    if (data.errorCode === "AUTHENTICATION_ERROR") { console.log("Incorrect credentials") }
    else {
      this.config.refreshToken = data.refreshToken
      this.config.accessToken = data.accessToken
      window.localStorage.config = JSON.stringify(this.config)
      this.updateConfigFile()
    }
  }

  async connectToWS(wsAddress) {
    if(wsAddress === ''){
      wsAddress = "http://h.ladvez.net:5557"
    }
    this.ws = io(wsAddress, { autoConnect: false })

    this.setСonnectingToWS(true)

    if (!this.ws.connected) {
      this.ws.on('connect', _ => {
        this.setWsConnected(true)
        this.setСonnectingToWS(false)
      })

      this.ws.on('disconnect', _ => {
        this.setWsConnected(false)
      })

      this.ws.on('tlgMessage', data => {
        this.addToast(data)
      })
      
      this.ws.connect()
    } else {
      console.log('connected already');
    }
  }

  disconnectFromWS() {
    this.ws.disconnect()
    this.setWsConnected(false)
  }

  testWS() {
    if (this.ws) {
      this.ws.emit('test')
      console.log(this.ws);
      console.log(this);
    }
  }

  start() {
    this.intervalID = setInterval(() => {
      this.getOrders()
    }, 10000)
    this.intervalRunning = true
    //console.log(`Interval ID: ${this.intervalID}`)
  }

  stop() {
    this.intervalRunning = false
    clearInterval(this.intervalID)
    this.intervalID = ''
  }

  toggleFullscreen() {
    ipcRenderer.invoke('toggleFullscreen', this.fullscreen)
  }

  exitApp() {
    ipcRenderer.invoke('exitApp')
  }
}

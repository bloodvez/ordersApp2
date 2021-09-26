import { makeAutoObservable } from 'mobx'
import { io } from "socket.io-client";
const fs = window.require('fs')
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
    this.ws = io("http://h.ladvez.net:5557/", { autoConnect: false })
    this.wsConnected = false
    try {
      this.config = JSON.parse(fs.readFileSync('config.json', 'utf8'))
    } catch (error) {
      console.log(error)
    }
    makeAutoObservable(this)

    ipcRenderer.on('enteredFullscreen', _ =>{
      this.setFullscreen(true)
    })

    ipcRenderer.on('leftFullscreen', _ =>{
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

  setFullscreen(state){
    this.fullscreen = state
  }

  addToast(obj) {
    this.toasts.push(obj)
  }

  async getOrders() {
    try {
      ipcRenderer.invoke('getOrders', this.config.ORDERS_TOKEN).then(data => {
        //console.log(data);
        if (data === 'unauthorised') {
          this.refreshToken()
        } else {
          this.setArray(data)
        }
      })
    } catch (error) {
      console.log(error)
    }
  }

  async refreshToken() {
    ipcRenderer.invoke('refreshToken', this.config.refreshToken).then(data => {
      this.config.ORDERS_TOKEN = data
    })
  }

  async login(credentials) {
    ipcRenderer.invoke('login', credentials).then(data => {
      return data
      //this.config.ORDERS_TOKEN = data
    })
  }

  async connectToWS() {
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

  toggleFullscreen(){
    ipcRenderer.invoke('toggleFullscreen', this.fullscreen)
  }

  exitApp(){
    ipcRenderer.invoke('exitApp')
  }
}

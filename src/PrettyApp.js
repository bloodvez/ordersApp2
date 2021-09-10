import { makeAutoObservable } from 'mobx'
const fs = window.require('fs')
const { Telegraf } = window.require('telegraf')
const { ipcRenderer } = window.require('electron')
const order = require('./orderSchema')

export default class PrettyApp {
  constructor() {
    this._ordersArray = order.order
    this.toasts = []
    this.intervalID = ''
    this.intervalRunning = false
    try {
      this.config = JSON.parse(fs.readFileSync('config.json', 'utf8'))
    } catch (error) {
      console.log(error)
    }
    makeAutoObservable(this)
  }

  setArray(array) {
    this._ordersArray = array
  }

  get ordersArray() {
    return this._ordersArray
  }

  setToasts(array) {
    this.toasts = array
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

  tlgMsgHandling(ctx, text) {
    if (text.includes('@sizova25')) {
      ctx.forwardMessage(-448944242, ctx.chat.id, ctx.message.message_id)
      this.toasts.push({
        messageId: ctx.message.message_id,
        text: text,
        date: ctx.message.date * 1000,
        author: ctx.message.from.first_name,
        chat: ctx.message.chat.title
      })
    } else if (text === '/ungabunga') {
      ctx.reply(`Целовал тебя ${~~(Math.random() * 100)} раз`)
    }
  }

  tlgInit() {
    this.tlgBot = new Telegraf(this.config.BOT_TOKEN)
    this.tlgBot.on('message', ctx => {
      if (this.config.BOT_ENABLED) {
        //check if message is from whitelisted chat
        if (this.config.CHATS.includes(ctx.chat.id)) {
          var text =
            ctx.message.text === undefined
              ? ctx.message.caption
              : ctx.message.text
          if (text !== undefined) {
            this.tlgMsgHandling(ctx, text)
          }
        }
      }
    })

    this.tlgBot.catch((err, ctx) => {
      console.log(`Ooops, encountered an error for ${ctx.updateType}`, err)
    })
    this.tlgBot.launch().then(console.log('bot connected'))
    this.BOT_STARTED = true
  }

  start() {
    this.intervalID = setInterval(() =>{
      this.getOrders()
    }, 10000)
    this.intervalRunning = true
    console.log(`Interval ID: ${this.intervalID}`)
  }

  stop() {
    this.intervalRunning = false
    clearInterval(this.intervalID)
    this.intervalID = ''
  }
}

const fs = require('fs');
const { Telegraf } = require('telegraf')
const fetch = require('node-fetch');
const { captureRejectionSymbol } = require('events');

class prettyApp {
    constructor() {
        this.APP_OPTIONS = {
            BOT_ENABLED: false,
            BOT_STARTED: false,
        }
    }

    appInit(mainWindow, callback) {
        try {
            this.APP_OPTIONS = JSON.parse(fs.readFileSync("config.json", 'utf8'))

            //closed orders file
            this.date = new Date()
            this.clsdOrdersPath = `closedOrders/closedOrders${this.date.getDate()}_${this.date.getMonth() + 1}.json`
            //check if file with current date exist
            //if it doesn't - create one
            if (!fs.existsSync(this.clsdOrdersPath)) {
                fs.writeFileSync(this.clsdOrdersPath, "[]", 'utf8')
                this.closedOrders = []
            } else { // and if it does exist - read it
                this.closedOrders = JSON.parse(fs.readFileSync(this.clsdOrdersPath, 'utf8'))
            }
            this.ordersArr = []

            var chats = []
            this.APP_OPTIONS.CHATS_LIST.forEach(elem => {
                chats.push(elem.chat_id)
            })
            this.APP_OPTIONS.CHATS_LIST = chats
            this.requestHeader = { headers: { authorization: this.APP_OPTIONS.ORDERS_TOKEN } }
            this.mainWindow = mainWindow //browser window

            //update time every 10 minutes
            setInterval(() => {
                this.dateChecker()
            }, 10 * (60 * 1000));

            callback("app started")
        } catch (error) {
            console.log(error)
        }
    }

    async getShifts() {
        let params;
        let currentDay = this.date.getDate() < 10 ? "0" + this.date.getDate() : this.date.getDate()
        let currentMonth = this.date.getMonth() < 10 ? "0" + (this.date.getMonth() + 1) : (this.date.getMonth() + 1)
        let currentYear = this.date.getFullYear()
        let seachInterval = `${currentYear}-${currentMonth}-${currentDay}`
        let returnString = `График на ${seachInterval}: \n`
        params = new URLSearchParams({
            warehouseId: "2c3f7267-1cf8-11ea-8d70-0050560306e1",
            from: seachInterval,
            to: seachInterval
        })
        const resp = await fetch(`https://smena-api.samokat.ru/v1/shifts/warehouse?${params.toString()}T21:00:00.000Z`, this.requestHeader)
        let result = await resp.json()
        result.map(async (elem, number) => {
            if (elem.workDay.status == "approved") {
                elem.workDay.shifts.forEach(shift => {
                    if (shift.status == "approved") {
                        let startHour = new Date(shift.from).getHours()
                        let endHour = new Date(shift.to).getHours()
                        returnString += `${elem.deliveryman.name} c ${startHour} по ${endHour}\n`
                    }
                })
            }
        })
        return new Promise(resolve => {
            resolve(returnString)
        })
    }

    tlgMsgHandling(ctx, text) {
        if (text.includes("@sizova25")) {
            //console.log(text)
            this.mainWindow.webContents.send('telegramMessage', { date: ctx.message.date, text: text })
            ctx.forwardMessage(-448944242, ctx.chat.id, ctx.message.message_id)
        }
        else if (text == "/ungabunga")
            if (ctx.from.id == 266536855) {
                ctx.reply(`Нахуй пошел`)
                this.mainWindow.webContents.send('telegramMessage', { date: ctx.message.date, text: text })
            } else {
                ctx.reply(`Целовал тебя ${~~(Math.random() * 100)} раз`)
            }
        else if (text == "/shifts") {
            this.getShifts().then(res => {
                ctx.reply(res)
            })

        }
    }

    async tlgInit(callback) {
        this.tlgBot = new Telegraf(this.APP_OPTIONS.BOT_TOKEN)
        this.tlgBot.on('message', (ctx) => {
            if (this.APP_OPTIONS.BOT_ENABLED) {
                //check if message is from whitelisted chat
                if (this.APP_OPTIONS.CHATS_LIST.includes(ctx.chat.id)) {
                    var text = ctx.message.text == undefined ? ctx.message.caption : ctx.message.text
                    //this is ugly, go fuck yourself
                    console.log(text == undefined ? 'no text in tlg msg' : this.tlgMsgHandling(ctx, text))
                }
            }
        })

        this.tlgBot.catch((err, ctx) => {
            console.log(`Ooops, encountered an error for ${ctx.updateType}`, err)
        })
        this.tlgBot.launch().then(console.log("bot connected"))
        this.BOT_STARTED = true
        callback("tlg started")
    };

    async ordersHandling(inputArr) {
        //find closed orders
        const leftArray = this.ordersArr.filter(({ taskId: id1 }) => !inputArr.some(({ taskId: id2 }) => id2 === id1));
        //find new entries
        const newInArray = inputArr.filter(({ taskId: id1 }) => !this.ordersArr.some(({ taskId: id2 }) => id2 === id1));
        //black magic, I have no clue what it does

        //remove closed orders
        leftArray.forEach((elem) => {
            if (elem.taskType == "DeliveryInProgress") {
                this.closedOrders.push(elem)
                this.ordersArr.splice(this.ordersArr.indexOf(elem), 1)
                //console.log(`${elem.deliveryDestination} is no more`)
            } else {
                this.ordersArr.splice(this.ordersArr.indexOf(elem), 1)
            }
        })
        //and write them to file
        if (leftArray.length != 0) {
            this.updateClosedOrdersFile()
        }

        //update current orders
        this.ordersArr.map(async elem => {
            //time left calc
            var timeNow = new Date().getTime()
            var timeFinished = (new Date(elem.orders[0].dueDate).getTime())
            var timeLeft = Math.round(((timeFinished - timeNow) / 1000 / 60))
            elem.timeLeft = timeLeft
            //Setting task types
            var id = elem.taskId
            inputArr.forEach(input => {
                if (input.taskId == id) {
                    elem.taskType = input.taskType
                    elem.responsible = input.responsible
                    //Setting task types
                    if (elem.taskType == "PICKING" && elem.responsible) {
                        elem.taskType = "PickingInProgress"
                    }
                    if (elem.taskType == "DELIVERY" && elem.responsible) {
                        elem.taskType = "DeliveryInProgress"
                    }
                }
            })
        })

        await Promise.all(newInArray.map(async elem => {
            //time left calc
            var timeNow = new Date().getTime()
            var timeFinished = (new Date(elem.orders[0].dueDate).getTime())
            var timeLeft = Math.round(((timeFinished - timeNow) / 1000 / 60))
            elem.timeLeft = timeLeft
            

            //get amount of items
                try {
                    //get order detailed info
                    const response = await fetch(`https://api.samokat.ru/darkstore/tasks/${elem.type}/${elem.taskId}`, this.requestHeader);
                    const res = await response.json()
                    //append required elements
                    elem.apartment = res.value.orders[0].deliveryDestination.flat
                    elem.entrance = res.value.orders[0].deliveryDestination.entrance
                    elem.floor = res.value.orders[0].deliveryDestination.floor
                    elem.lat = res.value.orders[0].deliveryDestination.coordinates.latitude
                    elem.lng = res.value.orders[0].deliveryDestination.coordinates.longitude
                    //Setting task types
                    if (elem.taskType == "PICKING" && elem.responsible) {
                        elem.taskType = "PickingInProgress"
                    }
                    if (elem.taskType == "DELIVERY" && elem.responsible) {
                        elem.taskType = "DeliveryInProgress"
                    }
                    //add new item to app array
                    this.ordersArr.push(elem)
                    //DOING IT IN THIS HERE SCOPE BECAUSE FUCK YOU I AM RETARDED
                } catch (error) {
                    console.log(error)
                }
        }))
    };

    async getOrders(app) {
        try {
            const resp = await fetch('https://api.samokat.ru/darkstore/tasks/admin/active', this.requestHeader);
            var result = await resp.json();
            if (result.code == "active_shift_not_found") {
                console.log("No actve shifts")
            } else {
                //Adding all required info
                result = result.value.otherTasks
                result.forEach(elem =>{
                    elem.itemsAmount = elem.orders[0].productsQuantity
                    elem.responsible = elem.responsible == undefined ? "" : elem.responsible.fullName
                    elem.taskType = elem.type
                    elem.deliveryDestination = elem.orders[0].deliveryDestination
                })
                await app.ordersHandling(result).then(res => {
                    app.ordersArr.sort((a, b) => { return b.timeLeft - a.timeLeft })
                })
            }
        } catch (error) {
            console.log(error)
            //app.mainWindow.webContents.send('appError')
        }
    }

    updateConfigFile() {
        fs.writeFile("config.json", JSON.stringify(this.APP_OPTIONS), 'utf8', (err) => {
            if (err) {
                return console.log(`Couldn't update config file: ${err}`)
            }
            console.log("Updated config file")
        })
    }

    updateClosedOrdersFile() {
        let jsonToWrite = []
        this.closedOrders.forEach(elem => {
            jsonToWrite.push({
                taskId: elem.taskId,
                deliveryDestination: elem.deliveryDestination,
                responsible: elem.responsible,
                timeLeft: elem.timeLeft,
                apartment: elem.apartment
            })
        })
        fs.writeFile(this.clsdOrdersPath, JSON.stringify(jsonToWrite), 'utf8', (err) => {
            if (err) {
                return console.log(`Couldn't update closed orders file: ${err}`)
            }
        })
    }

    dateChecker() {
        let newDate = new Date()
        if (newDate.getDate() != this.date.getDate()) {
            this.clsdOrdersPath = `src/closedOrders/closedOrders${newDate.getDate()}_${newDate.getMonth() + 1}.json`
            
            this.updateClosedOrdersFile()
            this.closedOrders = []
            console.log("day changed")
        }
        this.date = newDate
    }

    prettyDebugger() {
        console.log("debug")
        //this.mainWindow.alert("debug")
    }
}

module.exports = new prettyApp()
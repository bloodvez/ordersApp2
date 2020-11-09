const fs = require('fs');
const { Telegraf } = require('telegraf')
const fetch = require('node-fetch');
const prettyUtils = require('./prettyUtils')

class prettyApp {
    constructor(mainWindow) {
        try {
            //look for config file
            if (!fs.existsSync('config.json')) {
                console.log('config file doesn\'t exist, creating one')
                let toWrite = {
                    BOT_TOKEN: "", //telegram bot token
                    ORDERS_TOKEN: "", //samokat dashboard token
                    BOT_ENABLED: false,
                    START_WITH_MAP: false,
                    CHATS_LIST: [{ //chats that telegram bot listens to
                        chat_id: '',
                        comment: ''
                    }],
                    CHATS: [],
                }
                fs.writeFileSync('config.json', JSON.stringify(toWrite), 'utf8')
            } else {
                this.APP_OPTIONS = JSON.parse(fs.readFileSync("config.json", 'utf8'))
            }

            //closed orders file
            this.date = new Date()
            this.clsdOrdersPath = `closedOrders/closedOrders${this.date.getDate()}_${this.date.getMonth() + 1}.json`
            //check if file with current date exist
            //if it doesn't - create one
            if (!fs.existsSync('closedOrders')) {
                fs.mkdirSync('closedOrders')
            }

            if (!fs.existsSync(this.clsdOrdersPath)) {
                fs.writeFileSync(this.clsdOrdersPath, "[]", 'utf8')
                this.closedOrders = []
            } else { // and if it does exist - read it
                this.closedOrders = JSON.parse(fs.readFileSync(this.clsdOrdersPath, 'utf8'))
                //send to browser
            }
            this.ordersArr = []

            var chats = []
            this.APP_OPTIONS.CHATS_LIST.forEach(elem => {
                chats.push(elem.chat_id)
            })
            this.APP_OPTIONS.CHATS = chats
            this.requestHeader = { headers: { authorization: `Bearer ${this.APP_OPTIONS.ORDERS_TOKEN}` } }
            this.mainWindow = mainWindow //browser window

            //update time every 10 minutes
            setInterval(() => {
                this.dateChecker()
            }, 10 * (60 * 1000));

        } catch (error) {
            console.log(error)
        }
    }

    tlgMsgHandling(ctx, text) {
        if (text.includes("@sizova25")) {
            this.mainWindow.webContents.send('telegramMessage', { date: ctx.message.date, text: text })
            ctx.forwardMessage(-448944242, ctx.chat.id, ctx.message.message_id)
        } else if (text == "/ungabunga")
            if (ctx.from.id == 266536855) {
                ctx.reply(`Нахуй пошел`)
                this.mainWindow.webContents.send('telegramMessage', { date: ctx.message.date, text: text })
            } else {
                ctx.reply(`Целовал тебя ${~~(Math.random() * 100)} раз`)
            }
    }

    async tlgInit(callback) {
        this.tlgBot = new Telegraf(this.APP_OPTIONS.BOT_TOKEN)
        this.tlgBot.on('message', (ctx) => {
            if (this.APP_OPTIONS.BOT_ENABLED) {
                //check if message is from whitelisted chat
                if (this.APP_OPTIONS.CHATS.includes(ctx.chat.id)) {
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
        inputArr.forEach(elem => {
            elem.itemsAmount = elem.orders[0].productsQuantity
            elem.responsible = elem.responsible == undefined ? "" : elem.responsible.fullName
            elem.taskType = elem.type
            elem.deliveryDestination = elem.orders[0].deliveryDestination
        })

        //find closed orders
        const leftArray = this.ordersArr.filter(({ taskId: id1 }) => !inputArr.some(({ taskId: id2 }) => id2 === id1));
        //find new entries
        const newInArray = inputArr.filter(({ taskId: id1 }) => !this.ordersArr.some(({ taskId: id2 }) => id2 === id1));
        //black magic, I have no clue what it does

        if (leftArray.length != 0) {
            // get current time
            let closedTime = prettyUtils.prettyTime()
            closedTime = `${closedTime.hour}:${closedTime.minute}`
            //remove closed orders
            leftArray.forEach((elem) => {
                if (elem.taskType == "DeliveryInProgress") {
                    elem.closedTime = closedTime
                    this.closedOrders.push(elem)
                    this.ordersArr.splice(this.ordersArr.indexOf(elem), 1)
                    //console.log(`${elem.deliveryDestination} is no more`)
                } else {
                    this.ordersArr.splice(this.ordersArr.indexOf(elem), 1)
                }
            })

            //and write them to file
            this.updateClosedOrdersFile()
        }
        //send to browser
        this.mainWindow.webContents.send('closedOrder', this.closedOrders)

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

        //get required info for new orders
        await Promise.all(newInArray.map(async elem => {
            //time left calc
            var timeNow = new Date().getTime()
            var timeFinished = (new Date(elem.orders[0].dueDate).getTime())
            var timeLeft = Math.round(((timeFinished - timeNow) / 1000 / 60))
            elem.timeLeft = timeLeft

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
                elem.phone = res.value.orders[0].customer.phone
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

    async prettyLogin(loginInfo) { // {"login": "phone", "password": "pswd"}
        try {
            const resp = await fetch('https://dashboard.samokat.ru/api/access/tokens', {
                method: "POST",
                headers:
                {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(loginInfo)
            });
            let result = await resp.json()
            if (result.status == undefined) {
                this.APP_OPTIONS.ORDERS_TOKEN = result.accessToken
                this.APP_OPTIONS.refreshToken = result.refreshToken
                this.requestHeader = { headers: { authorization: `Bearer ${this.APP_OPTIONS.ORDERS_TOKEN}` } }
                //send thing to UI to clear login form
                //and notify user that we are logged in
                console.log('logged in')
                this.mainWindow.webContents.send('clearLogin')
                this.updateConfigFile()
            }
        } catch (error) {
            this.mainWindow.webContents.send('appError', { error: "Couldn't login" })
            console.log("Couldn't login")
        }
    }

    async prettyRefresh(refreshToken) {
        try {
            let toSend = { "refreshToken": refreshToken }
            const resp = await fetch('https://dashboard.samokat.ru/api/access/tokens/refresh', {
                method: "POST",
                headers:
                {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(toSend)
            });
            let result = await resp.json()
            if (result.status == undefined) {
                this.APP_OPTIONS.ORDERS_TOKEN = result.accessToken
                this.requestHeader = { headers: { authorization: `Bearer ${this.APP_OPTIONS.ORDERS_TOKEN}` } }
                //console.log('updated token')
                //this.updateConfigFile()
                return "Done"
            }
        } catch (error) {
            this.mainWindow.webContents.send('appError', { error: "Couldn't refresh token" })
            console.log("Couldn't refresh token")
        }
    }

    async prettyIsAuthorised() {
        try {
            const resp = await fetch('https://api.samokat.ru/darkstore/tasks/admin/active', this.requestHeader);
            var result = await resp.json();
            if (result.status == undefined) {
                return { isAuthorised: true, data: result }
            } else {
                //console.log("Unauthorised")
                return { isAuthorised: false }
            }
        } catch (error) {
            console.log(error)
        }
    }

    async getOrders(app) {
        try {
            //check if we're authorised
            let resp = await this.prettyIsAuthorised()
            if (resp.isAuthorised == false) {
                //console.log("Unauthorized, trying to refresh token")
                let refreshStatus = await this.prettyRefresh(this.APP_OPTIONS.refreshToken)
                //checking if refresh was successful
                if (refreshStatus !== "Done") {
                    this.mainWindow.webContents.send('appError', { error: "Can't fetch orders, try logging in again" })
                    console.log("Couldn't refresh token")
                    return "Couldn't refresh token"
                } else {
                    // Fetch data again with new token
                    const res = await fetch('https://api.samokat.ru/darkstore/tasks/admin/active', this.requestHeader);
                    resp.data = await res.json();
                }
            }
            if (resp.data.error == "SHIFT_NOT_FOUND") { //shift is closed
                this.mainWindow.webContents.send('appError', { error: "No actve shifts" })
                console.log("No actve shifts")
            } else {
                //Adding all required info
                await app.ordersHandling(resp.data.value.otherTasks).then(res => {
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
            //console.log("Updated config file")
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
                apartment: elem.apartment,
                phone: elem.phone,
                closedTime: elem.closedTime
            })
        })
        fs.writeFile(this.clsdOrdersPath, JSON.stringify(jsonToWrite), 'utf8', (err) => {
            if (err) {
                return console.log(`Couldn't update closed orders file: ${err}`)
            }
        })
    }

    updateMapSettings(data){
        this.APP_OPTIONS.MAP_SETTINGS = data
        this.updateConfigFile()
    }

    dateChecker() {
        let newDate = new Date()
        if (newDate.getDate() != this.date.getDate()) {
            this.clsdOrdersPath = `closedOrders/closedOrders${newDate.getDate()}_${newDate.getMonth() + 1}.json`
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

module.exports = prettyApp
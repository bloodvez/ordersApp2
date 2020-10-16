const electron = require('electron');
const ipcRenderer = electron.ipcRenderer;

var ordersArr = [];
var closedOrders
var telegramMessages = [];
var prettyStatus = "ready";
var intervalID = "";
var intervalRunning = false;
var nowToAssemble, nowAssembling, nowToDeliver, nowDelivering
var tlgAudio = new Audio('sound/tlgMsg.ogg')
var ordersMap = undefined

ipcRenderer.on('applyOptions', (event, data) => {
  botToggleCheckbox.checked = data.bot_enabled
  if (data.start_with_map) createMap()
})

ipcRenderer.on('getOrders', (event, data) => {
  ordersArr = data.ordersArr
  closedOrders = data.closedOrders
  prettyUpdate()
})

ipcRenderer.on('appError', (event, data) => {
  prettyStop()
  alert("Something went wrong")
})

ipcRenderer.on('telegramMessage', (event, data) => {
  // { date: message_date, text: message_text }
  addTelegramMessage(data)
})



updateButton.onclick = getData
startButton.onclick = prettyStart
stopButton.onclick = prettyStop
fullscreenButton.onclick = () => { document.documentElement.requestFullscreen() }
quitButton.onclick = () => { ipcRenderer.send('quitApp') }
sendTestMessage.onclick = sendTestTlg
addFakeOrderButton.onclick = () => addFakeOrder(fakeOrdersAmount.value)
timeButton.onclick = () => { debugDiv.classList.toggle("hidden") }
fakeOrdersAmount.onchange = () => { addFakeOrderButton.innerHTML = `orders: ${fakeOrdersAmount.value}` }
botToggleCheckbox.onclick = () => { ipcRenderer.send('toggleTlgBot', { 'enabled': botToggleCheckbox.checked }) }
mapToggleCheckbox.onclick = () => { prettyMap.classList.toggle("hidden") }
hideOrdersCheckbox.onclick = () => { issuesTable.classList.toggle("hidden") }
addMap.onclick = () => { createMap() }
addMapMarkers.onclick = () => { addMarkers() }
updateLocationsFile.onclick = () => { ipcRenderer.send('updateLocationsFile') }
breakpointButton.onclick = () => { ipcRenderer.send('debugButton') }


function getData() {
  prettyStatusUpdate("updating")
  ipcRenderer.send('getData')
}

function prettyUpdate() {
  issuesAssembling.innerHTML = ""
  issuesToAssemble.innerHTML = ""
  issuesDelivering.innerHTML = ""
  issuesToDeliver.innerHTML = ""
  addNewDiv(ordersArr)
  addMarkers()
  if (intervalRunning) {
    prettyStatusUpdate("running")
  } else {
    prettyStatusUpdate("ready")
  }
}

function prettyStart() {
  intervalID = setInterval(getData, 15000)
  intervalRunning = true
  prettyStatusUpdate("running")
  console.log(`Interval ID: ${intervalID}`)
}

function prettyStop() {
  intervalRunning = false
  clearInterval(intervalID)
  intervalID = ""
  prettyStatusUpdate("ready")
}

function addNewDiv(inArr) {

  nowToAssemble = nowAssembling = nowToDeliver = nowDelivering = 0

  inArr.forEach(elem => {
    //card body
    var newDiv = document.createElement("div")
    newDiv.className = "card"
    //newDiv.innerText = `№${elem.orderNumber} ${elem.deliveryDestination}`
    newDiv.innerText = `${elem.deliveryDestination}`
    if (elem.apartment) {
      newDiv.innerText += `, кв: ${elem.apartment}`
    }
    if (elem.entrance) {
      newDiv.innerText += `, п: ${elem.entrance}`
    }
    if (elem.floor) {
      newDiv.innerText += `, этаж: ${elem.floor}`
    }

    //timer
    var timeLeftDiv = document.createElement("span")
    //coloring
    if (elem.timeLeft < -10) {
      newDiv.className += " superOverdue"
      timeLeftDiv.className = "overdue"
    } else if (elem.timeLeft < 0) {
      timeLeftDiv.className = "overdue"
    } else {
      timeLeftDiv.className = "onTime"
    }
    //appending to card
    if (elem.itemsAmount) {
      timeLeftDiv.innerText = `Товаров: ${elem.itemsAmount} ⌚${elem.timeLeft}`
    } else timeLeftDiv.innerText = `⌚${elem.timeLeft}`
    //timeLeftDiv.innerText = `⌚${elem.timeLeft}`
    newDiv.append(timeLeftDiv)

    //Counting and sorting
    switch (elem.taskType) {
      case "PICKING": //sobrat
        issuesToAssemble.append(newDiv)
        nowToAssemble++
        break

      case "PickingInProgress": //sborka
        issuesAssembling.append(newDiv)
        nowAssembling++
        break

      case "DELIVERY": //dostavit
        issuesToDeliver.append(newDiv)
        nowToDeliver++
        break

      case "DeliveryInProgress": //vrabote
        //deliveryman
        if (elem.responsible) {
          var deliverymanDiv = document.createElement("div")
          deliverymanDiv.innerText = elem.responsible
          newDiv.append(deliverymanDiv)
        }
        issuesDelivering.append(newDiv)
        nowDelivering++
        break
    }
  })
}

function prettyStatusUpdate(status) {
  if (status != undefined) {
    prettyStatus = status
    switch (prettyStatus) {
      case "running":
        statusDiv.innerText = "running"
        startButton.hidden = true
        stopButton.hidden = false
        updateButton.hidden = true
        break
      case "updating":
        statusDiv.innerText = "updating"
        updateButton.hidden = true
        break
      case "loading":
        statusDiv.innerText = "loading"
        updateButton.hidden = true
        break
      case "ready":
        startButton.hidden = false
        stopButton.hidden = true
        statusDiv.innerText = "ready"
        updateButton.hidden = false
        break
    }
  }
  statusDiv.innerText = `${statusDiv.innerText}, Заказов: ${ordersArr.length}, Закрытых заказов:${closedOrders}`
  prettyTitle.innerText = `${statusDiv.innerText}`
  toAssembleHeader.textContent = `Собрать: ${nowToAssemble}`
  assemblingHeader.textContent = `Собирается: ${nowAssembling}`
  toDeliverHeader.textContent = `Доставить: ${nowToDeliver}`
  deliveringHeader.textContent = `В работе: ${nowDelivering}`
}

function addTelegramMessage(message) {
  telegramBody.innerHTML = ""
  var timeToShow = makePrettyTime(message.date)
  if (telegramMessages.length >= 3) {
    telegramMessages.shift()
  }
  telegramMessages.push(`${timeToShow.hour}:${timeToShow.minute} ${message.text}`)

  telegramMessages.forEach((elem) => {
    var newDiv = document.createElement('div')
    newDiv.className = "telegramCard"
    newDiv.onmousedown = (event) => {
      if (event.which == 3) { //right click handling
        var text = elem
        telegramMessages = telegramMessages.filter(text => text != elem)
        //will remove all identical messages tho
        newDiv.remove()
      }
    }
    var newSpan = document.createElement('span')
    newSpan.innerHTML = elem
    newDiv.append(newSpan)
    telegramBody.append(newDiv)
  })

  tlgAudio.play()

}

function addDebugMessage(message){
  
}

function makePrettyTime(inputDate) {
  var currentDate = inputDate === undefined ? new Date() : new Date(inputDate * 1000)
  //making hours and minutes look nice
  var currentHour = currentDate.getHours() < 10 ? "0" + currentDate.getHours() : currentDate.getHours()
  var currentMinute = currentDate.getMinutes() < 10 ? "0" + currentDate.getMinutes() : currentDate.getMinutes()
  return { hour: currentHour, minute: currentMinute }
}

function sendTestTlg() {
  var dateNow = Math.floor(new Date().getTime() / 1000)
  addTelegramMessage({ date: dateNow, text: testMsgInput.value })
}

function addFakeOrder(amount) {
  const possibleStatus = ["DeliveryInProgress", "ReadyForDelivery", "ReadyForPicking", "PickingInProgress"]
  var times = amount == undefined ? times = 1 : times = amount
  for (let i = 0; i < times; i++) {
    var foo = {
      orderNumber: 123,
      deliveryDestination: "Fake address",
      itemsAmount: ~~(Math.random() * 25) + 1,
      //employee: "Fake Employee",
      status: possibleStatus[~~(Math.random() * possibleStatus.length)],
      timeLeft: ~~(Math.random() * 30),
      lat: 60.01662,
      lng: 30.27981
    }
    ordersArr.push(foo)
  }
  prettyUpdate()
}

setInterval((() => { //time
  var timeToShow = makePrettyTime()
  timeToShow = `${timeToShow.hour}:${timeToShow.minute}`
  timeButton.innerHTML = timeToShow
}), 15000)

ipcRenderer.send('appMainWindowLoaded')
prettyStatusUpdate('ready')
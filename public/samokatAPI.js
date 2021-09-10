const fetch = require('node-fetch')

const refreshToken = async refreshToken => {
  try {
    let toSend = { refreshToken: refreshToken }
    const resp = await fetch(
      'https://dashboard.samokat.ru/api/access/tokens/refresh',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          origin: 'https://dashboard.samokat.ru'
        },
        body: JSON.stringify(toSend)
      }
    )
    let result = await resp.json()
    if (result.status === undefined) {
      //console.log('updated token')
      //this.updateConfigFile()
      return result.accessToken
    }
  } catch (error) {
    console.log("Couldn't refresh token")
    return "Couldn't refresh token"
  }
}

const login = async credentials => {
  // {"login": "phone", "password": "pswd"}
  try {
    const resp = await fetch(
      'https://dashboard.samokat.ru/api/access/tokens',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      }
    )
    let result = await resp.json()
    switch (result.status) {
      case undefined: //no error, credentials are correct
        return result

      case 500: // invalid credentials most likely
        return 'Wrong credentials'

      default:
        break
    }
  } catch (error) {
    console.log("Couldn't login")
    console.log(error)
  }
}

const getOrders = async orders_token => {
  try {
    const res = await fetch(
      'https://dashboard.samokat.ru/api/warehouse/summary',
      //'https://api.samokat.ru/darkstore/tasks/admin/orders/active',
      {
        headers: { authorization: `Bearer ${orders_token}` }
      }
    )
    if (res.status !== 401) {
      let data = await res.json()
      return data
    } else {
      return 'unauthorised'
    }
  } catch (error) {
    console.log(error)
  }
}

exports.refreshToken = refreshToken
exports.login = login
exports.getOrders = getOrders


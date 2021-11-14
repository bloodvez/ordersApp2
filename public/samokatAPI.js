const fetch = require('node-fetch')
const https = require('https');
const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

const REFRESH_URL = 'https://dashboard.samokat.ru/api/access/tokens/refresh'
const LOGIN_URL= 'https://dashboard.samokat.ru/api/access/tokens'
const ORDERS_URL = 'https://dashboard.samokat.ru/api/warehouse/summary'

const refreshToken = async refreshToken => {
  try {
    let toSend = { refreshToken: refreshToken }
    const resp = await fetch(REFRESH_URL,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(toSend),
        agent: httpsAgent
      }
    )
    let result = await resp.json()
    return result
  } catch (error) {
    console.log("Couldn't refresh token")
    return "Couldn't refresh token"
  }
}

const login = async credentials => {
  // {"login": "phone", "password": "pswd"}
  try {
    const resp = await fetch(LOGIN_URL,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials),
        agent: httpsAgent 
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
    const res = await fetch(ORDERS_URL,
      //'https://api.samokat.ru/darkstore/tasks/admin/orders/active',
      {
        headers: { authorization: `Bearer ${orders_token}` },
        agent: httpsAgent
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


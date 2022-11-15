/*! reddit. See LICENSE.md License. Feross Aboukhadijeh <https://feross.org/opensource> */
const debug = require('debug')('reddit')
const get = require('simple-get')
const querystring = require('querystring')

const TOKEN_BASE_URL = 'https://www.reddit.com/api/v1/access_token'
const API_BASE_URL = 'https://oauth.reddit.com'
const REQUEST_TIMEOUT = 30 * 1000

class Reddit {
  constructor (opts) {
    this.username = opts.username
    this.password = opts.password
    this.appId = opts.appId
    this.appSecret = opts.appSecret
    this.userAgent = opts.userAgent || 'reddit (https://github.com/feross/reddit)'

    this.token = null
    this.tokenExpireDate = 0
  }

  async get (url, data = {}) {
    return this._sendRequest('GET', API_BASE_URL + url, data)
  }

  async post (url, data = {}) {
    return this._sendRequest('POST', API_BASE_URL + url, data)
  }

  async patch (url, data = {}) {
    return this._sendRequest('PATCH', API_BASE_URL + url, data)
  }

  async put (url, data = {}) {
    return this._sendRequest('PUT', API_BASE_URL + url, data)
  }

  async delete (url, data = {}) {
    return this._sendRequest('DELETE', API_BASE_URL + url, data)
  }

  async _sendRequest (method, url, data) {
    const token = await this._getToken()
    const body = await this._makeRequest(method, url, data, token)

    const errors = body && body.json && body.json.errors
    if (errors && errors.length > 0) {
      const err = new Error(
        errors.map(
          error => `${error[0]}: ${error[1]} (${error[2]})`
        ).join('. ')
      )
      err.code = errors[0][0]
      err.codes = errors.map(error => error[0])
      throw err
    }

    return body
  }

  async _getToken () {
    if (Date.now() / 1000 <= this.tokenExpireDate) {
      return this.token
    }

    return new Promise((resolve, reject) => {
      get.concat({
        url: TOKEN_BASE_URL,
        method: 'POST',
        form: {
          grant_type: 'password',
          username: this.username,
          password: this.password
        },
        headers: {
          authorization: `Basic ${Buffer.from(`${this.appId}:${this.appSecret}`).toString('base64')}`,
          'user-agent': this.userAgent
        },
        json: true,
        timeout: REQUEST_TIMEOUT
      }, (err, res, body) => {
        if (err) {
          err.message = `Error getting token: ${err.message}`
          return reject(err)
        }

        const statusType = Math.floor(res.statusCode / 100)

        if (statusType === 2) {
          const {
            access_token: accessToken,
            expires_in: expiresIn,
            token_type: tokenType
          } = body

          if (tokenType == null || accessToken == null) {
            return reject(new Error(`Cannot obtain token for username ${this.username}. ${body.error}. ${body.error_description}.`))
          }

          this.token = `${tokenType} ${accessToken}`
          // Shorten token expiration time by half to avoid race condition where
          // token is valid at request time, but server will reject it
          this.tokenExpireDate = ((Date.now() / 1000) + (expiresIn / 2))

          return resolve(this.token)
        } else if (statusType === 4) {
          return reject(
            new Error(`Cannot obtain token for username ${this.username}. Did you give ${this.username} access in your Reddit App Preferences? ${body.error}. ${body.error_description}. Status code: ${res.statusCode}`)
          )
        } else {
          return reject(
            new Error(`Cannot obtain token for username ${this.username}. ${body.error}. ${body.error_description}. Status code: ${res.statusCode}`)
          )
        }
      })
    })
  }

  _makeRequest (method, url, data, token) {
    return new Promise((resolve, reject) => {
      const opts = {
        url: url,
        method: method,
        headers: {
          authorization: token,
          'user-agent': this.userAgent
        },
        timeout: REQUEST_TIMEOUT
      }

      // Request JSON API response type
      data.api_type = 'json'
      opts.json = true

      if (method === 'GET') {
        opts.url += '?' + querystring.encode(data)
      } else if (method === 'POST') {
        opts.form = data
      } else if (method === 'PATCH' || method === 'PUT' || method === 'DELETE') {
        opts.body = data
      }

      debug(`Making ${method} request to ${url}`)

      get.concat(opts, (err, res, body) => {
        if (err) {
          err.message = `API error: ${err.message}`
          return reject(err)
        }

        debug('Got a response with statusCode: ' + res.statusCode)

        const statusType = Math.floor(res.statusCode / 100)

        if (statusType === 2) {
          return resolve(body)
        } else {
          return reject(
            new Error(`API error: ${body.message}. Status code: ${res.statusCode}`)
          )
        }
      })
    })
  }
}

module.exports = Reddit

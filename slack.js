var request = require('pr-request')
var WebSocket = require('ws')
var querystring = require('querystring')
var inherits = require('util').inherits
var Channel = require('./channel')
require('polyfill-promise')


inherits(SlackChannel, Channel)
function SlackChannel(token, channel) {
  if (!(this instanceof SlackChannel)) {
    return new SlackChannel(token, channel)
  }
  Channel.call(this, {
    token: token,
    channel: channel
  })
  this.opts.messageId = 0
}

SlackChannel.prototype.connect = function () {
  var self = this
  return new Promise(function (resolve, reject) {
    login(self.opts.token).then(function (session) {
      self.opts.channelId = session.channels.filter(function (chan) {
        return chan.name === self.opts.channel
      })[0].id
      self.opts.users = session.users

      var socket = new WebSocket(session.url)
      socket.once('open', function () {
        self.opts.socket = socket
        resolve()
      })
      socket.once('error', reject)

      socket.on('message', function (raw) {
        var message = JSON.parse(raw)
        console.log('message', message)
        if (message.type === 'message' &&
          message.channel === self.opts.channelId) {
          self.message(self.getUserById(message.user), message.text)
        }
      })
    })
    .catch(reject)
  })
}

SlackChannel.prototype.format = function (message) {
  return '*' + message.user + '*  ' + message.text
}

SlackChannel.prototype.send = function (text) {
  var self = this
  self.connected.then(function () {
    self.opts.socket.send(JSON.stringify({
      id: self.opts.messageId++,
      type: 'message',
      channel: self.opts.channelId,
      text: text
    }))
  })
}

SlackChannel.prototype.getUserById = function (userId) {
  var user = this.opts.users.filter(function (user) {
    return user.id === userId
  })[0]
  if (!user) { return 'unknown'}
  return user.name
}

function login (token) {
  var body = querystring.stringify({
    token: token,
    agent: 'node-slack'
  })
  return request({
    url: 'https://api.slack.com/api/users.login',
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      'content-length': body.length
    },
    body: body
  })
  .then(function (res) {
    var data = JSON.parse(res.body)
    return data
  })
}

module.exports = SlackChannel
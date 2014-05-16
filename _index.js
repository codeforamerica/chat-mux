
var request = require('pr-request')
var WebSocket = require('ws')
var querystring = require('querystring')
require('polyfill-promise')



var irc = require('./irc')

var TOKEN = process.env.TOKEN
var SLACK_CHANNEL = process.env.CHANNEL
var IRC_CHANNEL = process.env.IRC_CHANNEL

var mid = 0

function login () {
  var body = querystring.stringify({
    token: TOKEN,
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


function connect (url) {
  return new Promise(function (resolve) {
    var socket = new WebSocket(url)

    socket.on('open', function () {
      resolve(socket)
    })

  })
}

var users = []

login(process.env.TOKEN)
  .then(function (session) {
    var chan = session.channels.filter(function (chan) {
      return chan.name === SLACK_CHANNEL
    })[0]

    users = session.users
    
    return connect(session.url).then(function (chat) {
      chat.chan = chan.id

      chat.on('message', function (raw) {
        var message = JSON.parse(raw)
        console.log(message)
        // console.log(message.type, message.channel)
        if (message.type === 'message' &&
          message.channel === chan.id) {
          chat.emit('txt', message)
        }
      })

      return chat
    })      
  })
  .then(function (slack) {

    slack.spew = function (text) {
      var reply = JSON.stringify({
        id: mid++,
        type: 'message',
        channel: slack.chan,
        text: text
      })
      slack.send(reply)
    }

    irc.on('txt', function (e) {
      slack.spew(formatForSlack(e))
    })

    slack.on('txt', function (e) {
      // var formatted = format({from: 'foo', text: message.text})
      irc.spew(formatForIrc(e))
      // console.log(message)
      // var reply = JSON.stringify({
      //   id: mid++,
      //   type: 'message',
      //   channel: chat.chan,
      //   text: '*tacos*  '+Date.now()+'!'
      // })
      // console.log('reply'. reply)
      // chat.send(reply)
    })
  })



function formatForSlack(e) {
  return '*'+e.user+'*  ' + e.text
}

function formatForIrc(e) {
  return getSlackUser(e.user) + ']  ' + e.text
}

function getSlackUser(userId) {
  var user = users.filter(function (user) {
    return user.id === userId
  })[0]
  if (!user) { return 'unknown'}
  return user.name
}
var irc = require('irc')
var inherits = require('util').inherits
var Channel = require('./channel')
require('polyfill-promise')

inherits(IrcChannel, Channel)
function IrcChannel(nick, channel, server) {
  if (!(this instanceof IrcChannel)) {
    return new IrcChannel(nick, channel, server)
  }
  Channel.call(this, {
    nick: nick,
    channel: channel,
    server: server
  })
}

IrcChannel.prototype.connect = function () {
  var self = this
  return new Promise(function (resolve, reject) {
    var client = self.opts.client = new irc.Client(self.opts.server, self.opts.nick, {
      channels: [self.opts.channel]
    })
    
    // client.on('raw', console.log)
    
    client.once('error', reject)

    client.once('join', function (channel) {
      if (channel === self.opts.channel) {
        setTimeout(function () {
          // magic timeout to finish joining channel
          self.send('anything you type will be cross posted in slack')
          resolve()
        }, 500)
        
      }
    })

    client.on('message', function (user, channel, text) {
      self.message(user, text)
    })
  })
}

IrcChannel.prototype.format = function (message) {
  return message.user + ']  ' + message.text
}

IrcChannel.prototype.send = function (text) {
  var self = this
  self.connected.then(function () {
    self.opts.client.say(self.opts.channel, text)
  })
  return this
}

module.exports = IrcChannel

// var IRC_CHANNEL = process.env.IRC_CHANNEL


// var irc = new irc.Client('irc.freenode.net', 'taco_portal', {
//   channels: [IRC_CHANNEL]
// })


// var connected = false

// irc.once('registered', function () {
//   console.log('connected to irc')
//   connected = true
// })

// irc.on('message', function (from, to, message) {
//   console.log(from, to, message)

//   irc.emit('txt', {
//     user: from,
//     text: message
//   })
//   console.log('irc:', arguments)
//   // irc.say(to, message.split('').reverse().join(''))
// })

// irc.spew = function (text) {
//   if (connected) {
//     irc.say(IRC_CHANNEL, text)
//   }
// }

// module.exports = irc
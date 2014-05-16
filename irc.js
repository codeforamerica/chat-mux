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
    
    client.once('error', reject)

    client.once('join', function (channel) {
      if (channel === self.opts.channel) {
        setTimeout(function () {
          // magic timeout to finish joining channel
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
var irc = require('irc')

var IRC_CHANNEL = process.env.IRC_CHANNEL

var irc = new irc.Client('irc.freenode.net', 'taco_portal', {
  channels: [IRC_CHANNEL]
})


var connected = false

irc.once('registered', function () {
  console.log('connected to irc')
  connected = true
})

irc.on('message', function (from, to, message) {
  console.log(from, to, message)

  irc.emit('txt', {
    user: from,
    text: message
  })
  console.log('irc:', arguments)
  // irc.say(to, message.split('').reverse().join(''))
})

irc.spew = function (text) {
  if (connected) {
    irc.say(IRC_CHANNEL, text)
  }
}

module.exports = irc
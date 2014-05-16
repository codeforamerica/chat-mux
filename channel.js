var DuplexStream = require('stream').Duplex
var inherits = require('util').inherits

inherits(Channel, DuplexStream)
function Channel (opts) {
  if (!(this instanceof Channel)) {
    return new Channel(opts)
  }
  DuplexStream.call(this, {objectMode: true})

  this.opts = opts
  this.connected = this.connect()
  var self = this
  this.connected.then(function () {
          self.emit('connected')
  })
}

Channel.prototype.message = function (user, text) {
  this.push({
    user: user,
    text: text
  })
}

Channel.prototype.format = function (message) {
  return message.user + ':  ' + message.text
}

Channel.prototype._read = function (){}
Channel.prototype._write = function (message, encoding, cb) {
  if (typeof message === 'string') {
    this.send(message) 
  } else {
    this.send(this.format(message))
  }
  cb()
}

module.exports = Channel
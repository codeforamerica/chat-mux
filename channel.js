function Channel () {
  if (!(this instanceof Channel)) {
    return new Channel
  }
  
}

Channel.prototype.format = function (message) {
  return message.user + ':  ' + message.text
}

module.exports = Channel
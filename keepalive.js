var http = require('http')

var port = process.env.PORT || 2323
var url = process.env.URL || 'localhost:'+port

module.exports = function () {
  http.createServer(function (req, res) {
    res.end('ok')
  }).listen(port, function (err) {
    if (!err) {
      console.log('keepalive listening ' + port)
    }

    setInterval(function () {
      http.request(url)
    }, 10 * 60 * 1000)
  })  
}

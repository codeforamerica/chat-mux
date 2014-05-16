var slack = require('./slack')(process.env.SLACK_TOKEN, process.env.SLACK_CHANNEL)
var irc = require('./irc')(process.env.IRC_NICK, process.env.IRC_CHANNEL)

slack.pipe(irc).pipe(slack)

slack.on('connected', function () { console.log('slack connected')})
irc.on('connected', function () { console.log('irc connected')})

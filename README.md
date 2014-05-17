chat-mux
========

multiplex and portalify all of your millions of chat channels

we use this to proxy communications between #codeforamerica on irc.freenode.net and another
chat system which lots of CfAians use.


## installation
requires: node.js, a server with websocket support (heroku works)

```
git clone https://github.com/codeforamerica/chat-mux.git && cd chat-mux && npm install && npm start
```

you also need some environment variables set: see `env.sample` for a shell script you can use, or use whatever other means of setting up your environment (like `heroku config:set foo=bar` for example)

## contributing
pull requests welcome!


## license
(c) Code for America 2014. ISC license.

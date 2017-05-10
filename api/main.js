const path = require('path')
const express = require('express')
const http = require('http')
const url = require('url')
const WebSocket = require('ws')
const _ = require('lodash')

const ROOT = path.dirname(__dirname)
const DIST_DIR = path.join(ROOT, "dist")
const CLIENT_DIR = path.join(ROOT, "client")
const INDEX_HTML = path.join(CLIENT_DIR, "index.html")
const DEFAULT_PORT = 3000
const PORT = process.env.PORT || DEFAULT_PORT

const webpackDevMiddleware = require("webpack-dev-middleware")
const webpack = require("webpack")
const webpackConfig = require(path.join(ROOT, "webpack.config"))
const compiler = webpack(webpackConfig)

const app = express()
const server = http.createServer(app)
const sessionParser = require('./boot/session')
const wss = new WebSocket.Server({ server })

var DB = require('./boot/database')

var users = []

app.use(sessionParser)
app.use(webpackDevMiddleware(compiler, {
  publicPath: '/'
}))

app.get('/', function root(req, res) {
  req.session.working = 'yes!'
  res.sendFile(INDEX_HTML)
})

wss.broadcast = function broadcast(data) {
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data)
    }
  })
}

wss.broadcastExcept = function broadcastExcept(ws, data) {
  wss.clients.forEach(function each(client) {
    if (client !== ws && client.readyState === WebSocket.OPEN) {
      client.send(data)
    }
  })
}

wss.on('connection', function connection(ws) {
  const location = url.parse(ws.upgradeReq.url, true)
  const id = (_(users).last() || 0) + 1
  users.push(id)
  var connectionMessage = `user ${id} joined (${users.length} connected: ${users.join(", ")})`
  console.log(connectionMessage)
  wss.broadcastExcept(ws, connectionMessage)
  ws.send(`hello user ${id} :) (${users.length} connected: ${users.join(", ")})`)

  sessionParser(ws.upgradeReq, {}, function(){
    var sess = ws.upgradeReq.session
    console.log("working = " + sess.working)
  })

  ws.on('message', function incoming(msg) {
    var message = `${id} says: ${msg}`
    console.log(message)
    wss.broadcastExcept(ws, message)
  })
  ws.on('close', function disconnection() {
    _.remove(users, _.partial(_.eq, id))
    var disconnectionMessage = `user ${id} disconnected (${users.length} user(s) remain: ${users.join(", ")})`
    console.log(disconnectionMessage)
    wss.broadcastExcept(ws, disconnectionMessage)
  })
})

server.listen(PORT, function listening() {
  console.log(`listening on *:${PORT}`)
})

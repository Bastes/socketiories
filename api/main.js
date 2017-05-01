const path = require('path')
const express = require('express')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const _ = require('lodash')

const ROOT = path.dirname(__dirname)
const DIST_DIR = path.join(ROOT, "dist")
const CLIENT_DIR = path.join(ROOT, "client")
const INDEX_HTML = path.join(CLIENT_DIR, "index.html")
const DEFAULT_PORT = 3000
const PORT = process.env.PORT || DEFAULT_PORT

var users = []

app.use(express.static(DIST_DIR));

app.get('/', function (req, res) {
  res.sendFile(INDEX_HTML)
})

io.on('connection', function (socket) {
  var id = (_(users).last() || 0) + 1
  users.push(id)
  var connectionMessage = `user ${id} connected, ${users.length} connected`
  console.log(connectionMessage)
  socket.broadcast.emit('user enters', connectionMessage)
  socket.on('chat message', function (msg) {
    var message = `${id} says: ${msg}`
    console.log(message)
    io.emit('chat message', message)
  })
  socket.on('disconnect', function () {
    _.remove(users, _.partial(_.eq, id))
    var disconnectionMessage = `user ${id} disconnected, ${users.length} user(s) remain`
    console.log(disconnectionMessage)
    io.emit('user leaves', disconnectionMessage)
  })
})

http.listen(PORT, function () {
  console.log(`listening on *:${PORT}`)
})

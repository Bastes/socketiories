const path = require('path')
const app = require('express')()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const _ = require('lodash')

const ROOT = path.dirname(__dirname)
const DEFAULT_PORT = 3000
const PORT = process.env.PORT || DEFAULT_PORT

var users = []

app.get('/', function (req, res) {
  res.sendFile(ROOT + '/client/index.html')
})

app.get('/index.js', function (req, res) {
  res.sendFile(ROOT + '/client/index.js')
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

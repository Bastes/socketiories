var app = require('express')()
var http = require('http').Server(app)
var io = require('socket.io')(http)
var _ = require('lodash')
var users = []

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html')
})

io.on('connection', function (socket) {
  var id = (_(users).last() || 0) + 1
  users.push(id)
  var connectionMessage = `user ${id} connected, ${users.length} connected`
  console.log(connectionMessage)
  io.emit('user enters', connectionMessage)
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

http.listen(3000, function () {
  console.log('listening on *:3000')
})

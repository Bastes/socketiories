require('./chat.styl');

var Elm = require('./index.elm');
var mountNode = document.getElementById('main');
var app = Elm.Index.embed(mountNode);

var socket = io();

[
  'user enters',
  'chat message',
  'user leaves'
].forEach(function (msgType) {
  socket.on(msgType, function (msg) {
    app.ports.received.send(msg);
  })
});

app.ports.sending.subscribe(function (msg) {
  socket.emit('chat message', msg);
});

const path = require('path');
const express = require('express');
const http = require('http');
const _ = require('lodash');

const ROOT = path.dirname(__dirname);
const INDEX_HTML = path.join(ROOT, "client", "index.html");
const PORT = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app);

const sessionParser = require('./boot/session');
const wss = require('./boot/websocket')(server);
const DB = require('./boot/database');

console.log(`starting in ${process.env.NODE_ENV} mode`)

var users = [];

app.use(sessionParser);

require('./boot/environments')(process, app, express);

app.get('/', function root(req, res) {
  res.sendFile(INDEX_HTML);
});

wss.on('connection', function connection(ws) {
  const id = (_(users).last() || 0) + 1;
  users.push(id);
  var connectionMessage = `user ${id} joined (${users.length} connected: ${users.join(", ")})`;
  console.log(connectionMessage);
  wss.broadcastExcept(ws, connectionMessage);
  ws.send(`hello user ${id} :) (${users.length} connected: ${users.join(", ")})`);

  ws.on('message', function incoming(msg) {
    var message = `${id} says: ${msg}`;
    console.log(message);
    wss.broadcastExcept(ws, message);
  });
  ws.on('close', function disconnection() {
    _.remove(users, _.partial(_.eq, id));
    var disconnectionMessage = `user ${id} disconnected (${users.length} user(s) remain: ${users.join(", ")})`;
    console.log(disconnectionMessage);
    wss.broadcastExcept(ws, disconnectionMessage);
  });
});

server.listen(PORT, function listening() {
  console.log(`listening on *:${PORT}`);
});

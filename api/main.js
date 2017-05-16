const path = require('path');
const _ = require('lodash');

const ROOT = path.dirname(__dirname);
const INDEX_HTML = path.join(ROOT, "client", "index.html");
const LOGIN_HTML = path.join(ROOT, "client", "login.html");

require('./boot/app')(function (app, wss, DB, sessionUser) {
  app.get('/', function root(req, res) {
    if (!req.user) res.redirect('/login');
    res.sendFile(INDEX_HTML);
  });

  app.get('/login', function(req, res) {
    if (req.user) res.redirect('/');
    res.sendFile(LOGIN_HTML);
  });

  app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
  });

  wss.on('connection', function connection(ws) {
    sessionUser(ws, function (err, user) {
      if (err) return console.log(err);
      console.log("user:", user);
      var id = "whatever";
      var connectionMessage = `user ${id} joined`;
      console.log(connectionMessage);
      wss.broadcastExcept(ws, connectionMessage);
      ws.send(`hello ${id} :)`);

      ws.on('message', function incoming(msg) {
        var message = `${id} says: ${msg}`;
        console.log(message);
        wss.broadcastExcept(ws, message);
      });

      ws.on('close', function disconnection() {
        var disconnectionMessage = `user ${id} disconnected`;
        console.log(disconnectionMessage);
        wss.broadcastExcept(ws, disconnectionMessage);
      });
    });
  });
});

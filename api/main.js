const path = require('path');
const _ = require('lodash');

const ROOT = path.dirname(__dirname);
const INDEX_HTML = path.join(ROOT, "client", "index.html");
const LOGIN_HTML = path.join(ROOT, "client", "login.html");

const WHISPER_MATCHER = /^\s*(.+?)\s*:\s*(.+?)\s*$/m
const NAME_MATCHES = _.partial(_.partial, function (name, ows) { return ows.user.displayName == name; });

require('./boot/app')(function (app, wss, DB, sessionUser) {
  app.get('/', function root(req, res) {
    if (!req.user) return res.redirect('/login');
    res.sendFile(INDEX_HTML);
  });

  app.get('/login', function(req, res) {
    if (req.user) return res.redirect('/');
    res.sendFile(LOGIN_HTML);
  });

  app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
  });

  wss.on('connection', function connection(ws) {
    sessionUser(ws, function (err, user) {
      if (err) return console.log(err);
      ws.user = user;
      var connectionMessage = `user ${user.displayName} joined`;
      console.log(connectionMessage);
      wss.broadcastExcept(ws, connectionMessage);
      ws.send(`hello ${user.displayName} :)`);

      ws.on('message', function incoming(msg) {
        var matches = msg.match(WHISPER_MATCHER)
        if (matches) {
          var recipient = matches[1];
          var nameMatches = NAME_MATCHES(recipient);
          if (wss.anyOnline(nameMatches)) {
            var whisper = matches[2];
            var message = `${user.displayName} whispers: ${whisper}`;
            console.log(`${user.displayName} whispers to ${recipient}: ${whisper}`);
            return wss.sendTo(nameMatches, message);
          }
        }
        var message = `${user.displayName} says: ${msg}`;
        console.log(message);
        wss.broadcastExcept(ws, message);
      });

      ws.on('close', function disconnection() {
        var disconnectionMessage = `user ${user.displayName} disconnected`;
        console.log(disconnectionMessage);
        wss.broadcastExcept(ws, disconnectionMessage);
      });
    });
  });
});

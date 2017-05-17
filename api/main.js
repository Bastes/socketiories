const path = require('path');
const _ = require('lodash');

const ROOT = path.dirname(__dirname);
const INDEX_HTML = path.join(ROOT, "client", "index.html");
const LOGIN_HTML = path.join(ROOT, "client", "login.html");

function Player(user) {
  this._id = user._id;
  this.name = user.displayName;
};

function Game() {
  this.players = [];
};

var game = new Game();

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

      ws.on('message', function onMessage(msg) {
        if (msg == 'game:status') {
          ws.send(JSON.stringify(game));
        }
        if (msg == 'game:join') {
          if (!_(game.players).some(function (player) { return player._id === ws.user._id; }))
            game.players.push(new Player(ws.user));
          ws.send(JSON.stringify(game));
        }
      });
    });
  });
});

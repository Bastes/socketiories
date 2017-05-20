const path = require('path');
const _ = require('lodash');

const ROOT = path.dirname(__dirname);
const INDEX_HTML = path.join(ROOT, "client", "index.html");
const LOGIN_HTML = path.join(ROOT, "client", "login.html");

const Game = require('./model/game');
const Player = require('./model/player');

var game = new Game();

function idify(user) { return user._id.toString(); };

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
        console.log('message:', msg);
        if (msg == 'game:status') {
          ws.send(JSON.stringify(game.playerPOV(idify(user._id))));
        }
        if (msg == 'game:join') {
          var myId = idify(ws.user);
          if (!_(game.players).some(function (player) { return player.id === myId; }))
            game.players.push(new Player(idify(ws.user), user.displayName));
          wss.broadcastWithStencil(function (client) {
            return JSON.stringify(game.playerPOV(idify(client.user)));
          });
        }
        var kickPattern = /^game:kick:(.+)$/;
        var kickMatch = msg.match(kickPattern);
        if (kickMatch) {
          var kickId = kickMatch[1];
          if (_(game.players).some(function (player) { return player.id === kickId; }))
            game.players = _.filter(game.players, function (player) { return player.id !== kickId; });
          wss.broadcastWithStencil(function (client) {
            return JSON.stringify(game.playerPOV(idify(client.user)));
          });
        }
      });
    });
  });
});

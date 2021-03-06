const path = require('path');
const _ = require('lodash');

const ROOT = path.dirname(__dirname);
const INDEX_HTML = path.join(ROOT, "client", "index.html");
const LOGIN_HTML = path.join(ROOT, "client", "login.html");

const Game = require('./model/game');
const Player = require('./model/player');

var game = new Game();

function idify(user) { return user._id.toString(); };

function userPOV(user) {
  return JSON.stringify(game.playerPOV(idify(user)));
};

function clientPOV(client) {
  return userPOV(client.user);
};

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
        if (msg == 'game:status')
          return ws.send(userPOV(user));
        if (msg == 'game:join') {
          game.addPlayer(new Player(idify(user), user.displayName));
          ws.send(JSON.stringify({ id: idify(user) }));
          return wss.broadcastWithStencil(clientPOV);
        }
        var kickPattern = /^game:kick:(.+)$/;
        var kickMatch = msg.match(kickPattern);
        if (kickMatch) {
          game.removePlayer(kickMatch[1]);
          return wss.broadcastWithStencil(clientPOV);
        }
        var playPattern = /^game:play:([FS])$/;
        var playMatch = msg.match(playPattern);
        if (playMatch) {
          game.play(idify(user), playMatch[1]);
          return wss.broadcastWithStencil(clientPOV);
        }
        var bidPattern = /^game:bid:(\d+)$/;
        var bidMatch = msg.match(bidPattern);
        if (bidMatch) {
          game.placeBid(idify(user), _.parseInt(bidMatch[1]));
          return wss.broadcastWithStencil(clientPOV);
        }
        return console.log("invalid message:", msg);
      });
    });
  });
});

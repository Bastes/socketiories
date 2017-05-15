const path = require('path');
const express = require('express');
const cookie = require('cookie');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const http = require('http');
const _ = require('lodash');

const ROOT = path.dirname(__dirname);
const INDEX_HTML = path.join(ROOT, "client", "index.html");
const LOGIN_HTML = path.join(ROOT, "client", "login.html");
const PORT = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app);


console.log(`starting in ${process.env.NODE_ENV} mode`)

const wss = require('./boot/websocket')(server);
const DB = require('./boot/database');
const session = require('./boot/session')();
const sessionParser = session[0];
const sessionStore = session[1];
const passport = require('./boot/passport')(DB);

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(sessionParser);

require('./boot/environments')(process, app, express);

app.use(passport.initialize());
app.use(passport.session());

app.get('/auth/google', passport.authenticate('google', {
  session: true,
  scope: [
    'https://www.googleapis.com/auth/plus.login',
    'https://www.googleapis.com/auth/plus.profile.emails.read'
  ]
}));

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) { res.redirect('/'); });

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

function findUser(googleId, done) {
  DB.getInstance(function(db) {
    db.collection("users").findOne({ googleId: googleId }, done);
  });
};

function sessionUser(ws, done) {
  var cookies = cookie.parse(ws.upgradeReq.headers.cookie);
  var sid = cookieParser.signedCookie(cookies["connect.sid"], 'secret');
  sessionStore.get(sid, function (err, session) {
    if (err) return done(err);
    findUser(session.passport.user, done);
  });
};

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

server.listen(PORT, function listening() {
  console.log(`listening on *:${PORT}`);
});

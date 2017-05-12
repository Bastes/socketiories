const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser')();
const cookieSession = require('cookie-session');
const bodyParser = require('body-parser');
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

app.use(cookieParser);
app.use(cookieSession({
  name: 'session',
  secret: 'secret',
  maxAge: 1 * 60 * 60 * 1000
}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(sessionParser);

require('./boot/environments')(process, app, express);

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

const GoogleStrategyConfig = {
  clientID: process.env.GOOGLE_OAUTH2_CLIENT_ID,
  clientSecret: process.env.GOOGLE_OAUTH2_CLIENT_SECRET,
  callbackURL: "/auth/google/callback"
};
const GoogleStrategyCallback = function(accessToken, refreshToken, profile, done) {
  DB.getInstance(function(db) {
    db.collection("users").update(
        { googleId: profile.id },
        { $setOnInsert: { googleId: profile.id },
          $set: { emails: profile.emails }
        },
        { upsert: true },
        function (err, maybeUser) {
          if (err) return done(err);
          db.collection("users").findOne({ googleId: profile.id }, done);
        });
  });
};

passport.use(new GoogleStrategy(GoogleStrategyConfig, GoogleStrategyCallback));

passport.serializeUser(function(user, done) {
    done(null, user.googleId);
});

passport.deserializeUser(function(user, done) {
  DB.getInstance(function(db) {
    db.collection("users").findOne({ googleId: user }, done);
  })
});

app.use(passport.initialize());
app.use(passport.session());

app.get('/', function root(req, res) {
  console.log("user: ", req.user);
  res.sendFile(INDEX_HTML);
});

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

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

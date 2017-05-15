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

const session = require('express-session');
const redis = require('redis');
const RedisStore = require('connect-redis')(session);
const redisClient = redis.createClient({ url: process.env.REDISCLOUD_URL });

const sessionStore = new RedisStore({ client: redisClient });
const sessionParser = session({
  store: sessionStore,
  secret: 'secret',
  resave: true,
  saveUninitialized: true
});

const wss = require('./boot/websocket')(server);
const DB = require('./boot/database');

console.log(`starting in ${process.env.NODE_ENV} mode`)

app.use(cookieParser());
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
  var cookies = cookie.parse(ws.upgradeReq.headers.cookie);
  var sid = cookieParser.signedCookie(cookies["connect.sid"], 'secret');
  sessionStore.get(sid, function (err, ss) {
    const user = ss.passport.user;
    console.log("user:", user);

    id = "whatever";
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

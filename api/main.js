const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const _ = require('lodash');

const ROOT = path.dirname(__dirname);
const INDEX_HTML = path.join(ROOT, "client", "index.html");
const LOGIN_HTML = path.join(ROOT, "client", "login.html");

require('./boot/app')(function (app, wss, express, DB) {
  const session = require('./boot/session')();
  const sessionParser = session[0];
  const sessionStore = session[1];
  const passport = require('./boot/passport')(DB);

  const sessionUser = require('./lib/session-user')(sessionStore, cookieParser, DB);

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

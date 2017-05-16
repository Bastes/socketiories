module.exports = function (callback) {
  console.log(`starting in ${process.env.NODE_ENV} mode`);

  const PORT = process.env.PORT || 3000;
  const http = require('http');
  const express = require('express');
  const app = express();
  const server = http.createServer(app);

  const wss = require('./websocket')(server);
  const DB = require('./database');
  const session = require('./session')();
  const sessionParser = session[0];
  const sessionStore = session[1];
  const passport = require('./passport')(DB);
  const cookieParser = require('cookie-parser');
  const bodyParser = require('body-parser');

  app.use(cookieParser());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(sessionParser);

  const sessionUser = require('../lib/session-user')(sessionStore, cookieParser, DB);

  require('./environments')(process, app, express);

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

  callback(app, wss, DB, sessionUser);

  server.listen(PORT, function listening() {
    console.log(`listening on *:${PORT}`);
  });
};

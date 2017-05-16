module.exports = function (app, DB) {
  const cookieParser = require('cookie-parser');
  const bodyParser = require('body-parser');
  const session = require('./session')();
  const sessionParser = session[0];
  const sessionStore = session[1];
  const passport = require('passport');
  const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

  const sessionUser = require('../lib/session-user')(sessionStore, cookieParser, DB);

  const GoogleStrategyConfig = {
    clientID: process.env.GOOGLE_OAUTH2_CLIENT_ID,
    clientSecret: process.env.GOOGLE_OAUTH2_CLIENT_SECRET,
    callbackURL: `${process.env.SERVER_DOMAIN || ''}/auth/google/callback`
  };

  const GoogleStrategyCallback = function (accessToken, refreshToken, profile, done) {
    DB.getInstance(function(db) {
      db.collection("users").update(
          { googleId: profile.id },
          { $setOnInsert: { googleId: profile.id },
            $set: {
              displayName: profile.displayName,
              photos: profile.photos,
              emails: profile.emails
            }
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

  passport.deserializeUser(DB.findUser);

  app.use(cookieParser());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(sessionParser);

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

  return sessionUser;
};

module.exports = function (DB) {
  const passport = require('passport');
  const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

  const GoogleStrategyConfig = {
    clientID: process.env.GOOGLE_OAUTH2_CLIENT_ID,
    clientSecret: process.env.GOOGLE_OAUTH2_CLIENT_SECRET,
    callbackURL: `${process.env.SERVER_DOMAIN || ''}/auth/google/callback`
  };
  const GoogleStrategyCallback = function(accessToken, refreshToken, profile, done) {
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

  return passport;
};

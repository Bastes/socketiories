const cookie = require('cookie');

module.exports = function (sessionStore, cookieParser, DB) {
  return function sessionUser(ws, done) {
    var cookies = cookie.parse(ws.upgradeReq.headers.cookie);
    var sid = cookieParser.signedCookie(cookies["connect.sid"], 'secret');
    sessionStore.get(sid, function (err, session) {
      if (err) return done(err);
      DB.findUser(session.passport.user, done);
    });
  };
};

module.exports = function() {
  const session = require('express-session');
  const redis = require('redis');
  const redisClient = redis.createClient({ url: process.env.REDISCLOUD_URL });
  const RedisStore = require('connect-redis')(session);
  const sessionStore = new RedisStore({ client: redisClient });
  const sessionParser = session({
    store: sessionStore,
    secret: 'secret',
    resave: true,
    saveUninitialized: true
  });

  return [sessionParser, sessionStore];
};

const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const redisConfig = { url: process.env.REDISCLOUD_URL };

module.exports = session({
  store: new RedisStore(redisConfig),
  secret: 'secret',
  resave: true,
  saveUninitialized: true
});

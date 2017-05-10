const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const redisConfig = {
  host: 'localhost',
  port: 6379
};
module.exports = session({
  store: new RedisStore(redisConfig),
  secret: 'secret',
  resave: true,
  saveUninitialized: true
});

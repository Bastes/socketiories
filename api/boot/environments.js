module.exports = function (process, app, express) {
  if (process.env.NODE_ENV === 'development') {
    const proxy = require('proxy-middleware');
    const url = require('url')
    app.use('/assets', proxy(url.parse('http://localhost:8080/assets')));
  }

  if (process.env.NODE_ENV === 'production') {
    app.use('/assets', express.static('dist'));
  }
};

module.exports = function (callback) {
  console.log(`starting in ${process.env.NODE_ENV} mode`);

  const PORT = process.env.PORT || 3000;
  const http = require('http');
  const express = require('express');
  const app = express();
  const server = http.createServer(app);

  const wss = require('./websocket')(server);
  const DB = require('./database');

  callback(app, wss, express, DB);

  server.listen(PORT, function listening() {
    console.log(`listening on *:${PORT}`);
  });
};

module.exports = function (callback) {
  console.log(`starting in ${process.env.NODE_ENV} mode`);

  const PORT = process.env.PORT || 3000;
  const http = require('http');
  const express = require('express');
  const app = express();
  const server = http.createServer(app);

  callback(app, express, server);

  server.listen(PORT, function listening() {
    console.log(`listening on *:${PORT}`);
  });
};

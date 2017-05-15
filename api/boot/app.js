module.exports = function () {
  const http = require('http');
  const express = require('express');
  const app = express();
  const server = http.createServer(app);

  return [
    app,
    express,
    server
  ];
};

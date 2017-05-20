const WebSocket = require('ws');

module.exports = function (server) {
  var wss = new WebSocket.Server({ server });

  wss.broadcast = function broadcast(data) {
    wss.clients.forEach(function each(client) {
      if (client.readyState !== WebSocket.OPEN) return;
      client.send(data);
    });
  };

  wss.broadcastWithStencil = function broadcastWithStencil(stencil) {
    wss.clients.forEach(function each(client) {
      if (client.readyState !== WebSocket.OPEN) return;
      client.send(stencil(client));
    });
  };

  wss.broadcastExcept = function broadcastExcept(ws, data) {
    wss.clients.forEach(function each(client) {
      if (client === ws || client.readyState !== WebSocket.OPEN) return;
      client.send(data);
    });
  };

  wss.sendTo = function sendTo(filter, data) {
    wss.clients.forEach(function each(client) {
      if (client.readyState !== WebSocket.OPEN || !filter(client)) return;
      client.send(data);
    });
  };

  wss.anyOnline = function anyOnline(filter) {
    var result = false;
    wss.clients.forEach(function each(client) {
      result = result || (client.readyState === WebSocket.OPEN && filter(client));
    });
    return result;
  };

  return wss;
}

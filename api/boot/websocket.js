const WebSocket = require('ws');

module.exports = function (server) {
  var wss = new WebSocket.Server({ server });

  wss.broadcast = function broadcast(data) {
    wss.clients.forEach(function each(client) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data)
      }
    })
  };

  wss.broadcastExcept = function broadcastExcept(ws, data) {
    wss.clients.forEach(function each(client) {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(data)
      }
    })
  };

  return wss;
}

require('./chat.styl');

var Elm = require('./chat.elm');
var app = Elm.Chat.fullscreen({ websocketUrl: "ws://localhost:3000" });

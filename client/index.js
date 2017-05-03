require('./chat.styl');

var Elm = require('./index.elm');
var app = Elm.Index.fullscreen({ websocketUrl: "ws://localhost:3000" });

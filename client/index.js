require('./chat.styl');

var Elm = require('./chat.elm');
var app = Elm.Chat.fullscreen({
  websocketUrl: window.location.href.replace(/^http:/, 'ws:')
});

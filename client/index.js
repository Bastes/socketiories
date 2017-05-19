require('./game.styl');

var Elm = require('./Game.elm');
var app = Elm.Game.fullscreen({
  websocketUrl: window.location.href.replace(/^http(s?):(\/\/[^\/]+).*/, 'ws$1://$2')
});

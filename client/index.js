require('./chat.styl');

var Elm = require('./index.elm');
var mountNode = document.getElementById('main');
var app = Elm.Index.embed(mountNode);

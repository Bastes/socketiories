const _ = require('lodash');

function Game() {
  this.players = [];
};

function obfuscateCards(cards) { return cards.replace(/./g, "H"); };

function displayCards(cards) { return cards; };

Game.prototype.playerPOV = function playerPOV(playerId) {
  return _
    .chain(this)
    .cloneDeep()
    .assign({
      players: _.map(this.players, function (p) { return p.playerPOV(playerId); })
    })
    .value();
};

module.exports = Game;

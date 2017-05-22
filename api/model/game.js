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

Game.prototype.addPlayer = function addPlayer(newPlayer) {
  if (_(this.players).some(function (player) { return player.id === newPlayer.id; }))
    return;
  this.players.push(newPlayer);
  return true;
};

Game.prototype.removePlayer = function removePlayer(id) {
  if (!_(this.players).some(function (player) { return player.id === id; }))
    return;
  this.players = _.filter(this.players, function (player) { return player.id !== id; });
  return true;
};

module.exports = Game;

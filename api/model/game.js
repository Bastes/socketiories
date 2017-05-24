const _ = require('lodash');

function Game() {
  this.players = [];
};

function obfuscateCards(cards) { return cards.replace(/./g, "H"); };

function displayCards(cards) { return cards; };

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

Game.prototype.play = function play(id, card) {
  var currentPlayer = this.players[0];
  if (currentPlayer.id != id) return;
  if (! currentPlayer.play(card)) return;
  this.players.push(this.players.shift());
  return true;
};

Game.prototype.placeBid = function placeBid(id, bid) {
  var currentPlayer = this.players[0];
  if (currentPlayer.id != id) return;
  if (this.anyBetterBid(bid)) return;
  if (this.impossibleBid(bid)) return;
  if (! currentPlayer.placeBid(bid)) return;
  this.players.push(this.players.shift());
  return true;
};

Game.prototype.anyBetterBid = function anyBetterBid(bid) {
  return _.some(this.players, function (player) { return player.bid >= bid; });
};

Game.prototype.impossibleBid = function impossibleBid(bid) {
  var maxBid = _
    .chain(this.players)
    .map('cards.pile.length')
    .sum()
    .value();
  return bid > maxBid;
};

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

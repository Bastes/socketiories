const _ = require('lodash');

function Player(id, name) {
  this.id = id;
  this.name = name;
  this.bets = 0;
  this.cards =
  { hand: _.shuffle("FFFS".split('')).join('')
  , pile: ""
  , lost: ""
  };
};

function obfuscateCards(cards) { return cards.replace(/./g, "H"); };

function displayCards(cards) { return cards; };

Player.prototype.playerPOV = function playerPOV(playerId) {
  var cardsView = this.id === playerId ? displayCards : obfuscateCards;
  return _
    .chain(this)
    .cloneDeep()
    .assign({ cards: _.mapValues(this.cards, cardsView) })
    .value();
};

module.exports = Player;

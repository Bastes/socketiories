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

function obfuscateCards(cards) { return cards.replace(/./g, "?"); };

function displayCards(cards) { return cards; };

Player.prototype.play = function play(card) {
  cardMatcher = new RegExp(card);
  if (!cardMatcher.test(this.cards.hand))
    return;
  this.cards.hand = this.cards.hand.replace(cardMatcher, '');
  this.cards.pile = this.cards.pile + card;
  return true;
};

Player.prototype.placeBid = function placeBid(bid) {
  if (this.bid == -1) return;
  if (bid <= 0) return;
  this.bid = bid;
  return true;
};

Player.prototype.playerPOV = function playerPOV(playerId) {
  var cardsView = this.id === playerId ? displayCards : obfuscateCards;
  return _
    .chain(this)
    .cloneDeep()
    .assign({ cards: _.mapValues(this.cards, cardsView) })
    .assign({ bid: this.bidJSON() })
    .value();
};

Player.prototype.bidJSON = function bidJSON() {
  if (this.bid == -1) return "fold";
  if (this.bid) return this.bid.toString();
  return "none";
};

module.exports = Player;

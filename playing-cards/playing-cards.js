/**
 * Playing Cards - Code to represent playing cards in JavaScript
 * Written by Blair Mitchelmore (blair DOT mitchelmore AT gmail DOT com)
 * Licensed under the WTFPL (http://sam.zoy.org/wtfpl/).
 * Date: 2009/02/08
 *
 * @author Blair Mitchelmore
 * @version 1.0.2
 *
 **/
 new function() {
  
  var random = function(from, to) {
    if (!to) to = 1;
    var max = from > to ? from : to;
    var min = from === max ? to : from;
    var d = max - min + 1;
    return Math.floor(Math.random() * d + min);
  };
  
  var swap = function(bucket, first, second) {
    var temp = bucket[first];
    bucket[first] = bucket[second];
    bucket[second] = temp;
  };
  
  var guid = 1;
  
  function Card(number) {
    if (typeof number == 'string') return Card.fromString(number);
    number = number || random(52);
    
    var num = number <= 52 ? number : (number - 1) % 52 + 1;
    var suit = Math.floor((num - 1) / 13);
    var card = (num - 1) % 13;
    
    var cards = ['Ace', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'Jack', 'Queen', 'King'];
    var cardsShort = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    var suits = ['Spades', 'Clubs', 'Diamonds', 'Hearts'];
    var suitsShort = ['S', 'C', 'D', 'H'];
    
    var uniqueId = guid++;
    
    return {
      toString: function(shortForm) { 
        return !!shortForm ? [this.card(shortForm), this.suit(shortForm)].join("") : [this.card(), "of", this.suit()].join(" "); 
      },
      uniqueId: function() {
        return uniqueId;
      },
      num: function() {
        return num;
      },
      valueOf: function() {
        return num;
      },
      isEqualTo: function(other, totally) {
        return !!totally ? this.uniqueId() == other.uniqueId() : this.card() == other.card() && this.suit() == other.suit();
      },
      card: function(shortForm) { 
        return !!shortForm ? cardsShort[card] : cards[card]; 
      },
      suit: function(shortForm) { 
        return !!shortForm ? suitsShort[suit] : suits[suit]; 
      }
    };
  }
  
  Card.fromString = function(str) {
    var shortForm = [
      {'A': 0, '2': 1, '3': 2, '4': 3, '5': 4, '6': 5, '7': 6, '8': 7, '9': 8, '10': 9, 'J': 10, 'Q': 11, 'K': 12},
      {'S': 0, 'C': 1, 'D': 2, 'H': 3}
    ];
    var longForm = [
      {'Ace': 0, '2': 1, '3': 2, '4': 3, '5': 4, '6': 5, '7': 6, '8': 7, '9': 8, '10': 9, 'Jack': 10, 'Queen': 11, 'King': 12},
      {'Spades': 0, 'Clubs': 1, 'Diamonds': 2, 'Hearts': 3}
    ];
    
    var number = -1, match = str.match(/^(Ace|1|2|3|4|5|6|7|8|9|10|Jack|Queen|King) of (Spades|Clubs|Diamonds|Hearts)$|^(A|1|2|3|4|5|6|7|8|9|10|J|Q|K)(S|C|D|H)$/);
    if (!match) return null;
    
    if (!!match[1] && !!match[2]) {
      number = longForm[1][match[2]] * 13 + longForm[0][match[1]] + 1;
    } else if (!!match[3] && !!match[4]) {
      number = shortForm[1][match[4]] * 13 + shortForm[0][match[3]] + 1;
    }
    
    return number == -1 ? null : new Card(number);
  };

  function Deck(size) {
    if (typeof size == 'string') return Deck.fromString(size);
    size = size || 52;
    
    if (arguments.length > 1) size = Array.prototype.slice.call(arguments, 0);
    
    var deck = [];
    if (size.constructor == Array)
      for (var i = 0; i < size.length; ++i) deck.push(size[i]);
    else
      for (var i = 1; i <= size; ++i) deck.push(new Card(i));
    
    return {
      toString: function(longForm) {
        var str = [];
        for (var i = 0; i < deck.length; ++i) {
          str.push(deck[i].toString(!longForm));
        }
        return str.join("|");
      },
      isEqualTo: function(other, totally) {
        var test = this.count() == other.count();
        for (var i = 1; test && i <= deck.length; ++i) 
          test = test && this.card(i).isEqualTo(other.card(i), totally);
        return test;
      },
      count: function() {
        return deck.length;
      },
      cards: function(deep) {
        return !!deep ? (function() { 
          var newDeck = [];
          for (var i = 0; i < deck.length; ++i)
            newDeck.push(new Card(deck[i].num()));
          return newDeck;
        })() : Array.prototype.slice.call(deck, 0);
      },
      card: function(num) {
        return num <= deck.length && num >= 1 ? deck[num-1] : null;
      },
      random: function() {
        return deck[random(deck.length)];
      },
      copy: function(deep) {
        return new Deck(this.cards(deep));
      },
      reverse: function() {
        return this.sort(function(a, b) { return a.num() < b.num() });
      },
      sort: function(fn) {
        deck.sort(fn || function(a, b) { return a.num() > b.num() });
        return this;
      },
      knuthShuffle: function(times) {
        if (times === 0) return this;
        times = times || 1;
        for (var time = 0; time < times; ++time) {
          for (var rand, i = deck.length - 1; rand = random(i), i >= 0; --i) {
            swap(deck, rand, i);
          }
        }
        return this;
      },
      shuffle: function() {
        return this.knuthShuffle(random(10,20));
      },
      faroShuffle: function(times, inShuffle) {
        if (times === 0) return this;
        times = times || 1;
        for (var time = 0; time < times; ++time) {
          var newDeck = [];
          for (var n = deck.length, k = Math.ceil(n / 2), i = 0, j = k; i < Math.ceil(n / 2); ++i, ++j) {
            if (!!inShuffle && !!deck[j]) 
              newDeck.push(deck[j]);
            if (!!deck[i])
              newDeck.push(deck[i]);
            if (!inShuffle && !!deck[j])
              newDeck.push(deck[j]);
          }
          deck = newDeck;
        }
        return this;
      },
      inShuffle: function(times) {
        return this.faroShuffle(times, true);
      },
      outShuffle: function(times) {
        return this.faroShuffle(times, false);
      }
    };
  }
  
  Deck.fromString = function(str) {
    str = str || "";
    var cards = [], strs = str.split(/\|/g);
    for (var i = 0; i < strs.length; ++i) {
      cards.push(new Card(strs[i]));
    }
    return new Deck(cards);
  };
  
  window.Deck = Deck;
  window.Card = Card;
  
};
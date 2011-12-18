var EmptySeat, PlayingSeat, Seat;
var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

Seat = (function() {

  function Seat(detail, game) {
    this.detail = detail;
    this.game = game;
    this.sn = this.detail.sn;
    this.init_dom();
  }

  Seat.prototype.init_dom = function() {
    this.dom = this.get_dom();
    this.set_position();
    return this.dom.data('sn', this.sn).data('game', this.game).appendTo($("#game"));
  };

  Seat.prototype.set_position = function(offset) {
    this.offset = offset != null ? offset : 0;
    return this.dom.css(this.get_position());
  };

  Seat.prototype.clear = function() {
    this.dom.children(".high_label").removeClass("high_label");
  };

  return Seat;

})();

EmptySeat = (function() {

  __extends(EmptySeat, Seat);

  function EmptySeat(detail, game) {
    this.detail = detail;
    this.game = game;
    EmptySeat.__super__.constructor.apply(this, arguments);
  }

  EmptySeat.prototype.get_dom = function() {
    return $("#game > .template > .empty_seat").clone(true);
  };

  EmptySeat.prototype.get_position = function() {
    return $.positions.get_empty(this.detail.sn, this.offset);
  };

  return EmptySeat;

})();

PlayingSeat = (function() {

  __extends(PlayingSeat, Seat);

  function PlayingSeat(detail, game) {
    this.detail = detail;
    this.game = game;
    PlayingSeat.__super__.constructor.apply(this, arguments);
    this.player = new Player(this.detail.pid, this.dom, this.detail);
    this.poker = this.dom.children('.card');
  }

  PlayingSeat.prototype.clear = function() {
    this.player.set_nick();
    this.dom.children(".card").remove();
    return PlayingSeat.__super__.clear.apply(this, arguments);
  };

  PlayingSeat.prototype.get_dom = function() {
    return $("#game > .template > .playing_seat").clone(true);
  };

  PlayingSeat.prototype.get_position = function() {
    return $.positions.get_playing(this.detail.sn, this.offset);
  };

  PlayingSeat.prototype.raise = function(call, raise) {
    var bet, bets, ps, _i, _len;
    ps = $.positions.get_bet(this.sn);
    bets = $.compute_bet_count(call + raise, []);
    for (_i = 0, _len = bets.length; _i < _len; _i++) {
      bet = bets[_i];
      this.raise_bet($.rl.img[bet], ps);
    }
  };

  PlayingSeat.prototype.raise_bet = function(img, ps) {
    var bet;
    bet = $("<img class='bet' src='" + img + "' />").css(ps.start).appendTo(this.game.dom);
    return $(this.dom).oneTime(100, function() {
      return bet.css($.positions.get_random(ps.end, 5));
    });
  };

  PlayingSeat.prototype.check = function() {};

  PlayingSeat.prototype.set_dealer = function() {
    var dealer;
    dealer = $('.playing_seat > .dealer');
    if (dealer.size() === 0) {
      return $('#game > .template > .dealer').clone().insertBefore(this.dom.children(".nick"));
    } else {
      return dealer.remove().insertBefore(this.dom.children(".nick"));
    }
  };

  PlayingSeat.prototype.set_actor = function() {
    this.game.clear_actor();
    this.dom.addClass('actor_seat');
    return $('<div class="actor_timer"><div /></div>').appendTo(this.dom).oneTime(100, function() {
      return $(this).children('div').css({
        'margin-top': '120px'
      });
    });
  };

  PlayingSeat.prototype.draw_card = function() {
    return this.dom.children(".draw_card").css($.positions.get_draw(this.sn)).show();
  };

  PlayingSeat.prototype.private_card = function(face, suit, card_sn) {
    var poker;
    this.dom.children(".draw_card").hide();
    poker = $.get_poker(face, suit).addClass('private_card').css($.positions.get_private(this.sn, card_sn)).appendTo(this.dom);
    return this.pokers = this.dom.children('.card');
  };

  PlayingSeat.prototype.set_rank = function() {
    return this.dom.children(".nick").addClass("high_label").text(RANKS[this.hand.rank]);
  };

  PlayingSeat.prototype.set_hand = function(hand) {
    return this.hand = {
      face: hand.high1,
      face2: hand.high2,
      suit: hand.suit,
      rank: hand.rank
    };
  };

  PlayingSeat.prototype.high = function() {
    var f, faces, game, high, null_face, null_suit, one, pokers, s, _i, _len;
    game = this.game;
    game.clear_high();
    pokers = this.pokers;
    null_suit = null;
    null_face = null;
    high = function(face, suit, filter) {
      return game.high(face, suit, filter, pokers);
    };
    switch (this.hand.rank) {
      case HC_PAIR:
      case HC_THREE_KIND:
      case HC_FOUR_KIND:
        high(this.hand.face);
        break;
      case HC_TWO_PAIR:
      case HC_FULL_HOUSE:
        high(this.hand.face);
        high(this.hand.face2);
        break;
      case HC_FLUSH:
        high(null_face, this.hand.suit, function(pokers) {
          return pokers.sort($.compare_card).slice(0, 5);
        });
        console.log('HC_FLUSH');
        break;
      case HC_STRAIGHT:
      case HC_STRAIGHT_FLUSH:
        faces = [this.hand.face, this.hand.face - 1, this.hand.face - 2, this.hand.face - 3, this.hand.face === CF_FIVE ? CF_ACE : this.hand.face - 4];
        one = function(pokers) {
          var result;
          result = pokers.first();
          return result;
        };
        s = this.hand.rank === HC_STRAIGHT_FLUSH ? this.hand.suit : null_suit;
        for (_i = 0, _len = faces.length; _i < _len; _i++) {
          f = faces[_i];
          high(f, s, one);
        }
        console.log('HC_STRAIGHT or HC_STRAIGHT_FLUSH');
        break;
      case HC_HIGH_CARD:
        break;
      default:
        throw "Unknown poker rank " + args.rank;
    }
  };

  return PlayingSeat;

})();

$(function() {
  var mod_sum;
  mod_sum = function(sum, bet, bets) {
    var i, times;
    times = Math.floor(sum / bet[0]);
    for (i = 1; 1 <= times ? i <= times : i >= times; 1 <= times ? i++ : i--) {
      bets.push(bet[1]);
    }
    return sum % bet[0];
  };
  $.compute_bet_count = function(sum, bets) {
    var b, bet, _i, _j, _len, _len2, _results;
    for (_i = 0, _len = BETS.length; _i < _len; _i++) {
      bet = BETS[_i];
      if (sum >= bet[0]) sum = mod_sum(sum, bet, bets);
    }
    _results = [];
    for (_j = 0, _len2 = bets.length; _j < _len2; _j++) {
      b = bets[_j];
      _results.push("betting_" + b);
    }
    return _results;
  };
  $.compare_card = function(a, b) {
    var a1, b1;
    a1 = new Number($(a).attr('face'));
    b1 = new Number($(b).attr('face'));
    if (a1 > b1) {
      return -1;
    } else if (a1 < b1) {
      return 1;
    } else {
      return 0;
    }
  };
  return $("#game .empty_seat").bind('click', function() {});
});

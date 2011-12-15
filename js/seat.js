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
    return this.dom.remove();
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
  }

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
    $('.actor_timer').remove();
    $('.actor_seat').removeClass('actor_seat');
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
  return $("#game .empty_seat").bind('click', function() {});
});

var Game;

Game = (function() {

  function Game(gid, dom) {
    this.gid = gid;
    this.dom = dom;
    return;
  }

  Game.prototype.init = function(detail) {
    this.detail = detail;
    this.seats = [];
    return this.dom.trigger('inited');
  };

  Game.prototype.init_seat = function(seat_detail) {
    switch (seat_detail.state) {
      case PS_EMPTY:
        return this.seats[seat_detail.sn] = new EmptySeat(seat_detail, this);
      default:
        return this.seats[seat_detail.sn] = new PlayingSeat(seat_detail, this);
    }
  };

  Game.prototype.clear = function() {
    var seat, _i, _len, _ref, _results;
    $.positions.reset_share();
    this.dom.children(".pot").remove();
    this.dom.children(".card").remove();
    _ref = this.seats;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      seat = _ref[_i];
      if (seat != null) _results.push(seat.clear());
    }
    return _results;
  };

  Game.prototype.get_seat_by_pid = function(o) {
    var seat, _i, _len, _ref;
    _ref = this.seats;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      seat = _ref[_i];
      if ((seat != null) && seat.__proto__.constructor === PlayingSeat && seat.player.pid === o.pid) {
        return seat;
      }
    }
  };

  Game.prototype.get_seat_by_sn = function(o) {
    var seat, _i, _len, _ref;
    _ref = this.seats;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      seat = _ref[_i];
      if ((seat != null) && seat.__proto__.constructor === PlayingSeat && seat.sn === o.seat) {
        return seat;
      }
    }
  };

  Game.prototype.get_seat = function(o) {
    if ('pid' in o) {
      return this.get_seat_by_pid(o);
    } else if ('seat' in o) {
      return this.get_seat_by_sn(o);
    } else {
      throw "unknown object " + o + " in get_seat()";
    }
  };

  Game.prototype.new_stage = function() {
    var ref;
    ref = this.dom;
    this.dom.oneTime('1s', function() {
      var bet, _i, _len, _ref, _results;
      _ref = ref.children(".bet");
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        bet = _ref[_i];
        _results.push($(bet).css($.positions.get_random([240, 680], 20)).removeClass('bet').addClass('pot'));
      }
      return _results;
    });
  };

  Game.prototype.share_card = function(face, suit) {
    return $.get_poker(face, suit).css($.positions.get_next_share()).appendTo(this.dom);
  };

  return Game;

})();

$(function() {
  var game, game_dom;
  game = null;
  game_dom = $('#game');
  game_dom.bind('switch_game', function(event, args) {
    var cmd;
    game = new Game(args.gid, game_dom);
    cmd = {
      gid: args.gid
    };
    $.game = game;
    switch (args.action) {
      case 'watch':
        $.extend(cmd, {
          cmd: "WATCH"
        });
        break;
      case 'join':
        $.extend(cmd, {
          cmd: "JOIN",
          buyin: args.buyin,
          seat: 0
        });
        break;
      default:
        throw 'unknown game action';
    }
    $.ws.send($.pp.write(cmd));
    $(this).show();
    blockUI('#msg_joining');
    return $(this).oneTime('3s', function() {
      blockUI('#err_network');
    });
  });
  game_dom.bind('inited', function() {
    $(this).stopTime();
    unblockUI();
  });
  $.get_poker = function(face, suit) {
    return $("<img src='" + $.rl.poker["" + (new Number(face << 8 | suit))] + "' class='card'/>").data('face', face).data('suit', suit);
  };
  $.pp.reg("GAME_DETAIL", function(detail) {
    return game.init(detail);
  });
  $.pp.reg("SEAT_DETAIL", function(detail) {
    return game.init_seat(detail);
  });
  $.pp.reg("CANCEL", function(args) {});
  $.pp.reg("START", function(args) {
    game.clear();
  });
  $.pp.reg("END", function(args) {});
  $.pp.reg("DEALER", function(args) {
    var seat;
    seat = game.get_seat(args);
    return seat.set_dealer();
  });
  $.pp.reg("SBLIND", function(args) {});
  $.pp.reg("BBLIND", function(args) {});
  $.pp.reg("RAISE", function(args) {
    var seat, sum;
    sum = args.call + args.raise;
    seat = game.get_seat(args);
    if (sum === 0) {
      return seat.check();
    } else {
      return seat.raise(args.call, args.raise);
    }
  });
  $.pp.reg("DRAW", function(args) {
    var seat;
    seat = game.get_seat(args);
    return seat.draw_card();
  });
  $.pp.reg("SHARE", function(args) {
    return game.share_card(args.face, args.suit);
  });
  $.pp.reg("PRIVATE", function(args) {
    return console.log(args);
  });
  $.pp.reg("ACTOR", function(args) {
    var seat;
    seat = game.get_seat(args);
    return seat.set_actor();
  });
  $.pp.reg("STAGE", function(args) {
    return game.new_stage();
  });
  $.pp.reg("JOIN", function(args) {});
  $.pp.reg("LEAVE", function(args) {});
  $.pp.reg("BET_REQ", function(args) {});
  $.pp.reg("SHOW", function(args) {
    var seat;
    seat = game.get_seat(args);
    seat.private_card(args.face1, args.suit1, 1);
    return seat.private_card(args.face2, args.suit2, 2);
  });
  $.pp.reg("HAND", function(args) {});
  $.pp.reg("WIN", function(args) {});
});

var Game;

Game = (function() {

  function Game(gid, dom) {
    this.gid = gid;
    this.dom = dom;
    return;
  }

  Game.prototype.init = function(detail) {
    this.detail = detail;
    this.stage = GS_PREFLOP;
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

  Game.prototype.update_seat = function(seat_detail) {
    if (seat_detail.state === PS_EMPTY) {}
  };

  Game.prototype.reset_position = function(sn) {
    var seat, _i, _len, _ref, _results;
    $.positions.offset = $.positions.size - sn + 1;
    _ref = this.seats;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      seat = _ref[_i];
      if (seat != null) _results.push(seat.set_position());
    }
    return _results;
  };

  Game.prototype.join = function(seat_detail) {
    this.seats[seat_detail.sn].remove();
    this.seats[seat_detail.sn] = new PlayingSeat(seat_detail, this);
    if (seat_detail.pid === $.player.pid) {
      this.player = $.player;
      this.hide_empty();
      this.reset_position(seat_detail.sn);
    }
    return this.seats[seat_detail.sn].disable();
  };

  Game.prototype.hide_empty = function() {
    var seat, _i, _len, _ref, _results;
    $("#cmd_leave").attr('disabled', false).removeClass('disabled');
    _ref = this.seats;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      seat = _ref[_i];
      if ((seat != null) && seat.__proto__.constructor === EmptySeat) {
        _results.push(seat.hide());
      }
    }
    return _results;
  };

  Game.prototype.show_empty = function() {
    var seat, _i, _len, _ref, _results;
    $("#cmd_leave").attr('disabled', true).addClass('disabled');
    _ref = this.seats;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      seat = _ref[_i];
      if ((seat != null) && seat.__proto__.constructor === EmptySeat) {
        _results.push(seat.show());
      }
    }
    return _results;
  };

  Game.prototype.leave = function(args) {
    var seat;
    seat = this.seats[args.sn];
    if (seat.__proto__.constructor === EmptySeat) return;
    if (args.player.pid === $.player.pid) this.player = null;
    this.seats[seat.sn].clear();
    this.seats[seat.sn].remove();
    this.seats[seat.sn] = new EmptySeat({
      sn: args.sn
    }, this);
    if (this.player) {
      return this.hide_empty();
    } else {
      return this.show_empty();
    }
  };

  Game.prototype.clear = function() {
    var seat, _i, _len, _ref, _results;
    this.stage = GS_PREFLOP;
    $.positions.reset_share();
    $(".bet, .pot, .card").remove();
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
    } else if ('sn' in o) {
      return this.get_seat_by_sn(o);
    } else {
      throw "unknown object " + o + " in get_seat()";
    }
  };

  Game.prototype.new_stage = function(stage) {
    var ref, seat, _i, _len, _ref;
    this.stage = stage;
    _ref = this.seats;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      seat = _ref[_i];
      if ((seat != null) && seat.__proto__.constructor === PlayingSeat) {
        seat.reset_bet();
      }
    }
    ref = this.dom;
    return this.dom.oneTime('0.3s', function() {
      var bet, _j, _len2, _ref2, _results;
      _ref2 = ref.children(".bet");
      _results = [];
      for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
        bet = _ref2[_j];
        _results.push($(bet).css($.positions.get_random([240, 680], 20)).removeClass('bet').addClass('pot'));
      }
      return _results;
    });
  };

  Game.prototype.share_card = function(face, suit) {
    return $.get_poker(face, suit).css($.positions.get_next_share()).appendTo(this.dom);
  };

  Game.prototype.win = function(seat) {
    var ref;
    ref = this.dom;
    return ref.oneTime('1s', function() {
      var bet, _i, _len, _ref, _results;
      _ref = ref.children(".bet, .pot");
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        bet = _ref[_i];
        _results.push($(bet).css($.positions.get_bet(seat.sn).start));
      }
      return _results;
    });
  };

  Game.prototype.high = function(face, suit, filter, seat_pokers) {
    var pokers;
    pokers = $.merge(this.dom.children('.card'), seat_pokers);
    pokers = $.find_poker(face, suit, pokers);
    if (filter != null) pokers = filter(pokers);
    return pokers.addClass('high_card');
  };

  Game.prototype.clear_high = function() {
    return $.find_poker().removeClass('high_card');
  };

  Game.prototype.clear_actor = function() {
    $('.actor_timer').remove();
    return $('.actor_seat').removeClass('actor_seat');
  };

  Game.prototype.disable_actions = function(key) {
    if (key == null) {
      $("#cmd_call").text('跟注');
      $("#cmd_raise").text('加注');
      return $("#game > .actions > *").attr("disabled", true).addClass('disabled');
    } else {
      if (key === '#cmd_call') $("#cmd_call").text('跟注');
      if (key === '#cmd_raise') $("#cmd_raise").text('加注');
      return $("#game > .actions").children(key).attr("disabled", true).addClass('disabled');
    }
  };

  Game.prototype.enable_actions = function(args) {
    $("#game > .actions > *").attr("disabled", false).removeClass('disabled');
    if (args.call >= args.max) {
      $("#cmd_call").text("ALL-IN $" + args.max);
      this.disable_actions('#cmd_raise');
      this.disable_actions('#cmd_check');
      this.disable_actions('#raise_range');
      this.disable_actions('#raise_number');
    } else {
      $("#cmd_call").text("跟注 $" + args.call);
    }
    return this.disable_actions(args.call === 0 ? '#cmd_call' : '#cmd_check');
  };

  Game.prototype.set_actor = function(args) {
    this.actor = this.get_seat(args);
    return this.actor.set_actor();
  };

  Game.prototype.check_actor = function() {
    if ((this.actor != null) && this.actor.player.pid === $.player.pid) {
      return true;
    }
    return false;
  };

  Game.prototype.check = function() {
    return $.ws.send($.pp.write({
      cmd: "RAISE",
      amount: 0,
      gid: this.gid
    }));
  };

  Game.prototype.fold = function() {
    return $.ws.send($.pp.write({
      cmd: "FOLD",
      gid: this.gid
    }));
  };

  Game.prototype.call = function(amount) {
    if (amount == null) amount = 0;
    return $.ws.send($.pp.write({
      cmd: "RAISE",
      amount: amount,
      gid: this.gid
    }));
  };

  return Game;

})();

$(function() {
  var action, game, game_dom, hall_dom, log, log_empty, money, nick, private_card_sn, rank;
  game = null;
  game_dom = $('#game');
  hall_dom = $('#hall');
  private_card_sn = 0;
  log = function(msg) {
    return $('#logs').append("" + msg + "<br />").scrollTop($('#logs')[0].scrollHeight);
  };
  log_empty = function() {
    return $('#logs').empty();
  };
  nick = function(o) {
    if (o.nick) return "<strong class='nick'>" + o.nick + "</strong>";
    return "<strong class='nick'>" + o.player.nick + "</strong>";
  };
  money = function(n) {
    return "<strong class='amount'>$" + n + "</strong>";
  };
  action = function(a) {
    return "<strong class='action'>" + a + "</strong>";
  };
  rank = function(r) {
    return "<strong class='rank'>" + r + "</strong>";
  };
  game_dom.bind('cancel_game', function(event, args) {
    log_empty();
    game.clear();
    game = null;
    $("#game > .playing_seat").remove();
    $("#game > .empty_seat").remove();
    return $(this).hide();
  });
  game_dom.bind('start_game', function(event, args) {
    var cmd;
    $("#cmd_leave").attr('disabled', true).addClass('disabled');
    game = new Game(args.gid, game_dom);
    game.disable_actions();
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
    return $(this).oneTime('3s', function() {
      blockUI('#err_network');
    });
  });
  game_dom.bind('inited', function() {
    $(this).stopTime();
  });
  $.get_poker = function(face, suit) {
    return $("<img src='" + $.rl.poker["" + (new Number(face << 8 | suit))] + "' class='card'/>").attr('face', face).attr('suit', suit);
  };
  $.find_poker = function(face, suit, pokers) {
    if ((face != null) && (suit != null)) {
      return pokers.filter("[face=" + face + "]").filter("[suit=" + suit + "]");
    }
    if (face != null) return pokers.filter("[face=" + face + "]");
    if (suit != null) return pokers.filter("[suit=" + suit + "]");
    return $(".card");
  };
  $.pp.reg("GAME_DETAIL", function(detail) {
    game.init(detail);
    if (detail.players < 2) {
      return growlUI("#tips_empty");
    } else {
      return unblockUI();
    }
  });
  $.pp.reg("SEAT_DETAIL", function(detail) {
    return game.init_seat(detail);
  });
  $.pp.reg("SEAT_STATE", function(detail) {
    var seat;
    if (!game) return;
    if (detail.state === PS_EMPTY) return;
    seat = game.get_seat(detail);
    if (seat.update(detail)) {
      if (detail.state === PS_ALL_IN) {
        return log("" + (nick(detail)) + " " + (action('ALL-IN')));
      } else if (detail.state === PS_FOLD) {
        return log("" + (nick(detail)) + " " + (action('棄牌')));
      } else if (detail.state === PS_OUT) {
        return log("" + (nick(detail)) + " " + (action('OUT')));
      }
    }
  });
  $.pp.reg("CANCEL", function(args) {
    game.clear();
    log("");
    return log("===== " + (action('請等待其他玩家的加入')) + " =====");
  });
  $.pp.reg("START", function(args) {
    if ($(".blockUI > .buyin").size() === 0) unblockUI();
    game.clear();
    log('');
    return log("===== " + (action('新的牌局開始')) + " =====");
  });
  $.pp.reg("END", function(args) {});
  $.pp.reg("DEALER", function(args) {
    var seat;
    seat = game.get_seat(args);
    return seat.set_dealer();
  });
  $.pp.reg("SBLIND", function(args) {});
  $.pp.reg("BBLIND", function(args) {});
  $.pp.reg("BLIND", function(args) {
    var seat;
    seat = game.get_seat(args);
    seat.raise(args.blind, 0);
    return log("" + (nick(seat)) + " " + (action('下盲注')) + " " + (money(args.blind)));
  });
  $.pp.reg("RAISE", function(args) {
    var seat, sum;
    sum = args.call + args.raise;
    seat = game.get_seat(args);
    if (sum === 0) {
      seat.check();
      return log("" + (nick(seat)) + " " + (action('看牌')));
    } else {
      seat.raise(args.call, args.raise);
      if (args.raise === 0) {
        return log("" + (nick(seat)) + " " + (action('跟注')) + " " + (money(args.call)));
      } else {
        return log("" + (nick(seat)) + " " + (action('加注')) + " " + (money(args.raise)));
      }
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
    var seat;
    private_card_sn += 1;
    seat = game.get_seat(args);
    seat.private_card(args.face, args.suit, private_card_sn);
    if (private_card_sn === 2) private_card_sn = 0;
  });
  $.pp.reg("ACTOR", function(args) {
    game.set_actor(args);
    if (!game.check_actor()) return game.disable_actions();
  });
  $.pp.reg("STAGE", function(args) {
    if (args.stage !== GS_PREFLOP) return game.new_stage(args.stage);
  });
  $.pp.reg("JOIN", function(args) {
    game.join(args);
    return log("" + (nick(args)) + " " + (action('加入')));
  });
  $.pp.reg("LEAVE", function(args) {
    var seat;
    seat = game.get_seat(args);
    return game.leave(seat);
  });
  $.pp.reg("UNWATCH", function(args) {
    game_dom.trigger('cancel_game');
    return hall_dom.trigger('cancel_game');
  });
  $.pp.reg("BET_REQ", function(args) {
    game.enable_actions(args);
    return $('#raise_range, #raise_number').val(args.min).attr('min', args.min).attr('max', args.max);
  });
  $.pp.reg("SHOW", function(args) {
    var seat;
    game.new_stage();
    seat = game.get_seat(args);
    seat.private_card(args.face1, args.suit1, 1);
    return seat.private_card(args.face2, args.suit2, 2);
  });
  $.pp.reg("HAND", function(args) {
    var seat;
    seat = game.get_seat(args);
    seat.set_hand(args);
    seat.set_rank();
    if (game.check_actor()) return seat.high();
  });
  $.pp.reg("WIN", function(args) {
    var msg, seat;
    game.clear_actor();
    seat = game.get_seat(args);
    game.win(seat);
    seat.high();
    msg = "" + (nick(seat)) + " " + (rank(seat.rank)) + " " + (action('贏得')) + " " + (money(args.amount - args.cost));
    log(msg);
    if ($(".blockUI > .buyin").size() === 0) {
      return growlUI("<div>" + msg + "</div>");
    }
  });
  $("#game > .actions > [id^=cmd_fold]").bind('click', function() {
    if ($(this).hasClass('disabled')) return;
    if (!game.check_actor()) return;
    return game.fold();
  });
  $("#game > .actions > [id^=cmd_check]").bind('click', function() {
    if ($(this).hasClass('disabled')) return;
    if (!game.check_actor()) return;
    return game.check();
  });
  $("#game > .actions > [id^=cmd_call]").bind('click', function() {
    if ($(this).hasClass('disabled')) return;
    if (!game.check_actor()) return;
    return game.call();
  });
  $("#game > .actions > [id^=cmd_raise]").bind('click', function() {
    var amount;
    if ($(this).hasClass('disabled')) return;
    if (!game.check_actor()) return;
    $('#raise_range').trigger('change');
    amount = parseInt($('#raise_range').val());
    return game.call(amount);
  });
  $("#game > .actions > [id^=cmd]").bind('click', function() {
    return game.disable_actions();
  });
  $('#raise_range, #raise_number').bind('change', function(event) {
    var max, min, v;
    v = parseInt($(this).val());
    min = parseInt($(this).attr("min"));
    max = parseInt($(this).attr("max"));
    if (v < min) v = min;
    if (v > max) v = max;
    return $('#raise_range, #raise_number').val(v.toString());
  });
  $('#cmd_cancel').bind('click', function(event) {
    return $.ws.send($.pp.write({
      cmd: "UNWATCH",
      gid: $.game.gid
    }));
  });
  $('#cmd_leave').bind('click', function(event) {
    return $.ws.send($.pp.write({
      cmd: "LEAVE",
      gid: $.game.gid
    }));
  });
});

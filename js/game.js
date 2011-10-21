$(document).ready(function() {
  // {{{ variable
  var watching = false, playing = false, 
      pot = 0, positions = null, seats_size = 0;
  var seats = [], private_card_index = 0, share_card_index = 0;
  var show_all = false; 
  var PS_EMPTY     = 0, 
      PS_PLAY      = 1,
      PS_FOLD      = 2,
      PS_WAIT_BB   = 4,
      PS_SIT_OUT   = 8,
      PS_MAKEUP_BB = 16,
      PS_ALL_IN    = 32,
      PS_BET       = 64,
      PS_RESERVED  = 128,
      PS_AUTOPLAY  = 256,
      PS_MUCK      = 512,
      PS_OUT       = 1024;

  var states = [];

  // }}}

  // {{{ generate function
  var is_me = null, check_game = null,       
      display_debug = null, send = null, 
      get_gid = null, get_seat = null, get_state = null,
      get_size = null, show_seats = null, get_seat_number = null;
  // }}}

  // {{{ initialization
  var initialization = function(args) { 
    // {{{ generate check me & game function
    is_me = function(o, is_callback, not_callback) {
      var pid = pickup_int(o, 'pid');

      if (is_callback == null && not_callback == null)
        return pid == args.pid;

      if (pid == args.pid)
        is_callback();
      else if (not_callback != undefined)
        not_callback();
    };

    check_game = function(o) {
      var gid = pickup_int(o, 'gid');
      if (gid != args.gid)
        throw 'not current game [' + o + ']';
    };

    get_gid = function() { return args.gid; };

    send = function(o) { 
      o.gid = args.gid;
      $.ws.send($.pp.write(o));
    };

    // generate display testing function
    display_debug = args.debug ? function() {
      //for (var i = 1; i < seats_size + 1; i ++) {
        //update_seat({inplay: 123456, sn: i, nick: '玩家昵称', pid: 1, state: PS_PLAY, betting: 0});
        //get_seat(i).children('.betting_label').css(positions[i].betting_label).text("1000").show();
        //get_seat(i).children('.card').css(positions[i].card).show();
      //}
    } : $.noop;
    // }}}

    regenrate_seat_function(args.seat);
    
    // generate game table DOM
    $("#game_table").setTemplateElement("game_table_template");
    $("#game_table").processTemplate({end: 9});
  }; 

  var regenrate_seat_function = function(seat) {
    display_states = (seat == undefined) ? refresh_states : $.noop;

    get_state = function(o) {
      if (seat == undefined && o == undefined)
        throw 'Can\'t call get_my_state before join game';

      var sn = o != undefined ? pickup_int(o, 'seat') : seat;

      if (states[sn] == undefined) {
        console.log(o);
        throw 'Not find seat state [' + o + ']';
      }

      return states[sn];
    }

    get_seat = function(o) {
      return $(get_state(o).dom);
    };

    get_seat_number = function(pid) {
      for(var i = 1; i < states.length; i++) {
        if ((states[i].pid == pid) && (states[i].state != PS_EMPTY))
          return states[i].seat;
      }

      throw 'Not our player id';
    };
  }

  var init_seats = function(size) {
    get_size = function() {
      return size;
    };

    var positions = get_positions(size);
    $(".game_seat, .empty_seat, .button, .card, .bet_label").hide();

    states = []; // init empty states;
    for (var i = 1; i < positions.length; i ++) {
      states[i] = {
        seat: i,
        dom: $("#game_seat_" + i).css(positions[i].outer),
        empty_dom: $("#empty_seat_" + i).css(positions[i].empty_outer),
        position: positions[i],
        photo: $.rl.img.def_face_0
      };
    }
  };

  var init_state = function(detail) {
    var st = update_state(detail);
    if (st.state != PS_EMPTY) {
      send({cmd: "PHOTO_QUERY", id: st.pid});
    }
  };

  var update_state = function(detail) {
    var st = get_state(detail);
    $.extend(st, detail);
    return st;
  }

  var refresh_state = function(state) {
    var x = get_state(state);
    var show = function() { $(this).show(); };

    console.log(x);

    if (x.state != PS_EMPTY) {
      $(x.empty_dom).hide().css(x.position.empty_outer);
      $(x.dom).animate(x.position.outer, 'slow', show);

      $(x.dom).
        children('.inplay').text(x.inplay).parent().
        children('.nick').text(x.nick).parent().
        children('.photo').attr('src', x.photo);

    } else {
      $(x.dom).hide().css(x.position.empty_outer);
      $(x.empty_dom).animate(x.position.empty_outer, 'slow', show);
    }
  }

  var refresh_states = function() {
    $.each(states, function(i, x) {
      if (i == 0)
        return;

      refresh_state(x);
    });
  };

  // }}}

  // game event {{{
  $('#game').bind('watching', function(event, args) {
    initialization(args);
    send({cmd: "WATCH"});
  });
http://localhost/~jack/texas/
  $('#game').bind('join', function(event, args) {
    initialization(args);
    send({cmd: "JOIN", seat: args.seat, buyin: 100});
  });

  $('#cmd_stand').click(function() {
    set_check(5);
  });

  $('#cmd_hall').click(function() {
    ////
    ////share_pot([1,2,3]);
    //new_stage(true);
  });

  $('#cmd_fold').click(function() {
    send({cmd: "FOLD"});
  });

  $('#cmd_call').click(function() {
    send({cmd: "RAISE", amount: 0});
  });

  $('#cmd_raise').click(function() {
    amount = parseInt($('#raise_range').val());
    send({cmd: "RAISE", amount: amount});
  });

  $('#raise_range').bind('change', function(event) {
    var v = parseInt($(this).val());
    var max = parseInt($(this).attr("max"));

    if (v == max)
      $('#cmd_raise').text("ALL-IN " + v);
    else 
      $('#cmd_raise').text("加注 " + v);
  });
  // }}}

  // seat & state  {{{
  var ps_fold = function(sn) {
    var seat = seats[sn];
    var s = get_seat(sn);

    s.addClass("ps_fold");

    is_me(seat, function() {
      $(".private_card").addClass("ps_fold");
    }, function() {
      s.children(".card").hide("slow");
    });

    play_sound('fold');
  };

  var ps_play = function(sn) {
    var seat = seats[sn];
    var s = get_seat(sn);
    s.removeClass("ps_fold");

    is_me(seat, function() {
      $(".private_card").removeClass("ps_fold");
    });
  };

  var set_check = function(seat) {
    play_sound('check');
  }

  var set_betting = function(seat, bet) {
    seats[seat].betting = seats[seat].betting + bet;
    pot += bet;

    var b = get_seat(seat).
      children(".betting_label").
      css(positions[seat].betting_label).
      text(bet).
      show();

    var bets = get_bets(bet);

    play_sound("bet");
    $.each(bets, function(i, x) {
      $('<img class="bet seat-bet-' + seat + '" />').attr("src", $.rl.img[x]).css(positions[seat].betting_ori).appendTo('#game_table').animate(random(positions[seat].betting, 7, 7), 450);
    });
  };

  // 更新座位信息,需要参数中携带座位编号,昵称,带入金额.
  var reload_seat = function(sn) {
    var seat = seats[sn];
    var s = get_seat(sn);
    var e = get_empty_seat(sn);

    if (seat == undefined) {
      s.hide();
      e.show(450);
    }
    else {
      e.hide();

      if (seat.state == PS_FOLD) {
        ps_fold(sn);
      }

      if (seat.state == PS_PLAY) {
        ps_play(sn);
      }

      // 对玩家显示区进行基本设置
      s.children('.inplay').text(seat.inplay).parent().
        children('.nick').text(seat.nick).parent().
        children('.photo').attr('player', seat.pid).parent().
        show(450);
    }
  };

  var update_seat = function(seat) {
    if (seat.state == PS_EMPTY) {
      seats[seat.sn] = undefined;
    } else {
      if (seats[seat.sn] == undefined) {
        seat.betting = 0;
        seats[seat.sn] = seat;
      }
      else {
        seat.betting = seats[seat.sn].betting;
        seats[seat.sn] = seat;
      }
    }

    reload_seat(seat.sn);
  };

  var new_stage = function(have_blinds) {

    if (have_blinds)
      return;

    var sum = 0;
    var bets = [];

    for(var i = 1; i <= seats_size; i++) {
      bets.push($('.seat-bet-' + i).map(function(n, x) {
        $(x).addClass("pot").removeClass("bet").removeClass("seat-bet-" + i);
        return {bet: $(x), endpoint: random({left: 571, top: 227}, 20, 20)};
      }));

      get_seat(i).children('.betting_label').hide();
    }

    play_sound('move');
    $.each(bets, function(i, x) {
      move_bet(bets.shift());
    });
  }

  // }}}
  
  // game protocol {{{
  // {{{ init detail protocol
  $.pp.reg("GAME_DETAIL", function(game) { 
    log(["game_detail", game]);

    check_game(game);
    init_seats(game.seats);
    display_debug();
  });

  $.pp.reg("SEAT_DETAIL", function(seat) {
    if (is_disable())
      return;

    check_game(seat);
    init_state(seat);

    if (get_size() == seat.seat) {
      // 如果初始化时制定了座位位置
      // 则此时调用为noop
      display_states();
    }
  });
  // }}}

  // {{{ player state notify 
  $.pp.reg("JOIN", function(notify) { 
    check_game(notify);
    notify.state = PS_FOLD;
    init_state(notify);

    is_me(notify, function() {
      regenrate_seat_function(notify.seat);
      var positions = trim_positions(notify.seat)

      for (var i = 1; i < positions.length; i++) {
        update_state({seat: i, position: positions[i]});
      };
    });

    refresh_states();
  });

  $.pp.reg("SEAT_STATE", function(seat) { 
    if (is_disable())
      return;

    check_game(seat);
    update_seat({inplay: 1000, sn: seat.sn, nick: seat.nick, pid: seat.pid, state: seat.state});
  });

  $.pp.reg("BET_REQ", function(req) { 
    log(['notify_bet_request', 'call', req.call, 'min', req.min, 'max', req.max]);

    $('#raise_range').
      attr('min', req.min).
      attr('max', req.max).
      val(req.min);
  });

  $.pp.reg("RAISE", function(notify) { 
    log(['notify_raise', 'pid', notify.pid, 'raise', notify.raise, 'call', notify.call]);

    var sum = notify.call + notify.raise;
    var sn = get_seat_number(notify.pid)
    if (sum == 0) // CHECK
      set_check(sn);
    else
      set_betting(sn, sum);
  });

  $.pp.reg("PHOTO_INFO", function(player) { 
    if (is_disable())
      return;
    var photo = $.rl.img[player.photo]

    if (photo) {
      player.seat = get_seat_number(player.pid);
      player.photo = photo;
      update_state(player);
      console.log('UPDATE PHOTO');
      refresh_state(player);
    }
  });
  // }}}

  // {{{ game state notify
  $.pp.reg("CANCEL", function(notify) { 
    check_game(notify);
  });

  $.pp.reg("START", function(notify) { 
    check_game(notify);
  });

  $.pp.reg("BUTTON", function(notify) { 
    log(['notify_button', notify]);

    var s = get_seat(notify.seat);
    s.children('.button').show();
  });

  $.pp.reg("SBLIND", function(notify) { 
    log(['notify_sb', notify]);
  });

  $.pp.reg("BBLIND", function(notify) { 
    log(['notify_bb', notify]);
  });

  $.pp.reg("STAGE", function(notify) { 
    log(['notify_stage', 'stage', notify.stage]);
    new_stage(notify.stage == 0);
  });

  $.pp.reg("END", function(notify) { 
    $(".game_seat").children(".button").hide("slow");
    $(".game_seat").children(".card").hide("slow");

    pot = 0;

    $(".private_card").hide("slow");
    log(['----------------------notify_end----------------------']);
  });

  // }}}

  // {{{ card notify 
  $.pp.reg("PRIVATE", function(notify) { 
    log(['notify_private', 'pid', notify.pid, 'suit', notify.suit, 'face', notify.face]);

    private_card_index += 1;
    $("#private_card_" + private_card_index).attr('src', get_poker(notify.face, notify.suit)).show('normal');
  });

  $.pp.reg("DRAW", function(notify) { 
    //log(['notify_draw', 'pid', notify.pid, 'suit', notify.suit, 'face', notify.face]);
    is_me(notify, $.noop, function() {
      var sn = get_seat_number(notify.pid)
      get_seat(sn).children('.card').css(positions[sn].card).show();
    });
  });

  $.pp.reg("SHARE", function(notify) { 
    log(['notify_share', 'suit', notify.suit, 'face', notify.face]);
    share_card_index += 1;
    $("#share_card_" + share_card_index).attr('src', get_poker(notify.face, notify.suit)).show('normal');
  });

  $.pp.reg("SHOW", function(notify) { 
    log(['notify_show', 'pid', notify.pid, 'card1', notify.face1, notify.suit1, 'card2', notify.face2, notify.suit2]);
  });
  // }}}

  // {{{ showdown notify
  $.pp.reg("HAND", function(notify) { 
    log(['notify_hand', 'pid', notify.pid, 'rank', notify.rank, 'face', notify.face1, notify.face2]);
  });

  $.pp.reg("WIN", function(notify) { 
    log(['notify_win', 'pid', notify.pid, 'amount', notify.amount]);
  });
  // }}}
  // }}}

  // utility {{{ 
  var share_pot = function(winners) {
    var winpots = [], cur = undefined;
    var all_size = $(".pot").length;
    var size = Math.floor(all_size / winners.length);

    $(".pot").each(function(i, x) {
      if (i % size == 0) {
        cur = (cur == undefined) ? 0 : (cur + 1);
        if (cur > winners.length - 1) {
          cur -= 1;
        }
      }

      if (winpots[cur] == undefined) {
        winpots[cur] = [];
      }

      winpots[cur].push({bet: $(this), endpoint: positions[winners[cur]].betting_ori});
    });

    play_sound('move');
    $.each(winpots, function(i, x) {
      move_bet(x, function(bet) { $(bet).remove(); });
    });
  };

  var get_empty_seat = function(sn) {
    return $("#empty_seat_" + sn);
  };

  var get_poker = function(face, suit) {
    var a = new Number(face << 8 | suit);
    return $.rl.poker[a.toString()];
  };

  var is_disable = function() { 
    return $('#game').css('display') == 'none'; 
  };

  var play_sound = function(x) {
    $.rl.sounds[x].play();
  }

  var get_bets = function(bet) { // {{{
    // generate bet animation
    var bets = [];
    var maxs = [
      {key: 100, val: "betting_1"},
      {key: 50, val: "betting_2"}, 
      {key: 20, val: "betting_3"}, 
      {key: 10, val: "betting_4"}, 
      {key: 5, val: "betting_5"}
    ];

    while (true) {
      var max = maxs.shift();
      var l = Math.floor(bet / max.key);
      for (var i = 1; i <= l; i++) {
        bets.push(max.val);
      }

      bet = bet % max.key;

      if (maxs.length == 0) {
        if (bet != 0)
          bets.push(max.val);

        break;
      }
    }

    return bets;
  } // }}}

  var random = function(ori, x, y) {
    var left = new Number(Math.floor((Math.random() * 100)) % x + ori.left);
    var top = new Number(Math.floor((Math.random() * 100)) % y + ori.top);
    
    return {left: left + "px", top: top + "px"};
  }

  var move_bet = function(bets, callback) {
    // [{bet: $(bet), :endpoint: {left: xxx, right: xxx}}]
    var time = 100;
    $.each(bets, function(i, x) {
      $(document).oneTime(time, function() {
        $(x.bet).animate(x.endpoint, 650, function() {
          if (callback != undefined)
            callback($(this));
        });
      });
      time += 20;
    });
  }


  var log = function(msg) {
    console.log(msg);
  };

  var fan = function(i) {
    if (i == 0)
      return i;
    else if (i > 0)
      return 0 - i;
    else
      return Math.abs(i);
  };

  var pickup_int = function(o, prop) {
    switch(typeof(o)) {
      case "string":
        return new Number(o);
      break;
      case "number":
        return o;
      break;
      case "object":
        return pickup_int(o[prop]);
      break;
      case "undefined":
        throw "pickup_int not care 'undefined', check your code";
      default:
        throw "pickup_int not care type, error [" + o + "]";
    }
  };

  // }}}

  // player & betting point {{{ 
  var trim_positions = function(offset) {
    var size = get_size();
    var positions = [];
    var target = get_positions(size);
    for (var i = 1, j = offset; i <= size; i++, j = j % size + 1) {
      positions[j] = target[i];
    }

    return positions;
  };

  var get_positions = function(size) {
    return size == 5 ? five_positions : nine_positions;
  }

  var convert_points = function(points) {
    return $.map(points, function(pos) {
      var c = pos.card.split(',');
      var o = pos.outer.split(',');
      var bb = pos.betting.split(',');
      var bl = pos.betting_label.split(',');

      return {
        outer: {left: o[0] + 'px', top: o[1] + 'px'},
        empty_outer: {left: o[2] + 'px', top: o[3] + 'px'},
        card : {left: c[0] + 'px', top: c[1] + 'px'},
        betting: { left: new Number(bb[2]), top: new Number(bb[3]) },
        betting_ori: { left: bb[0] + 'px', top: bb[1] + 'px' },
        betting_label: { left: bl[0] + 'px', top: bl[1] + 'px' } // 下注文字显示坐标
      };
    });
  };

  var five_positions = convert_points([
    {outer: "0,0", betting_label: "0,0", betting: "0,0,0,0", card: "0,0"},
    {outer: "435,350", betting_label: "90,-10", betting: "471,413,529,308", card: "90,30"},
    {outer: "233,350", betting_label: "65,-20", betting: "268,410,337,308", card: "90,28"},
    {outer: "117,230", betting_label: "105,5", betting: "150,288,231,203", card: "90,30"},
    {outer: "145,60", betting_label: "145,95", betting: "181,122,294,178", card: "90,40"},
    {outer: "342,20", betting_label: "50,125", betting: "376,83,389,168", card: "90,60"}
  ]);

  var nine_positions = convert_points([
    {outer: "0,0", betting_label: "0,0", betting: "0,0,0,0", card: "0,0"},
    {outer: "435,350,448,363", betting_label: "90,-10", betting: "471,413,535,314", card: "90,30"},
    {outer: "233,350,263,363", betting_label: "65,-20", betting: "268,410,309,303", card: "90,28"},
    {outer: "117,230,116,275", betting_label: "105,5", betting: "150,288,233,208", card: "90,30"},
    {outer: "145,60,173,95", betting_label: "145,95", betting: "181,122,300,175", card: "90,40"},
    {outer: "342,20,342,55", betting_label: "50,125", betting: "376,83,402,162", card: "90,60"},
    {outer: "565,20,559,55,", betting_label: "-5,125", betting: "604,84,572,162", card: "-52,60"},
    {outer: "766,60,741,95", betting_label: "-105,95", betting: "803,129,672,175", card: "-52,40"},
    {outer: "801,230,798,275", betting_label: "-63,5", betting: "832,290,749,208", card: "-51,30"},
    {outer: "680,350,640,363", betting_label: "20,-20", betting: "711,408,710,306", card: "-51,28"}
  ])
  // }}}
});
// vim: fdm=marker

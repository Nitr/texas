$(document).ready(function() {
  // {{{ variable
  var watching = false, playing = false, 
      sum_pot = 0, positions = null, seats_size = 0;
  var states = [], game_state = {actor: null};
  var private_card_index = 0, share_card_index = 0, show_card = false;
  var buy_in = 0;

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
 
  var CF_ACE    = 13,
      CF_KING   = 12,
      CF_QUEEN  = 11,
      CF_JACK   = 10,
      CF_TEN    = 9,
      CF_NINE   = 8,
      CF_EIGHT  = 7,
      CF_SEVEN  = 6,
      CF_SIX    = 5,
      CF_FIVE   = 4,
      CF_FOUR   = 3,
      CF_THREE  = 2,
      CF_TWO    = 1,
      CF_NONE   = 0;

  var CS_SPADES   = 4,
      CS_HEARTS   = 3,
      CS_DIAMONDS = 2,
      CS_CLUBS    = 1,
      CS_NONE     = 0;

  var HC_HIGH_CARD      = 0,
      HC_PAIR           = 1,
      HC_TWO_PAIR       = 2,
      HC_THREE_KIND     = 3,
      HC_STRAIGHT       = 4,
      HC_FLUSH          = 5,
      HC_FULL_HOUSE     = 6,
      HC_FOUR_KIND      = 7,
      HC_STRAIGHT_FLUSH = 8;

  var MAX_PLAYER = 9;

  var ranks = ["高牌", "一對", "兩對", "三條", "順子", "同花", "葫蘆", "四條", "同花順"];

  var is_me = null, check_game = null, is_join = false;
      display_debug = null, send = null, 
      get_gid = null, get_seat = null, get_state = null,
      get_size = null, show_seats = null, get_seat_number = null;
  var update_inplay = null, auto_call = null, auto_check = null;
  // }}}

  // game event {{{
  $('#game').bind('watching', function(event, args) {
    initialization(args);
    send({cmd: "WATCH"});
  });

  $('#game').bind('join', function(event, args) {
    initialization(args);
    send({cmd: "JOIN", seat: 0, buyin: buy_in});
  });

  $('.empty_seat').bind('click', function() {
    if (is_join)
      return 

    var seat = parseInt($(this).attr('seat'))
    send({cmd: "JOIN", seat: seat, buyin: buy_in});
  });

  $('#cmd_stand').click(function() {
  });

  $('#cmd_hall').click(function() {
    clear_game();
    $("#game").hide();
    $("#hall").show("normal").trigger("return");
  });

  $('#cmd_fold').click(function() {
    if (is_actor() && is_enabled(this)) {
      disabled_button();
      send({cmd: "FOLD"});
    }
  });

  $('#cmd_call, #cmd_check').click(function() {
    if (is_actor() && is_enabled(this)) {
      disabled_button();
      send({cmd: "RAISE", amount: 0});
    }
  });

  $('#cmd_raise').click(function() {
    if (is_actor() && is_enabled(this)) {
      disabled_button();
      $('#raise_range').trigger('change');
      amount = parseInt($('#raise_range').val());
      send({cmd: "RAISE", amount: amount});
    }
  });

  $('#raise_range, #raise_number').bind('change', function(event) {
    var v = parseInt($(this).val());
    var min = parseInt($(this).attr("min"));
    var max = parseInt($(this).attr("max"));

    if (v < min) 
      v = min;

    if (v > max)
      v = max;

    $('#raise_range, #raise_number').val(v.toString());
  });

  // }}}
  //
  // {{{ initialization
  var initialization = function(args) {
    disabled_button();
    $(".game_seat, .empty_seat, .dealer, .card, .bet_label").hide();

    is_me = function(o, is_callback, not_callback) {
      var pid = pickup_int(o, 'pid');

      if (is_callback == null && not_callback == null)
        return pid == args.pid;

      if (pid == args.pid)
        is_callback();
      else if (not_callback != undefined)
        not_callback();
    };

    buy_in = args.buyin;

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

    // generate testing function {{{
    display_debug = args.debug ? function() {
      //for (var i = 1; i < seats_size + 1; i ++) {
        //update_seat({inplay: 123456, sn: i, nick: '玩家昵称', pid: 1, state: PS_PLAY, betting: 0});
        //get_seat(i).children('.betting_label').css(positions[i].betting_label).text("1000").show();
        //get_seat(i).children('.card').css(positions[i].card).show();
      //}
    } : $.noop; 

    auto_call = args.auto ? function() {
      $(document).oneTime(1000, function() {
        $('#cmd_call').click();
      });
    } : $.noop;

    auto_check = args.auto ? function() {
      $(document).oneTime(1000, function() {
        $('#cmd_raise').click();
      });
    } : $.noop; // }}}

    regenrate_seat_function(args);
  }; 

  var regenrate_seat_function = function(o) {
    var seat = o.seat;
    var amount = o.buyin;

    is_join = (seat == undefined) ? false : true;

    display_states = (seat == undefined) ? refresh_states : $.noop;

    update_inplay = function(inplay) {
      get_state().inplay = inplay == undefined ? amount : inplay;
    };

    get_state = function(o) {
      if (seat == undefined && o == undefined)
        throw 'Can\'t call get_my_state before join game';

      var sn = o != undefined ? pickup_int(o, 'seat') : seat;

      if (states[sn] == undefined) {
        throw 'Not find seat state [' + o + ']';
      }

      return states[sn];
    }

    get_seat = function(o) {
      return $(get_state(o).dom);
    };

    get_seat_number = function(pid) {
      if (pid == undefined)
        return seat;

      for(var i = 1; i < states.length; i++) {
        if ((states[i].pid == pid) && (states[i].state != PS_EMPTY))
          return states[i].seat;
      }

      throw 'Not our player id';
    };
  }

  var init_states = function(game) {
    states = []; // clear empty states;

    get_size = function() {
      return game.seats;
    };

    var positions = get_positions(game.seats);

    for (var i = 1; i < positions.length; i ++) {
      states[i] = {
        bet: 0,
        seat: i,
        dom: $("#game_seat_" + i).css(positions[i].outer),
        empty_dom: $("#empty_seat_" + i).css(positions[i].empty_outer),
        position: positions[i],
        photo: $.rl.img.def_face_0,
        rank: HC_HIGH_CARD
      };
    }
  };

  var update_states = function(prop, val) {
    $.each(states, function(i, x) {
      if (i == 0)
        return;

      if (x.state != PS_EMPTY) {
        x[prop] = val;
      }
    });
  }

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

  var refresh_rank_nick = function(state) {
    var x = get_state(state);
    
    if (x.rank != HC_HIGH_CARD) {
      $(x.dom).
        children('.nick').text(ranks[x.rank]).css({color: 'yellow'});
    }
    else {
      $(x.dom).
        children('.nick').text(x.nick).css({color: 'white'});
    }
  };

  var refresh_state = function(state) {
    var x = get_state(state);
    var show = function() { $(this).show(); };

    if (x.state != PS_EMPTY) {
      $(x.empty_dom).hide().css(x.position.empty_outer);
      $(x.dom).animate(x.position.outer, 'slow', show);

      $(x.dom).
        children('.inplay').text("$" + x.inplay).parent().
        children('.photo').attr('src', x.photo);

      refresh_rank_nick(state);

      if ((x.state == PS_FOLD) ||
          (x.state == PS_OUT)) {
        $(x.dom).addClass("ps_fold");
        //is_me(x, function() {
          //$(".private_card").addClass("ps_fold");
        //}, function() {
          //$(x.dom).children(".card").hide("slow");
        //});
      } else {
        $(x.dom).removeClass("ps_fold");
        is_me(x, function() {
          $(".private_card").removeClass("ps_fold");
        });
      }
    } else {
      $(x.dom).hide().css(x.position.empty_outer);

      if (is_join) {
        $(x.empty_dom).hide();
      } else {
        $(x.empty_dom).animate(x.position.empty_outer, 'slow', show);
      }
    }
  }

  var refresh_states = function() {
    $.each(states, function(i, x) {
      if (i == 0)
        return;

      refresh_state(x);
    });
  };

  var refresh_private_card = function() {
    var seat_number = get_seat_number();
  };

  var update_balance = function() {
    send({cmd: "BALANCE_QUERY"});
  };
  // }}}
  
  // utility {{{ 
  var new_stage = function(have_blinds) {
    if (have_blinds)
      return;

    var bets = [];
    for(var i = 1; i < states.length; i++) {
      var t = $('.seat-bet-' + states[i].seat).map(function(n, x) {
        $(x).addClass("pot").removeClass("bet").removeClass("seat-bet-" + states[i].seat);
        return {bet: $(x), endpoint: random({left: 671, top: 217}, 20, 20)};
      });

      if (t.length != 0) {
        bets.push(t);
      }

      $(states[i].dom).children('.bet_label').hide();
    }

    if (bets.length != 0) {
      play_sound('move');

      $.each(bets, function(i, x) {
        move_bet(bets.shift());
      });
    }

    if (sum_pot != 0) {
      $('.pot_label').text(sum_pot).show();
    }

    update_states('bet', 0);
  }

  var get_private_card = function(seat, sn) {
    return "#game_seat_" + seat + 
      " > .private_card[sn=" + sn + "]";
  };

  var get_background_card = function(seat) {
    return "#game_seat_" + seat + " > .background_card";
  };

  var show_buyin = function() {
    $('#game').block({message: '<div class=buyin>BUY-IN</div>', css: {
      'width': '500px',
      'height': '300px',
      'padding-bottom':  '20px',
      'padding-top':  '20px',
      'top': '70px !important',
      'background-color': 'rgba(0,0,0,.6) !important'
    }});
  };

  var show_winner = function(state, amount, cost) {
    if ($('.buyin').size() != 0) {
      return;
    }

    if ($(".blockElement").size() == 0) {
      // 初始化一个胜利者显示BLOCK
      $('#game').block({message: '<div id=winner></div>', css: {
        'padding-bottom':  '20px',
        'padding-top':  '20px',
        'top': '270px !important',
        'background-color': 'rgba(0,0,0,.6) !important'
      }});
    } 

    // 显示多个胜利者, 将胜利者信息添加到blockElement中
    $('<label>' + state.nick + '</label> <label>' + ranks[state.rank] + '</label> <label>$' + (amount - cost) + '</label></br>').appendTo($('.blockElement'));
  };

  var hide_winner = function() {
    if ($('.buyin').size() == 0) {
      $('#game').unblock();
    }
  };

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

      var state = get_state(winners[cur]);

      winpots[cur].push({bet: $(this), endpoint: state.position.betting_ori});
    });

    play_sound('move');
    $('.pot_label').hide();

    $.each(winpots, function(i, x) {
      move_bet(x, function(bet) { $(bet).remove(); });
    });
  };

  var get_poker = function(face, suit) {
    var a = new Number(face << 8 | suit);
    return $.rl.poker[a.toString()];
  };

  var is_disable = function() { 
    return $('#game').css('display') == 'none'; 
  };

  var play_sound = function(x) {
    //$.rl.sounds[x].play();
  }

  var get_bets = function(bet) {
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
  };

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

  var start_timer = function(seat) {
    var s = get_state(seat);
    $('<div class="timer" style="height: 120px;"><div /></div>').
      appendTo($(s.dom));


    var height = 120;
    var top = 0;

    $(".timer").everyTime(500, function(i) {
      height -= 4;
      top += 4;
      $(".timer").children("div").css('height', height + 'px').css('margin-top', top + 'px');
      if (height == 0) {
        cancel_timer();
      }
    }, 30);
  }

  var cancel_timer = function() {
    disabled_button();
    $(".timer").stopTime().remove();
  };

  var log = function(msg) {
    console.log(msg);
  };

  var debug = function(msg) {
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

  var set_card = function(id, face, suit) {
    var sn = new Number(face << 8 | suit);
    $(id).attr('src', $.rl.poker[sn.toString()]).
      attr("face", face).attr("suit", suit).
      show('slow');
  };

  var clear_high = function() {
    $('.card').css('-webkit-box-shadow', '1px 1px 5px black');
  };

  var set_high = function(face, suit) {
    if (face == undefined && suit == undefined)
      throw 'unknown high face or suit';

    if (face == undefined)
      set_high_css($("[suit=" + suit + "]"));

    if (suit == undefined)
      set_high_css($("[face=" + face + "]"));

    if (face != undefined && suit != undefined)
      set_high_css($("[suit=" + suit + "]").
                   filter("[face=" + face + "]"));
  };

  var set_high_css = function(card) {
    $(card).css('-webkit-box-shadow', '1px 1px 3px 3px gold');
  };

  var compare_card = function(a, b) {
    var a1 = new Number($(a).attr('face'));
    var b1 = new Number($(b).attr('face'));

    if (a1 > b1)
      return -1;
    else if (a1 < b1)
      return 1;
    else
      return 0;
  };

  var openbtn = function(key) {
    if (key == undefined)
      key = '#raise_number, #raise_range, #cmd_call, #cmd_raise, #cmd_fold, #cmd_check';

    $(key).removeClass('disabled').attr("disabled", false);
  };

  var disabled_button = function(key) {
    if (key == undefined)
      key = '#raise_number, #raise_range, #cmd_call, #cmd_raise, #cmd_fold, #cmd_check';

    $(key).addClass('disabled').attr("disabled", "disabled");
  };
    
  var is_enabled = function(o) {
    return !$(o).hasClass("disabled");
  }

  var is_actor = function() {
    return get_state().seat == game_state.actor;
  };

  var reg = function(protocol, callback) {
    $.pp.reg(protocol, function(o) {
      if (is_disable()) {
        return;
      }

      // filter log output
      switch(protocol) {
        case 'CANCEL':
          break;
        default:
          log([protocol, o]);
      }

      if ('gid' in o) {
        check_game(o);
      }

      callback(o);
    });
  };

  var show_hint = function(o) {
    if ('players' in o) {
      $(game.players > 1 ? '#wait_next' : '#wait_player').
        show();
    }
  };
  // }}}
  
  // game protocol {{{
  reg("GAME_DETAIL", function(game) { 
    show_hint(game);
    init_states(game);
  });

  reg("SEAT_DETAIL", function(seat) {
    init_state(seat);

    if (get_size() == seat.seat) {
      // 如果初始化时制定了座位位置
      // 则此时调用为noop
      display_states();
    }
  });

  // {{{ player state notify 
  reg("JOIN", function(notify) { 
    notify.state = PS_FOLD;
    init_state(notify);

    is_me(notify, function() {
      regenrate_seat_function(notify);
      var positions = trim_positions(notify.seat)

      for (var i = 1; i < positions.length; i++) {
        update_state({seat: i, position: positions[i]});
      };

      update_balance();
    });

    refresh_states();
  });

  reg("BALANCE_INFO", function(o) {
    $("#money").text("游戏幣: $" + o.amount);
    update_inplay(o.inplay);
    refresh_state();

    // 出局
    if (get_state().state == PS_OUT) {
      $(document).oneTime(2000, function() {
        hide_winner();
        show_buyin();
      });
    }
  });

  reg("SEAT_STATE", function(state) { 
    cancel_timer();
    update_state(state);
    refresh_state(state);

    is_me(state, function() {
      if (state.state == PS_OUT) {
        update_balance();
      }
    }, $.noop);
  });

  reg("ACTOR", function(actor) { 
    start_timer(actor.seat);

    var state = get_state(actor.seat);
    
    is_me(state, function() {
      openbtn();
    }, function() {
      disabled_button();
    });

    game_state.actor = state.seat;

    $('.actor_seat').removeClass('actor_seat');
    $(state.dom).addClass('actor_seat');
  });

  reg("BET_REQ", function(req) { 
    $('#raise_range, #raise_number').val(req.min).
      attr('min', req.min).
      attr('max', req.max);

    openbtn();

    if (req.call == 0) {
      disabled_button("#cmd_call");
      auto_check();
    }
    else {
      disabled_button("#cmd_check");
      auto_call();
    }
  });

  reg("RAISE", function(notify) { 
    var sum = notify.call + notify.raise;
    var state = get_state(get_seat_number(notify.pid));
    state.bet += sum;

    if (sum == 0) { // Player Check
      play_sound('check'); 
    } else {
      play_sound("bet");

      var bets = get_bets(sum);
      $.each(bets, function(i, x) {
        $('<img class="bet seat-bet-' + state.seat + '" />').
          attr("src", $.rl.img[x]).
          css(state.position.betting_ori).
          appendTo('#game_table').
          animate(random(state.position.betting, 7, 7), 450);
      });

      $(state.dom).
        children(".bet_label").
        css(state.position.betting_label).
        text(state.bet).
        show();
    }http://localhost/~jack/texas/index.html?usr=1010&pwd=pass&host=127.0.0.1

    sum_pot += sum;
  });

  reg("PHOTO_INFO", function(player) { 
    var photo = $.rl.img[player.photo]

    if (photo) {
      player.seat = get_seat_number(player.pid);
      player.photo = photo;
      update_state(player);
      refresh_state(player);
    }
  });
  // }}}

  // {{{ game state notify
  reg("CANCEL", function(notify) { 

    clear_table();
    $("#tips").show();

    update_states('bet', 0);
    update_states('rank', HC_HIGH_CARD);
    refresh_states();
  });

  reg("START", function(notify) { 

    clear_table();
    $("#tips").hide();

    update_states('rank', HC_HIGH_CARD);
  });

  var clear_table = function() {
    show_card = false;
    sum_pot = 0;
    share_card_index = 0;
    private_card_index = 0;

    $(".game_seat").children(".dealer").hide("slow");
    $(".game_seat").children(".card").hide("slow");


    $(".card").hide("slow");
    $(".private_card").hide("slow");
    $(".private_card").removeClass().addClass('private_card').addClass('card');
    $(".share_card").removeClass().addClass('share_card').addClass('card');
    $('.actor_seat').removeClass('actor_seat');

    hide_winner();
  };

  reg("DEALER", function(notify) { 

    notify.dealer = true;
    update_state(notify)
    $(get_state(notify).dom).children('.dealer').show();
  });

  reg("SBLIND", function(notify) { 

    notify.sb = true;
    update_state(notify)
  });

  reg("BBLIND", function(notify) { 

    notify.bb = true;
    update_state(notify)
  });

  reg("STAGE", function(notify) { 
    new_stage(notify.stage == 0);
  });

  reg("END", function(notify) { 
    sum_pot = 0;
    share_card_index = 0;
    private_card_index = 0;

    update_states('bet', 0);
    refresh_states();

  });
  // }}}

  // {{{ card notify 
  var private_card_positions = [{}, 
    {left: '100px', top: '30px'},
    {left: '120px', top: '25px'}];

  reg("PRIVATE", function(notify) { 
    private_card_index += 1;
    var seat_number = get_seat_number(notify.pid);

    $(get_private_card(seat_number, private_card_index)).
      css(private_card_positions[private_card_index]);

    set_card(get_private_card(seat_number, private_card_index),
             notify.face, notify.suit);

    play_sound('card');
  });

  reg("DRAW", function(notify) { 
    is_me(notify, $.noop, function() {
      var state = get_state(get_seat_number(notify.pid));

      $(state.dom).children('.background_card').
        css(state.position.card).show();

      $(state.dom).children('.private_card[sn=1]').
        css({left: '0px', top: '25px'});
      $(state.dom).children('.private_card[sn=2]').
        css({left: '20px', top: '25px'});

      play_sound('card');
    });
  });

  reg("SHARE", function(notify) { 
    play_sound('card');
    share_card_index += 1;
    set_card('#share_card_' + share_card_index, notify.face, notify.suit);
  });

  reg("SHOW", function(notify) { 

    var seat_number = get_seat_number(notify.pid);

    $(get_background_card(seat_number)).hide('slow');
    set_card(get_private_card(seat_number, 1), notify.face1, notify.suit1);
    set_card(get_private_card(seat_number, 2), notify.face2, notify.suit2);

    clear_high();
    show_card = true;
    play_sound('card');
  });
  // }}}
  //

  // {{{ showdown notify
  reg("HAND", function(notify) { 


    if (show_card == false) {
      clear_high();
    }

    switch (notify.rank) {
      case HC_PAIR:
        set_high(notify.high1);
        break;
      case HC_TWO_PAIR:
        set_high(notify.high1);
        set_high(notify.high2);
        break;
      case HC_FULL_HOUSE:
        set_high(notify.high1);
        set_high(notify.high2);
        break;
      case HC_THREE_KIND:
        set_high(notify.high1);
        break;
      case HC_FOUR_KIND:
        set_high(notify.high1);
        break;
      case HC_FLUSH:
        $("[suit=" + notify.suit + "]").
          sort(compare_card).
          slice(0, 5).
          each(function() {
            set_high_css($(this));
          });
        break;
      case HC_STRAIGHT:
        set_high(notify.high1);
        set_high(notify.high1 - 1);
        set_high(notify.high1 - 2);
        set_high(notify.high1 - 3);
        if (notify.high1 == CF_FIVE) {
          set_high(CF_ACE);
        } else {
          set_high(notify.high1 - 4)
        }
        break;
      case HC_STRAIGHT_FLUSH:
        set_high(notify.high1, notify.suit);
        set_high(notify.high1 - 1, notify.suit);
        set_high(notify.high1 - 2, notify.suit);
        set_high(notify.high1 - 3, notify.suit);
        if (notify.high1 == CF_FIVE) {
          set_high(CF_ACE, notify.suit);
        } else {
          set_high(notify.high1 - 4, notify.suit)
        }
        break;
      default:
        break;
    }

    var state = get_state(get_seat_number(notify.pid));
    state.rank = notify.rank;
    refresh_rank_nick(state);
  });

  reg("WIN", function(notify) { 
    
    var n = get_seat_number(notify.pid);

    var state = get_state(n)
    show_winner(state, notify.amount, notify.cost);

    state.inplay += (notify.amount - notify.cost);
    refresh_state(n);

    new_stage();
    share_pot([n]);
  });
  // }}}
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
    
  // generate game table DOM
  $("#game_table").setTemplateElement("game_table_template");
  $("#game_table").processTemplate({end: MAX_PLAYER});
});
// vim: fdm=marker

$(document).ready(function() {
  // game event {{{
  var game;

  $('#game').bind('activate', function(event, args) {

    $.extend(args, { dom: $(this) });

    game = null;
    game = new $.game(args);

    if ('buyin' in args) {
      send({cmd: "JOIN", seat: 0, buyin: buy_in});
    } else {
      send({cmd: "WATCH", seat: 0});
    }
  });
  // }}}

  // game protocol {{{
  reg("GAME_DETAIL", function(game) { 
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

  // {{{ utility
  function is_disable() { 
    return $('#game').css('display') == 'none'; 
  };

  function check_game(o) {
    if (!game)
      throw 'ERROR: not init game';

    if (gid != game.id)
      throw 'ERROR: not current game [' + o + ']';
  };

  function pickup_int(o, prop) {
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

  function reg(protocol, callback) {
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
  // }}}
});
// vim: fdm=marker

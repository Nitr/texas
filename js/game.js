$(document).ready(function() {
  var PS_EMPTY     = 0, // {{{
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
      PS_OUT       = 1024; // }}}

  var cur_pid = 0, cur_gid = 0, cur_seat = 0, 
      only_watching = false, playing = false, 
      pot = {}, positions = null, seats_size = 0;
  var seats = [], private_card_index = 0, share_card_index = 0;
  var show_all = false;

  // {{{ initialization
  var initialization = function(args) { 
    cur_gid = args.gid;
    cur_pid = $(document).data("pid");

    if (args.show_all == true)
      show_all = true;

    $("#game_table").setTemplateElement("game_table_template");
    $("#game_table").processTemplate({end: 10});
  }; 

  var init_seats = function(size) {
    seats_size = size;

    if (positions == null) {
      positions = size == 5 ? five_positions : nine_positions;
    }

    // init seats outer position
    for (var i = 1; i <= size ; i++) {
      $("#game_seat_" + i).css(positions[i].outer);
    }
  };

  var get_seat = function(sn) {
    return $("#game_seat_" + sn);
  };

  var get_seat_number = function(pid) {
    var sn = 0;
    $.each(seats, function(i, s) {
      if (s == undefined)
        return;

      if (s.pid == pid) {
        sn = s.sn;
      }
    });

    return sn;
  };

  var get_poker = function(face, suit) {
    var a = new Number(face << 8 | suit);
    return $.rl.poker[a.toString()];
  };

  // 更新座位信息,需要参数中携带座位编号,昵称,带入金额.
  var update_seat = function(seat) {
    var s = get_seat(seat.sn);
    if (seat.state == PS_EMPTY) {
      s.hide();
      seats[seat.sn] = undefined;
    } else {
      s.show("normal");

      if (seats[seat.sn] == undefined) {
        seat.betting = 0;
        seats[seat.sn] = seat;
      }
      else {
        seat.betting = seats[seat.sn].betting;
        seats[seat.sn] = seat;
      }
      
      // 对玩家显示区进行基本设置
      s.children('.inplay').text(seat.inplay).parent().
        children('.nick').text(seat.nick).parent().
        children('.photo').attr('player', seat.pid);

      $.ws.send($.pp.write({cmd: "PHOTO_QUERY", id: seat.pid}));
    }
  };

  var trim_position = function(offset) {
    var t = positions.shift();
    for (var i = 1; i <= offset; i++) {
      positions.unshift(positions.pop());
    }
    positions.unshift(t);
  };

  var fan = function(i) {
    if (i == 0)
      return i;
    else if (i > 0)
      return 0 - i;
    else
      return Math.abs(i);
  };

  var betting = function(seat, bet) {
    var b = get_seat(seat).
      children(".blind").
      css(positions[seat].blind).
      text(bet).
      show();

    // generate bet animation
    $('<img />').
      attr("src", $.rl.img["betting_1"]).
      css(positions[seat].blind.ori).
      appendTo(b).
      animate({left: "0px", top: "0px"}, 450);
  };

  var showall = function() {
    if (show_all == false)
      return; 

    console.log('test');

    for (var i = 1; i < seats_size + 1; i ++) {
      update_seat({inplay: 123456, sn: i, nick: '玩家昵称', pid: 10, state: PS_PLAY});
      get_seat(i).children('.blind').css(positions[i].blind).text("1000").show();
      get_seat(i).children('.card').css(positions[i].card).show();
    }
  };
  // }}}

  // event {{{
  $('#game').bind('active', function(event, args) {
    initialization(args);

    // not setting seat is watch game
    var cmd = only_watching == true ? {cmd: "WATCH", gid: cur_gid} : 
      {cmd: "JOIN", gid: cur_gid, seat: args.seat, buyin: 100};
    $.ws.send($.pp.write(cmd));
  });

  $('#cmd_hall').click(function() {
    for (var i = 1; i <= seats_size; i++) {
      betting(i, 100);
    }
  });

  $('#cmd_fold').click(function() {
    $.ws.send($.pp.write({cmd: "FOLD", gid: cur_gid}));
  });

  $('#cmd_call').click(function() {
    $.ws.send($.pp.write({cmd: "RAISE", gid: cur_gid, amount: 0}));
  });

  $('#cmd_raise').click(function() {
    a = parseInt($('#raise_range').val());
    $.ws.send($.pp.write({cmd: "RAISE", gid: cur_gid, amount: a}));
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

  // protocol {{{
  $.pp.reg("GAME_DETAIL", function(detail) { 
    console.log([tt(), "game_detail", detail]);

    if (detail.gid != cur_gid) 
      throw 'error notify_game_detail protocol';

    init_seats(detail.seats);
  });

  $.pp.reg("SEAT_STATE", function(seat) { 
    if (is_disable())
      return;

    console.log(
      [tt(),"seat_state", "seat", seat.sn, "pid", 
        seat.pid, "state", seat.state, "inplay", 
        seat.inplay, "nick", seat.nick]
    );

    if (seat.gid == cur_gid) {
      update_seat({inplay: 1000, sn: seat.sn, nick: seat.nick, pid: seat.pid, state: seat.state});
      return;
    }

    throw 'error seat_state protocol'
  }); 

  $.pp.reg("PHOTO_INFO", function(player) { 
    if (is_disable())
      return;

    var photo = $("#game_table div .photo:[player=" + player.id + "]");

    if (player.photo.indexOf('def_face_') == 0)
      $(photo).attr('src', $.rl.img[player.photo]);
    else if (player.photo.indexOf('base64'))
      $(photo).attr('src', player.photo);
    else 
      $(photo).attr('src', $.rl.img.def_face_0);
  });

  $.pp.reg("CANCEL", function(notify) { 
    if (notify.gid == cur_gid) {
      console.log([tt(),'notify_cancel', notify]);
      return;
    }

    throw 'error notify_cancel protocol'
  });

  $.pp.reg("START", function(notify) { 
    if (notify.gid == cur_gid) {
      console.log([tt(),'notify_start', notify]);
      return;
    }

    throw 'error notify_start protocol'
  });

  $.pp.reg("JOIN", function(notify) { 
    console.log(
      [tt(),'notify_join', "pid", notify.pid, "nick", notify.nick,
       "buyin", notify.buyin, "seat", notify.seat, notify
    ]);

    if (notify.gid == cur_gid) {
      if (notify.pid == cur_pid) {
        // 根据当前玩家的座位号调整一次座位顺序
        trim_position(notify.seat - 1);
        init_seats(seats_size);
      }

      update_seat({
        sn: notify.seat, pid: notify.pid, 
        nick: notify.nick, inplay: notify.buyin
      });

      showall();
      return;
    }

    throw 'error notify_join protocol';
  });

  

  $.pp.reg("BUTTON", function(notify) { 
    console.log([tt(),'notify_button', notify]);

    var s = get_seat(notify.seat);
    s.children('.button').show();
  });

  $.pp.reg("SBLIND", function(notify) { 
    console.log([tt(),'notify_sb', notify]);
  });

  $.pp.reg("BBLIND", function(notify) { 
    console.log([tt(),'notify_bb', notify]);
  });

  $.pp.reg("BET_REQ", function(req) { 
    console.log([tt(),'notify_bet_request', 'call', req.call, 'min', req.min, 'max', req.max]);

    $('#raise_range').
      attr('min', req.min).
      attr('max', req.max).
      val(req.min);
  });

  $.pp.reg("PRIVATE", function(notify) { 
    console.log([tt(),'notify_private', 'pid', notify.pid, 'suit', notify.suit, 'face', notify.face]);

    private_card_index += 1;
    $("#private_card_" + private_card_index).attr('src', get_poker(notify.face, notify.suit)).show('normal');
  });

  $.pp.reg("DRAW", function(notify) { 
    //console.log([tt(),'notify_draw', 'pid', notify.pid, 'suit', notify.suit, 'face', notify.face]);
    if (cur_pid != notify.pid) {
      var sn = get_seat_number(notify.pid)
      get_seat(sn).children('.card').css(positions[sn].card).show();
    }
  });

  $.pp.reg("SHARE", function(notify) { 
    console.log([tt(),'notify_share', 'suit', notify.suit, 'face', notify.face]);
    share_card_index += 1;
    $("#share_card_" + share_card_index).attr('src', get_poker(notify.face, notify.suit)).show('normal');
  });

  $.pp.reg("STAGE", function(notify) { 
    console.log([tt(),'notify_stage', 'stage', notify.stage]);
  });

  $.pp.reg("RAISE", function(notify) { 
    console.log([tt(),'notify_raise', 'pid', notify.pid, 'raise', notify.raise, 'call', notify.call]);

    var sum = notify.call + notify.raise;
    var sn = get_seat_number(notify.pid)

    seats[sn].betting = seats[sn].betting + sum;
    get_seat(sn).children('.blind').css(positions[sn].blind).text(seats[sn].betting).show();
  });

  $.pp.reg("SHOW", function(notify) { 
    console.log([tt(),'notify_show', 'pid', notify.pid, 'card1', notify.face1, notify.suit1, 'card2', notify.face2, notify.suit2]);
  });

  $.pp.reg("HAND", function(notify) { 
    console.log([tt(),'notify_hand', 'pid', notify.pid, 'rank', notify.rank, 'face', notify.face1, notify.face2]);
  });

  $.pp.reg("END", function(notify) { 
    console.log([tt(),'----------------------notify_end----------------------']);
    ////pot = {};
  });

  $.pp.reg("WIN", function(notify) { 
    console.log([tt(),'notify_win', 'pid', notify.pid, 'amount', notify.amount]);
  });

  var return_hall = function() {
    //$('#game').hide("normal");
    //$('#hall').show("normal").trigger('active', cur_game);
  };
  // }}}

  var tt = function() {
    a = new Date();
    return a.getMinutes() + ":" + a.getSeconds();
  };

  var is_disable = function() { 
    return $('#game').css('display') == 'none'; 
  };

  var convert_points = function(points) {
    return $.map(points, function(pos) {
      var o = pos.outer.split(',');
      var b = pos.blind.split(',');
      var c = pos.card.split(',');

      return {
        outer: {left: o[0] + 'px', top: o[1] + 'px'},
        card : {left: c[0] + 'px', top: c[1] + 'px'},
        blind: {
          left: b[0] + 'px', top: b[1] + 'px',
          ori: {
            left: new Number(fan(new Number(b[0])) + 50).toString() + "px", 
            top: new Number(fan(new Number(b[1])) + 50).toString() + "px"
          }
        }
      };
    });
  };

  var five_positions = convert_points([
    {outer: "0,0", blind: "0,0", card: "0,0"},
    {outer: "435,350", blind: "90,-10", card: "90,30"},
    {outer: "117,230", blind: "110,5", card: "90,30"},
    {outer: "292,20", blind: "55,130", card: "90,60"},
    {outer: "625,20", blind: "-10,130", card: "-52,60"},
    {outer: "801,230", blind: "-63,5", card: "-51,30"}
  ]);

  var nine_positions = convert_points([
    {outer: "0,0", blind: "0,0", card: "0,0"},
    {outer: "435,350", blind: "90,-10", card: "90,30"},
    {outer: "233,350", blind: "40,-25", card: "90,28"},
    {outer: "117,230", blind: "110,5", card: "90,30"},
    {outer: "145,60", blind: "145,95", card: "90,40"},
    {outer: "342,20", blind: "50,125", card: "90,60"},
    {outer: "565,20", blind: "-5,125", card: "-52,60"},
    {outer: "766,60", blind: "-95,95", card: "-52,40"},
    {outer: "801,230", blind: "-63,5", card: "-51,30"},
    {outer: "680,350", blind: "20,-25", card: "-51,28"}
  ]);
});
// vim: fdm=marker

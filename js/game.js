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
      pot = {}, positions = null, all_seats = 0;

  // {{{ initialization
  var initialization = function(args) { 
    console.log(["active_game", args]);

    cur_gid = args.gid;
    cur_pid = $(document).data("pid");
    only_watching = args.seat == undefined;
    $('#game_commands > *').attr('disabled', 'true');

    $("#game_table").setTemplateElement("game_table_template");
    $("#game_table").processTemplate({end: 10});
  }; 

  var init_seats = function(seats) {
    all_seats = seats;

    if (positions == null) {
      positions = seats == 5 ? five_positions : nine_positions;
    }

    // init seats outer position
    for (var i = 1; i <= seats; i++) {
      $("#game_seat_" + i).css(positions[i].outer);
    }
  };

  var get_seat = function(sn) {
    return $("#game_seat_" + sn);
  };

  // 更新座位信息,需要参数中携带座位编号,昵称,带入金额.
  var update_seat = function(seat) {
    var s = get_seat(seat.sn);
    if (seat.state == PS_EMPTY) {
      s.hide();
    } else {
      s.show("normal");
      
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
    update_seat({sn: 1, nick: "Nick", inplay: 1000, pid: 3});
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

  $.pp.reg("PHOTO_INFO", function(player) { // {{{
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
        init_seats(all_seats);
      }

      update_seat({
        sn: notify.seat, pid: notify.pid, 
        nick: notify.nick, inplay: notify.buyin
      });

      //for (var i = 1; i < 6; i ++) {
        //update_seat({inplay: 123456, sn: i, nick: '玩家昵称', pid: 10, state: PS_PLAY});
      //}
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
  });

  $.pp.reg("DRAW", function(notify) { 
    //console.log([tt(),'notify_draw', 'pid', notify.pid, 'suit', notify.suit, 'face', notify.face]);
  });

  $.pp.reg("SHARE", function(notify) { 
    console.log([tt(),'notify_share', 'suit', notify.suit, 'face', notify.face]);
  });

  $.pp.reg("STAGE", function(notify) { 
    console.log([tt(),'notify_stage', 'stage', notify.stage]);
  });

  $.pp.reg("RAISE", function(notify) { 
    console.log([tt(),'notify_raise', 'pid', notify.pid, 'raise', notify.raise, 'call', notify.call]);
    //if (pot[notify.pid] == undefined)
      //pot[notify.pid] = 0;

    //pot[notify.pid] += notify.call + notify.raise
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
      o = pos.outer.split(',');
      return {outer: {left: o[0] + 'px', top: o[1] + 'px'}};
    });
  };

  var five_positions = convert_points([{outer: "0,0"},
    {outer: "435,350"},
    {outer: "117,230"},
    {outer: "322,20"},
    {outer: "585,20"},
    {outer: "801,230"}
  ]);

  var nine_positions = convert_points([{outer: "0,0"},
    {outer: "435,350"},
    {outer: "233,350"},
    {outer: "117,230"},
    {outer: "145,60"},
    {outer: "342,20"},
    {outer: "565,20"},
    {outer: "766,60"},
    {outer: "801,230"},
    {outer: "680,350"}
  ]);
});
// vim: fdm=marker

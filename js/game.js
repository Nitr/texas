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

  var cur_pid = 0, cur_gid = 0, cur_seat = 0, only_watching = false, playing = false;
  var seats = [],  // 存放与服务器对应的座位数据
      pot = {};

  $('#game').bind('active', function(event, args) { // {{{
    console.log(["active_game", args]);
    cur_gid = args.gid;
    only_watching = args.seat == undefined;
    cur_pid = $(document).data("pid");

    $('#game > #cmds > button').attr('disabled', 'true');

    // not setting seat is watch game
    if (only_watching) {
      $.ws.send($.pp.write({
        cmd: "WATCH", gid: cur_gid
      }));
    } else {
      // 等收到notify_join的消息
      // 激活游戏相关内容
      $.ws.send($.pp.write({
        cmd: "JOIN", gid: cur_gid, 
        seat: args.seat, buyin: 100
      }));
    }
  }); // }}}

  $('#cmd_hall').click(function() {
    //$.ws.send($.pp.write({cmd: "UNWATCH", gid: cur_gid}));
    //return_hall();
    console.log(["pot", pot]);
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

  var is_disable = function() { return $('#game').css('display') == 'none'; };

  $.pp.reg("GAME_DETAIL", function(detail) { 
    if (detail.gid == cur_gid) {
      console.log([tt(), "game_detail", detail]);
      return;
    }

    throw 'error notify_game_detail protocol'
  });

  $.pp.reg("SEAT_STATE", function(seat) { 
    if (is_disable())
      return;

    if (seat.gid == cur_gid) {
      if (seat.state == PS_EMPTY) {
        seats[seat.sn] = undefined;
        console.log([tt(),"seat_state", "seat", seat.sn, "undefined"]); 
      } else {
        seats[seat.sn] = seat;
        console.log(
          [tt(),"seat_state", "seat", seat.sn, "pid", 
           seat.pid, "state", seat.state, "inplay", 
           seat.inplay, "nick", seat.nick]
        );
      }

      return;
    }

    throw 'error seat_state protocol'
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
    if (notify.gid == cur_gid) {
      seats[notify.seat] = {
        seat: notify.seat, pid: notify.pid, st: PS_PLAY, 
        is_b: false, is_sb: false, is_bb: false
      };

      if (notify.pid == cur_pid) {
        cur_seat = notify.seat; 
        // 轮转座位
      }

      console.log([tt(),'notify_join', "pid", notify.pid, "buyin", notify.buyin, "seat", notify.seat, notify]);
      return;
    }

    throw 'error notify_join protocol'
  });

  $.pp.reg("BUTTON", function(notify) { 
    seats[notify.seat].is_b = true;
    console.log([tt(),'notify_button', notify]);
  });

  $.pp.reg("SBLIND", function(notify) { 
    seats[notify.seat].is_sb = true;
    console.log([tt(),'notify_sb', notify]);
  });

  $.pp.reg("BBLIND", function(notify) { 
    seats[notify.seat].is_bb = true;
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
    pot = {};
  });

  $.pp.reg("WIN", function(notify) { 
    console.log([tt(),'notify_win', 'pid', notify.pid, 'amount', notify.amount]);
  });
  var return_hall = function() {
    console.log(["seat", cur_seat, "pid", cur_pid, "gid", cur_gid, "seats", seats]);
    //$('#game').hide("normal");
    //$('#hall').show("normal").trigger('active', cur_game);
  };

  var tt = function() {
    a = new Date();
    return a.getMinutes() + ":" + a.getSeconds();
  }

});
// vim: fdm=marker

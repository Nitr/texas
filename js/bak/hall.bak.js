$(function() {
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

  $('#hall').bind('setup', function() {
    $(this).show();
  });


  $('#hall').bind('return', function(event) {
    
  });

  $('#hall').bind('active', function(event) {
    // TODO: 保存每次搜索过的条件并在激活的时候重新读取
    $.ws.send($.pp.write(gen_game_query([1, 0, 0, 0, 0, 0, 0])));
    $.ws.send($.pp.write({cmd: "BALANCE_QUERY"}));
  });

  $('#cmd_watch').click(function() {
    active_game();
  });

  $('#cmd_join').click(function() {
    active_game(0); // auto select seat position.
  });

  $.pp.reg("BALANCE_INFO", function(o) {
    if (is_disable())
      return;

    $("#money").text("游戏幣: $" + o.amount);
  });

  $.pp.reg("GAME_INFO", function(game_info) { // {{{
    // 对于已经加载过的数据不需要重新构建列表
    // 找到对应的行然后更新其内容即可
    var inline = $('#games_wrapper tbody tr[gid=' + game_info.id + ']').children();

    if (inline.length > 0) {
      $(inline[2]).text(game_info.joined + ' / ' + game_info.seats);
      $(inline[3]).text(game_info.waiting);

      if ($(inline).parent().hasClass("selected")) {
        $(inline).parent().trigger('update');
      }

      return;
    }

    games.push(game_info);

    if (games.length == game_info.count) {
      $('#games_wrapper tbody').processTemplate({datas: games});

      $('#games_wrapper tbody tr').bind('update', function() {
        reset_seats($(this).attr('gid'), $(this).attr('seats'));
        $.ws.send($.pp.write({cmd: "SEAT_QUERY", gid: cur_game}));
      });

      $('#games_wrapper tbody tr').click(function() {
        if ($(this).hasClass('selected'))
          return;

        $(this).parent().children().removeClass("selected");
        $(this).addClass("selected");

        $(this).trigger('update');
      }).eq(0).click();

      $(document).oneTime(1000, function() {
        $('#cmd_join').click();
      });
    }
  }); // }}}

  $.pp.reg("SEAT_STATE", function(seat) { // {{{

    if (is_disable())
      return;

    if (seat.gid == cur_game) {
      if (seat.state != PS_EMPTY) {
        $.ws.send($.pp.write({cmd: "PHOTO_QUERY", id: seat.pid}));

        // 使用seat的序号与标签顺序对应
        $('.seat:eq(' + (seat.seat - 1) + ')').show('normal').
          children('.photo').attr('player', seat.pid).parent().
          children('.inplay').text(seat.inplay).parent().
          children('.nick').text(seat.nick);
      } else {
        // 没有人游戏的座位可以作为
        // 自动加入游戏的座位的位置
        there_can_join(seat.seat);
      }
    }
  }); // }}}

  $.pp.reg("PHOTO_INFO", function(player) { // {{{
    if (is_disable())
      return;

    var photo = $("#seats_wrapper div .photo:[player=" + player.pid + "]");

    if (player.photo.indexOf('def_face_') == 0)
      $(photo).attr('src', $.rl.img[player.photo]);
    else if (player.photo.indexOf('base64'))
      $(photo).attr('src', player.photo);
    else 
      $(photo).attr('src', $.rl.img.def_face_0);
  }); // }}}

  // {{{ private
  var active_game = function(seat) {
    $('#hall').hide();
    var cmd = {pid: $(document).data("pid"), gid: cur_game, seat: seat};

    cmd.debug = $.url.get("debug") != undefined;
    cmd.auto = $.url.get("auto") != undefined;

    if ($.url.get("buyin") == undefined) {
      cmd.buyin = 900;
    } else {
      cmd.buyin = new Number($.url.get("buyin"));
    }

    if (seat == undefined) {
      $('#game').show("normal").trigger("watching", cmd);
    } else {
      $('#game').show("normal").trigger("join", cmd);
    }
  };

  var gen_game_query = function(arr) {
    var o = {cmd: 'GAME_QUERY', game_type: 0};
    o.waiting = arr.pop();
    o.waiting_op = arr.pop();
    o.joined = arr.pop();
    o.joined_op = arr.pop();
    o.seats = arr.pop();
    o.seats_op = arr.pop(); 
    o.limit_type = arr.pop(); 
    return o;
  }

  var initialization = function() {
    var generate_style = function(points) {
      return $.map(points, function(p) {
        return {left: p.x + 'px', top: p.y + 'px'};
      });
    }

    five_table_style = generate_style([
      {x: 299, y: 170}, {x: 78, y: 110},
      {x: 185, y: 1}, {x: 399, y: 1},
      {x: 518, y: 110}]);
    eight_table_style = generate_style([
      {x: 418, y: 170}, {x: 300, y: 170}, {x: 178, y: 170},
      {x: 78, y: 125}, {x: 108, y: 15},
      {x: 230, y: 1}, {x: 354, y: 1},
      {x: 476, y: 15}, {x: 518, y: 125}]);
  }

  var reset_seats = function(gid, seats_count) {
    seats = [];
    empty_seats = [];
    cur_game = gid;
    cur_seats_count = seats_count;

    var styles = cur_seats_count == 5 ? five_table_style :
      eight_table_style;

    $(".seat").each(function(index) {
      $(this).hide();

      // 使用seat的序号与标签顺序对应
      if (styles[index] != undefined)
        $(this).css(styles[index]).children('.photo').attr('src', $.rl.img.def_face_0);
    });

    $('#cmd_join').attr('disabled', 'true');
  }

  var there_can_join = function(seat_sn) {
    empty_seats.push(seat_sn);
    $('#cmd_join').removeAttr('disabled');
  }

  var get_auto_join_seat = function() {
    // TODO: 随机获取自动加入的座位编号
    var i = Math.floor(Math.random() * empty_seats.length);
    return empty_seats[i];
  }
  // }}}

  initialization();
});
// vim: fdm=marker


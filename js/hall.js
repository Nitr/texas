$(function() {
  var cur_game = 0, cur_scount = 0, auto_join_seat = 0;

  var games = [], seats = [],
      five_table_style = [], 
      eight_table_style = [];

  $('#hall').bind('setup', function() {
    $('#games_table').fixedHeaderTable({ footer: false, cloneHeadToFoot: false, fixedColumn: false, themeClass: 'games-table', height: '248px'});
  });

  $('#hall').bind('active', function() {
    $.ws.send($.pp.write(gen_game_query([1, 0, 0, 0, 0, 0, 0])));
  });

  $('#cmd_watch').click(function() {
    $.ws.send($.pp.write({cmd: "WATCH", game: game }));
    switch_game();
  });

  $('#cmd_join').click(function() {
    $.ws.send($.pp.write({cmd: "WATCH", game: game }));
    $.ws.send($.pp.write({cmd: "JOIN", game: game, seat: play_seat, buyin: 100}));
    switch_game();
  });

  $.pp.reg("GAME_INFO", function(game_info) { // {{{
    games.push(game_info);

    if (games.length == game_info.count) {
      $('#games_wrapper tbody').processTemplate({datas: games});
      $('#games_wrapper tbody tr').click(function() {

        if ($(this).hasClass('selected'))
          return;

        $(this).parent().children().removeClass("selected");
        $(this).addClass("selected");

        resetSeats($(this).attr('gid'), $(this).attr('seats'));
        $.ws.send($.pp.write({cmd: "SEAT_QUERY", gid: cur_game}));
      }).eq(0).click();
    }
  }); // }}}

  $.pp.reg("SEAT_STATE", function(seat) { // {{{
    seat.nick = '测(' + seat.sn + ')试';
    seat.inplay = '10000';

    if (seat.game == cur_game) {
      if (seat.state != 1) {
        //$.ws.send($.pp.write({cmd: "PHOTO_QUERY", id: obj.pid}));

        // 使用seat的序号与标签顺序对应
        $('.seat:eq(' + (seat.sn - 1) + ')').show('normal').
          children('.inplay').text(seat.inplay).parent().
          children('.nick').text(seat.nick);
      } else {
        // 没有人游戏的座位可以作为
        // 自动加入游戏的座位的位置
        auto_join_seat = seat.id;
      }
    }
  }); // }}}

  $.pp.reg("PHOTO_INFO", function(obj) { // {{{
    var pid = ".photo-" + obj.id;
    // #开头直接找到对应的id使用src负值
    if (obj.photo.indexOf('#') == 0 && $(obj.photo).length >= 0)
      $(pid).attr('src', $(obj.photo).attr('src'));
    // base64开头使用src直接负值
    else if (obj.photo.indexOf('data:image') == 0)
      $(pid).attr('src', obj.photo);
    // 最终默认使用def_face负值
    else 
      $(pid).attr('src', $('#def_face').attr('src'));

    $(pid).parent().show();
  }); // }}}

  // {{{ private
  var switch_game = function() {
    $('#hall').hide("normal");
    $('#game').show("normal").trigger("startup", cur_game);
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
    $("#games_wrapper tbody").setTemplateElement("games_temp");
    $("#seats_wrapper").setTemplateElement("seats_temp");
    $("#seats_wrapper").processTemplate({end: 10});

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

  var resetSeats = function(gid, seats_count) {
    setas = [];
    cur_game = gid;
    cur_seats_count = seats_count;

    var styles = cur_seats_count == 5 ? five_table_style :
      eight_table_style;

    $(".seat").each(function(index) {
      $(this).hide();

      // 使用seat的序号与标签顺序对应
      if (styles[index] != undefined)
        $(this).css(styles[index]).children('.photo').attr('src', $.rl.img.def_face_1);
    });
  }
  // }}}

  initialization();
});
// vim: fdm=marker

$(function() {
  var five_point = [{},
    {x: 299, y: 183},
    {x: 98, y: 120},
    {x: 185, y: 17},
    {x: 399, y: 17},
    {x: 498, y: 120}
  ];

  var eight_point = [{},
    {x: 379, y: 183},
    {x: 205, y: 183},
    {x: 90, y: 150},
    {x: 98, y: 65},
    {x: 205, y: 17},
    {x: 379, y: 17},
    {x: 498, y: 65},
    {x: 490, y: 150}
  ];
  
  var games = [], seats = [];
  var gid = 0, scount = 0, play_seat = 0;

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

  $("#games_wrapper tbody").setTemplateElement("games_temp");
  $("#seats_wrapper").setTemplateElement("seats_temp");
  $("#seats_wrapper").processTemplate({end: 8});

  $(".seat").each(function() {
    $(this).attr("style", "top: " + eight_point[$(this).attr("seat")].y + "px; left: " + eight_point[$(this).attr("seat")].x + "px;").hide();;
  });

  $.pp.reg("GAME_INFO", function(obj) {
    games.push(obj);

    if (games.length != obj.game_count) 
      return;

    $('#games_wrapper tbody').processTemplate({datas: games});
    $('#games_table').fixedHeaderTable({ footer: false, cloneHeadToFoot: false, fixedColumn: false, themeClass: 'games-table', height: '248px'});


    $('#games_table tbody tr').click(function() {
      if ($(this).attr('gid') == gid)
        return;

      //遍历所有的行，移除class:selected
      $.each($("#games_table tbody tr"), function(i, n) {
        $(n).removeClass("selected");
      });

      //给当前行添加class:selected
      $(this).addClass("selected");

      seats = [];
      gid = $(this).attr('gid');
      scount = $(this).attr('seats');
      play_seat = 0;

      $('.seat').hide("normal");
      $('.seat > .photo').attr('src', $("#def_face").attr('src'));
      $.ws.send($.pp.write({cmd: "SEAT_QUERY", gid: gid}));
    }).eq(0).click();
  });

  $(".games tfoot .blinds").click(function() {
    //games = [];
    $.ws.send($.pp.write(gen_game_query([1, 0, 0, 0, 0, 0, 0])));
    $.each($(".games tfoot .blinds"), function(i, n) {
      $(n).removeClass("selected");
    });
    //给当前行添加class:selected
    $(this).addClass("selected");
  });

  $.pp.reg("SEAT_STATE", function(obj) {
    if (obj.gid != gid)
      return;

    console.log([obj]);

    if (obj.state == 0) {
      play_seat = obj.seat;
      return;
    }

    $.ws.send($.pp.write({cmd: "PHOTO_QUERY", id: obj.pid}));

    $('#seat-' + obj.seat + ' > .photo').addClass('photo-' + obj.pid);
    $('#seat-' + obj.seat + ' > .inplay').text(obj.inplay);
    $('#seat-' + obj.seat + ' > .nick').text(obj.nick);
  });

  $.pp.reg("PHOTO_INFO", function(obj) {
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
  });

  var switch_game = function() {
    $('#hall').hide("normal");
    $('#game').show("normal").trigger("startup", gid);
  };

  $('#cmd_watch').click(function() {
    $.ws.send($.pp.write({cmd: "WATCH", gid: gid }));
    switch_game();
  });

  $('#cmd_join').click(function() {
    $.ws.send($.pp.write({cmd: "WATCH", gid: gid }));
    $.ws.send($.pp.write({cmd: "JOIN", gid: gid, seat: play_seat, buyin: 100}));
    switch_game();
  });
});

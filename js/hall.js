$(function() {
  var five_point = [{},
    {x: 223, y: 211},
    {x: 49, y: 148},
    {x: 145, y: 17},
    {x: 374, y: 17},
    {x: 438, y: 148}
  ];
  
  var games = [], seats = [];
  var gid = 0, scount = 0;

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

  $("#games_wrapper").setTemplateElement("games_temp");
  $("#seats_wrapper").setTemplateElement("seats_temp");
  $("#seats_wrapper").processTemplate({end: 8});

  $.pp.reg("PLAYER_INFO", function(obj) {
    $("#login").hide();
    $("#hall").show();
    $("#usr").show();
    $("#photo").attr("src", "" + obj.photo);
    $("#nick").text("昵称: " + obj.nick);
    $("#money").text("游戏币: " + obj.inplay);
    $('#page').unblock();

    $("#hall").show();
    $.ws.send($.pp.write(gen_game_query([1, 0, 0, 0, 0, 0, 0])));
  });

  $.pp.reg("GAME_INFO", function(obj) {
    games.push(obj);
    $("#games_wrapper").processTemplate({datas: games});

    $("#games_wrapper tr").click(function() {
      if ($(this).attr('gid') == gid)
        return;

      //遍历所有的行，移除class:selected
      $.each($("#games_wrapper tr"), function(i, n) {
        $(n).removeClass("selected");
      });

      //给当前行添加class:selected
      $(this).addClass("selected");
      seats = [];
      gid = $(this).attr('gid');
      scount = $(this).attr('seats');

      $('.seat').hide();
      $.ws.send($.pp.write({cmd: "SEAT_QUERY", gid: gid}));
    });

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

    $('#seat' + obj.seat).show('normal').attr("style", "top: " + five_point[obj.seat].y + "px; left: " + five_point[obj.seat].x + "px;");
    $('#seat' + obj.seat + ' > .inplay').text(obj.inplay);
    $('#seat' + obj.seat + ' > .nick').text(obj.pid);
  });
});

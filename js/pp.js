$(document).ready(function() {
  $.ws.defaults.onmessage = $.pp.onmessage;
  $("#games_table").setTemplateElement("games_temp");
  $("#seats_table").setTemplateElement("seats_temp");
  var cmd_login = {cmd: "LOGIN", usr: $.url.get("usr"), pass: "pass"};
  var games = new Object();
  var seats = new Object();
  games.datas = [];
  seats.datas = [];

  // Notify Register Processer {{{ 
  $.pp.reg("LOGIN", function(obj) {
    $.ws.send($.pp.write({cmd: "PLAYER_QUERY", id: obj.id}));
  });

  $.pp.reg("ERROR", function(obj) {
    console.log(obj);
    $.unblockUI();
  });

  $.pp.reg("PONG", function(obj) {
    $("#lab_ping").text(obj.send - obj.orign_send);
    $.unblockUI();
  });

  $.pp.reg("PLAYER_INFO", function(obj) {
    $("#lab_nick").text(obj.nick);
    $("#lab_location").text(obj.location);
    $("#lab_inplay").text(obj.inplay);
    $("#img_photo").attr("src", "" + obj.photo);
    $.unblockUI();
  });

  $.pp.reg("GAME_INFO", function(obj) {
    games.datas.push(obj);
    $("#games_table").processTemplate(games);
    $(".cmd_seats_state").bind("click", function() {
      seats.datas = [];
      seats.gid = $(this).attr("gid");
      $.ws.send($.pp.write({cmd: "SEAT_QUERY", gid: seats.gid}));
    });
    $.unblockUI();
  });

  $.pp.reg("SEAT_STATE", function(obj) {
    seats.datas.push(obj);
    $("#seats_table").processTemplate(seats);
    $(".cmd_join").bind("click", function() {
      var cmd = {cmd: "JOIN", gid: $(this).attr("gid"), seat: $(this).attr("seat"), buyin: 100};
      $.ws.send($.pp.write(cmd));
    });
    $(".cmd_watch").bind("click", function() {
      $.ws.send($.pp.write({cmd: "WATCH", gid: $(this).attr("gid")}));
    });
    $(".cmd_leave").bind("click", function() {
      $.ws.send($.pp.write({cmd: "LEAVE", gid: $(this).attr("gid")}));
    });
  });
  // }}}

  $("#cmd_login").click(function() {
    $.ws.send($.pp.write(cmd_login));
    $.blockUI({message: '<h3>REQUEST PROTOCOL</h3>'});
  });

  $("#cmd_logout").click(function() {
    $.ws.send($.pp.write({cmd: "LOGOUT"}));
  });


  $("#cmd_game_query").click(function() {
    $.blockUI({message: '<h3>REQUEST PROTOCOL - GAME_QUERY</h3>'});
    games.datas = [];
    $.ws.send($.pp.write(gen_game_query([1, 0, 0, 0, 0, 0, 0])));
  });

  $("#cmd_ping").click(function() {
    $.ws.send($.pp.write({cmd: "PING"}));
    $.blockUI({message: '<h3>PING ...</h3>'});
  });

  // Auto Login
  $("#cmd_login").click();
});

function gen_game_query(arr) {
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

// vim: fdm=marker

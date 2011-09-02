$(document).ready(function() {
  $.ws.defaults.onmessage = $.pp.onmessage;

  $.pp.reg("LOGIN", function(obj) {
    $.ws.send($.pp.write({cmd: "PLAYER_QUERY", id: obj.id}));
  });

  $.pp.reg("ERROR", function(obj) {
    console.log(obj);
    $.unblockUI();
  });

  $.pp.reg("GAME_INFO", function(obj) {
    console.log(obj);
    $.unblockUI();
  });

  $("#cmd_login").click(function() {
    var cmd = {cmd: "LOGIN", usr: '1000', pass: 'pass'};
    $.ws.send($.pp.write(cmd));
    $.blockUI({message: '<h3>REQUEST PROTOCOL</h3>'});
  });

  $("#cmd_logout").click(function() {
    $.ws.send($.pp.write({cmd: "LOGOUT"}));
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

  $("#cmd_game_query").click(function() {
    $.blockUI({message: '<h3>REQUEST PROTOCOL - GAME_QUERY</h3>'});
    $.ws.send($.pp.write(gen_game_query([0, 0, 0, 0, 0, 0, 0])));
  });

  $("#cmd_ping").click(function() {
    $.ws.send($.pp.write({cmd: "PING"}));
    $.blockUI({message: '<h3>PING ...</h3>'});
  });
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

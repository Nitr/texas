$(document).ready(function() {
  var user_id = 0;
  $.ws.defaults.onmessage = $.pp.onmessage;

  $.pp.reg("LOGIN", function(obj) {
    console.log(obj.notify, obj.id);
    user_id = obj.id;
    $.unblockUI();
  });

  $.pp.reg("ERROR", function(obj) {
    console.log(obj);
    $.unblockUI();
  });

  $("#cmd_login").click(function() {
    var cmd = {cmd: "LOGIN", user: 'jack', pass: 'pass'};
    $.ws.send($.pp.write(cmd));
    $.blockUI({message: '<h3>REQUEST PROTOCOL</h3>'});
  });

  $("#cmd_logout").click(function() {
    $.ws.send($.pp.write({cmd: "LOGOUT"}));
  });

  $("#cmd_player_query").click(function() {
    console.log(user_id);
    $.ws.send($.pp.write({cmd: "PLAYER_QUERY", id: user_id}));
  });
});

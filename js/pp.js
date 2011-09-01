$(document).ready(function() {
  $.ws.defaults.onmessage = $.pp.onmessage;

  $.pp.reg("LOGIN", function(obj) {
    $.ws.send($.pp.write({cmd: "PLAYER_QUERY", id: obj.id}));
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

  $.pp.reg("PLAYER_INFO", function(obj) {
    $("#lab_nick").text(obj.nick);
    $("#lab_location").text(obj.location);
    $("#lab_inplay").text(obj.inplay);
    $.unblockUI();
  });

});

$(document).ready(function() {
  $.ws.defaults.onmessage = $.pp.onmessage;

  $.pp.reg("LOGIN", function(obj) {
    console.log(obj.notify, obj.id);
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
});

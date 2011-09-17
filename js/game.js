$(document).ready(function() {
  var gid = 0;
  $('#game').bind('startup', function(event, id) {
    gid = id;
  });

  $('#cmd_exit').click(function() {
    $.ws.send($.pp.write({cmd: "UNWATCH", gid: gid }));
    switch_game();
  });

  var switch_game = function() {
    $('#hall').show("normal");
    $('#game').hide("normal");
  };
});

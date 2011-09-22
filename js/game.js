$(document).ready(function() {
  var cur_game = 0, auto_join_seat = 0;
  $('#game').bind('startup', function(event, args) {
    cur_game = args.game;
    auto_join_seat = args.seat;
  });

  $('#cmd_exit').click(function() {
    $.ws.send($.pp.write({cmd: "UNWATCH", gid: gid }));
    switch_game();
  });

  $('#cmd_sit').click(function() {
    $.ws.send($.pp.write({cmd: "JOIN", gid: cur_game, seat: auto_join_seat, buyin: 100}));
  });

  var switch_game = function() {
    $('#hall').show("normal");
    $('#game').hide("normal");
  };
});

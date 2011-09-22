$(document).ready(function() {
  var cur_game = 0, auto_join_seat = 0;
  $('#game').bind('active', function(event, args) {
    cur_game = args.game;
    auto_join_seat = args.seat;
  });

  $('#cmd_hall').click(function() {
    $.ws.send($.pp.write({cmd: "UNWATCH", gid: cur_game }));
    return_hall();
  });

  $('#cmd_sit').click(function() {
    $.ws.send($.pp.write({cmd: "JOIN", gid: cur_game, seat: auto_join_seat, buyin: 100}));
  });

  var return_hall = function() {
    $('#game').hide("normal");
    $('#hall').show("normal").trigger('active', cur_game);
  };
});

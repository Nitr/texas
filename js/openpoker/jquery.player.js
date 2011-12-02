(function($) {
  var player = function() {
    this.nick = null;
    this.photo = null;
    this.pid = null;
  };

  $.player = new player();

  $.pp.reg("LOGIN", function(player) {
    $.player.pid = player.id;
    $.player.photo = $.rl.img.def_face_0;
    $.ws.send($.pp.write({cmd: "PLAYER_QUERY", id: player.id}));
  });

  $.pp.reg("PLAYER_INFO", function(player) {
    $.player.nick = player.nick;

    if (player.photo in $.rl.img)
      $.player.photo = $.rl.img[player.photo];

    $($.player).trigger('singin', $.player);
  });

  $.pp.reg("ERROR", function() {
    console.log('error');
    $($.player).trigger('error');
  });
})(jQuery);




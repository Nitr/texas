var GamePreview;

GamePreview = (function() {

  function GamePreview(gid, dom) {
    this.gid = gid;
    this.dom = dom;
    this.seats = [];
    $.ws.send($.pp.write({
      cmd: "SEAT_QUERY",
      gid: this.gid
    }));
    return;
  }

  GamePreview.prototype.add = function(seat) {
    var player_dom;
    if (seat.state === 0) return;
    console.log(['preview_add', seat]);
    player_dom = $($('#game_preview > .template').text()).appendTo(this.dom);
    this.seats[seat.seat] = new Player(seat.pid, player_dom, seat);
  };

  GamePreview.prototype.clear = function() {
    $('#game_preview > .seat').remove();
  };

  return GamePreview;

})();

(function($) {
  $.game_preview = null;
  $.pp.reg("SEAT_STATE", function(seat) {
    if (!$.game_preview) return;
    $.game_preview.add(seat);
  });
})(jQuery);

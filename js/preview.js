var GAME_PREVIEW_REF_MAX, GamePreview;

GAME_PREVIEW_REF_MAX = 5;

GamePreview = (function() {

  function GamePreview(gid, dom) {
    this.gid = gid;
    this.dom = dom;
    this.seats = [];
    this.ref();
    $(this).everyTime('3s', function() {
      return this.ref();
    }, GAME_PREVIEW_REF_MAX);
    return;
  }

  GamePreview.prototype.ref = function() {
    return $.ws.send($.pp.write({
      cmd: "SEAT_QUERY",
      gid: this.gid
    }));
  };

  GamePreview.prototype.add = function(seat) {
    var player_dom;
    player_dom = $('#game_preview > .seat').filter(function() {
      return $(this).data('seat') === seat.sn;
    });
    if (seat.state === 0) {
      player_dom.remove();
      this.seats[seat.sn] = null;
      return;
    }
    if (player_dom.size() !== 0) return;
    player_dom = $($('#game_preview > .template').text()).css($.positions.get_preview(seat.sn)).data('seat', seat.sn).appendTo(this.dom);
    this.seats[seat.sn] = new Player(seat.pid, player_dom, seat);
  };

  GamePreview.prototype.clear = function() {
    $(this).stopTime();
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

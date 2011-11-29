(function($) {
	$.game = function(id, maxima_players) {
    // init game and clear DOM
    // clear pot
    // clear seats
    // clear pokers
    // reset action button
  }

  $.extend($.game.prototype, {
    init_seat: $.noop, // call in SEAT_DETAIL
    init: $.noop, // call in GAME_DETAIL
    find: $.noop // find seat by seat sn or player id
  });

  $.extend($.game.prototype, {
    new_stage: $.noop, // turn on new stage
    deal_card: $.noop, // deal private or share card
  });
})(jQuery);

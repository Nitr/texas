(function($) {
	$.seat = function() {
  }

  $.extend($.seat.prototype, {
    state: $.noop,
    is_empty: $.noop,
  });
})(jQuery);


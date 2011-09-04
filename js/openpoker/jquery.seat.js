(function($) {
	$.seats = {
		add: function(seat) {
			$.seats.all_seats.push(seat);
		},
		
		all_seats: new Array(),
		
		all: function(){
			return $.seats.all_seats;
		},
		
		clear: function() {
			$.seats.all_seats = [];
		}
	};
})(jQuery);
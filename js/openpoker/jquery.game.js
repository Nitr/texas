(function($) {
	$.games = {
		add: function(game) {
			$.games.all_games.push(game);
		},
		
		all_games: new Array(),
		cur_game: null,
		
		gen_query: function() {
			return gen_game_query([1, 0, 0, 0, 0, 0, 0]);
		},
		
		all: function(){
			return $.games.all_games;
		},
		
		clear: function() {
			$.games.all_games = [];
		},
		
		first: function() {
			if ($.games.all_games.length > 0)
				return $.games.all_games[0];
			return null;
		},
		
		length: function() {
			return $.games.all_games.length;
		},
		
		cur: function(game) {
			if (game == null)
				return $.games.cur_game;
			
			$.games.cur_game = game;
		}
	};
	
	
function gen_game_query(arr) {
  var o = {cmd: 'GAME_QUERY', game_type: 0};
  o.waiting = arr.pop();
  o.waiting_op = arr.pop();
  o.joined = arr.pop();
  o.joined_op = arr.pop();
  o.seats = arr.pop();
  o.seats_op = arr.pop(); 
  o.limit_type = arr.pop();
  return o;
}

})(jQuery);

var Game;

Game = (function() {

  function Game(gid) {
    this.gid = gid;
    return;
  }

  return Game;

})();

$(function() {
  var game;
  game = $('#game');
  game.bind('switch_game', function() {
    console.log('game_switch');
    $(this).show();
  });
});

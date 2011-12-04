var Game;

Game = (function() {

  function Game(gid) {
    this.gid = gid;
    return;
  }

  return Game;

})();

$(function() {
  $('#game').bind('setup', function() {});
});

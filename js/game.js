var Game;

Game = (function() {

  function Game(detail, dom) {
    this.detail = detail;
    this.dom = dom;
    this.gid = this.detail.gid;
    return;
  }

  Game.prototype.add_seat = function(detail) {
    this.detail = detail;
  };

  return Game;

})();

$(function() {
  var game, game_dom;
  game = null;
  game_dom = $('#game');
  game_dom.bind('switch_game', function(event, args) {
    $(this).show();
    switch (args.action) {
      case 'watch':
        $.ws.send($.pp.write({
          cmd: "WATCH"
        }));
        break;
      case 'join':
        $.ws.send($.pp.write({
          cmd: "JOIN",
          seat: 0,
          buyin: args.buyin
        }));
        break;
      default:
        throw 'unknown game action';
    }
    blockUI('#msg_joining');
    return $(this).oneTime('3s', function() {
      blockUI('#err_network');
    });
  });
  $.pp.reg("GAME_DETAIL", function(detail) {
    game = new Game(detail, game_dom);
    console.log('game_detail');
  });
  $.pp.reg("SEAT_DETAIL", function(detail) {
    game.add_seat(detail);
    console.log('seat_detail');
  });
});

var Game;

Game = (function() {

  function Game(gid, dom) {
    this.gid = gid;
    this.dom = dom;
    return;
  }

  Game.prototype.init = function(detail) {
    this.detail = detail;
    this.seats = [];
    return this.dom.trigger('inited');
  };

  Game.prototype.init_seat = function(detail) {
    this.detail = detail;
  };

  return Game;

})();

$(function() {
  var game, game_dom;
  game = null;
  game_dom = $('#game');
  game_dom.bind('switch_game', function(event, args) {
    game = new Game(args.gid, game_dom);
    switch (args.action) {
      case 'watch':
        $.ws.send($.pp.write({
          cmd: "WATCH",
          gid: args.gid
        }));
        break;
      case 'join':
        $.ws.send($.pp.write({
          cmd: "JOIN",
          gid: args.gid,
          seat: 0,
          buyin: args.buyin
        }));
        break;
      default:
        throw 'unknown game action';
    }
    $(this).show();
    blockUI('#msg_joining');
    return $(this).oneTime('3s', function() {
      blockUI('#err_network');
    });
  });
  game_dom.bind('inited', function() {
    $(this).stopTime();
    unblockUI();
  });
  $.pp.reg("GAME_DETAIL", function(detail) {
    game.init(detail);
  });
  $.pp.reg("SEAT_DETAIL", function(detail) {
    game.init_seat(detail);
  });
  $.pp.reg("CANCEL", function(args) {});
});

var Player;

Player = (function() {

  function Player(pid, dom, info) {
    this.pid = pid;
    this.dom = dom != null ? dom : $('#toolbar > #player');
    this.info = info;
    this.set_inplay(0);
    this.set_photo($.rl.img.def_face_0);
    $.cache_player(this);
    if (!this.info) {
      $.ws.send($.pp.write({
        cmd: "PLAYER_QUERY",
        id: this.pid
      }));
    }
    $.ws.send($.pp.write({
      cmd: "PHOTO_QUERY",
      id: this.pid
    }));
    if (this.info) this.set_nick(this.info.nick);
    if (this.info) this.set_inplay(this.info.inplay);
    return;
  }

  Player.prototype.update_balance = function() {
    if (this.pid === $.player.pid) {
      $.ws.send($.pp.write({
        cmd: "BALANCE_QUERY"
      }));
    } else {
      throw 'Error balance for not current login user';
    }
  };

  Player.prototype.set_nick = function(nick) {
    this.nick = nick;
    $(this.dom).children('.nick').text(this.nick);
  };

  Player.prototype.set_inplay = function(inplay) {
    this.inplay = inplay;
    $(this.dom).children('.inplay').text(this.inplay);
  };

  Player.prototype.set_balance = function(balance) {
    this.balance = balance;
    $(this.dom).children('.balance').text(this.balance);
  };

  Player.prototype.set_photo = function(photo) {
    this.photo = photo;
    $(this.dom).children('.photo').attr('src', this.photo);
  };

  Player.prototype.set_css = function(css) {
    console.log(css);
    $(this.dom).css(css);
  };

  return Player;

})();

(function($) {
  var players;
  $.player = {};
  players = {};
  $.pp.reg("LOGIN", function(player) {
    $.player = new Player(player.id);
    $.player.update_balance();
    $.player.dom.trigger('singin');
  });
  $.pp.reg("BALANCE_INFO", function(balance) {
    $.player.set_balance(balance.amount);
  });
  $.pp.reg('PLAYER_INFO', function(info) {
    players[info.pid].set_nick(info.nick);
  });
  $.pp.reg('PHOTO_INFO', function(info) {
    players[info.pid].set_photo($.rl.img[info.photo]);
  });
  $.cache_player = function(player) {
    players[player.pid] = player;
  };
  $.clear_players = function() {
    players = {};
    $.cache_player($.player);
  };
})(jQuery);

var Player;

Player = (function() {

  function Player(pid, dom, info) {
    this.pid = pid;
    this.dom = dom;
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
  }

  Player.prototype.update_balance = function() {
    if (this.pid === $.player.pid) {
      return $.ws.send($.pp.write({
        cmd: "BALANCE_QUERY"
      }));
    } else {
      throw 'Error balance for not current login user';
    }
  };

  Player.prototype.set_nick = function(nick) {
    if (nick == null) nick = this.nick;
    this.nick = nick;
    return $(this.dom).children('.nick').text(this.nick);
  };

  Player.prototype.set_inplay = function(inplay) {
    this.inplay = inplay;
    return $(this.dom).children('.inplay').text("$" + this.inplay);
  };

  Player.prototype.set_balance = function(balance) {
    this.balance = balance;
    return $(this.dom).children('.balance').text(this.balance);
  };

  Player.prototype.set_photo = function(photo) {
    this.photo = photo;
    return $(this.dom).children('.photo').attr('src', this.photo);
  };

  Player.prototype.set_css = function(css) {
    console.log(css);
    return $(this.dom).css(css);
  };

  return Player;

})();

(function($) {
  var players;
  $.player = {};
  players = {};
  $.pp.reg("LOGIN", function(player) {
    $.player = new Player(player.id, $('#toolbar > #player'));
    $.player.update_balance();
    return $.player.dom.trigger('singin');
  });
  $.pp.reg("BALANCE_INFO", function(balance) {
    return $.player.set_balance(balance.amount);
  });
  $.pp.reg('PLAYER_INFO', function(info) {
    return players[info.pid].set_nick(info.nick);
  });
  $.pp.reg('PHOTO_INFO', function(info) {
    return players[info.pid].set_photo($.rl.img[info.photo]);
  });
  $.cache_player = function(player) {
    return players[player.pid] = player;
  };
  $.clear_players = function() {
    players = {};
    return $.cache_player($.player);
  };
})(jQuery);

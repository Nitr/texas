
(function($) {
  var convert, current_share_card, format, game_position, nine_position;
  convert = function(positions) {
    var result, x, y;
    return result = (function() {
      var _results;
      _results = [];
      for (x in positions) {
        y = positions[x];
        _results.push({
          preview: {
            left: y.pv[0] + 'px',
            top: y.pv[1] + 'px'
          },
          empty_seat: {
            left: y.es[0] + 'px',
            top: y.es[1] + 'px'
          },
          playing_seat: {
            left: y.ps[0] + 'px',
            top: y.ps[1] + 'px'
          },
          bet_start: {
            left: "" + y.bet[0] + "px",
            top: "" + y.bet[1] + "px"
          },
          bet_end: [y.bet[3], y.bet[2]],
          draw: {
            left: "" + y.draw[0] + "px",
            top: "" + y.draw[1] + "px"
          }
        });
      }
      return _results;
    })();
  };
  nine_position = [
    {
      pv: [418, 170],
      es: [448, 363],
      ps: [435, 350],
      bet: [471, 413, 535, 314],
      draw: [90, 30]
    }, {
      pv: [300, 170],
      es: [263, 363],
      ps: [233, 350],
      bet: [268, 410, 309, 303],
      draw: [90, 28]
    }, {
      pv: [178, 170],
      es: [116, 275],
      ps: [117, 230],
      bet: [150, 288, 233, 208],
      draw: [90, 30]
    }, {
      pv: [78, 125],
      es: [173, 95],
      ps: [145, 60],
      bet: [181, 122, 300, 175],
      draw: [90, 40]
    }, {
      pv: [108, 15],
      es: [342, 55],
      ps: [342, 20],
      bet: [376, 83, 402, 162],
      draw: [90, 60]
    }, {
      pv: [230, 1],
      es: [559, 55],
      ps: [565, 20],
      bet: [604, 84, 572, 162],
      draw: [-52, 60]
    }, {
      pv: [354, 1],
      es: [741, 95],
      ps: [766, 60],
      bet: [803, 129, 672, 175],
      draw: [-52, 40]
    }, {
      pv: [476, 15],
      es: [798, 275],
      ps: [801, 230],
      bet: [832, 290, 749, 208],
      draw: [-51, 30]
    }, {
      pv: [518, 125],
      es: [640, 363],
      ps: [680, 350],
      bet: [711, 408, 710, 306],
      draw: [-51, 28]
    }
  ];
  current_share_card = null;
  game_position = convert(nine_position);
  format = function(ps) {
    return {
      top: "" + ps[0] + "px",
      left: "" + ps[1] + "px"
    };
  };
  $.positions = {};
  $.extend($.positions, {
    get_preview: function(sn) {
      return game_position[sn - 1].preview;
    },
    get_playing: function(sn) {
      return game_position[sn - 1].playing_seat;
    },
    get_draw: function(sn) {
      return game_position[sn - 1].draw;
    },
    get_bet: function(sn) {
      return {
        start: game_position[sn - 1].bet_start,
        end: game_position[sn - 1].bet_end
      };
    },
    get_empty: function(sn) {
      return game_position[sn - 1].empty_seat;
    },
    get_random: function(ps, offset) {
      if (offset == null) offset = 20;
      return {
        top: (ps[0] + (Math.floor(Math.random() * 1000)) % (offset * 2) - offset) + 'px',
        left: (ps[1] + (Math.floor(Math.random() * 1000)) % (offset * 2) - offset) + 'px'
      };
    }
  }, {
    reset_share: function() {
      return current_share_card = [200, 245];
    },
    get_next_share: function() {
      current_share_card = [current_share_card[0], current_share_card[1] + 55];
      return format(current_share_card);
    }
  });
})(jQuery);

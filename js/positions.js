
(function($) {
  var convert, game_position, nine_position;
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
      ps: [435, 350]
    }, {
      pv: [300, 170],
      es: [263, 363],
      ps: [233, 350]
    }, {
      pv: [178, 170],
      es: [116, 275],
      ps: [117, 230]
    }, {
      pv: [78, 125],
      es: [173, 95],
      ps: [145, 60]
    }, {
      pv: [108, 15],
      es: [342, 55],
      ps: [342, 20]
    }, {
      pv: [230, 1],
      es: [559, 55],
      ps: [565, 20]
    }, {
      pv: [354, 1],
      es: [741, 95],
      ps: [766, 60]
    }, {
      pv: [476, 15],
      es: [798, 275],
      ps: [801, 230]
    }, {
      pv: [518, 125],
      es: [640, 363],
      ps: [680, 350]
    }
  ];
  game_position = convert(nine_position);
  $.positions = {};
  $.extend($.positions, {
    get_preview_position: function(sn) {
      return game_position[sn - 1].preview;
    },
    get_playing_position: function(sn) {
      return game_position[sn - 1].playing_seat;
    },
    get_empty_position: function(sn) {
      return game_position[sn - 1].empty_seat;
    }
  });
})(jQuery);

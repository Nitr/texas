
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
            left: y.preview[0] + 'px',
            top: y.preview[1] + 'px'
          }
        });
      }
      return _results;
    })();
  };
  nine_position = [
    {
      preview: [418, 170]
    }, {
      preview: [300, 170]
    }, {
      preview: [178, 170]
    }, {
      preview: [78, 125]
    }, {
      preview: [108, 15]
    }, {
      preview: [230, 1]
    }, {
      preview: [354, 1]
    }, {
      preview: [476, 15]
    }, {
      preview: [518, 125]
    }
  ];
  game_position = convert(nine_position);
  $.get_preview_position = function(sn) {
    return game_position[sn - 1].preview;
  };
})(jQuery);

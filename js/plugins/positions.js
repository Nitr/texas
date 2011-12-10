(function($) {
  var convert_points = function(points) {
    return $.map(points, function(pos) {
      var c = pos.card.split(',');
      var o = pos.outer.split(',');
      var bb = pos.betting.split(',');
      var bl = pos.betting_label.split(',');

      return {
        outer: {left: o[0] + 'px', top: o[1] + 'px'},
        empty_outer: {left: o[2] + 'px', top: o[3] + 'px'},
        card : {left: c[0] + 'px', top: c[1] + 'px'},
        betting: { left: new Number(bb[2]), top: new Number(bb[3]) },
        betting_ori: { left: bb[0] + 'px', top: bb[1] + 'px' },
        // 下注文字显示坐标
        betting_label: { left: bl[0] + 'px', top: bl[1] + 'px' } 
      };
    });
  };

  var five_positions = convert_points([
    {outer: "0,0", betting_label: "0,0", betting: "0,0,0,0", card: "0,0"},
    {outer: "435,350", betting_label: "90,-10", betting: "471,413,529,308", card: "90,30"},
    {outer: "233,350", betting_label: "65,-20", betting: "268,410,337,308", card: "90,28"},
    {outer: "117,230", betting_label: "105,5", betting: "150,288,231,203", card: "90,30"},
    {outer: "145,60", betting_label: "145,95", betting: "181,122,294,178", card: "90,40"},
    {outer: "342,20", betting_label: "50,125", betting: "376,83,389,168", card: "90,60"} 
  ]);

  var nine_positions = convert_points([
    {outer: "0,0", betting_label: "0,0", betting: "0,0,0,0", card: "0,0"},
    {outer: "435,350,448,363", betting_label: "90,-10", betting: "471,413,535,314", card: "90,30"},
    {outer: "233,350,263,363", betting_label: "65,-20", betting: "268,410,309,303", card: "90,28"},
    {outer: "117,230,116,275", betting_label: "105,5", betting: "150,288,233,208", card: "90,30"},
    {outer: "145,60,173,95", betting_label: "145,95", betting: "181,122,300,175", card: "90,40"},
    {outer: "342,20,342,55", betting_label: "50,125", betting: "376,83,402,162", card: "90,60"},
    {outer: "565,20,559,55,", betting_label: "-5,125", betting: "604,84,572,162", card: "-52,60"},
    {outer: "766,60,741,95", betting_label: "-105,95", betting: "803,129,672,175", card: "-52,40"},
    {outer: "801,230,798,275", betting_label: "-63,5", betting: "832,290,749,208", card: "-51,30"},
    {outer: "680,350,640,363", betting_label: "20,-20", betting: "711,408,710,306", card: "-51,28"}
  ]);

	$.positions = {
    trim_positions: function(offset) {
      var size = get_size();
      var positions = [];
      var target = get_positions(size);
      for (var i = 1, j = offset; i <= size; i++, j = j % size + 1) {
        positions[j] = target[i];
      }

      return positions;
    },

    get_positions: function(size) {
      return size == 5 ? five_positions : nine_positions;
    }
	};
})(jQuery);

(function($) {
  $.rl = {
    load: function(res, callback) {
      if (!onload) 
        onload = callback;

      length = length == 0 ? res.length : length += res.length;

      $.each(res, function(index, r) {
        if (/\.png$/.test(r.url)) 
          handleImage(r);
        else if (/\.html$/.test(r.url))
          handleHtml(r);
        else if (/\.js$/.test(r.url))
          handleJs(r);
        else if (/\.mp3$/.test(r.url))
          handleMp3(r);
        else
          throw 'UNKNOW RESOURCE TYPE ' + r.url;
      });
    },

    getImgDataUrl: function(img, x, y, w, h) {
      x = x == null ? 0 : x,
      y = y == null ? 0 : y,
      w = w == null ? img.width : w,
      h = h == null ? img.height : h;

      var canvas = document.createElement("canvas"),
      url = null;

      canvas.width = w;
      canvas.height = h;
      canvas.getContext("2d").drawImage(img, x, y, w, h, 0, 0, w, h);
      url = canvas.toDataURL("image/png");
      canvas = null;
      return url;
    },

    img: {},
    poker: {},
    sounds: {},
  }

  $.extend($.rl, {
    handle_heads: function(img) {
      for (var i = 0; i < img.width / 80; i++) {
        $.rl.img['def_face_' + i] = $.rl.getImgDataUrl(img, i * 80, 0, 80, 80);
      }
    },

    handle_pokers: function(img) {
      var swp = [1,4,3,2]
      for (var j = 0; j < img.height / 65; j ++) {
        for (var i = 0; i < img.width / 45; i++) {
          var key = new Number(i + 1 << 8 | swp[j]);
          $.rl.poker[key.toString()] = 
            $.rl.getImgDataUrl(img, i * 45, j * 65, 45, 65);
        }
      }
    },

    handle_bets: function(img) {
      for (var i = 0; i < img.width / 13; i++) {
        $.rl.img["betting_" + (i + 1)] = 
          $.rl.getImgDataUrl(img, i * 13, 0, 13, 14);
      }
    }

  });

  function handleJs(res) {
    $.getScript(res.url, function() {
      if (res.callback) {
        res.callback();
      }
      sub();
    });
  }

  function handleHtml(res) {
    $.get(res.url, function(result, state, xhr) {
      res.callback(result);
      sub();
    }, 'html');
  }

  function handleImage(res) {
    var imageObj = new Image();

    imageObj.onload = function(){
      res.callback(imageObj);
      sub();
    };

    imageObj.onerror = function(){
      res.callback(null);
      sub();
    };

    imageObj.src = res.url;
  }

  function handleMp3(res) {
    var audio = new Audio(res.url);
    $.rl.sounds[res.key] = audio;
    sub();
  }

  function sub() {
    length--;

    if (length <= 0 && onload) {
      onload();
    }
  }


  var length = 0,
      onload = null;
})($)
// vim: fdm=marker

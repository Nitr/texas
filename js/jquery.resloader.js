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
    }
  }

  function handleHtml(res) {
    $.get(res.url, function(result, state, xhr) {
      console.log('request html ' + state);
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

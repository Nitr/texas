$(function() {
  var opts = { lines: 12, length: 14, width: 5, radius: 13, color: '#000', speed: 1.5, trail: 92, shadow: false };

  var spinner = new Spinner(opts).spin($("#spin").get(0));

  var loadImg = function(img) {
    $('#cutimg').attr('src', 
      $.rl.getImgDataUrl(img, null, null, 100, 200));
  };

  var loadHtml = function(html) {
    $("#singin").html(html);
  };

  $.rl.load([
    {url: '../css/table.png', callback: loadImg},
    {url: '../login.html', callback: loadHtml}], 
    function() {
      spinner.stop();
    });
});


$(function() {
  var audio = new Audio("css/sound/test.mp3");
  $('#audio_test').click(function() {
    audio.play();
  });
});

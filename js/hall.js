$(function() {
  $("#games_table").setTemplateElement("games_temp");
  $("#seats_table").setTemplateElement("seats_temp");

  $.pp.reg("PLAYER_INFO", function(obj) {
    $("#hall").show();
  });
});

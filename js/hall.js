$(function() {
  $("#games_table").setTemplateElement("games_temp");
  $("#seats_table").setTemplateElement("seats_temp");

  $.pp.reg("PLAYER_INFO", function(obj) {
    $("#login").hide();
    $("#hall").show();
    $("#photo").show().attr("src", "" + obj.photo);
    $("#nick").show().text("昵称: " + obj.nick);
    $("#money").show().text("游戏币: " + obj.inplay);
    $.unblockUI();
  });
});

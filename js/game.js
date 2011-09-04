$(document).ready(function() {
    $.ws.defaults.onmessage = $.pp.onmessage;
    
	$(document).everyTime(500, function() {
      $.ws.send($.pp.write({cmd: "PING"}));
    });
	
	autoSetting();
	autoSingin();
});

function autoSetting() {
	var usr = $.url.get("usr") == null ? localStorage.getItem("lass_usr") : $.url.get("usr");
	var pwd = $.url.get("pwd") == null ? localStorage.getItem("lass_pwd") : $.url.get("pwd");
	$("#txt_usr").val(usr);
	$("#txt_pwd").val(pwd);
	
    $("#games_table").setTemplateElement("games_temp");
    $("#seats_table").setTemplateElement("seats_temp");
}

function autoSingin() {
  	var usr = $("#txt_usr").val();
   	var pwd = $("#txt_pwd").val();
   	
    var login = function() {
    	var usr = $("#txt_usr").val();
    	var pwd = $("#txt_pwd").val();
    	$.ws.send($.pp.write({cmd: "LOGIN", usr: usr, pass: pwd}));
    	$.blockUI({message: '<h3>登录中..</h3>'});
    	return false;
    };
    
   	$("#login").bind("submit", login);
    
    if (usr != "" && pwd != "") {
    	login();
    }
}

$.pp.reg("ERROR", function(obj) {
	console.log("ERROR - " + $.pp.err(obj.command));
	$.unblockUI();
	$("#lab_error").show();
});

$.pp.reg("PONG", function(obj) {
  $("#lab_ping").text(obj.send - obj.orign_send);
});

$.pp.reg("LOGIN", function(usr) {
	$.unblockUI();
	localStorage.setItem("lass_usr", $("#txt_usr").val());
	localStorage.setItem("lass_pwd", $("#txt_pwd").val());
	
    $.ws.send($.pp.write({cmd: "PLAYER_QUERY", id: usr.id}));
    
   	$("#login").hide();
   	$("#game_panel").show();
});

$.pp.reg("PLAYER_INFO", function(obj) {
  $("#lab_nick").text(obj.nick);
  $("#lab_location").text(obj.location);
  $("#lab_inplay").text(obj.inplay);
  $("#img_photo").attr("src", "" + obj.photo);
  
  // 登录后默认请求游戏列表
  $.games.clear();
  $.ws.send($.pp.write($.games.gen_query()));
});

$.pp.reg("GAME_INFO", function(obj) {
  $.games.add(obj);
  $("#games_table").processTemplate({datas: $.games.all()});
  
  if ($.games.length() == 1) {
	$.games.cur(obj.id);
	$(document).everyTime(1000, "ref_seats", function() {
      $.seats.clear(); 
      $.ws.send($.pp.write({cmd: "SEAT_QUERY", gid: $.games.cur()}));
    });
  }
  
  $(".cmd_check").bind("click", function() {
	$.games.cur($(this).attr("gid"));
    $.blockUI({message: '<h3>......</h3>'});
  });
});

$.pp.reg("SEAT_STATE", function(obj) {
  $.seats.add(obj);
  $("#seats_table").processTemplate({datas: $.seats.all()});
  $.unblockUI();
});
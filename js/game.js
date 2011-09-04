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
});
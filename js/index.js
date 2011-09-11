$(function() {
  var usr, pwd, pong;
  $.ws.defaults.onmessage = $.pp.onmessage;

  $(document).everyTime(500, function() {
    $.ws.send($.pp.write({cmd: "PING"}));
  });

  $.blockUI({message: '<h3>游戏正在加载中,请稍后...</h3>'});

  $("#login").load("login.html");

  $("#hall").load("hall.html", function() {
    $.getScript("js/hall.js");
  });

  $("#game").load("game.html", function() {
    $.getScript("js/game.js");
  });

  var autoSingin = function() {
    usr = $.url.get("usr");
    pwd = $.url.get("pwd"); 
    usr = usr == null ? localStorage.getItem("save_usr") : usr;
    pwd = pwd == null ? localStorage.getItem("save_pwd") : pwd;

    $("#login").bind("submit", function() {
      usr = $('#txt_usr').val();
      pwd = $('#txt_pwd').val();
      singin();
      return false;
    });

    if (!$.isEmpty(usr) && !$.isEmpty(pwd))
      singin();
  }

  var singin = function() {
    $.ws.send($.pp.write({cmd: "LOGIN", usr: usr, pass: pwd}));
    $.blockUI({message: '<h3>登录中...</h3>'});
  }

  $.pp.reg("ERROR", function(obj) {
    console.log("ERROR - " + $.pp.err(obj.command));
    $.unblockUI();
    $("#lab_error").show();
  });

  $.pp.reg("PONG", function(obj) {
    pong = pong > 10000 ? 0 : pong + 1;
  });

  $.pp.reg("LOGIN", function(u) {
    if ($("#ckb_save").attr('checked')) {
      localStorage.setItem("save_usr", usr);
      localStorage.setItem("save_pwd", pwd);
    }

    $.ws.send($.pp.write({cmd: "PLAYER_QUERY", id: u.id}));

    $("#login").hide();

    $.unblockUI();
  });

  if (pong == 0) {
    $.blockUI({message: '<h3>网络故障...</h3>'});
  } else {
    autoSingin();
  }
});

// vim: fdm=marker

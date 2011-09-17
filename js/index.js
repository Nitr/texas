var ERR_NETWORK = {message: '<h3 id=err_network>抱歉，网络连接错误，请稍后再试。</h3>', id: '#err_network', generate: false};
var STA_CONNECT = {message: '<h3 id=sta_connect>连接中...</h3>', id: '#sta_connect', generate: true};
var STA_LOADING = {message: '<h3 id=sta_loading>加载中...</h3>', id: '#sta_loading', generate: true};
var STA_SINGIN = {message: '<h3 id=sta_singin>登陆中...</h3>', id: '#sta_singin', generate: true};

$(function() {
  $.ajaxSetup ({
    cache: false //关闭缓存
  });

  var usr, pwd, pong, dot;

  // block user interface {{{
  var blockUI = function(obj) {
    dot = 1;
    $(document).stopTime();
    $.blockUI(obj);

    if (obj.generate == true) {
      $(document).everyTime(250, obj.id, function() {
        var lab = $(obj.id);
        var n = lab.text().replace(/[\.]{1,}/, new Array(++dot).join('.'));
        dot = dot >= 6 ? 1 : dot;
        lab.text(n);
      });
    }
  } 

  var unblockUI = function() {
    $(document).stopTime();
    $.unblockUI();
  }
  // }}}

  var loading = function() { // {{{
    var autoSingin = function() { 

      var singin = function() {
        blockUI(STA_SINGIN);
        $.ws.send($.pp.write({cmd: "LOGIN", usr: usr, pass: pwd}));
      }

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

      if (!$.isEmpty(usr) && !$.isEmpty(pwd)) {
        singin();
      } else {
        blockUI({message: $("#login"), id: '#login', generate: false});
      }
    }

    // 当login加载后,开始进行自动登陆
    // 如果不能自动登陆则启动手动登陆
    $("#login").load("login.html", function() {
      $("#res_wrapper").load("res.html");

      $("#hall").load("hall.html", function() {
        $.getScript("js/hall.js");
      });

      $("#game").load("game.html", function() {
        $.getScript("js/game.js");
      });

      autoSingin();
    });

  } // }}}

  var onopen = function() {
    $(document).oneTime(1000, function() {
      loading();
    });
  }

  blockUI(STA_CONNECT);

  $.ws.defaults.onmessage = $.pp.onmessage;
  $.ws.defaults.onopen = onopen;

  // PROTOTYPE REGISTER {{{
  $.pp.reg("ERROR", function(obj) {
    console.log("ERROR - " + $.pp.err(obj.command));
    blockUI({message: $("#login"), id: '#login', generate: false});
    $("#lab_err_singin").show();
  });

  $.pp.reg("LOGIN", function(u) {
    if ($("#ckb_save").attr('checked')) {
      localStorage.setItem("save_usr", usr);
      localStorage.setItem("save_pwd", pwd);
    }

    $.ws.send($.pp.write({cmd: "PLAYER_QUERY", id: u.id}));
  });

  $.pp.reg("PONG", function(obj) {
  });

  // }}}

  $(document).oneTime(5000, function() {
    if ($.ws.isConnection() == false) {
      $(document).stopTime();
      blockUI(ERR_NETWORK);
    }
  });

  $.ws.init();
});
// vim: fdm=marker

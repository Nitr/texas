var blockUI, format, growlUI, unblockUI;

format = function(str, step, splitor) {
  var arr, first, i, l1, l2, len;
  if (step == null) step = 3;
  if (splitor == null) splitor = ',';
  arr = [];
  str = str.toString();
  len = str.length;
  if (len > step) {
    l1 = len % step;
    l2 = parseInt(len / step);
    first = str.substr(0, l1);
    if (first !== '') arr.push(first);
    for (i = 0; i <= 11; i++) {
      if ((i * step + l1) < len) arr.push(str.substr(l1 + i * step, step));
    }
    str = arr.join(splitor);
  }
  return str;
};

growlUI = function(id, opt) {
  var conf;
  conf = {
    message: $(id).clone(),
    fadeIn: 700,
    fadeOut: 700,
    timeout: 6000,
    showOverlay: false,
    css: GROWLUI
  };
  if (opt != null) conf = $.extend(conf, opt);
  return $('#page').block(conf);
};

blockUI = function(o, timeout) {
  var style;
  style = BLOCKUI;
  timeout = timeout != null ? timeout : 0;
  if (typeof o === 'string') {
    $.blockUI({
      message: $(o).clone(),
      centerX: true,
      centerY: true,
      timeout: timeout,
      css: style
    });
  } else {
    $.blockUI({
      message: $(o),
      centerX: true,
      centerY: true,
      timeout: timeout,
      css: style
    });
  }
};

unblockUI = function() {
  $.unblockUI();
};

$(function() {
  var on_load, on_open, player_dom, singin_dom, singin_form;
  singin_dom = $('#singin');
  singin_form = $('#singin > form');
  player_dom = $('#toolbar > #player');
  $.ajaxSetup({
    cache: false
  });
  blockUI("#msg_connect");
  $(this).oneTime('5s', function() {
    if (!$.ws.isConnection()) blockUI('#err_network');
  });
  on_load = function() {
    var identity, password;
    identity = $.url.get("usr" != null ? "usr" : localStorage.getItem("player#identity"));
    password = $.url.get("pwd");
    if (localStorage.getItem("autosave#identity") === "false") {
      $("#ckb_save").attr('checked', false);
    }
    $('#txt_identity').val(identity);
    $('#txt_password').val(password);
    if ((!$.isEmpty(identity)) && (!$.isEmpty(password))) {
      singin_form.trigger('submit');
    } else {
      blockUI(singin_dom);
    }
  };
  on_open = function() {
    $(this).stopTime();
    $(document).oneTime('1s', function() {
      var resources, s, sounds, _i, _len;
      blockUI('#msg_loading');
      resources = [
        {
          url: 'css/heads.png',
          callback: $.rl.handle_heads
        }, {
          url: 'css/poker.png',
          callback: $.rl.handle_pokers
        }, {
          url: 'css/betting.png',
          callback: $.rl.handle_bets
        }
      ];
      sounds = ["bet", "raise", "move", "card", "check", "fold", "turn"];
      for (_i = 0, _len = sounds.length; _i < _len; _i++) {
        s = sounds[_i];
        resources.push({
          url: 'css/sound/' + s + '.mp3',
          key: s
        });
      }
      $.rl.load(resources, on_load);
    });
  };
  singin_form.bind("submit", function() {
    var identity, password;
    blockUI('#msg_singin');
    identity = $(this).children("#txt_identity").val();
    password = $(this).children("#txt_password").val();
    $.ws.send($.pp.write({
      cmd: "LOGIN",
      usr: identity,
      pass: password
    }));
    $(this).oneTime('3s', function() {
      return blockUI(singin_dom);
    });
    return false;
  });
  singin_form.bind("stop", function() {
    $(this).stopTime();
  });
  player_dom.bind('singin', function() {
    singin_form.trigger("stop");
    $('#toolbar > *').show();
    $.unblockUI();
    if ($("#ckb_save").attr('checked')) {
      localStorage.setItem("player#identity", $('#txt_identity').val());
      localStorage.setItem("autosave#identity", true);
    } else {
      localStorage.setItem("player#identity", "");
      localStorage.setItem("autosave#identity", false);
    }
    $('#hall').trigger('setup');
  });
  $.pp.reg('ERROR', function() {
    $("#txt_password").val("");
    $("#lab_err_singin").show();
    singin_form.trigger("stop");
    blockUI(singin_dom);
  });
  if ($.url.get('host')) $.ws.defaults.host = $.url.get('host');
  $.ws.defaults.onmessage = $.pp.onmessage;
  $.ws.defaults.onopen = on_open;
  $.ws.init();
});

function blockUI(id) {
  $.blockUI({ message: $(id).clone() });
} 

function unblockUI() {
  $.unblockUI();
} 

$(function() {
  $.ajaxSetup ({ cache: false });

  var player;
  var sounds = ["bet", "raise", "move", "card", "check", "fold", "turn"];


  // block ui and first show Connecting...
  blockUI("#msg_connect");

  $(this).oneTime('5s', function() {
    if ($.ws.isConnection() == false) {
      blockUI('#err_network');
    }
  });

  var on_load = function() {
    var identity, password;

    identity = $.url.get("usr") == null ? // url hack (default identity)
      localStorage.getItem("player#identity") : $.url.get("usr");
    password = $.url.get("pwd"); // url hack (default password)

    if (localStorage.getItem("autosave#identity") == "false") {
      $("#ckb_save").attr('checked', false);
    }

    $('#txt_identity').val(identity);
    $('#txt_password').val(password);

    if (!$.isEmpty(identity) && !$.isEmpty(password)) {
      $("#singin > form").trigger('submit');
    } else {
      // show singin form
      blockUI('#singin');
    }
  };

  var on_open = function() {
    $(this).stopTime(); // stop #err_network error timer

    $(document).oneTime('1s', function() {
      blockUI('#msg_loading');

      var resources = [
        { url: 'css/heads.png', callback: handle_heads }, 
        { url: 'css/poker.png', callback: handle_pokers }, 
        { url: 'css/betting.png', callback: handle_bets }
      ];

      $.each(sounds, function(i, x) {
        resources.push({url: 'css/sound/' + x + '.mp3', key: x});
      });

      $.rl.load(resources, on_load);
    });
  };

  $("#singin > form").bind("submit", function() {
    blockUI('#msg_singin');

    $.ws.send($.pp.write({cmd: "LOGIN",
      usr: $('#txt_identity').val(),
      pass: $('#txt_password').val()
    }));

    $('#singin').oneTime('3s', function() {
      blockUI('#singin'); // singin timeout
    });

    return false;
  });

  $('#toolbar > #player').bind('singin', function() {
    $('#singin').stopTime();
    $('#toolbar > *').show();

    $.unblockUI();

    if ($("#ckb_save").attr('checked')) {
      localStorage.setItem("player#identity", $('#txt_identity').val());
      localStorage.setItem("autosave#identity", true);
    }
    else {
      localStorage.setItem("player#identity", "");
      localStorage.setItem("autosave#identity", false);
    }

    $('#hall').trigger('setup');
  });

  $('#toolbar > #usr').bind('error', function() {
    $('#singin').stopTime();

    $("#txt_password").val(""); // clear password
    $("#lab_err_singin").show(); // show error
  });

  if ($.url.get("host") != null)
    $.ws.defaults.host = $.url.get('host');
    
  $.ws.defaults.onmessage = $.pp.onmessage;
  $.ws.defaults.onopen = on_open;
  $.ws.init();

  // {{{ utility 
  var handle_heads = function(img) {
    for (var i = 0; i < img.width / 80; i++) {
      $.rl.img['def_face_' + i] = $.rl.getImgDataUrl(img, i * 80, 0, 80, 80);
    }
  }

  var handle_pokers = function(img) {
    var swp = [1,4,3,2]
    for (var j = 0; j < img.height / 65; j ++) {
      for (var i = 0; i < img.width / 45; i++) {
        var key = new Number(i + 1 << 8 | swp[j]);
        $.rl.poker[key.toString()] = 
          $.rl.getImgDataUrl(img, i * 45, j * 65, 45, 65);
      }
    }
  }

  var handle_bets = function(img) {
    for (var i = 0; i < img.width / 13; i++) {
      $.rl.img["betting_" + (i + 1)] = 
        $.rl.getImgDataUrl(img, i * 13, 0, 13, 14);
    }
  }
  // }}}
});
// vim: fdm=marker

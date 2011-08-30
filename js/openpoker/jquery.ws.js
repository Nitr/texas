(function($) {
  $.ws = {
    send: function(bin) {
      var ws = init();
      var timeout = ws.readyState == WebSocket.CONNECTING ? 1000 : 0;

      setTimeout(function() {
        var msg = $.base64.encode(bin);
        ws.send(msg);
      }, timeout);
    },

    defaults: {
      host: "127.0.0.1",
      port: "8002",
      onmessage: function(e) {
        console.log(e);
      }
    },
  };

  function init() {
    if ((ws == null) || (ws == undefined)) {
      var url = "ws://" + $.ws.defaults.host + 
                ":" + $.ws.defaults.port + "/";
      ws = new WebSocket(url, "chat");  
      ws.onmessage = $.ws.defaults.onmessage;
      return ws;
    }

    if (ws.readyState != WebSocket.OPEN) {
      throw "NETWORK CONNECTION NOT OPEN";
    }

    return ws;
  }

  var ws;
})($);

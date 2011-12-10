(function($) {
  $.ws = {
    send: function(bin) {
      var msg = $.base64.encode(bin);
      queue.unshift(msg);
    },

    defaults: {
      host: "173.255.240.250",
      port: "8002",
      onmessage: function(e) {
        console.log(['websocket message', e]);
      },
      onopen: function() {
        console.log('websocket open');
      }
    },
    
    init: function() {
      init();

      $(this).everyTime(300, function() {
        if (queue.length == 0)
          return;

        ws.send(queue.pop());
      });
    },

    isConnection: function() {
      return ws.readyState == WebSocket.OPEN;
    }
  };

  function init() {
    if ((ws == null) || (ws == undefined)) {
      var url = "ws://" + $.ws.defaults.host + 
                ":" + $.ws.defaults.port + "/";
      ws = new WebSocket(url, "chat");  
      ws.onmessage = $.ws.defaults.onmessage;
      ws.onopen = $.ws.defaults.onopen;
      return ws;
    }

    return ws;
  }

  var ws;
  var queue = [];
})($);

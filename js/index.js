if (!window.WebSocket) {  
  alert("WebSocket not supported by this browser!");  
  return;
}

$(document).ready(function() {
  var host = $("#cnf_host").val();
  var port = $("#cnf_port").val();

  var ws = build_websocket(host, port);

  $("#btn_close").click(function() {
    ws.close();
  });

  $("#btn_login").click(function() {
    var user = $("#cnf_host").val();
    var pass = $("#cnf_port").val();

    var data = [1, user, pass];
    //var data = [0x1, 0x4];

    var buf = new ArrayBuffer(data.length);
    var bytes = new Uint8Array(buf);

    for (var i = 0; i < data.length; i++) {
      if (typeof data[i] == "string") {
        bytes[i] = data[i].charCodeAt();
        continue;
      }

      bytes[i] = data[i];
    }

    ws.send(Base64.encode(bytes));
  });
});

function build_websocket(host, port) {
  var url = "ws://" + host + ":" + port + "/";
  console.log(url);
  var ws = new WebSocket(url, "chat");  

  ws.onmessage = function(evt) {
    var data = Base64.decode(evt.data);
    console.log(data);
  };

  ws.onclose = function() { 
    console.log('WS CLOSE');
  };  

  ws.onerror = function() {
    console.log('WS ERROR');
  }

  ws.onopen = function() {  
    console.log('WS OPEN');
  };  

  return ws;
}

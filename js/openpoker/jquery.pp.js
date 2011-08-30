(function($) {
  var commands = new Object();
  var notifys = new Object();
  var events = new Object();


  $.pp = {
    read: function(bin) {
      var obj = notifys["NOTIFY_" + bin[0]];
      var data = obj.read(bin);
      return data;
    },

    write: function(data) {
      var obj = commands[data.cmd];
      var bin = obj.write(data);
      return bin;
    },

    reg: function(notify, fun) {
      events[notify] = fun;
    },

    onmessage: function(evt) {
      var bin = $.base64.decode(evt.data);
      var obj = $.pp.read(bin)
      var fun = events[obj.notify];

      if ((fun == null) || (fun == undefined)) {
        console.log('undefined message event');
        console.log(evt);
        return;
      }

      fun(obj);
    },

    cmd_login: generate_cmd("LOGIN", [1, "user", "pass"]),
    cmd_logout: generate_cmd("LOGOUT", [2]),

    notify_login: generate_notify("LOGIN", [31, 
      {type: "integer", prop: "id"}]),
    notify_login: generate_notify("PLAYER_INFO", [19, 
      {type: "integer", prop: "id"}, 
      {type: "integer", prop: "inplay"}, 
      {type: "string", prop: "nick"}, 
      {type: "string", prop: "location"}]),
    notify_error: generate_notify("ERROR", [255])
  };

  function generate_cmd(cmd, status) {
    var obj = {
      cmd: cmd,
      write: function(data) {
        var buf = new ArrayBuffer(255); //{{{
        var dv = new DataView(buf);
        var offset = 0;
        
        $.each(status, function(index, prop) {
          if (index == 0) {
            dv.setUint8(offset, prop); //set command 
            offset += 1;
            return;
          }

          var val = data[prop];
          if ((val == null) && (val == undefined))
            throw 'PROTOCOL WRITE ERROR';

          switch(typeof val) {
            case "string":
              dv.setUint8(offset, val.length);
              offset += 1;
              $.each(val, function(i, c) {
                dv.setUint8(offset, c.charCodeAt());
                offset += 1;
              });
              break;
            case "number":
              dv.setUint8(val);
              offset += 1;
              break;
          }
        });

        return new Uint8Array(dv.buffer, 0, offset); // }}}
      }
    }

    commands[cmd] = obj;
  }

  function generate_notify(notify, status) {
    var obj = {
      notify: notify,
      read: function(bin) {
        var obj = new Object();
        obj["notify"] = notify;

        var offset = 0;
        var buf = (new Uint8Array(bin)).buffer;
        var dv = new DataView(buf);

        $.each(status, function(index, val) {
          if (index == 0) {
            //= notifys["NOTIFY_" + dv.getUint8(offset)];
            offset += 1;
            return;
          }

          switch(val.type) {
            case "string":
              obj[val.prop] = "";
              var len = dv.getUint8(offset);
              offset += 1;
              while(len > 0) {
                obj[val.prop] += String.fromCharCode(dv.getUint8(offset));
                offset += 1;
                len--;
              }
              break;
            case "integer":
              obj[val.prop] = dv.getUint32(offset);
              offset += 4;
              break;
          }
        });

        return obj;
      }
    };

    notifys["NOTIFY_" + status[0]] = obj;
  }
})($)
// vim: fdm=marker

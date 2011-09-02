(function($) {
  var commands = new Object();
  var notifys = new Object();
  var events = new Object();


  $.pp = {
    // {{{ protocol function
    read: function(bin) {
      var obj = notifys["NOTIFY_" + bin[0]];

      if ((obj == null) && (obj == undefined))
        return null;

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

      if (obj == null) {
        console.log('undefined message event');
        console.log(evt);
        return;
      }

      var fun = events[obj.notify];
      fun(obj);
    },
    // }}}

    // 对于cmd中含有id的属性,使用Uint32处理,其余使用Uint8处理
    cmd_login:  generate_cmd("LOGIN", 
      [1, {type: "string", prop: "usr"}, 
          {type: "string", prop: "pass"}]),
    cmd_logout: generate_cmd("LOGOUT", [2]),
    cmd_logout: generate_cmd("PLAYER_QUERY", 
      [15, {type: "integer", prop: "id"}]),
    cmd_logout: generate_cmd("GAME_QUERY", 
      [13, {type: "byte", prop: "game_type"},
           {type: "byte", prop: "limit_type"}, 
           {type: "byte", prop: "seats_op"}, 
           {type: "byte", prop: "seats"},
           {type: "byte", prop: "joined_op"}, 
           {type: "byte", prop: "joined"}, 
           {type: "byte", prop: "waiting_op"}, 
           {type: "byte", prop: "waiting"}]),
    cmd_login:  generate_cmd("PING", 
      [253, {type: "timestamp", prop: "send"}]),

    notify_pong:  generate_notify("PONG", 
      [254, {type: "timestamp", prop: "orign_send"},
            {type: "timestamp", prop: "send"}]),
    notify_login: generate_notify("LOGIN", [31, 
      {type: "integer", prop: "id"}]),
    notify_login: generate_notify("PLAYER_INFO", [19, 
      {type: "integer", prop: "id"}, 
      {type: "integer", prop: "inplay"}, 
      {type: "string", prop: "nick", base64: true},
      {type: "string", prop: "location", base64: true}]),
    notify_login: generate_notify("GAME_INFO", [18, 
      {type: "integer", prop: "id"}, 
      {type: "string", prop: "table_name"}, 
      {type: "byte", prop: "game_type"}, 
      {type: "byte", prop: "limit_type"}, 
      {type: "integer", prop: "height"}, 
      {type: "integer", prop: "low"}, 
      {type: "integer", prop: "seats"}, 
      {type: "integer", prop: "required"},
      {type: "integer", prop: "joined"}, 
      {type: "integer", prop: "waiting"}]),
    notify_error: generate_notify("ERROR", [255])
  };

  function generate_cmd(cmd, status) {
    // {{{
    var obj = {
      cmd: cmd,
      write: function(data) {
        var buf = new ArrayBuffer(255);
        var dv = new DataView(buf);
        var offset = 0;
        
        $.each(status, function(index, field) {
          if (index == 0) {
            dv.setUint8(offset, field); //set command 
            offset += 1;
            return;
          }

          var val = data[field.prop];

          switch(field.type) {
            case "string":
              val = val == undefined ? "" : val;
              dv.setUint8(offset, val.length);
              offset += 1;
              $.each(val, function(i, c) {
                dv.setUint8(offset, c.charCodeAt());
                offset += 1;
              });
              break;
            case "integer":
              val = val == undefined ? 0 : val;
              dv.setUint32(offset, val);
              offset += 4;
              break;
            case "byte":
              val = val == undefined ? 0 : val;
              dv.setUint8(offset, val);
              offset += 1;
              break;
            case "timestamp":
              // 将时间戳转换成微秒
              val = val == undefined ? new Date().getTime() * 1000 : val;
              var arr = mod(val, 1000000, []);
              $.each(arr, function(i, v) {
                dv.setUint32(offset, v);
                offset += 4;
              });
              break;
          }
        });

        return new Uint8Array(dv.buffer, 0, offset);
      }
    }

    commands[cmd] = obj;
    // }}}
  }

  function mod(val, u, arr) {
    if (val < u) {
      arr.push(val);
      return arr;
    }
    mod((val - (val % u)) / u, u, arr);
    arr.push(val % u);
    return arr;
  }

  function generate_notify(notify, status) {
    // {{{
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

              if (val.base64 == true)
                obj[val.prop] = $.base64Decode(obj[val.prop]);

              break;
            case "integer":
              obj[val.prop] = dv.getUint32(offset);
              offset += 4;
              break;
            case "byte":
              obj[val.prop] = dv.getUint8(offset);
              offset += 1;
              break;
            case "timestamp":
              var u = 1000000;
              var mega_secs = dv.getUint32(offset) * u * u;
              offset += 4;
              var secs = dv.getUint32(offset) * u;
              offset += 4;
              var micro_secs = dv.getUint32(offset);
              offset += 4;
              obj[val.prop] = (mega_secs + secs + micro_secs - (micro_secs % 1000)) / 1000;
              break;
          }
        });

        return obj;
      }
    };

    notifys["NOTIFY_" + status[0]] = obj;
    // }}}
  }
})($)
// vim: fdm=marker

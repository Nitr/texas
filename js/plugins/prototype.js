(function($) {
  var commands = new Object();
  var commands_by_id = new Object();
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
      if (events[notify])
        events[notify].push(fun);
      else
        events[notify] = [fun];
    },

    onmessage: function(evt) {
      var bin = $.base64.decode(evt.data);
      var obj = $.pp.read(bin);

      if (obj != null) {
        if (obj.notify in events)
          $.each(events[obj.notify], function(i, fun) { fun(obj); } );
        else
          console.log(['undefined event', obj.notify, obj]);
      } else {
        console.log(evt);
      }
    },
    // }}}
    
    err: function(command, code) {
    	return commands_by_id[command].cmd;
    },

    cmd_login:  generate_cmd("LOGIN", 
      [1, {type: "string", prop: "usr"}, 
          {type: "string", prop: "pass"}]),
    cmd_logout: generate_cmd("LOGOUT", [2]),
    cmd_player_query: generate_cmd("PLAYER_QUERY", 
      [15, {type: "integer", prop: "id"}]),
    cmd_player_query: generate_cmd("BALANCE_QUERY", [16]),
    cmd_player_query: generate_cmd("PHOTO_QUERY", 
      [102, {type: "integer", prop: "id"}]),
    cmd_game_query: generate_cmd("GAME_QUERY", 
      [13, {type: "byte", prop: "game_type"},
           {type: "byte", prop: "limit_type"}, 
           {type: "byte", prop: "seats_op"}, 
           {type: "byte", prop: "seats"},
           {type: "byte", prop: "joined_op"}, 
           {type: "byte", prop: "joined"}, 
           {type: "byte", prop: "waiting_op"}, 
           {type: "byte", prop: "waiting"}]),
    cmd_ping:  generate_cmd("PING", 
      [253, {type: "timestamp", prop: "send"}]),
    cmd_seat_query:  generate_cmd("SEAT_QUERY", 
      [14, {type: "integer", prop: "gid"}]),
    cmd_join:  generate_cmd("JOIN", 
      [8, {type: "integer", prop: "gid"},
          {type: "byte", prop: "seat"},
          {type: "decimal", prop: "buyin"},
          {type: "string", prop: "nick"}]),
    cmd_watch:  generate_cmd("WATCH", 
      [3, {type: "integer", prop: "gid"}]),
    cmd_watch:  generate_cmd("UNWATCH", 
      [4, {type: "integer", prop: "gid"}]),
    cmd_watch:  generate_cmd("LEAVE", 
      [9, {type: "integer", prop: "gid"}]),
    cmd_watch:  generate_cmd("FOLD", 
      [7, {type: "integer", prop: "gid"}]),
    cmd_watch:  generate_cmd("RAISE", 
      [6, {type: "integer", prop: "gid"},
          {type: "decimal", prop: "amount"}]),
    notify_pong:  generate_notify("PONG", 
      [254, {type: "timestamp", prop: "orign_send"},
            {type: "timestamp", prop: "send"}]),
    notify_login: generate_notify("LOGIN", [31, 
      {type: "integer", prop: "id"}]),
    notify_player_info: generate_notify("PLAYER_INFO", [19, 
      {type: "integer", prop: "pid"}, 
      {type: "integer", prop: "inplay"}, 
      {type: "string",  prop: "nick", base64: true},
      {type: "image",   prop: "photo"}]),
    notify_player_info: generate_notify("BALANCE_INFO", [33,
      {type: "decimal", prop: "amount"}, 
      {type: "decimal", prop: "inplay"}]),
    notify_player_info: generate_notify("PHOTO_INFO", [101,
      {type: "integer", prop: "pid"}, 
      {type: "image",   prop: "photo"}]),
    notify_game_info: generate_notify("GAME_INFO", [18, 
      {type: "integer", prop: "id"}, 
      {type: "string",  prop: "name", base64: true}, 
      {type: "byte",    prop: "type"}, 
      {type: "byte",    prop: "limit_type"}, 
      {type: "decimal", prop: "low"}, 
      {type: "decimal", prop: "high"}, 
      {type: "decimal", prop: "min"}, 
      {type: "decimal", prop: "max"}, 
      {type: "integer", prop: "seats"}, 
      {type: "integer", prop: "required"},
      {type: "integer", prop: "joined"}, 
      {type: "integer", prop: "waiting"},
      {type: "integer", prop: "count"}]),
    notify_error: generate_notify("ERROR", [255, 
      {type: "byte",    prop: "command"},
      {type: "byte",    prop: "code"}]),
    notify_seat_state: generate_notify("SEAT_STATE", [30,
      {type: "integer", prop: "gid"},
      {type: "byte",    prop: "sn"},
      {type: "integer", prop: "state"},
      {type: "integer", prop: "pid"},
      {type: "decimal", prop: "inplay"},
      {type: "string",  prop: "nick", base64: true}]),
    notify_seat_state: generate_notify("SEAT_DETAIL", [83,
      {type: "integer", prop: "gid"},
      {type: "byte",    prop: "sn"},
      {type: "integer", prop: "state"},
      {type: "integer", prop: "pid"},
      {type: "decimal", prop: "inplay"},
      {type: "string", prop: "nick", base64: true}]),
    notify_seat_state: generate_notify("GAME_DETAIL", [81,
      {type: "integer", prop: "gid"},
      {type: "decimal", prop: "pot"},
      {type: "byte",    prop: "players"},
      {type: "byte",    prop: "seats"},
      {type: "byte",    prop: "stage"},
      {type: "decimal", prop: "min"}, 
      {type: "decimal", prop: "max"},
      {type: "decimal", prop: "low"}, 
      {type: "decimal", prop: "high"}
    ]),
    notify_seat_state: generate_notify("END", [24,
      {type: "integer", prop: "gid"}
    ]),
    notify_seat_state: generate_notify("START", [23,
      {type: "integer", prop: "gid"}
    ]),
    notify_seat_state: generate_notify("CANCEL", [25,
      {type: "integer", prop: "gid"}
    ]),
    notify_seat_state: generate_notify("STAGE", [29,
      {type: "integer", prop: "gid"},
      {type: "byte", prop: "stage"}
    ]),
    notify_seat_state: generate_notify("PRIVATE", [82,
      {type: "integer", prop: "gid"},
      {type: "integer", prop: "pid"},
      {type: "byte", prop: "face"},
      {type: "byte", prop: "suit"}
    ]),
    notify_seat_state: generate_notify("SHARE", [22,
      {type: "integer", prop: "gid"},
      {type: "byte", prop: "face"},
      {type: "byte", prop: "suit"}
    ]),
    notify_seat_state: generate_notify("DRAW", [21,
      {type: "integer", prop: "gid"},
      {type: "integer", prop: "pid"},
      {type: "byte", prop: "face"},
      {type: "byte", prop: "suit"}
    ]),
    notify_seat_state: generate_notify("DEALER", [35,
      {type: "integer", prop: "gid"},
      {type: "byte", prop: "seat"}
    ]),
    notify_seat_state: generate_notify("SBLIND", [36,
      {type: "integer", prop: "gid"},
      {type: "byte", prop: "seat"}
    ]),
    notify_seat_state: generate_notify("BBLIND", [37,
      {type: "integer", prop: "gid"},
      {type: "byte", prop: "seat"}
    ]),
    notify_seat_state: generate_notify("BET_REQ", [20,
      {type: "integer", prop: "gid"},
      {type: "decimal", prop: "call"},
      {type: "decimal", prop: "min"},
      {type: "decimal", prop: "max"}
    ]),
    notify_seat_state: generate_notify("ACTOR", [84,
      {type: "integer", prop: "gid"},
      {type: "byte", prop: "seat"}
    ]),
    notify_seat_state: generate_notify("RAISE", [42,
      {type: "integer", prop: "gid"},
      {type: "integer", prop: "pid"},
      {type: "decimal", prop: "raise"},
      {type: "decimal", prop: "call"}
    ]),
    notify_seat_state: generate_notify("BLIND", [85,
      {type: "integer", prop: "gid"},
      {type: "integer", prop: "pid"},
      {type: "decimal", prop: "blind"}
    ]),
    notify_seat_state: generate_notify("UNWATCH", [86,
      {type: "integer", prop: "gid"}
    ]),
    notify_seat_state: generate_notify("SHOW", [40,
      {type: "integer", prop: "gid"},
      {type: "integer", prop: "pid"},
      {type: "byte", prop: "size"},
      {type: "byte", prop: "face1"},
      {type: "byte", prop: "suit1"},
      {type: "byte", prop: "face2"},
      {type: "byte", prop: "suit2"}
    ]),
    notify_seat_state: generate_notify("HAND", [27,
      {type: "integer", prop: "gid"},
      {type: "integer", prop: "pid"},
      {type: "byte", prop: "rank"},
      {type: "byte", prop: "high1"},
      {type: "byte", prop: "high2"},
      {type: "byte", prop: "suit"}
    ]),
    notify_seat_state: generate_notify("WIN", [26,
      {type: "integer", prop: "gid"},
      {type: "integer", prop: "pid"},
      {type: "decimal", prop: "amount"},
      {type: "decimal", prop: "cost"},
    ]),
    notify_seat_state: generate_notify("LEAVE", [45,
      {type: "integer", prop: "gid"},
      {type: "integer", prop: "pid"}
    ]),
    notify_seat_state: generate_notify("JOIN", [44,
      {type: "integer", prop: "gid"},
      {type: "integer", prop: "pid"},
      {type: "byte",    prop: "sn"},
      {type: "decimal", prop: "inplay"},
      {type: "string",  prop: "nick", base64: true}
    ])
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
            case "decimal":
              val = val == undefined ? 0 : val;
              dv.setUint32(offset, val * 10000);
              offset += 4;
              break;
            case "byte":
              val = val == undefined ? 0 : val;
              dv.setUint8(offset, val);
              offset += 1;
              break;
            case "timestamp":
              // 灏嗘椂闂存埑杞崲鎴愬井绉�
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
    commands_by_id[status[0]] = obj;
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
            case "image":
              var result = read_wstring(dv, offset);
              offset = result[0];
              obj[val.prop] = result[1];

              if (val.type == "image") {
                obj[val.prop] = obj[val.prop];
              }

              break;
            case "string":
              var result = read_string(dv, offset);
              offset = result[0];
              obj[val.prop] = result[1];

              if (val.base64 == true) {
                obj[val.prop] = $.base64Decode(obj[val.prop]);
              }
              
              if (val.type == "image") {
                obj[val.prop] = "base64," + obj[val.prop];
              }

              break;
            case "integer":
              obj[val.prop] = dv.getUint32(offset);
              offset += 4;
              break;
            case "decimal":
              obj[val.prop] = dv.getUint32(offset) / 10000;
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

    function read_string(dv, offset) {
      var str = "";
      var len = dv.getUint8(offset);
      offset += 1;
      while(len > 0) {
        str += String.fromCharCode(dv.getUint8(offset));
        offset += 1;
        len--;
      }

      return [offset, str];
    }

    function read_wstring(dv, offset) {
      var str = "";
      var len = dv.getUint32(offset);
      offset += 4;
      while(len > 0) {
        str += String.fromCharCode(dv.getUint8(offset));
        offset += 1;
        len--;
      }

      return [offset, str];
    }

    notifys["NOTIFY_" + status[0]] = obj;
    // }}}
  }
})($)
// vim: fdm=marker

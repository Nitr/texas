$(document).ready(function() {
  module("Protocol Testing");

  test("LOGIN LOGOUT", function() {
    equal_cmd(
      {cmd: 'LOGIN', usr: 'jack', pass: 'pass'},
      [1,4,106,97,99,107,4,112,97,115,115]);
    equal_cmd({cmd: 'LOGOUT'}, [2]);

    equal_notify([31, 0, 0, 0, 1], {notify: "LOGIN", id: 1}, ["notify", "id"]);
    equal_notify([255, 1, 1], {notify: "ERROR"}, ["notify"]);

    equal_notify(
      [19, 0, 0, 0, 1, 0, 0, 0, 20, 8, 100,71,86,122,100,65,61,61, 0, 0, 0, 0, 8, 100,71,86,122,100,65,61,61], 
      {notify: "PLAYER_INFO", id: 1, inplay: 20, nick: "test", location: "test", photo: "base64,"}, 
      ["notify", "id", "inplay", "nick", "location"]);
  });

  test("GAME_QUERY", function() {
    equal_cmd(gen_game_query([1, 0, 0, 0, 0, 0, 0]),
      [13, 1, 1, 0, 0, 0, 0, 0, 0]);
    equal_cmd(gen_game_query([2, 1, 8, 1, 9, 3, 2]),
      [13, 1, 2, 1, 8, 1, 9, 3, 2]);
  });

  test("GAMES_JOIN", function() {
    equal_cmd({cmd: "SEAT_QUERY", gid: "1"},
              [14, 0, 0, 0, 1]);
    equal_cmd({cmd: "JOIN", gid: 5, seat: 1, buyin: 8},
              [8, 0, 0, 0, 5, 1, 0, 1, 56, 128]);
  });

  test("PING PONG", function() {
    equal_notify([254, 0,0,5,34,0,14,189,117,0,8,10,178, 0,0,5,34,0,14,189,117,0,8,10,178], 
                 {notify: "PONG", orign_send: 1314966005527, send: 1314966005527}, 
                 ["notify", "orign_send", "send"]);
    equal_cmd({cmd: "PING", send: 3000002000001}, 
              [253, 0, 0, 0, 3, 0, 0, 0, 2, 0, 0, 0, 1]);
    equal_cmd({cmd: "PING", send: 1314966005527026}, 
              [253, 0,0,5,34,0,14,189,117,0,8,10,178]);
    equal($.pp.write({cmd: "PING"}).byteLength, 13);
  });

});

function gen_game_query(arr) {
  var o = {cmd: 'GAME_QUERY', game_type: 1};
  o.waiting = arr.pop();
  o.waiting_op = arr.pop();
  o.joined = arr.pop();
  o.joined_op = arr.pop();
  o.seats = arr.pop();
  o.seats_op = arr.pop(); 
  o.limit_type = arr.pop(); 
  return o;
}

function equal_notify(bin, result, keys) {
  var data = $.pp.read(bin);
  for(var i = 0; i < keys.length; i++) {
    if (data[keys[i]] != result[keys[i]]) {
      ok(false);
      console.log([data, result]);
      return;
    }
  }

  ok(true);
}

function equal_cmd(data, result) {
  var bin = $.pp.write(data);
  $.each(bin.byteLength, result.length);
  for(var i = 0; i < bin.length; i ++) {
    if (bin[i] != result[i]) {
      ok(false);
      return;
    }
  }

  ok(true);
}


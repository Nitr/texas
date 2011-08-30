$(document).ready(function() {
  module("Protocol Testing");

  test("LOGIN LOGOUT", function() {
    equal_cmd(
      {cmd: 'LOGIN', user: 'jack', pass: 'pass'},
      [1,4,106,97,99,107,4,112,97,115,115]);
    equal_cmd({cmd: 'LOGOUT'}, [2]);

    equal_notify([31, 0, 0, 0, 1], {notify: "LOGIN", id: 1}, ["notify", "id"]);
    equal_notify([255, 1, 1], {notify: "ERROR"}, ["notify"]);

    equal_notify(
      [19, 0, 0, 0, 1, 0, 0, 0, 20, 2, 99, 99, 2, 99, 99], 
      {notify: "PLAYER_INFO", id: 1, inplay: 20, nick: "cc", location: "cc"}, 
      ["notify", "id", "inplay", "nick", "location"]);
  });
});

function equal_notify(bin, result, keys) {
  var data = $.pp.read(bin);
  for(var i = 0; i < keys.length; i++) {
    if (data[keys[i]] != result[keys[i]]) {
      ok(false);
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


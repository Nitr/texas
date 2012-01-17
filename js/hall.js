
$(function() {
  var game, game_counter, game_list, game_preview, game_query, hall, template;
  hall = $('#hall');
  game = $('#game');
  game_preview = $('#game_preview');
  game_list = $('#game_list > tbody');
  template = $('#hall > .template').text();
  game_counter = 0;
  $('#cmd_watch').bind('click', function() {
    var gid;
    gid = game_list.children().first().data('gid');
    hall.trigger('start_game');
    return game.trigger('start_game', {
      action: 'watch',
      gid: gid
    });
  });
  hall.bind('setup', function() {
    $(this).show();
    return $(this).trigger('reload');
  });
  hall.bind('reload', function() {
    var autofill;
    blockUI('#msg_loading');
    game_counter = 0;
    autofill = game_list.children().last().clone();
    game_list.empty().append(autofill);
    return game_query([1, 0, 0, 0, 0, 0, 0]);
  });
  hall.bind('loaded', function() {
    unblockUI();
    game_list.children().first().click();
    if ($.url.get('auto_watch') === 'true') {
      return $(this).oneTime('2s', function() {
        $("#cmd_watch").trigger('click');
      });
    }
  });
  hall.bind('start_game', function() {
    return $(this).hide();
  });
  hall.bind('cancel_game', function() {
    $(this).show();
    return $(this).trigger('reload');
  });
  $.pp.reg("GAME_INFO", function(game_info) {
    game_counter++;
    $(template).data('gid', game_info.id).children('.name').text(game_info.name).parent().children('.blind').text(game_info.low + " / " + game_info.high).parent().children('.player').text(game_info.joined + " / " + game_info.seats).parent().children('.limit').text(game_info.min + " / " + game_info.max).parent().insertBefore('.autofill').click(function() {
      var selected;
      selected = 'selected';
      if ($(this).hasClass(selected)) return;
      $(this).parent().children().removeClass(selected);
      $(this).addClass(selected);
      if ($.game_preview) $.game_preview.clear();
      $.game_preview = new GamePreview($(this).data('gid'), game_preview);
    });
    if (game_counter === game_info.count) hall.trigger('loaded');
  });
  game_query = function(arr) {
    var o;
    o = {
      cmd: 'GAME_QUERY',
      game_type: 0
    };
    o.waiting = arr.pop();
    o.waiting_op = arr.pop();
    o.joined = arr.pop();
    o.joined_op = arr.pop();
    o.seats = arr.pop();
    o.seats_op = arr.pop();
    o.limit_type = arr.pop();
    $.ws.send($.pp.write(o));
  };
});

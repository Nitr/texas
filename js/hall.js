
$(function() {
  var game, game_counter, game_preview, game_query, hall, template;
  hall = $('#hall');
  game = $('#game');
  game_preview = $('#game_preview');
  template = $('#hall > .template').text();
  game_counter = 0;
  $('#cmd_watch').bind('click', function() {
    hall.trigger('switch_game');
    game.trigger('switch_game');
  });
  hall.bind('setup', function() {
    $(this).show();
    $(this).trigger('reload');
  });
  hall.bind('reload', function() {
    blockUI('#msg_loading');
    game_counter = 0;
    $('#game_list tr[gid]').remove();
    game_query([1, 0, 0, 0, 0, 0, 0]);
  });
  hall.bind('loaded', function() {
    unblockUI();
    $('#game_list tr[gid]').first().click();
  });
  hall.bind('switch_game', function() {
    console.log('hall_switch');
    $(this).hide();
  });
  $.pp.reg("GAME_INFO", function(game_info) {
    game_counter++;
    $(template).attr('gid', game_info.id).children('.name').text(game_info.name).parent().children('.blind').text(game_info.low + " / " + game_info.height).parent().children('.player').text(game_info.joined + " / " + game_info.seats).parent().children('.limit').text(game_info.height * 10 + " / " + game_info.height * 200).parent().insertBefore('.autofill').click(function() {
      var selected;
      selected = 'selected';
      if ($(this).hasClass(selected)) return;
      $(this).parent().children().removeClass(selected);
      $(this).addClass(selected);
      if ($.game_preview) $.game_preview.clear();
      $.game_preview = new GamePreview($(this).attr('gid'), game_preview);
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

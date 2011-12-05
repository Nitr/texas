$ ->
  hall = $('#hall')
  game = $('#game')
  game_preview = $('#game_preview')
  template = $('#hall > .template').text()
  game_counter = 0
  
  $('#cmd_watch').bind 'click', ->
    hall.trigger 'switch_game'
    game.trigger 'switch_game'
    return

  hall.bind 'setup', ->
    $(@).show()
    $(@).trigger('reload')
    return

  hall.bind 'reload', ->
    blockUI '#msg_loading'
    game_counter = 0
    $('#game_list tr[gid]').remove()
    game_query [1, 0, 0, 0, 0, 0, 0]
    return

  hall.bind 'loaded', ->
    unblockUI()
    $('#game_list tr[gid]').first().click()
    return
    
  hall.bind 'switch_game', ->
    console.log 'hall_switch'
    $(@).hide()
    return

  $.pp.reg "GAME_INFO", (game_info) ->
    game_counter++

    $(template).attr('gid', game_info.id).
      children('.name').text(game_info.name).parent().
      children('.blind').text(game_info.low + " / " + game_info.height).parent().
      children('.player').text(game_info.joined + " / " + game_info.seats).parent().
      children('.limit').text(game_info.height * 10 + " / " + game_info.height * 200).parent().
      insertBefore('.autofill').
      click(->
        selected = 'selected'
        return if $(@).hasClass selected

        $(@).parent().children().removeClass selected
        $(@).addClass selected

        $.game_preview.clear() if $.game_preview
        $.game_preview = new GamePreview($(@).attr('gid'), game_preview)

        return
      )

    hall.trigger 'loaded' if game_counter == game_info.count
    return

  game_query = (arr) ->
    o = {cmd: 'GAME_QUERY', game_type: 0}
    o.waiting = arr.pop()
    o.waiting_op = arr.pop()
    o.joined = arr.pop()
    o.joined_op = arr.pop()
    o.seats = arr.pop()
    o.seats_op = arr.pop()
    o.limit_type = arr.pop()
    $.ws.send($.pp.write(o))
    return

  return

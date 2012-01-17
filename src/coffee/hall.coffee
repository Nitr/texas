$ ->
  hall = $('#hall')
  game = $('#game')
  game_preview = $('#game_preview')
  game_list = $('#game_list > tbody')
  template = $('#hall > .template').text()
  game_counter = 0
  
  $('#cmd_watch').bind 'click', ->
    gid = game_list.children().first().data('gid')
    hall.trigger 'start_game'
    game.trigger 'start_game', {action: 'watch', gid: gid}

  hall.bind 'setup', ->
    $(@).show()
    $(@).trigger('reload')

  hall.bind 'reload', ->
    blockUI '#msg_loading'
    game_counter = 0
    # clone autofill apendto empty game_list
    autofill = game_list.children().last().clone()
    game_list.empty().append(autofill)
    game_query [1, 0, 0, 0, 0, 0, 0]

  hall.bind 'loaded', ->
    unblockUI()
    game_list.children().first().click()

    if $.url.get('auto_watch') is 'true'
      $(@).oneTime '2s', ->
        $("#cmd_watch").trigger 'click'
        return
    
  hall.bind 'start_game', ->
    $(@).hide()

  hall.bind 'cancel_game', ->
    $(@).show()
    $(@).trigger('reload')

  $.pp.reg "GAME_INFO", (game_info) ->
    game_counter++

    $(template).data('gid', game_info.id).
      children('.name').text(game_info.name).parent().
      children('.blind').text(game_info.low + " / " + game_info.high).parent().
      children('.player').text(game_info.joined + " / " + game_info.seats).parent().
      children('.limit').text(game_info.min + " / " + game_info.max).parent().
      insertBefore('.autofill').
      click(->
        selected = 'selected'
        return if $(@).hasClass selected

        $(@).parent().children().removeClass selected
        $(@).addClass selected

        $.game_preview.clear() if $.game_preview
        $.game_preview = new GamePreview($(@).data('gid'), game_preview)

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

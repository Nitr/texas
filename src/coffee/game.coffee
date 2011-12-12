class Game
  constructor: (@gid, @dom) ->
    return

  init: (@detail) ->
    @seats = []
    @dom.trigger 'inited'
    return

  init_seat: (seat_detail) ->
    switch seat_detail.state
      when PS_EMPTY then @seats[seat_detail.sn] = new EmptySeat seat_detail, @
      else @seats[seat_detail.sn] = new PlayingSeat seat_detail, @

    return

$ ->
  game = null
  game_dom = $('#game')

  game_dom.bind 'switch_game', (event, args)->
    game = new Game args.gid, game_dom
    cmd = {gid: args.gid}

    switch args.action
      when 'watch' then $.extend(cmd, {cmd: "WATCH"})
      when 'join' then $.extend(cmd, {cmd: "JOIN", buyin: args.buyin, seat: 0})
      else throw 'unknown game action'

    $.ws.send $.pp.write cmd

    $(@).show()
    blockUI '#msg_joining'

    $(@).oneTime '3s', ->
      # 3s timeout show network error
      blockUI '#err_network'
      return

  game_dom.bind 'inited', ->
    $(@).stopTime()
    unblockUI()
    return

  # {{{
  $.pp.reg "GAME_DETAIL", (detail) ->
    game.init detail
    return

  $.pp.reg "SEAT_DETAIL", (detail) ->
    game.init_seat detail
    return

  $.pp.reg "CANCEL", (args) ->
    return

  $.pp.reg "SHOW", (args) ->
    return

  $.pp.reg "HAND", (args) ->
    return

  $.pp.reg "WIN", (args) ->
    return

  $.pp.reg "END", (args) ->
    return

  $.pp.reg "START", (args) ->
    return

  $.pp.reg "DEALER", (args) ->
    return

  $.pp.reg "SBLIND", (args) ->
    return

  $.pp.reg "BBLIND", (args) ->
    return

  $.pp.reg "RAISE", (args) ->
    return

  $.pp.reg "DRAW", (args) ->
    return

  $.pp.reg "PRIVATE", (args) ->
    return

  $.pp.reg "ACTOR", (args) ->
    return

  $.pp.reg "STAGE", (args) ->
    return

  $.pp.reg "JOIN", (args) ->
    return

  $.pp.reg "LEAVE", (args) ->
    return

  $.pp.reg "BET_REQ", (args) ->
    return

  # }}}

  return

class Game
  constructor: (@gid, @dom) ->
    return

  init: (@detail) ->
    @seats = []
    @dom.trigger 'inited'

  init_seat: (@detail) ->
    #@seats[@detail.seat] = new Seat @detail

    return

$ ->
  game = null
  game_dom = $('#game')

  game_dom.bind 'switch_game', (event, args)->
    game = new Game args.gid, game_dom

    switch args.action
      when 'watch' then $.ws.send $.pp.write {cmd: "WATCH", gid: args.gid}
      when 'join' then $.ws.send $.pp.write {cmd: "JOIN", gid: args.gid, seat: 0, buyin: args.buyin}
      else throw 'unknown game action'

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
  # }}}

  return

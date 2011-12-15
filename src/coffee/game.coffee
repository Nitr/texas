class Game
  constructor: (@gid, @dom) ->
    return

  init: (@detail) ->
    @seats = []
    @dom.trigger 'inited'

  init_seat: (seat_detail) ->
    switch seat_detail.state
      when PS_EMPTY then @seats[seat_detail.sn] = new EmptySeat seat_detail, @
      else @seats[seat_detail.sn] = new PlayingSeat seat_detail, @

  get_seat_by_pid: (o) ->
    return seat for seat in @seats when seat? and seat.__proto__.constructor is PlayingSeat and seat.player.pid is o.pid

  get_seat_by_sn: (o) ->
    return seat for seat in @seats when seat? and seat.__proto__.constructor is PlayingSeat and seat.sn is o.seat

  get_seat: (o) ->
    if 'pid' of o
      return @get_seat_by_pid(o)
    else if 'seat' of o
      return @get_seat_by_sn(o)
    else
      throw "unknown object #{o} in get_seat()"

  new_stage: ->
    ref = @dom
    @dom.oneTime '1s', ->
      $(bet).css($.positions.get_random([240, 680], 20)).removeClass('bet').addClass('pot') for bet in ref.children(".bet")
    return

$ ->
  game = null
  game_dom = $('#game')

  game_dom.bind 'switch_game', (event, args)->
    game = new Game args.gid, game_dom
    cmd = {gid: args.gid}

    $.game = game

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

  $.pp.reg "START", (args) ->
    return

  $.pp.reg "END", (args) ->
    return

  $.pp.reg "DEALER", (args) ->
    seat = game.get_seat args
    seat.set_dealer()
    return

  $.pp.reg "SBLIND", (args) ->
    return

  $.pp.reg "BBLIND", (args) ->
    return

  $.pp.reg "RAISE", (args) ->
    sum = args.call + args.raise
    seat = game.get_seat args

    if sum is 0
      seat.check()
    else
      seat.raise(args.call, args.raise)

    return

  $.pp.reg "DRAW", (args) ->
    return

  $.pp.reg "PRIVATE", (args) ->
    return

  $.pp.reg "SHARE", (args) ->
    return

  $.pp.reg "ACTOR", (args) ->
    return

  $.pp.reg "STAGE", (args) ->
    game.new_stage()
    return

  $.pp.reg "JOIN", (args) ->
    return

  $.pp.reg "LEAVE", (args) ->
    return

  $.pp.reg "BET_REQ", (args) ->
    return

  $.pp.reg "SHOW", (args) ->
    return

  $.pp.reg "HAND", (args) ->
    return

  $.pp.reg "WIN", (args) ->
    return

  # }}}

  return

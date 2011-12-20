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

  join: (seat_detail) ->
    @seats[seat_detail.sn].remove()
    @seats[seat_detail.sn] = new PlayingSeat seat_detail, @

  leave: (seat_detail) ->
    return @seats[seat_detail.sn].__proto__.constructor is EmptySeat
    @seats[seat_detail.sn].clear()
    @seats[seat_detail.sn] = new EmptySeat seat_detail, @

  clear: ->
    $.positions.reset_share()
    $(".bet, .pot, .card").remove()
    seat.clear() for seat in @seats when seat? and seat.__proto__.constructor is PlayingSeat

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
    @dom.oneTime '0.3s', ->
      $(bet).css($.positions.get_random([240, 680], 20)).removeClass('bet').addClass('pot') for bet in ref.children(".bet")
    return

  share_card: (face, suit) ->
    $.get_poker(face, suit).
      css($.positions.get_next_share()).
      appendTo(@dom)

  win: (seat) ->
    ref = @dom
    ref.oneTime '1s', ->
      $(bet).css($.positions.get_bet(seat.sn).start) for bet in ref.children(".bet, .pot")
    return

  high: (face, suit, filter, seat_pokers) ->
    pokers = $.merge(@dom.children('.card'), seat_pokers)
    pokers = $.find_poker(face, suit, pokers)
    pokers = filter(pokers) if filter?
    pokers.addClass('high_card')

  clear_high: ->
    $.find_poker().removeClass('high_card')

  clear_actor: ->
    $('.actor_timer').remove()
    $('.actor_seat').removeClass('actor_seat')

$ ->
  game = null
  game_dom = $('#game')
  hall_dom = $('#hall')

  game_dom.bind 'cancel_game', (event, args) ->
    game.clear()
    game = null
    $(@).hide()

  game_dom.bind 'start_game', (event, args) ->
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

  $.get_poker = (face, suit) ->
    $("<img src='#{$.rl.poker["#{new Number(face << 8 | suit)}"]}' class='card'/>").attr('face', face).attr('suit', suit)

  $.find_poker = (face, suit, pokers) ->
    return pokers.filter("[face=#{face}]").filter("[suit=#{suit}]") if face? and suit?
    return pokers.filter("[face=#{face}]") if face?
    return pokers.filter("[suit=#{suit}]") if suit?
    return $(".card")

  # {{{
  $.pp.reg "GAME_DETAIL", (detail) ->
    game.init detail

  $.pp.reg "SEAT_DETAIL", (detail) ->
    game.init_seat detail

  $.pp.reg "SEAT_STATE", (detail) ->
    return unless game
    console.log "STATE #{detail.pid}: #{detail.state}"

  $.pp.reg "CANCEL", (args) ->
    return

  $.pp.reg "START", (args) ->
    game.clear()
    return

  $.pp.reg "END", (args) ->
    return

  $.pp.reg "DEALER", (args) ->
    seat = game.get_seat args
    seat.set_dealer()

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

  $.pp.reg "DRAW", (args) ->
    seat = game.get_seat args
    seat.draw_card()

  $.pp.reg "SHARE", (args) ->
    game.share_card(args.face, args.suit)

  $.pp.reg "PRIVATE", (args) ->
    console.log args

  $.pp.reg "ACTOR", (args) ->
    seat = game.get_seat args
    seat.set_actor()

  $.pp.reg "STAGE", (args) ->
    game.new_stage() if args.stage != GS_PREFLOP

  $.pp.reg "JOIN", (args) ->
    game.join args
    return

  $.pp.reg "LEAVE", (args) ->
    game.leave args
    return

  $.pp.reg "BET_REQ", (args) ->
    return

  $.pp.reg "SHOW", (args) ->
    game.new_stage()
    seat = game.get_seat args
    seat.private_card(args.face1, args.suit1, 1)
    seat.private_card(args.face2, args.suit2, 2)

  $.pp.reg "HAND", (args) ->
    seat = game.get_seat args
    seat.set_hand args
    seat.set_rank()

  $.pp.reg "WIN", (args) ->
    game.clear_actor()
    seat = game.get_seat args
    game.win seat
    seat.high()
  # }}}

  return

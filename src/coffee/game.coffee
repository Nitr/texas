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

  clear: ->
    $.positions.reset_share()

    @dom.children(".pot").remove()
    @dom.children(".card").remove()

    seat.clear() for seat in @seats when seat?

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

  share_card: (face, suit) ->
    $.get_poker(face, suit).
      css($.positions.get_next_share()).
      appendTo(@dom)

  high: (face, suit) ->
    pokers = $.find_poker(face)
    console.log [pokers.size(), face, suit]
    pokers.addClass('high_card')

  clear_high: ->
    $.find_poker().removeClass('high_card')

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

  $.get_poker = (face, suit) ->
    $("<img src='#{$.rl.poker["#{new Number(face << 8 | suit)}"]}' class='card'/>").attr('face', face).attr('suit', suit)

  $.find_poker = (face, suit) ->
    return $("[face=#{face}]").filter("[suit=#{suit}]") if face? and suit?
    return $("[face=#{face}]") if face? 
    return $("[suit=#{suit}]") if suit? 
    return $(".card")
    
  # {{{
  $.pp.reg "GAME_DETAIL", (detail) ->
    game.init detail

  $.pp.reg "SEAT_DETAIL", (detail) ->
    game.init_seat detail

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
    game.new_stage()

  $.pp.reg "JOIN", (args) ->
    return

  $.pp.reg "LEAVE", (args) ->
    return

  $.pp.reg "BET_REQ", (args) ->
    return

  $.pp.reg "SHOW", (args) ->
    seat = game.get_seat args
    seat.private_card(args.face1, args.suit1, 1)
    seat.private_card(args.face2, args.suit2, 2)

  $.pp.reg "HAND", (args) ->
    suit = args.suit
    face = args.high1
    face2 = args.high2

    game.clear_high()

    switch args.rank
      when HC_PAIR, HC_THREE_KIND, HC_FOUR_KIND
        game.high face
      when HC_TWO_PAIR, HC_FULL_HOUSE
        game.high face
        game.high face2
      when HC_FLUSH, HC_STRAIGHT, HC_STRAIGHT_FLUSH
        console.log 'HC_HACK'
      when HC_HIGH_CARD
      else
        throw "Unknown poker rank #{args.rank}"

    seat = game.get_seat args
    seat.set_high args

    return
      #when HC_FLUSH
        #$("[suit=" + args.suit + "]").
          #sort(compare_card).
          #slice(0, 5).
          #each(function() {
            #set_high_css($(this))
          #})
      #when HC_STRAIGHT
        #set_high(args.high1)
        #set_high(args.high1 - 1)
        #set_high(args.high1 - 2)
        #set_high(args.high1 - 3)
        #if (args.high1 == CF_FIVE) {
          #set_high(CF_ACE)
        #} else {
          #set_high(args.high1 - 4)
        #}
      #when HC_STRAIGHT_FLUSH
        #set_high(args.high1, args.suit)
        #set_high(args.high1 - 1, args.suit)
        #set_high(args.high1 - 2, args.suit)
        #set_high(args.high1 - 3, args.suit)
        #if (args.high1 == CF_FIVE) {
          #set_high(CF_ACE, args.suit)
        #} else {
          #set_high(args.high1 - 4, args.suit)
        #}
    #return

  $.pp.reg "WIN", (args) ->
    return

  # }}}

  return

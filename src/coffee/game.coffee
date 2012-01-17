class Game
  constructor: (@gid, @dom) ->
    return

  init: (@detail) ->
    @stage = GS_PREFLOP
    @seats = []
    @dom.trigger 'inited'

  init_seat: (seat_detail) ->
    switch seat_detail.state
      when PS_EMPTY then @seats[seat_detail.sn] = new EmptySeat seat_detail, @
      else @seats[seat_detail.sn] = new PlayingSeat seat_detail, @

  update_seat: (seat_detail) ->
    if seat_detail.state is PS_EMPTY
      return

  reset_position: (sn)->
    $.positions.offset = $.positions.size - sn + 1
    seat.set_position() for seat in @seats when seat?

  join: (seat_detail) ->
    @seats[seat_detail.sn].remove()
    @seats[seat_detail.sn] = new PlayingSeat seat_detail, @

    if seat_detail.pid is $.player.pid
      @player = $.player
      @hide_empty()
      @reset_position(seat_detail.sn)

    @seats[seat_detail.sn].disable()

  hide_empty: ->
    $("#cmd_leave").attr('disabled', false).removeClass('disabled')
    seat.hide() for seat in @seats when seat? and seat.__proto__.constructor is EmptySeat

  show_empty: ->
    $("#cmd_leave").attr('disabled', true).addClass('disabled')
    seat.show() for seat in @seats when seat? and seat.__proto__.constructor is EmptySeat

  leave: (args) ->
    seat = @seats[args.sn]

    if seat.__proto__.constructor is EmptySeat
      return

    if args.player.pid is $.player.pid
      @player = null

    @seats[seat.sn].clear()
    @seats[seat.sn].remove()
    @seats[seat.sn] = new EmptySeat {sn: args.sn}, @

    if @player
      @hide_empty()
    else
      @show_empty()

  clear: ->
    @stage = GS_PREFLOP
    $.positions.reset_share()
    $(".bet, .pot, .card").remove()
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
    else if 'sn' of o
      return @get_seat_by_sn(o)
    else
      throw "unknown object #{o} in get_seat()"

  new_stage: (stage)->
    @stage = stage
    seat.reset_bet() for seat in @seats when seat? and seat.__proto__.constructor is PlayingSeat
    ref = @dom
    @dom.oneTime '0.3s', ->
      $(bet).css($.positions.get_random([240, 680], 20)).removeClass('bet').addClass('pot') for bet in ref.children(".bet")

  share_card: (face, suit) ->
    $.get_poker(face, suit).
      css($.positions.get_next_share()).
      appendTo(@dom)

  win: (seat) ->
    ref = @dom
    ref.oneTime '1s', ->
      $(bet).css($.positions.get_bet(seat.sn).start) for bet in ref.children(".bet, .pot")

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

  disable_actions: (key)->
    unless key?
      $("#cmd_call").text '跟注'
      $("#cmd_raise").text '加注'

      $("#game > .actions > *").attr("disabled", true).addClass('disabled')
    else
      if key is '#cmd_call'
        $("#cmd_call").text '跟注'
      if key is '#cmd_raise'
        $("#cmd_raise").text '加注'

      $("#game > .actions").children(key).attr("disabled", true).addClass('disabled')

  enable_actions: (args)->
    $("#game > .actions > *").attr("disabled", false).removeClass('disabled')

    if args.call >= args.max
      $("#cmd_call").text "ALL-IN $#{args.max}"
      @disable_actions '#cmd_raise'
      @disable_actions '#cmd_check'
      @disable_actions '#raise_range'
      @disable_actions '#raise_number'
    else
      $("#cmd_call").text "跟注 $#{args.call}"

    @disable_actions if args.call is 0 then '#cmd_call' else '#cmd_check'

  set_actor: (args)->
    @actor = @get_seat args
    @actor.set_actor()

  check_actor: ->
    if @actor? and @actor.player.pid is $.player.pid
      return true

    return false

  check: ->
    $.ws.send $.pp.write {cmd: "RAISE", amount: 0, gid: @gid}

  fold: ->
    $.ws.send $.pp.write {cmd: "FOLD", gid: @gid}

  call: (amount = 0)->
    $.ws.send $.pp.write {cmd: "RAISE", amount: amount, gid: @gid}

$ ->
  game = null
  game_dom = $('#game')
  hall_dom = $('#hall')
  private_card_sn = 0

  log = (msg) ->
    $('#logs').
      append("#{msg}<br />").
      scrollTop($('#logs')[0].scrollHeight)

  log_empty = () ->
    $('#logs').empty()

  nick = (o) ->
    return "<strong class='nick'>#{o.nick}</strong>" if o.nick
    "<strong class='nick'>#{o.player.nick}</strong>"

  money = (n) ->
    "<strong class='amount'>$#{n}</strong>"

  action = (a) ->
    "<strong class='action'>#{a}</strong>"

  rank = (r) ->
    "<strong class='rank'>#{r}</strong>"

  game_dom.bind 'cancel_game', (event, args) ->
    log_empty()
    game.clear()
    game = null
    $("#game > .playing_seat").remove()
    $("#game > .empty_seat").remove()
    $(@).hide()

  game_dom.bind 'start_game', (event, args) ->
    $("#cmd_leave").attr('disabled', true).addClass('disabled')

    game = new Game args.gid, game_dom
    game.disable_actions()

    cmd = {gid: args.gid}

    $.game = game

    switch args.action
      when 'watch' then $.extend(cmd, {cmd: "WATCH"})
      when 'join' then $.extend(cmd, {cmd: "JOIN", buyin: args.buyin, seat: 0})
      else throw 'unknown game action'

    $.ws.send $.pp.write cmd

    $(@).show()

    $(@).oneTime '3s', ->
      # 3s timeout show network error
      blockUI '#err_network'
      return

  game_dom.bind 'inited', ->
    $(@).stopTime()
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
    if detail.players < 2
      growlUI "#tips_empty"
    else
      unblockUI()

  $.pp.reg "SEAT_DETAIL", (detail) ->
    game.init_seat detail

  $.pp.reg "SEAT_STATE", (detail) ->
    return unless game
    return if detail.state is PS_EMPTY

    seat = game.get_seat detail

    if seat.update detail
      if detail.state is PS_ALL_IN
        log "#{nick detail} #{action 'ALL-IN'}"
      else if detail.state is PS_FOLD
        log "#{nick detail} #{action '棄牌'}"
      else if detail.state is PS_OUT
        log "#{nick detail} #{action 'OUT'}"

  $.pp.reg "CANCEL", (args) ->
    game.clear()
    log ""
    log "===== #{action '請等待其他玩家的加入'} ====="


  $.pp.reg "START", (args) ->
    if $(".blockUI > .buyin").size() is 0
      unblockUI()

    game.clear()

    log ''
    log "===== #{action '新的牌局開始'} ====="

  $.pp.reg "END", (args) ->
    return

  $.pp.reg "DEALER", (args) ->
    seat = game.get_seat args
    seat.set_dealer()

  $.pp.reg "SBLIND", (args) ->
    return

  $.pp.reg "BBLIND", (args) ->
    return

  $.pp.reg "BLIND", (args) ->
    seat = game.get_seat args
    seat.raise(args.blind, 0)
    log "#{nick seat} #{action '下盲注'} #{money args.blind}"

  $.pp.reg "RAISE", (args) ->
    sum = args.call + args.raise
    seat = game.get_seat args

    if sum is 0
      seat.check()
      log "#{nick seat} #{action '看牌'}"
    else
      seat.raise(args.call, args.raise)
      if args.raise is 0
        log "#{nick seat} #{action '跟注'} #{money args.call}"
      else
        log "#{nick seat} #{action '加注'} #{money args.raise}"

  $.pp.reg "DRAW", (args) ->
    seat = game.get_seat args
    seat.draw_card()

  $.pp.reg "SHARE", (args) ->
    game.share_card(args.face, args.suit)

  $.pp.reg "PRIVATE", (args) ->
    private_card_sn += 1

    seat = game.get_seat args
    seat.private_card(args.face, args.suit, private_card_sn)

    if private_card_sn == 2
      private_card_sn = 0
    return

  $.pp.reg "ACTOR", (args) ->
    game.set_actor(args)

    unless game.check_actor()
      game.disable_actions()

  $.pp.reg "STAGE", (args) ->
    game.new_stage(args.stage) if args.stage != GS_PREFLOP

  $.pp.reg "JOIN", (args) ->
    game.join args
    log "#{nick args} #{action '加入'}"

  $.pp.reg "LEAVE", (args) ->
    seat = game.get_seat args
    game.leave seat

  $.pp.reg "UNWATCH", (args) ->
    game_dom.trigger 'cancel_game'
    hall_dom.trigger 'cancel_game'

  $.pp.reg "BET_REQ", (args) ->
    game.enable_actions(args)

    $('#raise_range, #raise_number').val(args.min).
      attr('min', args.min).
      attr('max', args.max)

  $.pp.reg "SHOW", (args) ->
    game.new_stage()
    seat = game.get_seat args
    seat.private_card args.face1, args.suit1, 1
    seat.private_card args.face2, args.suit2, 2

  $.pp.reg "HAND", (args) ->
    seat = game.get_seat args
    seat.set_hand args
    seat.set_rank()

    if game.check_actor()
      seat.high()

  $.pp.reg "WIN", (args) ->
    game.clear_actor()
    seat = game.get_seat args
    game.win seat
    seat.high()

    msg = "#{nick seat} #{rank seat.rank} #{action '贏得'} #{money (args.amount - args.cost)}"

    log msg

    if $(".blockUI > .buyin").size() is 0
      growlUI "<div>#{msg}</div>"

  # }}}

  $("#game > .actions > [id^=cmd_fold]").bind 'click', ->
    return if $(@).hasClass('disabled')
    return unless game.check_actor()

    game.fold()

  $("#game > .actions > [id^=cmd_check]").bind 'click', ->
    return if $(@).hasClass('disabled')
    return unless game.check_actor()

    game.check()

  $("#game > .actions > [id^=cmd_call]").bind 'click', ->
    return if $(@).hasClass('disabled')
    return unless game.check_actor()

    game.call()

  $("#game > .actions > [id^=cmd_raise]").bind 'click', ->
    return if $(@).hasClass('disabled')
    return unless game.check_actor()

    $('#raise_range').trigger 'change'
    amount = parseInt $('#raise_range').val()
    game.call(amount)

  $("#game > .actions > [id^=cmd]").bind 'click', ->
    game.disable_actions()

  $('#raise_range, #raise_number').bind 'change', (event) ->
    v = parseInt $(this).val()
    min = parseInt $(this).attr("min")
    max = parseInt $(this).attr("max")

    if (v < min)
      v = min

    if (v > max)
      v = max

    $('#raise_range, #raise_number').val(v.toString())

  $('#cmd_cancel').bind 'click', (event) ->
    $.ws.send $.pp.write {cmd: "UNWATCH", gid: $.game.gid}

  $('#cmd_leave').bind 'click', (event) ->
    $.ws.send $.pp.write {cmd: "LEAVE", gid: $.game.gid}

  return

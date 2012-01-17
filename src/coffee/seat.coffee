class Seat
  constructor: (@detail, @game) ->
    @sn = @detail.sn
    @init_dom()

  init_dom: () ->
    @dom = @get_dom()
    @dom.data('sn', @sn)
    @set_position()
    @dom.appendTo @game.dom

  set_position: () ->
    @dom.css @get_position()
    @dom.children(".draw_card").css($.positions.get_draw(@sn))

  remove: ->
    @dom.remove()

class EmptySeat extends Seat
  constructor: (@detail, @game) ->
    super

  get_dom: ->
    $("#game > .template > .empty_seat").clone true

  get_position: ->
    $.positions.get_empty @detail.sn

  hide: ->
    @dom.hide()

  show: ->
    @dom.show()

  clear: ->
    return

class PlayingSeat extends Seat
  constructor: (@detail, @game) ->
    super
    @bet = 0
    @state = PS_PLAY
    @player = new Player @detail.pid, @dom, @detail
    @poker = @dom.children('.card')
    @draw_card() if @game.detail.stage != GS_CANCEL and @game.detail.stage != GS_PREFLOP

  clear: ->
    @player.set_nick()
    @dom.children(".card").remove()
    @dom.children(".high_label").removeClass("high_label")
    @dom.removeClass('disabled')

  update: (detail)->
    @player.set_inplay detail.inplay
    return false if detail.state is @state
    @state = detail.state
    return true

  get_dom: ->
    $("#game > .template > .playing_seat").clone true

  get_position: ->
    $.positions.get_playing @detail.sn

  set_position: () ->
    super
    @dom.children(".draw_card").css($.positions.get_draw(@sn))
    @dom.children(".bet_lab").css($.positions.get_bet_lab(@sn))

  raise: (call, raise) ->
    @bet += (call + raise)
    @dom.children('.bet_lab').text(@bet).show()

    ps = $.positions.get_bet(@sn)
    bets = $.compute_bet_count(call + raise, [])
    @raise_bet $.rl.img[bet], ps for bet in bets

  raise_bet: (img, ps) ->
    bet = $("<img class='bet' src='" + img + "' />").css(ps.start).appendTo(@game.dom)

    $(@dom).oneTime 100, ->
      bet.css($.positions.get_random(ps.end, 5))

  disable: ->
    @dom.addClass('disabled')
    @dom.children(".draw_card").hide()

  check: ->
    return

  set_dealer: ->
    dealer = $('.playing_seat > .dealer')
    if dealer.size() is 0
      $('#game > .template > .dealer').clone().insertBefore(@dom.children(".nick"))
    else
      dealer.remove().insertBefore(@dom.children(".nick"))

  set_actor: ->
    @game.clear_actor()
    @dom.addClass('actor_seat')

    $('<div class="actor_timer"><div /></div>').appendTo(@dom).oneTime 100, ->
      $(@).children('div').css({'margin-top': '120px'})

  draw_card: ->
    @dom.children(".draw_card").css($.positions.get_draw(@sn)).show()

  private_card: (face, suit, card_sn)->
    @dom.children(".draw_card").hide()

    poker = $.get_poker(face, suit).
      addClass('private_card').
      css($.positions.get_private(@sn, card_sn)).
      appendTo(@dom)

    @pokers = @dom.children('.card')

  set_rank: () ->
    @rank = RANKS[@hand.rank]
    unless @hand.rank is HC_HIGH_CARD
      @dom.children(".nick").addClass("high_label").text(@rank)

  set_hand: (hand) ->
    @hand = {
      face: hand.high1, face2: hand.high2,
      suit: hand.suit, rank: hand.rank
    }

  reset_bet: ->
    @bet = 0
    @dom.children('.bet_lab').hide()

  high: () ->
    game = @game
    game.clear_high()
    pokers = @pokers
    null_suit = null
    null_face = null

    high = (face, suit, filter) ->
      game.high face, suit, filter, pokers

    switch @hand.rank
      when HC_PAIR, HC_THREE_KIND, HC_FOUR_KIND
        high @hand.face
      when HC_TWO_PAIR, HC_FULL_HOUSE
        high @hand.face
        high @hand.face2
      when HC_FLUSH
        high null_face, @hand.suit, (pokers) ->
          pokers.sort($.compare_card).slice(0, 5)
        console.log 'HC_FLUSH'
      when HC_STRAIGHT, HC_STRAIGHT_FLUSH
        faces = [
          @hand.face, @hand.face - 1,
          @hand.face - 2, @hand.face - 3,
          if @hand.face is CF_FIVE then CF_ACE else (@hand.face - 4)
        ]

        one = (pokers) ->
          result = pokers.first()
          return result

        s = if @hand.rank is HC_STRAIGHT_FLUSH then @hand.suit else null_suit

        high f, s, one for f in faces
        console.log 'HC_STRAIGHT or HC_STRAIGHT_FLUSH'
      when HC_HIGH_CARD
      else
        throw "Unknown poker rank #{args.rank}"

    return

$ ->
  mod_sum = (sum, bet, bets) ->
    times = Math.floor(sum / bet[0])
    bets.push bet[1] for i in [1..times]
    return sum % bet[0]

  $.compute_bet_count = (sum, bets) ->
    sum = mod_sum sum, bet, bets for bet in BETS when sum >= bet[0]
    "betting_#{b}" for b in bets


  $.compare_card = (a, b) ->
    a1 = new Number($(a).attr('face'))
    b1 = new Number($(b).attr('face'))

    if (a1 > b1)
      return -1
    else if (a1 < b1)
      return 1
    else
      return 0

  $("#game .empty_seat").bind 'click', ->
    min = $.game.detail.min
    max = $.game.detail.max
    balance = $.player.balance

    if (balance < min)
      return $('#page').block {
        message: $("#err_buyin").clone()
        css: BLOCKUI
        timeout: 2000
      }

    $('#page').block {
      message: $(".buyin").clone(true, true).data('sn', $(@).data('sn'))
      css: $.extend(BLOCKUI, {width: '300px'})
    }

    max = if balance < max then balance else max
    buyin = if balance > max then max else min * 10
    buyin = if buyin > balance then balance else buyin

    $('.buyin #range_buy').
      attr('min', min).
      attr('max', max).
      val(buyin)

    $(".buyin #min").text format $.game.detail.min
    $(".buyin #max").text format $.game.detail.max
    $(".buyin #lab_min").text format min
    $(".buyin #lab_max").text format max
    $(".buyin #balance").text format balance
    $(".buyin #lab_buyin").text format buyin

  $(".buyin #cmd_buy").bind 'click', ->
    $(@).attr('disabled', true)
    sn = $(@).parent().data('sn')
    buyin = $(@).parent().children('#range_buy').val()
    cmd = {cmd: "JOIN", gid: $.game.gid, seat: sn, buyin: parseInt(buyin)}
    $.ws.send $.pp.write cmd
    $('#page').unblock()

  $(".buyin #cmd_cancel").bind 'click', ->
    $('#page').unblock()

  $(".buyin #range_buy").bind 'change', (event) ->
    $(".buyin #lab_buyin").text format $(@).val()

  $("#cmd_up").bind 'click', ->
    cmd = {cmd: "LEAVE", gid: $.game.gid}
    $.ws.send $.pp.write cmd

  $("#cmd_exit").bind 'click', ->
    return

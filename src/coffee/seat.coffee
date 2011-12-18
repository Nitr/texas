class Seat
  constructor: (@detail, @game) ->
    @sn = @detail.sn
    @init_dom()

  init_dom: () ->
    @dom = @get_dom()
    @set_position()
    @dom.data('sn', @sn).data('game', @game).appendTo $("#game")

  set_position: (@offset = 0) ->
    @dom.css @get_position()

  clear: ->
    @dom.children(".high_label").removeClass("high_label")
    return

class EmptySeat extends Seat
  constructor: (@detail, @game) ->
    super

  get_dom: ->
    $("#game > .template > .empty_seat").clone true

  get_position: ->
    $.positions.get_empty @detail.sn, @offset
    
class PlayingSeat extends Seat
  constructor: (@detail, @game) ->
    super
    @player = new Player @detail.pid, @dom, @detail
    @poker = @dom.children('.card')

  clear: ->
    @player.set_nick()
    @dom.children(".card").remove()
    super

  get_dom: ->
    $("#game > .template > .playing_seat").clone true

  get_position: ->
    $.positions.get_playing @detail.sn, @offset

  raise: (call, raise) ->
    ps = $.positions.get_bet(@sn)
    bets = $.compute_bet_count(call + raise, [])

    @raise_bet $.rl.img[bet], ps for bet in bets

    return

  raise_bet: (img, ps) ->
    bet = $("<img class='bet' src='" + img + "' />").css(ps.start).appendTo(@game.dom)

    $(@dom).oneTime 100, ->
      bet.css($.positions.get_random(ps.end, 5))

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
    @dom.children(".nick").addClass("high_label").text(RANKS[@hand.rank])

  set_hand: (hand) ->
    @hand = {
      face: hand.high1, face2: hand.high2,
      suit: hand.suit, rank: hand.rank
    }

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
          pokers.sort(compare_card).slice(0, 5)
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

  $.compute

  $("#game .empty_seat").bind 'click', ->
    return

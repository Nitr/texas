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
    @dom.remove()

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
    bet = $("<img class='bet' src='" + img + "' />").css(ps).appendTo(@game.dom)

    $(@dom).oneTime 100, ->
      bet.css($.positions.get_random([500,500]))

  check: ->
    return

  set_dealer: ->
    dealer = $('.playing_seat > .dealer')
    if dealer.size() is 0
      $('#game > .template > .dealer').clone().insertBefore(@dom.children(".nick"))
    else
      dealer.remove().insertBefore(@dom.children(".nick"))

$ ->
  mod_sum = (sum, bet, bets) ->
    times = Math.floor(sum / bet[0])
    bets.push bet[1] for i in [1..times]
    return sum % bet[0]

  $.compute_bet_count = (sum, bets) ->
    sum = mod_sum sum, bet, bets for bet in BETS when sum >= bet[0]
    "betting_#{b}" for b in bets

  $("#game .empty_seat").bind 'click', ->
    return

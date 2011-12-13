class Seat
  constructor: (@detail, @game) ->
    @sn = @detail.sn
    @init_dom()

  init_dom: () ->
    @dom = @get_dom()
    @set_position()
    @dom.data('sn', @sn).appendTo $("#game")

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
    $.positions.get_empty_position @detail.sn, @offset
    
class PlayingSeat extends Seat
  constructor: (@detail, @game) ->
    super
    @player = new Player @detail.pid, @dom, @detail

  get_dom: ->
    $("#game > .template > .playing_seat").clone true

  get_position: ->
    $.positions.get_playing_position @detail.sn, @offset

  raise: (call, raise)->
    console.log 'call ' + call + ' raise ' + raise

  check: ->
    console.log 'check'

$ ->
  $("#game .empty_seat").bind 'click', ->
    console.log $(@).data 'sn'

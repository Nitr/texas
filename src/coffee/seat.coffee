class Seat
  constructor: (@detail, @game) ->
    @sn = @detail.sn
    @init_dom()
    return

  init_dom: () ->
    @dom = @get_dom()
    @set_position()
    @dom.data('sn', @sn).appendTo $("#game")

  set_position: (@offset = 0) ->
    @dom.css @get_position()
    return

class EmptySeat extends Seat
  get_dom: ->
    $("#game > .template > .empty_seat").clone true

  get_position: ->
    console.log @detail
    $.positions.get_empty_position @detail.sn, @offset
    
class PlayingSeat extends Seat
  get_dom: ->
    $("#game > .template > .playing_seat").clone true

  get_position: ->
    $.positions.get_playing_position @detail.sn, @offset

$ ->
  $("#game .empty_seat").bind 'click', ->
    console.log $(@).data 'sn'
    return

  return

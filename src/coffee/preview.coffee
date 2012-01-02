GAME_PREVIEW_REF_MAX = 5

class GamePreview
  constructor: (@gid, @dom) ->
    @seats = []
    @ref()

    $(@).everyTime '3s', -> 
      @ref()
    , GAME_PREVIEW_REF_MAX
      
    return

  ref: ->
    $.ws.send($.pp.write({cmd: "SEAT_QUERY", gid: @gid}))

  add: (seat) ->
    player_dom = $('#game_preview > .seat').filter ->
      $(@).data('seat') == seat.sn

    if seat.state == 0
      player_dom.remove()
      @seats[seat.sn] = null
      return
    
    return if player_dom.size() != 0

    player_dom = $($('#game_preview > .template').text()).
      css($.positions.get_preview(seat.sn)).
      data('seat', seat.sn).
      appendTo(@dom)

    @seats[seat.sn] = new Player(seat.pid, player_dom, seat)
    return

  clear: ->
    $(@).stopTime()
    $('#game_preview > .seat').remove()
    return

(($) ->
  $.game_preview = null

  $.pp.reg "SEAT_STATE", (seat) ->
    return unless $.game_preview
    $.game_preview.add seat
    return

  return
)(jQuery)


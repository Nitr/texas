class GamePreview
  constructor: (@gid, @dom) ->
    @seats = []
    $.ws.send($.pp.write({cmd: "SEAT_QUERY", gid: @gid}))
    return

  add: (seat) ->
    return if seat.state == 0

    player_dom = $($('#game_preview > .template').text()).
      css($.get_preview_position(seat.seat)).
      appendTo(@dom)

    @seats[seat.seat] = new Player(seat.pid, player_dom, seat)
    return

  clear: ->
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


class Player
  constructor: (@pid, @dom) ->
    @set_inplay 0
    @set_photo $.rl.img.def_face_0
    @dom.trigger('singin')

    $.ws.send($.pp.write({cmd: "PLAYER_QUERY", id: @pid}))
    $.ws.send($.pp.write({cmd: "PHOTO_QUERY", id: @pid}))

    return

  update_balance: ->
    if @pid == $.player.pid
      $.ws.send($.pp.write({cmd: "BALANCE_QUERY"})) 
    else
      throw 'Error balance for not current login user'

    return
    
  set_nick: (nick) ->
    @nick = nick
    $(@dom).children('.nick').text @nick
    return

  set_inplay: (inplay) ->
    @inplay = inplay
    $(@dom).children('.inplay').text @inplay
    return

  set_balance: (balance) ->
    @balance = balance
    $(@dom).children('.balance').text @balance
    return

  set_photo: (photo) ->
    @photo = photo
    $(@dom).children('.photo').attr 'src', @photo
    return

(($) ->
  $.player = {}
  players = {}

  $.pp.reg "LOGIN", (player) ->
    $.player = new Player(player.id, $('#toolbar > #usr'))
    $.player.update_balance()

    $.cache_player $.player
    return

  $.pp.reg "BALANCE_INFO", (balance) ->
    $.player.set_balance balance.amount
    return

  $.pp.reg 'PLAYER_INFO', (info) ->
    players[info.pid].set_nick info.nick
    players[info.pid].set_inplay info.inplay
    return

  $.pp.reg 'PHOTO_INFO', (info) ->
    players[info.pid].set_photo $.rl.img[info.photo]
    return

  $.cache_player = (player) ->
    players[player.pid] = player
    return

  $.clear_players = ->
    players = {}
    $.cache_player $.player
    return

  return
)(jQuery)

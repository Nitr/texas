class Player
  constructor: (@pid, @dom, @info) ->
    @set_inplay 0
    @set_photo $.rl.img.def_face_0

    $.cache_player(@)

    $.ws.send($.pp.write({cmd: "PLAYER_QUERY", id: @pid})) unless @info
    $.ws.send($.pp.write({cmd: "PHOTO_QUERY", id: @pid}))

    this.set_nick @info.nick if @info
    this.set_inplay @info.inplay if @info

  update_balance: ->
    if @pid == $.player.pid
      $.ws.send($.pp.write({cmd: "BALANCE_QUERY"}))
    else
      throw 'Error balance for not current login user'
    
  set_nick: (nick = @nick) ->
    @nick = nick
    $(@dom).children('.nick').text @nick

  set_inplay: (inplay) ->
    @inplay = inplay
    $(@dom).children('.inplay').text "$#{@inplay}"

  set_balance: (balance) ->
    @balance = balance
    $(@dom).children('.balance').text @balance

  set_photo: (photo) ->
    @photo = photo
    $(@dom).children('.photo').attr 'src', @photo

  set_css: (css) ->
    console.log css
    $(@dom).css css

(($) ->
  $.player = {}
  players = {}

  $.pp.reg "LOGIN", (player) ->
    $.player = new Player player.id, $('#toolbar > #player')
    $.player.update_balance()
    $.player.dom.trigger('singin')

  $.pp.reg "BALANCE_INFO", (balance) ->
    $.player.set_balance balance.amount

  $.pp.reg 'PLAYER_INFO', (info) ->
    players[info.pid].set_nick info.nick

  $.pp.reg 'PHOTO_INFO', (info) ->
    players[info.pid].set_photo $.rl.img[info.photo]

  $.cache_player = (player) ->
    players[player.pid] = player

  $.clear_players = ->
    players = {}
    $.cache_player $.player

  return
)(jQuery)

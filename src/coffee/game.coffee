class Game
  constructor: (@detail, @dom) ->
    @gid = @detail.gid
    return

  add_seat: (@detail) ->
    return

$ ->
  game = null
  game_dom = $('#game')

  game_dom.bind 'switch_game', (event, args)->
    $(@).show()

    switch args.action
      when 'watch' then $.ws.send $.pp.write {cmd: "WATCH"}
      when 'join' then $.ws.send $.pp.write {cmd: "JOIN", seat: 0, buyin: args.buyin}
      else throw 'unknown game action'

    blockUI '#msg_joining'

    $(@).oneTime '3s', ->
      # 游戏需要在3s内结束初始化，否则出错。
      blockUI '#err_network'
      return

  $.pp.reg "GAME_DETAIL", (detail) ->
    game = new Game detail, game_dom
    console.log 'game_detail'
    return

  $.pp.reg "SEAT_DETAIL", (detail) ->
    game.add_seat detail
    console.log 'seat_detail'
    return

  return

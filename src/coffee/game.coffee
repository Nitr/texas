class Game
  constructor: (@gid) ->
    return

$ ->
  game = $('#game')

  game.bind 'switch_game', ->
    console.log 'game_switch'
    $(@).show()
    return
    
  return

(($) ->
  convert = (positions) ->
    result = for x, y of positions
      {
        preview: {left: y.pv[0] + 'px', top: y.pv[1] + 'px'},
        empty_seat: {left: y.es[0] + 'px', top: y.es[1] + 'px'},
        playing_seat: {left: y.ps[0] + 'px', top: y.ps[1] + 'px'},
        bet_start: {left: "#{y.bet[0]}px", top: "#{y.bet[1]}px"},
        bet_end: [y.bet[3], y.bet[2]]
      }
      
  nine_position = [
  #  preview       # empty_seat    # playing_seat
    {pv: [418, 170], es: [448, 363], ps: [435, 350], bet: [471,413,535,314]}
    {pv: [300, 170], es: [263, 363], ps: [233, 350], bet: [268,410,309,303]}
    {pv: [178, 170], es: [116, 275], ps: [117, 230], bet: [150,288,233,208]}
    {pv: [ 78, 125], es: [173,  95], ps: [145,  60], bet: [181,122,300,175]}
    {pv: [108,  15], es: [342,  55], ps: [342,  20], bet: [376,83, 402,162]}
    {pv: [230,   1], es: [559,  55], ps: [565,  20], bet: [604,84, 572,162]}
    {pv: [354,   1], es: [741,  95], ps: [766,  60], bet: [803,129,672,175]}
    {pv: [476,  15], es: [798, 275], ps: [801, 230], bet: [832,290,749,208]}
    {pv: [518, 125], es: [640, 363], ps: [680, 350], bet: [711,408,710,306]}
  ]

  game_position = convert nine_position

  $.positions = {}

  $.extend $.positions, {
    get_preview: (sn) ->
      return game_position[sn - 1].preview

    get_playing: (sn) ->
      return game_position[sn - 1].playing_seat

    get_bet: (sn) ->
      {start: game_position[sn - 1].bet_start, end: game_position[sn - 1].bet_end}

    get_empty: (sn) ->
      return game_position[sn - 1].empty_seat

    get_random: (ps, offset = 20) ->
      return {top: (ps[0] + (Math.floor(Math.random() * 1000)) % (offset * 2) - offset) + 'px', left: (ps[1] + (Math.floor(Math.random() * 1000)) % (offset * 2) - offset) + 'px'}
  }

  return
)(jQuery)

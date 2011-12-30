(($) ->
  css = (left, top) ->
    {left: "#{left}px", top: "#{top}px"}

  convert = (positions) ->
    result = for x, y of positions
      {
        preview: css(y.pv[0], y.pv[1])
        empty_seat: css(y.es[0], y.es[1]),
        playing_seat: css(y.ps[0], y.ps[1]),
        draw: css(y.draw[0], y.draw[1]),
        bet_end: [y.bet[3], y.bet[2]],
        bet_start: css(y.bet[0], y.bet[1]),
        bet_lab: css(y.bet[4], y.bet[5]),
        private_1: css(y.draw[0], y.draw[1]),
        private_2: css(y.draw[0] + 15, y.draw[1])
      }
      
  nine_position = [
    {pv: [518, 125], es: [640, 363], ps: [680, 350], bet: [711,408,710,306,20,-20], draw: [-51,28]}
  #  preview       # empty_seat    # playing_seat
    {pv: [418, 170], es: [448, 363], ps: [435, 350], bet: [471,413,535,314,90,-10], draw: [90,30]}
    {pv: [300, 170], es: [263, 363], ps: [233, 350], bet: [268,410,309,303,65,-20], draw: [90,28]}
    {pv: [178, 170], es: [116, 275], ps: [117, 230], bet: [150,288,233,208,105,5], draw: [90,30]}
    {pv: [ 78, 125], es: [173,  95], ps: [145,  60], bet: [181,122,300,175,145,95], draw: [90,40]}
    {pv: [108,  15], es: [342,  55], ps: [342,  20], bet: [376,83, 402,162,50,125], draw: [90,60]}
    {pv: [230,   1], es: [559,  55], ps: [565,  20], bet: [604,84, 572,162,-5,125], draw: [-52,60]}
    {pv: [354,   1], es: [741,  95], ps: [766,  60], bet: [803,129,672,175,-105,95], draw: [-52,40]}
    {pv: [476,  15], es: [798, 275], ps: [801, 230], bet: [832,290,749,208,-63,5], draw: [-51,30]}
  ]

  current_share_card = null
  game_position = convert nine_position

  format = (ps) ->
    {top: "#{ps[0]}px", left: "#{ps[1]}px"}

  $.positions = {
    size: game_position.length

    offset: 0

    get: (sn) ->
      index =  (sn + $.positions.offset) % game_position.length
      game_position[index]
  }

  get = (sn) ->
    $.positions.get(sn)

  $.extend $.positions, {
    get_preview: (sn) ->
      return get(sn + 1).preview

    get_playing: (sn) ->
      return get(sn).playing_seat

    get_draw: (sn) ->
      return get(sn).draw

    get_bet: (sn) ->
      {start: get(sn).bet_start, end: get(sn).bet_end}

    get_bet_lab: (sn) ->
      return get(sn).bet_lab

    get_empty: (sn) ->
      get(sn).empty_seat

    get_random: (ps, offset = 20) ->
      return {top: (ps[0] + (Math.floor(Math.random() * 1000)) % (offset * 2) - offset) + 'px', left: (ps[1] + (Math.floor(Math.random() * 1000)) % (offset * 2) - offset) + 'px'}
  }

    reset_share: ->
      current_share_card = [200,245]

    get_next_share: ->
      current_share_card = [200,245] if current_share_card is null
      current_share_card = [current_share_card[0], current_share_card[1] + 55]
      format(current_share_card)

    get_private: (sn, card_sn) ->
      return get(sn)["private_#{card_sn}"]

  return
)(jQuery)

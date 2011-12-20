growlUI = (id, opt) ->
  conf = {
    message: $(id).clone(),
    fadeIn: 700
    fadeOut: 700
    timeout: 2000
    showOverlay: false
    centerY: false
    css: GROWLUI
  }

  conf = $.extend(conf, opt) if opt?
  $.blockUI conf

blockUI = (o) ->
  if typeof o is 'string'
    $.blockUI {
      message: $(o).clone()
      centerX: true
      centerY: true
      css: BLOCKUI
    }
  else
    $.blockUI {
      message: $(o)
      centerX: true
      centerY: true
      css: BLOCKUI
    }

  return

unblockUI = ->
  $.unblockUI()
  return

$ ->
  singin_dom = $('#singin')
  singin_form = $('#singin > form')

  player_dom = $('#toolbar > #player')

  $.ajaxSetup ({ cache: false })

  # block ui and first show Connecting...
  blockUI "#msg_connect"

  $(@).oneTime '5s', ->
    blockUI('#err_network') unless $.ws.isConnection()
    return

  on_load = ->
    identity = $.url.get "usr" ? localStorage.getItem "player#identity"
    password = $.url.get "pwd"

    $("#ckb_save").attr 'checked', false if localStorage.getItem("autosave#identity") == "false"

    $('#txt_identity').val identity
    $('#txt_password').val password

    if (not $.isEmpty identity) and (not $.isEmpty password)
      singin_form.trigger 'submit'
    else
      blockUI singin_dom

    return

  on_open = ->
    $(@).stopTime()

    $(document).oneTime '1s', ->
      blockUI '#msg_loading'

      resources = [
        { url: 'css/heads.png', callback: $.rl.handle_heads }
        { url: 'css/poker.png', callback: $.rl.handle_pokers }
        { url: 'css/betting.png', callback: $.rl.handle_bets }
      ]

      sounds = ["bet", "raise", "move", "card", "check", "fold", "turn"]
      resources.push {url: 'css/sound/' + s + '.mp3', key: s} for s in sounds

      $.rl.load resources, on_load

      return

    return

  singin_form.bind "submit", ->
    blockUI '#msg_singin'

    identity = $(@).children("#txt_identity").val()
    password = $(@).children("#txt_password").val()

    $.ws.send $.pp.write {
      cmd: "LOGIN"
      usr: identity
      pass: password
    }

    $(@).oneTime '3s', ->
      blockUI singin_dom

    return false

  singin_form.bind "stop", ->
    $(@).stopTime()
    return

  player_dom.bind 'singin', ->
    singin_form.trigger "stop"
    $('#toolbar > *').show()

    $.unblockUI()

    if $("#ckb_save").attr 'checked'
      localStorage.setItem "player#identity", $('#txt_identity').val()
      localStorage.setItem "autosave#identity", true
    else
      localStorage.setItem "player#identity", ""
      localStorage.setItem "autosave#identity", false

    $('#hall').trigger 'setup'

    return

  $.pp.reg 'ERROR', () ->
    $("#txt_password").val ""
    $("#lab_err_singin").show()
    singin_form.trigger "stop"
    blockUI singin_dom
    return


  $.ws.defaults.host = $.url.get 'host' if $.url.get 'host'
  $.ws.defaults.onmessage = $.pp.onmessage
  $.ws.defaults.onopen = on_open
  $.ws.init()

  return
# vim: fdm=marker

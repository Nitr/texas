$ ->
  $('[type=checkbox]').bind 'click', ->
    checked = $(@).attr('checked')
    $('[type=checkbox]').removeAttr 'checked'
    $(@).attr('checked', '') if checked == 'checked'
    return

  $('#go').bind 'click', ->
    url = 'http://localhost/texas/?host=' + $('#host').val()
    url += '&usr=' + $('#usr').val()
    url += '&pwd=' + $('#pwd').val()

    url += '&auto_join=true' if $('#auto_join').attr('checked') == 'checked'
    url += '&auto_watch=true' if $('#auto_watch').attr('checked') == 'checked'
    
    window.location = url

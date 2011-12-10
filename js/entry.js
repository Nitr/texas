
$(function() {
  $('[type=checkbox]').bind('click', function() {
    var checked;
    checked = $(this).attr('checked');
    $('[type=checkbox]').removeAttr('checked');
    if (checked === 'checked') $(this).attr('checked', '');
  });
  return $('#go').bind('click', function() {
    var url;
    url = 'http://localhost/texas/?host=' + $('#host').val();
    url += '&usr=' + $('#usr').val();
    url += '&pwd=' + $('#pwd').val();
    if ($('#auto_join').attr('checked') === 'checked') url += '&auto_join=true';
    if ($('#auto_watch').attr('checked') === 'checked') url += '&auto_watch=true';
    return window.location = url;
  });
});

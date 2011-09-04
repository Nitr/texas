(function($) {
  $.url = {
    get: function(name) {
      return decodeURI(
        (RegExp(name + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1]
      );
    }
  }
})(jQuery);
  


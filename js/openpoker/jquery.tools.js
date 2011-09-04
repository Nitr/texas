(function($) {
  $.url = {
    get: function(name) {
      var val = decodeURI(
        (RegExp(name + '=' + '(.+?)(&|$)').exec(location.search)||[,undefined])[1]
      );
      return val == "undefined" ? null : val;
    }
  }
})(jQuery);
  


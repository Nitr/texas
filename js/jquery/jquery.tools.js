(function($) {
  $.url = {
    get: function(name) {
      var val = decodeURI(
        (RegExp(name + '=' + '(.+?)(&|$)').exec(location.search)||[,undefined])[1]
      );
      return val == "undefined" ? null : val;
    }
  };

  $.isEmpty = function(str) {
    return str == null || str == undefined || $.trim(str) == "";
  };
})(jQuery);

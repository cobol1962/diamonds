loadedPages.homepage = {
  initialize: function() {
    var app = document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1;
    if (!app) {
      var logged = checkLogin();
      if (!logged) {
        $("#login").attr("nextpage", "homepage");
        $("#login").find(".close").remove();
        $("#login").modal("show");
      }
    }

  }
}

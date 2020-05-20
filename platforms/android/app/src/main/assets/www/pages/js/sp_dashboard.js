loadedPages.sp_dashboard = {
  sp: {},
  initialize: function() {
    $('#bback').hide();
    $('#bhome').hide();
    $('#bclose').hide();
    this.sp = $.parseJSON(localStorage.sp);
    $("[fullname]").html(this.sp.Employee);
    $("#content").css({
      top: 50
    })
    $("#blue").css({
      display: "inline-block"
    })

   if (this.sp.image == "") {
     this.sp.image = "images/profile.png";
     $("[avatar]").attr("src", "images/profile.png");
     localStorage.sp = JSON.stringify(loadedPages.sp_dashboard.sp);
   } else {
     $("[avatar]").attr("src", this.sp.image);
   }
},

}

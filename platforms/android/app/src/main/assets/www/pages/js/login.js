loadedPages.login = {
  salesPersons: {},
  initialize: function() {
    $('#bback').hide();
    $('#bhome').hide();
    $('#bclose').show();
    if (navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry|IEMobile)/) == null) {
      $('#bclose').hide();
    }
    $("#content").css({
      marginTop:60
    })
    setTimeout(function() {
      loadedPages.login.switchTo("sp");
    }, 1000);
    if (true) {
        api.call("getSPData", function(res) {
          loadedPages.login.salesPersons = res;
          localStorage.salespersons = JSON.stringify(res);
          api_csv.call("salespersons", function(res) {
            $("<option value='-1'>Select Sales Person</option>").appendTo($("#spersons"));
             var dt = _.sortBy(res.data, 'Employee');
              $.each(dt, function() {
                var ths = this;
                  if (loadedPages.login.salesPersons[this.EmplID] !== undefined) {
                      var emp = loadedPages.login.salesPersons[this.EmplID];
                      ths.Employee = emp.Employee;
                      ths.AreaID = emp.AreaID;
                      ths.AreaName = emp.AreaName;
                      ths.email = emp.email;
                    }
                    $("<option area='" + ths.AreaID + "' areaname='" + ths.AreaName + "' email='" + ths.email + "' value='" + ths.EmplID + "'>" + ths.Employee + "</option>").appendTo($("#spersons"));
                  })
              }, {}, {})
        }, {}, {});
     } else {
       loadedPages.salesPersons = $.parseJSON(localStorage.salespersons);
     }

    $("#spersons").bind("change", function() {
      if ($("#spersons").find("option:selected").attr("email") != "undefined") {
        $("#email").val($("#spersons").find("option:selected").attr("email"));
      } else {
        $("#email").val("");
      }
    });
    api_csv.call("showrooms", function(res) {
      $("<option value='-1'>Select Showroom</option>").appendTo($("#srooms"));
        $.each(res.data, function() {
          $("<option value='" + this.showroomid + "'>" + this.name + "</option>").appendTo($("#srooms"));
      })
    }, {}, {});

    $( "#spf" ).validate({
      rules: {
        spersons: {
          isSelected: true
        },
        srooms: {
          isSelected: true
        },
        email: {
          required: true,
          email: true
        },
        password: {
          required: true
        }
      },
      submitHandler: function(form) {
        var obj = {
          EmplID: $("#spersons").val(),
          password: $("#password").val()
        }
        api.call("checkSalesPerson", function(res) {
          if (res.status == "fail") {
            if (res.type == "1") {
              loadedPages.login.firstTimeLogin();
              return;
            }
            if (res.type == "2") {
              loadedPages.login.wrongPassword();
              return;
            }
          } else {
            localStorage.sp = JSON.stringify(res.sp);
            localStorage.showRoom = $("#srooms").val();
            localStorage.showRoomName = $("#srooms").find("option:selected").text();
            localStorage.salePersonName = $("#spersons").find("option:selected").text();
            var obj = {
              Employee: $("#spersons").find("option:selected").text(),
              EmplID: $("#spersons").val(),
              password: $("#password").val(),
              email: $("#email").val(),
              AreaID: $("#spersons").find("option:selected").attr("area"),
              AreaName: $("#spersons").find("option:selected").attr("areaname"),
            }
            api.call("updateSalesperson", function(res) {
              checkLogin();
              loadPage(currentPage);
            }, obj, {}, {})

          }
        }, obj, {}, {})

      }

    });
  },
  firstTimeLogin: function(first = true) {
    if (first) {
      var ht = "<span>You are about to login first time in Sales App. Please confirm password.</span><br /><input class='form-control' type='password' id='password1'/>";
    } else {
      var ht = "<span>Passwords does not match. Try again.</span><br /><input class='form-control' type='password' id='password1'/>"
    }
    swal({
      type: "info",
      html: ht,
      showCancelButton: true,
      allowOutsideClick: false,
      allowEscapeKey: false
    }).then((result) => {
      if (result.value) {
        if ($("#password1").val() != $("#password").val()) {
          loadedPages.login.firstTimeLogin(false);
          return;
        } else {
          var obj = {
            EmplID: $("#spersons").val(),
            password: $("#password").val(),
            email: $("#email").val(),
            AreaID: $("#spersons").find("option:selected").attr("area"),
            AreaName: $("#spersons").find("option:selected").attr("areaname"),
            image: "",
            Employee: $("#spersons").find("option:selected").text()

          }
          api.call("registerSalePerson", function(res) {
             if (res.status == "ok") {
               localStorage.sp = JSON.stringify(res.sp);
               localStorage.showRoom = $("#srooms").val();
               localStorage.showRoomName = $("#srooms").find("option:selected").text();
               localStorage.salePersonName = $("#spersons").find("option:selected").text();
               var obj = {
                 Employee: $("#spersons").find("option:selected").text(),
                 EmplID: $("#spersons").val(),
                 password: $("#password").val(),
                 email: $("#email").val(),
                 AreaID: $("#spersons").find("option:selected").attr("area"),
                 AreaName: $("#spersons").find("option:selected").attr("areaname"),
               }
               api.call("updateSalesperson", function(res) {
                 swal({
                   type: "success",
                   text: "You can login now"
                 }).then((result) => {
                    window.location.reload();
                 })

               }, obj, {}, {})

             }
          }, obj, {},{})
        }
      }
    })
  },
  wrongPassword: function() {
    swal({
      type: "error",
      html: "<span>Try again or <a href='javascript:loadedPages.login.recoverPass();'>Reset password</a></span>",
      showCancelButton: false,
      allowOutsideClick: false,
      allowEscapeKey: false
    })
  },
  recoverPass: function() {
    var obj = {
      salepersonid: $("#spersons").val(),
      email: $("#email").val()
    }
    api.call("resetPassword", function(res) {
      if (res.status == "ok") {
        swal({
          type: "success",
          text: "You received mail on mail address you gave on this form. Use new password for login."
        })
      } else {
        swal({
          type: "error",
          text: "Something went wrong."
        })
      }
    }, obj, {}, {})
  },
  switchTo: function(what) {

    $("[loginform]").hide();
    $("#" + what).show();
    if (what == "sp") {
      $("[sp]").removeClass("unactive");
      $("[admin]").addClass("unactive");
    } else {
      $("[sp]").addClass("unactive");
      $("[admin]").removeClass("unactive");
    }
  }
}

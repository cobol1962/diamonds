loadedPages.shoppingCart = {
  firstDraw: true,
  firstDC: true,
  showDiscount: false,
  total: 0,
  fullprice: 0,
  vatexcluded: 0,
  vat: 0,
  administrative: 0,
  vatrefunt: 0,
  topay: 0,
  masterdiscount: 0,
  discountClicked: false,
  dApproved: {},
  locked: [],
  initialize: function() {
    $("#dapproved").typeahead({
      items: "all",
      scrollHeight: 100,
      source: spersons,
      autoSelect: true,
      maxLength: 5,
      afterSelect: function(obj) {
        $("#showDiscount").prop("disabled", false);
        loadedPages.shoppingCart.dApproved = obj;
         $("#dpersonid").val(obj.id);
         $("#dpersonname").val(obj.name);
         localStorage.dapproved = obj.id;
         localstorage.dapprovedname = obj.name;
      }
    });
  //  $('#dapproved').typeahead('val', myVal);
    if (localStorage.isEU === undefined) {
      localStorage.isEU = "0";
    }
     loadedPages.shoppingCart.drawCart();
     if ($("#toggleShoppigCart").hasClass("empty")) {
        $("#fullshoppingcart").hide();
        $("#emptyshoppingcart").show();
      } else {
        $("#fullshoppingcart").show();
        $("#emptyshoppingcart").hide();
      }
      $("#cartToPay").bind("click", function() {

        $("#cartToPay").css({
          backgroundColor: "CED0CF"
        })
      })
      $("#cartToPay").bind("change", function() {
        loadedPages.shoppingCart.recalculateDiscount();
      //  $("#cartToPay").val(parseFloat($("#cartToPay").val()).toLocaleString("nl-NL",{ style: 'currency', currency: "EUR" }));
      })
      $("#cartToPay").bind("blur", function() {

        $(this).css({
          background: "transparent"
        })
      })
  },
  drawCart: function() {

    var totalDiscount = 0;
    api.call("getCountries", function(res) {
      var data = [];
      $.each(res, function() {
        var ths = this;
        var obj = {
          id: ths.CountryID,
          text: ths.Country,
          eu: ths.EUMember,
          nationality: ths.Nationality
        }
        data.push(obj);
      })

      $("#countries").select2({
        data: data,
        placeholder: "Select a customer country origin",
        allowClear: true,
        width: '100%'
      });
      $('#countries').on('select2:clear', function (e) {
        $("#refund")[0].checked = false;
        $("[refundcontainer]").hide();
        delete localStorage.customerCountry;
        loadedPages.shoppingCart.calculateRefund();
      });
      $('#countries').on('select2:select', function (e) {
          var data = e.params.data;
          localStorage.isEU = data.eu;
          localStorage.customerCountry = JSON.stringify(data);
          if (data.eu == "0") {
            $("[refundcontainer]").show();
          } else {
            $("#dRefund").removeClass("refund");
            $("#dRefund").html("VAT refund");
            $("[refundcontainer]").hide();
          }
          loadedPages.shoppingCart.calculateRefund();
      });
      setTimeout(function() {
        if (localStorage.customerCountry !== undefined) {
          var data = $.parseJSON(localStorage.customerCountry);
          $('#countries').val(data.id);
          $('#countries').select2().trigger('change');
          localStorage.isEU = data.eu;
          if (data.eu == "0") {
            $("[refundcontainer]").show();
          //    loadedPages.shoppingCart.checkCode();
          } else {
            $("#dRefund").removeClass("refund");
            $("#dRefund").html("VAT refund");
            $("[refundcontainer]").hide();
          }

          $("#directRefund")[0].checked = (localStorage.directRefundChecked == "1");
          loadedPages.shoppingCart.calculateRefund(localStorage.directRefund == "1");
        }
      });
      $("#refund").bind("change", function() {
       loadedPages.shoppingCart.calculateRefund();
      })
    }, {}, {});
    $("#items").hide();
    $("#items").html("");
    $("#lblCartCount").html(" " + Object.keys(shoppingCartContent).length);
    if (Object.keys(shoppingCartContent).length == 0) {
      $("#toggleShoppigCart").addClass("empty");
      $("#fullshoppingcart").hide();
      $("#emptyshoppingcart").show();
    } else {
      $("#toggleShoppigCart").removeClass("empty");
    }
     loadedPages.shoppingCart.total = 0;
     var ii = 0;
    for (var key in shoppingCartContent) {
       var obj = shoppingCartContent[key];
    //   alert(obj.Discount)
       if (loadedPages.shoppingCart.firstDraw) {
           obj.Discount = ((obj.Discount == "0%") ? "" : (obj.Discount));

       }
       obj.imageURL = obj.imageURL.replace("50px", "100px");
       var html = "<div root style='font-size:14px;'><div serial='" + obj.SerialNo + "' style='border-top:1px solid #e2e2e2;min-height:115px;border-bottom:1px solid #e2e2e2;padding:10px;padding-bottom:20px;width:100%;position:relative;'>";
       html += "<div>" + ((obj.imageURL != "") ? obj.imageURL : "<img style='width:100px;' src='http://85.214.165.56:81/coster/www/images/crown.png' />");
       html += "<br /><span onclick='loadedPages.shoppingCart.removeItem(this);' style='cursor:pointer;margin-left:25px;color:#ADADAD;'>Remove</span></div>";
       html += "<div style='position:absolute;top:10px;left:120px;color:#ADADAD;'>" + obj.SerialNo + "<br />"
       html += "<span productname style='color:black;max-width:300px;'>" + obj.productName.substring(obj.productName.indexOf(" ")) + "</span></div>";
       html += "<div style='position:absolute;top:10px;right:0px;color:black;font-size:13px;'>";
       if (obj.Discount != "") {
          html += "<div style='float:left;'>"
          html += "<span style='color:red;'>";
          html += "<b>" + obj.Discount + "</b>&nbsp;</span><span style='text-decoration:line-through;'>" + (parseFloat(obj.SalesPrice) * 1).toLocaleString("nl-NL",{ style: 'currency', currency: "EUR" }) + "</span></div>";
          if (obj.discountLocked) {
            html += "<br />";
          } else {
            html += "<input id='cart_" + ii + "' spdiscount onchange='loadedPages.shoppingCart.discounts(this);' value='" + obj.Discount + "' type='text' class='form-control' style='display:none;text-align:right;float:right;width:85px;clear:both;' placeholder='Discount' /><br />";
          }
        }
        if (obj.Discount != "" && !obj.discountLocked) {
          if (obj.Discount != "") {
              var sm = parseFloat(obj.SalesPrice);
              if (obj.Discount.indexOf("%") > -1) {
                var prc = parseFloat(obj.Discount.replace("%", ""));
                totalDiscount += prc;
                obj.realPrice = sm - ((sm / 100) * prc);
              } else {
                var prc = parseFloat(obj.Discount);
                totalDiscount += prc;
                obj.realPrice = sm - prc;
              }
            } else {
              obj.realPrice = obj.SalesPrice;
            }
        }
        if (obj.additionalDiscount != "" && obj.discountLocked) {
          if (obj.additionalDiscount != "") {

              var sm = parseFloat(obj.startRealPrice);
              if (obj.additionalDiscount.indexOf("%") > -1) {
                var prc = parseFloat(obj.additionalDiscount.replace("%", ""));
                totalDiscount += prc;
                obj.realPrice = sm - ((sm / 100) * prc);
              } else {
                var prc = parseFloat(obj.additionalDiscount);
                totalDiscount += prc;
                obj.realPrice = sm - prc;
              }

            } else {

              obj.realPrice = obj.startRealPrice;
            }
        }
        loadedPages.shoppingCart.total +=  parseFloat(obj.realPrice);
        loadedPages.shoppingCart.fullprice += parseFloat(obj.SalesPrice);
        if (!obj.discountLocked) {
          html += "<div style='float:right;'><span realvalue='" + parseFloat(obj.realPrice) + "'>" + (parseFloat(obj.realPrice) * 1).toLocaleString("nl-NL",{ style: 'currency', currency: "EUR" }) + "</span></div>";
        } else {
          if (obj.additionalDiscount == "") {
            html += "<div style='float:right;'><span realvalue='" + parseFloat(obj.realPrice) + "'>" + (parseFloat(obj.realPrice) * 1).toLocaleString("nl-NL",{ style: 'currency', currency: "EUR" }) + "</span></div>";
          } else {
            html += "<div style='float:right;'><span style='text-decoration:line-through;' value='" + parseFloat(obj.startRealPrice) + "'>" + (parseFloat(obj.startRealPrice) * 1).toLocaleString("nl-NL",{ style: 'currency', currency: "EUR" }) + "</span></div>";
          }
        }
        if (!obj.discountLocked && obj.Discount == "") {
          html += "<input spdiscount onchange='loadedPages.shoppingCart.discounts(this);' value='" + obj.Discount + "' type='text' class='form-control' style='clear:both;text-align:right;float:right;width:85px;display:none;' placeholder='Discount' /><br />";
        } else {
          if (obj.discountLocked) {
            html += "<input id='cart_" + ii + "' spdiscount onchange='loadedPages.shoppingCart.discounts(this);' value='" + obj.additionalDiscount + "' type='text' class='form-control' style='display:none;text-align:right;float:right;width:85px;clear:both;' placeholder='Discount' /><br />";
            if (obj.additionalDiscount != "") {
                html += "<div style='float:right;'><span  value='" + parseFloat(obj.realPrice) + "'>" + (parseFloat(obj.realPrice) * 1).toLocaleString("nl-NL",{ style: 'currency', currency: "EUR" }) + "</span></div>";
            }
          }
        }
        html += "</div></div></div>";
        $(html).appendTo($("#items"));

     }
     $("#subtotal").parent().next("td").html(parseFloat(loadedPages.shoppingCart.total).toLocaleString("nl-NL",{ style: 'currency', currency: "EUR" }));
      $("#subtotal").attr("realvalue", parseFloat(loadedPages.shoppingCart.total));
     var ttl = 0;
     var grandTotal = parseFloat(loadedPages.shoppingCart.total);
     localStorage.discountAmount = 0;
     if ($("#masterdiscount").val() != "") {
             var sm = loadedPages.shoppingCart.total;
             if ($("#masterdiscount").val().indexOf("%") > -1) {
               var prc = parseFloat($("#masterdiscount").val().replace("%", ""));
               totalDiscount += prc;
               localStorage.discountAmount = ((sm / 100) * prc);
              ttl = sm - ((sm / 100) * prc);
             } else {
               var prc = parseFloat($("#masterdiscount").val());
               totalDiscount += prc;
               localStorage.discountAmount =  prc;
               ttl = sm - prc;
             }
     } else {
       ttl = parseFloat(loadedPages.shoppingCart.total);
     }
     var vex = ttl / 1.21;
     var vat = ttl - vex;
     var achg = (ttl / 100) * 1.35;
     var withcharge = ttl + achg;
     var vatchargeexcl =  withcharge / 1.21;
     var vatcharge = withcharge - vatchargeexcl;

     $("#vatexcluded").parent().next("td").html((parseFloat(vex).toLocaleString("nl-NL",{ style: 'currency', currency: "EUR" })));
     $("#vat").parent().next("td").html((parseFloat(ttl - vex).toLocaleString("nl-NL",{ style: 'currency', currency: "EUR" })));
     $("#admincharge").parent().next("td").html((parseFloat(achg).toLocaleString("nl-NL",{ style: 'currency', currency: "EUR" })));
     $("#withcharge").parent().next("td").html((parseFloat(withcharge).toLocaleString("nl-NL",{ style: 'currency', currency: "EUR" })));
     $("#vatchargeexcl").parent().next("td").html((parseFloat(vex).toLocaleString("nl-NL",{ style: 'currency', currency: "EUR" })));
     $("#vatcharge").parent().next("td").html((parseFloat(vatcharge).toLocaleString("nl-NL",{ style: 'currency', currency: "EUR" })));
     $("#torefund").parent().next("td").html((parseFloat(vat - achg).toLocaleString("nl-NL",{ style: 'currency', currency: "EUR" })));
     $("#total").parent().next("td").html((parseFloat(ttl).toLocaleString("nl-NL",{ style: 'currency', currency: "EUR" })));

     localStorage.vatexcluded = parseFloat(vex);
     localStorage.vat = parseFloat(ttl - vex);
     localStorage.admincharge = parseFloat(achg);
     localStorage.withcharge = parseFloat(withcharge);
     localStorage.vatchargeexcl = parseFloat(vatchargeexcl);
     localStorage.vatcharge = parseFloat(vatcharge);
     localStorage.torefund = parseFloat(vat);
     localStorage.total = parseFloat(ttl);
     localStorage.grandTotal = parseFloat(grandTotal);
     localStorage.invoiceDiscount = $("#masterdiscount").val();
    // localStorage.directRefund = (($("#directRefund")[0].checked) ? "1" : "0");
     localStorage.payNoRefund = parseFloat(vex + vat);
     localStorage.payWithRefund = parseFloat((vatchargeexcl + vatcharge) - vat);
     localStorage.isEU = $('#countries').find(':selected').data('eu');

     $(".norefund").val((parseFloat(vex + vat).toLocaleString("nl-NL",{ style: 'currency', currency: "EUR" })));
     $(".refund").val((parseFloat((vatchargeexcl + vatcharge) - vat).toLocaleString("nl-NL",{ style: 'currency', currency: "EUR" })));
    if (localStorage.directRefund === undefined) {
      localStorage.directRefund = "0";
    }
     if (localStorage.directRefund == "0") {
       $(".norefund").show();
       $(".refund").hide();
     } else {
       $(".norefund").hide();
       $(".refund").show();
     }
     loadedPages.shoppingCart.firstDraw = false;
     if (!loadedPages.shoppingCart.firstDC && totalDiscount > 0 &&  Object.keys(loadedPages.shoppingCart.dApproved).length == 0 && loadedPages.shoppingCart.discountClicked) {
       $("#discountApproved").modal("show");
     }
     $("#items").show();
     if (!loadedPages.shoppingCart.showDiscount) {
       $('[spdiscount]').hide();
       $('[spdiscount1]').hide();
     } else {
       $('[spdiscount]').show();
       $('[spdiscount1]').show();
     }
  },
  checkCode: function() {
    if (!$("#directRefund")[0].checked) {
      loadedPages.shoppingCart.calculateRefund();
      return;
    }
    showModal({
        title: "Please confirm choice. Enter code.",
        content: "<input id='ccode' type='number' class='form-control' /><span style='color:red;display:none;' id='cer'>Wrong code.</span>",
        allowBackdrop: false,
        showClose: false,
        noclose: true,
        cancelCallback: function() {
            $('#mainModal').modal("hide");
        },
        confirmCallback: function() {

          if ($("#ccode").val() == "1071") {
              $("#dRefund").addClass("refund");
              $("[refundcontainer]").show();
              $("#dfw").html("Direct Refund");
              localStorage.directRefund = "1";
              loadedPages.shoppingCart.calculateRefund(true);
              $('#mainModal').modal("hide");
          } else {
            $("#cer").show();
          }

        }
    })

  },
  recalculateDiscount: function() {
    $('#masterdiscount').show();
    var dsc = parseFloat($("#subtotal").attr("realvalue")) - $("#cartToPay").val();
    dsc = dsc.toFixed(2);
    $("#masterdiscount").val(dsc);
    $("#masterdiscount").trigger("change");
  },
  removeItem: function(obj) {
    showModal({
      title: "Are you sure to remove item " + $(obj).closest("[serial]").attr("serial") + " " + $(obj).closest("[root]").find("[productname]").html() + " from cart?",
      cancelButtonText: "Cancel",
      confirmButtonText: "Delete",
      confirmCallback: function() {
        delete shoppingCartContent[$(obj).closest("[serial]").attr("serial")];
        loadedPages.shoppingCart.drawCart();
      }
    })

  },
  discounts: function(obj) {
    var id = $(obj).closest("[serial]").attr("serial");
    if (!shoppingCartContent[id].discountLocked) {
      shoppingCartContent[id].Discount = obj.value;
    } else {
      shoppingCartContent[id].additionalDiscount = obj.value;
    }
    loadedPages.shoppingCart.firstDC = false;
    loadedPages.shoppingCart.drawCart();
  },
    calculateRefund: function(showpay = false) {
      localStorage.directRefundChecked = $("#directRefund")[0].checked ? "1" : "0";
      if ($("#directRefund")[0].checked) {

        $("[refund]").show();
        $("[norefund]").hide();
        if (showpay) {
          $("#dfw").html("Direct Refund");
          $(".refund").show();
          $(".norefund").hide();

        }
      } else {
        $("#dfw").html("VAT Refund");
        $(".refund").hide();
        $(".norefund").show();
        $("[refund]").hide();
        $("[norefund]").show();
      }
    //  loadedPages.shoppingCart.drawCart();
  },
  checkIsLogged: function() {

    if (localStorage.sp === undefined) {
      $("#login").modal("show");
    } else {
      localStorage.invoiceDiscount = $("#masterdiscount").val();
      localStorage.directRefund = (($("#dfw").html() == "Direct Refund") ? "1" : "0");
      localStorage.total_div = $("#total_div")[0].innerHTML;
      $("[spdiscount1]").val($("#masterdiscount").val());
      if (localStorage.directRefund == "1") {
        localStorage.toBePaid = $("[rfnd]").val();
      } else {
        localStorage.toBePaid = $("[nrfnd]").val();
      }

      loadPage("checkout");
    }
  },
  discountClickedFired: function() {
    loadedPages.shoppingCart.discountClicked = !loadedPages.shoppingCart.discountClicked;
    loadedPages.shoppingCart.showDiscount = loadedPages.shoppingCart.discountClicked;
    //alert(  loadedPages.shoppingCart.showDiscount)
    if (!loadedPages.shoppingCart.discountClicked) {
      for (var key in shoppingCartContent) {
         var obj = shoppingCartContent[key];
         obj.additionalDiscount = "";
         obj.realPrice = obj.startRealPrice;
      }
      $("#masterdiscount").val("");
      $('#masterdiscount').hide();
      $('[spdiscount]').val("");
      $('[spdiscount]').trigger("change");
      $('[spdiscount]').hide();
      $('[spdiscount1]').hide();
    } else {

      $('#masterdiscount').show();
      $('[spdiscount]').show();
      $('[spdiscount1]').show();
    }

  //  loadedPages.shoppingCart.drawCart();
  }
}

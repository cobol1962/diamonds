var loadedPages = {};
var in_barcode_scan = false;
var translation = {};
var pages = [];
var vatRefund = false;
var currentPage = "";
var loadedSalesPersons = {};
var adminChargeID = "";
var invoiceID = "";
var vatRefundID = "";
var shoppingCartContent = {};
var payments = {};
var customerInfoData = {};
var firstLoad = true;
var spersons = [];
var firstCatalog = true;
var firstDiamond = true;
var optionsLoader = {
  image: "/images/diamond.gif",
  imageAnimation: false
}
function resetLocalStorage() {
  for (var  key in localStorage) {
    if (key != "sp" && key != "tour" && key != "showRoom" && key != "showRoomName") {
      delete localStorage[key];
    }
  }
  shoppingCartContent = [];
  payments = [];
  $("#toggleShoppigCart").addClass("empty");

}
function checkLogin() {

    if (localStorage.sp !== undefined) {
        $("[login]").hide();
        $("[logout]").show();
        var sp = $.parseJSON(localStorage.sp);
        $("#ename").html(sp.Employee);
        $("[profile]").show();
        return true;
    } else {
        $("[login]").show();
        $("[logout]").hide();
        $("[profile]").hide();
        var app = document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1;

        if (!app && currentPage != "homepage") {
          loadPage("homepage");
        } else {
          $("#login").attr("nextpage", "homepage");
          $("#login").find(".close").remove();
          $("#login").modal("show");
        }
        return false;
    }
}
$(document).ready(function() {
  
  $(".app").hide();
  $("#content").css({
    minHeight: $(window).height(),
    height: $(window).height(),
    maxHeight: $(window).height()
  })
  document.getElementById("search").addEventListener("keyup", function(event) {
  // Number 13 is the "Enter" key on the keyboard
  if (event.keyCode === 13) {
    // Cancel the default action, if needed
    event.preventDefault();

    doSearch();
  }
});


$.each($(".modal-content"), function() {
    $('<button type="button" class="close" style="position:absolute;top:10px;right:15px;" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">X</span></button>').appendTo($(this));
});
$('#discountApproved').modal({
  backdrop: 'static',
  keyboard: false
})
$('#discountApproved').modal("hide");
$('#discountApproved').on('show.bs.modal', function () {

  $('#discountApproved').find(".close").remove();

})
  for (var  key in localStorage) {
    if (key != "sp" && key != "tour" && key != "showRoom" && key != "showRoomName") {
      delete localStorage[key];
    }
  }
/*  $(".app").hide();
  alert(window.location.hash)
  loadPage(window.location.hash.substring(1));*/
  if (window.location.hash != "") {
      window.location.hash = "";
    } else {
      loadPage("homepage");
    }
  $("[login]").bind("click", function(e) {

    if (e.target.nodeName != "SPAN") {
      e.preventDefault();
      e.stopPropagation();
    } else {

    }

  })
  $("[currency_select]").bind("click", function(e) {

    if (e.target.nodeName != "SELECT") {
      e.preventDefault();
      e.stopPropagation();
    } else {

    }

  })

  api.call("getExcangeRates", function(res) {
    $.each(res, function() {
      $("<option value='" + this.CurrencyCode + "' rate='" + this.ExchangeRate + "'>" + this.Currency + "</option>").appendTo($("#currency"));
    })
    $("#currency").select2();
    $('#currency').on('select2:select', function (e) {
        var data = e.params.data;

        $("#currency").hide();

        try {
          loadedPages.invoice.triggerCurrencyChange();
        } catch (err) {

        }
        try {
          loadedPages.diamonds.triggerCurrencyChange();
        } catch (err) {

        }
        $("#ccurenncy").html($("#currency").val());
        try {
          recalculateInvoice();
        } catch(err) {

        }
    });
  }, {}, {})


 $("#paymentsModal").on('show.bs.modal', function(e){
   setTimeout(function() {
        goToNext();
    } , 1000);
  });



  window.setTimeout(function () {
    $("body").show(500);
  }, 1);
  var td = [];
  api.call("getSalespersons", function(res) {
    spersons = [];
    td = [];
    $.each(res.data, function() {
      td.push({

        id: this.EmplID,
        name: this.Employee
      })
      spersons.push({

        id: this.EmplID,
        name: this.Employee
      })
    })
    $("#spersons").typeahead({
      items: "all",
      scrollHeight: 100,
      source: td,
      autoSelect: true,
      maxLength: 5,
      afterSelect: function(obj) {
         $("#salepersonid").val(obj.id);
         $("#salepersonname").val(obj.name);
      }
    });
  }, {}, {})
  api.call("getShowRooms", function(res) {
    var td1 = [];
    $.each(res.data, function() {
      td1.push({
        id: this.showroomid,
        name: this.name
      })
    })

    $("#srooms").typeahead({
      scrollHeight: 100,
      items: "all",
      source: td1,
      autoSelect: true,
      afterSelect: function(obj) {
        $("#showroomid").val(obj.id);
        $("#showroomname").val(obj.name);
      }
    });

  }, {}, {})


  $.validator.addMethod("isSelected", function(value, element) {
  // allow any non-whitespace characters as the host part
    return (element.value != "-1");
  }, "This field is mandatory");

  document.addEventListener("backbutton", onBackKeyDown, false);

    $("[name='vatsettings']").bind("change", function() {

      if ($("#choice1").prop("checked")) {
        $("#vatstatus").html("EU citizen no VAT refund")
        $("#vatstatus").attr("mode","novatrefund");
      }
      if ($("#choice2").prop("checked")) {
        $("#vatstatus").html("We will provide to you form for 21% VAT refund");
        $("#vatstatus").attr("mode","vatrefund");
      }
      if ($("#choice3").prop("checked")) {
        $("#vatstatus").html("We will provide to you payable cheque with 21% VAT refund and take 1,35% administrative charge")
        $("#vatstatus").attr("mode","directrefund");
      }
      recalculateInvoice();
    })
    $.ajax({
        dataType: "json",
        url: "translations/translation_" + "gb" + ".json",
        type: "GET",
        async: false,
        success: function(res) {

            translation = res;
        }
      });

})
var pageUrls = {
  invoice: "catalog",
  diamonds: "diamonds",
  shoppingCart: "shoppingcart",
  checkout: "ckeckout",
  homepage: "home",
  tours: "tours",
  myinvoices: "invoices",
  mycustomers: "customers"
}
function locationHashChanged() {
  if (location.hash == "") {
    loadPage("homepage");
  }
  if (firstLoad) {
    firstLoad = false;
    loadPage1("homepage");
    return;
  }
  var p = location.hash.substring(1);

  for (var k in pageUrls) {
    if (pageUrls[k] == p) {
      if (fromFunc) {
        loadPage1(po.page, po.addTopages, po.backtocart, po.search);


      } else {
        loadPage1(k);
      }
      fromFunc = false;
      return;
    }
  }
}
var po = {};
var fromFunc = false;
window.onhashchange = locationHashChanged;
function loadPage(page, addToPages = true, backtocart = false, search = {}) {
//  window.parent.postMessage("setState#" + page, "*");
//  window.history.replaceState({}, pageUrls[page], pageUrls[page]);
    po.page = page;
    po.addTopages = addToPages;
    po.backtocart = backtocart;
    po.search = search;
    fromFunc = true;
    window.location.hash = pageUrls[page];
}
function loadPage1(page, addToPages = true, backtocart = false, search = {}) {
  if (!firstLoad && page != "homepage") {
    $("body").LoadingOverlay("show", optionsLoader);
  } else {


  }
  if (addToPages) {
    pages.push(page);
  }
  if (page != "login") {
    currentPage = page;
  }
  $("#content").css({
    top: 50
  })
  $("#content").html("");
  $('#bback').show();
  $('#bhome').show();
  $('#bclose').hide();
  if (navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry|IEMobile)/) == null) {
    $('#bclose').hide();
  }
  for (var key in loadedPages) {
    delete loadedPages[key];
  }
  $("#tn").find("li").removeClass("active");
  $("[" + page + "]").addClass("active");
  $('.navbar-collapse').collapse('hide');
  $.ajax({
    url: "pages/html/" + page + ".html",
    type: "GET",
    success: function(res) {
      $("#content").html(res);
      try {

          $.getScript("pages/js/" + page + ".js", function() {
            if (page == "invoice" || page == "diamonds") {
              loadedPages[page].initialize(search);
            } else {
              loadedPages[page].initialize(backtocart);
            }
             setTimeout(function() {
               if (page != "invoice" && page != "diamonds") {
                 $("body").LoadingOverlay("hide");
               }
             }, 1500)
          });

      } catch(err) {

      }
    }
  })
}
function closeApp() {
  if (navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry|IEMobile)/) != null) {
    swal({
      type: "question",
      text: 'Are you sure you wish to exit app?',
      showCancelButton: true,
      showCloseButton: true
    }).then((result) => {
      if (result.value) {
        navigator.app.exitApp();
      }
    })
  } else {
    return false;
  }
}
function goHome() {
  pages = [pages[0], pages[1]];
  loadPage(pages[pages.length -1], false);
}
function backPage() {
  pages = pages.slice(0, -1);
  loadPage(pages[pages.length -1], false);
}
function logout() {
  $("#blue").css({
    display: "none"
  })
  localStorage.clear();
  loadPage("login");
}
function onBackKeyDown() {

  return false;
   if (in_barcode_scan) {
     in_barcode_scan = false;
     return false;
    }
}
function textToBase64Barcode(text){
  var canvas = document.createElement("canvas");
  JsBarcode(canvas, text, {
    format: "CODE128",
    height:20,
    fontSize: 13
  });
  return canvas.toDataURL("image/png");
}
function toDataURL(url, callback) {
  var xhr = new XMLHttpRequest();
  xhr.onload = function() {
    var reader = new FileReader();
    reader.onloadend = function() {
      callback(reader.result);
    }
    reader.readAsDataURL(xhr.response);
  };
  xhr.open('GET', url);
  xhr.responseType = 'blob';
  xhr.send();
}
function addToInvoice(row) {

  if (shoppingCartContent[row["SerialNo"]] !== undefined) {
    showModal({
      title: "Item with serail " + row["SerialNo"] + " already in cart.",
      confirmButtonText: "CONTINUE",
      showCancelButton: false
    })
    return;
  }
  //alert(row["Discount"])
  if (row["Discount"] == "0") {
    row["Discount"] = "0%";
  }
  if (row["Discount"] == "0%") {
    var realPrice = row["SalesPrice"];
    row["discountLocked"] = false;
  } else {
    var pr = parseFloat(row["SalesPrice"]);
    var ds = parseFloat(row["Discount"]);
    var realPrice = pr - ((pr / 100) * ds);
    row["discountLocked"] = true;
  }
  row["additionalDiscount"] = "";
  row["startRealPrice"] = realPrice;
  row["realPrice"] = realPrice;
  shoppingCartContent[row["SerialNo"]] = row;
  console.log(shoppingCartContent);
  $("#lblCartCount").html(" " + Object.keys(shoppingCartContent).length);
  $("#toggleShoppigCart").removeClass("empty");

  /*if ($("#invoiceBody").find("[serialno='" + row.SerialNo + "']").length > 0) {
    swal({
      type: "error",
      text: "Items with Serial No " + row.SerialNo + " already in Bag"
    })
    return false;
  }
  var exr = $("#currency").find("option:selected").attr("rate");

  var tr = "<tr serialno='" + row.SerialNo + "' productdata><td style='padding: 5px;'>" + row["imageURL"] + "</td>";
  tr += "<td colspan='3'>";
  tr += "<p style='max-width:100%;word-break:break-word;'>" + row["productName"] + "</p></td></tr>";
  tr += "<tr invoicedata>";
  tr += "<td style='text-align: right;' euro='" + row["SalesPrice"] + "' value='" + row["SalesPrice"] + "' price>" + (parseFloat(row["SalesPrice"]) * 1).toLocaleString('nl-NL', { style: 'currency', currency:  "EUR"  }) + "</td>";
  tr += "<td style='text-align: right;padding-right:3px;'><input discount style='width:50px;text-align:right;' value='" + row["Discount"] + "%' type='text' onchange='recalculateInvoice(this);' /></td>";
  tr += "<td style='text-align: right;' total realvalue='" + parseFloat(row["SalesPrice"]) + "'>" + parseFloat(row["SalesPrice"]).toLocaleString('nl-NL', { style: 'currency', currency: "EUR" }) + "</td>";
  tr += "<td style='width:30px;text-align:right;' onclick='deleteRow(this);'><div style='max-width:30px;'><a href='#'><i class='fa fa-trash fa-2x m-r-5'></i></a></div></td></tr>";
  $(tr).appendTo($("#invoiceBody"));
  recalculateInvoice();
*/
}
function recalculateInvoice(obj) {
  var invoicetotal = 0;
  var total = 0;
  $.each($("#invoiceBody").find("tbody").find("tr[invoicedata]"), function() {
    var qty = 1;
   var thenum = $(this).find("[price]").attr("euro").replace( /^\D+/g, '');
   var n = thenum.replace(/\,/g, "");
   var exr = parseFloat($("#currency").find("option:selected").attr("rate"));
    var price = parseFloat(n) * exr;
    $(this).find("[price]").html(price.toLocaleString('nl-NL', { style: 'currency', currency: $("#currency").val() }));
    var tdisc = 0;
    var pdisc = 0;
    if ($(this).find("[discount]").val() != "") {
      if ($(this).find("[discount]").val().indexOf("%") > -1) {
        pdisc = parseFloat($(this).find("[discount]").val().replace("%", ""));
     } else {
        tdisc = parseFloat($(this).find("[discount]").val());
      }
    }
    var total = qty * price;
    if (tdisc > 0) {
      total = total - tdisc;
    }
    if (pdisc > 0) {
      total = total - ((total / 100) * pdisc);
    }
    invoicetotal += total;
    $(this).find("[total]").html(total.toLocaleString('nl-NL', { style: 'currency', currency: $("#currency").val()  }));
    $(this).find("[total]").attr("realvalue", total);
  })

  $("[invoicetotal]").html(invoicetotal.toLocaleString('nl-NL', { style: 'currency', currency: $("#currency").val()  }));
  tdisc = 0;
  pdisc = 0;
  if ($("#invoicediscount").val() != "") {
    if ($("#invoicediscount").val().indexOf("%") > -1) {
      pdisc = parseFloat($("#invoicediscount").val().replace("%", ""));
   } else {
      tdisc = parseFloat($("#invoicediscount").val());
    }
  }
  var idue = invoicetotal;
  if (tdisc > 0) {
    idue = invoicetotal - tdisc;
  }
  if (pdisc > 0) {
    idue = invoicetotal - ((invoicetotal / 100) * pdisc);
  }

  var ff = 0;
  var rfnd = (idue / 100) * (2100 / 121);
  var vatc = (idue / 100) * (2100 / 121);;
  if ($("#vatstatus").attr("mode") != "directrefund") {
    $("[withoutvat]").closest("tr").show();
    $("[vat]").closest("tr").show();
    $("[vatrefund]").closest("tr").hide();
    $("[admincharge]").closest("tr").hide();
    $("[vatrefund]").attr("realvalue","0");
    $("[vatrefund]").html(ff.toLocaleString('nl-NL', { style: 'currency', currency: $("#currency").val()}));
    $("[admincharge]").attr("realvalue",0);
    $("[admincharge]").html(ff.toLocaleString('nl-NL', { style: 'currency', currency: $("#currency").val()}));
    $("[invoicetotal]").attr("realvalue",idue);
    $("[invoicetotal]").html(idue.toLocaleString('nl-NL', { style: 'currency', currency: $("#currency").val()}));
    $("[withoutvat]").attr("realvalue", rfnd);
    $("[withoutvat]").html((idue - rfnd).toLocaleString('nl-NL', { style: 'currency', currency:$("#currency").val() }));
    $("[vat]").attr("realvalue", rfnd);
    $("[vat]").html(rfnd.toLocaleString('nl-NL', { style: 'currency', currency:$("#currency").val() }));
  } else {

    $("[withoutvat]").closest("tr").hide();
    $("[vatrefund]").closest("tr").show();
    $("[vat]").closest("tr").show();
    $("[admincharge]").closest("tr").show();

    $("[invoicetotal]").attr("realvalue",idue);
    $("[invoicetotal]").html(idue.toLocaleString('nl-NL', { style: 'currency', currency: $("#currency").val()}));
    $("[withoutvat]").attr("realvalue", rfnd);
    $("[withoutvat]").html((idue - rfnd).toLocaleString('nl-NL', { style: 'currency', currency:$("#currency").val() }));
    var achrg = (idue / 100) * 1.35;
    var rfnd = (idue / 100) * (2100 / 121);
    var vatc = ((idue + achrg) / 100) * (2100 / 121);

    idue = idue + achrg - rfnd;
    $("[admincharge]").attr("realvalue", achrg);
    $("[admincharge]").html(achrg.toLocaleString('nl-NL', { style: 'currency', currency:$("#currency").val() }));
    $("[vat]").attr("realvalue", vatc);
    $("[vat]").html(vatc.toLocaleString('nl-NL', { style: 'currency', currency:$("#currency").val() }));
    $("[vatrefund]").attr("realvalue", rfnd);
    $("[vatrefund]").html(rfnd.toLocaleString('nl-NL', { style: 'currency', currency:$("#currency").val() }));
  }

  var t = (idue.toLocaleString('nl-NL', { style: 'currency', currency: $("#currency").val()  }));
  $("[invoicedue]").attr("realvalue", idue);
  $("[invoicedue]").html(idue.toLocaleString('nl-NL', { style: 'currency', currency:$("#currency").val() }));

  var wwv = idue - rfnd;
  $("[withoutvat]").attr("realvalue", idue);
  $("[withoutvat]").html(wwv.toLocaleString('nl-NL', { style: 'currency', currency:$("#currency").val() }));

  $("[vat]").attr("realvalue", vatc);
  $("[vat]").html(vatc.toLocaleString('nl-NL', { style: 'currency', currency:$("#currency").val() }));

  $("#paymentsTable").find("tbody").find("tr").eq(1).find("input").attr("realvalue", idue)
  $("#paymentsTable").find("tbody").find("tr").eq(1).find("input").eq(0).val(t);
}
function deleteRow(obj) {
  var tr = $(obj).closest("tr");
  swal({
    type: "question",
    html: tr.parent().find("[productdata]").find("td").eq(0).html() + "<br /><span>Remove </span>" + tr.parent().find("[productdata]").find("td").eq(1).html() + " <span>from invoice?</span>",

    showCancelButton: true,
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: true,
    showCloseButton: true
  }).then((result) => {
    if (result.value) {
      tr.prev("[productdata]").remove();
      tr.remove();

      if ($("[invoicedata]").length == 0) {
        $("#toggleShoppigCart").addClass("empty");
      } else {
        $("#lblCartCount").html(" " + $("[invoicedata]").length + " ");
      }
      recalculateInvoice();
    }
  })

}
var currentScanned = {};
function scan() {
  in_barcode_scan = true;
  var app = document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1;
  if (!app) {
    getSerial(false, true);
    return;
  }
  cordova.plugins.barcodeScanner.scan(
    function (result) {

        if (result.cancelled) {
          getSerial();
        }
        var obj = {
          SerialNo: result.text
        }
        if ($("#invoiceBody").find("[serialno='" + result.text + "']").length > 0) {
          swal({
            type: "error",
            text: "Items with Serial No " + result.text + " already in Bag",
            showCloseButton: true
          })
          return false;
        }
        api.call("getScannedProduct", function(res) {
          if (res[0] == undefined) {
            swal({
              type: 'error',
              text: "No product with this serial.",
              showCloseButton: true
            })
          } else {
            if (res[0].imageURL != "") {
          }
          if (res[0].imageURL != "") {
            var img = $("<img src='http://85.214.165.56:81/catalog/images/" + res[0].imageURL + "' style='width:100px;' />");
          }
            var exr = $("#currency").find("option:selected").attr("rate");
            html = ((res[0].imageURL != "") ? img[0].outerHTML : "<img style='width:150px;' src='http://85.214.165.56:81/coster/www/images/crown.png' />");

            html += "<div style='position:absolute;top:10px;left:170px;color:#ADADAD;'>" + res[0].SerialNo + "<br />"
            html += "<span style='color:black;font-size:17px;'><b>" + res[0].SerialName + "</b></span></div>";

            html += "<div style='position:absolute;bottom:10px;left:170px;color:black;font-size:17px;'>";
            if (res[0].Discount > 0) {
              html += "<div style='float:left;'><span style='color:red;'><b>" + res[0].Discount + "% </b></span><span style='text-decoration:line-through;'>" + (parseFloat(res[0].SalesPrice) * 1).toLocaleString("nl-NL",{ style: 'currency', currency: "EUR" }) + "</span></div></br />";
            }
            html += "<div style='float:left;'><span>" + (parseFloat(res[0].realPrice) * 1).toLocaleString("nl-NL",{ style: 'currency', currency: "EUR" }) + "</span></div>";
            html += "</div>";
            $("#asc_body").html("");
             $(html).appendTo($("#asc_body"));
             currentScanned = {
               imageURL: ((res[0].imageURL != "") ? img[0].outerHTML : ""),
               SerialNo: res[0].SerialNo,
               productName:  res[0].SerialName,
               SalesPrice: res[0]["SalesPrice"],
               Discount: res[0]["Discount"],
               realPrice: res[0].realPrice
             }
             $("#afterScan").modal("show");
             return;
         }
        }, obj, {})
    },
    function (error) {
      getSerial();
    },
    {
        preferFrontCamera : false, // iOS and Android
        showFlipCameraButton : true, // iOS and Android
        showTorchButton : true, // iOS and Android
        torchOn: true, // Android, launch with the torch switched on (if available)
        saveHistory: true, // Android, save scan history (default false)
        prompt : "Place a barcode inside the scan area", // Android
        resultDisplayDuration: 500, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
        formats : "", // default: all but PDF_417 and RSS_EXPANDED
        orientation : "portrait", // Android only (portrait|landscape), default unset so it rotates with the device
        disableAnimations : true, // iOS
        disableSuccessBeep: false // iOS and Android
    }
 )
}
function getSerial(search = false, notavailable = false) {
  swal({
    type: "error",
    title: (!notavailable) ? "Scan Failed" : "Scanner not available",
    html: "<span style='font-size: 17px;'>Please enter the serial ID bellow</span><br /><input class='form-control' id='eesc' type='text' />",
    showCancelButton: true,
    showCancelButton: false,
    confirmButtonText: "SEARCH",
    showCloseButton: true
  }).then((result) => {
    if (result.value) {
        var obj = {
          SerialNo:$("#eesc").val()
        }
        api.call("getScannedProduct", function(res) {
          if (res[0] == undefined) {
            swal({
              type: 'error',
              text: "No product with this serial.",
              showCloseButton: true
            })
          } else {
            if (res[0].imageURL != "") {
              var img = $("<img src='http://85.214.165.56:81/catalog/images/" + res[0].imageURL + "' style='width:100px;' />");
            }

            var exr = $("#currency").find("option:selected").attr("rate");
            html = ((res[0].imageURL != null) ?img[0].outerHTML : "<img style='width:150px;' src='http://85.214.165.56:81/coster/www/images/crown.png' />");
            html += "<div style='position:absolute;top:10px;left:170px;color:#ADADAD;'>" + res[0].SerialNo + "<br />"
            html += "<span style='color:black;font-size:17px;'><b>" + res[0].SerialName + "</b></span></div>";

            html += "<div style='position:absolute;bottom:10px;left:170px;color:black;font-size:17px;'>";
            if (res[0].Discount > 0) {
              html += "<div style='float:left;'><span style='color:red;'><b>" + res[0].Discount + "% </b></span><span style='text-decoration:line-through;'>" + (parseFloat(res[0].SalesPrice) * 1).toLocaleString("nl-NL",{ style: 'currency', currency: "EUR" }) + "</span></div></br />";
            }
            html += "<div style='float:left;'><span>" + (parseFloat(res[0].realPrice) * 1).toLocaleString("nl-NL",{ style: 'currency', currency: "EUR" }) + "</span></div>";
            html += "</div>";
            $("#asc_body").html("");
             $(html).appendTo($("#asc_body"));
             currentScanned = {
               imageURL: ((res[0].imageURL != "") ? img[0].outerHTML : ""),
               SerialNo: res[0].SerialNo,
               productName:  res[0].SerialName,
               SalesPrice: res[0]["SalesPrice"],
               Discount: res[0]["Discount"],
               realPrice: res[0].realPrice
             }
             $("#afterScan").modal("show");
             return;


        }
        }, obj, {})
      }
    });

}
function checkSteps() {
  if ($("[invoicedata]").length == 0) {
    swal({
      type: "warning",
      text: "No items in invoice.",
      showCloseButton: true
    })
    return false;
  }
  if (localStorage.sp === undefined) {
    swal({
      type: "warning",
      text: "You must log in to proceed checkout",
      showCloseButton: true
    }).then((result) => {
      swal.close();
      $("#login").modal("show");

    })
    return false;
  }
  if (localStorage.tour === undefined) {
    swal({
      type: "warning",
      text: "Select tour",
      showCloseButton: true
    }).then((result) => {
      swal.close();
     loadPage("tours");

    })

  }

}



function prepareLogin() {

}
$( "#spf" ).validate({
  rules: {
    spersons: {
      required: true
    },
    srooms: {
      required: true
    },
    pin: {
      required: true
    }
  },
  submitHandler: function(form) {

    var obj = {
      EmplID: $("#salepersonid").val(),
      pin: $("#pin").val()
    }
    api.call("checkSalesPerson", function(res) {

      if (res.status == "fail") {
        if (res.type == "1") {
    //      loadedPages.login.firstTimeLogin();
          return;
        }
        if (res.type == "2") {
          $("#login").modal("hide");
          showModal({
              type: "error",
              title: "<span>Invalid PIN code. Try again</span>",
              showCancelButton: false,
              showClose: false,
              allowBackdrop: false,
              confirmButtonText: "TRY AGAIN",
              confirmCallback: function() {
                $("#login").modal("show");
              }
          })
          return;
        }
      } else {
        localStorage.sp = JSON.stringify(res.sp);

        localStorage.showRoom = $("#showroomid").val();
        localStorage.showRoomName =$("#showroomname").val();

        localStorage.salePersonName = $("#salespersonname").val();
        showModal({
          type: "ok",
          title: "Looking good " + res.sp.Employee,
          allowBackdrop: false,
          showCancelButton: false,
          showClose: false,
          confirmCallback: function() {
            if ($("#login")[0].hasAttribute("nextpage")) {
              loadPage($("#login").attr("nextpage"));
            }
          },
          confirmButtonText: "CONTINUE"
        })

        $("#login").modal("hide");
        $("[login]").hide();
        $("#ename").html(res.sp.Employee);
        $("[logout]").show();
      }
    }, obj, {}, {})

  }

});
function login() {

/*  if (true) {
      api.call("getSPData", function(res) {
        loadedSalesPersons = res;
        localStorage.salespersons = JSON.stringify(res);
        api_csv.call("salespersons", function(res) {
          alert(JSON.stringify(res))
          $("<option value='-1'>Select Sales Person</option>").appendTo($("#spersons"));
           var dt = _.sortBy(res.data, 'Employee');
            $.each(dt, function() {
              var ths = this;
                if (loadedSalesPersons[this.EmplID] !== undefined) {
                    var emp = loadedSalesPersons[this.EmplID];
                    ths.Employee = emp.Employee;
                    ths.AreaID = emp.AreaID;
                    ths.AreaName = emp.AreaName;
                    ths.email = emp.email;
                  }
                  $("<option area='" + ths.AreaID + "' areaname='" + ths.AreaName + "' email='" + ths.email + "' value='" + ths.EmplID + "'>" + ths.Employee + "</option>").appendTo($("#spersons"));
                })
            }, {}, {})
      }, {}, {});
   }*/




}
function wrongPassword() {
  $("#login").modal("hide");

}

var documentName = "";
function mail() {

  swal({
    type: "info",
    text: "Sending mail",
    showCancelButton: false,
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: false
  })
 if (invoiceID == "") {
   var nm = "invoice_" + (new Date()).getTime();
   documentName = nm;
 } else {
   var nm = documentName;
 }

if (invoiceID == "") {

      var obj = {
        customerid: $("#customerid").val(),
        showroom: localStorage.showRoomName,
        tourNo:  $.parseJSON(localStorage.tour)["ProjId"],
        total:  localStorage.total,
        salesPerson: $.parseJSON(localStorage.sp)["Employee"],
        salePersonId: $.parseJSON(localStorage.sp)["EmplID"],
        discount: localStorage.invoiceDiscount,
        dueAmount: localStorage.payNoRefund,
        pdf:  nm + "_" + "gb" + ".pdf",
        documentName :  nm,
        documentLanguages: "gb",
        showroomid: $("#srooms").val(),
        tourNo: $.parseJSON(localStorage.tour)["ProjId"]
      }
      documentName = nm;
    } else {

      var obj = {
        invoiceid: invoiceID,
        language: "gb",
        showroom: localStorage.showRoomName,
        showroomid: $("#srooms").val(),
        tourNo:  $.parseJSON(localStorage.tour)["ProjId"],
        total: $("[invoicetotal]").attr("realvalue"),
        discount: $("#invoicediscount").val(),
        dueAmount: $("[invoicedue]").attr("realvalue"),
        salesPerson: localStorage.salePersonName,
        salePersonId:localStorage.salespersonid,
      }
    }
  api.call(((invoiceID == "") ? "insertInvoice" : "updateInvoiceDocuments"), function(res) {

    if (invoiceID == "") {
      invoiceID = res.invoiceid;
    }
  toDataURL('images/logo.png', function(dataUrl) {

    var bc = textToBase64Barcode(res.invoiceid);
    var items = [];
     items.push([{text: translation["serial"], fontSize: 8},
     {text: translation["article"], fontSize: 8},
     {text: translation["description"], fontSize: 8},
     {text: translation["qty"], fontSize: 8, alignment: "right"},
     {text: translation["price"], fontSize: 8, alignment: "right"},
     {text: translation["discount"], fontSize: 8, alignment: "right"},
     {text: translation["total"], fontSize: 8, alignment: "right"}]);

     var toInvoiceBody = [];
    for (var key in shoppingCartContent) {
      var data = shoppingCartContent[key];
      var txt = data.productName;

      var obj = {
        vvv: parseFloat(data.realPrice),
        invoiceid: invoiceID,
        serialno: txt.split(" ")[0],
        item: txt.substring(txt.indexOf(" ")),
        quantity: "1",
        price: parseFloat(data.SalesPrice),
        discount: data.Discount,

      }
      toInvoiceBody.push(obj);

      items.push(
        [{text: data.SerialNo, fontSize: 8},
        "",
        {text: txt.substring(txt.indexOf(" ")), fontSize: 8},
        {text: "1", fontSize: 8, alignment: "right"},
        {text: parseFloat(data.SalesPrice).toLocaleString("nl-NL",{ style: 'currency', currency: "EUR" }), fontSize: 8, alignment: "right"},
        {text: data.Discount, fontSize: 8, alignment: "right"},
        {text: parseFloat(data.realPrice).toLocaleString("nl-NL",{ style: 'currency', currency: "EUR" }), fontSize: 8, alignment: "right"}
        ]
      )
    }
    var tdl = {
      invoiceid: invoiceID
    }
    api.call("deleteInvoiceBody", function(res) {
      $.each(toInvoiceBody, function() {
        var obj = {};
        var ths = this;
        api.call("insertInvoiceBody", function(res) {
        }, ths, {}, {})
      })
    }, tdl, {}, {})
    if ( localStorage.invoiceDiscount != "") {
      var dsc = localStorage.invoiceDiscount;
      if (localStorage.invoiceDiscount.indexOf("%") == -1) {
        dsc = parseFloat(dsc).toLocaleString("nl-NL",{minimumFractionDigits: 2,maximumFractionDigits: 2})
      }
        items.push(
          [{text: translation["payment"], fontSize: 8},
          {text: translation["currency"], alignment: "right",fontSize: 8},
          {text: translation["Amount"],alignment: "left", fontSize: 8},
          {text: "", fontSize: 8, alignment: "right", border: [true,false,true,false],fillColor: "#e7e7e7"},
          {text: "", border: [false,false,false,false],fontSize: 8, alignment: "right"},
          {text: "Discount" + ": ", border: [false,false,false,false],fontSize: 8, alignment: "right"},
          {text: dsc, border: [false,false,true,false],fontSize: 8, alignment: "right"}
          ]
        )
      }
      if (localStorage.directRefund == "1") {
        var vex =  localStorage.vatchargeexcl;
      } else {
        var vex = localStorage.vatexcluded;
      }

    items.push(
      [{text: translation["payment"], fontSize: 8},
      {text: translation["currency"], alignment: "right",fontSize: 8},
      {text: translation["Amount"],alignment: "left", fontSize: 8},
      {text: "", fontSize: 8, alignment: "right", border: [true,false,true,false],fillColor: "#e7e7e7"},
      {text: "", border: [false,false,false,false],fontSize: 8, alignment: "right"},
      {text: ((localStorage.directRefund == "0") ? "Excluding VAT" : "Excluding VAT") + ": ", border: [false,false,false,false],fontSize: 8, alignment: "right"},
      {text: parseFloat(localStorage.vatexcluded).toLocaleString("nl-NL",{minimumFractionDigits: 2,maximumFractionDigits: 2}), border: [false,false,true,false],fontSize: 8, alignment: "right"}
      ]
    )
    var toInvoicePayments = [];
console.log(payments)
    for (var key in payments) {
      var data = payments[key];
          var fl = parseFloat(data.amount);
          var pyd = fl.toLocaleString("nl-NL",{minimumFractionDigits: 2,maximumFractionDigits: 2});

            var obj = {
                invoiceid: invoiceID,
                type: data.paymentID,
                typeName: data.paymentMethod,
                currency: "EUR",
                currencyName: "Euro",
                amount: fl
            }
            toInvoicePayments.push(obj);
            if (data.paymentID == "7") {
              if (data.amount < -5) {
                fl = fl * -1;
              }
              items.push(
                [{text: ((data.amount < -5) ? "Change" : data.paymentMethod),border: [true,true, false, true],alignment: "right", fontSize: 8},
                {text: "€",alignment: "right" ,fontSize: 8},
                {text: pyd, fontSize: 8, alignment: "left"},
                {text: "", fontSize: 8, alignment: "right",border: [true,false,true,false],fillColor: "#e7e7e7"},
                {text: "", border: [false,false,false,false],fontSize: 8, alignment: "right"},
                {text: "", border: [false,false,false,false],fontSize: 8, alignment: "right"},
                {text: "", border: [false,false,true,false],fontSize: 8, alignment: "right"}
                ]
              )
            } else {
                items.push(
                  [{text: data.paymentMethod,border: [true,true, false, true],alignment: "right", fontSize: 8},
                  {text: "€",alignment: "right" ,fontSize: 8},
                  {text: pyd, fontSize: 8, alignment: "left"},
                  {text: "", fontSize: 8, alignment: "right",border: [true,false,true,false],fillColor: "#e7e7e7"},
                  {text: "", border: [false,false,false,false],fontSize: 8, alignment: "right"},
                  {text: "", border: [false,false,false,false],fontSize: 8, alignment: "right"},
                  {text: "", border: [false,false,true,false],fontSize: 8, alignment: "right"}
                  ]
                )
           }


    }
    var tdl = {
      invoiceid: invoiceID
    }
    api.call("deleteInvoicePayments", function(res) {
      $.each(toInvoicePayments, function() {
        var ths = this;
          api.call("insertInvoicePayments", function(res) {

          }, ths, {}, {})
      })
    }, tdl, {}, {})

    if (localStorage.directRefund == "1") {
      var due = parseFloat(localStorage.payWithRefund);
    }  else {
      var due = parseFloat(localStorage.payNoRefund);
    }
    var rct = 2100 / 121;
    var vl = due;
    var vt = (vl / 100) * rct;
    var wv = vl - vt;

    items.push(
      [{text:"",border: [false,false,false,false],fontSize: 8,},
      {text:"", fontSize: 8,border: [false,false,false,false]},
      {text:"",fontSize: 8,border: [false,false,true,false]},
      {text:"",border: [false,false,true,false], fontSize: 8,fillColor: "#e7e7e7",alignment: "right"},
      {text:"",fontSize: 8,border: [false,false,false,true]},
     {text: ((localStorage.directRefund == "0") ? translation["vat21"] : "VAT(refund)") + ": ",border: [false,false,false,true], fontSize: 8,bold: true, alignment: "right"},
      {text:  vt.toLocaleString("nl-NL",{ style: 'currency', currency: 'EUR' }),border: [false,false,true,true], fontSize: 8,bold: true, alignment: "right"}
    ]);
    items.push(
      [{text:"",border: [false,false,false,false],fontSize: 8,},
      {text:"",border: [false,false,false,false],fontSize: 8},
      {text:"",border: [false,false,true,false],fontSize: 8},
      {text:"",border: [false,false,true,true], fontSize: 8,fillColor: "#e7e7e7",alignment: "right"},
      {text:"",fontSize: 8,border: [false,false,false,true]},
     {text: translation["Amount"] + ": ",border: [false,false,false,true], fontSize: 8,bold: true, alignment: "right"},
      {text: due.toLocaleString("nl-NL",{ style: 'currency', currency: 'EUR' }),border: [false,false,true,true], fontSize: 8,bold: true, alignment: "right"}
    ]);
 console.log(items)
     var docDefinition = {
      pageSize: "A4",
      header: [

      ],
      content: [
        {
           margin: [227,-20,0,0],
            image: dataUrl,
            width: 100

          },

          {
            margin: [400,-40,0,0],
            image: bc
          },
          {

              table: {
                 headerRows: 1,
                widths: [125, '*'],
                body: [
                  [{borders: [true,true,true,true], italics: true,text: translation["stamp"], alignment: "center" }, {italics: true,text: translation["enter_capitol"], alignment: "center"}],
                  [
                    {},
                    [
                      {
                        table: {
                          widths: ['auto', 340],
                          body: [
                            [{text: translation["name"] + ":  ",border:[false,false,false,false], italics: true,alignment: "right"}, {text: $("#firstName").val() + " " + $("#lastName").val(),border:[false, false,false, true] }],

                          ]
                        },

                      }
                    ]
                  ],
                  [
                    {},
                    [
                      {
                        table: {
                          widths: ['auto', 330],
                          body: [
                            [{text: translation["address"] + ": ", border:[false,false,false,false],italics: true,alignment: "right"}, {text: $("#address1").val(), border:[false, false,false, true]}],

                          ]
                        },

                      }
                    ]
                  ],
                  [
                    {},
                    [
                      {
                        table: {
                          widths: ['auto', 80,'auto',50,'auto',75],
                          body: [
                            [
                              {text: translation["city"] + ": ",border:[false,false,false,false], italics: true,alignment: "right"}, {text: $("#city").val(),border:[false,false,false,true] },
                              {text: translation["zip"] + ": ",border:[false,false,false,false], italics: true,alignment: "right"}, {text: $("#zip").val(),border:[false,false,false,true] },
                              {text: translation["country"] + ": ", border:[false,false,false,false],italics: true,alignment: "right"}, {text: "",border:[false,false,false,true] }]

                          ]
                        },

                      }
                    ]
                   ],
                   [
                     {},
                     [
                       {
                         table: {
                           widths: ['auto', 100],
                           body: [
                             [
                               {text: translation["telephone"] + ": ",border:[false,false,false,false], italics: true,alignment: "right"}, {text: $("#telephone").val(),border:[false,false,false,true] }
                      //         {text: translation["passport"] + ": ", italics: true,border:[false,false,false,false],alignment: "right"}, {text: $("#passport").val(),border:[false,false,false,true] },
                             ]
                           ]
                         },

                       }
                     ]
                    ],
                  [
                    {},
                    [
                      {
                        table: {
                          widths: ['auto', 318],
                          body: [
                            [{text: translation["email"] + ": ", border:[false,false,false,false],italics: true,alignment: "right"}, {text: $("#email").val(),border:[false,false,false,true] }],
                            [{text: translation["hotel"] + ": ", border:[false,false,false,false],italics: true,alignment: "right"}, {text: $("#hotel").val(),border:[false,false,false,true]}]
                          ],
                        },

                      }
                    ]
                  ], // sledeci // sledeci // sledeci // sledeci
                ]
              },
              layout: {
                    hLineWidth: function (i, node) {
                      return (i === 0 || i === node.table.body.length) ? 2 : 1;
                    },
                    vLineWidth: function (i, node) {
                      return (i === 0 || i === node.table.widths.length) ? 2 : 1;
                    },
                    hLineColor: function (i, node) {
                        return (i === 0 || i === node.table.body.length) ? 'black' : 'white';
                    },
                    vLineColor: function (i, node) {
                      return (i === 0 || i === node.table.widths.length) ? 'black' : 'black';
                    },
                    // hLineStyle: function (i, node) { return {dash: { length: 10, space: 4 }}; },
                    // vLineStyle: function (i, node) { return {dash: { length: 10, space: 4 }}; },
                    // paddingLeft: function(i, node) { return 4; },
                    // paddingRight: function(i, node) { return 4; },
                    // paddingTop: function(i, node) { return 2; },
                    // paddingBottom: function(i, node) { return 2; },
                    // fillColor: function (rowIndex, node, columnIndex) { return null; }
                  }
            },
            {
              table: {
                layout: 'lightHorizontalLines',
                headerRows: 1,
                widths: [60,60,200,20,50,40,50],
                body: items
              }
            },
            {fontSize: 9,text: translation["vatincl"], bold: true, italics: false,alignment: "right"},
            {fontSize: 9,text: translation["company_rules"], bold: true, italics: true,alignment: "center"},
            { table: {
              layout: 'lightHorizontalLines',
              headerRows: 1,

              widths: [122,122,122,122],
              body: [
                [{text: translation["tour"], alignment: "center", fontSize: 9},
                {text: translation["showroom"], alignment: "center", fontSize: 9},{text: translation["sp"],
                 fontSize: 9, alignment: "center"},
                 { fontSize: 9,text: translation["spc"], alignment: "center"}],
                [{text: $.parseJSON(localStorage.tour)["ProjId"], alignment: "center", fontSize: 9},
                {text:  localStorage.showRoomName, alignment: "center", fontSize: 9},
                {text:  $.parseJSON(localStorage.sp)["EmplID"], fontSize: 9, alignment: "center"},
                { fontSize: 9,text: $.parseJSON(localStorage.sp)["Employee"], alignment: "center"}]
              ]
            }
          }
       ],

     };
console.log(docDefinition)
     var pdfDocGenerator = pdfMake.createPdf(docDefinition);

      pdfDocGenerator.getBase64((data) => {

          var obj =  {
                from: "costerdiamonds@gmail.com",
                pdf: data,
                customer: $("#email").val(),
                name: nm + "_" + "gb" + ".pdf",
                subject: "Invoice",
                text: "Generated " + (new Date()),
                user: "cobol1962@gmail.com"
          }
          api.call("sendMail", function(res) {
            swal({
              type: "success",
              text: "Mail sent succsefully.",
              showCancelButton: false,
              allowOutsideClick: false,
              allowEscapeKey: false,
              showConfirmButton: true
            }).then((result) => {
                window.open("http://85.214.165.56:81/api/invoices/"  + nm + "_" + "gb" + ".pdf", '_system');
             //  window.location.reload();
            })
          }, obj, {});
        });

      })
   }, obj, {})
 }
function noPinCode() {
  swal({
    type: "question",
    title: "Select reason",
    html: "<select class='form-control'><option selected value='nopincode'>No pincode</option></select>",
    confirmButtonText: "Submit",
    showCancelButton: true,
    showCancelButton: "Cancel",
    showCloseButton: true
  })
}
function doSearch() {
  if ($("#search").val() == "") {

    if (currentPage == "invoice") {
      findID("");
    }
    if (currentPage == "diamonds") {
      try {
        iframeWin.postMessage("findID#", '*')
      } catch(err) {

      }
    }
    return;
  }
  api.call("search", function(res) {

    if (res.found == "fail") {
      showModal({
        type: "error",
        title: "No Search Results.",
        confirmButtonText: "CONTINUE",
        showCloseButton: true
      })
      return;
    }

    if (res.group != "Diamonds") {
      if (currentPage == "invoice") {

        findID(res.itemid);
      } else {
        loadPage('invoice', true,  false, {itemid: res.itemid })
      }
    } else {
      if (currentPage == "diamonds") {
        try {
          var iframeWin = document.getElementById('diamonds').contentWindow;
          iframeWin.postMessage("findID#" + res.itemid, "*")
        } catch(err) {

        }
      } else {

        loadPage('diamonds', true,  false, {itemid: res.itemid })
      }
    }
  }, {search: $("#search").val() })
}
showModal = function(options = {}) {
  if (options.type === undefined) {
    $("#m_header").css({
      backgroundImage: "url(/images/crown.png)"
    })
  }
  if (options.type == "error") {
    $("#m_header").css({
      backgroundImage: "url(/images/error.png)"
    })
  }
  if (options.type == "ok") {
    $("#m_header").css({
      backgroundImage: "url(/images/green_checkbox_only.png)"
    })
  }
  if (options.title !== undefined) {
    $("#m_title").html(options.title);
  }
  if (options.content !== undefined) {
    $("#m_content").html(options.content);
  } else {
      $("#m_content").html("");
  }
  if (options.showCancelButton !== undefined) {
    $("#m_cancel").hide();
  } else {
    $("#m_cancel").show();
  }
  if (options.confirmButtonText !== undefined) {
    $("#m_confirm").html(options.confirmButtonText);
  } else {
    $("#m_confirm").html("CONFIRM");
  }
  if (options.cancelButtonText !== undefined) {
    $("#m_cancel").html(options.cancelButtonText);
  } else {
    $("#m_cancel").html("CANCEL");
  }
  $("#m_confirm").unbind("click");

  if (options.confirmCallback !== undefined) {
    $("#m_confirm").bind("click", function() {
      options.confirmCallback();
      if (options.noclose === undefined) {
        $('#mainModal').modal("hide");
      }
    });
  } else {
    $("#m_confirm").bind("click", function() {
      if (options.noclose === undefined) {
        $('#mainModal').modal("hide");
      }
    });
  }
  if (options.cancelCallback === undefined) {
    $("#m_cancel").bind("click", function() {
      if (options.noclose === undefined) {
        $('#mainModal').modal("hide");
      }
    });
  } else {
    $("#m_cancel").bind("click", function() {
      options.cancelCallback();
      if (options.noclose === undefined) {
        $('#mainModal').modal("hide");
      }
    });
  }
  setTimeout(function() {
      if (options.showClose !== undefined) {
         $('#mainModal').find(".close").hide();
      } else {
        $('#mainModal').find(".close").show();
      }
  }, 1000);
  if (options.allowBackdrop !== undefined) {
    $('#mainModal').modal({
      backdrop: 'static',
      keyboard: false
    })
  } else {
    $('#mainModal').modal({
      backdrop: true,
      keyboard: true
    })
  }
  $("#mainModal").modal("show");
}

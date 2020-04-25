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
var optionsLoader = {

}
$(document).ready(function() {
//  localStorage.clear();


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
      recalculateInvoice();
  });

 $("#paymentsModal").on('show.bs.modal', function(e){
   setTimeout(function() {
        goToNext();
    } , 1000);
  });

});

function textToBase64Barcode(text){
  var canvas = document.createElement("canvas");
  JsBarcode(canvas, text, {
    format: "CODE128",
    height:20,
    fontSize: 13
  });
  return canvas.toDataURL("image/png");
}

loadedPages.diamonds = {
  language: "",
  invoiceID: "",
  salePerson: {},
  documentName: "",
  currentStep: 1,
  checkCustomer: false,
  validator: null,
  vatRefundID: "",
  adminChargeID: "",
  vatRefund: false,
  search: {},
  initialize: function(search = {}) {

    loadedPages.diamonds.search = search;
    $("#content").css({
      marginTop: 0
    })
    setTimeout(function() {
      loadedPages.diamonds.triggerCurrencyChange();
      if (loadedPages.diamonds.search.itemid !== undefined) {
          var ww = setInterval(function() {
            try {

              findID(loadedPages.diamonds.search.itemid)
              clearInterval(ww);
            } catch(err) {

            }
        }, 500)
      }
    }, 2000);
    this.salePerson = $.parseJSON(localStorage.sp);
    $("#country").countrySelect({
      preferredCountries: ['ru', 'cn', 'us', 'ch', 'jp',  'gb', 'fr', 'es']
    });
    $("#invoice_country").countrySelect({
      onlyCountries: ['gb', 'ru', 'ua']
    });

    $("#invoice_country").bind("change", function() {
      loadedPages.invoice.language = $("#invoice_country_code").val();
      $.ajax({
          dataType: "json",
          url: "translations/translation_" + $("#invoice_country_code").val() + ".json",
          type: "GET",
          async: false,
          success: function(res) {
              translation = res;
          }
        });

    });
    $("#invoice_country").trigger("change");

    api_csv.call("salespersons", function(res) {
      var td = [];
      $.each(res.data, function() {
        td.push({

          id: this.salespersonid,
          name: this.FullName
        })
      })
      $("#salesperson").typeahead({
        items: "all",
        scrollHeight: 100,
        source: td,
        autoSelect: true,
        afterSelect: function(obj) {
          swal({
            type: "question",
            text: "Confirm " + obj.name + " as selected Sales Person",
            showCancelButton: true,
            allowOutsideClick: false,
            allowEscapeKey: false
          }).then((result) => {
            if (!result.value) {
              setTimeout(function() {
                $("#salesperson").val("").trigger("input");
                $("#salesperson").attr("confirmed", "no");
              }, 500);
            } else {
                $("#salesPerson").val(obj.salespersonid);
                $("#salesperson").attr("confirmed", "yes");
            }
          })
        }
      });
    }, {}, {})
    api_csv.call("showrooms", function(res) {
      var td = [];
      $.each(res.data, function() {
        td.push({
          id: this.showroomid,
          name: this.name
        })
      })

      $("#showroom").typeahead({
        scrollHeight: 100,
        items: "all",
        source: td,
        autoSelect: true,
        afterSelect: function(obj) {
          swal({
            type: "question",
            text: "Confirm " + obj.name + " as selected Showroom",
            showCancelButton: true,
            allowOutsideClick: false,
            allowEscapeKey: false
          }).then((result) => {
            if (!result.value) {
              setTimeout(function() {
                $("#showroom").val("").trigger("input");
                $("#showroom").attr("confirmed", "no");
              }, 500);
            } else {
                localStorage.showRoom = obj.showroomid;
                $("#cshowroom").val(obj.showroomid);
                $("#showroom").attr("confirmed", "yes");
            }
          })
        }
      });

      $('#showroom').val(localStorage.showRoomName);
    }, {}, {})

  },

 get: function() {
   var obj = {
     SerialNo:$("#serial").val()
   }
   api.call("getScannedProduct", function(res) {
     if (res[0] == undefined) {
       swal({
         type: 'error',
         text: "No product with this serial."
       })
     } else {
       var img = $(res[0].imageUR);
       var exr = $("#currency").find("option:selected").attr("rate");
       html = res[0].imageURL.replace(/50px/g,"300px");
       html += "<div style='width:100%;'>" + res[0].productName + "</div>";
       html += "<br />";
       if (res[0].Discount > 0) {
         html += "<div style='float:right;'><span style='color:red;'><b>" + res[0].Discount + "% </b></span><span style='text-decoration:line-through;'>" + (parseFloat(res[0].SalesPrice) * parseFloat(exr)).toLocaleString("nl-NL",{ style: 'currency', currency: "EUR" }) + "</span></div></br />";
       }
       html += "<div style='float:right;'><span>" + (parseFloat(res[0].realPrice) * parseFloat(exr)).toLocaleString("nl-NL",{ style: 'currency', currency: "EUR" }) + "</span></div>";

       swal({
         showCancelButton: true,
         type: "question",
         title: "Add to invoice?",
         html: html
       }).then((result) => {
         if (result.value) {
           addToInvoice(res[0]);
         }
       })
   }
   }, obj, {})
/*   $.ajax({
     url: "http://85.214.165.56:81:5000/?product=" + $("#serial").val(),
     type: "GET",
     success: function(res) {

       if (res[0] == undefined) {
         swal({
           type: 'error',
           text: "No product with scanned code"
         })
       } else {
         swal({
           showCancelButton: true,
           type: "question",
           title: "Add to invoice?",
           text: res[0]["ITEM ID"] + " " + res[0].name + " (€ " + parseInt(res[0]["Sales Price"]).toLocaleString("nl-NL") + ".00)"
         }).then((result) => {
           if (result.value) {
             loadedPages.invoice.addToInvoice(res[0]);
           }
         })
     }
    }
  })*/

 },
 mail: function() {
   swal({
     type: "info",
     text: "Sending mail",
     showCancelButton: false,
     allowOutsideClick: false,
     allowEscapeKey: false,
     showConfirmButton: false
   })
  if (loadedPages.invoice.invoiceID == "") {
    var nm = "invoice_" + (new Date()).getTime();
    loadedPages.invoice.documentName = nm;
  } else {
    var nm = loadedPages.invoice.documentName;
  }
 if (loadedPages.invoice.invoiceID == "") {
       var obj = {
         customerid: $("#customerid").val(),
         showroom: $("#showroom").val(),
         salesPerson: $("#salesperson").val(),
         tourNo: $("#tourNo").val(),
         total: $("[invoicetotal]").html().replace("&nbsp;", " "),
         discount: $("#invoicediscount").val(),
         dueAmount: $("[invoicedue]").html().replace("&nbsp;", " "),
         pdf:  nm + "_" + loadedPages.invoice.language + ".pdf",
         documentName :  nm,
         documentLanguages: loadedPages.invoice.language,
         showroomid:    localStorage.showRoom,
         salesPerson: localStorage.salePersonName,
         salePersonId: loadedPages.invoice.salePerson.salepersonid
       }
       loadedPages.invoice.documentName = nm;
     } else {
       var obj = {
         invoiceid: loadedPages.invoice.invoiceID,
         language: loadedPages.invoice.language,
         showroom: $("#showroom").val(),
         showroomid: localStorage.showRoom,
         tourNo: $("#tourNo").val(),
         total: $("[invoicetotal]").html().replace("&nbsp;", " "),
         discount: $("#invoicediscount").val(),
         dueAmount: $("[invoicedue]").html().replace("&nbsp;", " ")
       }
     }
   api.call(((loadedPages.invoice.invoiceID == "") ? "insertInvoice" : "updateInvoiceDocuments"), function(res) {
     if (loadedPages.invoice.invoiceID == "") {
       loadedPages.invoice.invoiceID = res.invoiceid;
     }
   toDataURL('images/logo.png', function(dataUrl) {
     var bc = textToBase64Barcode(res.invoiceid);
     var items = [];
      items.push([{text: translation["serial"], fontSize: 8},{text: translation["article"], fontSize: 8},{text: translation["description"], fontSize: 8},{text: translation["qty"], fontSize: 8, alignment: "right"},{text: translation["price"], fontSize: 8, alignment: "right"},
      {text: translation["discount"], fontSize: 8, alignment: "right"},{text: translation["total"], fontSize: 8, alignment: "right"}]);

      var toInvoiceBody = [];
     $.each($("#invoiceBody").find("tbody").find("tr"), function() {
       var obj = {
         invoiceid: loadedPages.invoice.invoiceID,
         serialno: $(this).find("td").eq(0).html(),
         item: $(this).find("td").eq(1).html(),
         quantity: $(this).find("td").eq(2).find("input").val(),
         price: parseFloat($(this).find("td").eq(3).html().replace("€", "").replace(".", "").replace("&nbsp;","").trim()),
         discount: $(this).find("td").eq(4).find("input").val(),
         value: parseFloat($(this).find("td").eq(5).html().replace("€", "").replace(".", "").replace("&nbsp;","").trim()),
         amount: parseFloat($(this).find("td").eq(5).html().replace("€", "").replace(".", "").replace("&nbsp;","").trim())
       }
       toInvoiceBody.push(obj);
       items.push(
         [{text: $(this).find("td").eq(0).html(), fontSize: 8},
         "",
         {text: $(this).find("td").eq(1).html(), fontSize: 8},
         {text: $(this).find("td").eq(2).find("input").val(), fontSize: 8, alignment: "right"},
         {text: $(this).find("td").eq(3).html().replace("&nbsp;", " "), fontSize: 8, alignment: "right"},
         {text: $(this).find("td").eq(4).find("input").val(), fontSize: 8, alignment: "right"},
         {text: $(this).find("td").eq(5).html().replace("&nbsp;", " "), fontSize: 8, alignment: "right"}
         ]
       )
     })
     var tdl = {
       invoiceid: loadedPages.invoice.invoiceID
     }
     api.call("deleteInvoiceBody", function(res) {
       $.each(toInvoiceBody, function() {
         var ths = this;
           api.call("insertInvoiceBody", function(res) {

           }, ths, {}, {})
       })
     }, tdl, {}, {})
     items.push(
       [{text: translation["payment"], fontSize: 8},
       {text: translation["currency"], alignment: "right",fontSize: 8},
       {text: translation["Amount"],alignment: "left", fontSize: 8},
       {text: "", fontSize: 8, alignment: "right", border: [true,false,true,false],fillColor: "#e7e7e7"},
       {text: "", border: [false,false,false,false],fontSize: 8, alignment: "right"},
       {text: translation["total"] + ": ", border: [false,false,false,false],fontSize: 8, alignment: "right"},
       {text: $("[invoicetotal]").html().replace("&nbsp;", " "), border: [false,false,true,false],fontSize: 8, alignment: "right"}
       ]
     )
     var toInvoicePayments = [];
     $.each($("#paymentsTable").find("tbody").find("tr"), function(ind) {

       if (ind > 0) {

         if ($(this).find("input").length > 0) {
           var fl = parseFloat($(this).find("input").eq(0).val().replace(".","").replace(",", "."));
           var pyd = fl.toLocaleString("nl-NL",{minimumFractionDigits: 2,maximumFractionDigits: 2});
           if (ind > 1) {
             var obj = {
                 invoiceid: loadedPages.invoice.invoiceID,
                 type: $(this).find("select").eq(0).val(),
                 typeName: $(this).find("select").eq(0).find("option:selected").text(),
                 currency: $(this).find("select").eq(1).val(),
                 currencyName: $(this).find("select").eq(1).find("option:selected").text(),
                 amount: fl
             }
             toInvoicePayments.push(obj);
             items.push(
               [{text: $(this).find("select").eq(0).find("option:selected").text(),border: [true,true, false, true],alignment: "right", fontSize: 8},
               {text: $(this).find("select").eq(1).find("option:selected").text(),alignment: "right" ,fontSize: 8},
               {text: pyd, fontSize: 8, alignment: "left"},
               {text: "", fontSize: 8, alignment: "right",border: [true,false,true,false],fillColor: "#e7e7e7"},
               {text: "", border: [false,false,false,false],fontSize: 8, alignment: "right"},
               {text: "", border: [false,false,false,false],fontSize: 8, alignment: "right"},
               {text: "", border: [false,false,true,false],fontSize: 8, alignment: "right"}
               ]
             )
           } else {
             var obj = {
                 invoiceid: loadedPages.invoice.invoiceID,
                 type: $(this).find("select").eq(0).val(),
                 typeName: $(this).find("select").eq(0).find("option:selected").text(),
                 currency: $(this).find("select").eq(1).val(),
                 currencyName: $(this).find("select").eq(1).find("option:selected").text(),
                 amount: fl
             }
             toInvoicePayments.push(obj);
             items.push(
               [{text: $(this).find("select").eq(0).find("option:selected").text(), fontSize: 8,alignment: "right",},
               {text: $(this).find("select").eq(1).find("option:selected").text(), alignment: "right",fontSize: 8},
               {text: pyd, border: [false,false,true,false],alignment: "left",fontSize: 8},
               {text: "", fontSize: 8, alignment: "right", border: [true,false,true,false],fillColor: "#e7e7e7"},
               {text: "", border: [false,false,false,false],fontSize: 8, alignment: "right"},
               {text: translation["discount"] + ": ",border: [false,false,false,false],fontSize: 8,bold: true, alignment: "right"},
               {text: $("#invoicediscount").val().replace("&nbsp;", " "), border: [false,false,true, false],fontSize: 8,bold: true, alignment: "right"}
               ]
             )
           }
         }
       }
     });
     console.log(toInvoicePayments)
     var tdl = {
       invoiceid: loadedPages.invoice.invoiceID
     }
     api.call("deleteInvoicePayments", function(res) {
       $.each(toInvoicePayments, function() {
         var ths = this;
           api.call("insertInvoicePayments", function(res) {

           }, ths, {}, {})
       })
     }, tdl, {}, {})
     var rct = 2100 / 121;
     var vl = $("[invoicedue]").attr("realvalue");
     var vt = (vl / 100) * rct;
     var wv = vl - vt;

     items.push(
       [{text:"Change",fontSize: 8,},
       {text:"", fontSize: 8},
       {text:"",fontSize: 8},
       {text:"",border: [true,false,true,false], fontSize: 8,fillColor: "#e7e7e7",alignment: "right"},
       {text:"",fontSize: 8,border: [false,false,false,true]},
      {text:translation["novat"] + ": ",border: [false,false,false,true], fontSize: 8,bold: true, alignment: "right"},
       {text: wv.toLocaleString("nl-NL",{ style: 'currency', currency: 'EUR' }),border: [false,false,true,true], fontSize: 8,bold: true, alignment: "right"}
     ]);
     items.push(
       [{text:"",border: [false,false,false,false],fontSize: 8,},
       {text:"", fontSize: 8,border: [false,false,false,false]},
       {text:"",fontSize: 8,border: [false,false,true,false]},
       {text:"",border: [false,false,true,false], fontSize: 8,fillColor: "#e7e7e7",alignment: "right"},
       {text:"",fontSize: 8,border: [false,false,false,true]},
      {text: translation["vat21"] + ": ",border: [false,false,false,true], fontSize: 8,bold: true, alignment: "right"},
       {text:  vt.toLocaleString("nl-NL",{ style: 'currency', currency: 'EUR' }),border: [false,false,true,true], fontSize: 8,bold: true, alignment: "right"}
     ]);
     items.push(
       [{text:"",border: [false,false,false,false],fontSize: 8,},
       {text:"",border: [false,false,false,false],fontSize: 8},
       {text:"",border: [false,false,true,false],fontSize: 8},
       {text:"",border: [false,false,true,true], fontSize: 8,fillColor: "#e7e7e7",alignment: "right"},
       {text:"",fontSize: 8,border: [false,false,false,true]},
      {text: translation["Amount"] + ": ",border: [false,false,false,true], fontSize: 8,bold: true, alignment: "right"},
       {text: $("[invoicedue]").html().replace("&nbsp;", " "),border: [false,false,true,true], fontSize: 8,bold: true, alignment: "right"}
     ]);
  /*   items.push(
       [{text:"",border: [false,false,false,false]},
       {text:"",border: [false,false,false,false]},
       {text:"",border: [false,false,false,false]},
       {text:"",border: [false,false,false,false]},
       {text:"",border: [false,false,false,false]},
       {text:"",border: [false,false,false,false]},
       {text: $("[invoicetotal]").html().replace("&nbsp;", " "), fillColor: "#e7e7e7",fontSize: 8,bold: true, alignment: "right"}
     ],
     )

     items.push(
       [{text:"",border: [false,false,false,false]},
       {text:"",border: [false,false,false,false]},
       {text:"",border: [false,false,false,false]},
       {text:"",border: [false,false,false,false]},
       {text:"",border: [false,false,false,false]},
       {text:"Discount: ",border: [false,false,false,false],fontSize: 8,bold: true, alignment: "right"},
       {text: $("#invoicediscount").val().replace("&nbsp;", " "), fillColor: "#e7e7e7",fontSize: 8,bold: true, alignment: "right"}
     ]
     )
     items.push(
       [{text:"",border: [false,false,false,false]},
       {text:"",border: [false,false,false,false]},
       {text:"",border: [false,false,false,false]},
       {text:"",border: [false,false,false,false]},
       {text:"",border: [false,false,false,false]},
      {text:"Total amount: ",border: [false,false,false,false],fontSize: 8,bold: true, alignment: "right"},
       {text: $("[invoicedue]").html().replace("&nbsp;", " "), fillColor: "#e7e7e7",fontSize: 8,bold: true, alignment: "right"}
     ],
   )*/

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
                            widths: ['auto', 100,'auto',144],
                            body: [
                              [
                                {text: translation["telephone"] + ": ",border:[false,false,false,false], italics: true,alignment: "right"}, {text: $("#telephone").val(),border:[false,false,false,true] },
                                {text: translation["passport"] + ": ", italics: true,border:[false,false,false,false],alignment: "right"}, {text: $("#passport").val(),border:[false,false,false,true] },
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
                 [{text: translation["tour"], alignment: "center", fontSize: 9},{text: translation["showroom"], alignment: "center", fontSize: 9},{text: translation["sp"], fontSize: 9, alignment: "center"},{ fontSize: 9,text: translation["spc"], alignment: "center"}],
                 [{text: $("#tourid").val(), alignment: "center", fontSize: 9},{text: $("#showroom").val(), alignment: "center", fontSize: 9},{text: localStorage.salePersonName, fontSize: 9, alignment: "center"},{ fontSize: 9,text: loadedPages.invoice.salePerson.salepersonid, alignment: "center"}]

               ]
             }
           }
	      ],

      };

      var pdfDocGenerator = pdfMake.createPdf(docDefinition);

       pdfDocGenerator.getBase64((data) => {

           var obj =  {
                 from: "costerdiamonds@gmail.com",
                 pdf: data,
                 customer: $("#email").val(),
                 name: nm + "_" + loadedPages.invoice.language + ".pdf",
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
                 window.open("http://80.211.41.168/api/invoices/"  + nm + "_" + loadedPages.invoice.language + ".pdf", '_system');
              //  window.location.reload();
             })
           }, obj, {});
         });

       })
    }, obj, {})
 },

 saveSP: function() {
   var obj = {
    name: $("#salespersonname").val()
   }
   api.call("insertSalesPerson", function(res) {
     $("#addSalesPerson").modal("hide");
   }, obj, {});
 },
 saveSR: function() {
   var obj = {
    name: $("#roomname").val()
   }
   api.call("insertRoom", function(res) {
     $("#addShowRoom").modal("hide");
   }, obj, {});
 },
 calculatePayments: function() {
   var tp = 0;
   $.each($("#paymentsTable").find("tbody").find("tr"), function() {
     if ($(this).find("select").eq(0).val() == "7") {
       $(this).remove();
     }
   })
   $.each($("#paymentsTable").find("tbody").find("tr"), function(ind) {
     if (ind > 0) {
       if ($(this).find("input").length > 0) {
         var thenum = $(this).find("input").val().replace( /^\D+/g, '');
         var n = thenum.replace(/\./g, "");
         var n = n.replace(/\,/g, ".");

         tp += parseFloat(n);
      }
     }
   })
   var tpp = parseFloat($("[invoicedue]").attr("realvalue"));
   $("#master").clone().appendTo($("#paymentsTable").find("tbody"));
   $("#paymentsTable").find("tbody").find("tr:last").find("select").eq(1).hide();
   $("#paymentsTable").find("tbody").find("tr:last").find("i").hide();
   $("#paymentsTable").find("tbody").find("tr:last").find("select").eq(0).val("7");
   $("#paymentsTable").find("tbody").find("tr:last").find("select").prop("disabled", true);
   $("#paymentsTable").find("tbody").find("tr:last").find("input").val(parseFloat(tpp - tp).toLocaleString("nl-NL",{ style: 'currency', currency: "EUR" }));
   $("#paymentsTable").find("tbody").find("tr:last").find("input").prop("disabled", true);
   $("#paymentsTable").find("tbody").find("input").unbind("change");
   $("#paymentsTable").find("tbody").find("input").bind("change", function() {
     $(this).val(parseFloat($(this).val()).toLocaleString("nl-NL",{ style: 'currency', currency: "EUR" }));
     loadedPages.invoice.calculatePayments();
   });
 },
 checkInvoice: function() {

   var ok = true;
   if ($("#invoiceBody").find("tbody").find('tr').length == 0) {
     ok = false;
     swal({
       type: "error",
       text: "No items selected"
     })
   }
   if (!ok) {
     return false;
   }
   var tp = 0;
   $.each($("#paymentsTable").find("tbody").find("tr"), function(ind) {
     if (ind > 0) {
       if ($(this).find("input").length > 0) {
        tp += parseFloat($(this).find("input").val().replace(".","").replace(",", "."));

      }
     }
   })

   var tpp = parseFloat($("[invoicedue]").attr("realvalue"));
   if (tp != tpp) {
     ok = false;
     swal({
       type: "error",
       text: "Total and payments are not in balance."
     })
   }
   if (!ok) {
     return false;
   }
   if ($("#tourForm").attr("confirmed") != "yes") {
     ok = false;
     swal({
       type: "error",
       text: "Select Tour."
     }).then((result) => {
       $("#tour").appendTo("body").modal("show");
     })
   } else {

   }
   if (!ok) {
     return false;
   }
/*   if ($("#salesperson").attr("confirmed") != "yes") {
     ok = false;
     swal({
       type: "error",
       text: "Sales Person not confirmed! Confirm one"
     })
   }
   if (!ok) {
     return false;
   }*/
/*   if ($("#showroom").attr("confirmed") != "yes") {
     ok = false;
     swal({
       type: "error",
       text: "Showroom not confirmed! Confirm one"
     })
   }
   if (!ok) {
     return false;
   }*/
   if ($("#customerForm").attr("confirmed") != "yes") {
     ok = false;
     swal({
       type: "error",
       text: "Confirm customer data."
     }).then((result) => {
       $("#customer").appendTo("body").modal("show");
     })
   }
   if (!ok) {
     return false;
   }
  loadedPages.invoice.mail();
 },
 addPayment: function() {
   var tr = $("#master").clone();
   $("#paymentsTable").find("tbody").find("tr:last").remove();
   tr.appendTo($("#paymentsTable").find("tbody"));
   $("#paymentsTable").find("tbody").find("tr:last").find("select").eq(0).val("1");
   $("#paymentsTable").find("tbody").find("tr:last").find("select").eq(0).prop("disabled", false);
   $("#paymentsTable").find("tbody").find("tr:last").find("input").prop("disabled", false);
   $("#paymentsTable").find("tbody").find("tr:last").find("i").show();
   var tp = 0;

   $.each($("#paymentsTable").find("tbody").find("tr"), function() {
     if ($(this).find("select").eq(0).val() == "7") {
       $(this).remove();
     }
   })
   $.each($("#paymentsTable").find("tbody").find("tr").not(":last"), function(ind) {
     if (ind > 0) {
       if ($(this).find("input").length > 0) {

         if ($(this).find("select").eq(0).val() != "7") {
             var thenum = $(this).find("input").val().replace( /^\D+/g, '');
             var n = thenum.replace(/\./g, "");
            tp += parseFloat(n);
          }
      }
     }
   })


   var tpp = parseFloat($("[invoicedue]").attr("realvalue"));
    $("#paymentsTable").find("tbody").find("tr:last").find("input").val(parseFloat(tpp - tp).toLocaleString("nl-NL",{ style: 'currency', currency: "EUR" }));
   loadedPages.invoice.calculatePayments();
 },
 deleteRow: function(obj) {
   var tr = $(obj).closest("tr");
   swal({
     type: "question",
     html: tr.parent().find("[productdata]").find("td").eq(0).html() + "<br /><span>Remove </span>" + tr.parent().find("[productdata]").find("td").eq(1).html() + " <span>from invoice?</span>",

     showCancelButton: true,
     allowOutsideClick: false,
     allowEscapeKey: false,
     showConfirmButton: true
   }).then((result) => {
     if (result.value) {
       tr.prev("[productdata]").remove();
       tr.remove();

       if ($("[invoicedata]").length == 0) {
         $("#toggleShoppigCart").addClass("empty");
       } else {
         $("#lblCartCount").html(" " + $("[invoicedata]").length + " ");
       }
       loadedPages.invoice.recalculateInvoice();
     }
   })

 },
 deletePayment: function(obj) {
   var tr = $(obj).closest("tr");
   swal({
     type: "question",
     text: "Remove this payment?",
     showCancelButton: true,
     allowOutsideClick: false,
     allowEscapeKey: false,
     showConfirmButton: true
   }).then((result) => {
     if (result.value) {
       tr.remove();
       loadedPages.invoice.calculatePayments();
     }
   })
 },
 fromCatalog: function(id) {
   var obj = {
     ItemID: id
   }

   api.call("getProductByItemID", function(res) {
     if (res[0] == undefined) {
       swal({
         type: 'error',
         text: "No product with this id."
       })
     } else {
       addToInvoice(res[0]);
    }
   }, obj, {})
 },
 hideCatalog: function() {

   $.LoadingOverlay("hide");
   if (loadedPages.diamonds.search.itemid !== undefined) {
     findID(loadedPages.diamonds.search.itemid);
   }
 },
 goToTours: function() {
   if ($("[invoicedata]").length == 0) {
     swal({
       type: "warning",
       text: "No items in invoice."
     })
     return false;
   } else {
     $("#tours").html("");
     var obj ={
       EmplID: loadedPages.invoice.salePerson.EmplID
     }
     api_csv.call("salespersons", function(res) {
       var em = {};
       $.each(res.data, function() {
         em[this.EmplID] = {Employee: this.Employee};
       })

       api.call("getSPTours", function(res) {
         $.each(res, function() {
           $("<div class='project' project='" + this.ProjId + "' style='display:inline-block;width:auto;padding:3px;border:1px solid black;margin-left: 5px;margin-bottom:5px;'>" + this.AVisitDateTime.split(" ")[1] + " <b>" + ((em[this.GuideID] === undefined) ? "" : em[this.GuideID].Employee) + "</b> " + ((this.PrivateID != '') ? "Private " : "Group ") + this.ProjId + " " + this.ProjName + " " + this.language + " (" + this.PAX + ")</div>").appendTo($("#tours"));
         })
         $(".project").bind("click", function(e) {
           var el = $(e.target);
           if (el.hasClass("selected")) {
             el.removeClass("selected");
           } else {
             $(".project").removeClass("selected");
             el.addClass("selected");
           }
         })
        loadedPages.invoice.goToNext();
       }, obj, {});
     }, {}, {});
   }
 },
 tryTours: function() {
   if ($(".project.selected").length == 0) {
     swal({
       type: "warning",
       text: "Select tour"
     })
     return false;
   } else {
     loadedPages.invoice.goToNext();
   }
 },
 goToNext: function() {
   loadedPages.invoice.currentStep++;
   $("[step]").hide();
   $("[stepid='" + loadedPages.invoice.currentStep + "']").show();
   if ($("[stepid='4']").is(":visible")) {
     api.call("getPMethods", function(res) {
        $.each(res, function() {

          if (this.IsAdminCharge == "0" && this.IsVatRefund == "0") {
            $("<option value='" + this.PaymentID + "' iswwftcheck='" + this.IsWWFTCheck + "'>" + this.Payment + "</option>").appendTo($("#paymentMethods"));
            $("<option value='" + this.PaymentID + "' iswwftcheck='" + this.IsWWFTCheck + "'>" + this.Payment + "</option>").appendTo($("#paymentsTable").find("tbody").find("tr").eq(1).find("select").eq(0));

          } else {
            $("<option disabled value='" + this.PaymentID + "' iswwftcheck='" + this.IsWWFTCheck + "'>" + this.Payment + "</option>").appendTo($("#paymentMethods"));
            $("<option disabled value='" + this.PaymentID + "' iswwftcheck='" + this.IsWWFTCheck + "'>" + this.Payment + "</option>").appendTo($("#paymentsTable").find("tbody").find("tr").eq(1).find("select").eq(0));

            if (this.IsAdminCharge != "0") {
              loadedPages.invoice.adminChargeID = this.PaymentID;
            }
            if (this.IsVatRefund != "0") {
              loadedPages.invoice.vatRefundID = this.PaymentID;
            }
          }
        })
        $("#paymentsTable").find("tbody").find("tr").eq(1).find("select").val("1");
        loadedPages.invoice.calculatePayments();
         $("#currency").val("EUR");
         $("#currency").trigger("change");
         $("#invoiceBody").clone().appendTo($("#showInvoice"));
         $("#showInvoice").find("#invoiceBody").attr("id", "finalInvoiceBody");
         $("#finalInvoiceBody").find("input").prop("disabled", true);
         $("#finalInvoiceBody").find("i").remove();
         $("#finalInvoiceBody").find("tr:last").remove();
     }, {}, {});
   }
 },
 goToPrevious: function() {
   loadedPages.invoice.currentStep--;
   $("[step]").hide();
   $("[stepid='" + loadedPages.invoice.currentStep + "']").show();
 },
 toogleVAT: function() {

   if (!loadedPages.invoice.vatRefund) {
     var rct = 2100 / 121;
     var vl = $("[invoicedue]").attr("realvalue");
     var vt = (vl / 100) * rct;
     var wv = vl - vt;

     var att = ((vl / 100) * 1.35) * -1;
     $.each($("#paymentsTable").find("tbody").find("tr"), function(ind) {
       if (ind > 1) {
         $(this).remove();
       }
     });
     var tr = $("#master").clone();
     tr.attr("vat", "");
      tr.attr("id", "vatrefund");
     tr.find("select").eq(0).val(loadedPages.invoice.vatRefundID);
     $("#paymentsTable").find("tbody").find("tr:last").remove();
     tr.appendTo($("#paymentsTable").find("tbody"));
     $("#vatrefund").find("select").eq(0).prop("disabled", true);
     $("#vatrefund").find("select").eq(1).hide();
     $("#vatrefund").find("input").val(vt.toLocaleString("nl-NL",{ style: 'currency', currency: 'EUR' }));
     $("#vatrefund").find("input").prop("disabled", true);
     $("#vatrefund").find("i").hide();

     var tr = $("#master").clone();
     tr.find("select").eq(0).val(loadedPages.invoice.adminChargeID);
     tr.attr("vat", "");
     tr.attr("id", "administrative");
     tr.appendTo($("#paymentsTable").find("tbody"));
     $("#administrative").find("select").eq(0).prop("disabled", true);
     $("#administrative").find("select").eq(1).hide();
     $("#administrative").find("input").val(att.toLocaleString("nl-NL",{ style: 'currency', currency: 'EUR' }));
     $("#administrative").find("input").prop("disabled", true);
     $("#administrative").find("i").hide();

     var tp = 0;
     $.each($("#paymentsTable").find("tbody").find("tr"), function() {
       if ($(this).find("select").eq(0).val() == "7") {
         $(this).remove();
       }
     })
     $.each($("#paymentsTable").find("tbody").find("tr").not(":last"), function(ind) {
       if (ind > 0) {
         if ($(this).find("input").length > 0) {

           if ($(this).find("select").eq(0).val() != "7") {
               var thenum = $(this).find("input").val().replace( /^\D+/g, '');
               var n = thenum.replace(/\./g, "");
               n = n.replace(/\,/g, ".");
               tp += parseFloat(n);
            }
        }
       }
     })
     var tpp = parseFloat($("[invoicedue]").attr("realvalue"));
     loadedPages.invoice.calculatePayments();
     loadedPages.invoice.vatRefund = true;
   } else {
      $("#administrative").remove();
      $("#vatrefund").remove();
      loadedPages.invoice.calculatePayments();
      loadedPages.invoice.vatRefund = false;
   }
 },
 triggerCurrencyChange: function() {

   try {
   changeCurrency($("#currency").val());
 } catch(err) {
//   alert(err)
 }
 },
}

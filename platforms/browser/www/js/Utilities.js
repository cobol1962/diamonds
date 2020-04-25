function Utilities() {
  this.exportTableToPDF = function(table, title, thead = 1) {

    var items = [];
    var rw = [];
    var vcl = [];
    var wdt = [];
    var tr = $(table.table().header()).find("tr").eq(thead);
    $.each($(tr).find("th"), function(ind) {
      if ($(this).is(":visible") && !this.hasAttribute("action")) {
        vcl.push(ind);
        wdt.push("auto");
        rw.push({
          text: $(this).text(),
          fontSize: 8
        })
      }
    })
    items.push(rw);
    table.rows( { search: 'applied' } ).every( function ( rowIdx, tableLoop, rowLoop ) {
      var node = this.node();
      if (true) {
        var node = this.node();
        var rw = [];

        $.each(vcl, function() {
          rw.push({
            text:$(node).find("td").eq(this).text(),
            fontSize: 8
          })
        });
        items.push(rw);
      }
    } );

     toDataURL('http://85.214.165.56:81/coster/www/images/logo.png', function(dataUrl) {

       var docDefinition = {
         pageSize: "A4",
         header: [

         ],
         content: [
           {
              margin: [207,0,10,0],
               image: dataUrl,

               width: 100

             },
             {text: title, alignment: "center", margin: [0, 20,0,20]},
             { table: {
                 margin: [0,20,10,0],
                headerRows: 1,
                widths: wdt,
                body: items
              }
            }
           ]
         };
        var name = "export_" + (new Date()).getTime() + ".pdf";
         var pdfDocGenerator = pdfMake.createPdf(docDefinition);
         pdfDocGenerator.getBase64((data) => {
              var obj =  {
                   pdf: data,
                   name: name,
              }
               api.call("sendExport", function(res) {

                 window.open("http://85.214.165.56:81/api/exports/" + name, "_system");
               }, obj, {});
         });

     });

  }
}

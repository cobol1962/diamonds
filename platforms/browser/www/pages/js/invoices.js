loadedPages.invoices = {
  table: null,
  initialize: function() {
    var sp = $.parseJSON(localStorage.sp);
    
    this.table = $("#invoices").DataTable({
        ajax: {
            "url": "http://85.214.165.56:81/api/index.php?request=myinvoices",
             data : { salePersonId: sp.EmplID },
             type: "POST"
        },
         "order": [[ 0, "desc" ]],
        columns: [
             { "data": "date" },
             { "data": "invoiceid" },
            { "data": "tourNo" },
              { "data": "showroom" },
              { "data": "salesPerson" },
              { "data": "total" },
              { "data": "discount" },
              { data: "pdf",
                "defaultContent": "",
                "render": function ( data, type, row ) {
                  var cs = "loadedPages.invoices.openPDF('" + data + "');";
                    return '<a class="gen-link" href="#" onclick=' + cs + ' ><i class="fa fa-file-pdf-o fa-2x m-r-5"></i></a>&nbsp;&nbsp;<a class="gen-link" href="#" onclick="loadedPages.showrooms.delete(this);"><i class="fa fa-trash fa-2x m-r-5"></i></a>';
                }
              }
         ],
         dom: 'Bfrtip',
           buttons: [
             'colvis',
               {
                   text: 'Export to PDF',
                   action: function ( e, dt, node, config ) {
                      var utils = new(Utilities);
                       utils.exportTableToPDF(dt, "Invoices list");
                   }
               }
           ]
   });
   yadcf.init(this.table, [{
       column_number: 0,
       filter_container_id: "t_0"
   }, {
       column_number: 2,
       filter_container_id: "t_2"
   }, {
       column_number: 3,
       filter_container_id: "t_3"
      }, {
       column_number: 4,
       filter_container_id: "t_4"
   }, {
       column_number: 5,
       filter_container_id: "t_5"
   },

  ]);

 },
 openPDF: function(data) {
   alert(data)
   window.open("http://85.214.165.56:81/api/invoices/" + data, "_system");
 }
}

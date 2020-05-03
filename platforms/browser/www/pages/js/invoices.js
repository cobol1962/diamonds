loadedPages.invoices = {
  table: null,
  initialize: function() {
    var sp = $.parseJSON(localStorage.sp);

    loadedPages.invoices.table = $("#invoices").DataTable({
        ajax: {
            "url": "http://85.214.165.56:81/api/index.php?request=myinvoices",
             data : { salePersonId: sp.EmplID },
             type: "POST"
        },
         "order": [[ 0, "desc" ]],
          "paging": false,
           columns: [
             { "data": "date" ,
               "render" : function ( data, type, row )  {
              //   return moment(data).format("dd.mm.yyyy");
              return data;
               }},
             { "data": "invoiceid" },
               { "data": "customer" },
             { "data": "tourNo" },
             { "data": "touroperater" },
              { "data": "showroom" },
              { "data": "salesPerson" },
              { "data": "total",
               "defaultContent": "",
               "render": function ( data, type, row ) {
                  return parseFloat(data).toLocaleString("nl-NL",{ style: 'currency', currency: "EUR" });
              }},
              { "data": "discount"},
              { data: "pdf",
                "defaultContent": "",
                "render": function ( data, type, row ) {
                  var cs = "loadedPages.invoices.openPDF('" + data + "');";
                    return '<a class="gen-link" href="#" onclick=' + cs + ' ><i class="fa fa-file-pdf-o fa-2x m-r-5"></i></a>';
                }
              },
            { "data": "status"}

         ],
         dom: 'Bfrtip',
           buttons: [

           ],
           "drawCallback": function() {
             $.each($("#invoices").find("tr"), function() {
               if ($(this).find("td").eq(9).html() == "0") {
                 $(this).css({
                   color: "red"
                 })
               }
             })
           }
   });
   yadcf.init(this.table, [{
     column_number: 0,
         filter_type: "range_date",
         date_format: 'yyyy-mm-dd',
         moment_date_format: 'YYYY-MM-DD',
         filter_delay: 500
       },
       {
         column_number: 2,
         filter_type: "auto_complete",
         text_data_delimiter: ","
       },
       {
         column_number: 2,
         filter_type: "auto_complete",
         text_data_delimiter: ","
       },
       {
        column_number: 4,
         filter_type: "multi_select",
        select_type: 'select2'

    }
  ]);

 },
 openPDF: function(data) {
   window.open("http://85.214.165.56:81/api/invoices/" + data, "_system");
 }
}

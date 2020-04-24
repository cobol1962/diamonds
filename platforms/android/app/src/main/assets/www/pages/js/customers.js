loadedPages.customers = {
  table: null,
  initialize: function() {
    this.table = $("#customers").DataTable({
        ajax: {
            "url": "http://80.211.41.168/api/index.php?request=getCustomers"
        },
        columns: [
             { "data": "customerid" },
             { "data": "customerName" },
              { "data": "email" },
              { "data": "telephone" },
              { "data": "country" },
         ],
        dom: 'Bfrtip',
        buttons: [
          'colvis',
            {
                text: 'Export to PDF',
                action: function ( e, dt, node, config ) {
                   var utils = new(Utilities);
                    utils.exportTableToPDF(dt, "Customer list");
                }
            }
        ]
   });
   yadcf.init(this.table, [ {
       column_number: 1,
       filter_container_id: "t_1"
   }, {
       column_number: 2,
       filter_container_id: "t_2"
      }, {
       column_number: 3,
       filter_container_id: "t_3"
   }, {
       column_number: 4,
       filter_container_id: "t_4"
   },

  ]);
 },

}

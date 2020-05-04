loadedPages.customers = {
  table: null,
  initialize: function() {
      var sp = $.parseJSON(localStorage.sp);
    this.table = $("#customers").DataTable({
        ajax: {
            "url": "http://85.214.165.56:81/api/index.php?request=getCustomers",
            data : { salePersonId: sp.EmplID },
            type: "POST"
        },
        "paging": false,
        columns: [
             { "data": "customerid" },
             { "data": "name" },
              { "data": "email" },
              { "data": "country" },
              { "data": "countryCode" },
              { "data": "telephone" },
              { "data": "TourNo" },
              { "data": "touroperater" },
              { "data": "address1" }
         ],
        dom: 'Bfrtip',
        buttons: [

        ]
   });
   yadcf.init(this.table, [ {
       column_number: 1,
       filter_type: "auto_complete",
       text_data_delimiter: ",",
         filter_container_id: "t_1"
   }, {
       column_number: 2,
       filter_type: "auto_complete",
       text_data_delimiter: ",",
         filter_container_id: "t_2"
      }, {
       column_number: 3,
       filter_container_id: "t_3"
   }, {
       column_number: 4,
       filter_container_id: "t_4"
   },
   {
      column_number: 5,
      filter_type: "auto_complete",
      text_data_delimiter: ",",
      filter_container_id: "t_5"
  },
    {
       column_number: 6,
       filter_type: "auto_complete",
       text_data_delimiter: ",",
       filter_container_id: "t_6"
   },


   {
    column_number: 7,
     filter_type: "multi_select",
    select_type: 'select2',
      filter_container_id: "t_7"

    },
    {
       column_number: 8,
       filter_type: "auto_complete",
       text_data_delimiter: ",",
         filter_container_id: "t_8"
      },
  ]);
 },

}

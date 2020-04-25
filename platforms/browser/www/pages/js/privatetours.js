loadedPages.privatetours = {
  table: null,
  initialize: function() {
    this.table = $("#privatetours").DataTable({
        ajax: {
            "url": "http://80.211.41.168:5000/?privatetours"
        },

        columns: [
             { "data": "DateTime" },
             { "data": "tourid" },
             { "data": "LastName" },
            { "data": "FirstName" },
            { "data": "Nationality" },
              { "data": "Visitors" },
            { "data": "SalesPerson" },
              { "data": "Showroom" },
         ],
             "order": [[ 0, "desc" ]],
        dom: 'Bfrtip',
        buttons: [
          'colvis',
            {
                text: 'Export to PDF',
                action: function ( e, dt, node, config ) {
                   var utils = new(Utilities);
                    utils.exportTableToPDF(dt, "Private Tours list");
                }
            }
        ]
   });
   yadcf.init(this.table, [ {
       column_number: 0,
       filter_container_id: "t_0"
   }, {
       column_number: 1,
       filter_container_id: "t_1"
     },
     {
         column_number: 3,
         filter_container_id: "t_3"
      },
      {
          column_number: 2,
          filter_container_id: "t_2"
       },
       {
           column_number: 4,
           filter_container_id: "t_4"
        },
        {
            column_number: 6,
            filter_container_id: "t_5"
         },
         {
             column_number: 6,
             filter_container_id: "t_6"
          },
          {
              column_number: 6,
              filter_container_id: "t_7"
           },
           {
               column_number: 6,
               filter_container_id: "t_8"
            }
  ]);
 },

 save: function() {
   var obj = {
    name: $("#roomname").val()
   }

   api.call("insertRoom", function(res) {
     $("#addShowRoom").modal("hide");
     loadedPages.showrooms.table.ajax.reload( null, false );
   }, obj, {});
 },
 edit: function(id) {
  $.ajax({
    url: "http://80.211.41.168/coasterdiamonds/api/getShowRooms",
    type: "POST",
    dataType: "json",
    data: {
      showroomid: id
    },
    success: function(res) {
      $("#editShowroom").attr("showroomid", id);
      $("#nameedit").val(res.data[0].name);
      $("#editShowroom").modal("show");
    }
  })
},
update : function(id) {
    var obj = {
      showroomid: $("#editShowroom").attr("showroomid"),
      name: $("#nameedit").val()
    }
    api.call("updateShowRoom", function(res) {
      $("#editShowroom").modal("hide");
      loadedPages.showrooms.table.ajax.reload( null, false );
    }, obj, {});

 },
 delete: function(obj) {
   var nm = $(obj).closest("tr").find("td").eq(1).html();
   var id = $(obj).closest("tr").find("td").eq(0).html();
   swal({
     type: "question",
     text: "Remove " + nm + "?",
     showCancelButton: true,
     allowOutsideClick: false,
     allowEscapeKey: false,
     allowEnterKey: false,
     showLoading: true
   }).then((result) => {
     if (result.value) {
       var obj = {
         showroomid:id
       }
       api.call("deleteShowroom", function(res) {
         loadedPages.showrooms.table.ajax.reload( null, false );
       }, obj, {});
     }
   })
 }
}

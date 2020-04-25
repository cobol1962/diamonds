loadedPages.tours = {
  table: null,
  backtocart: false,
  initialize: function(backtocart = false) {
    loadedPages.tours.backtocart = backtocart;
    $("#shoppingCart").modal("hide");
     var oTable = $("#tours").DataTable({
        ajax: {
            "url": "http://85.214.165.56:81/api/index.php?request=getTours", 

        },
        info: false,
        columns: [

            { "data": "AVisitDateTime",
                "render": function ( data, type, row ) {
                  var dt = new Date(data);
                  return  type === 'sort' ? data : moment(dt).format("DD/MM HH:mm");
                }
            },
             { "data": "ProjId" },
              { "data": "PAX" },
             { "data": "country",
               "render": function ( data, type, row ) {
                 console.log(row)
                 return "<span style='max-width:100%;'><b>" + row["touroperater"] + "</b></span><br />" + data;
               }
            },
             { "data": "touroperater" },

         ],
        dom: 'Bfrtip',
        "order": [[ 0, "desc" ]],
        buttons: [

        ],

   });
   this.table = oTable;
   setTimeout(function() {
       if (localStorage.tour !== undefined) {
         var data = $.parseJSON(localStorage.tour);
         $('#'+ data.DT_RowId).addClass("selected");
         if (loadedPages.tours.backtocart) {
           $("#confirmTour").show();
          }
       }
     }, 2000);

   setTimeout(function() {

     yadcf.init(loadedPages.tours.table, [
     {
       style_class: "form-control",
        filter_container_id: "filter_date",
        filter_type: "text",
         column_number: 0,
     },
     {
       style_class: "form-control",
         filter_container_id: "filter_nationality",
         column_number: 3,
         filter_type: "multi_select",
         select_type: 'select2'
     },
     {
       style_class: "form-control",
         filter_container_id: "filter_operator",
         column_number: 4,
         filter_type: "multi_select",
         select_type: 'select2'
     },
   ]);

   $("#filters_temp").appendTo($("#filters_body"));
   $("#filters_temp").css({
     visibility: "visible"
   })
 }, 2000);
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
 },
 checkOpenCart:function() {
   if (loadedPages.tours.backtocart) {
     $("#shoppingCart").modal("show");
   }
 }
}

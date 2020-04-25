loadedPages.showrooms = {
  table: null,
  initialize: function() {
    this.table = $("#showrooms").DataTable({
        ajax: {
            "url": "http://80.211.41.168:5000/?showrooms"
        },
        columns: [
             { "data": "showroomid" },
             { "data": "name" },

         ],
        dom: 'Bfrtip',
        buttons: [   

        ]
   });
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

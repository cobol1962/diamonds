loadedPages.salespersons = {
  table: null,
  initialize: function() {
    $("#content").css({
      top: 250
    })
    this.table = $("#salespersons").DataTable({

        ajax: {
            "url": "http://80.211.41.168:5000/?salespersons"
        },
        columns: [
             { "data": "EmplID" },
             { "data": "Employee" },
             { data: "AreaID"},
              { data: "AreaName"},

         ]

   });
 },
 save: function() {
   var obj = {
    name: $("#salespersonname").val()
   }

   api.call("insertSalesPerson", function(res) {
     $("#addSalesPerson").modal("hide");
     loadedPages.salespersons.table.ajax.reload( null, false );
   }, obj, {});
 },
 edit: function(id) {
  $.ajax({
    url: "http://80.211.41.168/coasterdiamonds/api/getSalespersons",
    type: "POST",
    dataType: "json",
    data: {
      salepersonid: id
    },
    success: function(res) {
      $("#editSalesperson").attr("salepersonid", id);
      $("#snameedit").val(res.data[0].name);
      $("#editSalesperson").modal("show");
    }
  })
},
update : function(id) {
    var obj = {
      salepersonid: $("#editSalesperson").attr("salepersonid"),
      name: $("#snameedit").val()
    }
    api.call("updateSalesperson", function(res) {
      $("#editSalesperson").modal("hide");
      loadedPages.salespersons.table.ajax.reload( null, false );
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
         salepersonid:id
       }
       api.call("deleteSalesperson", function(res) {
         loadedPages.salespersons.table.ajax.reload( null, false );
       }, obj, {});
     }
   })
 }
}

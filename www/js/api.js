api = {
        call: function(endpoint, cb, params, ajaxExtend, type = "POST") {
      //      $.LoadingOverlay("show");
            cb = cb || function(res) {};
            params = params || {};
            ajaxExtend = ajaxExtend || {};

            // Extend the data object load sent with API Ajax request.
            var data = {};
      //      data.access_token = (localStorage.access_token !== undefined) ? localStorage.access_token : "";
             for (var prop in params) {
                if (params.hasOwnProperty(prop)) {
                 data[prop] = params[prop];
                }
              }

                   var apiAjax = {
                     type: "POST",
                     dataType: "json",
                     async: false,
                     data: data,
                    success: function(res) {
                       cb(res);
                     },
                    error: function(e) {
                      console.log(e);
                    }
                  };

              apiAjax.url = "http://85.214.165.56:81/api/index.php?request=" + endpoint;
              alert(apiAjax.url)

              for (var prop in ajaxExtend) {
                if (ajaxExtend.hasOwnProperty(prop)) {
                  apiAjax[prop] = ajaxExtend[prop];
                }
              }
              $.ajax(apiAjax).fail(function(jqXHR, textStatus, errorThrown) {

                var res = {
                  status: "fail",
                  type: "Server error",
                  endpoint: endpoint,
                  xr: JSON.stringify(jqXHR),
                  td: JSON.stringify(textStatus),
                  err: JSON.stringify(errorThrown)
                }
                cb(res);
              });
        },
        isEmpty: function(obj) {
          for(var key in obj) {
            if(obj.hasOwnProperty(key))
              return false;
          }
          return true;
    }
}

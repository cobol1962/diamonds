CommunityApp.dataAccess = (function () {

    var callService = function (options, controlId, emptyMessageHtml, showLoading, processData, contentType, failureCallback) {

        var settings = {
            url: options.url,
            type: options.requestType,
            data: options.data,
            dataType: options.dataType,
            cache: false,
            processData: processData,
            contentType: contentType,
            tryCount: 0,
            retryLimit: 3,
            beforeSend: function (xhr) {
                if (typeof options.httpHeader !== 'undefined' && typeof options.headerValue !== 'undefined') {
                    $.each(options.httpHeader, function (index, key) {
                        xhr.setRequestHeader(key, options.headerValue[index]);
                    });
                }

                if (showLoading !== null && showLoading === false) {
                    var application = CommunityApp.main.getKendoApplication();
                    if (application && application !== null && application.pane) {
                        application.hideLoading();
                    }
                }
            },
            success: function (resultData, status, xhr) {

                var response = {
                    success: resultData !== null? resultData.IsSuccessful : false,
                    data: resultData
                };

                if (options.callBack)
                    options.callBack(response, options.sender);

                if ((resultData === null || resultData.length <= 0 || (resultData.Items && resultData.Items.length <= 0)) && controlId && emptyMessageHtml) {
                    $("#" + controlId).html(emptyMessageHtml);
                }
            },
            error: function (xhr, status, errorThrown) {
                switch (xhr.status) {
                    case 401:
                        //CommunityApp.userAccount.viewModel.logOff();
                        break;
                    case 500:
                        console.error("server app error 500: " + errorThrown);
                        break;
                    default:
                        console.error("server error: " + errorThrown);
                        break;
                }

                if (failureCallback && failureCallback !== null)
                {
                    failureCallback();
                }


                var result = { success: false, status: xhr.status, settings: settings };

                if (options.callBack)
                    options.callBack(result, options.sender);
            }
        };

        $.ajax(settings);
    };

    return {
        callService: callService
    };
})();

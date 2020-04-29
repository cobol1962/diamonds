var customerSession = null;

var ws = null;

function ReconnectingWebSocket() {
    var u = $.parseJSON(localStorage.sp);

    var url = "85.214.165.56:4000/?custid=" + u.EmplID;

    this.debug = false;
    this.reconnectInterval = 1000;
    this.timeoutInterval = 5000;
    this.redirectInterval = null;
	this.uid = localStorage.uid;
    var self = this;
    var ws;
    var forcedClose = false;
    var timedOut = false;
    this.url = url;
    this.readyState = WebSocket.CONNECTING;
    this.URL = url; // Public API
	   this.refreshUserTimeout = null;

    this.onopen = function () {

        var reconnect = false;
        if (url.indexOf("?reconnect=") > -1) {
            reconnect = true;
        }
        url = ('https:' == document.location.protocol ? 'wss://' : 'ws://') + "85.214.165.56:4000/?custid=" + u.EmplID;

    }


    this.onclose = function (e) {
		//ws.send("remove#" + localStorage.uid );

    };

    this.onconnecting = function (e) {
    };

    this.onmessage = function (e) {
      var obj = $.parseJSON(e.data);
      var app = document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1;
      if (obj.action == "update" && app) {

        showModal({
          title: "Aplication updated. Click to update application.",
          showCloseButton: false,
          confirmButtonText: "UPDATE",
          cancelButtonText: "NOT NOW",
          confirmCallback: function() {
            var downloadFile = function(fileSystem) {
             var localPath = fileSystem.root.toURL() + 'download/new-android.apk',
             fileTransfer = new FileTransfer();
             fileTransfer.download("http://85.214.165.56:81/coster/DataServer/salesapp.apk", localPath, function(entry) {
                 window.plugins.webintent.startActivity({
                     action: window.plugins.webintent.ACTION_VIEW,
                     url: localPath,
                     type: 'application/vnd.android.package-archive'
                 }, function() {}, function(e) {
                     alert("Failed to update the app!");
                     if (callBack && callBack !== null) {
                       //  callBack();
                     }
                 });
             }, function(error) {
                 alert("Error downloading the latest updates! - error: " + JSON.stringify(error));
                 if (callBack && callBack !== null) {
                   //  callBack();
                 }
             });

           }
          }
        })
      }
    };


    this.onerror = function (e) {

    };

    function connect(reconnectAttempt, reconnect) {

        if (reconnect) {
            if (url.indexOf("&reconnect=yes") == -1) {

            }

        } else {
            url = ('https:' == document.location.protocol ? 'wss://' : 'ws://') + "85.214.165.56:4000/?custid=" + u.EmplID;
        }
        ws = new WebSocket(url, this.protocols);

        self.onconnecting();

        var localWs = ws;
        var timeout = setInterval(function () {
            try {
                timedOut = true;
                localWs.close();
                timedOut = false;
                clearInterval(timeout);
            } catch (Error) {

            }
        }, self.timeoutInterval);

        ws.onopen = function (event) {
            clearTimeout(timeout);

            self.readyState = WebSocket.OPEN;
            reconnectAttempt = false;
            self.onopen(event);
        };

        ws.onclose = function (event) {
            clearTimeout(timeout);
            ws = null;
            if (forcedClose) {
                self.readyState = WebSocket.CLOSED;
                self.onclose(event);
            } else {
                self.readyState = WebSocket.CONNECTING;
                self.onconnecting();
                if (!reconnectAttempt && !timedOut) {

                    self.onclose(event);
                }
                setTimeout(function () {
                    connect(true, true);
                }, self.reconnectInterval);
            }
        };
        ws.onmessage = function (event) {
            self.onmessage(event);
        };
        ws.onerror = function (event) {

            clearInterval(self.redirectInterval);
            self.redirectInterval = null;
        };
    }
    connect(url, false);

    this.send = function (data) {

        if (ws) {
            return ws.send(data);
            return true;
        } else {
            var sd = setInterval(function () {
                if (ws) {

                    clearInterval(sd);
                    return ws.send(data);
                }
            }, 500);
        }
    };
    this.close = function () {

        forcedClose = true;
        if (ws) {
            console.log('ws close');
            ws.close();
        }
    };

    this.logout = function () {

        if (self.redirectInterval != null) {
        }
        clearInterval(self.redirectInterval);
    };

    /**
     * Additional public API method to refresh the connection if still open (close, re-open).
     * For example, if the app suspects bad data / missed heart beats, it can try to refresh.
     */
    this.refresh = function () {
        if (ws) {
            ws.close();
        }
    };
}

/**
 * Setting this to true is the equivalent of setting all instances of ReconnectingWebSocket.debug to true.
 */
ReconnectingWebSocket.debugAll = false;

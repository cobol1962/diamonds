const {  google } = require('googleapis');
const axios = require('axios');
var request = require('request');
var credentials = require('./CosterDiamonds-ec307db30e71.json');
const imageThumbnail = require('image-thumbnail');
var https = require('http');
var urlo = require('url');
var request = require('request');
var dateFormat = require('dateformat');
var fs = require("fs");
const readline = require("readline");
const SCOPES = ["https://www.googleapis.com/auth/drive"];
const { exec } = require("child_process");
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = "token.json";
console.log("????")
getImagesList();
var cron = require('node-cron');

cron.schedule("* 1 * * *", function() {
    getImagesList();
});
function authorize(credentials, callback) {
    const {
        client_secret,
        client_id,
        redirect_uris
    } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
        client_id,
        client_secret,
        redirect_uris[0]
    );

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) return getNewToken(oAuth2Client, callback);
        oAuth2Client.setCredentials(JSON.parse(token));
        callback(oAuth2Client);
    });
}

function getNewToken(oAuth2Client, callback) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: "offline",
        scope: SCOPES
    });
    console.log("Authorize this app by visiting this url:", authUrl);
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.question("Enter the code from that page here: ", code => {
        rl.close();
        oAuth2Client.getToken(code, (err, token) => {
            if (err) return console.error("Error retrieving access token", err);
            oAuth2Client.setCredentials(token);
            // Store the token to disk for later program executions
            fs.writeFile(TOKEN_PATH, JSON.stringify(token), error => {
                if (error) return console.error(error);
                console.log("Token stored to", TOKEN_PATH);
            });
            callback(oAuth2Client);
        });
    });
}


function getImagesList() {
  icompl = false;
  var files = getFilesList();
  var ww = setInterval(function() {
    if (icompl && f.length > 0) {
      clearInterval(ww);
      updateImages(f);

    }
  }, 100)
}
function updateImages(images, i = 0) {
  if (i > (images.length - 1)) {
    return;
  }
  fs.readFile("credentials.json", (err, content) => {
    if (err) return console.log("Error loading client secret file:", err);
    // Authorize a client with credentials, then call the Gmail API.
    authorize(JSON.parse(content), function (auth) {
      const drive = google.drive({version: 'v3',  auth});
      img = images[i];
      try {

    } catch(err) {
      return;
    }

            var request = drive.files.get({
               fileId: img.id,
               alt: 'media'
             },
             {
               responseType: 'arraybuffer',
               encoding: null
             }, function(err, response) {
                if (err) {

                    //handle the error
                } else {
                    var imageType = response.headers['content-type'];
                    var base64 = new Buffer(response.data, 'utf8').toString('base64');
                    var dataURI = 'data:' + imageType + ';base64,' + base64;
                    require("fs").writeFile("/var/www/html/catalog/images/" + img.name, base64, 'base64', (err)  => {
                      if (err) {
                        i++;
                        updateImages(images, i);
                      } // writes out file without error, but it's not a valid image
                      var options = { width: 250, responseType: 'base64' };
                      imageThumbnail("/var/www/html/catalog/images/" + img.name, options)
                          .then(thumbnail => {
                              require("fs").writeFileSync("/var/www/html/catalog/images/" + img.name, thumbnail, 'base64', function(err) {
                                console.log(err); // writes out file without error, but it's not a valid image

                              });
                                i++;
                                updateImages(images, i);

                           })
                          .catch(err => {
                            i++;
                            updateImages(images, i);
                          });
                    });

                }
            });

     });
   });
}
var f = [];
var icompl = false;
function getFilesList(nextPage = "") {
  if (nextPage == "") {
    f = [];
  }

  fs.readFile("credentials.json", (err, content) => {
    if (err) return console.log("Error loading client secret file:", err);
    authorize(JSON.parse(content), function (auth) {
      const drive = google.drive({version: 'v3',  auth});
      var fileId = '1hekaFBr9wdfLlzKBmveUYMM6tHiokobc';
        drive.files.list({
            includeRemoved: false,
            spaces: 'drive',
            fileId: fileId,
            pageToken: nextPage,
            pageSize: 1000,
            fields: 'nextPageToken, files(id, name, mimeType)'

      }, function (err, response) {
           response.data.files.forEach((file) => {

             if (file.mimeType.indexOf("image/") == 0) {
               f.push(file);
             }
           });
           if (response.data.nextPageToken) {
             getFilesList(response.data.nextPageToken);
           } else {
             icompl = true;
             console.log(f.length);
             return f;
           }
        });
    });
  });
}

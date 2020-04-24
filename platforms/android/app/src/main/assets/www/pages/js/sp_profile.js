loadedPages.sp_profile = {
  sp: {},
  cameraOptions: {},
  initialize: function() {
    if (navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry|IEMobile)/) == null) {
      $("#setAvatarCamera").hide();
    }
    this.sp = $.parseJSON(localStorage.sp);
    try {
        loadedPages.sp_profile.camearaOptions = {
            quality: 75,
            destinationType: Camera.DestinationType.DATA_URL,
            sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
            allowEdit: false,
            mediaType: Camera.MediaType.PICTURE,
            encodingType: Camera.EncodingType.JPG,
            targetWidth: $(window).width(),
            popoverOptions: CameraPopoverOptions,
            saveToPhotoAlbum: true,
            correctOrientation: true,
            cameraDirection: Camera.Direction.BACK
        };
    } catch(err) {

    }
    $("#picture_avatar").attr("src", ((this.sp.image.indexOf("profile.png") == -1) ? this.sp.image : "/images/profile_black.png"));
    $('#images_avatar').on('change', function() {
          if (this.files[0].size > 11024152) {
            swal({
              type: "error",
              title: "Error",
              showCancelButton: false,
              text: "Max allowed size is 1MB"
            });

            return false;
          }

          var reader = new FileReader();
          reader.onload = function(e) {

            $("#picture_container_avatar").hide();
            $("#croppie_container_avatar").show();
            $("#setHeader").hide();

            $image_crop_avatar.croppie('bind', {
              type: 'canvas',
              size: 'viewport',
              url: e.target.result
            }).then(function() {
              $("#saveAvatar").show();
              $("#cancelAvatar").show();
              $("#resetAvatar").hide();
              $("#setAvatar").hide();
            });
          }
          reader.readAsDataURL(this.files[0]);
    });
    $('#saveAvatar').on('click', function(ev) {
      	$image_crop_avatar.croppie('result', {
    			type: 'canvas',
    			size: 'viewport'
    		}).then(function(response) {
          var obj = {
            salepersonid: loadedPages.sp_profile.sp.EmplID,
            image: response
          }
          api.call("updateSPData", function(res) {
            $("#picture_avatar").attr("src",response);
            localStorage.sp.image = response;
            $("[avatar]").attr("src", response);
            $("#picture_container_avatar").show();
            $("#croppie_container_avatar").hide();
            $("#saveAvatar").hide();
            $("#cancelAvatar").hide();
            $("#resetAvatar").show();
            $("#setAvatar").show();
          }, obj, {}, {})
		     });
    });

  	$image_crop_avatar = $('#upload_avatar').croppie({
    		enableExif: true,
    		enableResize: false,
    		viewport: {
    			width: 70,
    			height: 70,
    			 type: 'circle',
    		},
    		boundary: {
    			width: 200,
    			height: 200
    		}
  	});
    $.validator.addMethod("isOldPass", function(value, element) {
      return (element.value == loadedPages.sp_profile.sp.password);
    }, "Please enter old password");
    $( "#changePassword" ).validate({
      rules: {
        oldPwd: {
          required: true,
          isOldPass: true
        },
        newPwd: {
          required: true,
          maxlength : 10,
          minlength : 6
        },
        cnfPwd: {
          required: true,
          equalTo: "#newPwd",
          maxlength : 10,
          minlength : 6
        }
      },
      submitHandler: function(form) {
        var obj = {
          salepersonid: loadedPages.sp_profile.sp.EmplID,
          password: $("#newPwd").val()
        }
        api.call("updateSPData", function(res) {
          loadedPages.sp_profile.sp.password = $("#newPwd").val();
          swal({
              type: "success",
              text: "Password succesfully changed. You can log in next time using this new one."
          })
        }, obj, {}, {})
      }
    });
  },
  cancelAvatar: function() {
     	$("#picture_header").attr("src", localStorage.avatar);

     	$("#picture_container_avatar").show();
     	$("#croppie_container_avatar").hide();
     	$("#saveAvatar").hide();
     	$("#cancelAvatar").hide();
     	$("#resetAvatar").show();
     	$("#setAvatar").show();
  },
  resetAvatar: function() {
    var obj = {
      salepersonid: loadedPages.sp_profile.sp.EmplID,
      image: ""
    }
    api.call("updateSPData", function(res) {
      $("#picture_avatar").attr("src","images/profile_black.png");
      localStorage.sp.image = "";
      $("[avatar]").attr("src", "images/profile_black.png");
      $("#picture_container_avatar").show();
      $("#croppie_container_avatar").hide();
      $("#saveAvatar").hide();
      $("#cancelAvatar").hide();
      $("#resetAvatar").show();
      $("#setAvatar").show();
    }, obj, {}, {})

  },
  uploadCamera: function() {
    loadedPages.sp_profile.camearaOptions.sourceType = Camera.PictureSourceType.CAMERA;
    loadedPages.sp_profile.getImage();
  },
  uploadBrowse: function() {
    if (navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry|IEMobile)/) != null) {
      loadedPages.sp_profile.camearaOptions.sourceType = Camera.PictureSourceType.PHOTOLIBRARY;
      loadedPages.sp_profile.getImage();
    } else {
      $("#images_avatar").trigger("click");
    }
  },
  getImage: function() {
    try {
     navigator.camera.getPicture(loadedPages.sp_profile.uploadPhoto, loadedPages.sp_profile.onError, loadedPages.sp_profile.camearaOptions);
    } catch(err) {
    }
  },
  uploadPhoto: function(imageURI, message, height) {
    imageURI = "data:image/jpg;base64," + imageURI;
    $("#picture_container_avatar").hide();
    $("#croppie_container_avatar").show();
    $("#setHeader").hide();
    $image_crop_avatar.croppie('bind', {
      url: imageURI
    }).then(function() {
      $("#saveAvatar").show();
      $("#cancelAvatar").show();
      $("#resetAvatar").hide();
      $("#setAvatar").hide();
    });
  },
  onError: function() {
    swal({
      type: "error",
      text: "No Image selected/captured."
    })
  }

}

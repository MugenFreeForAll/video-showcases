<!----------------------------------------------------- JAVASCRIPT -->
<script>(function(){





//__________.__________.__________/ INITIALIZE
//
//__________/ dom loaded, run this
window.onload = initializeEverything();
function initializeEverything() {

  //__________/ hide the mod cp, and the user interface message area
  $("#userInterfaceAreaContainerMessage").css("display","none");
  $("#modAreaContainer").css("display","none");

  //__________/ check for customizations
  google.script.run
    .withSuccessHandler(gotUICustomization)
    .getUICustomization();
  function gotUICustomization(returnedCustomSettings) {
    var uiSize_small = returnedCustomSettings.uiSize_small;
    var uiColor_custom = returnedCustomSettings.uiColor_custom;
    var uiColor_bgDark = returnedCustomSettings.uiColor_bgDark;
    var uiColor_bgMedium = returnedCustomSettings.uiColor_bgMedium;
    var uiColor_bgLight = returnedCustomSettings.uiColor_bgLight;
    var uiColor_text = returnedCustomSettings.uiColor_text;

    //__________/ adjust colors of user interface
    if (uiColor_custom == "yes") {

      $("#titleAreaContainer").css("background", uiColor_bgLight)
      $("#linkToYouTubeVideo").css("background", uiColor_bgDark)
      $("#modAreaContainer").css("background", uiColor_bgDark)
      $("#userInterfaceAreaContainer").css("background", uiColor_bgMedium)
      $("#userInterfaceAreaContainerMessage").css("background", uiColor_bgMedium)
      $("#titleShowcaseWord").css("color", uiColor_text)

      //__________/ add a new stylesheet, so it applies to dynamically loaded content
      var theNewStyleSheet = $('<style></style>');
      var newStylesSheetAdditions = "";
      newStylesSheetAdditions += ".modPanelVideoItem {";
      newStylesSheetAdditions += "  background-color:" + uiColor_bgMedium + ";";
      newStylesSheetAdditions += "  }";
      newStylesSheetAdditions += ".modPanelVideoItem:hover,";
      newStylesSheetAdditions += ".modCPSelectedVideo {";
      newStylesSheetAdditions += "  background-color:" + uiColor_bgLight + ";";
      newStylesSheetAdditions += "  }";
      newStylesSheetAdditions += "#addYourVideoButton {";
      newStylesSheetAdditions += "  color:" + uiColor_text + ";";
      newStylesSheetAdditions += "  }";
      newStylesSheetAdditions += "#linkToYouTubeVideo {";
      newStylesSheetAdditions += "  border-color:" + uiColor_bgMedium + ";";
      newStylesSheetAdditions += "  }";
      newStylesSheetAdditions += "#linkToYouTubeVideo:focus {";
      newStylesSheetAdditions += "  border-color:" + uiColor_bgLight + ";";
      newStylesSheetAdditions += "  }";
      $('head').append(theNewStyleSheet);
      theNewStyleSheet.append(newStylesSheetAdditions);
    }

    //__________/ custom - small player
    if (uiSize_small == "yes") {
      $("#outerContainer").css("max-width", "320px")
      $("#titleIconArea").css("display", "none")
      $("#titleShowcaseWord").css("display", "none")
      $("#linkToYouTubeVideo").css("width", "180px")
      $("#modButtonContainer").css("flex-direction", "row")
      $("#modButtonContainer").css("width", "60px")
    }

    return "end point";
  }

  //__________/ run a flood control check, and see if they're logged in
  google.script.run
    .withSuccessHandler(floodControlCheck_success)
    .floodControlCheck();
  function floodControlCheck_success(timeLeftToWait_message) {

    //__________/ if caught by flood control, hijack the "not logged in" message with a flood control message
    if (timeLeftToWait_message) {
      var floodControlHtml = "";
      floodControlHtml += '<div id="notLoggedInMessageContainer">';
      floodControlHtml += '<div id="notLoggedInMessage">';
      floodControlHtml += timeLeftToWait_message;
      floodControlHtml += '</div>';
      floodControlHtml += '<label id="closerAddYourVideoFormX" for="addYourVideoToggle"><i class="fa fa-times"></i></label>';
      floodControlHtml += '</div>';
      $('#clickedAddYourVideoArea').html(floodControlHtml);
    }
  }

  return "end point";
}





//__________.__________.__________/ ADD THEIR VIDEO
//
//__________/ they clicked"add" submitting the form
$('#submitTheirVideoForm').on('submit', function () {

  //__________/ set up some basic variables
  var linkTheySubmitted = $('#linkToYouTubeVideo').val();
  var displayMessage = {
    working: "adding video...",
    result: "default message",
  };

  //__________/ display the working message
  $("#userInterfaceAreaContainer").toggle();
  $("#userInterfaceAreaContainerMessage").toggle();
  $("#userInterfaceAreaContainerMessage").html(displayMessage.working);

  //__________/ call the server side function to add the video
  google.script.run
    .withSuccessHandler(formProcessed_success)
    .withFailureHandler(formProcessed_failure)
    .processForm(linkTheySubmitted);

  //__________/ server success handler
  function formProcessed_success(outputObject) {
    var errorMessage = outputObject.errorMessage;
    var videoAddedTitle = outputObject.videoAddedTitle;
    var theMessage = "";
    if (!errorMessage) {
      theMessage = "Added Video: " + videoAddedTitle;

    //__________/ refresh the video iframe
    var currentIframe = $('#videoContainer').html();
    var replaceIframe = $('#videoContainer').html(currentIframe);

    //__________/ set the error message if the server threw one
    } else {
      theMessage = errorMessage;
    }
    formProcessed_displayTheResult(theMessage);
  }
  
  //__________/ server failure handler
  function formProcessed_failure(outputObject) {
    theMessage = "Error: There was a problem adding the video."
    formProcessed_displayTheResult(theMessage);
  }

  //__________/ give the user the resulting message
  function formProcessed_displayTheResult(theMessage) {
    $("#userInterfaceAreaContainerMessage").html(theMessage);
    var secondsToPause = 2.5;
    google.script.run
      .withSuccessHandler(donePausing)
      .mySleep(secondsToPause);

    //__________/ refresh ui back to starting point
    function donePausing () {
      //$("#userInterfaceAreaContainerMessage").css("display", "none");
      //$("#userInterfaceAreaContainer").css("display", "flex");
      $("#userInterfaceAreaContainerMessage").toggle();
      $("#userInterfaceAreaContainer").toggle();


      var clearInputField = $('#linkToYouTubeVideo').val("");
      var resetMainButton = $('#addYourVideoToggle').prop('checked', false);
    }
  }

  return "end point";
});





//__________.__________.__________/ MOD REMOVE VIDEO PANEL
//
//__________/ mod panel button clicked
$('#modPanelToggle').change( function() {
  if ($("#modPanelToggle").is(':checked')) {
    var loadingMessage = "Loading videos..."
    var interfaceMessage = "Choose a video to remove from this playlist."

    //__________/ hide / show the mod panel or main body
    $("#modLogToggle").prop("checked", false);
    $("#videoContainer").css("display","none");
    $("#userInterfaceAreaContainer").css("display","none");
    $("#modAreaContainer").css("display","flex");
    $("#userInterfaceAreaContainerMessage").css("display","flex");
    $("#userInterfaceAreaContainerMessage").html(interfaceMessage);
    $("#modAreaContainer").css("justify-content","center");
    $("#modAreaContainer").html(loadingMessage);
   
    //__________/ get the mod panels contents from the server
    google.script.run
      .withSuccessHandler(populateModPanel)
      .getModPanelContents();

    //__________/ display the mod panels contents
    function populateModPanel(modPanelContents) {
      $("#modAreaContainer").css("justify-content","flex-start");
      $("#modAreaContainer").html(modPanelContents);

      //__________/ if they click on the "x" to delete a video
      $('.modDelete').click( function() {

        //__________/ if the video was already toggled
        if ( $(this).parent().hasClass("modCPSelectedVideo") ) {
          $(".modPanelVideoItem").removeClass("modCPSelectedVideo");
          $("#userInterfaceAreaContainerMessage").html(interfaceMessage);
        
        //__________/ if the video was not already toggled
        } else {
          var clickedVideoID = $(this).parent().attr('id');
          $(".modPanelVideoItem").removeClass('modCPSelectedVideo');
          $(this).parent().addClass('modCPSelectedVideo');
          var removeVideoHtml = "";
          removeVideoHtml += "Remove this video? &nbsp;&nbsp;";
          removeVideoHtml += "<button id='buttonRemoveVideo' type='button'>Remove</button>";
          removeVideoHtml += "<button id='buttonRemoveCancel' type='button'>Cancel</button>";
          $("#userInterfaceAreaContainerMessage").html(removeVideoHtml);
        }

        //__________/ they clicked cancel
        $('#buttonRemoveCancel').click( function() {
          $(".modPanelVideoItem").removeClass('modCPSelectedVideo');
          $("#userInterfaceAreaContainerMessage").html(interfaceMessage);
        })

        //__________/ they clicked remove
        $('#buttonRemoveVideo').click( function() {
          $("#userInterfaceAreaContainerMessage").html("Removing video...");
          google.script.run
            .withSuccessHandler(removeVideo_success)
            .withFailureHandler(removeVideo_failure)
            .removeVideoFromPlaylist(clickedVideoID);

          //__________/ video successfully removed
          function removeVideo_success (outputObject) {
            var removedVideoTitle = outputObject.removedVideoTitle;
            var removedVideoURL = outputObject.removedVideoURL;
            var returnedMessage = outputObject.returnedMessage;

            //__________/ refresh the video iframe, and mod list
            $(".modCPSelectedVideo").remove();
            var currentIframe = $('#videoContainer').html();
            var replaceIframe = $('#videoContainer').html(currentIframe);

            //__________/ log it
            google.script.run
              .logModResults(removedVideoTitle, removedVideoURL);
            
            //__________/ display the successful deletion message
            $("#userInterfaceAreaContainerMessage").html(returnedMessage);
            var secondsToPause = 3;
            google.script.run
              .withSuccessHandler(refreshModCP)
              .mySleep(secondsToPause);

            //__________/ refresh the mod cp 
            function refreshModCP() {
              $("#userInterfaceAreaContainerMessage").html("Choose a video to remove from the playlist.");
              //$("#modPanelToggle").prop("checked", true)
              return "end point"; 
            }
          }

          //__________/ failed to remove video
          function removeVideo_failure () {
            var removeVideoFailedMessage = "Error: There was a problem removing the video."

            //__________/ display the successful deletion message
            $("#userInterfaceAreaContainerMessage").html(returnedMessage);
            var secondsToPause = 3;
            google.script.run
              .withSuccessHandler(refreshModCP)
              .mySleep(secondsToPause);

            //__________/ refresh the mod cp 
            function refreshModCP() {
              $("#userInterfaceAreaContainerMessage").html("Choose a video to remove from the playlist.");
              $("#modPanelToggle").prop("checked", true)
              //$("#modPanelToggle").prop("checked", false)
              return "end point"; 
            }
            return "end point"; 
          } 
          return "end point"; 
        })   
        return "end point"; 
      })
      return "end point"; 
    }
  } else { //if ($("#modPanelToggle").is(':checked')) {
    $("#videoContainer").css("display","flex");
    $("#userInterfaceAreaContainer").css("display","flex");
    $("#modAreaContainer").css("display","none");
    $("#userInterfaceAreaContainerMessage").css("display","none");
  }
  
  return "end point";
})





//__________.__________.__________/ MOD LOGS
//
//__________/ mod log button clicked
$('#modLogToggle').change( function() {
  
  if ($("#modLogToggle").is(':checked')) {
    var loadingMessage = "Loading Logs..."
    var interfaceMessage = "Select a log sheet to view."

    //__________/ show the mod log panel, hide the main body
    $("#modPanelToggle" ).prop("checked", false);
    $("#videoContainer").css("display","none");
    $("#userInterfaceAreaContainer").css("display","none");
    $("#modAreaContainer").css("display","flex");
    $("#modAreaContainer").html(loadingMessage);
    $("#userInterfaceAreaContainerMessage").css("display","flex");
    $("#userInterfaceAreaContainerMessage").html(interfaceMessage);
    
    //__________/ setup the googlesheets iframe, and embed it
    var iframeHtml = "";
    iframeHtml += "<div ";
    iframeHtml += "id='modLogIframeWrapper'";
    iframeHtml += ">";
    iframeHtml += "<iframe ";
    iframeHtml += "id='modLogIframe' ";
    iframeHtml += "src='https://docs.google.com/spreadsheets/d/1nznlLFabC5QvtYeuGE9hmLUpwGDOF7v5Iro4v7prY34/pubhtml";
    iframeHtml += "?widget=true";
    iframeHtml += "&headers=false";
    iframeHtml += "&chrome=false";
    iframeHtml += "'>";
    iframeHtml += "</iframe>";
    iframeHtml += "</div>";
    $("#modAreaContainer").html(iframeHtml);

  } else {

    //__________/ hide the mod log panel, show the main body
    $("#videoContainer").css("display","flex");
    $("#userInterfaceAreaContainer").css("display","flex");
    $("#modAreaContainer").css("display","none");
    $("#userInterfaceAreaContainerMessage").css("display","none");
  }

  return "end point";
})





})()</script>
<!-------------------------------------------------------- END -->

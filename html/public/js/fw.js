var gcm_endpoint;
$(document).ready(function() {
  $("#result-page").hide();
  $("#search-button").click( function(e) {
    e.preventDefault();
    submitSearch();
    return false;
  });
  $("#done-button").click( function(e) {
    $("#search-page").show();
    $("#result-page").hide();
  });
});

function submitSearch(){
  iosocket.emit("getFlight", {endpoint: endpoint, flightNumber: $("#flightNumber").val()})
  $("#search-page").hide();
  $("#result-page").show();
}
  var iosocket = io.connect('http://localhost:1234');

  iosocket.on('connect', function () {
      console.log("Connected");
      iosocket.on('flight', function(data) {
        console.log(data);
        $("#info-header").html(data[0].flightnumber + " | " + data[0].dest_airport + " til " + data[0].arr_airport);
        if(data[0].dest_act == "N/A"){
          //Flugvél ekki farin
          $("#scheduled").html("Departure: " + data[0].dest_est);
          if(data[0].dest_sched.substring(11) != data[0].dest_est){
            $("#flight-status-text").html("DELAYED");
          } else {
            $("#flight-status-text").html("ON TIME");
          }
          $("#note").html("Arrival: " + data[0].arr_est);
          //$("#next-status").html("Checkin byrjar")
        } else {
          if(data[0].arr_act == "N/A"){
            //Flugvél í loftinu
            $("#scheduled").html("Departure: " + data[0].dest_act);
            $("#flight-status-text").html("IN AIR");
            $("#note").html("Arrival: " + data[0].arr_est);
          } else {
            //Flugvél lent
            $("scheduled").html("Departure: " + data[0].dest_act);
            $("#flight-status-text").html("LANDED");
            $("#note").html("Arrival: " + data[0].arr_act);
          }
        }
      });
  });

var gcm_endpoint;

function httpGetAsync(theUrl, callback)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
    }
    xmlHttp.open("GET", theUrl, true); // true for asynchronous
    xmlHttp.send(null);
}

$(document).ready(function() {
  $("#result-page").hide();
  $("#search-button").click( function(e) {
    submitSearch();
    return false;
  });
  $("#done-button").click( function(e) {
    $("#search-page").show();
    $("#result-page").hide();
  });

  const monthNames = [
    "January", "February", "March",
    "April", "May", "June", "July",
    "August", "September", "October",
    "November", "December"
  ]

  const date = new Date()
  const day = date.getDate()
  const monthIndex = date.getMonth()
  const year = date.getFullYear()

  $('#datepicker').val(day + ' ' + monthNames[monthIndex] + ', ' + year)

  $('#datepicker').pickadate()
});

function submitSearch(){
  //iosocket.emit("getFlight", {endpoint: endpoint, flightNumber: $("#flightNumber").val()})
  httpGetAsync("http://localhost:3000/flight/" + $("#flightNumber").val(), processResults);
}

function processResults(response) {
  var parsedJSON = JSON.parse(response);
  var request = parsedJSON.request;
  var appendix = parsedJSON.appendix;
  var flight = parsedJSON.flightTracks;
  console.log(parsedJSON);
  $("#search-page").hide();
  $("#result-page").show();
  $("#info-header").html(request.airline.requestedCode+request.flight.requested + " | " + flight[0].departureAirportFsCode + " to " + flight[0].arrivalAirportFsCode);
  $("#departure").html();
  $("#flight-status").html();
  $("#arrival").html();
}
/*
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
*/

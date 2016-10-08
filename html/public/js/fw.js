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

function displayResults() {
  $("#result-page").show();
  ani()
}

$(document).ready(function() {

  $('#search-button').click(function() {
    $('#search-page').animate({
      left: '-20%'
    }, 300, function() {
      $(this).hide()
    })
    $('#result-page').show().animate({
      right: '0%'
    }, 300)

    submitSearch();
    return false;
  })

  $('#result-page .backArrow').click(function() {
    $('#search-page').show()
    $('#result-page').animate({
      right: '-120%'
    }, 300, function() {
      $(this).hide()
    })
    $('#search-page').animate({
      right: '-20%'
    }, 300, function() {
      $(this).attr('style', '')
    })
  })

  $("#done-button").click( function(e) {
    $("#search-page").show();
    $("#result-page").hide();
  })

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

function ani(){
  $('#result-page').addClass('move')
}

function processResults(response) {
  console.log(response);
  // $("#search-page").hide();

  var parsedJSON = JSON.parse(response);
  var request = parsedJSON.request;
  var appendix = parsedJSON.appendix;
  var flightStatus = parsedJSON.flightStatus;
  console.log(parsedJSON);
  $("#search-page").hide();
  $("#result-page").show();
  $(".flightNr").html(flightStatus.carrierFsCode+flightStatus.flightNumber);
  // $(".flightRoute").html(flightStatus.departureAirportFsCode + " to " + flightStatus.arrivalAirportFsCode);
  $(".flightRoute .dep").html(flightStatus.departureAirportFsCode);
  $(".flightRoute .arr").html(flightStatus.arrivalAirportFsCode);
  $("#departure").html("Departure: " + flightStatus.operationalTimes.actualRunwayDeparture.dateUtc);
  $("#flight-status").html();
  $("#arrival").html("Arrival: " + flightStatus.operationalTimes.estimatedRunwayArrival.dateUtc);
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

var mysql = require("mysql");
var eyes = require('eyes');
var https = require('https');
var fs = require('fs');
var xml2js = require('xml2js');
// var parser = new xml2js.Parser();
var schedule = require('node-schedule');
var express = require('express');
var app = express();
var sio = require('socket.io');
const moment = require('moment');
const path = require('path');
var axios = require('axios')

const fetch = require('node-fetch');

app.use('/static', express.static(__dirname + '/html/public'))

const db = require('./db');

const gateInfoScraper = require('./gate-info-scraper.js');

const heathrowStatus = require('./gate-info-heathrow.js');

function getFlight( flightNumber, date ) {
  const flightPath = formatFlightNumberForPath( flightNumber );
  const datePath = formatDateForPath( date );
  var url = `https://api.flightstats.com/flex/flightstatus/rest/v2/json/flight/tracks/${flightPath}/arr/${datePath}?appId=5d677d15&appKey=ecc0ee4be44763b1bcdb75e98cf8f005&utc=false&includeFlightPlan=false&maxPositions=2`
  return fetch(url)
  .then( function(response){
    return response.json();
  });
}

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

function formatFlightNumberForPath( flightNumber ) {
  var airline = "";
  var number = "";
  for (var i = 0; i < flightNumber.length; i++) {
    var char = flightNumber.substring(i, i+1);
    if(isNumeric(char)){
      number += char;
    } else {
      airline += char;
    }
  }
  return airline + "/" + number;
}

function formatDateForPath( date ) {
  return '2016/10/7';
}

const server = app.listen(3000, function () {
   const host = server.address().address
   const port = server.address().port
   console.log("Flightwatch app listening at http://%s:%s", host, port)
});

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname + '/html/index.html'))
})

app.get('/heathrow', function(req, res) {
   heathrowStatus.heathrowStatus().then( status => {
     res.send(status)
   })
})

app.get('/scrape', function(req, res) {

    // parser.on('error', function(err) {
    //     console.log('Parser error', err);
    // });

    gateInfoScraper.scrape().then( gateData => {

      res.send( gateData );
    })

     var io = sio.listen(app.listen(1234));
       io.sockets.on('connection', function(socket) {
         socket.on("getFlight", (data) => {
           console.log(data);
           con.query('SELECT * FROM flights WHERE flightNumber = ?' , data.flightNumber, function(err,dbRows){
             socket.emit("flight", dbRows);
           });
         });
       });

});


// ### Gate info

var j = schedule.scheduleJob('* * * * *', function() {

  gateInfoScraper.scrape().then( gateData => {

    updateFlightInfoWithGateInfo( gateData );
  });
});

function updateFlightInfoWithGateInfo( gateInfoEntries ) {
  let flightsUpdated = 0;
  gateInfoEntries.forEach( e => {
    const flightSubscriptions = db.getSubscriptions( e.flightNr, e.date );
    if( flightSubscriptions && flightSubscriptions.length ) {
      // ok, so somone seems to be interested in this, so let's update flight information
      console.log(`Updating flight info with gate info for flight ${e.flightNr}_${e.date}`);
      const flightInfo = db.getFlightInfo( e.flightNr, e.date );
      const updatedFlightInfo = Object.assign( flightInfo, e );
      db.setFlightInfo( e.flightNr, e.date, updatedFlightInfo );
      flightsUpdated++;
    }
  });
  console.log(`Updated ${flightsUpdated} flights with gate info`);
}



// ### REST endpoints

// parse json POST requests into req.body
const bodyParser = require('body-parser');
app.use( bodyParser.json() );

app.get('/flight/:nr', (req, res) => {
  const flightNumber = req.params.nr;
  getFlight(flightNumber, "2016-10-07").then( json => {
    console.log(json);
    res.json(json);
  });
});

app.post('/subscribe', (req, res) => {
  const {flightNumber, deviceId, date} = req.body;
  db.saveSubscription( flightNumber, date, deviceId );
  res.json({ message: 'Subscription added' });
});

app.post('/unsubscribe', (req, res) => {
  const {flightNumber, deviceId, date} = req.body;
  db.removeSubscription( flightNumber, date, deviceId );
  res.json({ message: 'Subscription removed' });
});

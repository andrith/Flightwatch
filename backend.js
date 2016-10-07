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


app.use('/static', express.static(__dirname + '/html/public'))

const db = require('./db');

const flightstats = require('./flightstats.js');
const kefStatus = require('./gate-info-kef.js');
const heathrowStatus = require('./gate-info-heathrow.js');

const server = app.listen(3000, function () {
   const host = server.address().address
   const port = server.address().port
   console.log("Flightwatch app listening at http://%s:%s", host, port)
});

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname + '/html/index.html'))
})

// parser.on('error', function(err) {
//     console.log('Parser error', err);
// });

//  var io = sio.listen(app.listen(1234));
//    io.sockets.on('connection', function(socket) {
//      socket.on("getFlight", (data) => {
//        console.log(data);
//        con.query('SELECT * FROM flights WHERE flightNumber = ?' , data.flightNumber, function(err,dbRows){
//          socket.emit("flight", dbRows);
//        });
//      });
//    });



// ### ~~~ SCHEDULING ~~~

// ### Gate info

var j = schedule.scheduleJob('*/5  * * * * *', function() {

  kefStatus.scrape().then( gateData => {

    updateFlightInfoWithGateInfo( gateData );
  });
});

function updateFlightInfoWithGateInfo( gateInfoEntries ) {
  let flightsUpdated = 0;
  gateInfoEntries.forEach( gate => {
    const flightSubscriptions = db.getSubscriptions( gate.flightNr, gate.date );
    if( flightSubscriptions && flightSubscriptions.length ) {
      // ok, so somone seems to be interested in this, so let's update flight information
      console.log(`Updating flight info with gate info for flight ${gate.flightNr}_${gate.date}`);
      const flightInfo = db.getFlightInfo( gate.flightNr, gate.date );
      flightInfo.gate = gate;
      db.setFlightInfo( gate.flightNr, gate.date, flightInfo );
      flightsUpdated++;
    }
  });
  console.log(`Updated ${flightsUpdated} flights with gate info`);
}

// ### Flightstats

var j = schedule.scheduleJob('*/5 * * * * *', function() {
  let flightsUpdated = 0;
  db.getSubscribedFlights().forEach( oneFlight => {

    const [flightNumber, flightDate] = oneFlight.split("_");
    if( moment().isSameOrBefore( flightDate, 'day' ) ) {
      // the subscribed flight isn't fromt the past...

      flightstats.getFlight(flightNumber, flightDate)
      .then( json => {

        console.log(`Updating flight info with flightstats for flight ${flightNumber}_${flightDate}`);
        console.log("flightstats: ", json);
        const flightInfo = db.getFlightInfo( flightNumber, flightDate );
        flightInfo.stats = json;
        db.setFlightInfo( flightNumber, flightDate, flightInfo );
        flightsUpdated++;
      });
    }
  });
  console.log(`Updated ${flightsUpdated} flights with flightstats`);
});


// ### ~~~ REST endpoints

// parse json POST requests into req.body
const bodyParser = require('body-parser');
app.use( bodyParser.json() );

app.get('/gates/heathrow', function(req, res) {
   heathrowStatus.heathrowStatus().then( status => {
     res.send(status)
   })
})

app.get('/gates/kef', function(req, res) {
    kefStatus.scrape().then( gateData => {
      res.send( gateData );
    })
});

app.get('/flight/:nr', (req, res) => {
  const flightNumber = req.params.nr;
  flightstats.getFlight(flightNumber, "2016-10-07").then( json => {
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

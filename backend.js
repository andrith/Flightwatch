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
const notifSender = require('./notification-sender.js');

const flightstats = require('./flightstats.js');
const kefStatus = require('./gate-info-kef.js');
const heathrowStatus = require('./gate-info-heathrow.js');
const heathrowEstimates = require('./filter-heathrow-estimateTime.js')

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

app.get('/estimate', function(req, res) {
  //Pass in the time time to filter out as a string.
  heathrowEstimates.heathrowEstimates("17:30").then( estimate => {
    res.send(estimate)
  })
})

app.get('/scrape', function(req, res) {

  kefStatus.scrape().then( gateData => {

    res.send( gateData );
  });
})



// ### ~~~ SCHEDULING ~~~

// ### Gate info

  // var j = schedule.scheduleJob('*/5  * * * * *', function() {
  //
  //   kefStatus.scrape().then( gateData => {
  //
  //     updateFlightInfoWithGateInfo( gateData );
  //   });
  // });
//})

var j = schedule.scheduleJob('*/10 * * * * *', function() {

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
      console.log("flightInfo: ", flightInfo);
      // get a possible notification for gate changes
      const gateNotification = getNotificationFromGateInfo( flightInfo.gate, gate );
      console.log("gateNotification: ", gateNotification);
      if( gateNotification ) {
        // send notificaton via gcm:
        notifSender.sendFlightNotificationToSubscribers(
          gate.flightNr, gate.date, {
            title: gateNotification,
            body: gateNotification
          }
        );

        // TODO: save notification to last notification for flight key in db
      }

      // update the gate info in db:
      flightInfo.gate = gate;
      db.setFlightInfo( gate.flightNr, gate.date, flightInfo );
      flightsUpdated++;
    }
  });
  console.log(`Updated ${flightsUpdated} flights with gate info`);
}

/**
 * If there are changes in interesting gate info, prepare a notification
 * @return {String}   Notification regarding gate status change
 */
function getNotificationFromGateInfo( prevGateInfo, newGateInfo ) {
  let notification;
  if( ! prevGateInfo || prevGateInfo.status !== newGateInfo.status ) {
    notification = newGateInfo.status;
  }
  return notification;
}


// ### Flightstats

// var j = schedule.scheduleJob('*/5 * * * * *', function() {
//   let flightsUpdated = 0;
//   db.getSubscribedFlights().forEach( oneFlight => {
//
//     const [flightNumber, flightDate] = oneFlight.split("_");
//     if( moment().isSameOrBefore( flightDate, 'day' ) ) {
//       // the subscribed flight isn't fromt the past...
//
//       flightstats.getFlight(flightNumber, flightDate)
//       .then( json => {
//
//         console.log(`Updating flight info with flightstats for flight ${flightNumber}_${flightDate}`);
//         console.log("flightstats: ", json);
//         const flightInfo = db.getFlightInfo( flightNumber, flightDate );
//
//         // get a possible notification for flightstat changes
//         const flightstatsNotification =
//           getNotificationFromFlightstatInfo( flightInfo, json );
//         if( flightstatsNotification ) {
//           // TODO: send notificaton via gcm...
//
//           // TODO: save notification to last notification for flight key in db
//         }
//
//         flightInfo.stats = json;
//         db.setFlightInfo( flightNumber, flightDate, flightInfo );
//         flightsUpdated++;
//       });
//     }
//   });
//   console.log(`Updated ${flightsUpdated} flights with flightstats`);
// });
var j = schedule.scheduleJob('*/15 * * * *', function() {
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

        // get a possible notification for flightstat changes
        const flightstatsNotification =
          getNotificationFromFlightstatInfo( flightInfo, json );
        if( flightstatsNotification ) {
          // TODO: send notificaton via gcm...

          // TODO: save notification to last notification for flight key in db
        }

        flightInfo.stats = json;
        db.setFlightInfo( flightNumber, flightDate, flightInfo );
        flightsUpdated++;
      });
    }
  });
  console.log(`Updated ${flightsUpdated} flights with flightstats`);
});

/**
 * If there are changes in interesting flightstats info, prepare a notification
 * @return {String}   Notification regarding flightstats change
 */
function getNotificationFromFlightstatInfo( prevFlightInfo, newFlightInfo ) {
  let notification;
  if( false /* something interesting has changed in flight stats */ ) {
    // TODO
  }
  return notification;
}

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

app.get('/flight/:nr/date/:date', (req, res) => {
  const flightNumber = req.params.nr;
  const date = req.params.date;
  flightstats.getFlight(flightNumber, date).then( json => {
    console.log(json);
    const flightInfo = db.getFlightInfo(flightNumber, date);
    if(flightInfo)
      json.flightInfo = flightInfo;
    res.json(json);
  })
  .catch( ex => {
    console.error("error fetching flight: ", flightNumber);
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

app.get('/notification/:deviceId', (req, res) => {
  const deviceId = req.params.deviceId;
  console.log("deviceId: ", deviceId);
  const notification = db.getLatestNotification( deviceId );
  res.json( notification );
});

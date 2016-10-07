var mysql = require("mysql");
var eyes = require('eyes');
var https = require('https');
var fs = require('fs');
var xml2js = require('xml2js');
var parser = new xml2js.Parser();
var schedule = require('node-schedule');
var express = require('express');
var app = express();
var sio = require('socket.io');
const moment = require('moment');

const db = require('./db');
// JSON file DB
// const low = require('lowdb');
// const fileAsync = require('lowdb/lib/file-async');
// const db = low('flightwatch.json', {
//   storage: fileAsync
// });
// db.defaults({
//   flightInfo: {},
//   subscriptions: {}
// }).value();


var con = mysql.createConnection({
  host: "localhost",
  user: "flightwatch",
  password: "flightwatch",
  database: "Flightwatch"
});

parser.on('error', function(err) { console.log('Parser error', err); });


var j = schedule.scheduleJob('*/15 * * * *', function(){

    var data = '';
    https.get('https://test.icelandair.is/origo-portlets/rm/services/rm.xml?RequestType=departures&Departure=KEF&GapBefore=10&GapAfter=20&locale=', function(res) {
        if (res.statusCode >= 200 && res.statusCode < 400) {
          res.on('data', function(data_) { data += data_.toString(); });
          res.on('end', function() {
            parser.parseString(data, function(err, result) {
              for(i = 0; i < result.destinations.destination[0].flights[0].flight.length; i++){
                var row = result.destinations.destination[0].flights[0].flight[i];
                insertOrUpdateRow(row);
              }
            });
          });
        }
      });


    var data2 = '';
    https.get('https://test.icelandair.is/origo-portlets/rm/services/rm.xml?RequestType=arrivals&Departure=KEF&GapBefore=10&GapAfter=20&locale=', function(res) {
        if (res.statusCode >= 200 && res.statusCode < 400) {
          res.on('data', function(data_) { data2 += data_.toString(); });
          res.on('end', function() {
            parser.parseString(data2, function(err, result) {
              for(i = 0; i < result.destinations.destination[0].flights[0].flight.length; i++){
                var row = result.destinations.destination[0].flights[0].flight[i];
                insertOrUpdateRow(row);
              }
            });
          });
        }
      });

});

  function insertOrUpdateRow(row){
    con.query('SELECT * FROM flights WHERE flightNumber = ?' , row.flight_number[0], function(err,dbRows){
      if(err) throw err;
      if(dbRows.length > 0){
        updateRow(row, dbRows);
      } else {
        insertRow(row);
      }
    });
  }

  function insertRow(row){
    con.query('INSERT INTO flights VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)', [null, row.flight_number[0], row.departure[0].scheduled[0], row.departure[0].estimate[0], row.departure[0].actual[0], row.departure[0].airport, row.departure[0].highlight[0], row.arrival[0].scheduled[0], row.arrival[0].estimate[0], row.arrival[0].actual[0], row.arrival[0].airport, row.arrival[0].highlight[0], row.status[0]]);
  }

  function updateRow(row, dbRows){
    checkIfNewHighlight(row, dbRows);
    con.query('DELETE FROM flights WHERE flightnumber = ?', row.flight_number[0])
    con.query('INSERT INTO flights VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)', [null, row.flight_number[0], row.departure[0].scheduled[0], row.departure[0].estimate[0], row.departure[0].actual[0], row.departure[0].airport, row.departure[0].highlight[0], row.arrival[0].scheduled[0], row.arrival[0].estimate[0], row.arrival[0].actual[0], row.arrival[0].airport, row.arrival[0].highlight[0], row.status[0]]);
  }

  function checkIfNewHighlight(row, dbRows){
    console.log("CHECKING");
    if(row.departure[0].highlight[0] == "true" && dbRows[0].dest_highlight == "true") {
      console.log("NEW HIGHLIGHT");
    }
    if(row.arrival[0].highlight[0] == "true" && dbRows[0].arr_highlight == "true") {
      console.log("NEW HIGHLIGHT");
    }
  }


var io = sio.listen(app.listen(1234));
io.sockets.on('connection', function(socket) {
  socket.on("getFlight", (data) => {
    console.log(data);
    con.query('SELECT * FROM flights WHERE flightNumber = ?' , data.flightNumber, function(err,dbRows){
      socket.emit("flight", dbRows);
    });
  });
});



// ### REST endpoints

const server = app.listen(8088, function () {
   var host = server.address().address
   var port = server.address().port
   console.log("Flightwatch app listening at http://%s:%s", host, port)
});

// parse json POST requests into req.body
const bodyParser = require('body-parser');
app.use( bodyParser.json() );

app.get('/flight/:nr', (req, res) => {
  const flightNumber = req.params.nr;
  // TODO: fetch information for flight from DB
  res.json({ flight: flightNumber, departure: moment(), arrival: moment() });
});

app.post('/subscribe', (req, res) => {
  const {flightNumber, deviceId} = req.body;
  db.saveSubscription( flightNumber, deviceId );
  res.json({ message: 'Subscription added' });
});

app.post('/unsubscribe', (req, res) => {
  const {flightNumber, deviceId} = req.body;
  db.removeSubscription( flightNumber, deviceId );
  res.json({ message: 'Subscription removed' });
});

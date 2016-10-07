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

const scraper = require('./scraper.js');

app.get('/', function(req, res) {

    parser.on('error', function(err) {
        console.log('Parser error', err);
    });

    scraper.scraper()


    // var j = schedule.scheduleJob('*/1 * * * *', function() {
    //
    //     var data = '';
    //     https.get('https://test.icelandair.is/origo-portlets/rm/services/rm.xml?RequestType=departures&Departure=KEF&GapBefore=10&GapAfter=20&locale=', function(res) {
    //         console.log(res)
    //         if (res.statusCode >= 200 && res.statusCode < 400) {
    //             res.on('data', function(data_) {
    //                 data += data_.toString();
    //             });
    //             res.on('end', function() {
    //                 parser.parseString(data, function(err, result) {
    //                     for (i = 0; i < result.destinations.destination[0].flights[0].flight.length; i++) {
    //                         var row = result.destinations.destination[0].flights[0].flight[i];
    //                         console.log(row)
    //                     }
    //                 });
    //             });
    //         }
    //     });
    //
    //
    //     var data2 = '';
    //     https.get('https://test.icelandair.is/origo-portlets/rm/services/rm.xml?RequestType=arrivals&Departure=KEF&GapBefore=10&GapAfter=20&locale=', function(res) {
    //         console.log(res)
    //         if (res.statusCode >= 200 && res.statusCode < 400) {
    //             res.on('data', function(data_) {
    //                 data2 += data_.toString();
    //             });
    //             res.on('end', function() {
    //                 parser.parseString(data2, function(err, result) {
    //                     for (i = 0; i < result.destinations.destination[0].flights[0].flight.length; i++) {
    //                         var row = result.destinations.destination[0].flights[0].flight[i];
    //                         console.log(row)
    //                     }
    //                 });
    //             });
    //         }
    //     });
    //
    // });

    // var io = sio.listen(app.listen(1234));
    //   io.sockets.on('connection', function(socket) {
    //     socket.on("getFlight", (data) => {
    //       console.log(data);
    //       con.query('SELECT * FROM flights WHERE flightNumber = ?' , data.flightNumber, function(err,dbRows){
    //         socket.emit("flight", dbRows);
    //       });
    //     });
    //   });

    res.send();

});

app.listen(3000, function() {
    console.log('Example app listening on port 3000!');
});

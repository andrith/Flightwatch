var express = require('express');
var request = require('request');
var cheerio = require('cheerio');

var app     = express();

app.get('/status', function(req, res) {

  url = 'http://www.kefairport.is/English/Timetables/Departures/';

  request(url, function(error, response, html) {

    if(!error) {

      var $ = cheerio.load(html);
      var date, flightNr, airline, destination, estimate, status;
      var json = { date: "", flightNr: "", airline: "", destination: "", estimate: "", status: "" };

      $('tbody tr').filter(function() {

        var data = $(this);

        date         = data.find("td:nth-of-type(1)").text();
        flightNr     = data.find("td:nth-of-type(2)").text();
        airline      = data.find("td:nth-of-type(3)").text();
        destination  = data.find("td:nth-of-type(4)").text();
        estimate     = data.find("td:nth-of-type(5)").text();
        status       = data.find("td:nth-of-type(6)").text();

        json.date        = date;
        json.flightNr    = flightNr;
        json.airline     = airline;
        json.destination = destination;
        json.estimate    = estimate;
        json.status      = status;

        console.log(json);

      })
    }
  })
res.end()
});

app.listen(3000, function() {
  console.log('Scraper listening on port 3000');
});

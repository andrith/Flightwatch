var request = require('request');
var cheerio = require('cheerio');
var moment = require('moment');

exports.scrape = () => {

  const promise = new Promise( (resolve, reject) => {

    url = 'http://www.kefairport.is/English/Timetables/Departures/';

    request(url, function(error, response, html) {

        if (!error) {

            var $ = cheerio.load(html);
            var date, flightNr, airline, destination, estimate, status;
            var gateData = [];

            const thisYear = moment();
            $('tbody tr').filter(function() {

                var data = $(this);

                // like: 7. Oct :
                const dateFromSource = data.find("td:nth-of-type(1)").text();
                if( dateFromSource ) {

                  // like: ["7", "Oct"] :
                  const dateAndMonth = dateFromSource.split('. ');
                  thisYear.set('month', dateAndMonth[1]);
                  thisYear.set('date', dateAndMonth[0]);

                  date = thisYear.format("YYYY-MM-DD");
                  flightNr = data.find("td:nth-of-type(2)").text();
                  airline = data.find("td:nth-of-type(3)").text();
                  destination = data.find("td:nth-of-type(4)").text();
                  estimate = data.find("td:nth-of-type(5)").text();
                  status = data.find("td:nth-of-type(6)").text();

                  gateData.push({
                    date,
                    flightNr,
                    airline,
                    destination,
                    estimate,
                    status
                  });

                }
            }); // <-- ahhh, semicolon :P

            if( true /* TODO: check if all ok, or no http error codes */ ) {

              resolve( gateData );

            } else {
              reject({ message: "There was an error because of something" });
            }

        }
    })

  });
  return promise;
}

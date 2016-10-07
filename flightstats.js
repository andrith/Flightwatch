const fetch = require('node-fetch');

exports.getFlight = ( flightNumber, date ) => {
  return new Promise( (resolve, reject) => {

    const flightPath = formatFlightNumberForPath( flightNumber );
    const datePath = formatDateForPath( date );
    var url = `https://api.flightstats.com/flex/flightstatus/rest/v2/json/flight/tracks/${flightPath}/arr/${datePath}?appId=5d677d15&appKey=ecc0ee4be44763b1bcdb75e98cf8f005&utc=false&includeFlightPlan=false&maxPositions=2`
    fetch(url)
    .then( function(response){
      return response.json();

      // annað fetch á flightstats
      const detailUrl = '';
      fetch( detailUrl )
      .then( detailResponse => {

        resolve( detailResponse.json() );
      });
      
    });

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
  return date.replace(/-/g,'/');
}

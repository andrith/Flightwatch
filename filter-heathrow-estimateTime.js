var axios = require('axios')
var moment = require('moment');

exports.heathrowEstimates = (time) => {

 var currentTime = moment(Date.now()).format("HH:mm")
 var timeAfter = moment(Date.now() + 1800000).format("HH:mm")

  return new Promise( (resolve, reject) => {

    axios.get('http://www.heathrow.com/portal/site/Heathrow/template.BINARYPORTLET/menuitem.69da03430284b1bcc04fc982d79853a0/resource.process/;jsessionid=JtyguAq7T5svsmWfvpx5L1WNFZtHvteqrZViu1ABdngMNDCzmYU4!42032025?javax.portlet.tpst=5856834567d4493f694e65e4e77b53a0&javax.portlet.rid_5856834567d4493f694e65e4e77b53a0=loadActiveFlightsForToday&javax.portlet.rcl_5856834567d4493f694e65e4e77b53a0=cacheLevelPage&javax.portlet.begCacheTok=com.vignette.cachetoken&javax.portlet.endCacheTok=com.vignette.cachetoken&flightIndex=50')
      .then(function (response) {
        const flightData = response.data.flightList
        var data = []
        const heathEstimateTime = moment();

        flightData.forEach((flightData) => {

          var objEstimateTime = flightData.scheduledTimestamp
           var objSplit        = objEstimateTime.split(':')
           heathEstimateTime.set('hour', objSplit[0])
           heathEstimateTime.set('minute', objSplit[1])
           var liveStatus = heathEstimateTime.format("HH:mm")

          data.push({
               date: flightData.flightScheduledDate,
               flightNr: flightData.flightNumber,
               airline: flightData.airlineName,
               destination: flightData.city,
               estimate: liveStatus,
               status: flightData.flightOutputStatus
           })
        })
        var flights = data.filter(function(items){
          if(items.estimate == time){
            return items
            }
        })
       resolve ( flights )
    })
      .catch(function (error) {
        reject({message: "Súper vesen!"});
      });
    })
 }

var axios = require('axios')

exports.heathrowStatus = () => {

  return new Promise( (resolve, reject) => {

    axios.get('http://www.heathrow.com/portal/site/Heathrow/template.BINARYPORTLET/menuitem.69da03430284b1bcc04fc982d79853a0/resource.process/;jsessionid=JtyguAq7T5svsmWfvpx5L1WNFZtHvteqrZViu1ABdngMNDCzmYU4!42032025?javax.portlet.tpst=5856834567d4493f694e65e4e77b53a0&javax.portlet.rid_5856834567d4493f694e65e4e77b53a0=loadActiveFlightsForToday&javax.portlet.rcl_5856834567d4493f694e65e4e77b53a0=cacheLevelPage&javax.portlet.begCacheTok=com.vignette.cachetoken&javax.portlet.endCacheTok=com.vignette.cachetoken&flightIndex=50')
      .then(function(response) {

        const flightList = response.data.flightList
        const heathrowData = []

        flightList.forEach((data) => {

            heathrowData.push({
                 date: data.flightScheduledDate,
                 flightNr: data.flightNumber,
                 airline: data.airlineName,
                 destination: data.city,
                 estimate: data.scheduledTimestamp,
                 status: data.flightOutputStatus
             })

        })

          resolve( heathrowData )

      })
      .catch(function(error) {

        reject({message: "vesen"})
      })

  });

}

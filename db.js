// JSON file DB
const low = require('lowdb');
const fileAsync = require('lowdb/lib/file-async');
const db = low('flightwatch.json', {
  storage: fileAsync
});
db.defaults({
  flightInfo: {},
  subscriptions: {},
  pendingNotifications: {}
}).value();

exports.saveSubscription = ( flightNumber, date, deviceId ) => {
  const flightKey = getFlightKey( flightNumber, date );
  if( ! db.get(['subscriptions', flightKey]).value() ) {
    db.set(['subscriptions', flightKey], []).value();
  }
  if( 0 > db.get(['subscriptions', flightKey]).value().indexOf(deviceId) ) {
    db.get(['subscriptions', flightKey]).push( deviceId ).value();
  }
  console.log(`subscribed ${flightKey} to ${deviceId}`);
}

exports.removeSubscription = ( flightNumber, date, deviceId ) => {
  const flightKey = getFlightKey( flightNumber, date );
  const subscribedDeviceIds = db.get(['subscriptions', flightKey]).value();
  if( subscribedDeviceIds ) {
    const remainingDeviceIds = subscribedDeviceIds.filter(
      oneId => oneId !== deviceId );
    db.set(['subscriptions', flightKey], remainingDeviceIds).value();
  }
  console.log(`unsubscribed ${flightKey} from ${deviceId}`);
}

function getFlightKey( flightNumber, date ) {
  return `${flightNumber}_${date}`;
}

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

exports.saveSubscription = ( flightNumber, deviceId ) => {
  if( ! db.get(['subscriptions', flightNumber]).value() ) {
    db.set(['subscriptions', flightNumber], []).value();
  }
  if( 0 > db.get(['subscriptions', flightNumber]).value().indexOf(deviceId) ) {
    db.get(['subscriptions', flightNumber]).push( deviceId ).value();
  }
  console.log(`subscribed ${flightNumber} to ${deviceId}`);
}

exports.removeSubscription = ( flightNumber, deviceId ) => {
  const subscribedDeviceIds = db.get(['subscriptions', flightNumber]).value();
  if( subscribedDeviceIds ) {
    const remainingDeviceIds = subscribedDeviceIds.filter(
      oneId => oneId !== deviceId );
    db.set(['subscriptions', flightNumber], remainingDeviceIds).value();
  }
  console.log(`unsubscribed ${flightNumber} from ${deviceId}`);
}

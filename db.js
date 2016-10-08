// JSON file DB
const low = require('lowdb');
const fileAsync = require('lowdb/lib/file-async');
const db = low('flightwatch.json', {
  storage: fileAsync
});
db.defaults({
  flightInfo: {},
  subscriptions: {},
  latestNotifications: {}
}).value();

exports.getSubscribedFlights = () => {

  return Object.keys( db.get('subscriptions').value() );
}

exports.getSubscriptions = ( flightNumber, date ) => {
  const flightKey = getFlightKey( flightNumber, date );
  return db.get(['subscriptions', flightKey]).value();
}

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

exports.getFlightInfo = ( flightNumber, date ) => {
  const flightKey = getFlightKey( flightNumber, date );
  let flightInfo = db.get(['flightInfo', flightKey]).value();
  if( ! flightInfo ) flightInfo = {};
  db.set(['flightInfo', flightKey], flightInfo).value();
  return flightInfo;
}

exports.setFlightInfo = ( flightNumber, date, flightInfo ) => {
  const flightKey = getFlightKey( flightNumber, date );
  db.set(['flightInfo', flightKey], flightInfo).value();
}


exports.setLastNotification = ( deviceId, notification ) => {
  db.set(['latestNotifications', deviceId], notification).value();
}

exports.getLatestNotification = ( deviceId ) => {
  return db.get(['latestNotifications', deviceId]).value();
}


function getFlightKey( flightNumber, date ) {
  return `${flightNumber}_${date}`;
}

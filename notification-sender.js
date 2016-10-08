const gcm = require('node-gcm');
const FLIGHTWATCH_GCM_PROJECT_ID = 'AIzaSyC4QKHTSX5P89c8RlbdC4lFn4gvBywOPcw';
const sender = new gcm.Sender(FLIGHTWATCH_GCM_PROJECT_ID);
const RETRY_COUNT = 4;
const db = require('./db');

exports.sendFlightNotificationToSubscribers = (flightNumber, date, notification) => {
  const {title, body} = notification;
  const subscribedDeviceIds = db.getSubscriptions( flightNumber, date );

  const gcmMessage = new gcm.Message();
  const notificationMessagePayload = {
    title,
    body,
    icon: 'logo.png'
  };
  gcmMessage.addNotification( notificationMessagePayload );
  console.log("sending notification to deviceIds: ", subscribedDeviceIds);
  console.log("gcmMessage: ", gcmMessage);
  sender.send(gcmMessage, subscribedDeviceIds, RETRY_COUNT, function(err, result) {
     if(err) console.log(err);
     else console.log(result);
  });
  saveNotificationForDeviceIds( notificationMessagePayload, subscribedDeviceIds );
}

function saveNotificationForDeviceIds( notification, deviceIds ) {

  deviceIds.forEach( oneDeviceId => {

    db.setLastNotification( oneDeviceId, notification );
  });
}

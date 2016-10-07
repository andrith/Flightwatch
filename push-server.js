// Add the registration tokens of the devices you want to send to
var registrationTokens = [];
registrationTokens.push('cpR6uhNRSgM:APA91bGRBG17CiA7blIHOoqxUFFrqm9aOPFEqZ_-gNf-x1ODCWOvDHA_VxX_n6o9gdOxyH-iyjnFTF7HHqxb35fu9GMUkx1RLnDzR9AYV2AyyCqIoEn3yxrwkk1xNQ8aUfQFN_jm3f7S');


var gcm = require('node-gcm'),
    sender = new gcm.Sender("AIzaSyDya8Hi1Xc-LwyIrzEN4SBWKw6_J5tQoM4"),
    RETRY_COUNT = 4;
    var gcm_message = new gcm.Message();

    gcm_message.addNotification({
      title: 'Alert!!!',
      body: 'Abnormal data access',
      icon: 'ic_launcher'
    });
    console.log(gcm_message);

sender.send(gcm_message, registrationTokens, RETRY_COUNT, function(err, result) {
    if(err) console.log(err);
    else console.log(result);
});

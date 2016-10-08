/*
*
*  Push Notifications codelab
*  Copyright 2015 Google Inc. All rights reserved.
*
*  Licensed under the Apache License, Version 2.0 (the "License");
*  you may not use this file except in compliance with the License.
*  You may obtain a copy of the License at
*
*      https://www.apache.org/licenses/LICENSE-2.0
*
*  Unless required by applicable law or agreed to in writing, software
*  distributed under the License is distributed on an "AS IS" BASIS,
*  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*  See the License for the specific language governing permissions and
*  limitations under the License
*
*/

// Version 0.1

'use strict';

var deviceId;  // AKA gcm_endpoint

console.log('Started', self);

self.addEventListener('install', function(event) {
  self.skipWaiting();
  console.log('Installed', event);
});

self.addEventListener('activate', function(event) {
  console.log('Activated', event);
});

self.addEventListener('push', function(event) {
  var data = {};
  if (event.data) {
    data = event.data.json();
  }

  getNotificationPayloadFromServer().then( notifPayload => {

    console.log("notifPayload: ", notifPayload);

    var title = notifPayload.title || "Something Has Happened";
    var body = notifPayload.body || "Here's something you might want to check out.";
    var icon = "logo.png";

    // event.waitUntil(
      self.registration.showNotification( title, {
        'body': body,
        'icon': 'logo.png'
      })
    // );
  })

});


self.addEventListener('message', function(event) {
  if( event.data.deviceId ) {
    deviceId = event.data.deviceId;
    console.log("added device id to service worker member var: ", deviceId);
  }
});


function getNotificationPayloadFromServer() {
  return fetch(`//${location.host}/notification/${deviceId}`)
  .then( response => {
    return response.json();
  })
  .then( notificationMessagePayload => notificationMessagePayload );
}

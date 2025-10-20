importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBH9eRemPVXxcxtfFfZL6gg4a-q2Knat5k",
  authDomain: "mychat-app-cdad0.firebaseapp.com",
  projectId: "mychat-app-cdad0",
  storageBucket: "mychat-app-cdad0.appspot.com",
  messagingSenderId: "665804136647",
  appId: "1:665804136647:web:dc5c0cb1fd5783e14cdee2",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});

import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { app } from "../firebase/firebase-config"; // your existing config

const messaging = getMessaging(app);

// Request notification permission and get FCM token
export const requestForToken = async () => {
  try {
    const currentToken = await getToken(messaging, {
      vapidKey: "YOUR_PUBLIC_VAPID_KEY", // from Firebase Console → Cloud Messaging
    });
    if (currentToken) {
      console.log("FCM Token:", currentToken);
      return currentToken;
    } else {
      console.log("No registration token available.");
    }
  } catch (err) {
    console.log("An error occurred while retrieving token.", err);
  }
};

// Listen for foreground messages
export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });

export default messaging;

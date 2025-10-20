import React, { useState, useEffect } from "react";
import Auth from "./components/Auth";
import ChatList from "./components/ChatList";
import ChatWindow from "./components/ChatWindow";
import styles from "./App.module.css";
import { auth, db } from "./firebase/firebase-config";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

export default function App() {
  const [user, setUser] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [loading, setLoading] = useState(true);

  // Listen auth state and prevent login flash
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // Setup FCM for logged in user: request permission, get token, save to Firestore, listen foreground messages
  useEffect(() => {
    if (!user) return;

    let messaging;
    const setupFCM = async () => {
      try {
        messaging = getMessaging(); // requires firebase/app initialized in firebase-config
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          console.log("Notification permission not granted");
          return;
        }

        const token = await getToken(messaging, {
          vapidKey: "YOUR_VAPID_KEY_HERE", // <-- REPLACE WITH YOUR VAPID KEY
        });

        if (token) {
          // Save token to user doc
          await setDoc(
            doc(db, "users", user.uid),
            {
              fcmToken: token,
              displayName: user.displayName || null,
              email: user.email || null,
            },
            { merge: true }
          );
          console.log("Saved FCM token for user:", token);
        }

        onMessage(messaging, (payload) => {
          console.log("Foreground message:", payload);
          // Optional: show in-app toast / notification UI
          const title = payload.notification?.title || "New message";
          const body = payload.notification?.body || "";
          // simple alert (replace with your toast)
          // don't call alert in production — use a custom toast component
          // alert(`${title}\n${body}`);
          // console.log('payload', payload);
        });
      } catch (err) {
        console.warn("FCM setup error:", err);
      }
    };

    setupFCM();
    // no cleanup needed for messaging here
  }, [user]);

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setSelectedRoom(null);
  };

  if (loading) {
    return (
      <div className={`${styles.app}`}>
        <div className={styles.loaderWrap}>
          <div className={styles.loader} />
          <div className={styles.loaderText}>Loading HeartLock…</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.app}`}>
      <header className={styles.header}>
        <div className={styles.logo}>💌 HeartLock</div>
        <div className={styles.headerRight}>
          {user && <div className={styles.welcome}>Hi, {user.displayName || "You"}</div>}
          {user && (
            <button className={styles.button} onClick={handleLogout}>
              Logout
            </button>
          )}
        </div>
      </header>

      <main className={styles.main}>
        {!user ? (
          <Auth />
        ) : (
          <>
            <ChatList onSelectRoom={setSelectedRoom} />
            <ChatWindow selectedRoom={selectedRoom} />
          </>
        )}
      </main>

      <footer className={styles.footer}>
        Made with 💖 for Lovers | Secure & Private
      </footer>
    </div>
  );
}

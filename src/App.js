import React, { useState, useEffect } from "react";
import Auth from "./components/Auth";
import ChatList from "./components/ChatList";
import ChatWindow from "./components/ChatWindow";
import styles from "./App.module.css";
import { auth, db } from "./firebase/firebase-config";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { requestForToken, onMessageListener } from "./firebase/firebase-messaging";

export default function App() {
  const [user, setUser] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [theme, setTheme] = useState("dark");

  // Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) setupFCM(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Setup Firebase Cloud Messaging
  const setupFCM = async (currentUser) => {
    // Request FCM token
    const token = await requestForToken();
    if (token) {
      // Save token to Firestore for this user
      await setDoc(
        doc(db, "users", currentUser.uid),
        {
          fcmToken: token,
          displayName: currentUser.displayName,
          email: currentUser.email,
        },
        { merge: true }
      );
    }

    // Listen for foreground messages
    onMessageListener().then((payload) => {
      // You can show custom UI or alert
      alert(`New message: ${payload.notification?.body}`);
    });
  };

  // Theme toggle
  const toggleTheme = () => {
    if (theme === "dark") setTheme("light");
    else if (theme === "light") setTheme("romantic");
    else setTheme("dark");
  };

  // Logout
  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setSelectedRoom(null);
  };

  return (
    <div className={`${styles.app} ${styles[theme]}`}>
      {/* Header */}
      <header className={styles.header}>
        <h1>💌 HeartLock</h1>
        <div>
          {user && (
            <button className={styles.button} onClick={handleLogout}>
              Logout
            </button>
          )}
          <button className={styles.button} onClick={toggleTheme}>
            {theme === "dark"
              ? "☀️ Light"
              : theme === "light"
              ? "❤️ Romantic"
              : "🌙 Dark"}
          </button>
        </div>
      </header>

      {/* Main */}
      <main className={styles.main}>
        {!user ? (
          <Auth />
        ) : (
          <div className={styles.chatContainer}>
            <ChatList onSelectRoom={setSelectedRoom} selectedRoom={selectedRoom} />
            <ChatWindow selectedRoom={selectedRoom} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        Made with 💖 for Lovers | Secure & Private
      </footer>
    </div>
  );
}

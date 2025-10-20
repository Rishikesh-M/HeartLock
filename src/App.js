import React, { useState, useEffect } from "react";
import Auth from "./components/Auth";
import ChatList from "./components/ChatList";
import ChatWindow from "./components/ChatWindow";
import styles from "./App.module.css";
import { auth } from "./firebase/firebase-config";
import { signOut, onAuthStateChanged } from "firebase/auth";

export default function App() {
  const [user, setUser] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [loading, setLoading] = useState(true);

  // Firebase Auth listener with loading guard to avoid "flash"
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setSelectedRoom(null);
  };

  if (loading) {
    return (
      <div className={`${styles.app}`}>
        <div className={styles.centerLoader}>
          <div className={styles.loader} />
          <h2>Loading HeartLock…</h2>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <img src="/logo192.png" alt="HeartLock" className={styles.logo} />
          <h1>HeartLock</h1>
        </div>

        <div className={styles.headerActions}>
          {user && <span className={styles.userName}>{user.displayName || user.email}</span>}
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

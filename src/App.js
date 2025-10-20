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
  const [loading, setLoading] = useState(true); // 🔹 Loader while checking auth

  // Firebase Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false); // done checking auth
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setSelectedRoom(null);
  };

  // Show loader while Firebase checks auth
  if (loading) {
    return (
      <div className={`${styles.app} ${styles.dark}`}>
        <div style={{ textAlign: "center", marginTop: "20%" }}>
          <h2>Loading...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.app} ${styles.dark}`}>
      {/* Header */}
      <header className={styles.header}>
        <h1>💌 HeartLock</h1>
        <div>
          {user && (
            <button className={styles.button} onClick={handleLogout}>
              Logout
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
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

      {/* Footer */}
      <footer className={styles.footer}>
        Made with 💖 for Lovers | Secure & Private
      </footer>
    </div>
  );
}

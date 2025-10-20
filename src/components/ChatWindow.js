import React, { useState, useEffect, useRef } from "react";
import styles from "./ChatWindow.module.css";
import { db, auth } from "../firebase/firebase-config";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { EmojiPicker } from "emoji-picker-react";
import GifPicker from "react-giphy-picker";

export default function ChatWindow({ selectedRoom }) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [selectedGif, setSelectedGif] = useState(null);
  const messageEndRef = useRef(null);

  // 🔹 Load messages in real-time
  useEffect(() => {
    if (!selectedRoom) return;

    const q = query(
      collection(db, "rooms", selectedRoom.id, "messages"),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, [selectedRoom]);

  // 🔹 Auto-scroll to latest message
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (type = "text", content = message) => {
    if (!content.trim()) return;

    await addDoc(collection(db, "rooms", selectedRoom.id, "messages"), {
      text: type === "text" ? content : "",
      gif: type === "gif" ? content : "",
      uid: auth.currentUser.uid,
      timestamp: serverTimestamp(),
    });

    setMessage("");
    setSelectedGif(null);
  };

  if (!selectedRoom)
    return (
      <div className={styles.empty}>
        <p>Select or create a room to start chatting 💬</p>
      </div>
    );

  return (
    <div className={styles.chatWindow}>
      {/* Header */}
      <header className={styles.header}>
        <h2>❤️ {selectedRoom.name}</h2>
      </header>

      {/* Messages */}
      <div className={styles.messages}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`${styles.message} ${
              msg.uid === auth.currentUser.uid ? styles.mine : styles.theirs
            }`}
          >
            {msg.text && <p>{msg.text}</p>}
            {msg.gif && <img src={msg.gif} alt="GIF" className={styles.gif} />}
          </div>
        ))}
        <div ref={messageEndRef} />
      </div>

      {/* Input Section */}
      <div className={styles.inputSection}>
        <button
          className={styles.iconButton}
          onClick={() => setShowEmojiPicker(true)}
        >
          😊
        </button>

        <button
          className={styles.iconButton}
          onClick={() => setShowGifPicker(true)}
        >
          🎞️
        </button>

        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          className={styles.input}
        />

        <button onClick={() => handleSend("text")} className={styles.sendBtn}>
          ➤
        </button>
      </div>

      {/* Emoji Picker Popup */}
      {showEmojiPicker && (
        <div className={styles.popup}>
          <div className={styles.popupHeader}>
            <h3>Select Emoji</h3>
            <button
              className={styles.closeBtn}
              onClick={() => setShowEmojiPicker(false)}
            >
              ✖
            </button>
          </div>
          <EmojiPicker
            onEmojiClick={(emoji) => {
              setMessage((prev) => prev + emoji.emoji);
              setShowEmojiPicker(false);
            }}
          />
        </div>
      )}

      {/* GIF Picker Popup */}
      {showGifPicker && (
        <div className={styles.popup}>
          <div className={styles.popupHeader}>
            <h3>Select GIF</h3>
            <button
              className={styles.closeBtn}
              onClick={() => setShowGifPicker(false)}
            >
              ✖
            </button>
          </div>
          <GifPicker
            apiKey="YOUR_GIPHY_API_KEY"
            onSelect={(gif) => {
              setSelectedGif(gif.images.fixed_height.url);
              handleSend("gif", gif.images.fixed_height.url);
              setShowGifPicker(false);
            }}
          />
        </div>
      )}
    </div>
  );
}

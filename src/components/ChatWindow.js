import React, { useState, useEffect, useRef } from "react";
import { db, auth } from "../firebase/firebase-config";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  doc,
} from "firebase/firestore";
import styles from "./ChatWindow.module.css";
import { motion } from "framer-motion";

export default function ChatWindow({ selectedRoom }) {
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [selectedGif, setSelectedGif] = useState(null);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const messagesEndRef = useRef(null);

  const user = auth.currentUser;

  // 🔹 Load messages from Firestore
  useEffect(() => {
    if (!selectedRoom) return;
    const q = query(
      collection(db, "rooms", selectedRoom.id, "messages"),
      orderBy("timestamp", "asc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(msgs);

      // Cache for offline
      localStorage.setItem(`chat_${selectedRoom.id}`, JSON.stringify(msgs));
    });

    // Load offline cache
    const cached = localStorage.getItem(`chat_${selectedRoom.id}`);
    if (cached) setMessages(JSON.parse(cached));

    return () => unsubscribe();
  }, [selectedRoom]);

  // 🔹 Scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 🔹 Send message (text/gif)
  const handleSend = async (type = "text", content = newMsg) => {
    if (!content.trim() && !selectedGif) return;

    const newMessage = {
      sender: user.uid,
      type,
      content: type === "text" ? content.trim() : content,
      timestamp: serverTimestamp(),
      seen: false,
    };

    await addDoc(collection(db, "rooms", selectedRoom.id, "messages"), newMessage);
    setNewMsg("");
    setSelectedGif(null);
  };

  // 🔹 Mark messages as seen
  useEffect(() => {
    if (!selectedRoom || !user) return;

    messages.forEach(async (msg) => {
      if (msg.sender !== user.uid && !msg.seen) {
        const msgRef = doc(db, "rooms", selectedRoom.id, "messages", msg.id);
        await updateDoc(msgRef, { seen: true });
      }
    });
  }, [messages, selectedRoom, user]);

  // 🔹 Fetch GIFs (Giphy API)
  const fetchGifs = async (query) => {
    const res = await fetch(
      `https://api.giphy.com/v1/stickers/search?api_key=YOUR_API_KEY&q=${query}&limit=10`
    );
    const data = await res.json();
    return data.data.map((g) => g.images.fixed_height.url);
  };

  const [gifs, setGifs] = useState([]);
  const [gifQuery, setGifQuery] = useState("");

  const searchGifs = async () => {
    const results = await fetchGifs(gifQuery || "love");
    setGifs(results);
  };

  if (!selectedRoom)
    return (
      <div className={styles.empty}>
        <h2>Select or Create a Room 💬</h2>
      </div>
    );

  return (
    <motion.div
      className={styles.chatWindow}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className={styles.header}>
        <h2>❤️ {selectedRoom.name}</h2>
      </div>

      {/* Chat Messages */}
      <div className={styles.messages}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`${styles.message} ${
              msg.sender === user.uid ? styles.sent : styles.received
            }`}
          >
            {msg.type === "gif" ? (
              <img src={msg.content} alt="GIF" className={styles.gifMsg} />
            ) : (
              <p>{msg.content}</p>
            )}
            <span className={styles.tick}>
              {msg.sender === user.uid
                ? msg.seen
                  ? "✅✅"
                  : "✅"
                : ""}
            </span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* GIF Picker */}
      {showGifPicker && (
        <div className={styles.gifPicker}>
          <div className={styles.gifSearch}>
            <input
              type="text"
              value={gifQuery}
              onChange={(e) => setGifQuery(e.target.value)}
              placeholder="Search GIFs..."
            />
            <button onClick={searchGifs}>Search</button>
          </div>
          <div className={styles.gifGrid}>
            {gifs.map((gif, i) => (
              <img
                key={i}
                src={gif}
                alt="gif"
                onClick={() => {
                  setSelectedGif(gif);
                  handleSend("gif", gif);
                  setShowGifPicker(false);
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Message Input */}
      <div className={styles.inputArea}>
        <button
          className={styles.gifButton}
          onClick={() => setShowGifPicker(!showGifPicker)}
        >
          🎞️
        </button>
        <input
          type="text"
          value={newMsg}
          onChange={(e) => setNewMsg(e.target.value)}
          placeholder="Type a message..."
        />
        <button onClick={() => handleSend("text")}>Send</button>
      </div>
    </motion.div>
  );
}

// src/components/ChatWindow.js
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
import EmojiPicker from "./EmojiPicker";
import GifPicker from "./GifPicker";

export default function ChatWindow({ selectedRoom }) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [showEmoji, setShowEmoji] = useState(false);
  const [showGifs, setShowGifs] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch messages for the selected room
  useEffect(() => {
    if (!selectedRoom) return;
    const q = query(
      collection(db, `rooms/${selectedRoom.id}/messages`),
      orderBy("timestamp", "asc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [selectedRoom]);

  // Send a message
  const handleSend = async (type = "text", content = message) => {
    if (!content.trim() || !selectedRoom) return;
    await addDoc(collection(db, `rooms/${selectedRoom.id}/messages`), {
      text: content,
      uid: auth.currentUser.uid,
      displayName: auth.currentUser.displayName,
      type, // "text" | "gif"
      timestamp: serverTimestamp(),
    });
    if (type === "text") setMessage("");
  };

  // Add emoji at cursor
  const addEmoji = (emoji) => {
    const cursorPos = inputRef.current.selectionStart;
    const newText =
      message.slice(0, cursorPos) + emoji + message.slice(cursorPos);
    setMessage(newText);

    setTimeout(() => {
      inputRef.current.focus();
      inputRef.current.selectionStart = cursorPos + emoji.length;
      inputRef.current.selectionEnd = cursorPos + emoji.length;
    }, 0);
  };

  // Close emoji picker on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setShowEmoji(false);
        setShowGifs(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!selectedRoom) {
    return (
      <div className={styles.container}>
        <h2>Select a Room 💌</h2>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h2>{selectedRoom.name}</h2>

      {/* Messages */}
      <div className={styles.messages}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`${styles.message} ${
              msg.uid === auth.currentUser.uid
                ? styles.ownMessage
                : styles.otherMessage
            }`}
          >
            <p className={styles.name}>{msg.displayName}</p>
            {msg.type === "text" && <p>{msg.text}</p>}
            {msg.type === "gif" && (
              <img src={msg.text} alt="gif" className={styles.gif} />
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className={styles.inputWrapper} ref={containerRef}>
        {showEmoji && <EmojiPicker onSelect={addEmoji} />}
        {showGifs && <GifPicker onSelect={(gifUrl) => handleSend("gif", gifUrl)} />}

        <div className={styles.inputContainer}>
          <button
            className={styles.emojiButton}
            onClick={() => {
              setShowEmoji((prev) => !prev);
              setShowGifs(false);
            }}
          >
            😍
          </button>

          <button
            className={styles.gifButton}
            onClick={() => {
              setShowGifs((prev) => !prev);
              setShowEmoji(false);
            }}
          >
            GIF
          </button>

          <input
            ref={inputRef}
            type="text"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className={styles.input}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />

          <button className={styles.sendButton} onClick={() => handleSend()}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

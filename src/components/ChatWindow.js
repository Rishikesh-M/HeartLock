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
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch messages
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

  const handleSend = async () => {
    if (!message.trim() || !selectedRoom) return;
    await addDoc(collection(db, `rooms/${selectedRoom.id}/messages`), {
      text: message,
      uid: auth.currentUser.uid,
      displayName: auth.currentUser.displayName,
      timestamp: serverTimestamp(),
    });
    setMessage("");
  };

  // Add emoji at cursor
  const addEmoji = (emoji) => {
    const cursorPos = inputRef.current.selectionStart;
    const newText =
      message.slice(0, cursorPos) + emoji + message.slice(cursorPos);
    setMessage(newText);

    // Keep cursor after inserted emoji
    setTimeout(() => {
      inputRef.current.focus();
      inputRef.current.selectionStart = cursorPos + emoji.length;
      inputRef.current.selectionEnd = cursorPos + emoji.length;
    }, 0);
  };

  // Close emoji picker on outside click
  const containerRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setShowEmoji(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
// state to toggle GIF picker
const [showGifs, setShowGifs] = useState(false);

<GifPicker onSelect={(gifUrl) => sendMessage(gifUrl, "gif")} />
  return (
    <div className={styles.container}>
      <h2>{selectedRoom?.name || "Select a Room 💌"}</h2>
      <div className={styles.messages}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`${styles.message} ${
              msg.uid === auth.currentUser?.uid
                ? styles.ownMessage
                : styles.otherMessage
            }`}
          >
            <p className={styles.name}>{msg.displayName}</p>
            <p>{msg.text}</p>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {selectedRoom && (
        <div className={styles.inputWrapper} ref={containerRef}>
          {showEmoji && <EmojiPicker onSelect={addEmoji} />}
          <div className={styles.inputContainer}>
            <button
              className={styles.emojiButton}
              onClick={() => setShowEmoji((prev) => !prev)}
            >
              😍
            </button>
            <input
              ref={inputRef}
              type="text"
              placeholder="Type a message..."
              style={{ color: "black", backgroundColor: "white" }}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className={styles.input}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <button className={styles.sendButton} onClick={handleSend}>
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

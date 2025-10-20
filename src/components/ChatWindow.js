// src/components/ChatWindow.js
import React, { useState, useEffect, useRef } from "react";
import styles from "./ChatWindow.module.css";
import { db, auth, storage } from "../firebase/firebase-config";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { ref, listAll, getDownloadURL } from "firebase/storage";
import EmojiPicker from "./EmojiPicker";
import GifPicker from "./GifPicker";

export default function ChatWindow({ selectedRoom }) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [showEmoji, setShowEmoji] = useState(false);
  const [showGifs, setShowGifs] = useState(false);
  const [selectedGif, setSelectedGif] = useState(null);
  const [showStickers, setShowStickers] = useState(false);
  const [stickers, setStickers] = useState([]);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  // Scroll to bottom on new messages
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

  // Fetch stickers from Firebase Storage
  useEffect(() => {
    const fetchStickers = async () => {
      const storageRef = ref(storage, "stickers/");
      const res = await listAll(storageRef);
      const urls = await Promise.all(res.items.map((item) => getDownloadURL(item)));
      setStickers(urls);
    };
    fetchStickers();
  }, []);

  // Send message
  const handleSend = async (type = "text", content = message) => {
    if (!content?.trim() || !selectedRoom) return;
    await addDoc(collection(db, `rooms/${selectedRoom.id}/messages`), {
      text: content,
      uid: auth.currentUser.uid,
      displayName: auth.currentUser.displayName,
      type,
      timestamp: serverTimestamp(),
    });
    if (type === "text") setMessage("");
    if (type === "gif") setSelectedGif(null);

    setShowEmoji(false);
    setShowGifs(false);
    setShowStickers(false);
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

  // Close pickers on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowEmoji(false);
        setShowGifs(false);
        setShowStickers(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!selectedRoom) {
    return <div className={styles.container}><h2>Select a Room 💌</h2></div>;
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
            {msg.type === "sticker" && (
              <img src={msg.text} alt="sticker" className={styles.sticker} />
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className={styles.inputWrapper} ref={containerRef}>
        {showEmoji && <EmojiPicker onSelect={addEmoji} />}
        {showGifs && <GifPicker onSelect={(gifUrl) => setSelectedGif(gifUrl)} />}
        {showStickers && (
          <div className={styles.stickerPicker}>
            {stickers.map((url, i) => (
              <img
                key={i}
                src={url}
                width={60}
                height={60}
                style={{ cursor: "pointer" }}
                onClick={() => handleSend("sticker", url)}
              />
            ))}
          </div>
        )}

        {/* Selected GIF preview */}
        {selectedGif && (
          <div className={styles.selectedGifPreview}>
            <img src={selectedGif} alt="selected gif" width={100} />
          </div>
        )}

        <div className={styles.inputContainer}>
          <button
            className={styles.emojiButton}
            onClick={() => {
              setShowEmoji((prev) => !prev);
              setShowGifs(false);
              setShowStickers(false);
            }}
          >
            😍
          </button>

          <button
            className={styles.gifButton}
            onClick={() => {
              setShowGifs((prev) => !prev);
              setShowEmoji(false);
              setShowStickers(false);
            }}
          >
            GIF
          </button>

          <button
            className={styles.stickerButton}
            onClick={() => {
              setShowStickers((prev) => !prev);
              setShowEmoji(false);
              setShowGifs(false);
            }}
          >
            🎁
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

          {selectedGif && (
            <button
              className={styles.sendButton}
              onClick={() => handleSend("gif", selectedGif)}
            >
              Send GIF
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

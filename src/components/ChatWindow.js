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
  updateDoc,
  doc,
  arrayUnion,
} from "firebase/firestore";
import { ref, listAll, getDownloadURL } from "firebase/storage";
import EmojiPicker from "./EmojiPicker";
import GifPicker from "./GifPicker";

export default function ChatWindow({ selectedRoom }) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [stickers, setStickers] = useState([]);
  const [showEmoji, setShowEmoji] = useState(false);
  const [showGifs, setShowGifs] = useState(false);
  const [showStickers, set

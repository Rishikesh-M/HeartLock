import React, { useState, useEffect } from "react";
import styles from "./ChatList.module.css";
import { db } from "../firebase/firebase-config";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  deleteDoc,
  doc,
  getDocs,
} from "firebase/firestore";

export default function ChatList({ onSelectRoom }) {
  const [rooms, setRooms] = useState([]);
  const [search, setSearch] = useState("");
  const [newRoom, setNewRoom] = useState({ name: "", password: "" });

  useEffect(() => {
    const q = query(collection(db, "rooms"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setRooms(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const createRoom = async () => {
    if (!newRoom.name.trim()) return;
    await addDoc(collection(db, "rooms"), {
      name: newRoom.name,
      password: newRoom.password,
      createdAt: new Date(),
    });
    setNewRoom({ name: "", password: "" });
  };

  // Clear chat messages for a room
  const clearChat = async (roomId) => {
    const messagesRef = collection(db, `rooms/${roomId}/messages`);
    const snapshot = await getDocs(messagesRef);
    snapshot.forEach(async (docSnap) => {
      await deleteDoc(doc(db, `rooms/${roomId}/messages`, docSnap.id));
    });
  };

  const filteredRooms = rooms.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={styles.container}>
      <h2>Rooms</h2>
      <input
        type="text"
        placeholder="Search room..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className={styles.input}
      />
      <div className={styles.roomList}>
        {filteredRooms.map((room) => (
          <div key={room.id} className={styles.roomWrapper}>
            <div
              className={styles.room}
              onClick={() => onSelectRoom(room)}
            >
              {room.name}
            </div>
            <button
              className={styles.clearButton}
              onClick={() => clearChat(room.id)}
            >
              🗑️
            </button>
          </div>
        ))}
      </div>
      <div className={styles.newRoom}>
        <input
          type="text"
          placeholder="New room name"
          value={newRoom.name}
          onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
          className={styles.input}
        />
        <input
          type="password"
          placeholder="Password (optional)"
          value={newRoom.password}
          onChange={(e) =>
            setNewRoom({ ...newRoom, password: e.target.value })
          }
          className={styles.input}
        />
        <button className={styles.button} onClick={createRoom}>
          Create Room 💖
        </button>
      </div>
    </div>
  );
}

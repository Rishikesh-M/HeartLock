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
  const [newRoom, setNewRoom] = useState({ name: "" });

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
      createdAt: new Date(),
    });
    setNewRoom({ name: "" });
  };

  const clearChat = async (roomId) => {
    const messagesRef = collection(db, `rooms/${roomId}/messages`);
    const snapshot = await getDocs(messagesRef);
    snapshot.forEach(async (docSnap) => {
      await deleteDoc(doc(db, `rooms/${roomId}/messages`, docSnap.id));
    });
  };

  const removeRoom = async (roomId) => {
    // Remove all messages first
    await clearChat(roomId);
    // Delete the room itself
    await deleteDoc(doc(db, "rooms", roomId));
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
        className={styles.input}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className={styles.roomList}>
        {filteredRooms.map((room) => (
          <div key={room.id} className={styles.roomWrapper}>
            <div className={styles.room} onClick={() => onSelectRoom(room)}>
              {room.name}
            </div>
            <div>
              <button
                className={styles.clearButton}
                onClick={() => clearChat(room.id)}
              >
                🗑️
              </button>
              <button
                className={styles.removeButton}
                onClick={() => removeRoom(room.id)}
              >
                ❌
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className={styles.newRoom}>
        <input
          type="text"
          placeholder="New room name"
          className={styles.input}
          value={newRoom.name}
          onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
        />
        <button className={styles.button} onClick={createRoom}>
          Create Room 💖
        </button>
      </div>
    </div>
  );
}

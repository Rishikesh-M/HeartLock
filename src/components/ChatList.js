import React, { useState, useEffect } from "react";
import styles from "./ChatList.module.css";
import { db, auth } from "../firebase/firebase-config";
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
    const unsub = onSnapshot(q, (snap) => {
      setRooms(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  const createRoom = async () => {
    if (!auth.currentUser) {
      alert("Login required to create a room.");
      return;
    }
    if (!newRoom.name.trim()) return;
    await addDoc(collection(db, "rooms"), {
      name: newRoom.name.trim(),
      password: newRoom.password?.trim() || null,
      createdAt: new Date(),
      createdBy: auth.currentUser.uid,
    });
    setNewRoom({ name: "", password: "" });
  };

  const clearChat = async (roomId) => {
    if (!window.confirm("Clear all messages in this room?")) return;
    const messagesRef = collection(db, `rooms/${roomId}/messages`);
    const snap = await getDocs(messagesRef);
    const deletes = snap.docs.map((m) => deleteDoc(doc(db, `rooms/${roomId}/messages`, m.id)));
    await Promise.all(deletes);
  };

  const removeRoom = async (roomId) => {
    if (!window.confirm("Delete this room and its messages? This cannot be undone.")) return;
    // delete messages first
    const messagesRef = collection(db, `rooms/${roomId}/messages`);
    const snap = await getDocs(messagesRef);
    const deletes = snap.docs.map((m) => deleteDoc(doc(db, `rooms/${roomId}/messages`, m.id)));
    await Promise.all(deletes);
    // delete room
    await deleteDoc(doc(db, "rooms", roomId));
  };

  const handleSelectRoom = (room) => {
    if (room.password) {
      const entered = prompt("This room is password protected. Enter password to join:");
      if (entered !== room.password) {
        alert("Incorrect password.");
        return;
      }
    }
    onSelectRoom(room);
  };

  const filtered = rooms.filter((r) => r.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <aside className={styles.container}>
      <h2 className={styles.title}>Rooms</h2>

      <input
        className={styles.input}
        placeholder="Search rooms..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className={styles.roomList}>
        {filtered.map((room) => (
          <div key={room.id} className={styles.roomWrapper}>
            <button className={styles.room} onClick={() => handleSelectRoom(room)}>
              <div className={styles.roomName}>{room.name}</div>
              {room.password && <span className={styles.lock}>🔒</span>}
            </button>

            <div className={styles.roomActions}>
              <button className={styles.clearButton} onClick={() => clearChat(room.id)} title="Clear messages">
                🗑️
              </button>
              <button className={styles.removeButton} onClick={() => removeRoom(room.id)} title="Remove room">
                ❌
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && <div className={styles.empty}>No rooms found</div>}
      </div>

      <div className={styles.newRoom}>
        <input
          className={styles.input}
          placeholder="New room name"
          value={newRoom.name}
          onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
        />
        <input
          className={styles.input}
          placeholder="Password (optional)"
          value={newRoom.password}
          onChange={(e) => setNewRoom({ ...newRoom, password: e.target.value })}
        />
        <button className={styles.button} onClick={createRoom}>
          Create Room 💖
        </button>
      </div>
    </aside>
  );
}

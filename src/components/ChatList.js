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
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

/**
 * ChatList: shows rooms, search, create room (optional password).
 * - Only authenticated users may create/join/remove rooms (checked before actions).
 */

export default function ChatList({ onSelectRoom }) {
  const [rooms, setRooms] = useState([]);
  const [search, setSearch] = useState("");
  const [newRoom, setNewRoom] = useState({ name: "", password: "" });
  const currentUser = auth.currentUser;

  useEffect(() => {
    const q = query(collection(db, "rooms"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      setRooms(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  const createRoom = async () => {
    if (!currentUser) {
      alert("Please sign in to create rooms.");
      return;
    }
    if (!newRoom.name.trim()) return;
    const payload = {
      name: newRoom.name.trim(),
      createdAt: serverTimestamp(),
      createdBy: currentUser.uid,
      password: newRoom.password && newRoom.password.length ? newRoom.password : null,
    };
    await addDoc(collection(db, "rooms"), payload);
    setNewRoom({ name: "", password: "" });
  };

  const clearChat = async (roomId) => {
    if (!currentUser) {
      alert("Please sign in to clear chat.");
      return;
    }
    if (!confirm("Clear all messages in this room?")) return;
    const messagesRef = collection(db, `rooms/${roomId}/messages`);
    const snaps = await getDocs(messagesRef);
    const deletes = snaps.docs.map((d) => deleteDoc(doc(db, `rooms/${roomId}/messages`, d.id)));
    await Promise.all(deletes);
    alert("Cleared messages.");
  };

  const removeRoom = async (roomId) => {
    if (!currentUser) {
      alert("Please sign in to remove rooms.");
      return;
    }
    if (!confirm("Delete this room and all messages?")) return;
    // remove messages first
    const messagesRef = collection(db, `rooms/${roomId}/messages`);
    const snaps = await getDocs(messagesRef);
    const deletes = snaps.docs.map((d) => deleteDoc(doc(db, `rooms/${roomId}/messages`, d.id)));
    await Promise.all(deletes);
    await deleteDoc(doc(db, "rooms", roomId));
    alert("Room deleted.");
  };

  const handleSelectRoom = async (room) => {
    if (!currentUser) {
      alert("Please sign in to join rooms.");
      return;
    }
    if (room.password) {
      const entered = prompt("Enter room password:");
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
      <h3 className={styles.title}>Rooms</h3>

      <input
        className={styles.input}
        placeholder="Search rooms..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        aria-label="Search rooms"
      />

      <div className={styles.roomList}>
        {filtered.map((room) => (
          <div key={room.id} className={styles.roomWrapper}>
            <button className={styles.room} onClick={() => handleSelectRoom(room)}>
              <div className={styles.roomName}>
                {room.name} {room.password ? <span className={styles.lock}>🔒</span> : null}
              </div>
              <div className={styles.roomMeta}>{/* optional last message/time */}</div>
            </button>

            <div className={styles.roomActions}>
              <button className={styles.clearButton} title="Clear messages" onClick={() => clearChat(room.id)}>🧹</button>
              <button className={styles.removeButton} title="Delete room" onClick={() => removeRoom(room.id)}>❌</button>
            </div>
          </div>
        ))}
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
          type="password"
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

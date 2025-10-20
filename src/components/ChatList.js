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
  const [newRoomName, setNewRoomName] = useState("");

  // Fetch rooms
  useEffect(() => {
    const q = query(collection(db, "rooms"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setRooms(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  // Create a new room
  const createRoom = async () => {
    if (!auth.currentUser) {
      alert("You must be logged in to create a room!");
      return;
    }
    if (!newRoomName.trim()) return;
    await addDoc(collection(db, "rooms"), {
      name: newRoomName,
      createdAt: new Date(),
      createdBy: auth.currentUser.uid,
    });
    setNewRoomName("");
  };

  // Clear chat messages for a room
  const clearChat = async (roomId) => {
    if (!auth.currentUser) {
      alert("You must be logged in to clear chat!");
      return;
    }
    const messagesRef = collection(db, `rooms/${roomId}/messages`);
    const snapshot = await getDocs(messagesRef);
    snapshot.forEach(async (docSnap) => {
      await deleteDoc(doc(db, `rooms/${roomId}/messages`, docSnap.id));
    });
  };

  // Filter rooms by search
  const filteredRooms = rooms.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={styles.container}>
      <h2>Rooms</h2>

      {/* Search Box */}
      <input
        type="text"
        placeholder="Search room..."
        style={{ color: "black", backgroundColor: "white" }}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className={styles.input}
      />

      {/* Room List */}
      <div className={styles.roomList}>
        {filteredRooms.map((room) => (
          <div key={room.id} className={styles.roomWrapper}>
            <div
              className={styles.room}
              onClick={() => {
                if (!auth.currentUser) {
                  alert("You must be logged in to join a room!");
                  return;
                }
                onSelectRoom(room);
              }}
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

      {/* New Room */}
      <div className={styles.newRoom}>
        <input
          type="text"
          placeholder="New room name"
          style={{ color: "black", backgroundColor: "white" }}
          value={newRoomName}
          onChange={(e) => setNewRoomName(e.target.value)}
          className={styles.input}
        />
        <button className={styles.button} onClick={createRoom}>
          Create Room 💖
        </button>
      </div>
    </div>
  );
}

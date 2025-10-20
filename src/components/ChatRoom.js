// src/components/ChatRoom.js
import React, { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db, auth } from "../firebase/firebase-config";

const generateCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

const ChatRoom = ({ joinRoom, theme }) => {
  const [roomName, setRoomName] = useState("");
  const [password, setPassword] = useState("");

  const colors = theme === "dark" ? {
    bg: "#2C2C3C",
    highlight: "#FF69B4",
    text: "#FDD7E4",
    inputBg: "#2C2C3C",
    inputBorder: "#444"
  } : {
    bg: "#fff",
    highlight: "#FF69B4",
    text: "#333",
    inputBg: "#fff",
    inputBorder: "#ccc"
  };

  const createRoom = async () => {
    if (!roomName || !password) return alert("Enter room name and password");
    const code = generateCode();
    const docRef = await addDoc(collection(db, "chatrooms"), {
      name: roomName,
      code,
      password,
      users: [auth.currentUser.uid],
      createdAt: new Date()
    });
    alert(`Room created! Code: ${code}`);
    joinRoom({ id: docRef.id, name: roomName, code, password, users: [auth.currentUser.uid] });
    setRoomName(""); setPassword("");
  };

  return (
    <div style={{ padding: "10px", background: colors.bg, borderRadius: "8px", margin: "10px 0" }}>
      <h4 style={{ color: colors.highlight }}>Create a Room</h4>
      <input
        placeholder="Room Name" value={roomName} onChange={e => setRoomName(e.target.value)}
        style={{ width: "100%", padding: "8px", borderRadius: "6px", border: `1px solid ${colors.inputBorder}`, marginBottom: "5px", background: colors.inputBg, color: colors.text }}
      />
      <input
        type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)}
        style={{ width: "100%", padding: "8px", borderRadius: "6px", border: `1px solid ${colors.inputBorder}`, marginBottom: "5px", background: colors.inputBg, color: colors.text }}
      />
      <button onClick={createRoom} style={{ width: "100%", padding: "8px", borderRadius: "6px", background: colors.highlight, color: "#fff", border: "none", cursor: "pointer" }}>
        Create Room
      </button>
    </div>
  );
};

export default ChatRoom;

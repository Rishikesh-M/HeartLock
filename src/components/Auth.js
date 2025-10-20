// src/components/Auth.js
import React, { useState } from "react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth, db } from "../firebase/firebase-config";
import { doc, setDoc } from "firebase/firestore";

const Auth = () => {
  const [isSignup, setIsSignup] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleAuth = async (e) => {
    e.preventDefault();
    if (isSignup) {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        await setDoc(doc(db, "users", user.uid), {
          name,
          email,
          createdAt: new Date(),
        });
        alert("Signup Successful!");
      } catch (error) {
        alert(error.message);
      }
    } else {
      try {
        await signInWithEmailAndPassword(auth, email, password);
        alert("Login Successful!");
      } catch (error) {
        alert(error.message);
      }
    }
  };

  const handleGoogleAuth = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      await setDoc(doc(db, "users", user.uid), {
        name: user.displayName,
        email: user.email,
        createdAt: new Date(),
      }, { merge: true });
      alert("Google Login Successful!");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", height: "100vh", background: "#1C1C1C", fontFamily: "Arial, sans-serif", color: "#FDD7E4"
    }}>
      <div style={{
        background: "#2C2C2C", padding: "40px", borderRadius: "15px",
        boxShadow: "0 4px 20px rgba(255, 0, 150, 0.3)", width: "350px"
      }}>
        <h2 style={{ textAlign: "center", marginBottom: "20px", color: "#FF69B4" }}>{isSignup ? "Sign Up" : "Login"}</h2>
        <form onSubmit={handleAuth} style={{ display: "flex", flexDirection: "column" }}>
          {isSignup && <input
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{ marginBottom: "10px", padding: "12px", borderRadius: "8px", border: "1px solid #FF69B4", background: "#1C1C1C", color: "#FDD7E4" }}
          />}
          <input
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ marginBottom: "10px", padding: "12px", borderRadius: "8px", border: "1px solid #FF69B4", background: "#1C1C1C", color: "#FDD7E4" }}
          />
          <input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ marginBottom: "10px", padding: "12px", borderRadius: "8px", border: "1px solid #FF69B4", background: "#1C1C1C", color: "#FDD7E4" }}
          />
          <button type="submit" style={{
            padding: "12px", background: "#FF69B4", color: "#fff", border: "none",
            borderRadius: "8px", cursor: "pointer", fontWeight: "bold", marginTop: "5px"
          }}>
            {isSignup ? "Sign Up" : "Login"}
          </button>
        </form>
        <button onClick={handleGoogleAuth} style={{
          marginTop: "10px", padding: "12px", width: "100%", border: "none",
          borderRadius: "8px", background: "#DB4437", color: "#fff", cursor: "pointer", fontWeight: "bold"
        }}>
          {isSignup ? "Sign Up with Google" : "Login with Google"}
        </button>
        <p style={{ marginTop: "15px", textAlign: "center" }}>
          {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
          <span
            style={{ color: "#FF69B4", cursor: "pointer", fontWeight: "bold" }}
            onClick={() => setIsSignup(!isSignup)}
          >
            {isSignup ? "Login" : "Sign Up"}
          </span>
        </p>
      </div>
    </div>
  );
};

export default Auth;
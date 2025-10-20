// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth"
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBH9eRemPVXxcxtfFfZL6gg4a-q2Knat5k",
  authDomain: "mychat-app-cdad0.firebaseapp.com",
  projectId: "mychat-app-cdad0",
  storageBucket: "mychat-app-cdad0.firebasestorage.app",
  messagingSenderId: "665804136647",
  appId: "1:665804136647:web:dc5c0cb1fd5783e14cdee2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);
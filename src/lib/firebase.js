// src/lib/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, setDoc,collection,getDocs,addDoc } from "firebase/firestore";
import { firebaseConfig } from "./firebaseconfig";
// Initialize Firebase

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);  // Set up Firestore

export { auth, db, doc, setDoc,getDocs,collection,app,addDoc };

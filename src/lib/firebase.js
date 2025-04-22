// src/lib/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, doc,getDoc, setDoc,collection,getDocs,addDoc,updateDoc,query,where,onSnapshot } from "firebase/firestore";
import { firebaseConfig } from "./firebaseconfig";
// Initialize Firebase

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);  // Set up Firestore

export { auth, db, doc, setDoc,getDocs,collection,app,addDoc,getDoc,updateDoc,query,where,onSnapshot };

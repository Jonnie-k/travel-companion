import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// 1. Change getFirestore to initializeFirestore
import { initializeFirestore } from "firebase/firestore"; 

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAfEZYeI1Q_051XvMUSQpFnHHnxmADFfpA",
  authDomain: "travel-companion-fc0a5.firebaseapp.com",
  projectId: "travel-companion-fc0a5",
  storageBucket: "travel-companion-fc0a5.firebasestorage.app",
  messagingSenderId: "849380746298",
  appId: "1:849380746298:web:5af3a8f2f0e13999a18103",
  measurementId: "G-WZNT7N340L"
};

console.log("Project ID loaded: ", import.meta.env.VITE_FIREBASE_PROJECT_ID);

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();

// 2. Explicitly specify the regional host for africa-south1
export const db = initializeFirestore(app, {
  host: "africa-south1-firestore.googleapis.com",
  ssl: true,
});
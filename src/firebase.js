// src/firebase.js
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCCeHw-bf7baIwbQ7mcVlJhICvgeMGZscE",
  authDomain: "reto-fitness-79e2d.firebaseapp.com",
  databaseURL:
    "https://reto-fitness-79e2d-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "reto-fitness-79e2d",
  storageBucket: "reto-fitness-79e2d.firebasestorage.app",
  messagingSenderId: "115592535654",
  appId: "1:115592535654:web:4d8d3f2773b2e7d4a117a7",
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);

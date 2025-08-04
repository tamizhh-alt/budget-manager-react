// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBAP-WZRq83m43q5Y_5dDBkaW1NmJoFm3c",
  authDomain: "budget-manager-app-345e4.firebaseapp.com",
  projectId: "budget-manager-app-345e4",
  storageBucket: "budget-manager-app-345e4.firebasestorage.app",
  messagingSenderId: "33195742238",
  appId: "1:33195742238:web:4b87cf799bb618670b4a0f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

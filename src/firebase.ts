import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAG3wzqHA_VBGL5w0HZH0PakgoFkY5z2_c",
  authDomain: "fleet1-b834b.firebaseapp.com",
  projectId: "fleet1-b834b",
  storageBucket: "fleet1-b834b.firebasestorage.app",
  messagingSenderId: "642275947092",
  appId: "1:642275947092:web:537806e23f45da892873c1",
  measurementId: "G-36ZNMLSBTV"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
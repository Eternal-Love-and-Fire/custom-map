import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDVpUPyvoIJ_Lt9hi-S4tSkV_NDq6prnpU",
  authDomain: "custom-map-5690e.firebaseapp.com",
  projectId: "custom-map-5690e",
  storageBucket: "custom-map-5690e.appspot.com",
  messagingSenderId: "161776000974",
  appId: "1:161776000974:web:b2dda47c0a8d16c565559f",
  measurementId: "G-G1ZYNF8M2D",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };

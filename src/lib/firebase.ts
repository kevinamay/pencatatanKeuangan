import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Konfigurasi Firebase dari pengguna dengan URL Realtime Database
const firebaseConfig = {
  apiKey: "AIzaSyDvaILNFTxNILlXudHxCHoFTg_fxDiQttU",
  authDomain: "keuangan-40058.firebaseapp.com",
  databaseURL: "https://keuangan-40058-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "keuangan-40058",
  storageBucket: "keuangan-40058.firebasestorage.app",
  messagingSenderId: "342439166000",
  appId: "1:342439166000:web:bae5cce3c0234c028fadf5"
};

// Inisialisasi Firebase App & Realtime Database (singleton)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const rtdb = getDatabase(app, "https://keuangan-40058-default-rtdb.asia-southeast1.firebasedatabase.app");

export { app, rtdb, firebaseConfig };


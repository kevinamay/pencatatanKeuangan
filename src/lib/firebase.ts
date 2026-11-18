import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Konfigurasi Firebase dari pengguna
const firebaseConfig = {
  apiKey: "AIzaSyDvaILNFTxNILlXudHxCHoFTg_fxDiQttU",
  authDomain: "keuangan-40058.firebaseapp.com",
  projectId: "keuangan-40058",
  storageBucket: "keuangan-40058.firebasestorage.app",
  messagingSenderId: "342439166000",
  appId: "1:342439166000:web:bae5cce3c0234c028fadf5"
};

// Inisialisasi Firebase App (singleton)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);

export { app, db, firebaseConfig };


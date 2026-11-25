import { initializeApp } from "firebase/app";
import { getDatabase, ref, set } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDvaILNFTxNILlXudHxCHoFTg_fxDiQttU",
  authDomain: "keuangan-40058.firebaseapp.com",
  databaseURL: "https://keuangan-40058-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "keuangan-40058",
  storageBucket: "keuangan-40058.firebasestorage.app",
  messagingSenderId: "342439166000",
  appId: "1:342439166000:web:bae5cce3c0234c028fadf5"
};

const app = initializeApp(firebaseConfig);
const rtdb = getDatabase(app, firebaseConfig.databaseURL);

async function clearAll() {
  console.log("Menghubungkan ke Realtime Database...");
  
  const nodes = [
    "incomes",
    "expenses",
    "savings",
    "money_market",
    "planned_items",
    "financial_goals"
  ];

  for (const node of nodes) {
    console.log(`Menghapus data [${node}]...`);
    await set(ref(rtdb, node), null);
  }

  console.log("✅ Berhasil mengosongkan seluruh data Firebase Realtime Database!");
  process.exit(0);
}

clearAll().catch((err) => {
  console.error("Gagal membersihkan database:", err);
  process.exit(1);
});

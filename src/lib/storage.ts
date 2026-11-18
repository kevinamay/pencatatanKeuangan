import { db } from "./firebase";
import {
  collection,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  getDocs,
  enableNetwork,
  disableNetwork
} from "firebase/firestore";
import {
  IncomeItem,
  ExpenseItem,
  SavingsAllocation,
  MoneyMarketProduct,
} from "@/types/finance";

// Storage keys untuk fallback lokal
const LOCAL_STORAGE_KEYS = {
  INCOMES: "keuangan_incomes_v1",
  EXPENSES: "keuangan_expenses_v1",
  SAVINGS: "keuangan_savings_v1",
  MONEY_MARKET: "keuangan_money_market_v1",
};

// Data Awal / Seed Demo realistis untuk langsung tampil memukau
const DEFAULT_INCOMES: IncomeItem[] = [
  {
    id: "inc-1",
    date: "2026-11-01",
    month: "2026-11",
    amount: 12500000,
    category: "Gaji Pokok",
    source: "PT Teknologi Indonesia",
    note: "Gaji Pokok Bulan November 2026",
    createdAt: Date.now() - 15 * 86400000,
  },
  {
    id: "inc-2",
    date: "2026-11-05",
    month: "2026-11",
    amount: 2500000,
    category: "Freelance / Side Job",
    source: "Proyek Desain Web UI",
    note: "Pelunasan tahap 2",
    createdAt: Date.now() - 11 * 86400000,
  },
];

const DEFAULT_EXPENSES: ExpenseItem[] = [
  {
    id: "exp-1",
    date: "2026-11-02",
    month: "2026-11",
    amount: 2800000,
    category: "Tempat Tinggal (Sewa/KPR)",
    note: "Sewa Apartemen & Maintenance",
    createdAt: Date.now() - 14 * 86400000,
  },
  {
    id: "exp-2",
    date: "2026-11-04",
    month: "2026-11",
    amount: 1500000,
    category: "Belanja Bulanan",
    note: "Belanja dapur, sembako & perlengkapan rumah",
    createdAt: Date.now() - 12 * 86400000,
  },
  {
    id: "exp-3",
    date: "2026-11-07",
    month: "2026-11",
    amount: 650000,
    category: "Tagihan & Utilitas",
    note: "Listrik PLN, WiFi Indihome & BPJS",
    createdAt: Date.now() - 9 * 86400000,
  },
  {
    id: "exp-4",
    date: "2026-11-10",
    month: "2026-11",
    amount: 1200000,
    category: "Makan & Minuman",
    note: "Makan sehari-hari & kopi santai",
    createdAt: Date.now() - 6 * 86400000,
  },
  {
    id: "exp-5",
    date: "2026-11-12",
    month: "2026-11",
    amount: 550000,
    category: "Transportasi",
    note: "Bensin kendaraan & bensin/kartu e-toll",
    createdAt: Date.now() - 4 * 86400000,
  },
];

const DEFAULT_SAVINGS: SavingsAllocation[] = [
  {
    id: "sav-1",
    date: "2026-11-02",
    month: "2026-11",
    amount: 2000000,
    targetType: "emergency",
    accountName: "Tabungan Darurat BCA",
    note: "Dana cadangan likuid keluarga",
    createdAt: Date.now() - 14 * 86400000,
  },
  {
    id: "sav-2",
    date: "2026-11-03",
    month: "2026-11",
    amount: 3000000,
    targetType: "money_market",
    accountName: "Sucorinvest Pasar Uang (Bibit)",
    note: "Investasi pasar uang bulanan otomatis",
    createdAt: Date.now() - 13 * 86400000,
  },
  {
    id: "sav-3",
    date: "2026-11-06",
    month: "2026-11",
    amount: 1000000,
    targetType: "goal",
    accountName: "Target Liburan Akhir Tahun",
    note: "Tabungan tujuan liburan",
    createdAt: Date.now() - 10 * 86400000,
  },
];

const DEFAULT_MONEY_MARKET: MoneyMarketProduct[] = [
  {
    id: "mm-1",
    name: "Sucorinvest Sharia Money Market",
    platform: "Bibit",
    initialCapital: 18500000,
    returnRatePa: 6.15,
    startDate: "2026-05-10",
    accumulatedReturn: 632500,
    notes: "Imbal hasil stabil, bebas pajak & pencairan instan",
    history: [
      { id: "h1", date: "2026-05-10", type: "topup", amount: 10000000, note: "Setoran awal portofolio" },
      { id: "h2", date: "2026-08-15", type: "topup", amount: 5500000, note: "Top up bonus proyek" },
      { id: "h3", date: "2026-11-03", type: "topup", amount: 3000000, note: "Alokasi gaji November" },
    ],
    updatedAt: Date.now(),
  },
  {
    id: "mm-2",
    name: "Mandiri Pasar Uang Utama",
    platform: "Bareksa",
    initialCapital: 12000000,
    returnRatePa: 5.75,
    startDate: "2026-07-01",
    accumulatedReturn: 287500,
    notes: "Pengganti tabungan reguler untuk dana siaga 6 bulan",
    history: [
      { id: "h4", date: "2026-07-01", type: "topup", amount: 12000000, note: "Alokasi dana darurat" },
    ],
    updatedAt: Date.now(),
  },
];

// Helper: Format Rupiah
export function formatRupiah(value: number | string | undefined | null): string {
  const num = typeof value === "string" ? parseFloat(value) : (value ?? 0);
  if (isNaN(num)) return "Rp 0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

// Helper: Format Tanggal Indonesia
export function formatTanggalIndo(dateStr: string): string {
  if (!dateStr) return "-";
  try {
    const [y, m, d] = dateStr.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

// Hitung estimasi keuntungan pasar uang secara dinamis
export function calculateMoneyMarketProfit(
  initialCapital: number,
  ratePa: number,
  startDateStr: string,
  manualAccumulatedProfit?: number
): {
  estimatedProfit: number;
  totalValue: number;
  daysActive: number;
  dailyReturn: number;
  monthlyReturn: number;
} {
  const start = new Date(startDateStr);
  const now = new Date();
  const diffTime = Math.max(0, now.getTime() - start.getTime());
  const daysActive = Math.max(1, Math.floor(diffTime / (1000 * 60 * 60 * 24)));

  // Keuntungan berbasis compound / prorate harian:
  // p.a. (per annum) = 365 hari
  const dailyRate = ratePa / 100 / 365;
  const theoreticalProfit = initialCapital * dailyRate * daysActive;

  // Jika ada manual profit yang lebih tinggi atau diisi manual, gunakan yang lebih besar
  const estimatedProfit = Math.max(
    Math.round(theoreticalProfit),
    manualAccumulatedProfit || 0
  );

  const totalValue = initialCapital + estimatedProfit;
  const dailyReturn = Math.round(initialCapital * dailyRate);
  const monthlyReturn = Math.round(initialCapital * (ratePa / 100 / 12));

  return {
    estimatedProfit,
    totalValue,
    daysActive,
    dailyReturn,
    monthlyReturn,
  };
}

// Local Storage Helper
function getLocalData<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(defaultValue));
      return defaultValue;
    }
    return JSON.parse(raw);
  } catch {
    return defaultValue;
  }
}

function setLocalData<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error("Gagal simpan ke localStorage", err);
  }
}

// Service Manager
export class FinanceStorage {
  // Subscribers callback
  private static listeners: Array<() => void> = [];
  private static isFirebaseConnected = false;

  public static subscribe(callback: () => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  private static notify() {
    this.listeners.forEach((cb) => cb());
  }

  public static getFirebaseStatus(): boolean {
    return this.isFirebaseConnected;
  }

  // Inisialisasi sinkronisasi Firestore dengan fallback
  public static initSync() {
    if (typeof window === "undefined") return;

    // Pastikan localStorage terisi seed default jika kosong
    if (!localStorage.getItem(LOCAL_STORAGE_KEYS.INCOMES)) {
      setLocalData(LOCAL_STORAGE_KEYS.INCOMES, DEFAULT_INCOMES);
    }
    if (!localStorage.getItem(LOCAL_STORAGE_KEYS.EXPENSES)) {
      setLocalData(LOCAL_STORAGE_KEYS.EXPENSES, DEFAULT_EXPENSES);
    }
    if (!localStorage.getItem(LOCAL_STORAGE_KEYS.SAVINGS)) {
      setLocalData(LOCAL_STORAGE_KEYS.SAVINGS, DEFAULT_SAVINGS);
    }
    if (!localStorage.getItem(LOCAL_STORAGE_KEYS.MONEY_MARKET)) {
      setLocalData(LOCAL_STORAGE_KEYS.MONEY_MARKET, DEFAULT_MONEY_MARKET);
    }

    // Hubungkan ke Firestore
    try {
      // Listener Incomes
      onSnapshot(
        collection(db, "incomes"),
        (snapshot) => {
          this.isFirebaseConnected = true;
          if (!snapshot.empty) {
            const list: IncomeItem[] = [];
            snapshot.forEach((docSnap) => {
              list.push({ id: docSnap.id, ...(docSnap.data() as Omit<IncomeItem, "id">) });
            });
            setLocalData(LOCAL_STORAGE_KEYS.INCOMES, list);
          }
          this.notify();
        },
        (err) => {
          console.warn("Firestore [incomes] menggunakan backup lokal:", err.message);
          this.isFirebaseConnected = false;
          this.notify();
        }
      );

      // Listener Expenses
      onSnapshot(
        collection(db, "expenses"),
        (snapshot) => {
          this.isFirebaseConnected = true;
          if (!snapshot.empty) {
            const list: ExpenseItem[] = [];
            snapshot.forEach((docSnap) => {
              list.push({ id: docSnap.id, ...(docSnap.data() as Omit<ExpenseItem, "id">) });
            });
            setLocalData(LOCAL_STORAGE_KEYS.EXPENSES, list);
          }
          this.notify();
        },
        (err) => {
          console.warn("Firestore [expenses] menggunakan backup lokal:", err.message);
          this.notify();
        }
      );

      // Listener Savings
      onSnapshot(
        collection(db, "savings"),
        (snapshot) => {
          this.isFirebaseConnected = true;
          if (!snapshot.empty) {
            const list: SavingsAllocation[] = [];
            snapshot.forEach((docSnap) => {
              list.push({ id: docSnap.id, ...(docSnap.data() as Omit<SavingsAllocation, "id">) });
            });
            setLocalData(LOCAL_STORAGE_KEYS.SAVINGS, list);
          }
          this.notify();
        },
        (err) => {
          console.warn("Firestore [savings] menggunakan backup lokal:", err.message);
          this.notify();
        }
      );

      // Listener Money Market
      onSnapshot(
        collection(db, "money_market"),
        (snapshot) => {
          this.isFirebaseConnected = true;
          if (!snapshot.empty) {
            const list: MoneyMarketProduct[] = [];
            snapshot.forEach((docSnap) => {
              list.push({ id: docSnap.id, ...(docSnap.data() as Omit<MoneyMarketProduct, "id">) });
            });
            setLocalData(LOCAL_STORAGE_KEYS.MONEY_MARKET, list);
          }
          this.notify();
        },
        (err) => {
          console.warn("Firestore [money_market] menggunakan backup lokal:", err.message);
          this.notify();
        }
      );
    } catch (e) {
      console.warn("Firebase init error, berjalan dalam mode lokal sinkron:", e);
      this.isFirebaseConnected = false;
    }
  }

  // --- INCOMES (GAJI / PEMASUKAN) ---
  public static getIncomes(): IncomeItem[] {
    return getLocalData(LOCAL_STORAGE_KEYS.INCOMES, DEFAULT_INCOMES);
  }

  public static async addIncome(item: Omit<IncomeItem, "id" | "createdAt">): Promise<void> {
    const newItem: IncomeItem = {
      ...item,
      id: "inc-" + Date.now(),
      createdAt: Date.now(),
    };

    // Update Local
    const current = this.getIncomes();
    const updated = [newItem, ...current];
    setLocalData(LOCAL_STORAGE_KEYS.INCOMES, updated);
    this.notify();

    // Sync ke Firestore
    try {
      await addDoc(collection(db, "incomes"), {
        date: newItem.date,
        month: newItem.month,
        amount: newItem.amount,
        category: newItem.category,
        source: newItem.source,
        note: newItem.note || "",
        createdAt: newItem.createdAt,
      });
      this.isFirebaseConnected = true;
    } catch (err) {
      console.warn("Sync cloud Firestore ditunda:", err);
    }
  }

  public static async deleteIncome(id: string): Promise<void> {
    const current = this.getIncomes().filter((x) => x.id !== id);
    setLocalData(LOCAL_STORAGE_KEYS.INCOMES, current);
    this.notify();

    try {
      if (!id.startsWith("inc-")) {
        await deleteDoc(doc(db, "incomes", id));
      }
    } catch (err) {
      console.warn("Hapus cloud ditunda:", err);
    }
  }

  // --- EXPENSES (PENGELUARAN) ---
  public static getExpenses(): ExpenseItem[] {
    return getLocalData(LOCAL_STORAGE_KEYS.EXPENSES, DEFAULT_EXPENSES);
  }

  public static async addExpense(item: Omit<ExpenseItem, "id" | "createdAt">): Promise<void> {
    const newItem: ExpenseItem = {
      ...item,
      id: "exp-" + Date.now(),
      createdAt: Date.now(),
    };

    const current = this.getExpenses();
    const updated = [newItem, ...current];
    setLocalData(LOCAL_STORAGE_KEYS.EXPENSES, updated);
    this.notify();

    try {
      await addDoc(collection(db, "expenses"), {
        date: newItem.date,
        month: newItem.month,
        amount: newItem.amount,
        category: newItem.category,
        note: newItem.note || "",
        createdAt: newItem.createdAt,
      });
      this.isFirebaseConnected = true;
    } catch (err) {
      console.warn("Sync cloud ditunda:", err);
    }
  }

  public static async deleteExpense(id: string): Promise<void> {
    const current = this.getExpenses().filter((x) => x.id !== id);
    setLocalData(LOCAL_STORAGE_KEYS.EXPENSES, current);
    this.notify();

    try {
      if (!id.startsWith("exp-")) {
        await deleteDoc(doc(db, "expenses", id));
      }
    } catch (err) {
      console.warn("Hapus cloud ditunda:", err);
    }
  }

  // --- SAVINGS (ALOKASI TABUNGAN) ---
  public static getSavings(): SavingsAllocation[] {
    return getLocalData(LOCAL_STORAGE_KEYS.SAVINGS, DEFAULT_SAVINGS);
  }

  public static async addSavings(item: Omit<SavingsAllocation, "id" | "createdAt">): Promise<void> {
    const newItem: SavingsAllocation = {
      ...item,
      id: "sav-" + Date.now(),
      createdAt: Date.now(),
    };

    const current = this.getSavings();
    const updated = [newItem, ...current];
    setLocalData(LOCAL_STORAGE_KEYS.SAVINGS, updated);

    // Jika jenis alokasi adalah ke pasar uang, update juga modal pasar uang secara otomatis!
    if (newItem.targetType === "money_market") {
      const mmList = this.getMoneyMarket();
      if (mmList.length > 0) {
        // Tambahkan ke instrumen pertama atau cari yang cocok
        const targetMM = mmList.find((m) => m.name.toLowerCase().includes("pasar uang")) || mmList[0];
        targetMM.initialCapital += newItem.amount;
        targetMM.history = [
          ...(targetMM.history || []),
          {
            id: "h-" + Date.now(),
            date: newItem.date,
            type: "topup",
            amount: newItem.amount,
            note: `Alokasi Tabungan (${newItem.accountName})`,
          },
        ];
        targetMM.updatedAt = Date.now();
        setLocalData(LOCAL_STORAGE_KEYS.MONEY_MARKET, mmList);
      }
    }

    this.notify();

    try {
      await addDoc(collection(db, "savings"), {
        date: newItem.date,
        month: newItem.month,
        amount: newItem.amount,
        targetType: newItem.targetType,
        accountName: newItem.accountName,
        note: newItem.note || "",
        createdAt: newItem.createdAt,
      });
      this.isFirebaseConnected = true;
    } catch (err) {
      console.warn("Sync cloud ditunda:", err);
    }
  }

  public static async deleteSavings(id: string): Promise<void> {
    const current = this.getSavings().filter((x) => x.id !== id);
    setLocalData(LOCAL_STORAGE_KEYS.SAVINGS, current);
    this.notify();

    try {
      if (!id.startsWith("sav-")) {
        await deleteDoc(doc(db, "savings", id));
      }
    } catch (err) {
      console.warn("Hapus cloud ditunda:", err);
    }
  }

  // --- MONEY MARKET (PASAR UANG & PORTOFOLIO) ---
  public static getMoneyMarket(): MoneyMarketProduct[] {
    return getLocalData(LOCAL_STORAGE_KEYS.MONEY_MARKET, DEFAULT_MONEY_MARKET);
  }

  public static async addMoneyMarketProduct(
    product: Omit<MoneyMarketProduct, "id" | "updatedAt">
  ): Promise<void> {
    const newProduct: MoneyMarketProduct = {
      ...product,
      id: "mm-" + Date.now(),
      updatedAt: Date.now(),
      history: [
        {
          id: "h-" + Date.now(),
          date: product.startDate,
          type: "topup",
          amount: product.initialCapital,
          note: "Setoran Pokok Awal",
        },
      ],
    };

    const current = this.getMoneyMarket();
    const updated = [newProduct, ...current];
    setLocalData(LOCAL_STORAGE_KEYS.MONEY_MARKET, updated);
    this.notify();

    try {
      await addDoc(collection(db, "money_market"), newProduct);
      this.isFirebaseConnected = true;
    } catch (err) {
      console.warn("Sync cloud ditunda:", err);
    }
  }

  public static async topUpMoneyMarket(
    id: string,
    amount: number,
    date: string,
    note?: string
  ): Promise<void> {
    const current = this.getMoneyMarket();
    const item = current.find((x) => x.id === id);
    if (!item) return;

    item.initialCapital += amount;
    item.updatedAt = Date.now();
    item.history = [
      ...(item.history || []),
      {
        id: "h-" + Date.now(),
        date: date || new Date().toISOString().split("T")[0],
        type: "topup",
        amount,
        note: note || "Top Up Portofolio",
      },
    ];

    setLocalData(LOCAL_STORAGE_KEYS.MONEY_MARKET, current);
    this.notify();

    try {
      if (!id.startsWith("mm-")) {
        await updateDoc(doc(db, "money_market", id), {
          initialCapital: item.initialCapital,
          history: item.history,
          updatedAt: item.updatedAt,
        });
      }
    } catch (err) {
      console.warn("Sync topup cloud ditunda:", err);
    }
  }

  public static async deleteMoneyMarket(id: string): Promise<void> {
    const current = this.getMoneyMarket().filter((x) => x.id !== id);
    setLocalData(LOCAL_STORAGE_KEYS.MONEY_MARKET, current);
    this.notify();

    try {
      if (!id.startsWith("mm-")) {
        await deleteDoc(doc(db, "money_market", id));
      }
    } catch (err) {
      console.warn("Hapus cloud ditunda:", err);
    }
  }
}


import { rtdb } from "./firebase";
import {
  ref,
  onValue,
  set,
  push,
  remove,
  update,
} from "firebase/database";
import {
  IncomeItem,
  ExpenseItem,
  SavingsAllocation,
  MoneyMarketProduct,
  PlannedItem,
  FinancialGoal,
} from "@/types/finance";

// Storage keys untuk fallback lokal (v5 - Support Sumber Dana Investasi & Tabungan)
const LOCAL_STORAGE_KEYS = {
  INCOMES: "keuangan_incomes_v5",
  EXPENSES: "keuangan_expenses_v5",
  SAVINGS: "keuangan_savings_v5",
  MONEY_MARKET: "keuangan_money_market_v5",
  PLANNED_ITEMS: "keuangan_planned_v1",
  GOALS: "keuangan_goals_v1",
};

// Data Awal Bersih (Clean Empty State)
const DEFAULT_INCOMES: IncomeItem[] = [];
const DEFAULT_EXPENSES: ExpenseItem[] = [];
const DEFAULT_SAVINGS: SavingsAllocation[] = [];
const DEFAULT_MONEY_MARKET: MoneyMarketProduct[] = [];
const DEFAULT_PLANNED_ITEMS: PlannedItem[] = [];
const DEFAULT_GOALS: FinancialGoal[] = [];

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
  initialCapital: number = 0,
  ratePa: number = 5.5,
  startDateStr: string = "",
  manualAccumulatedProfit?: number
): {
  estimatedProfit: number;
  totalValue: number;
  daysActive: number;
  dailyReturn: number;
  monthlyReturn: number;
} {
  const capital = isNaN(Number(initialCapital)) ? 0 : Number(initialCapital);
  const rate = isNaN(Number(ratePa)) ? 5.5 : Number(ratePa);

  let daysActive = 1;
  if (startDateStr && !isNaN(Date.parse(startDateStr))) {
    const start = new Date(startDateStr);
    const now = new Date();
    const diffTime = Math.max(0, now.getTime() - start.getTime());
    daysActive = Math.max(1, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
  }

  // Keuntungan berbasis compound / prorate harian:
  // p.a. (per annum) = 365 hari
  const dailyRate = rate / 100 / 365;
  const theoreticalProfit = capital * dailyRate * daysActive;

  // Jika ada manual profit yang lebih tinggi atau diisi manual, gunakan yang lebih besar
  const estimatedProfit = Math.max(
    Math.round(theoreticalProfit),
    manualAccumulatedProfit || 0
  );

  const totalValue = capital + estimatedProfit;
  const dailyReturn = Math.round(capital * dailyRate);
  const monthlyReturn = Math.round(capital * (rate / 100 / 12));

  return {
    estimatedProfit,
    totalValue,
    daysActive,
    dailyReturn,
    monthlyReturn,
  };
}

// In-Memory Fast Cache (0ms Access, No redundant JSON.parse)
let memoryCache: Record<string, any> = {};

// Helper deduplikasi murni in-memory (0 side-effects, tidak pernah memicu loop Firebase)
function deduplicateMMList(list: MoneyMarketProduct[]): MoneyMarketProduct[] {
  if (!list || list.length <= 1) return list || [];
  const uniqueMap = new Map<string, MoneyMarketProduct>();
  for (const item of list) {
    const key = (item.name || "").trim().toLowerCase();
    if (!uniqueMap.has(key)) {
      uniqueMap.set(key, { ...item });
    } else {
      const existing = uniqueMap.get(key)!;
      existing.history = [
        ...(existing.history || []),
        ...(item.history || []),
      ];
    }
  }
  return Array.from(uniqueMap.values());
}

// Local Storage Helper with High-Speed In-Memory Cache
function getLocalData<T>(key: string, defaultValue: T): T {
  if (memoryCache[key] !== undefined) {
    return memoryCache[key];
  }
  if (typeof window === "undefined") return defaultValue;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(defaultValue));
      memoryCache[key] = defaultValue;
      return defaultValue;
    }
    const parsed = JSON.parse(raw);
    memoryCache[key] = parsed;
    return parsed;
  } catch {
    memoryCache[key] = defaultValue;
    return defaultValue;
  }
}

function setLocalData<T>(key: string, value: T) {
  memoryCache[key] = value;
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
  private static isInitialized = false;
  private static notifyTimer: ReturnType<typeof setTimeout> | null = null;

  public static subscribe(callback: () => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  // 16ms animation frame batching debounce to eliminate cascading re-renders
  private static notify() {
    if (this.notifyTimer) return;
    this.notifyTimer = setTimeout(() => {
      this.notifyTimer = null;
      this.listeners.forEach((cb) => cb());
    }, 16);
  }

  public static getFirebaseStatus(): boolean {
    return this.isFirebaseConnected;
  }

  // Inisialisasi sinkronisasi Firebase Realtime Database
  public static initSync() {
    if (typeof window === "undefined" || this.isInitialized) return;
    this.isInitialized = true;

    // Bersihkan legacy cache keys versi sebelumnya jika ada
    [
      "keuangan_incomes_v1",
      "keuangan_expenses_v1",
      "keuangan_savings_v1",
      "keuangan_money_market_v1",
      "keuangan_incomes_v2",
      "keuangan_expenses_v2",
      "keuangan_savings_v2",
      "keuangan_money_market_v2",
      "keuangan_incomes_v3",
      "keuangan_expenses_v3",
      "keuangan_savings_v3",
      "keuangan_money_market_v3",
      "keuangan_incomes_v4",
      "keuangan_expenses_v4",
      "keuangan_savings_v4",
      "keuangan_money_market_v4",
    ].forEach((k) => {
      try {
        localStorage.removeItem(k);
      } catch {}
    });

    // Pastikan localStorage terisi array kosong jika belum ada
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

    // Hubungkan ke Realtime Database
    try {
      // 1. Listener Incomes
      const incomesRef = ref(rtdb, "incomes");
      onValue(
        incomesRef,
        (snapshot) => {
          this.isFirebaseConnected = true;
          if (snapshot.exists()) {
            const data = snapshot.val();
            const list: IncomeItem[] = Object.entries(data).map(([key, val]: [string, any]) => ({
              ...val,
              id: key,
            }));
            list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
            setLocalData(LOCAL_STORAGE_KEYS.INCOMES, list);
          } else {
            // Jika Realtime Database kosong, set lokal kosong
            setLocalData(LOCAL_STORAGE_KEYS.INCOMES, []);
          }
          this.notify();
        },
        (err) => {
          console.warn("RTDB [incomes] error:", err.message);
          this.isFirebaseConnected = false;
          this.notify();
        }
      );

      // 2. Listener Expenses
      const expensesRef = ref(rtdb, "expenses");
      onValue(
        expensesRef,
        (snapshot) => {
          this.isFirebaseConnected = true;
          if (snapshot.exists()) {
            const data = snapshot.val();
            const list: ExpenseItem[] = Object.entries(data).map(([key, val]: [string, any]) => ({
              ...val,
              id: key,
            }));
            list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
            setLocalData(LOCAL_STORAGE_KEYS.EXPENSES, list);
          } else {
            setLocalData(LOCAL_STORAGE_KEYS.EXPENSES, []);
          }
          this.notify();
        },
        (err) => {
          console.warn("RTDB [expenses] error:", err.message);
          this.isFirebaseConnected = false;
          this.notify();
        }
      );

      // 3. Listener Savings (Murni Read & Sync ke Lokal)
      const savingsRef = ref(rtdb, "savings");
      onValue(
        savingsRef,
        (snapshot) => {
          this.isFirebaseConnected = true;
          if (snapshot.exists()) {
            const data = snapshot.val();
            const list: SavingsAllocation[] = Object.entries(data).map(([key, val]: [string, any]) => ({
              ...val,
              id: key,
            }));
            list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
            setLocalData(LOCAL_STORAGE_KEYS.SAVINGS, list);
          } else {
            setLocalData(LOCAL_STORAGE_KEYS.SAVINGS, []);
          }
          this.notify();
        },
        (err) => {
          console.warn("RTDB [savings] error:", err.message);
          this.isFirebaseConnected = false;
          this.notify();
        }
      );

      // 4. Listener Money Market (Murni Read, Validasi Nama & In-Memory Deduplication)
      const mmRef = ref(rtdb, "money_market");
      onValue(
        mmRef,
        (snapshot) => {
          this.isFirebaseConnected = true;
          if (snapshot.exists()) {
            const data = snapshot.val();
            const list: MoneyMarketProduct[] = Object.entries(data)
              .filter(
                ([_, val]: [string, any]) =>
                  val &&
                  typeof val === "object" &&
                  val.name &&
                  val.name.trim() !== "" &&
                  val.name !== "-"
              )
              .map(([key, val]: [string, any]) => ({
                ...val,
                id: key,
              }));
            const cleaned = deduplicateMMList(list);
            setLocalData(LOCAL_STORAGE_KEYS.MONEY_MARKET, cleaned);
          } else {
            setLocalData(LOCAL_STORAGE_KEYS.MONEY_MARKET, []);
          }
          this.notify();
        },
        (err) => {
          console.warn("RTDB [money_market] error:", err.message);
          this.isFirebaseConnected = false;
          this.notify();
        }
      );

      // 5. Listener Planned Items (Wacana Belanja / Tagihan Pending)
      const plannedRef = ref(rtdb, "planned_items");
      onValue(
        plannedRef,
        (snapshot) => {
          this.isFirebaseConnected = true;
          if (snapshot.exists()) {
            const data = snapshot.val();
            const list: PlannedItem[] = Object.entries(data).map(
              ([key, val]: [string, any]) => ({
                ...val,
                id: key,
              })
            );
            setLocalData(LOCAL_STORAGE_KEYS.PLANNED_ITEMS, list);
          } else {
            setLocalData(LOCAL_STORAGE_KEYS.PLANNED_ITEMS, []);
          }
          this.notify();
        },
        (err) => {
          console.warn("RTDB [planned_items] error:", err.message);
          this.isFirebaseConnected = false;
          this.notify();
        }
      );

      // 6. Listener Financial Goals (Celengan Impian / Target Tabungan)
      const goalsRef = ref(rtdb, "financial_goals");
      onValue(
        goalsRef,
        (snapshot) => {
          this.isFirebaseConnected = true;
          if (snapshot.exists()) {
            const data = snapshot.val();
            const list: FinancialGoal[] = Object.entries(data).map(
              ([key, val]: [string, any]) => ({
                ...val,
                id: key,
              })
            );
            setLocalData(LOCAL_STORAGE_KEYS.GOALS, list);
          } else {
            setLocalData(LOCAL_STORAGE_KEYS.GOALS, []);
          }
          this.notify();
        },
        (err) => {
          console.warn("RTDB [financial_goals] error:", err.message);
          this.isFirebaseConnected = false;
          this.notify();
        }
      );
    } catch (e) {
      console.warn("RTDB init error:", e);
      this.isFirebaseConnected = false;
    }
  }

  // Deduplikasi lokal in-memory yang aman
  public static deduplicateMoneyMarket() {
    if (typeof window === "undefined") return;
    const currentMM = getLocalData<MoneyMarketProduct[]>(LOCAL_STORAGE_KEYS.MONEY_MARKET, []);
    const cleaned = deduplicateMMList(currentMM);
    setLocalData(LOCAL_STORAGE_KEYS.MONEY_MARKET, cleaned);
    this.notify();
  }

  // Sinkronisasi otomatis Money Market dari alokasi Tabungan yang sudah ada
  public static syncMoneyMarketFromSavings(savingsList?: SavingsAllocation[]) {
    const list = savingsList || this.getSavings();
    const mmSavings = list.filter((s) => s.targetType === "money_market");
    if (mmSavings.length === 0) return;

    const currentMM = this.getMoneyMarket();
    if (currentMM.length > 0) {
      this.deduplicateMoneyMarket();
      return;
    }

    if (currentMM.length === 0) {
      const totalAmount = mmSavings.reduce((acc, curr) => acc + curr.amount, 0);
      const earliestDate = mmSavings.reduce(
        (earliest, curr) => (curr.date < earliest ? curr.date : earliest),
        mmSavings[0].date
      );
      const primaryName = mmSavings[0].accountName || "Sucorinvest Pasar Uang";

      const mmRef = ref(rtdb, "money_market");
      const newMMRef = push(mmRef);
      const newMMId = newMMRef.key || "mm-" + Date.now();
      const autoProduct: MoneyMarketProduct = {
        id: newMMId,
        name: primaryName,
        platform: "Bibit",
        initialCapital: totalAmount,
        returnRatePa: 5.5,
        startDate: earliestDate,
        notes: "Sinkronisasi otomatis dari alokasi tabungan",
        history: mmSavings.map((s) => ({
          id: "h-" + s.id,
          date: s.date,
          type: "topup",
          amount: s.amount,
          note: `Alokasi Tabungan (${s.accountName})`,
        })),
        updatedAt: Date.now(),
      };
      setLocalData(LOCAL_STORAGE_KEYS.MONEY_MARKET, [autoProduct]);
      set(newMMRef, autoProduct).catch((err) => {
        console.warn("RTDB sync MM product gagal:", err);
      });
      this.notify();
    }
  }

  // Clear seluruh data (Reset Bersih)
  public static async clearAllData(): Promise<void> {
    memoryCache = {};
    setLocalData(LOCAL_STORAGE_KEYS.INCOMES, []);
    setLocalData(LOCAL_STORAGE_KEYS.EXPENSES, []);
    setLocalData(LOCAL_STORAGE_KEYS.SAVINGS, []);
    setLocalData(LOCAL_STORAGE_KEYS.MONEY_MARKET, []);
    setLocalData(LOCAL_STORAGE_KEYS.PLANNED_ITEMS, []);
    setLocalData(LOCAL_STORAGE_KEYS.GOALS, []);
    this.notify();

    remove(ref(rtdb, "incomes")).catch(() => {});
    remove(ref(rtdb, "expenses")).catch(() => {});
    remove(ref(rtdb, "savings")).catch(() => {});
    remove(ref(rtdb, "money_market")).catch(() => {});
    remove(ref(rtdb, "planned_items")).catch(() => {});
    remove(ref(rtdb, "financial_goals")).catch(() => {});
  }

  // --- INCOMES (GAJI / PEMASUKAN) ---
  public static getIncomes(): IncomeItem[] {
    return getLocalData(LOCAL_STORAGE_KEYS.INCOMES, DEFAULT_INCOMES);
  }

  public static async addIncome(item: Omit<IncomeItem, "id" | "createdAt">): Promise<void> {
    const incomesRef = ref(rtdb, "incomes");
    const newRef = push(incomesRef);
    const newId = newRef.key || "inc-" + Date.now();
    const newItem: IncomeItem = {
      ...item,
      id: newId,
      createdAt: Date.now(),
    };

    // Update Local segera (Instant Local-First)
    const current = this.getIncomes();
    const updated = [newItem, ...current.filter((x) => x.id !== newId)];
    setLocalData(LOCAL_STORAGE_KEYS.INCOMES, updated);
    this.notify();

    // Sync ke Realtime Database
    set(newRef, {
      date: newItem.date,
      month: newItem.month,
      amount: newItem.amount,
      category: newItem.category,
      source: newItem.source,
      note: newItem.note || "",
      createdAt: newItem.createdAt,
    })
      .then(() => {
        this.isFirebaseConnected = true;
        this.notify();
      })
      .catch((err) => {
        console.warn("RTDB addIncome gagal:", err.message);
      });
  }

  public static async deleteIncome(id: string): Promise<void> {
    const current = this.getIncomes().filter((x) => x.id !== id);
    setLocalData(LOCAL_STORAGE_KEYS.INCOMES, current);
    this.notify();

    remove(ref(rtdb, `incomes/${id}`)).catch((err) => {
      console.warn("RTDB deleteIncome gagal:", err.message);
    });
  }

  public static async updateIncome(
    id: string,
    updated: Partial<Omit<IncomeItem, "id" | "createdAt">>
  ): Promise<void> {
    const current = this.getIncomes();
    const idx = current.findIndex((x) => x.id === id);
    if (idx === -1) return;

    const merged: IncomeItem = {
      ...current[idx],
      ...updated,
    };
    current[idx] = merged;
    setLocalData(LOCAL_STORAGE_KEYS.INCOMES, current);
    this.notify();

    update(ref(rtdb, `incomes/${id}`), {
      date: merged.date,
      month: merged.month,
      amount: merged.amount,
      category: merged.category,
      source: merged.source,
      note: merged.note || "",
    })
      .then(() => {
        this.isFirebaseConnected = true;
        this.notify();
      })
      .catch((err) => {
        console.warn("RTDB updateIncome gagal:", err.message);
      });
  }

  // --- EXPENSES (PENGELUARAN) ---
  public static getExpenses(): ExpenseItem[] {
    return getLocalData(LOCAL_STORAGE_KEYS.EXPENSES, DEFAULT_EXPENSES);
  }

  public static async addExpense(item: Omit<ExpenseItem, "id" | "createdAt">): Promise<void> {
    const expensesRef = ref(rtdb, "expenses");
    const newRef = push(expensesRef);
    const newId = newRef.key || "exp-" + Date.now();
    const newItem: ExpenseItem = {
      ...item,
      id: newId,
      createdAt: Date.now(),
    };

    // Update Local segera (Instant Local-First)
    const current = this.getExpenses();
    const updated = [newItem, ...current.filter((x) => x.id !== newId)];
    setLocalData(LOCAL_STORAGE_KEYS.EXPENSES, updated);
    this.notify();

    // Sync ke Realtime Database
    set(newRef, {
      date: newItem.date,
      month: newItem.month,
      amount: newItem.amount,
      category: newItem.category,
      title: newItem.title || "",
      note: newItem.note || "",
      createdAt: newItem.createdAt,
    })
      .then(() => {
        this.isFirebaseConnected = true;
        this.notify();
      })
      .catch((err) => {
        console.warn("RTDB addExpense gagal:", err.message);
      });
  }

  public static async deleteExpense(id: string): Promise<void> {
    const current = this.getExpenses().filter((x) => x.id !== id);
    setLocalData(LOCAL_STORAGE_KEYS.EXPENSES, current);
    this.notify();

    remove(ref(rtdb, `expenses/${id}`)).catch((err) => {
      console.warn("RTDB deleteExpense gagal:", err.message);
    });
  }

  public static async updateExpense(
    id: string,
    updated: Partial<Omit<ExpenseItem, "id" | "createdAt">>
  ): Promise<void> {
    const current = this.getExpenses();
    const idx = current.findIndex((x) => x.id === id);
    if (idx === -1) return;

    const merged: ExpenseItem = {
      ...current[idx],
      ...updated,
    };
    current[idx] = merged;
    setLocalData(LOCAL_STORAGE_KEYS.EXPENSES, current);
    this.notify();

    update(ref(rtdb, `expenses/${id}`), {
      date: merged.date,
      month: merged.month,
      amount: merged.amount,
      category: merged.category,
      title: merged.title || "",
      note: merged.note || "",
    })
      .then(() => {
        this.isFirebaseConnected = true;
        this.notify();
      })
      .catch((err) => {
        console.warn("RTDB updateExpense gagal:", err.message);
      });
  }

  // --- SAVINGS (ALOKASI TABUNGAN) ---
  public static getSavings(): SavingsAllocation[] {
    return getLocalData(LOCAL_STORAGE_KEYS.SAVINGS, DEFAULT_SAVINGS);
  }

  public static async addSavings(item: Omit<SavingsAllocation, "id" | "createdAt">): Promise<void> {
    const savingsRef = ref(rtdb, "savings");
    const newRef = push(savingsRef);
    const newId = newRef.key || "sav-" + Date.now();
    const newItem: SavingsAllocation = {
      ...item,
      id: newId,
      createdAt: Date.now(),
    };

    const current = this.getSavings();
    const updated = [newItem, ...current.filter((x) => x.id !== newId)];
    setLocalData(LOCAL_STORAGE_KEYS.SAVINGS, updated);

    // Jika jenis alokasi adalah ke pasar uang, update atau buat produk pasar uang secara otomatis!
    if (newItem.targetType === "money_market") {
      const mmList = this.getMoneyMarket();
      const existing = mmList.find(
        (m) =>
          m.id !== "mm-live-sync" &&
          m.name &&
          m.name.toLowerCase().includes(
            (newItem.accountName || "pasar uang").toLowerCase()
          )
      );
      if (existing) {
        existing.initialCapital += newItem.amount;
        existing.history = [
          ...(existing.history || []),
          {
            id: "h-" + Date.now(),
            date: newItem.date,
            type: "topup",
            amount: newItem.amount,
            note: `Alokasi Tabungan (${newItem.accountName})`,
          },
        ];
        existing.updatedAt = Date.now();
        setLocalData(LOCAL_STORAGE_KEYS.MONEY_MARKET, mmList);

        // Simpan objek lengkap ke Firebase agar properti name, returnRatePa, startDate tidak hilang
        set(ref(rtdb, `money_market/${existing.id}`), existing).catch((err) => {
          console.warn("RTDB update MM product gagal:", err);
        });
      } else {
        // Otomatis buat produk pasar uang jika belum ada produk sebelumnya
        const mmRef = ref(rtdb, "money_market");
        const newMMRef = push(mmRef);
        const newMMId = newMMRef.key || "mm-" + Date.now();
        const autoProduct: MoneyMarketProduct = {
          id: newMMId,
          name: newItem.accountName || "Sucorinvest Pasar Uang",
          platform: "Bibit",
          initialCapital: newItem.amount,
          returnRatePa: 5.5,
          startDate: newItem.date || new Date().toISOString().split("T")[0],
          notes: newItem.note || "Otomatis dibuat dari alokasi tabungan",
          history: [
            {
              id: "h-" + Date.now(),
              date: newItem.date,
              type: "topup",
              amount: newItem.amount,
              note: `Setoran Awal Tabungan (${newItem.accountName})`,
            },
          ],
          updatedAt: Date.now(),
        };
        const updatedMMList = [...mmList.filter((m) => m.id !== "mm-live-sync"), autoProduct];
        setLocalData(LOCAL_STORAGE_KEYS.MONEY_MARKET, updatedMMList);
        set(newMMRef, autoProduct).catch((err) => {
          console.warn("RTDB auto-create MM product gagal:", err);
        });
      }
    }

    this.notify();

    // Sync ke Realtime Database
    set(newRef, {
      date: newItem.date,
      month: newItem.month,
      amount: newItem.amount,
      targetType: newItem.targetType,
      accountName: newItem.accountName,
      fundingSource: newItem.fundingSource || "salary",
      note: newItem.note || "",
      createdAt: newItem.createdAt,
    })
      .then(() => {
        this.isFirebaseConnected = true;
        this.notify();
      })
      .catch((err) => {
        console.warn("RTDB addSavings gagal:", err.message);
      });
  }

  public static async deleteSavings(id: string): Promise<void> {
    const current = this.getSavings().filter((x) => x.id !== id);
    setLocalData(LOCAL_STORAGE_KEYS.SAVINGS, current);
    this.notify();

    remove(ref(rtdb, `savings/${id}`)).catch((err) => {
      console.warn("RTDB deleteSavings gagal:", err.message);
    });
  }

  public static async updateSavings(
    id: string,
    updated: Partial<Omit<SavingsAllocation, "id" | "createdAt">>
  ): Promise<void> {
    const current = this.getSavings();
    const idx = current.findIndex((x) => x.id === id);
    if (idx === -1) return;

    const merged: SavingsAllocation = {
      ...current[idx],
      ...updated,
    };
    current[idx] = merged;
    setLocalData(LOCAL_STORAGE_KEYS.SAVINGS, current);
    this.notify();

    update(ref(rtdb, `savings/${id}`), {
      date: merged.date,
      month: merged.month,
      amount: merged.amount,
      targetType: merged.targetType,
      accountName: merged.accountName,
      fundingSource: merged.fundingSource || "salary",
      note: merged.note || "",
    })
      .then(() => {
        this.isFirebaseConnected = true;
        this.notify();
      })
      .catch((err) => {
        console.warn("RTDB updateSavings gagal:", err.message);
      });
  }

  // --- MONEY MARKET (PASAR UANG & PORTOFOLIO) ---
  public static getMoneyMarket(): MoneyMarketProduct[] {
    const raw = getLocalData(LOCAL_STORAGE_KEYS.MONEY_MARKET, DEFAULT_MONEY_MARKET);
    const valid = (raw || []).filter(
      (item) =>
        item &&
        typeof item === "object" &&
        item.name &&
        item.name.trim() !== "" &&
        item.name !== "-"
    );
    return deduplicateMMList(valid);
  }

  public static async addMoneyMarketProduct(
    product: Omit<MoneyMarketProduct, "id" | "updatedAt">
  ): Promise<string> {
    const mmRef = ref(rtdb, "money_market");
    const newRef = push(mmRef);
    const newId = newRef.key || "mm-" + Date.now();
    const newProduct: MoneyMarketProduct = {
      ...product,
      id: newId,
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
    const updated = [newProduct, ...current.filter((x) => x.id !== newId)];
    setLocalData(LOCAL_STORAGE_KEYS.MONEY_MARKET, updated);
    this.notify();

    set(newRef, newProduct)
      .then(() => {
        this.isFirebaseConnected = true;
        this.notify();
      })
      .catch((err) => {
        console.warn("RTDB addMoneyMarket gagal:", err.message);
      });

    return newId;
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

    set(ref(rtdb, `money_market/${id}`), item).catch((err) => {
      console.warn("RTDB topup gagal:", err.message);
    });
  }

  // Jual / Tarik Dana Investasi (Investasi Keluar)
  public static async withdrawMoneyMarket(
    id: string,
    amount: number,
    date: string,
    note?: string
  ): Promise<void> {
    const current = this.getMoneyMarket();
    const item = current.find((x) => x.id === id);
    if (!item) return;

    item.initialCapital = Math.max(0, item.initialCapital - amount);
    item.updatedAt = Date.now();
    item.history = [
      ...(item.history || []),
      {
        id: "h-" + Date.now(),
        date: date || new Date().toISOString().split("T")[0],
        type: "tarik",
        amount,
        note: note || "Jual / Tarik Dana Investasi",
      },
    ];

    setLocalData(LOCAL_STORAGE_KEYS.MONEY_MARKET, current);
    this.notify();

    set(ref(rtdb, `money_market/${id}`), item).catch((err) => {
      console.warn("RTDB withdraw gagal:", err.message);
    });
  }

  public static async deleteMoneyMarket(id: string): Promise<void> {
    const current = this.getMoneyMarket().filter((x) => x.id !== id);
    setLocalData(LOCAL_STORAGE_KEYS.MONEY_MARKET, current);
    this.notify();

    if (id && id !== "mm-live-sync") {
      remove(ref(rtdb, `money_market/${id}`)).catch((err) => {
        console.warn("RTDB deleteMoneyMarket gagal:", err.message);
      });
    }
  }

  // --- PLANNED ITEMS (WACANA BELANJA / TAGIHAN PENDING) ---
  public static getPlannedItems(): PlannedItem[] {
    return getLocalData(LOCAL_STORAGE_KEYS.PLANNED_ITEMS, DEFAULT_PLANNED_ITEMS);
  }

  public static async addPlannedItem(
    item: Omit<PlannedItem, "id" | "createdAt" | "isPaid">
  ): Promise<string> {
    const plannedRef = ref(rtdb, "planned_items");
    const newRef = push(plannedRef);
    const newId = newRef.key || "plan-" + Date.now();
    const newItem: PlannedItem = {
      ...item,
      id: newId,
      isPaid: false,
      createdAt: Date.now(),
    };

    const current = this.getPlannedItems();
    const updated = [newItem, ...current.filter((x) => x.id !== newId)];
    setLocalData(LOCAL_STORAGE_KEYS.PLANNED_ITEMS, updated);
    this.notify();

    set(newRef, newItem)
      .then(() => {
        this.isFirebaseConnected = true;
        this.notify();
      })
      .catch((err) => {
        console.warn("RTDB addPlannedItem gagal:", err.message);
      });

    return newId;
  }

  public static async updatePlannedItem(
    id: string,
    updated: Partial<Omit<PlannedItem, "id" | "createdAt">>
  ): Promise<void> {
    const current = this.getPlannedItems();
    const idx = current.findIndex((x) => x.id === id);
    if (idx === -1) return;

    const merged: PlannedItem = {
      ...current[idx],
      ...updated,
    };
    current[idx] = merged;
    setLocalData(LOCAL_STORAGE_KEYS.PLANNED_ITEMS, current);
    this.notify();

    update(ref(rtdb, `planned_items/${id}`), updated)
      .then(() => {
        this.isFirebaseConnected = true;
        this.notify();
      })
      .catch((err) => {
        console.warn("RTDB updatePlannedItem gagal:", err.message);
      });
  }

  public static async deletePlannedItem(id: string): Promise<void> {
    const current = this.getPlannedItems().filter((x) => x.id !== id);
    setLocalData(LOCAL_STORAGE_KEYS.PLANNED_ITEMS, current);
    this.notify();

    remove(ref(rtdb, `planned_items/${id}`)).catch((err) => {
      console.warn("RTDB deletePlannedItem gagal:", err.message);
    });
  }

  // Eksekusi pembayaran wacana: Otomatis potong saldo (buat ExpenseItem) & update status wacana
  public static async executePlannedPayment(
    id: string,
    actualAmount: number,
    paidDate: string
  ): Promise<void> {
    const current = this.getPlannedItems();
    const item = current.find((x) => x.id === id);
    if (!item) return;

    // 1. Buat Pengeluaran Riil (Memotong Saldo Kas)
    const expenseMonth = paidDate.slice(0, 7);
    await this.addExpense({
      date: paidDate,
      month: expenseMonth,
      amount: actualAmount,
      category: item.category,
      title: item.title,
      note: `[Wacana Terealisasi] ${item.note || item.title}`,
    });

    // 2. Tandai wacana sebagai lunas / terbeli
    await this.updatePlannedItem(id, {
      isPaid: true,
      paidDate,
      paidAmount: actualAmount,
    });
  }

  // --- FINANCIAL GOALS (CELENGAN IMPIAN & TARGET TABUNGAN) ---
  public static getGoals(): FinancialGoal[] {
    return getLocalData(LOCAL_STORAGE_KEYS.GOALS, DEFAULT_GOALS);
  }

  public static async addGoal(
    item: Omit<FinancialGoal, "id" | "createdAt" | "isCompleted">
  ): Promise<string> {
    const goalsRef = ref(rtdb, "financial_goals");
    const newRef = push(goalsRef);
    const newId = newRef.key || "goal-" + Date.now();
    const newGoal: FinancialGoal = {
      ...item,
      id: newId,
      isCompleted: item.currentAmount >= item.targetAmount,
      createdAt: Date.now(),
    };

    const current = this.getGoals();
    const updated = [newGoal, ...current.filter((x) => x.id !== newId)];
    setLocalData(LOCAL_STORAGE_KEYS.GOALS, updated);
    this.notify();

    set(newRef, newGoal)
      .then(() => {
        this.isFirebaseConnected = true;
        this.notify();
      })
      .catch((err) => {
        console.warn("RTDB addGoal gagal:", err.message);
      });

    return newId;
  }

  public static async updateGoal(
    id: string,
    updated: Partial<Omit<FinancialGoal, "id" | "createdAt">>
  ): Promise<void> {
    const current = this.getGoals();
    const idx = current.findIndex((x) => x.id === id);
    if (idx === -1) return;

    const merged: FinancialGoal = {
      ...current[idx],
      ...updated,
    };
    if (merged.currentAmount >= merged.targetAmount && !merged.isCompleted) {
      merged.isCompleted = true;
      merged.completedDate = new Date().toISOString().split("T")[0];
    }

    current[idx] = merged;
    setLocalData(LOCAL_STORAGE_KEYS.GOALS, current);
    this.notify();

    update(ref(rtdb, `financial_goals/${id}`), merged)
      .then(() => {
        this.isFirebaseConnected = true;
        this.notify();
      })
      .catch((err) => {
        console.warn("RTDB updateGoal gagal:", err.message);
      });
  }

  public static async deleteGoal(id: string): Promise<void> {
    const current = this.getGoals().filter((x) => x.id !== id);
    setLocalData(LOCAL_STORAGE_KEYS.GOALS, current);
    this.notify();

    remove(ref(rtdb, `financial_goals/${id}`)).catch((err) => {
      console.warn("RTDB deleteGoal gagal:", err.message);
    });
  }

  // Setor ke celengan impian: Menambah saldo celengan & mencatat SavingsAllocation bulanan,
  // serta otomatis sinkron ke produk tabungan / pasar uang yang dipilih
  public static async depositToGoal(
    goalId: string,
    amount: number,
    date: string,
    fundingSource: "salary" | "external" = "salary",
    linkedAccountName?: string,
    linkedMoneyMarketId?: string
  ): Promise<void> {
    const current = this.getGoals();
    const goal = current.find((x) => x.id === goalId);
    if (!goal) return;

    const newCurrent = goal.currentAmount + amount;
    const isCompleted = newCurrent >= goal.targetAmount;

    // 1. Jika terhubung ke produk pasar uang, otomatis top up produk pasar uang tersebut
    const targetMMId = linkedMoneyMarketId || goal.linkedMoneyMarketId;
    if (targetMMId) {
      await this.topUpMoneyMarket(
        targetMMId,
        amount,
        date,
        `Setoran Celengan: ${goal.title}`
      );
    }

    // 2. Tentukan nama akun tabungan
    const targetAccName =
      linkedAccountName ||
      goal.linkedAccountName ||
      (targetMMId ? this.getMoneyMarket().find((m) => m.id === targetMMId)?.name : null) ||
      `Celengan: ${goal.title}`;

    // 3. Catat ke Alokasi Tabungan Bulanan (tampil di Daftar Alokasi Tabungan)
    await this.addSavings({
      date,
      month: date.slice(0, 7),
      amount,
      targetType: targetMMId ? "money_market" : "goal",
      accountName: targetAccName,
      fundingSource,
      note: `Setoran ke celengan impian [${goal.title}]`,
    });

    // 4. Perbarui progres saldo Celengan
    await this.updateGoal(goalId, {
      currentAmount: newCurrent,
      isCompleted,
      completedDate: isCompleted ? date : undefined,
      linkedMoneyMarketId: targetMMId,
      linkedAccountName: targetAccName,
    });
  }

  // Alokasikan saldo dari tabungan/pasar uang yang SUDAH ADA ke Celengan Impian
  public static async allocateExistingSavingsToGoal(
    goalId: string,
    amount: number,
    sourceName: string,
    moneyMarketId?: string,
    isSetExact: boolean = false
  ): Promise<void> {
    const current = this.getGoals();
    const goal = current.find((x) => x.id === goalId);
    if (!goal) return;

    const newCurrent = isSetExact ? amount : goal.currentAmount + amount;
    const isCompleted = newCurrent >= goal.targetAmount;

    await this.updateGoal(goalId, {
      currentAmount: newCurrent,
      isCompleted,
      completedDate: isCompleted ? new Date().toISOString().split("T")[0] : undefined,
      linkedMoneyMarketId: moneyMarketId || goal.linkedMoneyMarketId,
      linkedAccountName: sourceName,
    });
  }

  // Hubungkan Celengan ke Tabungan / Pasar Uang yang ada, dengan opsi alokasi saldo awal
  public static async linkGoalToSavings(
    goalId: string,
    sourceName: string,
    moneyMarketId?: string,
    allocateAmount: number = 0
  ): Promise<void> {
    const current = this.getGoals();
    const goal = current.find((x) => x.id === goalId);
    if (!goal) return;

    const newCurrent = allocateAmount > 0 ? goal.currentAmount + allocateAmount : goal.currentAmount;
    const isCompleted = newCurrent >= goal.targetAmount;

    await this.updateGoal(goalId, {
      currentAmount: newCurrent,
      isCompleted,
      completedDate: isCompleted ? new Date().toISOString().split("T")[0] : undefined,
      linkedMoneyMarketId: moneyMarketId || goal.linkedMoneyMarketId,
      linkedAccountName: sourceName,
    });
  }
}

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
} from "@/types/finance";

// Storage keys untuk fallback lokal (v2 tanpa data dummy)
const LOCAL_STORAGE_KEYS = {
  INCOMES: "keuangan_incomes_v2",
  EXPENSES: "keuangan_expenses_v2",
  SAVINGS: "keuangan_savings_v2",
  MONEY_MARKET: "keuangan_money_market_v2",
};

// Data Awal Bersih Tanpa Data Dummy (Clean Empty State)
const DEFAULT_INCOMES: IncomeItem[] = [];
const DEFAULT_EXPENSES: ExpenseItem[] = [];
const DEFAULT_SAVINGS: SavingsAllocation[] = [];
const DEFAULT_MONEY_MARKET: MoneyMarketProduct[] = [];

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

  // Inisialisasi sinkronisasi Firebase Realtime Database
  public static initSync() {
    if (typeof window === "undefined") return;

    // Bersihkan legacy dummy keys versi sebelumnya jika ada
    [
      "keuangan_incomes_v1",
      "keuangan_expenses_v1",
      "keuangan_savings_v1",
      "keuangan_money_market_v1",
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
              id: key,
              ...val,
            }));
            list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
            setLocalData(LOCAL_STORAGE_KEYS.INCOMES, list);
          } else {
            // Jika Realtime Database kosong tapi lokal ada data, sinkronkan ke cloud
            const local = getLocalData<IncomeItem[]>(LOCAL_STORAGE_KEYS.INCOMES, []);
            if (local.length > 0) {
              local.forEach((item) => {
                const newRef = push(incomesRef);
                set(newRef, {
                  date: item.date,
                  month: item.month,
                  amount: item.amount,
                  category: item.category,
                  source: item.source,
                  note: item.note || "",
                  createdAt: item.createdAt || Date.now(),
                });
              });
            }
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
              id: key,
              ...val,
            }));
            list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
            setLocalData(LOCAL_STORAGE_KEYS.EXPENSES, list);
          } else {
            // Jika Realtime Database kosong tapi lokal ada data (seperti -Rp 15.000 Makan), unggah ke RTDB!
            const local = getLocalData<ExpenseItem[]>(LOCAL_STORAGE_KEYS.EXPENSES, []);
            if (local.length > 0) {
              local.forEach((item) => {
                const newRef = push(expensesRef);
                set(newRef, {
                  date: item.date,
                  month: item.month,
                  amount: item.amount,
                  category: item.category,
                  title: item.title || "",
                  note: item.note || "",
                  createdAt: item.createdAt || Date.now(),
                });
              });
            }
          }
          this.notify();
        },
        (err) => {
          console.warn("RTDB [expenses] error:", err.message);
          this.isFirebaseConnected = false;
          this.notify();
        }
      );

      // 3. Listener Savings
      const savingsRef = ref(rtdb, "savings");
      onValue(
        savingsRef,
        (snapshot) => {
          this.isFirebaseConnected = true;
          if (snapshot.exists()) {
            const data = snapshot.val();
            const list: SavingsAllocation[] = Object.entries(data).map(([key, val]: [string, any]) => ({
              id: key,
              ...val,
            }));
            list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
            setLocalData(LOCAL_STORAGE_KEYS.SAVINGS, list);
            this.syncMoneyMarketFromSavings(list);
          } else {
            const local = getLocalData<SavingsAllocation[]>(LOCAL_STORAGE_KEYS.SAVINGS, []);
            if (local.length > 0) {
              local.forEach((item) => {
                const newRef = push(savingsRef);
                set(newRef, {
                  date: item.date,
                  month: item.month,
                  amount: item.amount,
                  targetType: item.targetType,
                  accountName: item.accountName,
                  note: item.note || "",
                  createdAt: item.createdAt || Date.now(),
                });
              });
              this.syncMoneyMarketFromSavings(local);
            }
          }
          this.notify();
        },
        (err) => {
          console.warn("RTDB [savings] error:", err.message);
          this.isFirebaseConnected = false;
          this.notify();
        }
      );

      // 4. Listener Money Market
      const mmRef = ref(rtdb, "money_market");
      onValue(
        mmRef,
        (snapshot) => {
          this.isFirebaseConnected = true;
          if (snapshot.exists()) {
            const data = snapshot.val();
            const list: MoneyMarketProduct[] = Object.entries(data).map(([key, val]: [string, any]) => ({
              id: key,
              ...val,
            }));
            setLocalData(LOCAL_STORAGE_KEYS.MONEY_MARKET, list);
            this.deduplicateMoneyMarket();
            if (list.length === 0) {
              this.syncMoneyMarketFromSavings();
            }
          } else {
            const local = getLocalData<MoneyMarketProduct[]>(LOCAL_STORAGE_KEYS.MONEY_MARKET, []);
            if (local.length > 0) {
              local.forEach((item) => {
                const newRef = push(mmRef);
                set(newRef, item);
              });
            } else {
              this.syncMoneyMarketFromSavings();
            }
          }
          this.notify();
        },
        (err) => {
          console.warn("RTDB [money_market] error:", err.message);
          this.isFirebaseConnected = false;
          this.notify();
        }
      );
    } catch (e) {
      console.warn("RTDB init error:", e);
      this.isFirebaseConnected = false;
    }

    // Auto-cek dan sinkronisasi awal
    this.syncMoneyMarketFromSavings();
  }

  // Bersihkan produk duplikat dengan nama yang sama secara otomatis
  public static deduplicateMoneyMarket() {
    if (typeof window === "undefined") return;
    const currentMM = getLocalData<MoneyMarketProduct[]>(LOCAL_STORAGE_KEYS.MONEY_MARKET, []);
    if (currentMM.length <= 1) return;

    const uniqueMap = new Map<string, MoneyMarketProduct>();
    const duplicateIds: string[] = [];

    for (const item of currentMM) {
      const key = (item.name || "").trim().toLowerCase();
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, { ...item });
      } else {
        const first = uniqueMap.get(key)!;
        // Gabungkan riwayat
        first.history = [
          ...(first.history || []),
          ...(item.history || []),
        ];
        duplicateIds.push(item.id);
      }
    }

    if (duplicateIds.length > 0) {
      const cleanedList = Array.from(uniqueMap.values());
      setLocalData(LOCAL_STORAGE_KEYS.MONEY_MARKET, cleanedList);
      duplicateIds.forEach((id) => {
        remove(ref(rtdb, `money_market/${id}`)).catch(() => {});
      });
      cleanedList.forEach((prod) => {
        update(ref(rtdb, `money_market/${prod.id}`), {
          initialCapital: prod.initialCapital,
          history: prod.history,
          updatedAt: Date.now(),
        }).catch(() => {});
      });
      this.notify();
    }
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
    setLocalData(LOCAL_STORAGE_KEYS.INCOMES, []);
    setLocalData(LOCAL_STORAGE_KEYS.EXPENSES, []);
    setLocalData(LOCAL_STORAGE_KEYS.SAVINGS, []);
    setLocalData(LOCAL_STORAGE_KEYS.MONEY_MARKET, []);
    this.notify();

    remove(ref(rtdb, "incomes")).catch(() => {});
    remove(ref(rtdb, "expenses")).catch(() => {});
    remove(ref(rtdb, "savings")).catch(() => {});
    remove(ref(rtdb, "money_market")).catch(() => {});
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
      if (mmList.length > 0) {
        const targetMM =
          mmList.find((m) =>
            m.name.toLowerCase().includes(
              (newItem.accountName || "pasar uang").toLowerCase()
            )
          ) || mmList[0];
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

        update(ref(rtdb, `money_market/${targetMM.id}`), {
          initialCapital: targetMM.initialCapital,
          history: targetMM.history,
          updatedAt: targetMM.updatedAt,
        }).catch(() => {});
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
        setLocalData(LOCAL_STORAGE_KEYS.MONEY_MARKET, [autoProduct]);
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
    const uniqueMap = new Map<string, MoneyMarketProduct>();
    for (const item of raw) {
      const key = (item.name || "").trim().toLowerCase();
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, item);
      }
    }
    return Array.from(uniqueMap.values());
  }

  public static async addMoneyMarketProduct(
    product: Omit<MoneyMarketProduct, "id" | "updatedAt">
  ): Promise<void> {
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

    update(ref(rtdb, `money_market/${id}`), {
      initialCapital: item.initialCapital,
      history: item.history,
      updatedAt: item.updatedAt,
    }).catch((err) => {
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

    update(ref(rtdb, `money_market/${id}`), {
      initialCapital: item.initialCapital,
      history: item.history,
      updatedAt: item.updatedAt,
    }).catch((err) => {
      console.warn("RTDB withdraw gagal:", err.message);
    });
  }

  public static async deleteMoneyMarket(id: string): Promise<void> {
    const current = this.getMoneyMarket().filter((x) => x.id !== id);
    setLocalData(LOCAL_STORAGE_KEYS.MONEY_MARKET, current);
    this.notify();

    remove(ref(rtdb, `money_market/${id}`)).catch((err) => {
      console.warn("RTDB deleteMoneyMarket gagal:", err.message);
    });
  }
}

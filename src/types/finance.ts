export type IncomeCategory =
  | "Gaji Pokok"
  | "Tunjangan"
  | "Bonus / THR"
  | "Freelance / Side Job"
  | "Hasil Investasi"
  | "Lainnya";

export type ExpenseCategory =
  | "Makan & Minuman"
  | "Tagihan & Utilitas"
  | "Belanja Bulanan"
  | "Transportasi"
  | "Tempat Tinggal (Sewa/KPR)"
  | "Hiburan & Gaya Hidup"
  | "Kesehatan & Asuransi"
  | "Pendidikan"
  | "Cicilan & Utang"
  | "Keluarga & Donasi"
  | "Lainnya";

export type SavingsTargetType =
  | "regular"       // Tabungan Reguler / Tabungan Bank
  | "emergency"     // Dana Darurat
  | "money_market"  // Dialokasikan ke Pasar Uang
  | "goal";         // Target Impian (Liburan, Gadget, dll)

export interface IncomeItem {
  id: string;
  date: string; // YYYY-MM-DD
  month: string; // YYYY-MM
  amount: number;
  category: IncomeCategory;
  source: string; // misal "PT Maju Bersama" atau "Klien Proyek A"
  note?: string;
  createdAt: number;
}

export interface ExpenseItem {
  id: string;
  date: string; // YYYY-MM-DD
  month: string; // YYYY-MM
  amount: number;
  category: ExpenseCategory;
  note: string;
  createdAt: number;
}

export interface SavingsAllocation {
  id: string;
  date: string; // YYYY-MM-DD
  month: string; // YYYY-MM
  amount: number;
  targetType: SavingsTargetType;
  accountName: string; // misal "BCA Tabungan", "Bibit Reksadana", dll.
  note?: string;
  createdAt: number;
}

export interface MoneyMarketProduct {
  id: string;
  name: string; // misal "Sucorinvest Money Market Fund", "Mandiri Pasar Uang"
  platform: string; // misal "Bibit", "Bareksa", "Ajaib", "Bank"
  initialCapital: number; // modal pokok total yang disetor
  returnRatePa: number; // persentase return per tahun (misal 5.8%)
  startDate: string; // tanggal mulai investasi YYYY-MM-DD
  accumulatedReturn?: number; // keuntungan yang sudah dicatat/dihitung
  notes?: string;
  history?: Array<{
    id: string;
    date: string;
    type: "topup" | "tarik" | "deviden";
    amount: number;
    note?: string;
  }>;
  updatedAt: number;
}

export interface MonthlyReconciliation {
  month: string;
  totalIncome: number;
  totalExpense: number;
  totalSavings: number;
  remainingSalary: number; // totalIncome - totalExpense - totalSavings
  savingsRate: number; // (totalSavings / totalIncome) * 100
  expenseRate: number; // (totalExpense / totalIncome) * 100
  status: "surplus" | "balanced" | "deficit";
}


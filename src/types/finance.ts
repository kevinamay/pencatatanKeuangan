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

export type SavingsFundingSource = "salary" | "external";

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
  title?: string;
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
  fundingSource?: SavingsFundingSource; // "salary" = potong gaji bulan ini, "external" = uang di luar gaji / mandiri
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
    fundingSource?: SavingsFundingSource;
    note?: string;
  }>;
  updatedAt: number;
}

export interface MonthlyReconciliation {
  month: string;
  totalIncome: number;
  totalExpense: number;
  totalSavings: number;
  salarySavings?: number;
  externalSavings?: number;
  remainingSalary: number; // totalIncome - totalExpense - (salarySavings ?? totalSavings)
  savingsRate: number; // (totalSavings / totalIncome) * 100
  expenseRate: number; // (totalExpense / totalIncome) * 100
  status: "surplus" | "balanced" | "deficit";
}

export type PlannedItemUrgency = "penting" | "keinginan" | "santai";
export type PlannedItemType = "expense" | "savings";

export interface PlannedItem {
  id: string;
  title: string;
  estimatedAmount: number;
  category: ExpenseCategory | "Tabungan & Investasi";
  urgency: PlannedItemUrgency;
  targetMonth: string; // YYYY-MM
  note?: string;
  isPaid: boolean;
  paidDate?: string; // YYYY-MM-DD
  paidAmount?: number;
  expenseId?: string; // ID transaksi pengeluaran yang terhubung saat centang
  itemType?: PlannedItemType; // "expense" (belanja) vs "savings" (tabungan)
  savingsTargetType?: SavingsTargetType; // regular, emergency, money_market, goal
  goalId?: string; // ID Celengan Impian jika diarahkan ke goal tertentu
  moneyMarketId?: string; // ID produk Pasar Uang jika diarahkan ke MM
  createdAt: number;
}

export type GoalCategory =
  | "gadget"
  | "liburan"
  | "darurat"
  | "kendaraan"
  | "rumah"
  | "pendidikan"
  | "investasi"
  | "lainnya";

export interface FinancialGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string; // YYYY-MM
  category: GoalCategory;
  iconEmoji: string;
  note?: string;
  linkedMoneyMarketId?: string;
  linkedAccountName?: string;
  isCompleted: boolean;
  completedDate?: string;
  createdAt: number;
}

/**
 * Helper untuk mencocokkan apakah suatu alokasi tabungan berhubungan
 * dengan produk pasar uang tertentu (berdasarkan nama, kata kunci, platform, atau ID).
 */
export function isSavingsMatchingMMProduct(
  saving: { accountName?: string; note?: string; targetType?: string; moneyMarketId?: string },
  product: { id?: string; name: string; platform?: string }
): boolean {
  if (!saving || !product) return false;
  if (saving.moneyMarketId && product.id && saving.moneyMarketId === product.id) return true;

  const sAcc = (saving.accountName || "").toLowerCase().trim();
  const sNote = (saving.note || "").toLowerCase().trim();
  const pName = (product.name || "").toLowerCase().trim();
  const pPlatform = (product.platform || "").toLowerCase().trim();

  // Normalisasi string (hilangkan spasi dan tanda baca)
  const normAcc = sAcc.replace(/[^a-z0-9]/g, "");
  const normPName = pName.replace(/[^a-z0-9]/g, "");

  if (normAcc && normPName) {
    if (normAcc.includes(normPName) || normPName.includes(normAcc)) return true;
  }

  // Pencocokan kata kunci khusus (misal Sucorinvest, Danamas, Batavia, dll)
  if (pName.includes("sucorinvest") && (sAcc.includes("sucorinvest") || sNote.includes("sucorinvest"))) return true;
  if (pName.includes("danamas") && (sAcc.includes("danamas") || sNote.includes("danamas"))) return true;
  if (pName.includes("batavia") && (sAcc.includes("batavia") || sNote.includes("batavia"))) return true;

  // Jika alokasi eksplisit money_market dan menyebut platform produk (misal Bibit)
  if (saving.targetType === "money_market" && pPlatform && sAcc.includes(pPlatform)) return true;

  return false;
}




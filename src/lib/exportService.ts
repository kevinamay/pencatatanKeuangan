import * as XLSX from "xlsx";
import {
  IncomeItem,
  ExpenseItem,
  SavingsAllocation,
  MoneyMarketProduct,
  PlannedItem,
  FinancialGoal,
  IncomeCategory,
  ExpenseCategory,
  SavingsTargetType,
  SavingsFundingSource,
  PlannedItemUrgency,
  PlannedItemType,
} from "@/types/finance";
import { FinanceStorage } from "./storage";

export interface ExportDataPayload {
  month: string;
  incomes: IncomeItem[];
  expenses: ExpenseItem[];
  savings: SavingsAllocation[];
  moneyMarket: MoneyMarketProduct[];
  plannedItems: PlannedItem[];
  financialGoals?: FinancialGoal[];
}

/**
 * Format angka ke format Rupiah standar untuk teks Excel
 */
function formatRupiah(num: number): string {
  return "Rp " + (num || 0).toLocaleString("id-ID");
}

/**
 * Ekspor data keuangan ke file Excel (.xlsx) dengan multi-sheet rapi
 */
export function exportToExcel(payload: ExportDataPayload): void {
  const { month, incomes, expenses, savings, moneyMarket, plannedItems } = payload;

  // Filter transaksi & gaji berdasarkan bulan yang dipilih jika ada
  const filteredIncomes = month ? incomes.filter((i) => i.month === month) : incomes;
  const filteredExpenses = month ? expenses.filter((e) => e.date.startsWith(month)) : expenses;
  const filteredSavings = month ? savings.filter((s) => s.month === month) : savings;

  const totalIncome = filteredIncomes.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const totalExpense = filteredExpenses.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const salarySavings = filteredSavings
    .filter((s) => s.fundingSource !== "external")
    .reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const externalSavings = filteredSavings
    .filter((s) => s.fundingSource === "external")
    .reduce((acc, curr) => acc + (curr.amount || 0), 0);

  const sisaGajiBersih = totalIncome - totalExpense - salarySavings;

  const workbook = XLSX.utils.book_new();

  // --- SHEET 1: RINGKASAN REKONSILIASI GAJI ---
  const summaryRows = [
    ["LAPORAN REKONSILIASI KEUANGAN - TOKYO NEKO FINPLAN"],
    ["Periode Bulan", month || "Semua Waktu"],
    ["Tanggal Cetak / Ekspor", new Date().toLocaleString("id-ID")],
    [],
    ["METRIK REKONSILIASI GAJI", "NOMINAL (RP)", "KETERANGAN"],
    ["Total Pemasukan Gaji Pokok", totalIncome, formatRupiah(totalIncome)],
    ["Total Belanja Pengeluaran", totalExpense, formatRupiah(totalExpense)],
    ["Total Tabungan dari Gaji", salarySavings, formatRupiah(salarySavings)],
    ["SISA GAJI BERSIH TERSEDIA", sisaGajiBersih, formatRupiah(sisaGajiBersih)],
    ["Status Keuangan", sisaGajiBersih >= 0 ? "Surplus Aman" : "Defisit (Perlu Evaluasi)"],
    [],
    ["TABUNGAN DILUAR GAJI POKOK", "NOMINAL (RP)", "KETERANGAN"],
    ["Tabungan dari Luar Gaji (Bonus/Side Income)", externalSavings, formatRupiah(externalSavings)],
  ];
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryRows);
  XLSX.utils.book_append_sheet(workbook, summarySheet, "Ringkasan Gaji");

  // --- SHEET 2: RIWAYAT BELANJA (EXPENSES) ---
  const expenseHeaders = [
    "ID Transaksi",
    "Tanggal",
    "Kategori Pos Belanja",
    "Keterangan / Keperluan",
    "Nominal Riil (Rp)",
  ];
  const expenseRows = filteredExpenses.map((exp) => [
    exp.id,
    exp.date,
    exp.category,
    exp.title || exp.note || "-",
    exp.amount,
  ]);
  const expenseSheet = XLSX.utils.aoa_to_sheet([
    ["RIWAYAT PENGELUARAN & BELANJA HARIAN"],
    expenseHeaders,
    ...expenseRows,
  ]);
  XLSX.utils.book_append_sheet(workbook, expenseSheet, "Transaksi Belanja");

  // --- SHEET 3: TABUNGAN & PASAR UANG ---
  const savingsHeaders = [
    "Nama Akun / Alokasi",
    "Tipe Alokasi",
    "Sumber Dana",
    "Tanggal Alokasi",
    "Nominal Tersimpan (Rp)",
  ];
  const savingsRows = filteredSavings.map((sav) => [
    sav.accountName,
    sav.targetType,
    sav.fundingSource === "external" ? "Luar Gaji" : "Potong Gaji",
    sav.date,
    sav.amount,
  ]);

  const mmHeaders = [
    "Produk Pasar Uang",
    "Platform Sekuritas",
    "Modal Pokok (Rp)",
    "Imbal Hasil / Return (% / thn)",
    "Estimasi Profit Harian (Rp)",
    "Total Akumulasi Keuntungan (Rp)",
    "Nilai Aset Sekarang (Rp)",
  ];
  const mmRows = moneyMarket.map((m) => {
    const dailyProfit = ((m.initialCapital || 0) * ((m.returnRatePa || 0) / 100)) / 365;
    const totalProfit = m.accumulatedReturn || 0;
    const totalAsset = (m.initialCapital || 0) + totalProfit;
    return [
      m.name,
      m.platform || "Bibit",
      m.initialCapital || 0,
      (m.returnRatePa || 0) + "%",
      Math.round(dailyProfit),
      Math.round(totalProfit),
      Math.round(totalAsset),
    ];
  });

  const portfolioSheet = XLSX.utils.aoa_to_sheet([
    ["DAFTAR ALOKASI TABUNGAN"],
    savingsHeaders,
    ...savingsRows,
    [],
    ["PORTOFOLIO REKSA DANA PASAR UANG"],
    mmHeaders,
    ...mmRows,
  ]);
  XLSX.utils.book_append_sheet(workbook, portfolioSheet, "Tabungan & Pasar Uang");

  // --- SHEET 4: RENCANA / WACANA BELANJA ---
  const plannedHeaders = [
    "Nama Rencana / Wacana",
    "Kategori Pos",
    "Estimasi Nominal (Rp)",
    "Tipe Rencana",
    "Status Realisasi",
    "Tanggal Realisasi",
  ];
  const plannedRows = plannedItems.map((p) => [
    p.title,
    p.category,
    p.estimatedAmount,
    p.itemType === "savings" ? "Alokasi Tabungan" : "Belanja Kebutuhan",
    p.isPaid ? "Sudah Terealisasi" : "Belum Direalisasikan",
    p.paidDate || "-",
  ]);
  const plannedSheet = XLSX.utils.aoa_to_sheet([
    ["DAFTAR RENCANA & WACANA KEUANGAN"],
    plannedHeaders,
    ...plannedRows,
  ]);
  XLSX.utils.book_append_sheet(workbook, plannedSheet, "Rencana Wacana");

  // Unduh file ke komputer / HP
  const filename = `Tokyo_Neko_Keuangan_${month || new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(workbook, filename);
}

/**
 * Ekspor seluruh data Firebase ke file JSON cadangan (Backup)
 */
export function exportBackupJson(payload: ExportDataPayload): void {
  const backupData = {
    app: "Tokyo Neko FinPlan",
    version: "2.0",
    exportDate: new Date().toISOString(),
    ...payload,
  };

  const jsonString = JSON.stringify(backupData, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `Tokyo_Neko_Backup_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Membaca dan memvalidasi file JSON cadangan untuk dipulihkan ke database
 */
export async function restoreBackupJson(file: File): Promise<{ success: boolean; message: string; count?: number }> {
  try {
    const text = await file.text();
    const data = JSON.parse(text);

    if (!data || typeof data !== "object") {
      throw new Error("File backup tidak valid.");
    }

    let restoredCount = 0;

    // 1. Incomes
    if (Array.isArray(data.incomes)) {
      for (const item of data.incomes) {
        if (item.amount) {
          await FinanceStorage.addIncome({
            date: item.date || new Date().toISOString().slice(0, 10),
            month: item.month || item.date?.slice(0, 7) || new Date().toISOString().slice(0, 7),
            amount: Number(item.amount),
            category: (item.category as IncomeCategory) || "Gaji Pokok",
            source: item.source || "Gaji Utama",
            note: item.note || "",
          });
          restoredCount++;
        }
      }
    }

    // 2. Expenses
    if (Array.isArray(data.expenses)) {
      for (const item of data.expenses) {
        if (item.amount) {
          await FinanceStorage.addExpense({
            date: item.date || new Date().toISOString().slice(0, 10),
            month: item.month || item.date?.slice(0, 7) || new Date().toISOString().slice(0, 7),
            amount: Number(item.amount),
            category: (item.category as ExpenseCategory) || "Belanja Bulanan",
            title: item.title,
            note: item.note || "",
          });
          restoredCount++;
        }
      }
    }

    // 3. Savings
    if (Array.isArray(data.savings)) {
      for (const item of data.savings) {
        if (item.amount) {
          await FinanceStorage.addSavings({
            accountName: item.accountName || item.name || "Tabungan",
            targetType: (item.targetType as SavingsTargetType) || "goal",
            fundingSource: (item.fundingSource as SavingsFundingSource) || "salary",
            amount: Number(item.amount),
            date: item.date || new Date().toISOString().slice(0, 10),
            month: item.month || item.date?.slice(0, 7) || new Date().toISOString().slice(0, 7),
            note: item.note,
          });
          restoredCount++;
        }
      }
    }

    // 4. Money Market
    if (Array.isArray(data.moneyMarket)) {
      for (const item of data.moneyMarket) {
        if (item.name) {
          await FinanceStorage.addMoneyMarketProduct({
            name: item.name,
            platform: item.platform || "Bibit",
            initialCapital: Number(item.initialCapital || item.principalAmount || 0),
            returnRatePa: Number(item.returnRatePa || item.annualReturnRate || 5.5),
            startDate: item.startDate || new Date().toISOString().slice(0, 10),
            accumulatedReturn: Number(item.accumulatedReturn || item.accumulatedProfit || 0),
            notes: item.notes,
          });
          restoredCount++;
        }
      }
    }

    // 5. Planned Items
    if (Array.isArray(data.plannedItems)) {
      for (const item of data.plannedItems) {
        if (item.title) {
          await FinanceStorage.addPlannedItem({
            title: item.title,
            estimatedAmount: Number(item.estimatedAmount || 0),
            category: (item.category as any) || "Belanja Bulanan",
            urgency: (item.urgency as PlannedItemUrgency) || "penting",
            targetMonth: item.targetMonth || item.month || new Date().toISOString().slice(0, 7),
            itemType: (item.itemType as PlannedItemType) || "expense",
            savingsTargetType: item.savingsTargetType,
            note: item.note,
          });
          restoredCount++;
        }
      }
    }

    return {
      success: true,
      message: `Berhasil memulihkan ${restoredCount} catatan data keuangan ke database.`,
      count: restoredCount,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || "Gagal memproses file cadangan.",
    };
  }
}

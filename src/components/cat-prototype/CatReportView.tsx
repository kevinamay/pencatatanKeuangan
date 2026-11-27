"use client";

import React, { useState } from "react";
import {
  FileText,
  Printer,
  AlertCircle,
  CheckCircle,
  Sparkles,
  Cat,
  Award,
  FileSpreadsheet,
  Upload,
  Trash2,
} from "lucide-react";
import {
  IncomeItem,
  ExpenseItem,
  SavingsAllocation,
  MoneyMarketProduct,
} from "@/types/finance";
import {
  formatRupiah,
  FinanceStorage,
} from "@/lib/storage";
import { CatAnimation } from "./CatAnimations";
import { InteractiveCatMascot } from "./InteractiveCatMascot";
import { getCatThemeConfig } from "./catThemeConfig";
import { ImportStatementModal } from "./ImportStatementModal";

interface CatReportViewProps {
  incomes: IncomeItem[];
  expenses: ExpenseItem[];
  savings: SavingsAllocation[];
  moneyMarket?: MoneyMarketProduct[];
  selectedMonth: string;
  variantId: number;
  onOpenBackupExport?: () => void;
}

export const CatReportView: React.FC<CatReportViewProps> = ({
  incomes,
  expenses,
  savings,
  selectedMonth,
  variantId,
  onOpenBackupExport,
}) => {
  const theme = getCatThemeConfig(variantId);

  const currentIncomes = incomes.filter((i) => i.month === selectedMonth);
  const currentExpenses = expenses.filter((e) => e.month === selectedMonth);
  const currentSavings = savings.filter((s) => s.month === selectedMonth);

  const totalIncome = currentIncomes.reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = currentExpenses.reduce((acc, curr) => acc + curr.amount, 0);
  const totalSavings = currentSavings.reduce((acc, curr) => acc + curr.amount, 0);
  const salarySavings = currentSavings
    .filter((s) => s.fundingSource !== "external")
    .reduce((acc, curr) => acc + curr.amount, 0);
  const externalSavings = currentSavings
    .filter((s) => s.fundingSource === "external")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const remainingSalary = totalIncome - totalExpense - salarySavings;

  const expenseRate = totalIncome > 0 ? (totalExpense / totalIncome) * 100 : 0;
  const savingsRate = totalIncome > 0 ? (salarySavings / totalIncome) * 100 : 0;
  const remainingRate = totalIncome > 0 ? (remainingSalary / totalIncome) * 100 : 0;

  const isDeficit = remainingSalary < 0;
  const isHealthy = !isDeficit && totalIncome > 0;

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    // Generate CSV content with UTF-8 BOM
    const headers = ["Tanggal", "Jenis", "Kategori", "Keterangan", "Nominal", "Sumber Dana"];
    const rows: string[] = [];

    currentIncomes.forEach((item) => {
      rows.push(
        [
          item.date || `${selectedMonth}-01`,
          "Pemasukan",
          item.category || "Gaji",
          `"${(item.source || item.note || "").replace(/"/g, '""')}"`,
          item.amount,
          `"${(item.source || "Gaji").replace(/"/g, '""')}"`,
        ].join(",")
      );
    });

    currentExpenses.forEach((item) => {
      rows.push(
        [
          item.date || `${selectedMonth}-01`,
          "Pengeluaran",
          item.category || "Umum",
          `"${(item.title || item.note || "").replace(/"/g, '""')}"`,
          item.amount,
          "-",
        ].join(",")
      );
    });

    currentSavings.forEach((item) => {
      rows.push(
        [
          item.date || `${selectedMonth}-01`,
          "Tabungan",
          item.targetType || "Simpanan",
          `"${(item.accountName || item.note || "").replace(/"/g, '""')}"`,
          item.amount,
          item.fundingSource === "external" ? "Luar Gaji (THR/Bonus)" : "Dari Gaji",
        ].join(",")
      );
    });

    const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Laporan-Keuangan-TokyoNeko-${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16 print:p-0 print:m-0">
      {/* Top Banner (Hidden in Print) */}
      <div
        className="rounded-3xl p-6 sm:p-8 border shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 print:hidden"
        style={{
          backgroundColor: theme.isDark ? "#111827" : "#FFFFFF",
          borderColor: theme.cardBorder,
        }}
      >
        <div className="space-y-2 text-center md:text-left">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black"
            style={{
              backgroundColor: `${theme.accent}15`,
              color: theme.accent,
            }}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Audit Rekonsiliasi Resmi Meow Authority</span>
          </div>
          <h1
            className="text-2xl sm:text-3xl font-black tracking-tight"
            style={{ color: theme.isDark ? "#FFFFFF" : theme.textColor }}
          >
            Sertifikat & Lembar Rekonsiliasi
          </h1>
          <p
            className="text-xs sm:text-sm font-medium max-w-xl"
            style={{ color: theme.mutedText }}
          >
            Audit neraca arus kas pribadi Anda. Memastikan setiap rupiah gaji teralokasi presisi tanpa kebocoran anggaran.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <InteractiveCatMascot
            animation={theme.pageAnimations.report}
            theme={theme}
            size="lg"
          />

          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2.5">
            <button
              onClick={() => (onOpenBackupExport ? onOpenBackupExport() : handleExportCSV())}
              className="px-3.5 py-2.5 rounded-2xl text-xs font-black border transition-all flex items-center gap-1.5 shadow-2xs hover:bg-stone-50 active:scale-95 cursor-pointer"
              style={{
                borderColor: theme.cardBorder,
                color: theme.textColor,
                backgroundColor: theme.isDark ? "#1F2937" : "#FFFFFF",
              }}
              title="Unduh seluruh data transaksi bulan ini ke format Excel (.xlsx) atau cadangkan data"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Export Excel (.xlsx)</span>
            </button>

            <button
              onClick={() => setIsImportModalOpen(true)}
              className="px-3.5 py-2.5 rounded-2xl text-xs font-black border transition-all flex items-center gap-1.5 shadow-2xs hover:bg-stone-50 active:scale-95"
              style={{
                borderColor: theme.cardBorder,
                color: theme.textColor,
                backgroundColor: theme.isDark ? "#1F2937" : "#FFFFFF",
              }}
              title="Upload mutasi rekening BCA, Mandiri, Jenius, GoPay, OVO"
            >
              <Upload className="w-4 h-4 text-blue-600" />
              <span>Import Mutasi Bank</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-4 py-2.5 rounded-2xl text-white text-xs font-black shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center gap-2"
              style={{ backgroundColor: theme.accent }}
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Kuitansi</span>
            </button>

            <button
              onClick={async () => {
                if (
                  confirm(
                    "⚠️ PERINGATAN: Apakah Anda yakin ingin MENGHAPUS SEMUA DATA transaksi, tabungan, dan wacana untuk mulai dari awal?"
                  )
                ) {
                  await FinanceStorage.clearAllData();
                  alert("Seluruh data berhasil dikosongkan. Anda dapat mulai menginput dari awal!");
                }
              }}
              className="px-3.5 py-2.5 rounded-2xl text-xs font-black border border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100 transition-all flex items-center gap-1.5 active:scale-95 shadow-2xs"
              title="Kosongkan seluruh data proyek untuk mulai input dari awal"
            >
              <Trash2 className="w-4 h-4 text-rose-600" />
              <span>Reset Bersih Data</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Reconciliation Receipt Card (The one printed!) */}
      <div
        id="printable-receipt"
        className="max-w-3xl mx-auto rounded-3xl border p-6 sm:p-10 shadow-lg relative bg-white text-slate-900 print:shadow-none print:border-none print:p-0"
        style={{
          borderColor: theme.cardBorder,
        }}
      >
        {/* Header of Receipt */}
        <div className="flex items-start justify-between border-b pb-6" style={{ borderColor: theme.cardBorder }}>
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center p-1 border shadow-xs"
              style={{
                backgroundColor: theme.bgPage,
                borderColor: theme.cardBorder,
              }}
            >
              <CatAnimation variant={theme.pageAnimations.report} className="w-full h-full" />
            </div>
            <div>
              <span
                className="text-lg font-black tracking-tighter uppercase font-mono block text-[#8B0000]"
              >
                LEMBAR REKONSILIASI KEUANGAN
              </span>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                FINPLAN KEBERLANJUTAN ARUS KAS PRIBADI
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Bulan Alokasi</span>
            <span className="text-sm font-black font-mono text-slate-800">{selectedMonth}</span>
          </div>
        </div>

        {/* Status Box */}
        <div
          className="my-6 p-4 rounded-2xl border flex items-center gap-3"
          style={{
            backgroundColor: isDeficit ? "#FEF2F2" : "#F0FDF4",
            borderColor: isDeficit ? "#FECACA" : "#BBF7D0",
          }}
        >
          {isDeficit ? (
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          ) : (
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          )}
          <div>
            <h4
              className={`text-xs font-black uppercase tracking-wider ${
                isDeficit ? "text-rose-700" : "text-emerald-700"
              }`}
            >
              {isDeficit
                ? "Status: DEFISIT / MELEBIHI GAJI"
                : "Status: SEHAT & SEIMBANG (MEOW APPROVED)"}
            </h4>
            <p className="text-[11px] text-slate-600">
              {isDeficit
                ? "Pengeluaran dan alokasi tabungan melebihi pemasukan bulan ini. Periksa kembali pos pengeluaran."
                : "Seluruh pemasukan telah dialokasikan dengan tertib tanpa ada kebocoran anggaran."}
            </p>
          </div>
        </div>

        {/* Detailed Financial Breakdown Table */}
        <div className="space-y-4">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
            AUDIT NERACA PEMASUKAN VS PENGELUARAN & TABUNGAN
          </h4>

          <div className="border rounded-2xl overflow-hidden divide-y text-xs font-semibold" style={{ borderColor: theme.cardBorder }}>
            {/* Income */}
            <div className="p-3.5 flex items-center justify-between bg-emerald-50/50">
              <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                <span>[+]</span> Total Gaji & Pemasukan Masuk
              </span>
              <span className="font-black font-mono text-emerald-700">
                {formatRupiah(totalIncome)}
              </span>
            </div>

            {/* Expense */}
            <div className="p-3.5 flex items-center justify-between bg-rose-50/50">
              <span className="font-bold text-rose-900 flex items-center gap-1.5">
                <span>[-]</span> Total Seluruh Belanja / Pengeluaran
              </span>
              <span className="font-black font-mono text-rose-700">
                ({formatRupiah(totalExpense)})
              </span>
            </div>

            {/* Savings (Salary Funded) */}
            <div className="p-3.5 flex items-center justify-between bg-blue-50/50">
              <span className="font-bold text-blue-900 flex items-center gap-1.5">
                <span>[-]</span> Alokasi Tabungan & Investasi (Dari Gaji)
              </span>
              <span className="font-black font-mono text-blue-700">
                ({formatRupiah(salarySavings)})
              </span>
            </div>

            {/* External Savings (Informational) */}
            {externalSavings > 0 && (
              <div className="p-3.5 flex items-center justify-between bg-slate-50 text-slate-500 text-[11px]">
                <span className="flex items-center gap-1.5">
                  <span>ℹ️</span> Investasi Tambahan (Di luar gaji / THR)
                </span>
                <span className="font-mono font-bold">
                  +{formatRupiah(externalSavings)}
                </span>
              </div>
            )}

            {/* Net Remaining Salary */}
            <div
              className="p-4 flex items-center justify-between text-sm"
              style={{
                backgroundColor: isDeficit ? "#FEF2F2" : "#F8FAFC",
              }}
            >
              <span className="font-black uppercase tracking-wider">
                [=] Sisa Kas Bersih Tersedia (Net Cashflow)
              </span>
              <span
                className={`font-black font-mono text-base ${
                  isDeficit ? "text-rose-600" : "text-slate-900"
                }`}
              >
                {formatRupiah(remainingSalary)}
              </span>
            </div>
          </div>
        </div>

        {/* 50/30/20 Benchmark Evaluation */}
        <div className="mt-8 pt-6 border-t space-y-4" style={{ borderColor: theme.cardBorder }}>
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">
              Evaluasi Benchmark Anggaran 50 / 30 / 20
            </h4>
            <span className="text-[10px] text-slate-400">Standar Manajemen Keuangan</span>
          </div>

          <div className="space-y-3 text-xs">
            {/* Needs */}
            <div className="space-y-1">
              <div className="flex justify-between font-bold text-slate-700">
                <span>Pengeluaran Kebutuhan & Hidup</span>
                <span className="font-mono">{expenseRate.toFixed(1)}% (Target: max 50%)</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, expenseRate)}%`,
                    backgroundColor: expenseRate > 50 ? "#E11D48" : "#10B981",
                  }}
                />
              </div>
            </div>

            {/* Savings */}
            <div className="space-y-1">
              <div className="flex justify-between font-bold text-slate-700">
                <span>Alokasi Tabungan & Investasi</span>
                <span className="font-mono">{savingsRate.toFixed(1)}% (Target: min 20%)</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500 bg-blue-500"
                  style={{ width: `${Math.min(100, savingsRate)}%` }}
                />
              </div>
            </div>

            {/* Remaining */}
            <div className="space-y-1">
              <div className="flex justify-between font-bold text-slate-700">
                <span>Sisa Kas Bebas</span>
                <span className="font-mono">{remainingRate.toFixed(1)}% (Target: ~30%)</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500 bg-amber-500"
                  style={{ width: `${Math.max(0, Math.min(100, remainingRate))}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Auditor Stamp Footer */}
        <div className="mt-8 pt-6 border-t flex items-center justify-between text-xs text-slate-400" style={{ borderColor: theme.cardBorder }}>
          <div className="flex items-center gap-2">
            <span className="text-base">🐾</span>
            <span className="font-semibold">Ditandatangani secara digital oleh Meow Financial AI</span>
          </div>
          <span className="font-mono text-[10px]">VERIFIED-{variantId}-CAT</span>
        </div>
      </div>

      {/* Bank & E-Wallet Statement Import Modal */}
      <ImportStatementModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        selectedMonth={selectedMonth}
        onImportSuccess={() => {
          // Refresh or let parent re-render
          window.location.reload();
        }}
      />
    </div>
  );
};

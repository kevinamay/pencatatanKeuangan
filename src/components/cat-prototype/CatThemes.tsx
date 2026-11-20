"use client";

import React, { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Shield,
  Coins,
  PiggyBank,
  Wallet,
  Receipt,
  FileText,
  Calendar,
  ChevronRight,
  Pencil,
  Trash2,
  ShieldCheck,
  Landmark,
} from "lucide-react";
import {
  IncomeItem,
  ExpenseItem,
  SavingsAllocation,
  MoneyMarketProduct,
} from "@/types/finance";
import {
  formatRupiah,
  formatTanggalIndo,
  calculateMoneyMarketProfit,
  FinanceStorage,
} from "@/lib/storage";
import { InteractiveCatMascot } from "./InteractiveCatMascot";
import { getCatThemeConfig, CatVariantConfig } from "./catThemeConfig";
import { DailyExpenseChart } from "@/components/DailyExpenseChart";
import {
  EditTransactionModal,
  EditableTransaction,
} from "@/components/EditTransactionModal";

export interface CatVariantProps {
  incomes: IncomeItem[];
  expenses: ExpenseItem[];
  savings: SavingsAllocation[];
  moneyMarket: MoneyMarketProduct[];
  selectedMonth: string;
  onOpenQuickAdd: (type?: "income" | "expense" | "savings") => void;
  onNavigateToTab?: (tab: "transactions" | "savings" | "report") => void;
}

// Universal financial calculation matching original web formulas
function useFinanceStats(
  incomes: IncomeItem[],
  expenses: ExpenseItem[],
  savings: SavingsAllocation[],
  moneyMarket: MoneyMarketProduct[],
  selectedMonth: string
) {
  const currentIncomes = incomes.filter((i) => i.month === selectedMonth);
  const currentExpenses = expenses.filter((e) => e.month === selectedMonth);
  const currentSavings = savings.filter((s) => s.month === selectedMonth);

  const totalIncome = currentIncomes.reduce((a, b) => a + b.amount, 0);
  const totalExpense = currentExpenses.reduce((a, b) => a + b.amount, 0);
  const totalSavings = currentSavings.reduce((a, b) => a + b.amount, 0);

  // Gaji hanya dikurangi tabungan yang bersumber dari gaji
  const salarySavings = currentSavings
    .filter((s) => s.fundingSource !== "external")
    .reduce((a, b) => a + b.amount, 0);
  const externalSavings = currentSavings
    .filter((s) => s.fundingSource === "external")
    .reduce((a, b) => a + b.amount, 0);

  const remainingSalary = totalIncome - totalExpense - salarySavings;

  const expenseRate = totalIncome > 0 ? (totalExpense / totalIncome) * 100 : 0;
  const savingsRate = totalIncome > 0 ? (salarySavings / totalIncome) * 100 : 0;
  const remainingRate = totalIncome > 0 ? (remainingSalary / totalIncome) * 100 : 0;

  const isSurplus = remainingSalary > 0;
  const isDeficit = remainingSalary < 0 && totalIncome > 0;
  const isZeroOrNoIncome = totalIncome === 0;

  const mmSummary = moneyMarket.reduce(
    (acc, m) => {
      const calc = calculateMoneyMarketProfit(
        m.initialCapital,
        m.returnRatePa,
        m.startDate,
        m.accumulatedReturn
      );
      acc.totalCapital += m.initialCapital;
      acc.totalProfit += calc.estimatedProfit;
      acc.totalValue += calc.totalValue;
      acc.monthlyYield += calc.monthlyReturn;
      return acc;
    },
    { totalCapital: 0, totalProfit: 0, totalValue: 0, monthlyYield: 0 }
  );

  // Category distribution
  const expenseByCategory: Record<string, number> = {};
  currentExpenses.forEach((exp) => {
    expenseByCategory[exp.category] = (expenseByCategory[exp.category] || 0) + exp.amount;
  });
  const sortedCategories = Object.entries(expenseByCategory).sort((a, b) => b[1] - a[1]);

  // Combined recent 5 transactions
  const recentTransactions: (EditableTransaction & {
    title: string;
    categoryLabel: string;
  })[] = [
    ...currentIncomes.map((i) => ({
      ...i,
      txType: "income" as const,
      month: i.month,
      title: i.source || i.category,
      categoryLabel: i.category,
    })),
    ...currentExpenses.map((e) => ({
      ...e,
      txType: "expense" as const,
      month: e.month,
      title: e.title || e.category,
      categoryLabel: e.category,
    })),
    ...currentSavings.map((s) => ({
      ...s,
      txType: "savings" as const,
      month: s.month,
      title: s.accountName || "Simpanan",
      categoryLabel:
        s.targetType === "money_market"
          ? "Pasar Uang"
          : s.targetType === "emergency"
          ? "Dana Darurat"
          : "Tabungan",
    })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return {
    totalIncome,
    totalExpense,
    totalSavings,
    salarySavings,
    externalSavings,
    remainingSalary,
    remainingRate,
    expenseRate,
    savingsRate,
    isSurplus,
    isDeficit,
    isZeroOrNoIncome,
    mmSummary,
    sortedCategories,
    recentTransactions,
    currentIncomes,
    currentExpenses,
    currentSavings,
  };
}

// =========================================================================
// 2. TOKYO MINIMALIST PAPER (Wabi-Sabi Warm Editorial Café - USER'S CHOICE)
// Complete Web Flow (Hero, 3 Pillars, Reconciliation Bar, MM & Category Grid,
// DailyExpenseChart, and Recent Transactions with Edit/Delete)
// =========================================================================
export const Variant2TokyoPaper: React.FC<CatVariantProps> = (props) => {
  const theme = getCatThemeConfig(2);
  const stats = useFinanceStats(
    props.incomes,
    props.expenses,
    props.savings,
    props.moneyMarket,
    props.selectedMonth
  );

  const [editingTx, setEditingTx] = useState<EditableTransaction | null>(null);

  const handleDelete = async (tx: (typeof stats.recentTransactions)[0]) => {
    if (confirm(`Apakah Anda yakin ingin menghapus catatan "${tx.title}" senilai ${formatRupiah(tx.amount)}?`)) {
      if (tx.txType === "income") await FinanceStorage.deleteIncome(tx.id);
      else if (tx.txType === "expense") await FinanceStorage.deleteExpense(tx.id);
      else if (tx.txType === "savings") await FinanceStorage.deleteSavings(tx.id);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in pb-16">
      {/* 1. Hero: Tokyo Editorial Card with BIGGER Sleeping Kitty Mascot */}
      <div className="rounded-3xl bg-white border border-[#E8E2D8] p-5 sm:p-8 sm:p-10 shadow-sm relative overflow-hidden transition-all duration-300">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          {/* Left: Financial Statement */}
          <div className="space-y-3.5 text-center lg:text-left max-w-xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAF7F2] text-[#854D0E] text-xs font-bold border border-[#E8E2D8] shadow-2xs">
              <span>☕</span>
              <span>Tokyo Wabi-Sabi FinPlan • Sistem Rekonsiliasi Keuangan</span>
            </div>

            <p className="text-xs uppercase font-bold text-stone-500 tracking-wider">
              Sisa Gaji Bersih Tersedia ({props.selectedMonth})
            </p>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#292524] tracking-tight font-mono">
              {formatRupiah(stats.remainingSalary)}
            </h1>

            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-medium">
              Total Gaji: <span className="text-stone-900 font-bold">{formatRupiah(stats.totalIncome)}</span> • 
              Terpotong Belanja: <span className="text-stone-900 font-bold">{formatRupiah(stats.totalExpense)}</span> • 
              Tabungan dari Gaji: <span className="text-stone-900 font-bold">{formatRupiah(stats.salarySavings)}</span>
              {stats.externalSavings > 0 && (
                <> • Tabungan Luar Gaji: <span className="text-[#854D0E] font-bold">+{formatRupiah(stats.externalSavings)}</span></>
              )}
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-2.5">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                  stats.isDeficit
                    ? "bg-rose-50 text-rose-700 border border-rose-200"
                    : stats.isSurplus
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : "bg-[#FAF7F2] text-[#854D0E] border border-[#E8E2D8]"
                }`}
              >
                {stats.isDeficit ? (
                  <>
                    <TrendingDown className="w-3.5 h-3.5 text-rose-600" />
                    Defisit Arus Kas ({stats.remainingRate.toFixed(1)}%)
                  </>
                ) : stats.isSurplus ? (
                  <>
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                    Surplus Aman (+{stats.remainingRate.toFixed(1)}% dari gaji)
                  </>
                ) : (
                  <>Arus Kas Seimbang (Rp 0)</>
                )}
              </span>
              <span className="text-xs text-stone-400 font-medium">
                Formula: Gaji - Belanja - Tabungan (dari Gaji)
              </span>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-2 sm:gap-3">
              <button
                onClick={() => props.onOpenQuickAdd("income")}
                className="px-4 py-2.5 rounded-xl bg-[#854D0E] hover:bg-[#713F12] text-white font-bold text-xs shadow-xs active:scale-95 transition-all flex items-center gap-1.5"
              >
                <Coins className="w-3.5 h-3.5" />
                <span>+ Catat Pemasukan Gaji</span>
              </button>
              <button
                onClick={() => props.onOpenQuickAdd("savings")}
                className="px-4 py-2.5 rounded-xl bg-[#FAF7F2] hover:bg-stone-200/70 text-stone-800 font-bold text-xs border border-[#E8E2D8] active:scale-95 transition-all flex items-center gap-1.5"
              >
                <PiggyBank className="w-3.5 h-3.5 text-[#854D0E]" />
                <span>+ Alokasi Tabungan</span>
              </button>
            </div>
          </div>

          {/* Right: PROMINENT BIGGER SLEEPING CAT MASCOT */}
          <div className="flex-shrink-0 text-center flex flex-col items-center justify-center">
            <InteractiveCatMascot
              animation={theme.pageAnimations.dashboard}
              theme={theme}
              size="xl"
            />
            <span className="block text-[11px] text-stone-400 font-medium mt-1">
              Kitty tertidur pulas... ketuk untuk menyapa 🐾
            </span>
          </div>
        </div>
      </div>

      {/* 2. 3 Pillar Summary Cards (Income, Expense, Wealth Allocation) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
        {/* Pillar 1: Total Gaji Masuk */}
        <div className="p-6 rounded-3xl bg-white border border-[#E8E2D8] shadow-2xs hover:shadow-sm transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Pemasukan Gaji Masuk
            </span>
            <div className="w-10 h-10 rounded-2xl bg-[#FAF7F2] text-[#854D0E] flex items-center justify-center font-bold border border-[#E8E2D8]">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-3xl font-black text-stone-900 tracking-tight font-mono">
              {formatRupiah(stats.totalIncome)}
            </h3>
            <p className="text-xs text-stone-500 font-medium">
              100% Arus Kas Masuk • {stats.currentIncomes.length} transaksi penerimaan
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#E8E2D8] flex items-center justify-between text-xs font-semibold text-stone-600">
            <span>Sumber Utama: Gaji Pokok</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
              Aktif
            </span>
          </div>
        </div>

        {/* Pillar 2: Total Pengeluaran */}
        <div className="p-6 rounded-3xl bg-white border border-[#E8E2D8] shadow-2xs hover:shadow-sm transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Total Pengeluaran
            </span>
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-700 flex items-center justify-center font-bold border border-rose-200">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-3xl font-black text-stone-900 tracking-tight font-mono">
              {formatRupiah(stats.totalExpense)}
            </h3>
            <p className="text-xs font-bold text-rose-700">
              {stats.expenseRate.toFixed(1)}% dari gaji • {stats.currentExpenses.length} pos pengeluaran
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#E8E2D8] flex items-center justify-between text-xs font-semibold text-stone-600">
            <span>Rasio Ideal: Max 50-70%</span>
            <span
              className={`px-2 py-0.5 rounded-full font-bold border ${
                stats.expenseRate <= 60
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-rose-50 text-rose-700 border-rose-200"
              }`}
            >
              {stats.expenseRate <= 60 ? "Terkendali" : "Tinggi"}
            </span>
          </div>
        </div>

        {/* Pillar 3: Tabungan & Pasar Uang */}
        <div className="p-6 rounded-3xl bg-white border border-[#E8E2D8] shadow-2xs hover:shadow-sm transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Tabungan & Pasar Uang
            </span>
            <div className="w-10 h-10 rounded-2xl bg-[#FAF7F2] text-[#854D0E] flex items-center justify-center font-bold border border-[#E8E2D8]">
              <PiggyBank className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-3xl font-black text-[#854D0E] tracking-tight font-mono">
              {formatRupiah(stats.totalSavings)}
            </h3>
            <p className="text-xs font-bold text-[#854D0E]">
              {stats.salarySavings > 0
                ? `${stats.savingsRate.toFixed(1)}% rasio dari gaji`
                : "Alokasi Mandiri / Luar Gaji"}
              {stats.externalSavings > 0 && stats.salarySavings > 0 && ` (+${formatRupiah(stats.externalSavings)} luar gaji)`}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#E8E2D8] flex items-center justify-between text-xs font-semibold">
            <span className="text-stone-500">Target Ideal: Min 20%</span>
            <button
              onClick={() => props.onNavigateToTab && props.onNavigateToTab("savings")}
              className="text-[#854D0E] font-bold hover:underline inline-flex items-center gap-0.5"
            >
              Portofolio
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Status Rekonsiliasi Gaji & Pengeluaran (Live Progress Split Bar) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E8E2D8] shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#854D0E]" />
              <h2 className="text-lg sm:text-xl font-black text-stone-900">
                Status Rekonsiliasi Gaji & Pengeluaran
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              Evaluasi perbandingan gaji yang diterima terhadap realisasi belanja dan alokasi tabungan.
            </p>
          </div>

          <div className="px-4 py-2 rounded-2xl bg-[#FAF7F2] border border-[#E8E2D8] text-left sm:text-right">
            <span className="block text-[10px] uppercase font-bold text-stone-400">
              Formula Rekonsiliasi
            </span>
            <span className="text-xs font-bold text-[#854D0E]">
              Gaji = Pengeluaran + Tabungan + Sisa Kas
            </span>
          </div>
        </div>

        {/* Visual Progress Split with Theme Colors */}
        <div className="space-y-3">
          <div className="h-6 w-full bg-stone-100 border border-[#E8E2D8] rounded-full overflow-hidden flex shadow-inner">
            <div
              style={{ width: `${Math.min(100, stats.expenseRate)}%` }}
              title={`Pengeluaran: ${stats.expenseRate.toFixed(1)}%`}
              className="bg-rose-500 h-full transition-all duration-500 hover:opacity-90 flex items-center justify-center text-[10px] font-bold text-white overflow-hidden"
            >
              {stats.expenseRate >= 12 ? `${stats.expenseRate.toFixed(1)}%` : ""}
            </div>
            <div
              style={{ width: `${Math.min(100 - stats.expenseRate, stats.savingsRate)}%` }}
              title={`Tabungan: ${stats.savingsRate.toFixed(1)}%`}
              className="bg-[#854D0E] h-full transition-all duration-500 hover:opacity-90 flex items-center justify-center text-[10px] font-bold text-white overflow-hidden"
            >
              {stats.savingsRate >= 12 ? `${stats.savingsRate.toFixed(1)}%` : ""}
            </div>
            {stats.remainingSalary > 0 && (
              <div
                style={{
                  width: `${Math.max(
                    0,
                    100 - Math.min(100, stats.expenseRate) - Math.min(100, stats.savingsRate)
                  )}%`,
                }}
                title={`Sisa Gaji: ${stats.remainingRate.toFixed(1)}%`}
                className="bg-emerald-600 h-full transition-all duration-500 hover:opacity-90 flex items-center justify-center text-[10px] font-bold text-white overflow-hidden"
              >
                {stats.remainingRate >= 12 ? `${stats.remainingRate.toFixed(1)}%` : ""}
              </div>
            )}
          </div>

          {/* Legend with Values */}
          <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-semibold pt-1">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500" />
              <span className="text-stone-600">
                Pengeluaran: <strong className="text-stone-900">{formatRupiah(stats.totalExpense)} ({stats.expenseRate.toFixed(1)}%)</strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#854D0E]" />
              <span className="text-stone-600">
                Alokasi Tabungan: <strong className="text-[#854D0E]">{formatRupiah(stats.totalSavings)} ({stats.savingsRate.toFixed(1)}%)</strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`w-3 h-3 rounded-full ${
                  stats.isDeficit ? "bg-rose-600" : "bg-emerald-600"
                }`}
              />
              <span className="text-stone-600">
                Sisa Kas Bersih:{" "}
                <strong className={stats.isDeficit ? "text-rose-600" : "text-emerald-700"}>
                  {formatRupiah(stats.remainingSalary)} ({stats.remainingRate.toFixed(1)}%)
                </strong>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Grid: Portofolio Pasar Uang & Distribusi Kategori Pengeluaran */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card Sorotan Tabungan Pasar Uang */}
        <div className="lg:col-span-1 rounded-3xl bg-gradient-to-br from-[#292524] to-[#1C1917] text-white p-6 sm:p-7 shadow-md border border-[#E8E2D8] flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-stone-300 text-xs font-bold uppercase tracking-wider">
                <Landmark className="w-4 h-4 text-amber-400" />
                <span>Portofolio Pasar Uang</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                Imbal Hasil Aktif
              </span>
            </div>

            <div className="space-y-1 pt-2">
              <p className="text-xs text-stone-400 font-medium">
                Total Nilai (Modal + Keuntungan)
              </p>
              <h3 className="text-3xl font-black text-white tracking-tight font-mono">
                {formatRupiah(stats.mmSummary.totalValue)}
              </h3>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2 text-xs">
              <div className="flex justify-between items-center text-stone-300">
                <span>Total Modal Disetor:</span>
                <span className="font-bold text-white">{formatRupiah(stats.mmSummary.totalCapital)}</span>
              </div>
              <div className="flex justify-between items-center text-emerald-400">
                <span className="flex items-center gap-1 font-bold">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  Keuntungan Berjalan:
                </span>
                <span className="font-black font-mono">+{formatRupiah(stats.mmSummary.totalProfit)}</span>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button
              onClick={() => props.onNavigateToTab && props.onNavigateToTab("savings")}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-xs"
            >
              <span>Kelola Portofolio Pasar Uang</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Card Distribusi Kategori Pengeluaran */}
        <div className="lg:col-span-2 rounded-3xl bg-white border border-[#E8E2D8] p-6 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-[#854D0E]" />
              <h3 className="font-black text-stone-900 text-base">
                Distribusi Kategori Pengeluaran
              </h3>
            </div>
            <span className="text-xs text-stone-400">
              {stats.sortedCategories.length} kategori aktif
            </span>
          </div>

          {stats.sortedCategories.length === 0 ? (
            <div className="py-12 text-center text-stone-400 text-xs">
              Belum ada catatan pengeluaran pada bulan ini.
            </div>
          ) : (
            <div className="space-y-3 pt-1">
              {stats.sortedCategories.slice(0, 4).map(([cat, amount]) => {
                const pct = stats.totalExpense > 0 ? (amount / stats.totalExpense) * 100 : 0;
                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-stone-700">{cat}</span>
                      <span className="font-mono text-stone-900">
                        {formatRupiah(amount)} ({pct.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-stone-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#854D0E] transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 5. Grafik Pengeluaran Harian */}
      <div className="rounded-3xl bg-white border border-[#E8E2D8] p-6 sm:p-7 shadow-xs">
        <DailyExpenseChart
          expenses={props.expenses}
          selectedMonth={props.selectedMonth}
          onOpenQuickAdd={() => props.onOpenQuickAdd("expense")}
        />
      </div>

      {/* 6. Catatan Transaksi Terakhir (Recent Transactions) */}
      <div className="rounded-3xl bg-white border border-[#E8E2D8] p-6 sm:p-7 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#854D0E]" />
            <h3 className="font-black text-stone-900 text-base">
              Catatan Transaksi Terakhir
            </h3>
          </div>
          <button
            onClick={() => props.onNavigateToTab && props.onNavigateToTab("transactions")}
            className="text-xs font-bold text-[#854D0E] hover:underline flex items-center gap-1"
          >
            <span>Lihat Semua Transaksi</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {stats.recentTransactions.length === 0 ? (
          <div className="py-10 text-center text-stone-400 text-xs">
            Belum ada transaksi tercatat pada bulan ini.
          </div>
        ) : (
          <div className="divide-y divide-[#E8E2D8]">
            {stats.recentTransactions.map((tx) => {
              const isIncome = tx.txType === "income";
              const isExpense = tx.txType === "expense";

              return (
                <div
                  key={tx.id}
                  className="py-3.5 flex items-center justify-between gap-4 hover:bg-[#FAF7F2]/60 px-2 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold ${
                        isIncome
                          ? "bg-emerald-50 text-emerald-700"
                          : isExpense
                          ? "bg-rose-50 text-rose-700"
                          : "bg-amber-50 text-[#854D0E]"
                      }`}
                    >
                      {isIncome ? "↗" : isExpense ? "↘" : "🪙"}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-stone-900 truncate">
                          {tx.title}
                        </span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-stone-100 text-stone-600">
                          {tx.categoryLabel}
                        </span>
                      </div>
                      <span className="text-[11px] text-stone-400">
                        {formatTanggalIndo(tx.date)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span
                      className={`text-sm font-black font-mono ${
                        isIncome
                          ? "text-emerald-700"
                          : isExpense
                          ? "text-rose-700"
                          : "text-[#854D0E]"
                      }`}
                    >
                      {isIncome ? "+" : isExpense ? "-" : ""}
                      {formatRupiah(tx.amount)}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditingTx(tx)}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
                        title="Edit Catatan"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(tx)}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Hapus Catatan"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingTx && (
        <EditTransactionModal
          isOpen={!!editingTx}
          onClose={() => setEditingTx(null)}
          transaction={editingTx}
        />
      )}
    </div>
  );
};

// Aliases for other variants so any reference continues to work
export const Variant1NekoBank = Variant2TokyoPaper;
export const Variant3NordicPastel = Variant2TokyoPaper;
export const Variant4NeoBrutalist = Variant2TokyoPaper;
export const Variant5MidnightOnyx = Variant2TokyoPaper;

"use client";

import React from "react";
import {
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Wallet,
  ShieldCheck,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  PieChart,
  Coins,
  ChevronRight,
  Landmark,
  Shield,
  CreditCard,
  Target,
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
} from "@/lib/storage";
import { LottieAnimation } from "@/components/LottieAnimation";

interface DashboardViewProps {
  selectedMonth: string;
  incomes: IncomeItem[];
  expenses: ExpenseItem[];
  savings: SavingsAllocation[];
  moneyMarket: MoneyMarketProduct[];
  onNavigateToTab: (tab: "transactions" | "savings" | "report") => void;
  onOpenQuickAdd: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  selectedMonth,
  incomes,
  expenses,
  savings,
  moneyMarket,
  onNavigateToTab,
  onOpenQuickAdd,
}) => {
  const currentIncomes = incomes.filter((item) => item.month === selectedMonth);
  const currentExpenses = expenses.filter((item) => item.month === selectedMonth);
  const currentSavings = savings.filter((item) => item.month === selectedMonth);

  const totalIncome = currentIncomes.reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = currentExpenses.reduce((acc, curr) => acc + curr.amount, 0);
  const totalSavings = currentSavings.reduce((acc, curr) => acc + curr.amount, 0);

  const remainingSalary = totalIncome - totalExpense - totalSavings;

  const expenseRate = totalIncome > 0 ? (totalExpense / totalIncome) * 100 : 0;
  const savingsRate = totalIncome > 0 ? (totalSavings / totalIncome) * 100 : 0;
  const remainingRate = totalIncome > 0 ? (remainingSalary / totalIncome) * 100 : 0;

  const isSurplus = remainingSalary > 0;
  const isDeficit = remainingSalary < 0;

  const mmSummary = moneyMarket.reduce(
    (acc, item) => {
      const calc = calculateMoneyMarketProfit(
        item.initialCapital,
        item.returnRatePa,
        item.startDate,
        item.accumulatedReturn
      );
      acc.totalCapital += item.initialCapital;
      acc.totalProfit += calc.estimatedProfit;
      acc.totalValue += calc.totalValue;
      acc.monthlyYield += calc.monthlyReturn;
      return acc;
    },
    { totalCapital: 0, totalProfit: 0, totalValue: 0, monthlyYield: 0 }
  );

  const expenseByCategory: Record<string, number> = {};
  currentExpenses.forEach((exp) => {
    expenseByCategory[exp.category] =
      (expenseByCategory[exp.category] || 0) + exp.amount;
  });

  const sortedCategories = Object.entries(expenseByCategory).sort(
    (a, b) => b[1] - a[1]
  );

  const combinedRecent = [
    ...currentIncomes.map((i) => ({
      ...i,
      type: "income" as const,
      title: i.source || i.category,
      subtitle: i.category,
    })),
    ...currentExpenses.map((e) => ({
      ...e,
      type: "expense" as const,
      title: e.note || e.category,
      subtitle: e.category,
    })),
    ...currentSavings.map((s) => ({
      ...s,
      type: "savings" as const,
      title: s.accountName,
      subtitle:
        s.targetType === "money_market"
          ? "Pasar Uang"
          : s.targetType === "emergency"
          ? "Dana Darurat"
          : "Tabungan",
    })),
  ]
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 5);

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in pb-12">
      {/* ============================================================== */}
      {/* EXECUTIVE NEO-BANK HERO SECTION (FIXED DESIGN #1)              */}
      {/* Featuring Live LottieFiles Animation (Flying Wallet & Money)  */}
      {/* ============================================================== */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#991213] via-[#b51819] to-[#7f0e0f] text-white p-7 sm:p-9 shadow-2xl shadow-[#991213]/25 border border-[#991213]">
        {/* Soft background ambient flare */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-[#FFD9D9]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-black/25 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
          {/* Left: Saldo Sisa Gaji & Financial Summary */}
          <div className="space-y-3 text-center lg:text-left max-w-xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFD9D9] text-[#991213] text-xs font-black shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-[#991213]" />
              <span>Executive Neo-Bank • Sistem Rekonsiliasi Keuangan</span>
            </div>

            <p className="text-xs sm:text-sm text-[#FFD9D9] uppercase font-bold tracking-wider pt-1">
              Sisa Gaji Bersih Tersedia ({selectedMonth})
            </p>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight">
              {formatRupiah(remainingSalary)}
            </h1>

            <p className="text-xs sm:text-sm text-[#FFD9D9] font-medium leading-relaxed">
              Total Gaji Masuk: <span className="text-white font-bold">{formatRupiah(totalIncome)}</span> • 
              Terpotong Belanja: <span className="text-white font-bold">{formatRupiah(totalExpense)}</span> • 
              Alokasi Tabungan: <span className="text-white font-bold">{formatRupiah(totalSavings)}</span>
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold ${
                  isDeficit
                    ? "bg-rose-950/80 text-rose-200 border border-rose-400/40"
                    : isSurplus
                    ? "bg-emerald-950/80 text-emerald-200 border border-emerald-400/40"
                    : "bg-white/20 text-white border border-white/30"
                }`}
              >
                {isDeficit ? (
                  <>
                    <TrendingDown className="w-3.5 h-3.5" />
                    Defisit Arus Kas ({remainingRate.toFixed(1)}%)
                  </>
                ) : isSurplus ? (
                  <>
                    <TrendingUp className="w-3.5 h-3.5" />
                    Surplus Aman (+{remainingRate.toFixed(1)}% dari gaji)
                  </>
                ) : (
                  <>Seimbang 100% Teralokasi</>
                )}
              </span>
              <span className="text-xs text-[#FFD9D9]/80 font-semibold hidden sm:inline">
                Formula: Gaji - Pengeluaran - Tabungan
              </span>
            </div>
          </div>

          {/* Center/Right: Action Buttons & Prominent Lottie Animation on the Right */}
          <div className="flex flex-col-reverse sm:flex-row items-center gap-6">
            {/* Quick Action Buttons (Left) */}
            <div className="flex flex-col gap-3 w-full sm:w-auto">
              <button
                onClick={onOpenQuickAdd}
                className="px-6 py-3.5 rounded-2xl bg-[#FFD9D9] hover:bg-white text-[#991213] font-black text-sm shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Coins className="w-4 h-4 text-[#991213]" />
                + Catat Transaksi
              </button>
              <button
                onClick={() => onNavigateToTab("report")}
                className="px-6 py-3.5 rounded-2xl bg-white/15 hover:bg-white/25 border border-[#FFD9D9]/40 text-white font-bold text-sm backdrop-blur-xs active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 text-[#FFD9D9]" />
                Audit Rekonsiliasi
                <ChevronRight className="w-4 h-4 text-[#FFD9D9]" />
              </button>
            </div>

            {/* Real LottieFiles Animation: Flying Wallet with Banknotes (Placed on the Right) */}
            <div className="relative flex items-center justify-center flex-shrink-0">
              <LottieAnimation
                type="wallet-coins"
                className="w-36 h-36 sm:w-44 sm:h-44 filter drop-shadow-xl"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3 EXECUTIVE PILLAR CARDS (Income, Expense, Wealth Allocation)  */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
        {/* Pillar 1: Total Gaji Masuk */}
        <div className="p-6 rounded-3xl bg-white border border-[#FFD9D9] shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-black uppercase tracking-wider text-slate-500">
              Pemasukan Gaji Masuk
            </span>
            <div className="w-11 h-11 rounded-2xl bg-[#FFD9D9] text-[#991213] flex items-center justify-center font-bold shadow-xs">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-3xl font-black text-[#991213] tracking-tight">
              {formatRupiah(totalIncome)}
            </h3>
            <p className="text-xs text-slate-500 font-bold">
              100% Arus Kas Masuk • {currentIncomes.length} transaksi penerimaan
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#FFD9D9]/60 flex items-center justify-between text-xs font-semibold text-slate-600">
            <span>Sumber Utama: Gaji Pokok</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold">
              Aktif
            </span>
          </div>
        </div>

        {/* Pillar 2: Total Pengeluaran */}
        <div className="p-6 rounded-3xl bg-white border border-[#FFD9D9] shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-black uppercase tracking-wider text-slate-500">
              Total Pengeluaran
            </span>
            <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold shadow-xs">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-3xl font-black text-slate-900 tracking-tight">
              {formatRupiah(totalExpense)}
            </h3>
            <p className="text-xs font-bold text-rose-600">
              {expenseRate.toFixed(1)}% dari gaji • {currentExpenses.length} pos pengeluaran
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#FFD9D9]/60 flex items-center justify-between text-xs font-semibold text-slate-600">
            <span>Rasio Ideal: Maksimal 50-70%</span>
            <span
              className={`px-2 py-0.5 rounded-full font-bold ${
                expenseRate <= 60
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-rose-50 text-rose-700"
              }`}
            >
              {expenseRate <= 60 ? "Terkendali" : "Tinggi"}
            </span>
          </div>
        </div>

        {/* Pillar 3: Tabungan & Pasar Uang */}
        <div className="p-6 rounded-3xl bg-white border border-[#FFD9D9] shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-black uppercase tracking-wider text-slate-500">
              Tabungan & Pasar Uang
            </span>
            <div className="w-11 h-11 rounded-2xl bg-[#FFD9D9] text-[#991213] flex items-center justify-center font-bold shadow-xs">
              <PiggyBank className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-3xl font-black text-[#991213] tracking-tight">
              {formatRupiah(totalSavings)}
            </h3>
            <p className="text-xs font-bold text-[#991213]">
              {savingsRate.toFixed(1)}% rasio tabungan bulanan
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#FFD9D9]/60 flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-600">Target Ideal: Min 20%</span>
            <button
              onClick={() => onNavigateToTab("savings")}
              className="text-[#991213] font-bold hover:underline inline-flex items-center gap-0.5"
            >
              Portofolio
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* STATUS REKONSILIASI GAJI & PENGELUARAN (LIVE FORMULA BAR)     */}
      {/* ============================================================== */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#FFD9D9] shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#991213]" />
              <h2 className="text-lg sm:text-xl font-black text-slate-900">
                Status Rekonsiliasi Gaji & Pengeluaran
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Evaluasi perbandingan gaji yang diterima terhadap realisasi belanja dan alokasi tabungan.
            </p>
          </div>

          <div className="px-4 py-2 rounded-2xl bg-[#FFF0F0] border border-[#FFD9D9] text-left sm:text-right">
            <span className="block text-[10px] uppercase font-black text-slate-400">
              Formula Rekonsiliasi
            </span>
            <span className="text-xs font-black text-[#991213]">
              Gaji = Pengeluaran + Tabungan + Sisa Kas
            </span>
          </div>
        </div>

        {/* Visual Progress Split with Theme Colors */}
        <div className="space-y-3">
          <div className="h-6 w-full bg-[#FFF0F0] border border-[#FFD9D9] rounded-full overflow-hidden flex shadow-inner">
            <div
              style={{ width: `${Math.min(100, expenseRate)}%` }}
              title={`Pengeluaran: ${expenseRate.toFixed(1)}%`}
              className="bg-rose-500 h-full transition-all duration-500 hover:opacity-90 flex items-center justify-center text-[10px] font-bold text-white overflow-hidden"
            >
              {expenseRate >= 12 ? `${expenseRate.toFixed(1)}%` : ""}
            </div>
            <div
              style={{ width: `${Math.min(100 - expenseRate, savingsRate)}%` }}
              title={`Tabungan: ${savingsRate.toFixed(1)}%`}
              className="bg-[#991213] h-full transition-all duration-500 hover:opacity-90 flex items-center justify-center text-[10px] font-bold text-white overflow-hidden"
            >
              {savingsRate >= 12 ? `${savingsRate.toFixed(1)}%` : ""}
            </div>
            {remainingSalary > 0 && (
              <div
                style={{
                  width: `${Math.max(
                    0,
                    100 - Math.min(100, expenseRate) - Math.min(100, savingsRate)
                  )}%`,
                }}
                title={`Sisa Gaji: ${remainingRate.toFixed(1)}%`}
                className="bg-emerald-500 h-full transition-all duration-500 hover:opacity-90 flex items-center justify-center text-[10px] font-bold text-white overflow-hidden"
              >
                {remainingRate >= 12 ? `${remainingRate.toFixed(1)}%` : ""}
              </div>
            )}
          </div>

          {/* Legend with Values */}
          <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-semibold pt-1">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-rose-500" />
              <span className="text-slate-600">
                Pengeluaran:{" "}
                <strong className="text-slate-900">
                  {formatRupiah(totalExpense)} ({expenseRate.toFixed(1)}%)
                </strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-[#991213]" />
              <span className="text-slate-600">
                Alokasi Tabungan:{" "}
                <strong className="text-[#991213]">
                  {formatRupiah(totalSavings)} ({savingsRate.toFixed(1)}%)
                </strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`w-3.5 h-3.5 rounded-full ${
                  isDeficit ? "bg-rose-600" : "bg-emerald-500"
                }`}
              />
              <span className="text-slate-600">
                Sisa Kas Bersih:{" "}
                <strong
                  className={
                    isDeficit ? "text-rose-600" : "text-emerald-700"
                  }
                >
                  {formatRupiah(remainingSalary)} ({remainingRate.toFixed(1)}%)
                </strong>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* GRID: PORTOFOLIO PASAR UANG & DISTRIBUSI PENGELUARAN          */}
      {/* Featuring Lottie Piggy-Bank Animation                         */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card Sorotan Tabungan Pasar Uang with Lottie Animation */}
        <div className="lg:col-span-1 rounded-3xl bg-gradient-to-br from-[#991213] via-[#851011] to-[#5e0809] text-white p-6 sm:p-7 shadow-xl shadow-[#991213]/20 border border-[#FFD9D9]/30 flex flex-col justify-between relative overflow-hidden">
          {/* Subtle glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#FFD9D9]/15 rounded-full blur-2xl pointer-events-none" />

          <div className="space-y-4 relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#FFD9D9] text-xs font-black uppercase tracking-wider">
                <Landmark className="w-4 h-4" />
                <span>Portofolio Pasar Uang</span>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-[#FFD9D9] text-[#991213]">
                Imbal Hasil Aktif
              </span>
            </div>

            {/* Total Balance with Lottie Piggy Bank */}
            <div className="flex items-center justify-between gap-3 pt-1">
              <div className="space-y-1">
                <p className="text-xs text-[#FFD9D9] font-medium">
                  Total Nilai (Modal + Keuntungan)
                </p>
                <h3 className="text-3xl font-black text-white tracking-tight">
                  {formatRupiah(mmSummary.totalValue)}
                </h3>
              </div>
              {/* Lottie Piggy Bank Animation */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0">
                <LottieAnimation type="piggy-bank" className="w-full h-full" />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-black/25 border border-[#FFD9D9]/20 space-y-2.5 text-xs">
              <div className="flex justify-between items-center text-[#FFD9D9]">
                <span>Total Modal Disetor:</span>
                <span className="font-bold text-white">
                  {formatRupiah(mmSummary.totalCapital)}
                </span>
              </div>
              <div className="flex justify-between items-center text-emerald-300">
                <span className="flex items-center gap-1 font-bold">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  Keuntungan Berjalan:
                </span>
                <span className="font-extrabold">
                  +{formatRupiah(mmSummary.totalProfit)}
                </span>
              </div>
              <div className="flex justify-between items-center text-[#FFD9D9] pt-1.5 border-t border-white/10">
                <span>Estimasi Yield Bulanan:</span>
                <span className="font-bold text-white">
                  ~{formatRupiah(mmSummary.monthlyYield)} /bln
                </span>
              </div>
            </div>
          </div>

          <div className="pt-6 relative z-10">
            <button
              onClick={() => onNavigateToTab("savings")}
              className="w-full py-3.5 px-4 rounded-2xl bg-[#FFD9D9] hover:bg-white text-[#991213] font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-98"
            >
              Buka Halaman Tabungan & Pasar Uang
              <ChevronRight className="w-4 h-4 text-[#991213]" />
            </button>
          </div>
        </div>

        {/* Breakdown Pengeluaran Berdasarkan Kategori */}
        <div className="lg:col-span-2 rounded-3xl bg-white border border-[#FFD9D9] p-6 sm:p-7 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <PieChart className="w-5 h-5 text-[#991213]" />
                <h3 className="font-black text-base sm:text-lg text-slate-900">
                  Distribusi Kategori Pengeluaran
                </h3>
              </div>
              <span className="text-xs font-bold text-slate-500">
                Total: {formatRupiah(totalExpense)}
              </span>
            </div>

            {sortedCategories.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-sm">
                Belum ada data pengeluaran tercatat di bulan ini.
              </div>
            ) : (
              <div className="space-y-3.5">
                {sortedCategories.slice(0, 5).map(([category, amount], idx) => {
                  const percentage =
                    totalExpense > 0 ? (amount / totalExpense) * 100 : 0;
                  return (
                    <div key={category} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-700">
                          {category}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-900 font-bold">
                            {formatRupiah(amount)}
                          </span>
                          <span className="text-slate-400 text-[11px]">
                            ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                      <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${percentage}%` }}
                          className={`h-full rounded-full ${
                            idx === 0
                              ? "bg-[#991213]"
                              : idx === 1
                              ? "bg-rose-500"
                              : idx === 2
                              ? "bg-amber-500"
                              : idx === 3
                              ? "bg-indigo-500"
                              : "bg-teal-500"
                          }`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-[#FFD9D9] flex justify-end">
            <button
              onClick={() => onNavigateToTab("transactions")}
              className="text-xs font-bold text-[#991213] hover:underline inline-flex items-center gap-1"
            >
              Lihat Detail Semua Transaksi
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* AKTIVITAS TRANSAKSI TERBARU                                    */}
      {/* ============================================================== */}
      <div className="rounded-3xl bg-white border border-[#FFD9D9] p-6 sm:p-7 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-[#991213]" />
            <h3 className="font-black text-base sm:text-lg text-slate-900">
              Aktivitas Keuangan Terbaru ({selectedMonth})
            </h3>
          </div>
          <button
            onClick={() => onNavigateToTab("transactions")}
            className="text-xs font-bold text-[#991213] hover:text-[#7f0e0f] inline-flex items-center gap-1"
          >
            Lihat Semua Transaksi
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {combinedRecent.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm">
            Belum ada aktivitas transaksi pada bulan terpilih.
          </div>
        ) : (
          <div className="divide-y divide-[#FFD9D9]/50">
            {combinedRecent.map((item) => (
              <div
                key={item.id}
                className="py-3.5 flex items-center justify-between gap-4 hover:bg-[#FFF0F0] px-3 rounded-2xl transition-all"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm ${
                      item.type === "income"
                        ? "bg-[#FFD9D9] text-[#991213]"
                        : item.type === "expense"
                        ? "bg-rose-100 text-rose-700"
                        : "bg-[#FFD9D9] text-[#991213]"
                    }`}
                  >
                    {item.type === "income" ? (
                      <ArrowUpRight className="w-5 h-5" />
                    ) : item.type === "expense" ? (
                      <ArrowDownRight className="w-5 h-5" />
                    ) : (
                      <PiggyBank className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {formatTanggalIndo(item.date)} • {item.subtitle}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`text-sm sm:text-base font-black ${
                      item.type === "income"
                        ? "text-[#991213]"
                        : item.type === "expense"
                        ? "text-rose-600"
                        : "text-[#991213]"
                    }`}
                  >
                    {item.type === "income" ? "+" : "-"}
                    {formatRupiah(item.amount)}
                  </span>
                  <span className="block text-[10px] uppercase font-bold text-slate-400">
                    {item.type === "income"
                      ? "Pemasukan"
                      : item.type === "expense"
                      ? "Pengeluaran"
                      : "Alokasi Tabungan"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

"use client";

import React from "react";
import {
  FileText,
  Printer,
  AlertCircle,
  CheckCircle,
  Sparkles,
} from "lucide-react";
import {
  IncomeItem,
  ExpenseItem,
  SavingsAllocation,
  MoneyMarketProduct,
} from "@/types/finance";
import {
  formatRupiah,
} from "@/lib/storage";
import { LottieAnimation } from "@/components/LottieAnimation";

interface ReconciliationReportViewProps {
  incomes: IncomeItem[];
  expenses: ExpenseItem[];
  savings: SavingsAllocation[];
  moneyMarket?: MoneyMarketProduct[];
  selectedMonth: string;
}

export const ReconciliationReportView: React.FC<ReconciliationReportViewProps> = ({
  incomes,
  expenses,
  savings,
  selectedMonth,
}) => {
  const currentIncomes = incomes.filter((i) => i.month === selectedMonth);
  const currentExpenses = expenses.filter((e) => e.month === selectedMonth);
  const currentSavings = savings.filter((s) => s.month === selectedMonth);

  const totalIncome = currentIncomes.reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = currentExpenses.reduce((acc, curr) => acc + curr.amount, 0);
  const totalSavings = currentSavings.reduce((acc, curr) => acc + curr.amount, 0);

  const remainingSalary = totalIncome - totalExpense - totalSavings;

  const expenseRate = totalIncome > 0 ? (totalExpense / totalIncome) * 100 : 0;
  const savingsRate = totalIncome > 0 ? (totalSavings / totalIncome) * 100 : 0;
  const remainingRate = totalIncome > 0 ? (remainingSalary / totalIncome) * 100 : 0;

  const needsCategories = [
    "Tempat Tinggal (Sewa/KPR)",
    "Tagihan & Utilitas",
    "Belanja Bulanan",
    "Makan & Minuman",
    "Transportasi",
    "Kesehatan & Asuransi",
    "Cicilan & Utang",
  ];

  const totalNeeds = currentExpenses
    .filter((e) => needsCategories.includes(e.category))
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalWants = totalExpense - totalNeeds;

  const needsRate = totalIncome > 0 ? (totalNeeds / totalIncome) * 100 : 0;
  const wantsRate = totalIncome > 0 ? (totalWants / totalIncome) * 100 : 0;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white border border-[#FFD9D9] shadow-xs print:hidden">
        <div>
          <h2 className="text-xl font-black text-[#991213]">
            Laporan Rekonsiliasi Keuangan Bulanan
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Periode: <strong>{selectedMonth}</strong> • Rekonsiliasi audit antara gaji
            yang didapat, belanja, dan alokasi tabungan.
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-[#991213] hover:bg-[#7f0e0f] text-white font-black text-xs sm:text-sm shadow-md shadow-[#991213]/25 transition-all active:scale-95"
        >
          <Printer className="w-4 h-4" />
          <span>Cetak / Simpan PDF</span>
        </button>
      </div>

      {/* Main Statement Sheet */}
      <div className="p-6 sm:p-10 rounded-3xl bg-white border border-[#FFD9D9] shadow-sm space-y-8">
        {/* Statement Header */}
        <div className="border-b border-[#FFD9D9] pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 print:hidden">
              <LottieAnimation type="chart-growth" className="w-full h-full" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-[#991213] tracking-tight">
                LEMBAR REKONSILIASI KEUANGAN
              </h1>
              <p className="text-xs font-black text-slate-500 mt-1 uppercase tracking-wider">
                FinPlan Keberlanjutan Arus Kas Pribadi
              </p>
            </div>
          </div>
          <div className="text-left sm:text-right">
            <span className="text-xs text-slate-400 block font-semibold">
              Bulan Alokasi
            </span>
            <span className="text-lg font-black text-[#991213]">
              {selectedMonth}
            </span>
          </div>
        </div>

        {/* Status Rekonsiliasi Card */}
        <div
          className={`p-5 rounded-2xl border-2 flex items-center justify-between gap-4 ${
            remainingSalary > 0
              ? "bg-[#FFF0F0] border-[#991213]"
              : remainingSalary === 0 && totalIncome > 0
              ? "bg-blue-50 border-blue-400"
              : "bg-rose-50 border-rose-400"
          }`}
        >
          <div className="flex items-center gap-3">
            {remainingSalary >= 0 ? (
              <CheckCircle className="w-7 h-7 text-[#991213] flex-shrink-0" />
            ) : (
              <AlertCircle className="w-7 h-7 text-rose-600 flex-shrink-0" />
            )}
            <div>
              <h3 className="text-base font-black text-[#991213]">
                {remainingSalary > 0
                  ? "Status Rekonsiliasi: SURPLUS SEHAT"
                  : remainingSalary === 0 && totalIncome > 0
                  ? "Status Rekonsiliasi: SEIMBANG 100% (Zero-Based Budget)"
                  : "Status Rekonsiliasi: DEFISIT / MELEBIHI GAJI"}
              </h3>
              <p className="text-xs text-slate-700 mt-0.5">
                {remainingSalary > 0
                  ? `Ada sisa kas bebas sebesar ${formatRupiah(
                      remainingSalary
                    )} (${remainingRate.toFixed(
                      1
                    )}% dari gaji) yang belum dialokasikan.`
                  : remainingSalary === 0
                  ? "Seluruh gaji telah dialokasikan dengan presisi ke pos pengeluaran dan tabungan."
                  : `Pengeluaran & tabungan melebihi gaji masuk sebesar ${formatRupiah(
                      Math.abs(remainingSalary)
                    )}. Waspadai penggunaan tabungan atau dana darurat.`}
              </p>
            </div>
          </div>
        </div>

        {/* Tabel Rincian Rekonsiliasi */}
        <div className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-[#991213]">
            Audit Neraca Pemasukan vs Pengeluaran & Tabungan
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-[#FFD9D9] text-xs font-bold text-slate-500 uppercase">
                  <th className="py-3 px-4">Komponen Keuangan</th>
                  <th className="py-3 px-4">Item / Transaksi</th>
                  <th className="py-3 px-4 text-right">Rasio (%)</th>
                  <th className="py-3 px-4 text-right">Nominal (Rp)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#FFD9D9]/50 font-medium">
                {/* 1. Gaji / Pemasukan */}
                <tr className="bg-[#FFF0F0] font-bold">
                  <td className="py-3 px-4 text-[#991213]">
                    [+] Total Gaji & Pemasukan Masuk
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {currentIncomes.length} catatan
                  </td>
                  <td className="py-3 px-4 text-right text-[#991213]">
                    100.0%
                  </td>
                  <td className="py-3 px-4 text-right text-[#991213] text-base font-black">
                    {formatRupiah(totalIncome)}
                  </td>
                </tr>

                {/* 2. Pengeluaran Kebutuhan */}
                <tr>
                  <td className="py-3 px-4 pl-8 text-slate-700">
                    • Kebutuhan Pokok (Living Needs)
                  </td>
                  <td className="py-3 px-4 text-slate-500 text-xs">
                    Sewa, utilitas, belanja rumah, dsb.
                  </td>
                  <td className="py-3 px-4 text-right text-slate-600">
                    {needsRate.toFixed(1)}%
                  </td>
                  <td className="py-3 px-4 text-right text-slate-800">
                    {formatRupiah(totalNeeds)}
                  </td>
                </tr>

                {/* 3. Pengeluaran Keinginan */}
                <tr>
                  <td className="py-3 px-4 pl-8 text-slate-700">
                    • Gaya Hidup & Keinginan (Wants)
                  </td>
                  <td className="py-3 px-4 text-slate-500 text-xs">
                    Hiburan, ngopi, rekreasi, dsb.
                  </td>
                  <td className="py-3 px-4 text-right text-slate-600">
                    {wantsRate.toFixed(1)}%
                  </td>
                  <td className="py-3 px-4 text-right text-slate-800">
                    {formatRupiah(totalWants)}
                  </td>
                </tr>

                {/* Subtotal Pengeluaran */}
                <tr className="bg-rose-50/60 font-bold">
                  <td className="py-3 px-4 text-rose-800">
                    [-] Total Seluruh Pengeluaran
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {currentExpenses.length} transaksi
                  </td>
                  <td className="py-3 px-4 text-right text-rose-800">
                    {expenseRate.toFixed(1)}%
                  </td>
                  <td className="py-3 px-4 text-right text-rose-800 text-base font-black">
                    ({formatRupiah(totalExpense)})
                  </td>
                </tr>

                {/* 4. Tabungan & Pasar Uang */}
                <tr className="bg-[#FFF0F0] font-bold">
                  <td className="py-3 px-4 text-[#991213]">
                    [-] Alokasi Tabungan & Pasar Uang
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {currentSavings.length} pos simpanan
                  </td>
                  <td className="py-3 px-4 text-right text-[#991213]">
                    {savingsRate.toFixed(1)}%
                  </td>
                  <td className="py-3 px-4 text-right text-[#991213] text-base font-black">
                    ({formatRupiah(totalSavings)})
                  </td>
                </tr>

                {/* Sisa Gaji Bersih */}
                <tr className="border-t-2 border-[#991213] font-black text-base bg-[#FFF9F9]">
                  <td className="py-4 px-4 text-slate-900">
                    [=] Sisa Gaji Tidak Terpakai (Net Cashflow)
                  </td>
                  <td className="py-4 px-4 text-slate-500 text-xs">
                    Kas bebas belum dialokasikan
                  </td>
                  <td className="py-4 px-4 text-right text-slate-900">
                    {remainingRate.toFixed(1)}%
                  </td>
                  <td
                    className={`py-4 px-4 text-right text-lg font-black ${
                      remainingSalary >= 0
                        ? "text-[#991213]"
                        : "text-rose-600"
                    }`}
                  >
                    {formatRupiah(remainingSalary)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Benchmark 50 / 30 / 20 Rule Assessment */}
        <div className="p-6 rounded-2xl bg-[#FFF9F9] border border-[#FFD9D9] space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#991213]" />
            <h4 className="font-black text-[#991213] text-base">
              Evaluasi Benchmark Anggaran 50 / 30 / 20
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-white border border-[#FFD9D9]">
              <span className="text-slate-500 block font-semibold">
                Kebutuhan Pokok (Target ≤ 50%)
              </span>
              <span className="text-lg font-black text-slate-900 mt-1 block">
                {needsRate.toFixed(1)}%
              </span>
              <span
                className={`text-[10px] font-bold ${
                  needsRate <= 50 ? "text-emerald-700" : "text-amber-700"
                }`}
              >
                {needsRate <= 50 ? "✓ Sesuai Rekomendasi" : "⚠️ Cukup Tinggi"}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-[#FFD9D9]">
              <span className="text-slate-500 block font-semibold">
                Keinginan & Lifestyle (Target ≤ 30%)
              </span>
              <span className="text-lg font-black text-slate-900 mt-1 block">
                {wantsRate.toFixed(1)}%
              </span>
              <span
                className={`text-[10px] font-bold ${
                  wantsRate <= 30 ? "text-emerald-700" : "text-rose-700"
                }`}
              >
                {wantsRate <= 30 ? "✓ Terkendali Baik" : "⚠️ Perlu Ditahan"}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-[#FFD9D9]">
              <span className="text-slate-500 block font-semibold">
                Tabungan & Investasi (Target ≥ 20%)
              </span>
              <span className="text-lg font-black text-[#991213] mt-1 block">
                {savingsRate.toFixed(1)}%
              </span>
              <span
                className={`text-[10px] font-bold ${
                  savingsRate >= 20 ? "text-emerald-700" : "text-amber-700"
                }`}
              >
                {savingsRate >= 20 ? "✓ Target Tercapai" : "⚠️ Tingkatkan Alokasi"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

"use client";

import React, { useState } from "react";
import {
  TrendingUp,
  PiggyBank,
  Landmark,
  PlusCircle,
  Shield,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Calculator,
  Trash2,
  Pencil,
  History,
  Coins,
} from "lucide-react";
import {
  SavingsAllocation,
  MoneyMarketProduct,
} from "@/types/finance";
import {
  FinanceStorage,
  formatRupiah,
  formatTanggalIndo,
  calculateMoneyMarketProfit,
} from "@/lib/storage";
import { LottieAnimation } from "@/components/LottieAnimation";
import {
  EditTransactionModal,
  EditableTransaction,
} from "@/components/EditTransactionModal";
import { InvestmentChart } from "@/components/InvestmentChart";

interface SavingsMoneyMarketViewProps {
  savings: SavingsAllocation[];
  moneyMarket: MoneyMarketProduct[];
  selectedMonth: string;
  onOpenQuickAdd?: () => void;
}

export const SavingsMoneyMarketView: React.FC<SavingsMoneyMarketViewProps> = ({
  savings,
  moneyMarket,
  selectedMonth,
  onOpenQuickAdd,
}) => {
  const [showAddMMModal, setShowAddMMModal] = useState(false);
  const [showInvestModal, setShowInvestModal] = useState<{
    productId: string;
    mode: "topup" | "tarik";
  } | null>(null);

  const [mmName, setMmName] = useState("");
  const [mmPlatform, setMmPlatform] = useState("Bibit");
  const [mmCapital, setMmCapital] = useState("");
  const [mmRate, setMmRate] = useState("5.8");
  const [mmStartDate, setMmStartDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [mmNotes, setMmNotes] = useState("");

  const [investAmount, setInvestAmount] = useState("");
  const [investDate, setInvestDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [investNote, setInvestNote] = useState("");
  const [expandedHistoryId, setExpandedHistoryId] = useState<string | null>(null);

  const [simCapital, setSimCapital] = useState<number>(20000000);
  const [simMonthlyAdd, setSimMonthlyAdd] = useState<number>(2000000);
  const [simRate, setSimRate] = useState<number>(6.0);
  const [simYears, setSimYears] = useState<number>(3);

  const calculateCompoundSimulation = () => {
    const monthlyRate = simRate / 100 / 12;
    const totalMonths = simYears * 12;
    let totalValue = simCapital;
    let totalDeposited = simCapital;

    for (let m = 1; m <= totalMonths; m++) {
      totalValue = totalValue * (1 + monthlyRate) + simMonthlyAdd;
      totalDeposited += simMonthlyAdd;
    }

    const totalProfit = Math.max(0, totalValue - totalDeposited);
    return {
      totalValue: Math.round(totalValue),
      totalDeposited: Math.round(totalDeposited),
      totalProfit: Math.round(totalProfit),
    };
  };

  const simResult = calculateCompoundSimulation();

  const [savingsFilter, setSavingsFilter] = useState<
    "all" | "money_market" | "emergency" | "other"
  >("all");
  const [editingTx, setEditingTx] = useState<EditableTransaction | null>(null);

  // Kategori filter tabungan
  const mmSavings = savings.filter((s) => s.targetType === "money_market");
  const emergencySavings = savings.filter((s) => s.targetType === "emergency");
  const otherSavings = savings.filter(
    (s) => s.targetType === "regular" || s.targetType === "goal"
  );

  const filteredSavings = savings.filter((s) => {
    if (savingsFilter === "money_market") return s.targetType === "money_market";
    if (savingsFilter === "emergency") return s.targetType === "emergency";
    if (savingsFilter === "other")
      return s.targetType === "regular" || s.targetType === "goal";
    return true;
  });

  const totalSavingsAll = savings.reduce((acc, curr) => acc + curr.amount, 0);

  // Produk Pasar Uang yang ditampilkan: jika moneyMarket array kosong tapi ada tabungan pasar uang, sediakan live fallback
  const displayMMProducts: MoneyMarketProduct[] =
    moneyMarket.length > 0
      ? moneyMarket
      : mmSavings.length > 0
      ? [
          {
            id: "mm-live-sync",
            name: mmSavings[0].accountName || "Sucorinvest Pasar Uang",
            platform: "Bibit",
            initialCapital: mmSavings.reduce((acc, curr) => acc + curr.amount, 0),
            returnRatePa: 5.5,
            startDate: mmSavings.reduce(
              (earliest, curr) => (curr.date < earliest ? curr.date : earliest),
              mmSavings[0].date
            ),
            notes: "Terhubung otomatis dari alokasi tabungan pasar uang",
            updatedAt: Date.now(),
          },
        ]
      : [];

  const mmSummary = displayMMProducts.reduce(
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
      return acc;
    },
    { totalCapital: 0, totalProfit: 0, totalValue: 0 }
  );

  // Total Keseluruhan: Seluruh tabungan yang dicatat + keuntungan akumulasi pasar uang
  const totalConventional = savings
    .filter((s) => s.targetType !== "money_market")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const grandTotalSavings = Math.max(
    totalSavingsAll + mmSummary.totalProfit,
    totalConventional + mmSummary.totalValue
  );

  const handleAddMM = async (e: React.FormEvent) => {
    e.preventDefault();
    const cap = parseFloat(mmCapital.replace(/[^0-9]/g, "")) || 0;
    const rate = parseFloat(mmRate) || 0;
    if (!mmName || cap <= 0) {
      alert("Lengkapi nama produk dan nominal modal");
      return;
    }

    await FinanceStorage.addMoneyMarketProduct({
      name: mmName,
      platform: mmPlatform,
      initialCapital: cap,
      returnRatePa: rate,
      startDate: mmStartDate,
      notes: mmNotes,
    });

    setMmName("");
    setMmCapital("");
    setShowAddMMModal(false);
  };

  const handleInvestAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showInvestModal) return;
    const amount = parseFloat(investAmount.replace(/[^0-9]/g, "")) || 0;
    if (amount <= 0) {
      alert("Masukkan nominal yang valid di atas Rp 0");
      return;
    }

    if (showInvestModal.mode === "topup") {
      await FinanceStorage.topUpMoneyMarket(
        showInvestModal.productId,
        amount,
        investDate,
        investNote || "Investasi Masuk (Top Up)"
      );
    } else {
      await FinanceStorage.withdrawMoneyMarket(
        showInvestModal.productId,
        amount,
        investDate,
        investNote || "Investasi Keluar (Jual / Tarik)"
      );
    }

    setInvestAmount("");
    setInvestNote("");
    setShowInvestModal(null);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#8B0000] via-[#A00000] to-[#700000] text-white p-6 sm:p-8 shadow-xl shadow-[#8B0000]/20 border border-[#8B0000]">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFD9D9] text-[#8B0000] text-xs font-black shadow-xs">
              <Landmark className="w-3.5 h-3.5 text-[#8B0000]" />
              <span>Portofolio Tabungan & Pasar Uang Terintegrasi</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Tabungan & Aset Pasar Uang
            </h1>
            <p className="text-[#FFD9D9] text-xs sm:text-sm leading-relaxed font-medium">
              Pantau tabungan yang sudah ada digabungkan dengan tabungan yang dialokasikan
              ke instrumen pasar uang, lengkap dengan akumulasi keuntungan (imbal hasil)
              secara riil.
            </p>
          </div>

          {/* Grand Total Value Card with Lottie Save Money */}
          <div className="flex items-center gap-4 bg-black/25 backdrop-blur-md border border-[#FFD9D9]/30 p-5 sm:p-6 rounded-2xl min-w-[280px]">
            <div className="flex-1">
              <span className="text-xs uppercase tracking-wider font-extrabold text-[#FFD9D9]">
                Total Keseluruhan Tabungan & Aset
              </span>
              <div className="text-3xl font-black text-white mt-1">
                {formatRupiah(grandTotalSavings)}
              </div>
              <div className="flex items-center gap-2 mt-2 text-xs font-bold text-emerald-300">
                <span className="flex items-center gap-1">
                  <ArrowUpRight className="w-4 h-4" />
                  +{formatRupiah(mmSummary.totalProfit)}
                </span>
                <span className="text-[#FFD9D9] font-normal">profit pasar uang</span>
              </div>
            </div>
            <div className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0">
              <LottieAnimation type="save-money" className="w-full h-full" />
            </div>
          </div>
        </div>

        <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* 2 Main Sections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Kolom 1: Daftar Alokasi Tabungan */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white border border-[#FFD9D9] shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#FFD9D9] text-[#8B0000] flex items-center justify-center font-bold">
                <PiggyBank className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-black text-base sm:text-lg text-slate-900">
                  Daftar Alokasi Tabungan
                </h2>
                <p className="text-xs text-slate-500">
                  Tabungan pasar uang, darurat, reguler & target impian
                </p>
              </div>
            </div>
            <span className="text-xs font-black px-3 py-1 bg-[#FFF0F0] border border-[#FFD9D9] rounded-full text-[#8B0000]">
              {formatRupiah(totalSavingsAll)}
            </span>
          </div>

          {/* Filter Sub-Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-[#FFF0F0] rounded-xl border border-[#FFD9D9] overflow-x-auto text-xs">
            <button
              onClick={() => setSavingsFilter("all")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
                savingsFilter === "all"
                  ? "bg-[#8B0000] text-white shadow-xs"
                  : "text-slate-600 hover:text-[#8B0000]"
              }`}
            >
              Semua ({savings.length})
            </button>
            <button
              onClick={() => setSavingsFilter("money_market")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
                savingsFilter === "money_market"
                  ? "bg-[#8B0000] text-white shadow-xs"
                  : "text-slate-600 hover:text-[#8B0000]"
              }`}
            >
              Pasar Uang ({mmSavings.length})
            </button>
            <button
              onClick={() => setSavingsFilter("emergency")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
                savingsFilter === "emergency"
                  ? "bg-[#8B0000] text-white shadow-xs"
                  : "text-slate-600 hover:text-[#8B0000]"
              }`}
            >
              Darurat ({emergencySavings.length})
            </button>
            <button
              onClick={() => setSavingsFilter("other")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
                savingsFilter === "other"
                  ? "bg-[#8B0000] text-white shadow-xs"
                  : "text-slate-600 hover:text-[#8B0000]"
              }`}
            >
              Reguler & Target ({otherSavings.length})
            </button>
          </div>

          <div className="space-y-3">
            {filteredSavings.length === 0 ? (
              <div className="py-10 text-center rounded-2xl bg-[#FFF9F9] border border-dashed border-[#FFD9D9] space-y-2">
                <p className="text-slate-400 text-sm font-medium">
                  Belum ada alokasi tabungan pada kategori ini.
                </p>
                {onOpenQuickAdd && (
                  <button
                    onClick={onOpenQuickAdd}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#8B0000] text-white text-xs font-bold hover:bg-[#700000] transition-all"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    + Catat Tabungan Baru
                  </button>
                )}
              </div>
            ) : (
              filteredSavings.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-[#FFF9F9] border border-[#FFD9D9] flex items-center justify-between gap-4 transition-all hover:bg-white hover:shadow-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-white shadow-xs border border-[#FFD9D9]/50 flex items-center justify-center flex-shrink-0 text-slate-700">
                      {item.targetType === "money_market" ? (
                        <TrendingUp className="w-4 h-4 text-[#8B0000]" />
                      ) : item.targetType === "emergency" ? (
                        <Shield className="w-4 h-4 text-[#8B0000]" />
                      ) : item.targetType === "goal" ? (
                        <Target className="w-4 h-4 text-[#8B0000]" />
                      ) : (
                        <PiggyBank className="w-4 h-4 text-[#8B0000]" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-slate-900 truncate">
                        {item.accountName}
                      </h4>
                      <p className="text-[11px] text-slate-500 truncate">
                        {formatTanggalIndo(item.date)} •{" "}
                        <span className="font-semibold text-[#8B0000]">
                          {item.targetType === "money_market"
                            ? "Pasar Uang"
                            : item.targetType === "emergency"
                            ? "Dana Darurat"
                            : item.targetType === "goal"
                            ? "Target Impian"
                            : "Tabungan Reguler"}
                        </span>
                        {item.note && ` • ${item.note}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="font-black text-[#8B0000] text-sm mr-1">
                      {formatRupiah(item.amount)}
                    </span>
                    <button
                      onClick={() =>
                        setEditingTx({
                          id: item.id,
                          txType: "savings",
                          date: item.date,
                          month: item.month,
                          amount: item.amount,
                          targetType: item.targetType,
                          accountName: item.accountName,
                          note: item.note,
                        })
                      }
                      className="p-1.5 text-slate-400 hover:text-[#8B0000] hover:bg-[#FFD9D9]/50 rounded-lg transition-all"
                      title="Edit Alokasi"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={async () => {
                        if (
                          confirm(
                            `Hapus alokasi tabungan "${item.accountName}" (${formatRupiah(item.amount)})?`
                          )
                        ) {
                          await FinanceStorage.deleteSavings(item.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                      title="Hapus Alokasi"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {onOpenQuickAdd && filteredSavings.length > 0 && (
            <div className="pt-2 border-t border-[#FFD9D9]/60 flex justify-end">
              <button
                onClick={onOpenQuickAdd}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#8B0000] hover:underline"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Tambah Alokasi Tabungan
              </button>
            </div>
          )}
        </div>

        {/* Kolom 2: Tabungan di Pasar Uang (Portofolio & Imbal Hasil) */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white border border-[#FFD9D9] shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#FFD9D9] text-[#8B0000] flex items-center justify-center font-bold">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-black text-base sm:text-lg text-slate-900">
                  Tabungan di Pasar Uang
                </h2>
                <p className="text-xs text-slate-500">
                  Modal pokok disetor + Akumulasi keuntungan imbal hasil
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const firstId = displayMMProducts[0]?.id || "";
                  setShowInvestModal({ productId: firstId, mode: "topup" });
                  setInvestAmount("");
                  setInvestNote("");
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FFF0F0] hover:bg-[#FFE0E0] text-[#8B0000] border border-[#FFD9D9] font-bold text-xs shadow-2xs active:scale-95 transition-all"
              >
                <Coins className="w-3.5 h-3.5" />
                <span>± Catat Investasi</span>
              </button>
              <button
                onClick={() => setShowAddMMModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#8B0000] hover:bg-[#700000] text-white font-bold text-xs shadow-md shadow-[#8B0000]/20 active:scale-95 transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                Tambah Produk
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {displayMMProducts.length === 0 ? (
              <div className="py-12 px-4 text-center rounded-2xl bg-[#FFF9F9] border border-dashed border-[#FFD9D9] space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#FFD9D9] text-[#8B0000] flex items-center justify-center mx-auto font-bold">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">
                    Belum Ada Portofolio Pasar Uang
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Alokasikan tabungan dengan jenis Pasar Uang saat mencatat transaksi, atau klik Tambah Produk untuk mulai memantau imbal hasil harian.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddMMModal(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#8B0000] text-white font-bold text-xs hover:bg-[#700000] transition-all"
                >
                  <PlusCircle className="w-4 h-4" />
                  Tambah Produk Sekarang
                </button>
              </div>
            ) : (
              displayMMProducts.map((item) => {
                const calc = calculateMoneyMarketProfit(
                  item.initialCapital,
                  item.returnRatePa,
                  item.startDate,
                  item.accumulatedReturn
                );

                return (
                  <div
                    key={item.id}
                    className="p-5 rounded-2xl bg-[#FFF9F9] border border-[#FFD9D9] shadow-xs space-y-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-black text-slate-900 text-base">
                            {item.name}
                          </h3>
                          <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-md bg-[#FFD9D9] text-[#8B0000]">
                            {item.platform}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Mulai {formatTanggalIndo(item.startDate)} • Aktif {calc.daysActive} hari
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-xs text-slate-400 block font-semibold">
                          Nilai Saat Ini
                        </span>
                        <span className="text-lg font-black text-[#8B0000]">
                          {formatRupiah(calc.totalValue)}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 p-3 bg-white rounded-xl border border-[#FFD9D9] text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold">
                          Modal Pokok
                        </span>
                        <span className="font-bold text-slate-800">
                          {formatRupiah(item.initialCapital)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold">
                          Imbal Hasil (% p.a.)
                        </span>
                        <span className="font-black text-[#8B0000]">
                          {item.returnRatePa}% /thn
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-emerald-700 block font-bold">
                          Keuntungan Didapat
                        </span>
                        <span className="font-extrabold text-emerald-700">
                          +{formatRupiah(calc.estimatedProfit)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-slate-500 font-medium">
                        ~ {formatRupiah(calc.monthlyReturn)} estimasi keuntungan per bulan
                      </span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <button
                          onClick={() => {
                            setShowInvestModal({ productId: item.id, mode: "topup" });
                            setInvestAmount("");
                            setInvestNote("");
                          }}
                          className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1"
                          title="Investasi Masuk (Beli / Top Up)"
                        >
                          <ArrowUpRight className="w-3.5 h-3.5" />
                          <span>+ Beli / Top Up</span>
                        </button>
                        <button
                          onClick={() => {
                            setShowInvestModal({ productId: item.id, mode: "tarik" });
                            setInvestAmount("");
                            setInvestNote("");
                          }}
                          className="px-3 py-1.5 rounded-lg bg-[#FFF0F0] hover:bg-[#FFE0E0] text-[#8B0000] border border-[#FFD9D9] font-bold text-xs shadow-xs transition-all flex items-center gap-1"
                          title="Investasi Keluar (Jual / Tarik)"
                        >
                          <ArrowDownRight className="w-3.5 h-3.5 text-rose-600" />
                          <span>− Jual / Tarik</span>
                        </button>
                        <button
                          onClick={async () => {
                            if (confirm(`Hapus instrumen pasar uang "${item.name}"?`)) {
                              await FinanceStorage.deleteMoneyMarket(item.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition-all"
                          title="Hapus instrumen"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Expandable History Drawer */}
                    {item.history && item.history.length > 0 && (
                      <div className="pt-2 border-t border-[#FFD9D9]/50">
                        <button
                          onClick={() =>
                            setExpandedHistoryId(
                              expandedHistoryId === item.id ? null : item.id
                            )
                          }
                          className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 hover:text-[#8B0000] transition-colors"
                        >
                          <History className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            {expandedHistoryId === item.id
                              ? "Tutup Riwayat Arus Dana"
                              : `Lihat Riwayat Masuk / Keluar (${item.history.length} transaksi)`}
                          </span>
                        </button>

                        {expandedHistoryId === item.id && (
                          <div className="mt-2 space-y-1.5 max-h-48 overflow-y-auto pr-1">
                            {item.history.map((h) => (
                              <div
                                key={h.id}
                                className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-[#FFD9D9] text-xs"
                              >
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`w-2 h-2 rounded-full ${
                                      h.type === "tarik"
                                        ? "bg-rose-500"
                                        : "bg-emerald-500"
                                    }`}
                                  />
                                  <div>
                                    <span className="font-bold text-slate-800">
                                      {h.type === "tarik"
                                        ? "Investasi Keluar (Jual)"
                                        : "Investasi Masuk (Beli)"}
                                    </span>
                                    <p className="text-[10px] text-slate-400">
                                      {formatTanggalIndo(h.date)}
                                      {h.note && ` • ${h.note}`}
                                    </p>
                                  </div>
                                </div>
                                <span
                                  className={`font-black ${
                                    h.type === "tarik"
                                      ? "text-rose-600"
                                      : "text-emerald-700"
                                  }`}
                                >
                                  {h.type === "tarik" ? "-" : "+"}
                                  {formatRupiah(h.amount)}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Grafik / Chart Investasi di Bagian Bawah */}
      <InvestmentChart
        moneyMarket={displayMMProducts}
        savings={savings}
        selectedMonth={selectedMonth}
      />

      {/* Simulator Compound Calculator */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#FFD9D9] shadow-xs space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#FFD9D9] text-[#8B0000] flex items-center justify-center font-bold">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900">
              Kalkulator & Simulasi Pertumbuhan Pasar Uang
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Lihat proyeksi imbal hasil tabungan Anda jika diinvestasikan rutin ke pasar
              uang dibandingkan tabungan biasa.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Sliders */}
          <div className="lg:col-span-2 space-y-5 p-5 rounded-2xl bg-[#FFF9F9] border border-[#FFD9D9]">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-700">Modal Awal Setoran</span>
                <span className="font-black text-[#8B0000]">
                  {formatRupiah(simCapital)}
                </span>
              </div>
              <input
                type="range"
                min="1000000"
                max="100000000"
                step="1000000"
                value={simCapital}
                onChange={(e) => setSimCapital(Number(e.target.value))}
                className="w-full accent-[#8B0000] h-2 bg-[#FFD9D9] rounded-lg cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-700">Rutin Tambah Tiap Bulan (DCA)</span>
                <span className="font-black text-[#8B0000]">
                  {formatRupiah(simMonthlyAdd)}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="20000000"
                step="500000"
                value={simMonthlyAdd}
                onChange={(e) => setSimMonthlyAdd(Number(e.target.value))}
                className="w-full accent-[#8B0000] h-2 bg-[#FFD9D9] rounded-lg cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-700">Tenor Investasi</span>
                  <span className="font-black text-[#8B0000]">{simYears} Tahun</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={simYears}
                  onChange={(e) => setSimYears(Number(e.target.value))}
                  className="w-full accent-[#8B0000] h-2 bg-[#FFD9D9] rounded-lg cursor-pointer"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-700">Imbal Hasil (% p.a.)</span>
                  <span className="font-black text-[#8B0000]">{simRate}%</span>
                </div>
                <input
                  type="range"
                  min="3.0"
                  max="8.0"
                  step="0.1"
                  value={simRate}
                  onChange={(e) => setSimRate(Number(e.target.value))}
                  className="w-full accent-[#8B0000] h-2 bg-[#FFD9D9] rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Hasil Proyeksi Card with Lottie Chart Growth */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-[#8B0000] via-[#750000] to-[#500000] text-white shadow-xl flex flex-col justify-between border border-[#FFD9D9]/30">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-black tracking-wider text-[#FFD9D9]">
                  Estimasi Hasil Akhir ({simYears} Tahun)
                </span>
                <div className="w-14 h-14 flex-shrink-0">
                  <LottieAnimation type="chart-growth" className="w-full h-full" />
                </div>
              </div>
              <h3 className="text-3xl font-black text-white tracking-tight">
                {formatRupiah(simResult.totalValue)}
              </h3>

              <div className="pt-4 border-t border-white/20 space-y-2 text-xs">
                <div className="flex justify-between text-[#FFD9D9]">
                  <span>Total Uang Disetor:</span>
                  <span className="font-bold text-white">
                    {formatRupiah(simResult.totalDeposited)}
                  </span>
                </div>
                <div className="flex justify-between text-white font-extrabold">
                  <span>Total Keuntungan Bersih:</span>
                  <span className="text-emerald-300 font-black">
                    +{formatRupiah(simResult.totalProfit)}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-[#FFD9D9] mt-4 leading-relaxed font-medium">
              💡 Reksadana Pasar Uang di Indonesia bukan objek pajak (bebas PPh 20%
              seperti deposito) dan bebas biaya pembelian maupun penjualan.
            </p>
          </div>
        </div>
      </div>

      {/* Modal Tambah Produk Pasar Uang Baru */}
      {showAddMMModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-[#FFD9D9] space-y-4">
            <h3 className="text-lg font-black text-[#8B0000]">
              Tambah Produk Reksa Dana Pasar Uang
            </h3>

            <form onSubmit={handleAddMM} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Produk
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Sucorinvest Money Market Fund"
                  value={mmName}
                  onChange={(e) => setMmName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FFF9F9] border border-[#FFD9D9] rounded-xl text-sm font-medium text-slate-900 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Platform / Sekuritas
                  </label>
                  <select
                    value={mmPlatform}
                    onChange={(e) => setMmPlatform(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#FFF9F9] border border-[#FFD9D9] rounded-xl text-sm font-medium text-slate-900 focus:bg-white"
                  >
                    <option value="Bibit">Bibit</option>
                    <option value="Bareksa">Bareksa</option>
                    <option value="Ajaib">Ajaib</option>
                    <option value="Pluang">Pluang</option>
                    <option value="Bank BCA">Bank BCA</option>
                    <option value="Bank Mandiri">Bank Mandiri</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Return (% p.a.)
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    required
                    value={mmRate}
                    onChange={(e) => setMmRate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#FFF9F9] border border-[#FFD9D9] rounded-xl text-sm font-medium text-slate-900 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Modal Pokok Awal (Rp)
                </label>
                <input
                  type="text"
                  required
                  placeholder="0"
                  value={mmCapital}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, "");
                    setMmCapital(val ? Number(val).toLocaleString("id-ID") : "");
                  }}
                  className="w-full px-3.5 py-2.5 bg-[#FFF9F9] border border-[#FFD9D9] rounded-xl text-sm font-bold text-slate-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tanggal Mulai
                </label>
                <input
                  type="date"
                  required
                  value={mmStartDate}
                  onChange={(e) => setMmStartDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FFF9F9] border border-[#FFD9D9] rounded-xl text-sm font-medium text-slate-900 focus:bg-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddMMModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 font-bold text-xs text-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#8B0000] hover:bg-[#700000] font-bold text-xs text-white shadow-md shadow-[#8B0000]/20"
                >
                  Simpan Produk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Investasi Masuk (Beli) / Investasi Keluar (Jual) */}
      {showInvestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-[#FFD9D9] space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#FFD9D9]">
              <h3 className="text-base font-black text-[#8B0000]">
                Catat Transaksi Investasi
              </h3>
              <button
                onClick={() => setShowInvestModal(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Mode Selector Tabs */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-[#FFF0F0] rounded-2xl border border-[#FFD9D9]">
              <button
                type="button"
                onClick={() =>
                  setShowInvestModal((prev) =>
                    prev ? { ...prev, mode: "topup" } : null
                  )
                }
                className={`py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                  showInvestModal.mode === "topup"
                    ? "bg-emerald-700 text-white shadow-xs"
                    : "text-slate-600 hover:text-emerald-700"
                }`}
              >
                <ArrowUpRight className="w-4 h-4" />
                <span>Investasi Masuk (Beli)</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  setShowInvestModal((prev) =>
                    prev ? { ...prev, mode: "tarik" } : null
                  )
                }
                className={`py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                  showInvestModal.mode === "tarik"
                    ? "bg-rose-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-rose-600"
                }`}
              >
                <ArrowDownRight className="w-4 h-4" />
                <span>Investasi Keluar (Jual)</span>
              </button>
            </div>

            <form onSubmit={handleInvestAction} className="space-y-3">
              {/* Target Product Selector if multiple products */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Instrumen Investasi
                </label>
                <select
                  value={showInvestModal.productId}
                  onChange={(e) =>
                    setShowInvestModal((prev) =>
                      prev ? { ...prev, productId: e.target.value } : null
                    )
                  }
                  className="w-full px-3.5 py-2.5 bg-[#FFF9F9] border border-[#FFD9D9] rounded-xl text-sm font-bold text-slate-900 focus:bg-white"
                >
                  {displayMMProducts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.platform}) - Saldo Pokok: {formatRupiah(p.initialCapital)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    {showInvestModal.mode === "topup"
                      ? "Nominal Pembelian / Setoran (Rp)"
                      : "Nominal Penjualan / Pencairan (Rp)"}
                  </label>
                  {showInvestModal.mode === "tarik" && (
                    <span className="text-[11px] text-slate-500">
                      Maksimal pencairan:{" "}
                      <span className="font-bold text-[#8B0000]">
                        {formatRupiah(
                          displayMMProducts.find(
                            (p) => p.id === showInvestModal.productId
                          )?.initialCapital || 0
                        )}
                      </span>
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="0"
                  value={investAmount}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, "");
                    setInvestAmount(val ? Number(val).toLocaleString("id-ID") : "");
                  }}
                  className="w-full px-3.5 py-2.5 bg-[#FFF9F9] border border-[#FFD9D9] rounded-xl text-sm font-bold text-slate-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tanggal Transaksi
                </label>
                <input
                  type="date"
                  required
                  value={investDate}
                  onChange={(e) => setInvestDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FFF9F9] border border-[#FFD9D9] rounded-xl text-sm font-medium text-slate-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {showInvestModal.mode === "topup"
                    ? "Keterangan / Sumber Dana"
                    : "Keterangan / Alasan Penjualan"}
                </label>
                <input
                  type="text"
                  placeholder={
                    showInvestModal.mode === "topup"
                      ? "Contoh: Beli unit baru dari alokasi gaji"
                      : "Contoh: Jual untuk kebutuhan dana darurat"
                  }
                  value={investNote}
                  onChange={(e) => setInvestNote(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FFF9F9] border border-[#FFD9D9] rounded-xl text-sm font-medium text-slate-900 focus:bg-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowInvestModal(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 font-bold text-xs text-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className={`flex-1 py-2.5 rounded-xl font-bold text-xs text-white shadow-md transition-all ${
                    showInvestModal.mode === "topup"
                      ? "bg-emerald-700 hover:bg-emerald-800 shadow-emerald-700/20"
                      : "bg-rose-600 hover:bg-rose-700 shadow-rose-600/20"
                  }`}
                >
                  {showInvestModal.mode === "topup"
                    ? "Konfirmasi Beli / Top Up"
                    : "Konfirmasi Jual / Tarik"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Transaksi Tabungan */}
      <EditTransactionModal
        isOpen={!!editingTx}
        transaction={editingTx}
        onClose={() => setEditingTx(null)}
      />
    </div>
  );
};

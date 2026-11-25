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
  Cat,
  Fish,
  Sparkles,
  Link2,
} from "lucide-react";
import {
  SavingsAllocation,
  MoneyMarketProduct,
  FinancialGoal,
  isSavingsMatchingMMProduct,
} from "@/types/finance";
import {
  FinanceStorage,
  formatRupiah,
  formatTanggalIndo,
  calculateMoneyMarketProfit,
} from "@/lib/storage";
import {
  EditTransactionModal,
  EditableTransaction,
} from "@/components/EditTransactionModal";
import { InvestmentChart } from "@/components/InvestmentChart";
import { CatAnimation } from "./CatAnimations";
import { InteractiveCatMascot } from "./InteractiveCatMascot";
import { getCatThemeConfig } from "./catThemeConfig";
import { GoalModal } from "./GoalModal";
import { DepositGoalModal } from "./DepositGoalModal";

interface CatSavingsViewProps {
  savings: SavingsAllocation[];
  moneyMarket: MoneyMarketProduct[];
  goals?: FinancialGoal[];
  selectedMonth: string;
  onOpenQuickAdd?: () => void;
  variantId: number;
}

export const CatSavingsView: React.FC<CatSavingsViewProps> = ({
  savings,
  moneyMarket,
  goals = [],
  selectedMonth,
  onOpenQuickAdd,
  variantId,
}) => {
  const theme = getCatThemeConfig(variantId);

  // Financial Goals (Celengan Impian) State
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<FinancialGoal | null>(null);
  const [depositGoal, setDepositGoal] = useState<FinancialGoal | null>(null);

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
  const [investFundingSource, setInvestFundingSource] = useState<"salary" | "external">("external");
  const [addMMFundingSource, setAddMMFundingSource] = useState<"salary" | "external">("external");
  const [mmLinkedGoalId, setMmLinkedGoalId] = useState<string>("none");
  const [expandedHistoryId, setExpandedHistoryId] = useState<string | null>(null);

  // Simulation State
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

  const validMMProducts = (moneyMarket || []).filter(
    (m) => m && m.name && m.name.trim() !== "" && m.name !== "-"
  );

  const mmSavings = savings.filter((s) => s.targetType === "money_market");
  const emergencySavings = savings.filter((s) => s.targetType === "emergency");
  const otherSavings = savings.filter(
    (s) => s.targetType === "regular" || s.targetType === "goal"
  );

  const displayMMProducts: MoneyMarketProduct[] =
    validMMProducts.length > 0
      ? validMMProducts
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

  // Hitung modal pokok efektif per produk pasar uang (termasuk seluruh alokasi tabungan yang sesuai)
  const getProductEffectiveCapital = (prod: MoneyMarketProduct) => {
    const matchingAllocations = savings.filter((s) => isSavingsMatchingMMProduct(s, prod));
    const matchingSum = matchingAllocations.reduce((sum, curr) => sum + curr.amount, 0);
    return Math.max(prod.initialCapital, matchingSum);
  };

  const mmSummary = displayMMProducts.reduce(
    (acc, item) => {
      const effCapital = getProductEffectiveCapital(item);
      const calc = calculateMoneyMarketProfit(
        effCapital,
        item.returnRatePa,
        item.startDate,
        item.accumulatedReturn
      );
      acc.totalCapital += effCapital;
      acc.totalProfit += calc.estimatedProfit;
      acc.totalValue += calc.totalValue;
      return acc;
    },
    { totalCapital: 0, totalProfit: 0, totalValue: 0 }
  );

  // Pastikan SETIAP produk pasar uang aktif memiliki representasi alokasi tabungan
  const representedProductIds = new Set<string>();
  const normalizedSavings: SavingsAllocation[] = savings.map((s) => {
    const match = displayMMProducts.find((p) => isSavingsMatchingMMProduct(s, p));
    if (match) {
      representedProductIds.add(match.id);
      return {
        ...s,
        targetType: "money_market" as const,
      };
    }
    if (/pasar uang|bibit|sucorinvest|danamas/i.test(s.accountName || "")) {
      return {
        ...s,
        targetType: "money_market" as const,
      };
    }
    return s;
  });

  const missingMMAllocations = displayMMProducts
    .filter((p) => !representedProductIds.has(p.id))
    .map((p) => ({
      id: `mm-synced-${p.id}`,
      date: p.startDate,
      month: p.startDate.slice(0, 7),
      amount: p.initialCapital,
      targetType: "money_market" as const,
      accountName: `${p.name} (${p.platform})`,
      note: p.notes || "Modal Pokok Pasar Uang",
      createdAt: p.updatedAt || Date.now(),
    }));

  const effectiveSavings: SavingsAllocation[] = [
    ...normalizedSavings,
    ...missingMMAllocations,
  ];

  const filteredSavings = effectiveSavings.filter((s) => {
    if (savingsFilter === "money_market") return s.targetType === "money_market";
    if (savingsFilter === "emergency") return s.targetType === "emergency";
    if (savingsFilter === "other")
      return s.targetType === "regular" || s.targetType === "goal";
    return true;
  });

  const totalSavingsAll = effectiveSavings.reduce((acc, curr) => acc + curr.amount, 0);

  const totalGrandPortfolio = totalSavingsAll + mmSummary.totalProfit;

  const handleAddMMProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const cap = parseFloat(mmCapital.replace(/[^0-9]/g, "")) || 0;
    const rate = parseFloat(mmRate) || 0;
    if (!mmName || cap <= 0) {
      alert("Lengkapi nama produk dan nominal modal");
      return;
    }

    const newMMId = await FinanceStorage.addMoneyMarketProduct({
      name: mmName,
      platform: mmPlatform,
      initialCapital: cap,
      returnRatePa: rate,
      startDate: mmStartDate,
      notes: mmNotes,
    });

    await FinanceStorage.addSavings({
      date: mmStartDate,
      month: mmStartDate.substring(0, 7),
      amount: cap,
      targetType: "money_market",
      accountName: mmName,
      fundingSource: addMMFundingSource,
      note: `Modal Pokok Awal (${mmPlatform})`,
    });

    if (mmLinkedGoalId && mmLinkedGoalId !== "none") {
      await FinanceStorage.allocateExistingSavingsToGoal(
        mmLinkedGoalId,
        cap,
        `${mmName} (${mmPlatform})`,
        newMMId,
        false
      );
    }

    setMmName("");
    setMmCapital("");
    setMmLinkedGoalId("none");
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

      const prod = displayMMProducts.find((p) => p.id === showInvestModal.productId);
      await FinanceStorage.addSavings({
        date: investDate,
        month: investDate.substring(0, 7),
        amount,
        targetType: "money_market",
        accountName: prod?.name || "Sucorinvest Pasar Uang",
        fundingSource: investFundingSource,
        note: investNote || `Top Up Investasi (${prod?.name || "Pasar Uang"})`,
      });
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

  const handleDeleteProduct = (p: MoneyMarketProduct) => {
    if (window.confirm(`Hapus produk pasar uang "${p.name}"?`)) {
      FinanceStorage.deleteMoneyMarket(p.id);
    }
  };

  const handleDeleteSavings = (s: SavingsAllocation) => {
    if (window.confirm(`Hapus catatan tabungan ${formatRupiah(s.amount)}?`)) {
      FinanceStorage.deleteSavings(s.id);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Hero Banner Themed with Active Cat */}
      <div
        className="rounded-3xl p-6 sm:p-8 border shadow-sm relative overflow-hidden transition-all duration-300"
        style={{
          backgroundColor: theme.isDark ? "#111827" : "#FFFFFF",
          borderColor: theme.cardBorder,
        }}
      >
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 text-center lg:text-left">
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black"
              style={{
                backgroundColor: `${theme.accent}15`,
                color: theme.accent,
              }}
            >
              <Landmark className="w-3.5 h-3.5" />
              <span>Portofolio Tabungan & Pasar Uang Terintegrasi</span>
            </div>
            <h1
              className="text-2xl sm:text-3xl font-black tracking-tight"
              style={{ color: theme.isDark ? "#FFFFFF" : theme.textColor }}
            >
              Tabungan & Aset Pasar Uang
            </h1>
            <p
              className="text-xs sm:text-sm font-medium max-w-xl"
              style={{ color: theme.mutedText }}
            >
              Pantau tabungan yang sudah ada digabungkan dengan tabungan yang dialokasikan ke instrumen pasar uang, lengkap dengan akumulasi keuntungan (imbal hasil) secara riil.
            </p>
          </div>

          <div className="flex items-center gap-5">
            <InteractiveCatMascot
              animation={theme.pageAnimations.savings}
              theme={theme}
              size="lg"
            />

            <div
              className="p-5 rounded-2xl border text-right min-w-[200px]"
              style={{
                backgroundColor: theme.isDark ? "#1F2937" : `${theme.accent}08`,
                borderColor: theme.cardBorder,
              }}
            >
              <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">
                TOTAL KESELURUHAN TABUNGAN & ASET
              </span>
              <div
                className="text-xl sm:text-2xl font-black font-mono mt-1"
                style={{ color: theme.accent }}
              >
                {formatRupiah(totalGrandPortfolio)}
              </div>
              <span className="text-[11px] font-bold text-emerald-600">
                ↗ +{formatRupiah(mmSummary.totalProfit)} profit pasar uang
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2 Main Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Kolom 1: Alokasi Tabungan */}
        <div
          className="rounded-3xl p-6 border shadow-xs space-y-4"
          style={{
            backgroundColor: theme.isDark ? "#111827" : "#FFFFFF",
            borderColor: theme.cardBorder,
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PiggyBank className="w-5 h-5" style={{ color: theme.accent }} />
              <h3
                className="font-black text-base"
                style={{ color: theme.isDark ? "#FFFFFF" : theme.textColor }}
              >
                Daftar Alokasi Tabungan
              </h3>
            </div>
            <span
              className="text-sm font-black font-mono"
              style={{ color: theme.accent }}
            >
              {formatRupiah(totalSavingsAll)}
            </span>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {[
              { id: "all", label: "Semua", count: effectiveSavings.length },
              {
                id: "money_market",
                label: "Pasar Uang",
                count: effectiveSavings.filter((s) => s.targetType === "money_market").length,
              },
              {
                id: "emergency",
                label: "Darurat",
                count: effectiveSavings.filter((s) => s.targetType === "emergency").length,
              },
              {
                id: "other",
                label: "Target",
                count: effectiveSavings.filter(
                  (s) => s.targetType === "regular" || s.targetType === "goal"
                ).length,
              },
            ].map((f) => {
              const active = savingsFilter === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => setSavingsFilter(f.id as any)}
                  className={`px-3 py-1 rounded-xl font-bold transition-all ${
                    active
                      ? "text-white shadow-xs"
                      : theme.isDark
                      ? "text-slate-400 hover:text-white"
                      : "text-slate-600 hover:text-slate-900 bg-slate-100"
                  }`}
                  style={active ? { backgroundColor: theme.accent } : {}}
                >
                  {f.label} ({f.count})
                </button>
              );
            })}
          </div>

          {/* Savings List */}
          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
            {filteredSavings.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <span className="text-3xl block">🐾</span>
                <p className="text-xs text-slate-400">Belum ada alokasi tabungan tercatat.</p>
                <button
                  onClick={onOpenQuickAdd}
                  className="px-3 py-1.5 rounded-lg text-white text-xs font-bold shadow-xs active:scale-95"
                  style={{ backgroundColor: theme.accent }}
                >
                  + Catat Tabungan Baru
                </button>
              </div>
            ) : (
              filteredSavings.map((s) => (
                <div
                  key={s.id}
                  className="p-3 rounded-2xl border flex items-center justify-between gap-3 text-xs"
                  style={{
                    backgroundColor: theme.isDark ? "#1F2937" : theme.bgPage,
                    borderColor: theme.cardBorder,
                  }}
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span
                        className="font-black"
                        style={{ color: theme.isDark ? "#FFFFFF" : theme.textColor }}
                      >
                        {s.accountName || "Simpanan"}
                      </span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                        {s.targetType === "money_market"
                          ? "Pasar Uang"
                          : s.targetType === "emergency"
                          ? "Darurat"
                          : "Target"}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {formatTanggalIndo(s.date)} {s.note ? `• ${s.note}` : ""}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-black font-mono text-emerald-600">
                      {formatRupiah(s.amount)}
                    </span>
                    <button
                      onClick={() => handleDeleteSavings(s)}
                      className="p-1 rounded text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Kolom 2: Tabungan di Pasar Uang */}
        <div
          className="rounded-3xl p-6 border shadow-xs space-y-4"
          style={{
            backgroundColor: theme.isDark ? "#111827" : "#FFFFFF",
            borderColor: theme.cardBorder,
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" style={{ color: theme.accent }} />
              <h3
                className="font-black text-base"
                style={{ color: theme.isDark ? "#FFFFFF" : theme.textColor }}
              >
                Tabungan di Pasar Uang
              </h3>
            </div>
            <button
              onClick={() => setShowAddMMModal(true)}
              className="px-3 py-1.5 rounded-xl text-white text-xs font-black shadow-xs active:scale-95 transition-all flex items-center gap-1"
              style={{ backgroundColor: theme.accent }}
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Tambah Produk</span>
            </button>
          </div>

          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
            {displayMMProducts.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <span className="text-3xl block">🪙</span>
                <p className="text-xs text-slate-400">Belum ada portofolio pasar uang.</p>
                <button
                  onClick={() => setShowAddMMModal(true)}
                  className="px-3 py-1.5 rounded-lg text-white text-xs font-bold shadow-xs active:scale-95"
                  style={{ backgroundColor: theme.accent }}
                >
                  Tambah Produk Sekarang
                </button>
              </div>
            ) : (
              displayMMProducts.map((p) => {
                const effCapital = getProductEffectiveCapital(p);
                const calc = calculateMoneyMarketProfit(
                  effCapital,
                  p.returnRatePa,
                  p.startDate,
                  p.accumulatedReturn
                );
                const isExpanded = expandedHistoryId === p.id;

                return (
                  <div
                    key={p.id}
                    className="p-4 rounded-2xl border space-y-3"
                    style={{
                      backgroundColor: theme.isDark ? "#1F2937" : theme.bgPage,
                      borderColor: theme.cardBorder,
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4
                            className="font-black text-sm"
                            style={{ color: theme.isDark ? "#FFFFFF" : theme.textColor }}
                          >
                            {p.name}
                          </h4>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-black uppercase bg-rose-100 text-rose-800">
                            {p.platform}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400">
                          Mulai {formatTanggalIndo(p.startDate)} • Aktif {calc.daysActive} hari
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block">Nilai Saat Ini</span>
                        <span
                          className="text-base font-black font-mono"
                          style={{ color: theme.accent }}
                        >
                          {formatRupiah(calc.totalValue)}
                        </span>
                      </div>
                    </div>

                    <div
                      className="p-3 rounded-xl border grid grid-cols-3 gap-2 text-center text-xs"
                      style={{
                        backgroundColor: theme.isDark ? "#111827" : "#FFFFFF",
                        borderColor: theme.cardBorder,
                      }}
                    >
                      <div>
                        <span className="text-[10px] text-slate-400 block">Modal Pokok</span>
                        <span className="font-black">{formatRupiah(effCapital)}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Imbal Hasil</span>
                        <span className="font-black text-rose-600">{p.returnRatePa}% /thn</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Keuntungan</span>
                        <span className="font-black text-emerald-600">
                          +{formatRupiah(calc.estimatedProfit)}
                        </span>
                      </div>
                    </div>

                    {/* Action buttons: Top Up / Tarik / Delete */}
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-slate-400">
                        ~{formatRupiah(calc.monthlyReturn)} est. per bulan
                      </span>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setShowInvestModal({ productId: p.id, mode: "topup" })}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center gap-1 shadow-xs"
                        >
                          <ArrowUpRight className="w-3 h-3" />
                          <span>+ Beli / Top Up</span>
                        </button>
                        <button
                          onClick={() => setShowInvestModal({ productId: p.id, mode: "tarik" })}
                          className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 text-[11px] font-bold flex items-center gap-1 border border-rose-200"
                        >
                          <ArrowDownRight className="w-3 h-3" />
                          <span>- Jual / Tarik</span>
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p)}
                          className="p-1 text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Celengan Impian & Target Tabungan Section */}
      <div
        className="rounded-3xl p-6 sm:p-8 border shadow-sm space-y-6"
        style={{
          backgroundColor: theme.isDark ? "#111827" : "#FFFFFF",
          borderColor: theme.cardBorder,
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5" style={{ color: theme.accent }} />
              <h3
                className="text-lg font-black"
                style={{ color: theme.isDark ? "#FFFFFF" : theme.textColor }}
              >
                Celengan Impian & Target Tabungan
              </h3>
            </div>
            <p className="text-xs text-slate-400">
              Kumpulkan dana berjangka untuk target gadget, liburan, atau dana darurat. Setiap setoran otomatis tercatat di alokasi tabungan.
            </p>
          </div>

          <button
            onClick={() => {
              setEditingGoal(null);
              setIsGoalModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-2xl text-white text-xs font-black shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-1.5 self-start sm:self-auto"
            style={{ backgroundColor: theme.accent }}
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Buat Impian Baru</span>
          </button>
        </div>

        {/* Overview Stats Bar: Total Progres Seluruh Celengan Aktif */}
        {goals.length > 0 && (
          <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8E2D8] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-stone-400">
                  Total Progres Seluruh Celengan Aktif
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white text-[#854D0E] border border-[#E8E2D8]">
                  {goals.filter((g) => !g.isCompleted).length} Impian Aktif {goals.filter((g) => g.isCompleted).length > 0 ? `• ${goals.filter((g) => g.isCompleted).length} Selesai 🎉` : ""}
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-black font-mono text-[#854D0E]">
                  {formatRupiah(goals.filter((g) => !g.isCompleted).reduce((acc, curr) => acc + curr.currentAmount, 0))}
                </span>
                <span className="text-xs text-stone-500 font-medium">
                  dari target {formatRupiah(goals.filter((g) => !g.isCompleted).reduce((acc, curr) => acc + curr.targetAmount, 0))}
                </span>
              </div>
            </div>

            <div className="sm:w-64 space-y-1.5">
              {(() => {
                const active = goals.filter((g) => !g.isCompleted);
                const tgt = active.reduce((acc, curr) => acc + curr.targetAmount, 0);
                const col = active.reduce((acc, curr) => acc + curr.currentAmount, 0);
                const pct = tgt > 0 ? Math.min(100, Math.round((col / tgt) * 100)) : 0;
                return (
                  <>
                    <div className="flex justify-between text-xs font-bold text-stone-700">
                      <span>Total Tercapai</span>
                      <span className="text-[#854D0E] font-mono">{pct}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-stone-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#854D0E] rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-stone-400">
                      <span>Sisa akumulasi: {formatRupiah(Math.max(0, tgt - col))}</span>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        )}

        {goals.length === 0 ? (
          <div className="py-10 text-center space-y-3 border border-dashed border-[#E8E2D8] rounded-2xl bg-[#FAF7F2]/40">
            <div className="w-12 h-12 rounded-2xl bg-white text-[#854D0E] flex items-center justify-center text-xl mx-auto border border-[#E8E2D8]">
              🎯
            </div>
            <h4 className="text-sm font-bold text-stone-800">
              Belum ada Celengan Impian yang dibuat
            </h4>
            <p className="text-xs text-stone-400 max-w-sm mx-auto">
              Mulai rencanakan pembelian laptop, liburan impian, atau dana darurat Anda sekarang!
            </p>
            <button
              onClick={() => {
                setEditingGoal(null);
                setIsGoalModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-[#854D0E] text-white text-xs font-bold hover:bg-[#713F12] transition-all"
            >
              + Buat Celengan Impian
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {goals.map((g) => {
              const percent = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));
              const remaining = Math.max(0, g.targetAmount - g.currentAmount);

              // Calculate monthly recommendation if targetDate exists
              let monthlyNeededText = "";
              if (g.targetDate && remaining > 0) {
                const now = new Date();
                const [targetYear, targetMonthNum] = g.targetDate.split("-").map(Number);
                const currentMonths = now.getFullYear() * 12 + now.getMonth();
                const targetMonths = targetYear * 12 + (targetMonthNum - 1);
                const diffMonths = Math.max(1, targetMonths - currentMonths + 1);
                const perMonth = Math.ceil(remaining / diffMonths);
                monthlyNeededText = `Nabung ~${formatRupiah(perMonth)}/bln (${diffMonths} bln)`;
              }

              return (
                <div
                  key={g.id}
                  className={`rounded-2xl p-4 border transition-all flex flex-col justify-between gap-4 ${
                    g.isCompleted
                      ? "bg-amber-50/40 border-amber-300"
                      : "bg-[#FAF7F2]/40 hover:bg-[#FAF7F2] border-[#E8E2D8]"
                  }`}
                >
                  <div className="space-y-3">
                    {/* Top Row: Emoji, Title, Actions */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-white border border-[#E8E2D8] text-[#854D0E] flex items-center justify-center shadow-2xs flex-shrink-0">
                          <Target className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-black text-stone-900 truncate">
                            {g.title}
                          </h4>
                          <span className="text-[10px] text-stone-400 font-medium">
                            Target: {g.targetDate || "Fleksibel"} • {g.category}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingGoal(g);
                            setIsGoalModalOpen(true);
                          }}
                          className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100"
                          title="Edit"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Hapus celengan impian "${g.title}"?`)) {
                              FinanceStorage.deleteGoal(g.id);
                            }
                          }}
                          className="p-1 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50"
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Progress Bar & Amount */}
                    <div className="space-y-1.5">
                      {/* Linked Account Badge */}
                      {g.linkedAccountName ? (
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-amber-50/80 border border-amber-200/80 text-[10px] text-amber-900 font-bold w-fit">
                          <Link2 className="w-3 h-3 text-[#854D0E] flex-shrink-0" />
                          <span className="truncate">
                            Terhubung: <b className="text-[#854D0E]">{g.linkedAccountName}</b>
                          </span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setDepositGoal(g)}
                          className="flex items-center gap-1 text-[10px] font-bold text-[#854D0E] hover:underline"
                        >
                          <Link2 className="w-3 h-3" />
                          <span>+ Hubungkan ke Tabungan / Pasar Uang</span>
                        </button>
                      )}

                      <div className="flex justify-between items-baseline text-xs">
                        <span className="font-mono font-black text-[#854D0E]">
                          {formatRupiah(g.currentAmount)}
                        </span>
                        <span className="font-mono text-[11px] text-stone-400">
                          / {formatRupiah(g.targetAmount)}
                        </span>
                      </div>

                      <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            g.isCompleted ? "bg-amber-500" : "bg-[#854D0E]"
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>

                      <div className="flex justify-between items-center text-[10px] font-bold">
                        <span className={g.isCompleted ? "text-amber-700" : "text-stone-500"}>
                          {g.isCompleted ? "🎉 100% Tercapai!" : `${percent}% Tercapai`}
                        </span>
                        {monthlyNeededText && !g.isCompleted && (
                          <span className="text-[#854D0E] font-medium">{monthlyNeededText}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Action: Setor Tabungan */}
                  <div className="pt-2 border-t border-stone-200/50 flex items-center justify-between">
                    <span className="text-[10px] text-stone-400">
                      {g.isCompleted ? "Selesai" : `Sisa ${formatRupiah(remaining)}`}
                    </span>
                    <button
                      onClick={() => setDepositGoal(g)}
                      className="px-3 py-1.5 rounded-xl bg-[#854D0E] hover:bg-[#713F12] text-white text-xs font-bold active:scale-95 transition-all flex items-center gap-1.5 shadow-2xs"
                    >
                      <Coins className="w-3.5 h-3.5" />
                      <span>+ Setor / Hubungkan Saldo</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <div
        className="rounded-3xl p-6 sm:p-8 border shadow-sm space-y-6"
        style={{
          backgroundColor: theme.isDark ? "#111827" : "#FFFFFF",
          borderColor: theme.cardBorder,
        }}
      >
        <div className="flex items-center gap-2">
          <Calculator className="w-5 h-5" style={{ color: theme.accent }} />
          <div>
            <h3
              className="text-lg font-black"
              style={{ color: theme.isDark ? "#FFFFFF" : theme.textColor }}
            >
              Kalkulator & Simulasi Pertumbuhan Pasar Uang
            </h3>
            <p className="text-xs text-slate-400">
              Lihat proyeksi imbal hasil tabungan Anda jika diinvestasikan rutin ke pasar uang dibandingkan tabungan biasa.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          <div className="lg:col-span-2 space-y-4 text-xs font-bold">
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Modal Awal Setoran</span>
                <span className="font-mono text-emerald-600">{formatRupiah(simCapital)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="100000000"
                step="1000000"
                value={simCapital}
                onChange={(e) => setSimCapital(Number(e.target.value))}
                className="w-full accent-emerald-600"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Rutin Tambah Tiap Bulan (DCA)</span>
                <span className="font-mono text-emerald-600">{formatRupiah(simMonthlyAdd)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="20000000"
                step="500000"
                value={simMonthlyAdd}
                onChange={(e) => setSimMonthlyAdd(Number(e.target.value))}
                className="w-full accent-emerald-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Tenor Investasi</span>
                  <span>{simYears} Tahun</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={simYears}
                  onChange={(e) => setSimYears(Number(e.target.value))}
                  className="w-full"
                  style={{ accentColor: theme.accent }}
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Imbal Hasil (% p.a.)</span>
                  <span>{simRate}%</span>
                </div>
                <input
                  type="range"
                  min="4"
                  max="10"
                  step="0.1"
                  value={simRate}
                  onChange={(e) => setSimRate(Number(e.target.value))}
                  className="w-full"
                  style={{ accentColor: theme.accent }}
                />
              </div>
            </div>
          </div>

          <div
            className="p-6 rounded-2xl text-white space-y-3 shadow-lg"
            style={{
              backgroundColor: theme.accent,
            }}
          >
            <span className="text-[10px] font-black uppercase tracking-wider block opacity-90">
              ESTIMASI HASIL AKHIR ({simYears} TAHUN)
            </span>
            <div className="text-2xl sm:text-3xl font-black font-mono">
              {formatRupiah(simResult.totalValue)}
            </div>
            <div className="pt-3 border-t border-white/20 text-xs space-y-1 opacity-95">
              <div className="flex justify-between">
                <span>Total Uang Disetor:</span>
                <span className="font-mono">{formatRupiah(simResult.totalDeposited)}</span>
              </div>
              <div className="flex justify-between font-bold text-amber-200">
                <span>Total Keuntungan Bersih:</span>
                <span className="font-mono">+{formatRupiah(simResult.totalProfit)}</span>
              </div>
            </div>
            <p className="text-[10px] opacity-80 pt-1 leading-relaxed">
              💡 Reksa Dana Pasar Uang di Indonesia bukan objek pajak (bebas PPh 20% seperti deposito) dan bebas biaya pembelian maupun penjualan.
            </p>
          </div>
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddMMModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className="w-full max-w-md rounded-3xl p-6 border shadow-2xl space-y-4"
            style={{
              backgroundColor: theme.isDark ? "#111827" : "#FFFFFF",
              borderColor: theme.cardBorder,
            }}
          >
            <h3
              className="text-lg font-black"
              style={{ color: theme.isDark ? "#FFFFFF" : theme.textColor }}
            >
              Tambah Produk Reksa Dana Pasar Uang
            </h3>
            <form onSubmit={handleAddMMProduct} className="space-y-3 text-xs font-bold">
              <div>
                <label className="block mb-1 text-slate-400">Nama Produk</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Sucorinvest Sharia Money Market Fund"
                  value={mmName}
                  onChange={(e) => setMmName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border bg-transparent font-medium"
                  style={{ borderColor: theme.cardBorder }}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-slate-400">Platform</label>
                  <select
                    value={mmPlatform}
                    onChange={(e) => setMmPlatform(e.target.value)}
                    className="w-full p-2.5 rounded-xl border bg-transparent"
                    style={{ borderColor: theme.cardBorder }}
                  >
                    <option value="Bibit">Bibit</option>
                    <option value="Bareksa">Bareksa</option>
                    <option value="Ajaib">Ajaib</option>
                    <option value="Makmur">Makmur</option>
                    <option value="Bank">Bank Mandiri/BCA</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1 text-slate-400">Estimasi % p.a.</label>
                  <input
                    type="number"
                    step="0.1"
                    value={mmRate}
                    onChange={(e) => setMmRate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border bg-transparent font-medium"
                    style={{ borderColor: theme.cardBorder }}
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 text-slate-400">Modal Pokok Awal (Rp)</label>
                <input
                  type="text"
                  required
                  placeholder="2.000.000"
                  value={mmCapital}
                  onChange={(e) => setMmCapital(e.target.value)}
                  className="w-full p-2.5 rounded-xl border bg-transparent font-medium"
                  style={{ borderColor: theme.cardBorder }}
                />
              </div>

              {goals.filter((g) => !g.isCompleted).length > 0 && (
                <div>
                  <label className="block mb-1 text-slate-400">
                    Alokasikan Modal Ini ke Celengan Impian? (Opsional)
                  </label>
                  <select
                    value={mmLinkedGoalId}
                    onChange={(e) => setMmLinkedGoalId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border bg-transparent font-medium"
                    style={{ borderColor: theme.cardBorder }}
                  >
                    <option value="none">Simpan Saja di Portofolio (Tanpa Celengan)</option>
                    {goals
                      .filter((g) => !g.isCompleted)
                      .map((g) => (
                        <option key={g.id} value={g.id}>
                          🎯 {g.title} (Target: {formatRupiah(g.targetAmount)})
                        </option>
                      ))}
                  </select>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddMMModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-slate-600 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-white font-bold"
                  style={{ backgroundColor: theme.accent }}
                >
                  Simpan Produk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Top Up / Tarik Modal */}
      {showInvestModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className="w-full max-w-md rounded-3xl p-6 border shadow-2xl space-y-4"
            style={{
              backgroundColor: theme.isDark ? "#111827" : "#FFFFFF",
              borderColor: theme.cardBorder,
            }}
          >
            <h3
              className="text-lg font-black"
              style={{ color: theme.isDark ? "#FFFFFF" : theme.textColor }}
            >
              {showInvestModal.mode === "topup" ? "+ Beli / Top Up Investasi" : "- Jual / Tarik Investasi"}
            </h3>
            <form onSubmit={handleInvestAction} className="space-y-3 text-xs font-bold">
              <div>
                <label className="block mb-1 text-slate-400">Nominal Transaksi (Rp)</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 1.000.000"
                  value={investAmount}
                  onChange={(e) => setInvestAmount(e.target.value)}
                  className="w-full p-2.5 rounded-xl border bg-transparent font-medium"
                  style={{ borderColor: theme.cardBorder }}
                />
              </div>

              <div>
                <label className="block mb-1 text-slate-400">Tanggal</label>
                <input
                  type="date"
                  value={investDate}
                  onChange={(e) => setInvestDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border bg-transparent font-medium"
                  style={{ borderColor: theme.cardBorder }}
                />
              </div>

              {showInvestModal.mode === "topup" && (
                <div>
                  <label className="block mb-1 text-slate-400">Sumber Dana</label>
                  <select
                    value={investFundingSource}
                    onChange={(e) => setInvestFundingSource(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border bg-transparent font-medium"
                    style={{ borderColor: theme.cardBorder }}
                  >
                    <option value="external">Di luar gaji (tabungan lain/THR/bonus)</option>
                    <option value="salary">Dari Gaji Pokok bulan ini (kurangi sisa gaji)</option>
                  </select>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowInvestModal(null)}
                  className="px-4 py-2 rounded-xl text-slate-400 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-white font-bold"
                  style={{ backgroundColor: theme.accent }}
                >
                  Proses Transaksi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Goal Creation & Edit Modal */}
      <GoalModal
        isOpen={isGoalModalOpen}
        onClose={() => {
          setIsGoalModalOpen(false);
          setEditingGoal(null);
        }}
        initialGoal={editingGoal}
      />

      {/* Goal Deposit Modal */}
      <DepositGoalModal
        isOpen={depositGoal !== null}
        onClose={() => setDepositGoal(null)}
        goal={depositGoal}
      />
    </div>
  );
};

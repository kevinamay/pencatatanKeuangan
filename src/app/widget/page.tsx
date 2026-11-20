"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  Coins,
  TrendingDown,
  TrendingUp,
  PlusCircle,
  ExternalLink,
  Smartphone,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  X,
  Layers,
  ArrowRight,
  ShieldCheck,
  PiggyBank,
} from "lucide-react";
import { FinanceStorage, formatRupiah } from "@/lib/storage";
import {
  IncomeItem,
  ExpenseItem,
  SavingsAllocation,
  MoneyMarketProduct,
} from "@/types/finance";
import { CatAnimation } from "@/components/cat-prototype/CatAnimations";
import { getCatThemeConfig } from "@/components/cat-prototype/catThemeConfig";
import { useFinanceStats } from "@/components/cat-prototype/CatThemes";

// Code-splitting for QuickAddModal
const QuickAddModal = dynamic(
  () => import("@/components/QuickAddModal").then((mod) => mod.QuickAddModal),
  { ssr: false }
);

export default function WidgetPage() {
  const [selectedMonth, setSelectedMonth] = useState<string>("2026-11");
  const [incomes, setIncomes] = useState<IncomeItem[]>([]);
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [savings, setSavings] = useState<SavingsAllocation[]>([]);
  const [moneyMarket, setMoneyMarket] = useState<MoneyMarketProduct[]>([]);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(false);

  // Widget preview mode: 'standard' (4x2 glance) | 'compact' (2x2 mini) | 'action' (quick buttons)
  const [widgetMode, setWidgetMode] = useState<"standard" | "compact" | "action">("standard");

  // Modal quick add
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickAddType, setQuickAddType] = useState<"income" | "expense" | "savings">("expense");

  // Guide modal for Android/iOS users
  const [showGuide, setShowGuide] = useState(false);

  // Cat Theme 2 (Tokyo Wabi-Sabi Paper)
  const theme = getCatThemeConfig(2);

  useEffect(() => {
    FinanceStorage.initSync();

    const loadData = () => {
      setIncomes(FinanceStorage.getIncomes());
      setExpenses(FinanceStorage.getExpenses());
      setSavings(FinanceStorage.getSavings());
      setMoneyMarket(FinanceStorage.getMoneyMarket());
      setIsFirebaseConnected(FinanceStorage.getFirebaseStatus());
    };

    loadData();

    // Check query params (?action=)
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const action = params.get("action");
      if (action === "income" || action === "expense" || action === "savings") {
        setQuickAddType(action);
        setIsQuickAddOpen(true);
      }
    }

    const unsubscribe = FinanceStorage.subscribe(() => {
      loadData();
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const stats = useFinanceStats(
    incomes,
    expenses,
    savings,
    moneyMarket,
    selectedMonth
  );

  const openAdd = (type: "income" | "expense" | "savings") => {
    setQuickAddType(type);
    setIsQuickAddOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-stone-900 flex flex-col items-center justify-center p-3 sm:p-6 font-sans select-none">
      {/* Top Bar for Widget Canvas */}
      <div className="w-full max-w-md mb-3 flex items-center justify-between text-xs font-bold text-stone-500">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-mono text-stone-800 tracking-wider uppercase text-[11px]">
            TOKYO.NEKO WIDGET
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-stone-200/70 text-stone-700">
            {selectedMonth}
          </span>
        </div>

        <button
          onClick={() => setShowGuide(true)}
          className="flex items-center gap-1 text-[11px] font-bold text-[#854D0E] hover:underline bg-amber-100/60 px-2 py-1 rounded-lg"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Cara Pasang Widget</span>
        </button>
      </div>

      {/* Widget Mode Tabs Switcher */}
      <div className="w-full max-w-md mb-4 bg-white/80 backdrop-blur-xs border border-[#E8E2D8] p-1 rounded-2xl grid grid-cols-3 gap-1 text-[11px] font-bold text-stone-600 shadow-2xs">
        <button
          onClick={() => setWidgetMode("standard")}
          className={`py-1.5 rounded-xl transition-all ${
            widgetMode === "standard"
              ? "bg-[#854D0E] text-white shadow-xs font-black"
              : "hover:text-stone-900"
          }`}
        >
          Widget Saldo (4x2)
        </button>
        <button
          onClick={() => setWidgetMode("compact")}
          className={`py-1.5 rounded-xl transition-all ${
            widgetMode === "compact"
              ? "bg-[#854D0E] text-white shadow-xs font-black"
              : "hover:text-stone-900"
          }`}
        >
          Mini Kucing (2x2)
        </button>
        <button
          onClick={() => setWidgetMode("action")}
          className={`py-1.5 rounded-xl transition-all ${
            widgetMode === "action"
              ? "bg-[#854D0E] text-white shadow-xs font-black"
              : "hover:text-stone-900"
          }`}
        >
          Aksi Cepat (1x4)
        </button>
      </div>

      {/* ============================================================== */}
      {/* 1. STANDARD 4x2 GLANCE WIDGET                                  */}
      {/* ============================================================== */}
      {widgetMode === "standard" && (
        <div className="w-full max-w-md bg-white rounded-3xl border border-[#E8E2D8] p-5 sm:p-6 shadow-lg shadow-stone-200/50 relative overflow-hidden transition-all animate-fade-in">
          {/* Top Row: Mascot & Balance */}
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#854D0E] bg-[#FAF7F2] px-2 py-0.5 rounded-md border border-[#E8E2D8] inline-block">
                Sisa Kas Bersih ({selectedMonth})
              </span>
              <h2 className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-stone-900 pt-0.5">
                {formatRupiah(stats.remainingSalary)}
              </h2>
              <div className="flex items-center gap-1.5 text-xs font-bold pt-0.5">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] ${
                    stats.isDeficit
                      ? "bg-rose-50 text-rose-700 border border-rose-200"
                      : stats.isSurplus
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : "bg-[#FAF7F2] text-[#854D0E] border border-[#E8E2D8]"
                  }`}
                >
                  {stats.isDeficit ? (
                    <>
                      <TrendingDown className="w-3 h-3 text-rose-600" />
                      Defisit
                    </>
                  ) : stats.isSurplus ? (
                    <>
                      <TrendingUp className="w-3 h-3 text-emerald-600" />
                      Surplus Aman
                    </>
                  ) : (
                    <>Seimbang</>
                  )}
                </span>
                <span className="text-[11px] text-stone-400 font-medium">
                  {stats.currentExpenses.length} belanja • {stats.currentIncomes.length} gaji
                </span>
              </div>
            </div>

            {/* Mascot on Right */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 flex items-center justify-center -mr-1 -mt-1">
              <CatAnimation variant="sleeping" className="w-full h-full" />
            </div>
          </div>

          {/* Mini Financial Breakdown Pills */}
          <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-[#E8E2D8]/80 text-center">
            <div className="bg-[#FAF7F2] p-2 rounded-xl border border-[#E8E2D8]">
              <span className="block text-[9px] uppercase font-bold text-stone-400">
                Gaji Masuk
              </span>
              <span className="text-xs font-black text-stone-800 font-mono">
                {formatRupiah(stats.totalIncome)}
              </span>
            </div>
            <div className="bg-rose-50/50 p-2 rounded-xl border border-rose-100">
              <span className="block text-[9px] uppercase font-bold text-rose-500">
                Belanja
              </span>
              <span className="text-xs font-black text-rose-900 font-mono">
                {formatRupiah(stats.totalExpense)}
              </span>
            </div>
            <div className="bg-amber-50/60 p-2 rounded-xl border border-amber-100">
              <span className="block text-[9px] uppercase font-bold text-amber-700">
                Tabungan
              </span>
              <span className="text-xs font-black text-[#854D0E] font-mono">
                {formatRupiah(stats.salarySavings)}
              </span>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="grid grid-cols-2 gap-2.5 mt-4">
            <button
              onClick={() => openAdd("expense")}
              className="py-2.5 px-3 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition-all"
            >
              <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
              <span>+ Catat Belanja</span>
            </button>
            <button
              onClick={() => openAdd("income")}
              className="py-2.5 px-3 rounded-xl bg-[#854D0E] hover:bg-[#713F12] text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition-all"
            >
              <Coins className="w-3.5 h-3.5 text-amber-200" />
              <span>+ Catat Gaji</span>
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. COMPACT 2x2 MINI MASCOT WIDGET                              */}
      {/* ============================================================== */}
      {widgetMode === "compact" && (
        <div className="w-64 h-64 bg-white rounded-3xl border border-[#E8E2D8] p-5 shadow-lg shadow-stone-200/50 flex flex-col justify-between items-center text-center relative overflow-hidden transition-all animate-fade-in">
          <div className="w-full flex items-center justify-between text-[10px] font-extrabold text-stone-400 uppercase tracking-wider">
            <span>TOKYO.NEKO</span>
            <span className="px-1.5 py-0.5 rounded bg-[#FAF7F2] text-[#854D0E] font-bold">
              Nov &apos;26
            </span>
          </div>

          <div className="w-24 h-24 flex items-center justify-center my-auto">
            <CatAnimation variant="sleeping" className="w-full h-full" />
          </div>

          <div className="w-full space-y-1">
            <span className="block text-[10px] font-bold text-stone-500 uppercase tracking-tight">
              Sisa Kas Bersih
            </span>
            <p className="text-xl font-black font-mono text-stone-900">
              {formatRupiah(stats.remainingSalary)}
            </p>
          </div>

          <div className="w-full grid grid-cols-2 gap-1.5 pt-2">
            <button
              onClick={() => openAdd("expense")}
              className="py-1.5 rounded-xl bg-stone-900 text-white text-[11px] font-black active:scale-95 transition-all"
            >
              - Belanja
            </button>
            <button
              onClick={() => openAdd("income")}
              className="py-1.5 rounded-xl bg-[#854D0E] text-white text-[11px] font-black active:scale-95 transition-all"
            >
              + Gaji
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. QUICK ACTION 1x4 HORIZONTAL WIDGET                          */}
      {/* ============================================================== */}
      {widgetMode === "action" && (
        <div className="w-full max-w-md bg-white rounded-3xl border border-[#E8E2D8] p-4 shadow-lg shadow-stone-200/50 space-y-3 transition-all animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#FAF7F2] border border-[#E8E2D8] flex items-center justify-center p-0.5">
                <CatAnimation variant="calico" className="w-full h-full" />
              </div>
              <span className="text-xs font-black font-mono text-stone-900">
                Pencatatan Instan Saku
              </span>
            </div>
            <span className="text-[11px] font-mono font-bold text-[#854D0E]">
              {formatRupiah(stats.remainingSalary)}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => openAdd("expense")}
              className="p-3 rounded-2xl bg-rose-50 hover:bg-rose-100/80 border border-rose-200/70 text-rose-800 text-xs font-bold flex flex-col items-center justify-center gap-1 active:scale-95 transition-all"
            >
              <TrendingDown className="w-4 h-4 text-rose-600" />
              <span className="text-[10px] font-extrabold uppercase">Belanja</span>
            </button>
            <button
              onClick={() => openAdd("income")}
              className="p-3 rounded-2xl bg-amber-50 hover:bg-amber-100/80 border border-amber-200/70 text-amber-900 text-xs font-bold flex flex-col items-center justify-center gap-1 active:scale-95 transition-all"
            >
              <Coins className="w-4 h-4 text-[#854D0E]" />
              <span className="text-[10px] font-extrabold uppercase">Gaji Masuk</span>
            </button>
            <button
              onClick={() => openAdd("savings")}
              className="p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200/70 text-emerald-900 text-xs font-bold flex flex-col items-center justify-center gap-1 active:scale-95 transition-all"
            >
              <PiggyBank className="w-4 h-4 text-emerald-700" />
              <span className="text-[10px] font-extrabold uppercase">Tabungan</span>
            </button>
          </div>
        </div>
      )}

      {/* Bottom Actions: Link to Full App */}
      <div className="w-full max-w-md mt-5 flex items-center justify-between text-xs">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 font-bold text-[#854D0E] hover:text-[#713F12] transition-colors bg-white border border-[#E8E2D8] px-3.5 py-2 rounded-xl shadow-2xs hover:shadow-xs active:scale-95"
        >
          <span>Buka Aplikasi Penuh</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>

        <span className="text-[11px] text-stone-400 font-medium">
          Sinkronisasi Realtime Firebase
        </span>
      </div>

      {/* ============================================================== */}
      {/* MODAL: PANDUAN LENGKAP MEMASANG WIDGET DI HP                   */}
      {/* ============================================================== */}
      {showGuide && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 border border-[#E8E2D8] shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E8E2D8] pb-3">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-[#854D0E]" />
                <h3 className="text-base font-black text-stone-900">
                  Cara Pasang Widget di Layar HP
                </h3>
              </div>
              <button
                onClick={() => setShowGuide(false)}
                className="w-8 h-8 rounded-full bg-stone-100 text-stone-500 hover:text-stone-900 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              Di ponsel Android Anda, kini Anda bisa memiliki **3 versi sekaligus**:
            </p>

            <div className="space-y-3 text-xs">
              {/* Opsi 1 */}
              <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#E8E2D8] space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#854D0E] text-white flex items-center justify-center font-bold text-[10px]">
                    1
                  </span>
                  <h4 className="font-extrabold text-stone-900">
                    Widget Pintasan Cepat (Bawaan WebAPK Android)
                  </h4>
                </div>
                <p className="text-stone-600 pl-7 text-[11px] leading-relaxed">
                  1. Buka layar utama HP tempat ikon <strong>Tokyo Neko</strong> berada.<br />
                  2. <strong>Tekan dan tahan (long press)</strong> ikon aplikasi Tokyo Neko.<br />
                  3. Akan muncul pilihan menu pintasan: <em>Catat Pengeluaran</em>, <em>Catat Gaji</em>, atau <em>Widget Saku</em>.<br />
                  4. <strong>Tekan dan seret (drag)</strong> salah satu opsi tersebut langsung ke layar utama HP Anda.<br />
                  5. Pintasan tersebut langsung berfungsi sebagai <strong>Widget 1x1</strong>!
                </p>
              </div>

              {/* Opsi 2 */}
              <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/70 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#854D0E] text-white flex items-center justify-center font-bold text-[10px]">
                    2
                  </span>
                  <h4 className="font-extrabold text-stone-900">
                    Live Card Widget 4x2 di Layar Depan (Via Web Widget App)
                  </h4>
                </div>
                <p className="text-stone-600 pl-7 text-[11px] leading-relaxed">
                  Jika Anda ingin widget kartu besar (4x2 atau 2x2) yang menampilkan saldo live & animasi kucing seperti widget jam/cuaca:<br />
                  1. Download aplikasi gratis <strong>Web Widget</strong> atau <strong>Hermit</strong> dari Google Play Store.<br />
                  2. Tambahkan widget ke home screen, lalu masukkan URL halaman ini:<br />
                  <code className="block mt-1 p-1.5 bg-white rounded border border-amber-200 text-[#854D0E] font-mono text-[10px] break-all select-all">
                    https://keuangan-app-jade-eta.vercel.app/widget
                  </code>
                  3. Widget kartu live Tokyo Neko akan selalu aktif dan menyala di layar depan HP Anda!
                </p>
              </div>

              {/* Opsi 3 */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200/70 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-[10px]">
                    3
                  </span>
                  <h4 className="font-extrabold text-stone-900">
                    Pin Halaman Widget Ini ke Layar Utama
                  </h4>
                </div>
                <p className="text-stone-600 pl-7 text-[11px] leading-relaxed">
                  Di browser Chrome HP Anda, ketuk menu titik tiga (⋮) di kanan atas, lalu pilih <strong>&quot;Tambahkan ke Layar Utama&quot;</strong>. Beri nama &quot;Widget Tokyo Neko&quot;.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowGuide(false)}
              className="w-full py-2.5 rounded-xl bg-[#854D0E] text-white text-xs font-black shadow-xs active:scale-95 transition-all"
            >
              Saya Mengerti
            </button>
          </div>
        </div>
      )}

      {/* Embedded QuickAdd Modal for Instant Logging Inside Widget */}
      {isQuickAddOpen && (
        <QuickAddModal
          isOpen={isQuickAddOpen}
          onClose={() => setIsQuickAddOpen(false)}
          selectedMonth={selectedMonth}
          initialType={quickAddType}
          isCatMode={true}
          catVariant={2}
        />
      )}
    </div>
  );
}

"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  TrendingDown,
  TrendingUp,
  Coins,
  Heart,
  Moon,
  PiggyBank,
  PlusCircle,
  Smartphone,
  X,
  ExternalLink,
  RefreshCw,
  Sun,
} from "lucide-react";
import { FinanceStorage, formatRupiah } from "@/lib/storage";
import {
  IncomeItem,
  ExpenseItem,
  SavingsAllocation,
  MoneyMarketProduct,
} from "@/types/finance";
import { useFinanceStats } from "@/components/cat-prototype/CatThemes";

// Modal Quick Add
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

  // Widget Theme: 'dark' (seperti persis di gambar user) | 'paper' (Tokyo Wabi-Sabi)
  const [themeMode, setThemeMode] = useState<"dark" | "paper">("dark");

  // State modal Quick Add
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickAddType, setQuickAddType] = useState<"income" | "expense" | "savings">("expense");

  // Guide modal for home screen widget installation
  const [showGuide, setShowGuide] = useState(false);

  // Check if embed mode (for Android Web Widget without surrounding page wrapper)
  const [isEmbed, setIsEmbed] = useState(false);

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

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("embed") === "true") setIsEmbed(true);
      if (params.get("theme") === "paper") setThemeMode("paper");
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

  // Perhitungan rasio aktivitas finansial (3 concentric rings)
  const ringMetrics = useMemo(() => {
    const totalGaji = stats.totalIncome || 1; // default to avoid zero div

    // 1. Outer Ring (Green): Tabungan & Pasar Uang
    // Target tabungan ideal = 20% dari gaji
    const savingsRatio = stats.totalIncome > 0
      ? Math.min(1, stats.totalSavings / (stats.totalIncome * 0.2 || 1))
      : stats.totalSavings > 0 ? 1 : 0.84;
    const savingsBadge = stats.totalIncome > 0
      ? Math.round((stats.totalSavings / stats.totalIncome) * 100)
      : stats.totalSavings > 0 ? 100 : 84;

    // 2. Middle Ring (Pink/Coral): Pengeluaran Belanja
    const expenseRatio = stats.totalIncome > 0
      ? Math.min(1, stats.totalExpense / (stats.totalIncome * 0.5 || 1))
      : stats.totalExpense > 0 ? 0.8 : 0.53;
    const expenseBadge = stats.totalIncome > 0
      ? Math.round((stats.totalExpense / stats.totalIncome) * 100)
      : stats.totalExpense > 0 ? 50 : 53;

    // 3. Inner Ring (Cyan/Blue): Sisa Kas Bersih
    const remainingRatio = stats.totalIncome > 0
      ? Math.max(0, Math.min(1, stats.remainingSalary / stats.totalIncome))
      : stats.remainingSalary >= 0 ? 0.5 : 0.31;
    const remainingBadge = stats.totalIncome > 0
      ? Math.round((stats.remainingSalary / stats.totalIncome) * 100)
      : 31;

    // Financial Health Score (Center Disc)
    let score = 100;
    if (stats.isDeficit) {
      score = Math.max(20, Math.round(100 - Math.abs(stats.remainingRate)));
    } else if (stats.totalIncome > 0) {
      score = Math.min(100, Math.round(70 + (stats.salarySavings / stats.totalIncome) * 30));
    } else {
      score = 88; // Default good score
    }

    return {
      savingsRatio: Math.max(0.1, Math.min(0.98, savingsRatio)),
      savingsBadge,
      expenseRatio: Math.max(0.1, Math.min(0.98, expenseRatio)),
      expenseBadge,
      remainingRatio: Math.max(0.1, Math.min(0.98, remainingRatio)),
      remainingBadge,
      score,
    };
  }, [stats]);

  // SVG Concentric Activity Rings Geometry
  const cx = 110;
  const cy = 110;
  const maxSweep = 270; // 270 degrees sweep
  const startAngle = 135; // start from bottom-left

  // Ring 1 (Outer - Green)
  const r1 = 76;
  const circ1 = 2 * Math.PI * r1;
  const len1 = (maxSweep / 360) * circ1;
  const stroke1 = len1 * ringMetrics.savingsRatio;
  const angle1 = startAngle + maxSweep * ringMetrics.savingsRatio;
  const rad1 = (angle1 * Math.PI) / 180;
  const tip1 = { x: cx + r1 * Math.cos(rad1), y: cy + r1 * Math.sin(rad1) };

  // Ring 2 (Middle - Pink/Coral)
  const r2 = 56;
  const circ2 = 2 * Math.PI * r2;
  const len2 = (maxSweep / 360) * circ2;
  const stroke2 = len2 * ringMetrics.expenseRatio;
  const angle2 = startAngle + maxSweep * ringMetrics.expenseRatio;
  const rad2 = (angle2 * Math.PI) / 180;
  const tip2 = { x: cx + r2 * Math.cos(rad2), y: cy + r2 * Math.sin(rad2) };

  // Ring 3 (Inner - Cyan/Blue)
  const r3 = 36;
  const circ3 = 2 * Math.PI * r3;
  const len3 = (maxSweep / 360) * circ3;
  const stroke3 = len3 * ringMetrics.remainingRatio;
  const angle3 = startAngle + maxSweep * ringMetrics.remainingRatio;
  const rad3 = (angle3 * Math.PI) / 180;
  const tip3 = { x: cx + r3 * Math.cos(rad3), y: cy + r3 * Math.sin(rad3) };

  const isDark = themeMode === "dark";

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center p-2 sm:p-6 font-sans select-none transition-colors duration-300 ${
        isDark ? "bg-[#09090b] text-white" : "bg-[#FAF7F2] text-stone-900"
      }`}
    >
      {/* Top Bar (Hidden in pure embed mode) */}
      {!isEmbed && (
        <div className="w-full max-w-lg mb-4 flex items-center justify-between text-xs px-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span
              className={`font-mono font-bold tracking-wider uppercase text-[11px] ${
                isDark ? "text-stone-300" : "text-stone-700"
              }`}
            >
              TOKYO.NEKO WIDGET
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <button
              onClick={() => setThemeMode(isDark ? "paper" : "dark")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-all ${
                isDark
                  ? "bg-stone-800 border-stone-700 text-amber-300 hover:bg-stone-700"
                  : "bg-white border-[#E8E2D8] text-stone-700 hover:bg-stone-100"
              }`}
              title="Ganti Tema Widget"
            >
              {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              <span>{isDark ? "Dark Obsidian" : "Wabi-Sabi"}</span>
            </button>

            {/* Guide Button */}
            <button
              onClick={() => setShowGuide(true)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-[#854D0E] text-white hover:bg-[#713F12] transition-all shadow-xs"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Pasang di HP</span>
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* THE WIDGET CARD: EXACTLY MATCHING USER SCREENSHOT ARCHITECTURE */}
      {/* ============================================================== */}
      <div
        className={`w-full max-w-lg rounded-[32px] p-5 sm:p-6 shadow-2xl relative overflow-hidden transition-all duration-300 border ${
          isDark
            ? "bg-[#121214] border-white/10 text-white shadow-black/80"
            : "bg-white border-[#E8E2D8] text-stone-900 shadow-stone-300/60"
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          {/* LEFT COLUMN: Date Header & Financial Metrics */}
          <div className="space-y-4 flex-1 min-w-0 pr-1">
            {/* Widget Date Header */}
            <div>
              <h3
                className={`text-base sm:text-lg font-black tracking-tight ${
                  isDark ? "text-white" : "text-stone-900"
                }`}
              >
                Today · 20 Nov
              </h3>
            </div>

            {/* Metric 1: Sisa Kas Bersih (Blue / Moon Icon) */}
            <div className="flex items-start gap-3">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  isDark ? "bg-[#1E293B] text-sky-400" : "bg-sky-50 text-sky-600 border border-sky-100"
                }`}
              >
                <Moon className="w-4 h-4 fill-current" />
              </div>

              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span
                    className={`text-sm sm:text-base font-black font-mono tracking-tight ${
                      isDark ? "text-white" : "text-stone-900"
                    }`}
                  >
                    {formatRupiah(stats.remainingSalary)}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-400 flex items-center">
                    {stats.isDeficit ? "Defisit" : stats.isSurplus ? "Surplus ↑" : "Seimbang"}
                  </span>
                </div>
                <p className={`text-[11px] font-medium leading-none ${isDark ? "text-stone-400" : "text-stone-500"}`}>
                  Sisa Kas Bersih
                </p>
              </div>
            </div>

            {/* Metric 2: Pengeluaran Belanja (Red / Heart Icon) */}
            <div className="flex items-start gap-3">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  isDark ? "bg-rose-950/60 text-rose-500" : "bg-rose-50 text-rose-600 border border-rose-100"
                }`}
              >
                <Heart className="w-4 h-4 fill-current" />
              </div>

              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span
                    className={`text-sm sm:text-base font-black font-mono tracking-tight ${
                      isDark ? "text-white" : "text-stone-900"
                    }`}
                  >
                    {formatRupiah(stats.totalExpense)}
                  </span>
                </div>
                <p className={`text-[11px] font-medium leading-none ${isDark ? "text-stone-400" : "text-stone-500"}`}>
                  Total Belanja ({stats.currentExpenses.length} pos)
                </p>
              </div>
            </div>

            {/* Metric 3: Tabungan & Pasar Uang (Green / PiggyBank Icon) */}
            <div className="flex items-start gap-3">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  isDark ? "bg-emerald-950/60 text-emerald-400" : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                }`}
              >
                <PiggyBank className="w-4 h-4 fill-current" />
              </div>

              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span
                    className={`text-sm sm:text-base font-black font-mono tracking-tight ${
                      isDark ? "text-white" : "text-stone-900"
                    }`}
                  >
                    {formatRupiah(stats.totalSavings)}
                  </span>
                </div>
                <p className={`text-[11px] font-medium leading-none ${isDark ? "text-stone-400" : "text-stone-500"}`}>
                  Tabungan & Pasar Uang
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: 3 CONCENTRIC ACTIVITY RINGS WITH ARCS & CENTER DISC */}
          <div className="w-[170px] sm:w-[190px] h-[170px] sm:h-[190px] flex-shrink-0 relative flex items-center justify-center">
            <svg viewBox="0 0 220 220" className="w-full h-full overflow-visible">
              <defs>
                <filter id="whiteDiscShadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.35" />
                </filter>
              </defs>

              {/* Background Track 1 (Outer - Green Track) */}
              <circle
                cx={cx}
                cy={cy}
                r={r1}
                fill="none"
                stroke={isDark ? "#22262B" : "#E5E7EB"}
                strokeWidth="15"
                strokeDasharray={`${len1} ${circ1}`}
                strokeLinecap="round"
                transform={`rotate(${startAngle} ${cx} ${cy})`}
              />
              {/* Foreground Ring 1 (Outer - Green Tabungan) */}
              <circle
                cx={cx}
                cy={cy}
                r={r1}
                fill="none"
                stroke="#4ADE80"
                strokeWidth="15"
                strokeDasharray={`${stroke1} ${circ1}`}
                strokeLinecap="round"
                transform={`rotate(${startAngle} ${cx} ${cy})`}
              />
              {/* Tip Badge 1 */}
              <g transform={`translate(${tip1.x}, ${tip1.y})`}>
                <circle r="9" fill="#15803D" stroke="#4ADE80" strokeWidth="1.5" />
                <text
                  x="0"
                  y="3.5"
                  textAnchor="middle"
                  fill="#FFFFFF"
                  fontSize="8.5"
                  fontWeight="900"
                  fontFamily="monospace"
                >
                  {ringMetrics.savingsBadge}
                </text>
              </g>

              {/* Background Track 2 (Middle - Pink/Coral Track) */}
              <circle
                cx={cx}
                cy={cy}
                r={r2}
                fill="none"
                stroke={isDark ? "#22262B" : "#E5E7EB"}
                strokeWidth="15"
                strokeDasharray={`${len2} ${circ2}`}
                strokeLinecap="round"
                transform={`rotate(${startAngle} ${cx} ${cy})`}
              />
              {/* Foreground Ring 2 (Middle - Pink/Coral Belanja) */}
              <circle
                cx={cx}
                cy={cy}
                r={r2}
                fill="none"
                stroke="#FB7185"
                strokeWidth="15"
                strokeDasharray={`${stroke2} ${circ2}`}
                strokeLinecap="round"
                transform={`rotate(${startAngle} ${cx} ${cy})`}
              />
              {/* Tip Badge 2 */}
              <g transform={`translate(${tip2.x}, ${tip2.y})`}>
                <circle r="9" fill="#BE123C" stroke="#FB7185" strokeWidth="1.5" />
                <text
                  x="0"
                  y="3.5"
                  textAnchor="middle"
                  fill="#FFFFFF"
                  fontSize="8.5"
                  fontWeight="900"
                  fontFamily="monospace"
                >
                  {ringMetrics.expenseBadge}
                </text>
              </g>

              {/* Background Track 3 (Inner - Cyan/Blue Track) */}
              <circle
                cx={cx}
                cy={cy}
                r={r3}
                fill="none"
                stroke={isDark ? "#22262B" : "#E5E7EB"}
                strokeWidth="15"
                strokeDasharray={`${len3} ${circ3}`}
                strokeLinecap="round"
                transform={`rotate(${startAngle} ${cx} ${cy})`}
              />
              {/* Foreground Ring 3 (Inner - Cyan Sisa Kas) */}
              <circle
                cx={cx}
                cy={cy}
                r={r3}
                fill="none"
                stroke="#38BDF8"
                strokeWidth="15"
                strokeDasharray={`${stroke3} ${circ3}`}
                strokeLinecap="round"
                transform={`rotate(${startAngle} ${cx} ${cy})`}
              />
              {/* Tip Badge 3 */}
              <g transform={`translate(${tip3.x}, ${tip3.y})`}>
                <circle r="9" fill="#0369A1" stroke="#38BDF8" strokeWidth="1.5" />
                <text
                  x="0"
                  y="3.5"
                  textAnchor="middle"
                  fill="#FFFFFF"
                  fontSize="8.5"
                  fontWeight="900"
                  fontFamily="monospace"
                >
                  {ringMetrics.remainingBadge}
                </text>
              </g>

              {/* Center White Disc with Shadow & Financial Health Score */}
              <circle cx={cx} cy={cy} r="25" fill="#FFFFFF" filter="url(#whiteDiscShadow)" />
              <text
                x={cx}
                y={cy + 1}
                textAnchor="middle"
                fill="#000000"
                fontSize="18"
                fontWeight="900"
                fontFamily="monospace"
              >
                {ringMetrics.score}
              </text>
              <text
                x={cx}
                y={cy + 14}
                textAnchor="middle"
                fill="#52525B"
                fontSize="8"
                fontWeight="900"
                fontFamily="sans-serif"
                letterSpacing="0.05em"
              >
                SEHAT
              </text>
            </svg>
          </div>
        </div>

        {/* Quick Action Button Strip (Direct Recording Inside Widget) */}
        <div className="mt-4 pt-3.5 border-t border-white/10 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                setQuickAddType("expense");
                setIsQuickAddOpen(true);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all active:scale-95 flex items-center gap-1 shadow-xs ${
                isDark
                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30"
                  : "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100"
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Belanja</span>
            </button>

            <button
              onClick={() => {
                setQuickAddType("income");
                setIsQuickAddOpen(true);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all active:scale-95 flex items-center gap-1 shadow-xs ${
                isDark
                  ? "bg-[#854D0E] text-white hover:bg-[#713F12]"
                  : "bg-[#854D0E] text-white hover:bg-[#713F12]"
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Gaji</span>
            </button>
          </div>

          <Link
            href="/"
            className={`text-xs font-bold flex items-center gap-1 px-2.5 py-1.5 rounded-xl transition-all ${
              isDark ? "text-stone-400 hover:text-white" : "text-stone-600 hover:text-stone-900"
            }`}
          >
            <span>Buka situs</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Direct Android APK Download Card */}
      {!isEmbed && (
        <div
          className={`w-full max-w-lg mt-4 p-4 rounded-2xl border flex items-center justify-between gap-3 text-xs transition-all ${
            isDark
              ? "bg-[#18181b] border-white/10 text-white"
              : "bg-amber-50/80 border-amber-200 text-stone-900"
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center flex-shrink-0">
              <Smartphone className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h4 className="font-black text-xs truncate">
                File APK Android Asli (.apk)
              </h4>
              <p className={`text-[11px] truncate ${isDark ? "text-stone-400" : "text-stone-600"}`}>
                Agar widget muncul resmi di menu sistem HP Anda.
              </p>
            </div>
          </div>
          <a
            href="https://github.com/kevinamay/pencatatanKeuangan/releases/tag/latest"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 rounded-xl bg-[#854D0E] hover:bg-[#713F12] text-white font-black text-xs whitespace-nowrap active:scale-95 transition-all shadow-xs flex-shrink-0 flex items-center gap-1"
          >
            <span>Unduh APK</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}

      {/* ============================================================== */}
      {/* POPUP: CARA PASANG WIDGET PERSIS SEPERTI GAMBAR DI HP          */}
      {/* ============================================================== */}
      {showGuide && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div
            className={`rounded-3xl max-w-lg w-full p-6 border shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto ${
              isDark ? "bg-[#18181b] border-stone-800 text-white" : "bg-white border-[#E8E2D8] text-stone-900"
            }`}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-black">
                  Cara Pasang Widget Persis Gambar di HP
                </h3>
              </div>
              <button
                onClick={() => setShowGuide(false)}
                className="w-8 h-8 rounded-full bg-stone-800 text-stone-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs leading-relaxed text-stone-300">
              Widget di screenshot Anda memiliki tombol <strong>&quot;↗ Buka situs&quot;</strong> di bawahnya. Itu adalah **Web Widget** di Android. Berikut 2 cara mudah memasangnya di layar utama HP Anda:
            </p>

            <div className="space-y-3 text-xs">
              {/* Cara 1 */}
              <div
                className={`p-4 rounded-2xl border space-y-2 ${
                  isDark ? "bg-stone-900 border-stone-800" : "bg-stone-50 border-stone-200"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px]">
                    1
                  </span>
                  <h4 className="font-extrabold text-white">
                    Menggunakan Web Widget / Widget Browser Bawaan HP
                  </h4>
                </div>
                <p className="text-stone-300 text-[11px] leading-relaxed pl-7">
                  1. Cubit atau tekan lama <strong>area kosong</strong> di Layar Utama HP Anda.<br />
                  2. Pilih menu <strong>Widget</strong>.<br />
                  3. Cari widget <strong>Web Widget</strong> atau <strong>Chrome Web Card</strong>.<br />
                  4. Masukkan URL widget kita:<br />
                  <code className="block mt-1 p-2 bg-black/60 rounded border border-white/10 text-emerald-400 font-mono text-[10px] break-all select-all">
                    https://keuangan-app-jade-eta.vercel.app/widget
                  </code>
                  5. Simpan, dan widget kartu hitam dengan 3 cincin aktivitas & saldo akan langsung menyala di layar HP Anda!
                </p>
              </div>

              {/* Cara 2 */}
              <div
                className={`p-4 rounded-2xl border space-y-2 ${
                  isDark ? "bg-stone-900 border-stone-800" : "bg-stone-50 border-stone-200"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold text-[10px]">
                    2
                  </span>
                  <h4 className="font-extrabold text-white">
                    Pintasan Instan (Bawaan WebAPK)
                  </h4>
                </div>
                <p className="text-stone-300 text-[11px] leading-relaxed pl-7">
                  Jika menekan lama ikon aplikasi Tokyo Neko di HP Anda belum memunculkan menu, pastikan aplikasi telah diperbarui atau buka Chrome, lalu pilih <strong>&quot;Tambahkan ke Layar Utama&quot;</strong> pada halaman <code>/widget</code> ini.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowGuide(false)}
              className="w-full py-2.5 rounded-xl bg-[#854D0E] text-white text-xs font-black shadow-xs active:scale-95 transition-all"
            >
              Tutup Panduan
            </button>
          </div>
        </div>
      )}

      {/* Embedded QuickAdd Modal */}
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

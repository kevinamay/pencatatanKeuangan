"use client";

import React from "react";
import {
  Calendar,
  PlusCircle,
  LayoutDashboard,
  ArrowUpDown,
  TrendingUp,
  FileText,
  ChevronDown,
  Download,
  ShoppingBag,
} from "lucide-react";

interface NavbarProps {
  activeTab: "dashboard" | "transactions" | "savings" | "report" | "planned";
  setActiveTab: (tab: "dashboard" | "transactions" | "savings" | "report" | "planned") => void;
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  isFirebaseConnected: boolean;
  onOpenQuickAdd: () => void;
}

const MONTH_OPTIONS = [
  { value: "2026-11", label: "November 2026", shortLabel: "Nov '26" },
  { value: "2026-10", label: "Oktober 2026", shortLabel: "Okt '26" },
  { value: "2026-09", label: "September 2026", shortLabel: "Sep '26" },
  { value: "2026-08", label: "Agustus 2026", shortLabel: "Agu '26" },
  { value: "2026-07", label: "Juli 2026", shortLabel: "Jul '26" },
  { value: "2026-06", label: "Juni 2026", shortLabel: "Jun '26" },
  { value: "2026-12", label: "Desember 2026", shortLabel: "Des '26" },
];

// ==============================================================
// FIXED PERMANENT HEADER: SWISS MINIMALIST (Desain #2)
// Pure Whitespace, Razor-sharp Monospace Logo & Micro Indicators
// ==============================================================
export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  selectedMonth,
  setSelectedMonth,
  isFirebaseConnected,
  onOpenQuickAdd,
}) => {
  const currentMonthOption =
    MONTH_OPTIONS.find((m) => m.value === selectedMonth) || MONTH_OPTIONS[0];

  const navTabs = [
    {
      id: "dashboard" as const,
      label: "Ringkasan",
      shortLabel: "Ringkasan",
      icon: LayoutDashboard,
    },
    {
      id: "transactions" as const,
      label: "Transaksi",
      shortLabel: "Transaksi",
      icon: ArrowUpDown,
    },
    {
      id: "savings" as const,
      label: "Tabungan & Pasar Uang",
      shortLabel: "Tabungan",
      icon: TrendingUp,
    },
    {
      id: "planned" as const,
      label: "Rencana & Wishlist",
      shortLabel: "Rencana",
      icon: ShoppingBag,
    },
    {
      id: "report" as const,
      label: "Audit Rekonsiliasi",
      shortLabel: "Audit",
      icon: FileText,
    },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-[#FFD9D9] shadow-xs print:hidden">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
          {/* Monospace Logo & Badge */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 min-w-0">
            <span className="text-lg sm:text-xl font-black text-[#8B0000] tracking-tighter uppercase font-mono">
              FIN.PLAN
            </span>
            <div className="h-4 w-px bg-[#FFD9D9] hidden sm:block" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest hidden sm:inline">
              PRO EDITION
            </span>
          </div>

          {/* Minimal Text Tabs with Indicator Dot (Desktop) */}
          <nav className="hidden md:flex items-center gap-7">
            {navTabs.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 text-xs uppercase tracking-wider font-extrabold transition-all py-1 ${
                    active ? "text-[#8B0000]" : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full transition-transform ${
                      active ? "bg-[#8B0000] scale-100" : "bg-transparent scale-0"
                    }`}
                  />
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* Actions: Period Selector & Quick Add Button */}
          <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
            {/* Native Select with Responsive Visuals */}
            <div className="relative flex items-center bg-[#FFF0F0] border border-[#FFD9D9] px-2 py-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-extrabold text-[#8B0000] cursor-pointer select-none">
              <Calendar className="w-3.5 h-3.5 mr-1 text-[#8B0000] flex-shrink-0" />
              <span className="sm:hidden font-bold text-xs whitespace-nowrap">
                {currentMonthOption.shortLabel}
              </span>
              <span className="hidden sm:inline font-bold text-xs whitespace-nowrap">
                {currentMonthOption.label}
              </span>
              <ChevronDown className="w-3 h-3 ml-1 opacity-70 flex-shrink-0 text-[#8B0000]" />

              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer text-base sm:text-xs"
                aria-label="Pilih Bulan"
              >
                {MONTH_OPTIONS.map((m) => (
                  <option key={m.value} value={m.value} className="text-slate-900 font-semibold bg-white">
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Install PWA / WebAPK Button (Mobile Only) */}
            <button
              onClick={() => {
                if (typeof window !== "undefined" && (window as any).triggerPwaInstall) {
                  (window as any).triggerPwaInstall();
                }
              }}
              className="md:!hidden px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg bg-amber-50 hover:bg-amber-100 text-[#854D0E] border border-amber-300 text-xs font-bold transition-all shadow-xs active:scale-95 flex items-center gap-1 sm:gap-1.5 flex-shrink-0 cursor-pointer"
              title="Pasang Aplikasi Tokyo Neko (WebAPK)"
            >
              <Download className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="hidden sm:inline">Install App</span>
              <span className="sm:hidden">APK</span>
            </button>

            {/* Quick Add Button */}
            <button
              onClick={onOpenQuickAdd}
              className="px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-[#8B0000] hover:bg-[#700000] text-white text-xs font-extrabold tracking-wide uppercase transition-all shadow-xs active:scale-95 flex items-center gap-1 sm:gap-1.5 flex-shrink-0"
              title="Tambah Transaksi Baru"
            >
              <PlusCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="hidden sm:inline">+ Transaksi</span>
              <span className="sm:hidden">+ Catat</span>
            </button>
          </div>
        </div>

        {/* Mobile Segmented Navigation Tabs */}
        <div className="md:hidden pb-2.5 pt-0.5">
          <div className="grid grid-cols-4 gap-1 p-1 rounded-xl bg-[#FFF0F0] border border-[#FFD9D9] text-center text-[11px] font-extrabold">
            {navTabs.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-1.5 px-1 rounded-lg transition-all truncate ${
                    active
                      ? "bg-[#8B0000] text-white shadow-2xs font-black"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                  title={tab.label}
                >
                  <span className="sm:hidden">{tab.shortLabel}</span>
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
};

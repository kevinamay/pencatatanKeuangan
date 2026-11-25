"use client";

import React, { useState } from "react";
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
  Menu,
  X,
  ChevronRight,
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
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const currentMonthOption =
    MONTH_OPTIONS.find((m) => m.value === selectedMonth) || MONTH_OPTIONS[0];

  const navTabs = [
    {
      id: "dashboard" as const,
      label: "Ringkasan",
      shortLabel: "Ringkasan",
      desc: "Dashboard & visualisasi grafik",
      icon: LayoutDashboard,
    },
    {
      id: "transactions" as const,
      label: "Transaksi",
      shortLabel: "Transaksi",
      desc: "Pemasukan & pengeluaran kas",
      icon: ArrowUpDown,
    },
    {
      id: "savings" as const,
      label: "Tabungan & Pasar Uang",
      shortLabel: "Tabungan",
      desc: "Celengan impian & pasar uang",
      icon: TrendingUp,
    },
    {
      id: "planned" as const,
      label: "Rencana & Wishlist",
      shortLabel: "Rencana",
      desc: "Wacana belanja & wishlist",
      icon: ShoppingBag,
    },
    {
      id: "report" as const,
      label: "Audit Rekonsiliasi",
      shortLabel: "Audit",
      desc: "Rekonsiliasi & ekspor laporan",
      icon: FileText,
    },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white border-b border-[#FFD9D9] shadow-xs print:hidden">
        <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
            {/* Monospace Logo & Mobile Hamburger */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 min-w-0">
              {/* Mobile Hamburger Button */}
              <button
                type="button"
                onClick={() => setIsMobileSidebarOpen(true)}
                className="p-1.5 -ml-1 rounded-xl transition-all md:hidden flex items-center justify-center bg-[#FFF0F0] text-[#8B0000] active:scale-95 cursor-pointer"
                aria-label="Buka Menu Navigasi"
                title="Buka Menu Navigasi"
              >
                <Menu className="w-5 h-5" />
              </button>

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
        </div>
      </header>

      {/* MOBILE SIDEBAR DRAWER */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs transition-opacity duration-300 md:hidden animate-fade-in"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 max-w-[85vw] flex flex-col bg-white border-r border-[#FFD9D9] shadow-2xl transition-all duration-300 ease-in-out md:hidden ${
          isMobileSidebarOpen
            ? "translate-x-0 opacity-100 visible pointer-events-auto"
            : "-translate-x-full opacity-0 invisible pointer-events-none"
        }`}
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-[#FFD9D9] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-xl font-black text-[#8B0000] tracking-tighter uppercase font-mono">
              FIN.PLAN
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              PRO
            </span>
          </div>

          <button
            onClick={() => setIsMobileSidebarOpen(false)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Tutup Menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sync Status Badge */}
        <div className="px-5 pt-3 pb-1">
          <div
            className={`px-3 py-1.5 rounded-xl text-[10px] font-bold flex items-center gap-2 border ${
              isFirebaseConnected
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-amber-50 text-amber-800 border-amber-200"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isFirebaseConnected ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
              }`}
            />
            <span>{isFirebaseConnected ? "Cloud Sync Aktif (Realtime)" : "Mode Offline"}</span>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1.5">
          <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Menu Utama
          </span>
          {navTabs.map((tab) => {
            const active = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setIsMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between p-3 rounded-2xl text-left transition-all active:scale-[0.98] cursor-pointer ${
                  active
                    ? "bg-[#FFF0F0] text-[#8B0000] font-black border border-[#FFD9D9] shadow-2xs"
                    : "text-slate-700 hover:bg-slate-50 font-bold"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                      active ? "bg-[#8B0000] text-white" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs block leading-tight">{tab.label}</span>
                    <span className="text-[10px] text-slate-400 font-normal block">
                      {tab.desc}
                    </span>
                  </div>
                </div>

                <ChevronRight
                  className={`w-4 h-4 transition-transform ${
                    active ? "text-[#8B0000] translate-x-0.5 opacity-100" : "opacity-30"
                  }`}
                />
              </button>
            );
          })}
        </div>

        {/* Drawer Footer Actions */}
        <div className="p-4 border-t border-[#FFD9D9] space-y-2">
          <button
            onClick={() => {
              setIsMobileSidebarOpen(false);
              onOpenQuickAdd();
            }}
            className="w-full py-2.5 px-3 rounded-xl bg-[#8B0000] hover:bg-[#700000] text-white text-xs font-black flex items-center justify-center gap-2 shadow-xs active:scale-95 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Catat Transaksi Baru</span>
          </button>
        </div>
      </aside>
    </>
  );
};

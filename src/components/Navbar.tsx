"use client";

import React from "react";
import {
  Calendar,
  PlusCircle,
  LayoutDashboard,
  ArrowUpDown,
  TrendingUp,
  FileText,
} from "lucide-react";

interface NavbarProps {
  activeTab: "dashboard" | "transactions" | "savings" | "report";
  setActiveTab: (tab: "dashboard" | "transactions" | "savings" | "report") => void;
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  isFirebaseConnected: boolean;
  onOpenQuickAdd: () => void;
}

const MONTH_OPTIONS = [
  { value: "2026-11", label: "November 2026" },
  { value: "2026-10", label: "Oktober 2026" },
  { value: "2026-09", label: "September 2026" },
  { value: "2026-08", label: "Agustus 2026" },
  { value: "2026-07", label: "Juli 2026" },
  { value: "2026-06", label: "Juni 2026" },
  { value: "2026-12", label: "Desember 2026" },
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
  const navTabs = [
    { id: "dashboard" as const, label: "Ringkasan", icon: LayoutDashboard },
    { id: "transactions" as const, label: "Transaksi", icon: ArrowUpDown },
    { id: "savings" as const, label: "Tabungan & Pasar Uang", icon: TrendingUp },
    { id: "report" as const, label: "Audit Rekonsiliasi", icon: FileText },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-[#FFD9D9] shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Monospace Logo & Badge */}
          <div className="flex items-center gap-3">
            <span className="text-xl font-black text-[#991213] tracking-tighter uppercase font-mono">
              FIN.PLAN
            </span>
            <div className="h-4 w-px bg-[#FFD9D9]" />
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
                    active ? "text-[#991213]" : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full transition-transform ${
                      active ? "bg-[#991213] scale-100" : "bg-transparent scale-0"
                    }`}
                  />
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* Actions: Period Selector & Quick Add Button */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="flex items-center bg-[#FFF0F0] border border-[#FFD9D9] px-2.5 py-1.5 rounded-lg text-xs font-extrabold text-[#991213]">
              <Calendar className="w-3.5 h-3.5 mr-1.5 text-[#991213]" />
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-transparent border-none outline-none cursor-pointer font-extrabold text-[#991213]"
              >
                {MONTH_OPTIONS.map((m) => (
                  <option key={m.value} value={m.value} className="text-slate-900 font-semibold">
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={onOpenQuickAdd}
              className="px-4 py-2 rounded-lg bg-[#991213] hover:bg-[#7a0e0f] text-white text-xs font-extrabold tracking-wide uppercase transition-all shadow-xs active:scale-95 flex items-center gap-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>+ Transaksi</span>
            </button>
          </div>
        </div>

        {/* Mobile Horizontal Sub-Navbar */}
        <div className="md:hidden flex items-center gap-2 py-2 border-t border-[#FFD9D9]/50 overflow-x-auto text-[11px] font-extrabold uppercase tracking-wider">
          {navTabs.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 px-2.5 py-1 rounded-md transition-all ${
                  active
                    ? "bg-[#991213] text-white"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};

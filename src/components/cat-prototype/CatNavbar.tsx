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
} from "lucide-react";
import { CatAnimation } from "./CatAnimations";
import { getCatThemeConfig } from "./catThemeConfig";

interface CatNavbarProps {
  activeTab: "dashboard" | "transactions" | "savings" | "report";
  setActiveTab: (tab: "dashboard" | "transactions" | "savings" | "report") => void;
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  isFirebaseConnected: boolean;
  onOpenQuickAdd: () => void;
  variantId: number;
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

export const CatNavbar: React.FC<CatNavbarProps> = ({
  activeTab,
  setActiveTab,
  selectedMonth,
  setSelectedMonth,
  isFirebaseConnected,
  onOpenQuickAdd,
  variantId,
}) => {
  const theme = getCatThemeConfig(variantId);

  // Tab-specific animation for navbar mini badge
  const tabAnimation = theme.pageAnimations[activeTab] || theme.pageAnimations.dashboard;

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
      id: "report" as const,
      label: "Audit Rekonsiliasi",
      shortLabel: "Audit",
      icon: FileText,
    },
  ];

  return (
    <header
      className={`sticky top-0 z-40 w-full border-b transition-colors duration-300 print:hidden ${
        theme.isDark
          ? "bg-[#0A0E17]/95 backdrop-blur-md border-white/10 text-white"
          : "bg-white/95 backdrop-blur-md border-slate-200 text-slate-900"
      }`}
      style={{
        borderBottomColor: theme.cardBorder,
      }}
    >
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
          {/* Logo with Dynamic Page-Specific Cat Mascot */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 min-w-0">
            <div
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center overflow-hidden shadow-xs border transition-transform hover:scale-105 flex-shrink-0"
              style={{
                backgroundColor: theme.isDark ? "#1E293B" : theme.bgPage,
                borderColor: theme.cardBorder,
              }}
              title={`Mode Kucing: #${variantId} ${theme.name}`}
            >
              <CatAnimation variant={tabAnimation} className="w-7 h-7 sm:w-8 sm:h-8" />
            </div>

            <div className="flex flex-col min-w-0">
              <span
                className="text-sm sm:text-lg font-black tracking-tight font-mono truncate"
                style={{ color: theme.accent }}
              >
                {theme.navTitle}
              </span>
              <span
                className={`text-[10px] font-semibold -mt-0.5 hidden md:inline truncate ${
                  theme.isDark ? "text-slate-400" : "text-slate-500"
                }`}
              >
                {theme.navSubtitle}
              </span>
            </div>
          </div>

          {/* Navigation Tabs (Desktop) */}
          <nav className="hidden md:flex items-center gap-6">
            {navTabs.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 text-xs uppercase tracking-wider font-extrabold transition-all py-1.5 px-3 rounded-xl ${
                    active
                      ? "shadow-xs"
                      : theme.isDark
                      ? "text-slate-400 hover:text-white hover:bg-white/5"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                  style={
                    active
                      ? {
                          backgroundColor: `${theme.accent}18`,
                          color: theme.accent,
                          borderColor: `${theme.accent}40`,
                        }
                      : {}
                  }
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full transition-transform ${
                      active ? "scale-100" : "scale-0"
                    }`}
                    style={{ backgroundColor: theme.accent }}
                  />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Period Selector & Quick Add Button */}
          <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
            {/* Native Select with Responsive Visuals */}
            <div
              className="relative flex items-center px-2 py-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-extrabold border transition-colors cursor-pointer select-none"
              style={{
                backgroundColor: theme.isDark ? "#1E293B" : `${theme.accent}10`,
                borderColor: theme.cardBorder,
                color: theme.accent,
              }}
            >
              <Calendar className="w-3.5 h-3.5 mr-1 flex-shrink-0" style={{ color: theme.accent }} />
              <span className="sm:hidden font-bold text-xs whitespace-nowrap">
                {currentMonthOption.shortLabel}
              </span>
              <span className="hidden sm:inline font-bold text-xs whitespace-nowrap">
                {currentMonthOption.label}
              </span>
              <ChevronDown className="w-3 h-3 ml-1 opacity-70 flex-shrink-0" />

              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer text-base sm:text-xs"
                aria-label="Pilih Bulan"
              >
                {MONTH_OPTIONS.map((m) => (
                  <option
                    key={m.value}
                    value={m.value}
                    className="text-slate-900 font-semibold bg-white"
                  >
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Install PWA / WebAPK Button */}
            <button
              onClick={() => {
                if (typeof window !== "undefined" && (window as any).triggerPwaInstall) {
                  (window as any).triggerPwaInstall();
                }
              }}
              className="px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95 flex items-center gap-1 sm:gap-1.5 flex-shrink-0 cursor-pointer border"
              style={{
                backgroundColor: theme.isDark ? "#1E293B" : "#FEF3C7",
                borderColor: theme.isDark ? "#334155" : "#FDE68A",
                color: theme.isDark ? "#FDE68A" : "#92400E",
              }}
              title="Pasang Aplikasi Tokyo Neko (WebAPK)"
            >
              <Download className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="hidden sm:inline">Install App</span>
              <span className="sm:hidden">APK</span>
            </button>

            {/* Quick Add Button - Responsive label so it never truncates on mobile */}
            <button
              onClick={onOpenQuickAdd}
              className="px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-white text-xs font-black tracking-wide uppercase transition-all shadow-xs active:scale-95 flex items-center gap-1 sm:gap-1.5 flex-shrink-0"
              style={{
                backgroundColor: theme.accent,
              }}
              title="Tambah Transaksi Baru"
            >
              <PlusCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="hidden sm:inline">+ Transaksi</span>
              <span className="sm:hidden">+ Catat</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Segmented Control - Full Width 4-Columns, No Overflow, No Scrollbars */}
        <div className="md:hidden pb-2.5 pt-0.5">
          <div
            className="grid grid-cols-4 gap-1 p-1 rounded-2xl border text-center text-[11px] font-extrabold shadow-2xs"
            style={{
              backgroundColor: theme.isDark ? "#1E293B" : "#FAF7F2",
              borderColor: theme.cardBorder,
            }}
          >
            {navTabs.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-1.5 px-1 rounded-xl transition-all duration-200 truncate ${
                    active
                      ? "text-white shadow-xs font-black"
                      : theme.isDark
                      ? "text-slate-400 hover:text-white"
                      : "text-stone-600 hover:text-stone-900"
                  }`}
                  style={
                    active
                      ? { backgroundColor: theme.accent }
                      : {}
                  }
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

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
  { value: "2026-11", label: "November 2026" },
  { value: "2026-10", label: "Oktober 2026" },
  { value: "2026-09", label: "September 2026" },
  { value: "2026-08", label: "Agustus 2026" },
  { value: "2026-07", label: "Juli 2026" },
  { value: "2026-06", label: "Juni 2026" },
  { value: "2026-12", label: "Desember 2026" },
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

  const navTabs = [
    { id: "dashboard" as const, label: "Ringkasan", icon: LayoutDashboard },
    { id: "transactions" as const, label: "Transaksi", icon: ArrowUpDown },
    { id: "savings" as const, label: "Tabungan & Pasar Uang", icon: TrendingUp },
    { id: "report" as const, label: "Audit Rekonsiliasi", icon: FileText },
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo with Dynamic Page-Specific Cat Mascot */}
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center overflow-hidden shadow-xs border transition-transform hover:scale-105"
              style={{
                backgroundColor: theme.isDark ? "#1E293B" : theme.bgPage,
                borderColor: theme.cardBorder,
              }}
              title={`Mode Kucing: #${variantId} ${theme.name}`}
            >
              <CatAnimation variant={tabAnimation} className="w-8 h-8" />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span
                  className="text-base sm:text-lg font-black tracking-tight font-mono"
                  style={{ color: theme.accent }}
                >
                  {theme.navTitle}
                </span>
                <span
                  className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider hidden sm:inline-block"
                  style={{
                    backgroundColor: `${theme.accent}15`,
                    color: theme.accent,
                  }}
                >
                  WABI-SABI EDITION
                </span>
              </div>
              <span
                className={`text-[10px] font-semibold -mt-0.5 hidden md:inline ${
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
          <div className="flex items-center gap-2 sm:gap-3">
            <div
              className="flex items-center px-2.5 py-1.5 rounded-xl text-xs font-extrabold border"
              style={{
                backgroundColor: theme.isDark ? "#1E293B" : `${theme.accent}10`,
                borderColor: theme.cardBorder,
                color: theme.accent,
              }}
            >
              <Calendar className="w-3.5 h-3.5 mr-1.5" style={{ color: theme.accent }} />
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-transparent border-none outline-none cursor-pointer font-bold text-xs"
                style={{ color: theme.accent }}
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

            <button
              onClick={onOpenQuickAdd}
              className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-white text-xs font-black tracking-wide uppercase transition-all shadow-sm active:scale-95 flex items-center gap-1.5"
              style={{
                backgroundColor: theme.accent,
              }}
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>+ Transaksi</span>
            </button>
          </div>
        </div>

        {/* Mobile Sub-Navbar */}
        <div
          className="md:hidden flex items-center gap-1.5 py-2 border-t overflow-x-auto text-[11px] font-extrabold uppercase tracking-wider"
          style={{ borderColor: theme.cardBorder }}
        >
          {navTabs.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 px-2.5 py-1 rounded-lg transition-all ${
                  active
                    ? "text-white shadow-xs"
                    : theme.isDark
                    ? "text-slate-400 hover:text-white"
                    : "text-slate-600 hover:text-slate-900"
                }`}
                style={
                  active
                    ? { backgroundColor: theme.accent }
                    : {}
                }
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

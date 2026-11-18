"use client";

import React from "react";
import {
  Wallet,
  LayoutDashboard,
  ArrowUpDown,
  TrendingUp,
  FileText,
  PlusCircle,
  Calendar,
  Sparkles,
  ChevronDown,
  Layers,
  Activity,
  CheckCircle2,
  Clock,
  Shield,
  Search,
  Bell,
  Coins,
} from "lucide-react";

export interface HeaderCommonProps {
  activeTab: "dashboard" | "transactions" | "savings" | "report";
  setActiveTab: (tab: "dashboard" | "transactions" | "savings" | "report") => void;
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  isFirebaseConnected: boolean;
  onOpenQuickAdd: () => void;
}

export const MONTH_OPTIONS = [
  { value: "2026-11", label: "November 2026" },
  { value: "2026-10", label: "Oktober 2026" },
  { value: "2026-09", label: "September 2026" },
  { value: "2026-08", label: "Agustus 2026" },
  { value: "2026-07", label: "Juli 2026" },
  { value: "2026-06", label: "Juni 2026" },
  { value: "2026-12", label: "Desember 2026" },
];

export const HEADER_DESIGNS = [
  { id: 1, name: "Executive Sovereign", desc: "Maroon Deep Luxury with Gold/Blush Accents" },
  { id: 2, name: "Swiss Minimalist", desc: "Pure Clean Canvas with Micro Indicators" },
  { id: 3, name: "Fintech Island Dock", desc: "Modern Detached Floating Island" },
  { id: 4, name: "Enterprise Two-Tier", desc: "Double Row Banking Command Bar" },
  { id: 5, name: "Apple Segmented Glass", desc: "Frosted Glass with Smooth Segmented Slider" },
  { id: 6, name: "Asymmetric Cockpit", desc: "Left-Anchored Navigation & High-Efficiency Flow" },
  { id: 7, name: "Neo-Brutalist Soft", desc: "Crisp Architectural Lines & Bold Typography" },
  { id: 8, name: "Ultra-Compact Strip", desc: "Low-Profile 54px for Maximum Chart Screen Space" },
  { id: 9, name: "Glass Crimson Glow", desc: "Translucent Glass with Ambient Crimson Aura" },
  { id: 10, name: "Live Financial Bar", desc: "Integrated Quick Summary & Indicator Ticker" },
];

// ==============================================================
// 1. EXECUTIVE SOVEREIGN (Deep Crimson Maroon Luxury)
// ==============================================================
export const Header1Executive: React.FC<HeaderCommonProps> = (props) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-gradient-to-r from-[#8a0f10] via-[#991213] to-[#730d0e] text-white shadow-xl shadow-[#991213]/25 border-b border-[#991213]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FFD9D9] text-[#991213] flex items-center justify-center font-black shadow-md">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-xl tracking-tight text-white font-sans">
                  FinPlan
                </span>
                <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-white/20 text-[#FFD9D9] border border-[#FFD9D9]/30">
                  Private Banking
                </span>
              </div>
              <p className="text-[11px] text-[#FFD9D9]/80 hidden sm:block font-medium">
                Sistem Rekonsiliasi & Portofolio Pasar Uang
              </p>
            </div>
          </div>

          {/* Underline Tab Navigation */}
          <nav className="hidden md:flex items-center gap-6 h-full">
            {[
              { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
              { id: "transactions", label: "Kelola Transaksi", icon: ArrowUpDown },
              { id: "savings", label: "Tabungan & Pasar Uang", icon: TrendingUp },
              { id: "report", label: "Rekonsiliasi", icon: FileText },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = props.activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => props.setActiveTab(tab.id as any)}
                  className={`relative flex items-center gap-2 text-sm font-bold h-full transition-colors ${
                    active ? "text-[#FFD9D9]" : "text-white/70 hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {active && (
                    <span className="absolute bottom-0 left-0 right-0 h-1 bg-[#FFD9D9] rounded-t-full shadow-lg shadow-[#FFD9D9]" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Cluster */}
          <div className="flex items-center gap-3">
            {/* Period Selector */}
            <div className="relative bg-white/10 hover:bg-white/15 border border-[#FFD9D9]/30 px-3 py-1.5 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 backdrop-blur-xs">
              <Calendar className="w-3.5 h-3.5 text-[#FFD9D9]" />
              <select
                value={props.selectedMonth}
                onChange={(e) => props.setSelectedMonth(e.target.value)}
                className="bg-transparent text-white border-none outline-none cursor-pointer font-bold pr-2"
              >
                {MONTH_OPTIONS.map((m) => (
                  <option key={m.value} value={m.value} className="text-slate-900 font-semibold">
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Add CTA */}
            <button
              onClick={props.onOpenQuickAdd}
              className="px-4 py-2 rounded-xl bg-[#FFD9D9] hover:bg-white text-[#991213] font-black text-xs sm:text-sm shadow-md active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Coins className="w-4 h-4 text-[#991213]" />
              <span className="hidden sm:inline">Catat Baru</span>
              <span className="sm:hidden">+</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

// ==============================================================
// 2. SWISS MINIMALIST (Pure Whitespace & Micro Accent Dots)
// ==============================================================
export const Header2SwissMinimal: React.FC<HeaderCommonProps> = (props) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-[#FFD9D9] shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Monospace Logo */}
          <div className="flex items-center gap-3">
            <span className="text-xl font-black text-[#991213] tracking-tighter uppercase font-mono">
              FIN.PLAN
            </span>
            <div className="h-4 w-px bg-[#FFD9D9]" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest hidden sm:inline">
              PRO EDITION
            </span>
          </div>

          {/* Minimal Text Tabs with Indicator Dot */}
          <nav className="hidden md:flex items-center gap-7">
            {[
              { id: "dashboard", label: "Ringkasan" },
              { id: "transactions", label: "Transaksi" },
              { id: "savings", label: "Tabungan & Pasar Uang" },
              { id: "report", label: "Audit Rekonsiliasi" },
            ].map((tab) => {
              const active = props.activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => props.setActiveTab(tab.id as any)}
                  className={`flex items-center gap-1.5 text-xs uppercase tracking-wider font-extrabold transition-all ${
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

          {/* Actions */}
          <div className="flex items-center gap-3">
            <select
              value={props.selectedMonth}
              onChange={(e) => props.setSelectedMonth(e.target.value)}
              className="text-xs font-extrabold text-[#991213] bg-[#FFF0F0] border border-[#FFD9D9] px-3 py-1.5 rounded-lg outline-none cursor-pointer"
            >
              {MONTH_OPTIONS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>

            <button
              onClick={props.onOpenQuickAdd}
              className="px-4 py-2 rounded-lg bg-[#991213] hover:bg-[#7a0e0f] text-white text-xs font-extrabold tracking-wide uppercase transition-all shadow-xs"
            >
              + Transaksi
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

// ==============================================================
// 3. FINTECH FLOATING ISLAND (Detached Floating Dock Style)
// ==============================================================
export const Header3FloatingIsland: React.FC<HeaderCommonProps> = (props) => {
  return (
    <div className="sticky top-3 z-40 max-w-6xl mx-auto px-4 w-full">
      <header className="rounded-2xl sm:rounded-full bg-white/90 backdrop-blur-xl border border-[#FFD9D9] shadow-lg shadow-[#991213]/10 px-4 sm:px-6 py-2.5">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#991213] text-[#FFD9D9] flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-black text-lg text-[#991213] tracking-tight">
              FinPlan
            </span>
          </div>

          {/* Floating Pill Nav */}
          <nav className="hidden lg:flex items-center gap-1 bg-[#FFF0F0] p-1 rounded-full border border-[#FFD9D9]">
            {[
              { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
              { id: "transactions", label: "Transaksi", icon: ArrowUpDown },
              { id: "savings", label: "Pasar Uang", icon: TrendingUp },
              { id: "report", label: "Rekonsiliasi", icon: FileText },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = props.activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => props.setActiveTab(tab.id as any)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-full transition-all ${
                    active
                      ? "bg-[#991213] text-white shadow-xs"
                      : "text-slate-600 hover:text-[#991213]"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* Right controls */}
          <div className="flex items-center gap-2">
            <select
              value={props.selectedMonth}
              onChange={(e) => props.setSelectedMonth(e.target.value)}
              className="text-xs font-bold text-[#991213] bg-transparent outline-none cursor-pointer border border-[#FFD9D9] rounded-full px-3 py-1.5"
            >
              {MONTH_OPTIONS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>

            <button
              onClick={props.onOpenQuickAdd}
              className="px-4 py-1.5 rounded-full bg-[#991213] text-[#FFD9D9] hover:bg-[#7a0e0f] text-xs font-black shadow-md transition-all active:scale-95"
            >
              + Catat
            </button>
          </div>
        </div>
      </header>
    </div>
  );
};

// ==============================================================
// 4. ENTERPRISE TWO-TIER (Banking Command Center)
// ==============================================================
export const Header4EnterpriseTwoTier: React.FC<HeaderCommonProps> = (props) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-[#FFD9D9] shadow-xs">
      {/* Top Utility Micro-Bar */}
      <div className="bg-[#FFF0F0] border-b border-[#FFD9D9] py-1.5 text-xs font-medium">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-4 text-slate-600 text-[11px]">
            <span className="flex items-center gap-1.5 font-bold text-[#991213]">
              <Shield className="w-3.5 h-3.5" />
              Sistem Keamanan SSL & Firestore Realtime
            </span>
            <span className="hidden sm:inline text-slate-400">•</span>
            <span className="hidden sm:inline text-slate-500">
              Evaluasi Akuntansi Standar 50/30/20
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black ${
                props.isFirebaseConnected
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-[#FFD9D9] text-[#991213]"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
              {props.isFirebaseConnected ? "Cloud Sync Active" : "Local Storage"}
            </span>
          </div>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#991213] text-white flex items-center justify-center font-bold">
              <Layers className="w-5 h-5 text-[#FFD9D9]" />
            </div>
            <div>
              <h2 className="font-black text-lg text-slate-900 leading-tight">
                FinPlan <span className="text-[#991213]">Enterprise</span>
              </h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Financial Management Suite
              </p>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {[
              { id: "dashboard", label: "Dashboard Ringkasan" },
              { id: "transactions", label: "Daftar Transaksi" },
              { id: "savings", label: "Portofolio Tabungan" },
              { id: "report", label: "Lembar Audit" },
            ].map((tab) => {
              const active = props.activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => props.setActiveTab(tab.id as any)}
                  className={`px-3 py-2 text-xs font-extrabold rounded-lg transition-colors ${
                    active
                      ? "bg-[#FFF0F0] text-[#991213]"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700">
              <Calendar className="w-3.5 h-3.5 text-[#991213]" />
              <select
                value={props.selectedMonth}
                onChange={(e) => props.setSelectedMonth(e.target.value)}
                className="bg-transparent outline-none cursor-pointer font-bold text-slate-800"
              >
                {MONTH_OPTIONS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={props.onOpenQuickAdd}
              className="px-4 py-2 rounded-xl bg-[#991213] text-white hover:bg-[#7a0e0f] text-xs font-black shadow-md flex items-center gap-1.5 transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5 text-[#FFD9D9]" />
              Input Data
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

// ==============================================================
// 5. APPLE SEGMENTED GLASS (macOS Human Interface Style)
// ==============================================================
export const Header5AppleSegmented: React.FC<HeaderCommonProps> = (props) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-2xl border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Minimal Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#991213] text-white flex items-center justify-center font-bold text-xs">
              FP
            </div>
            <span className="font-extrabold text-base text-slate-900 tracking-tight">
              FinPlan
            </span>
          </div>

          {/* Center: Segmented Control Bar (Apple Style) */}
          <div className="hidden sm:inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200/80 shadow-inner">
            {[
              { id: "dashboard", label: "Overview", icon: LayoutDashboard },
              { id: "transactions", label: "Transactions", icon: ArrowUpDown },
              { id: "savings", label: "Invest & Savings", icon: TrendingUp },
              { id: "report", label: "Statement", icon: FileText },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = props.activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => props.setActiveTab(tab.id as any)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    active
                      ? "bg-white text-[#991213] shadow-sm font-extrabold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Right: Dropdown & Add */}
          <div className="flex items-center gap-2 sm:gap-3">
            <select
              value={props.selectedMonth}
              onChange={(e) => props.setSelectedMonth(e.target.value)}
              className="text-xs font-bold text-slate-700 bg-slate-100 rounded-lg px-2.5 py-1.5 outline-none cursor-pointer border border-transparent hover:border-slate-300"
            >
              {MONTH_OPTIONS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>

            <button
              onClick={props.onOpenQuickAdd}
              className="px-3.5 py-1.5 rounded-lg bg-[#991213] hover:bg-[#800f10] text-white text-xs font-bold transition-all shadow-xs"
            >
              + Record
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

// ==============================================================
// 6. ASYMMETRIC FINANCIAL COCKPIT (Left-Anchored Flow)
// ==============================================================
export const Header6AsymmetricCockpit: React.FC<HeaderCommonProps> = (props) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-[#FFD9D9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-17">
          {/* Left-Anchored Logo + Navigation Combined */}
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm bg-[#991213]" />
              <span className="font-black text-xl text-slate-900 tracking-tight">
                Fin<span className="text-[#991213]">Plan</span>
              </span>
            </div>

            <nav className="hidden lg:flex items-center gap-2">
              {[
                { id: "dashboard", label: "Dashboard" },
                { id: "transactions", label: "Kelola Transaksi" },
                { id: "savings", label: "Tabungan & Pasar Uang" },
                { id: "report", label: "Rekonsiliasi" },
              ].map((tab) => {
                const active = props.activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => props.setActiveTab(tab.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                      active
                        ? "bg-[#991213] text-white"
                        : "text-slate-600 hover:text-[#991213] hover:bg-[#FFF0F0]"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-slate-500 bg-[#FFF0F0] px-3 py-1.5 rounded-xl border border-[#FFD9D9]">
              <Clock className="w-3.5 h-3.5 text-[#991213]" />
              <select
                value={props.selectedMonth}
                onChange={(e) => props.setSelectedMonth(e.target.value)}
                className="bg-transparent text-[#991213] font-black outline-none cursor-pointer"
              >
                {MONTH_OPTIONS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={props.onOpenQuickAdd}
              className="px-4 py-2 rounded-xl bg-[#991213] hover:bg-[#7f0e0f] text-[#FFD9D9] font-black text-xs shadow-md transition-all active:scale-95"
            >
              + Catat Baru
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

// ==============================================================
// 7. NEO-BRUTALIST SOFT (Sharp Architectural Contrast)
// ==============================================================
export const Header7NeoBrutalist: React.FC<HeaderCommonProps> = (props) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#FFF9F9] border-b-2 border-[#991213]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Bold Brand Box */}
          <div className="flex items-center gap-3">
            <div className="px-3 py-1 bg-[#991213] text-white font-black text-base border border-[#991213] shadow-[2px_2px_0px_#FFD9D9]">
              FINPLAN
            </div>
            <span className="text-xs font-black text-slate-800 tracking-wider uppercase hidden sm:inline">
              KEUANGAN 2026
            </span>
          </div>

          {/* Nav with Tactile Borders */}
          <nav className="hidden md:flex items-center gap-2">
            {[
              { id: "dashboard", label: "DASHBOARD" },
              { id: "transactions", label: "TRANSAKSI" },
              { id: "savings", label: "PASAR UANG" },
              { id: "report", label: "REKONSILIASI" },
            ].map((tab) => {
              const active = props.activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => props.setActiveTab(tab.id as any)}
                  className={`px-3 py-1 text-xs font-black tracking-wider transition-all border ${
                    active
                      ? "bg-[#991213] text-white border-[#991213] shadow-[2px_2px_0px_#1c0606]"
                      : "bg-white text-slate-800 border-slate-300 hover:border-[#991213]"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <select
              value={props.selectedMonth}
              onChange={(e) => props.setSelectedMonth(e.target.value)}
              className="text-xs font-black border border-[#991213] bg-white px-2 py-1 outline-none cursor-pointer"
            >
              {MONTH_OPTIONS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>

            <button
              onClick={props.onOpenQuickAdd}
              className="px-3 py-1 bg-[#FFD9D9] hover:bg-[#991213] text-[#991213] hover:text-white font-black text-xs border border-[#991213] shadow-[2px_2px_0px_#991213] transition-all"
            >
              + CATAT
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

// ==============================================================
// 8. ULTRA-COMPACT STRIP (Low Profile 52px for Max Workspace)
// ==============================================================
export const Header8UltraCompact: React.FC<HeaderCommonProps> = (props) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-[#FFD9D9] shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-13">
          {/* Inline Compact Logo */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#991213] flex items-center justify-center text-white font-black text-xs">
              F
            </div>
            <span className="font-black text-sm text-[#991213]">FinPlan</span>
          </div>

          {/* Streamlined Tabs */}
          <nav className="flex items-center gap-1 sm:gap-2">
            {[
              { id: "dashboard", label: "Dashboard" },
              { id: "transactions", label: "Transaksi" },
              { id: "savings", label: "Pasar Uang" },
              { id: "report", label: "Rekonsiliasi" },
            ].map((tab) => {
              const active = props.activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => props.setActiveTab(tab.id as any)}
                  className={`px-2.5 py-1 text-xs font-bold rounded-md transition-colors ${
                    active
                      ? "text-[#991213] bg-[#FFF0F0] font-black"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* Compact Right */}
          <div className="flex items-center gap-2">
            <select
              value={props.selectedMonth}
              onChange={(e) => props.setSelectedMonth(e.target.value)}
              className="text-[11px] font-bold text-slate-600 bg-transparent outline-none cursor-pointer border-none"
            >
              {MONTH_OPTIONS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>

            <button
              onClick={props.onOpenQuickAdd}
              className="px-2.5 py-1 rounded-md bg-[#991213] text-white text-xs font-bold"
            >
              +
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

// ==============================================================
// 9. GLASS CRIMSON GLOW (Translucent Aura with Rim Light)
// ==============================================================
export const Header9GlassCrimsonGlow: React.FC<HeaderCommonProps> = (props) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#FFF9F9]/85 backdrop-blur-xl border-b border-[#991213]/15 shadow-sm shadow-[#991213]/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-17">
          {/* Logo with Soft Crimson Aura */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-[#991213] rounded-xl blur-sm opacity-40 animate-pulse" />
              <div className="relative w-9 h-9 rounded-xl bg-[#991213] text-[#FFD9D9] flex items-center justify-center font-black">
                <Wallet className="w-5 h-5" />
              </div>
            </div>
            <div>
              <span className="font-black text-lg text-slate-900 tracking-tight">
                FinPlan
              </span>
              <span className="ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FFD9D9] text-[#991213]">
                Liquid Wealth
              </span>
            </div>
          </div>

          {/* Glowing Tab Active Indicator */}
          <nav className="hidden md:flex items-center gap-1.5 p-1 rounded-2xl bg-white/60 border border-[#FFD9D9]/80 backdrop-blur-md">
            {[
              { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
              { id: "transactions", label: "Kelola Transaksi", icon: ArrowUpDown },
              { id: "savings", label: "Tabungan & Pasar Uang", icon: TrendingUp },
              { id: "report", label: "Rekonsiliasi", icon: FileText },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = props.activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => props.setActiveTab(tab.id as any)}
                  className={`relative flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl transition-all ${
                    active
                      ? "bg-gradient-to-r from-[#991213] to-[#b31517] text-white shadow-md shadow-[#991213]/30 font-black"
                      : "text-slate-600 hover:text-[#991213] hover:bg-white"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <div className="bg-white/70 border border-[#FFD9D9] px-3 py-1.5 rounded-xl text-xs font-bold text-[#991213]">
              <select
                value={props.selectedMonth}
                onChange={(e) => props.setSelectedMonth(e.target.value)}
                className="bg-transparent outline-none cursor-pointer font-extrabold text-[#991213]"
              >
                {MONTH_OPTIONS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={props.onOpenQuickAdd}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#991213] to-[#b51819] text-[#FFD9D9] hover:text-white font-black text-xs shadow-lg shadow-[#991213]/25 active:scale-95 transition-all"
            >
              + Transaksi
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

// ==============================================================
// 10. LIVE FINANCIAL BAR (Header with Status Ticker / Insight)
// ==============================================================
export const Header10FinancialStatus: React.FC<HeaderCommonProps> = (props) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-[#FFD9D9] shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-17">
          {/* Logo & Mini Status Badge */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#991213] text-white flex items-center justify-center font-black">
              <Activity className="w-5 h-5 text-[#FFD9D9]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg text-slate-900 tracking-tight">
                  FinPlan
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  Live Sync
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-semibold hidden sm:block">
                Pencatatan Gaji, Rekonsiliasi & Yield Pasar Uang
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden lg:flex items-center gap-1 bg-[#FFF0F0] p-1 rounded-2xl border border-[#FFD9D9]">
            {[
              { id: "dashboard", label: "Dashboard" },
              { id: "transactions", label: "Kelola Transaksi" },
              { id: "savings", label: "Tabungan & Pasar Uang" },
              { id: "report", label: "Rekonsiliasi" },
            ].map((tab) => {
              const active = props.activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => props.setActiveTab(tab.id as any)}
                  className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all ${
                    active
                      ? "bg-[#991213] text-white shadow-xs font-black"
                      : "text-slate-600 hover:text-[#991213]"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* Right: Period & Quick CTA */}
          <div className="flex items-center gap-2.5">
            <div className="bg-[#FFF0F0] border border-[#FFD9D9] px-3 py-1.5 rounded-xl text-xs font-black text-[#991213]">
              <select
                value={props.selectedMonth}
                onChange={(e) => props.setSelectedMonth(e.target.value)}
                className="bg-transparent outline-none cursor-pointer"
              >
                {MONTH_OPTIONS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={props.onOpenQuickAdd}
              className="px-4 py-2 rounded-xl bg-[#991213] hover:bg-[#800e10] text-[#FFD9D9] font-black text-xs sm:text-sm shadow-md transition-all active:scale-95 flex items-center gap-1.5"
            >
              <Coins className="w-4 h-4 text-[#FFD9D9]" />
              <span>+ Catat Baru</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

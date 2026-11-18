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
} from "lucide-react";

interface NavbarProps {
  activeTab: "dashboard" | "transactions" | "savings" | "report";
  setActiveTab: (tab: "dashboard" | "transactions" | "savings" | "report") => void;
  selectedMonth: string; // YYYY-MM
  setSelectedMonth: (month: string) => void;
  isFirebaseConnected: boolean;
  onOpenQuickAdd: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  selectedMonth,
  setSelectedMonth,
  isFirebaseConnected,
  onOpenQuickAdd,
}) => {
  const monthOptions = [
    { value: "2026-11", label: "November 2026" },
    { value: "2026-10", label: "Oktober 2026" },
    { value: "2026-09", label: "September 2026" },
    { value: "2026-08", label: "Agustus 2026" },
    { value: "2026-07", label: "Juli 2026" },
    { value: "2026-06", label: "Juni 2026" },
    { value: "2026-12", label: "Desember 2026" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#FFD9D9] bg-white/95 backdrop-blur-md transition-all shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#991213] via-[#b51819] to-[#d42223] flex items-center justify-center shadow-lg shadow-[#991213]/25 text-white font-bold text-xl">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg sm:text-xl tracking-tight text-[#991213]">
                  FinPlan
                </span>
                <span className="text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-full bg-[#FFD9D9] text-[#991213] border border-[#991213]/20">
                  Keuangan
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Manajemen Gaji, Tabungan & Pasar Uang
              </p>
            </div>
          </div>

          {/* Nav Tabs for Desktop */}
          <nav className="hidden md:flex items-center gap-1 bg-[#FFF0F0] p-1.5 rounded-2xl border border-[#FFD9D9]">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`flex items-center gap-2 px-3.5 py-2 text-sm font-bold rounded-xl transition-all ${
                activeTab === "dashboard"
                  ? "bg-[#991213] text-white shadow-sm"
                  : "text-slate-700 hover:text-[#991213] hover:bg-[#FFD9D9]/50"
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab("transactions")}
              className={`flex items-center gap-2 px-3.5 py-2 text-sm font-bold rounded-xl transition-all ${
                activeTab === "transactions"
                  ? "bg-[#991213] text-white shadow-sm"
                  : "text-slate-700 hover:text-[#991213] hover:bg-[#FFD9D9]/50"
              }`}
            >
              <ArrowUpDown className="w-4 h-4" />
              Kelola Transaksi
            </button>
            <button
              onClick={() => setActiveTab("savings")}
              className={`flex items-center gap-2 px-3.5 py-2 text-sm font-bold rounded-xl transition-all ${
                activeTab === "savings"
                  ? "bg-[#991213] text-white shadow-sm"
                  : "text-slate-700 hover:text-[#991213] hover:bg-[#FFD9D9]/50"
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              Tabungan & Pasar Uang
            </button>
            <button
              onClick={() => setActiveTab("report")}
              className={`flex items-center gap-2 px-3.5 py-2 text-sm font-bold rounded-xl transition-all ${
                activeTab === "report"
                  ? "bg-[#991213] text-white shadow-sm"
                  : "text-slate-700 hover:text-[#991213] hover:bg-[#FFD9D9]/50"
              }`}
            >
              <FileText className="w-4 h-4" />
              Rekonsiliasi
            </button>
          </nav>

          {/* Right Area: Period Picker, Cloud Sync Status & Quick Add */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Period Selector */}
            <div className="flex items-center gap-1.5 bg-[#FFF0F0] border border-[#FFD9D9] px-3 py-1.5 rounded-xl text-xs font-bold text-[#991213]">
              <Calendar className="w-3.5 h-3.5 text-[#991213]" />
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-transparent border-none outline-none cursor-pointer font-extrabold text-[#991213]"
              >
                {monthOptions.map((opt) => (
                  <option key={opt.value} value={opt.value} className="text-slate-900">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Cloud Status indicator */}
            <div
              title={
                isFirebaseConnected
                  ? "Terhubung ke Firebase Firestore (Cloud Synced)"
                  : "Tersimpan di Penyimpanan Lokal Otomatis"
              }
              className={`hidden lg:flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-full border ${
                isFirebaseConnected
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : "bg-[#FFD9D9] text-[#991213] border-[#991213]/30"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full animate-pulse ${
                  isFirebaseConnected ? "bg-emerald-500" : "bg-[#991213]"
                }`}
              />
              <span>{isFirebaseConnected ? "Firebase Cloud" : "Local Sync"}</span>
            </div>

            {/* Quick Add Button with #991213 */}
            <button
              onClick={onOpenQuickAdd}
              className="flex items-center gap-1.5 bg-[#991213] hover:bg-[#7f0e0f] text-white font-extrabold text-xs sm:text-sm px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl shadow-md shadow-[#991213]/25 active:scale-95 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Catat Baru</span>
              <span className="sm:hidden">Tambah</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden flex border-t border-[#FFD9D9] bg-white/95 px-2 py-1.5 justify-around items-center">
        <button
          onClick={() => setActiveTab("dashboard")}
          className={`flex flex-col items-center gap-1 py-1 px-2 text-[10px] font-medium rounded-lg ${
            activeTab === "dashboard"
              ? "text-[#991213] font-extrabold"
              : "text-slate-500"
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab("transactions")}
          className={`flex flex-col items-center gap-1 py-1 px-2 text-[10px] font-medium rounded-lg ${
            activeTab === "transactions"
              ? "text-[#991213] font-extrabold"
              : "text-slate-500"
          }`}
        >
          <ArrowUpDown className="w-5 h-5" />
          Transaksi
        </button>
        <button
          onClick={() => setActiveTab("savings")}
          className={`flex flex-col items-center gap-1 py-1 px-2 text-[10px] font-medium rounded-lg ${
            activeTab === "savings"
              ? "text-[#991213] font-extrabold"
              : "text-slate-500"
          }`}
        >
          <TrendingUp className="w-5 h-5" />
          Pasar Uang
        </button>
        <button
          onClick={() => setActiveTab("report")}
          className={`flex flex-col items-center gap-1 py-1 px-2 text-[10px] font-medium rounded-lg ${
            activeTab === "report"
              ? "text-[#991213] font-extrabold"
              : "text-slate-500"
          }`}
        >
          <FileText className="w-5 h-5" />
          Rekonsiliasi
        </button>
      </div>
    </header>
  );
};

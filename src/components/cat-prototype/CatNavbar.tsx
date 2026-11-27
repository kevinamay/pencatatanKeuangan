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
  FileSpreadsheet,
  KeyRound,
} from "lucide-react";
import { CatAnimation } from "./CatAnimations";
import { getCatThemeConfig } from "./catThemeConfig";

interface CatNavbarProps {
  activeTab: "dashboard" | "transactions" | "savings" | "report" | "planned";
  setActiveTab: (tab: "dashboard" | "transactions" | "savings" | "report" | "planned") => void;
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  isFirebaseConnected: boolean;
  onOpenQuickAdd: () => void;
  variantId: number;
  onOpenBackupExport?: () => void;
  onOpenChangePin?: () => void;
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
  onOpenBackupExport,
  onOpenChangePin,
}) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const theme = getCatThemeConfig(variantId);

  // Tab-specific animation for navbar mini badge
  const tabAnimation = (activeTab !== "planned" && theme.pageAnimations[activeTab]) || theme.pageAnimations.dashboard;

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
      <header
        className={`sticky top-0 z-40 w-full max-w-full overflow-x-clip border-b transition-colors duration-300 print:hidden ${
          theme.isDark
            ? "bg-[#0A0E17]/95 backdrop-blur-md border-white/10 text-white"
            : "bg-white/95 backdrop-blur-md border-slate-200 text-slate-900"
        }`}
        style={{
          borderBottomColor: theme.cardBorder,
        }}
      >
        <div className="max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
            {/* Logo with Dynamic Page-Specific Cat Mascot & Mobile Hamburger */}
            <div className="flex items-center gap-1.5 sm:gap-3 shrink min-w-0">
              {/* Mobile Hamburger Menu Button */}
              <button
                type="button"
                onClick={() => setIsMobileSidebarOpen(true)}
                className="p-1.5 rounded-xl transition-all md:hidden flex items-center justify-center active:scale-95 cursor-pointer shrink-0"
                style={{
                  color: theme.accent,
                  backgroundColor: `${theme.accent}15`,
                }}
                aria-label="Buka Menu Navigasi"
                title="Buka Menu Navigasi"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center overflow-hidden shadow-xs border transition-transform hover:scale-105 shrink-0"
                style={{
                  backgroundColor: theme.isDark ? "#1E293B" : theme.bgPage,
                  borderColor: theme.cardBorder,
                }}
                title={`Mode Kucing: #${variantId} ${theme.name}`}
              >
                <CatAnimation variant={tabAnimation} className="w-7 h-7 sm:w-8 sm:h-8" />
              </div>

              <div className="flex flex-col min-w-0 shrink">
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

              {/* Backup & Export Button (Desktop) */}
              {onOpenBackupExport && (
                <button
                  type="button"
                  onClick={onOpenBackupExport}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all active:scale-95 cursor-pointer"
                  style={{
                    backgroundColor: theme.isDark ? "#1E293B" : "#FAF7F2",
                    borderColor: theme.cardBorder,
                    color: theme.isDark ? "#E2E8F0" : "#44403C",
                  }}
                  title="Ekspor Laporan Excel & Backup Database"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Ekspor</span>
                </button>
              )}

              {/* Security PIN & Email Button (Desktop) */}
              {onOpenChangePin && (
                <button
                  type="button"
                  onClick={onOpenChangePin}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all active:scale-95 cursor-pointer"
                  style={{
                    backgroundColor: theme.isDark ? "#1E293B" : "#FAF7F2",
                    borderColor: theme.cardBorder,
                    color: theme.isDark ? "#E2E8F0" : "#44403C",
                  }}
                  title="Keamanan PIN & Email Pemulihan"
                >
                  <KeyRound className="w-3.5 h-3.5 text-amber-700" />
                  <span>Keamanan</span>
                </button>
              )}

              {/* Quick Add Button */}
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
        </div>
      </header>

      {/* ============================================================== */}
      {/* MOBILE SIDEBAR DRAWER (Slide-over Navigation for Handphone/Mobile) */}
      {/* ============================================================== */}
      {/* Backdrop */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs transition-opacity duration-300 md:hidden animate-fade-in"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Drawer Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 max-w-[85vw] flex flex-col shadow-2xl transition-all duration-300 ease-in-out md:hidden ${
          isMobileSidebarOpen
            ? "translate-x-0 opacity-100 visible pointer-events-auto"
            : "-translate-x-full opacity-0 invisible pointer-events-none"
        }`}
        style={{
          backgroundColor: theme.isDark ? "#0F172A" : "#FAF7F2",
          borderRight: `1px solid ${theme.cardBorder}`,
        }}
      >
        {/* Drawer Header */}
        <div
          className="p-5 border-b flex items-center justify-between"
          style={{ borderColor: theme.cardBorder }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center overflow-hidden border shadow-xs"
              style={{
                backgroundColor: theme.isDark ? "#1E293B" : "#FFFFFF",
                borderColor: theme.cardBorder,
              }}
            >
              <CatAnimation variant={theme.pageAnimations.dashboard} className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-black text-sm" style={{ color: theme.accent }}>
                {theme.navTitle}
              </h3>
              <p className="text-[10px] text-stone-400 font-medium">
                Pencatatan Keuangan
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsMobileSidebarOpen(false)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 transition-colors"
            aria-label="Tutup Menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sync Status Badge */}
        <div className="px-5 pt-3 pb-1">
          <div
            className="px-3 py-1.5 rounded-xl text-[10px] font-bold flex items-center gap-2 border"
            style={{
              backgroundColor: isFirebaseConnected ? "#ECFDF5" : "#FFFBEB",
              borderColor: isFirebaseConnected ? "#A7F3D0" : "#FDE68A",
              color: isFirebaseConnected ? "#065F46" : "#92400E",
            }}
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
          <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1">
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
                    ? "font-black shadow-xs border"
                    : theme.isDark
                    ? "text-slate-300 hover:bg-white/5 font-bold"
                    : "text-stone-700 hover:bg-stone-200/50 font-bold"
                }`}
                style={
                  active
                    ? {
                        backgroundColor: `${theme.accent}18`,
                        borderColor: `${theme.accent}40`,
                        color: theme.accent,
                      }
                    : {}
                }
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                      active ? "text-white" : "text-stone-500 bg-stone-100"
                    }`}
                    style={active ? { backgroundColor: theme.accent } : {}}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs block leading-tight">{tab.label}</span>
                    <span className="text-[10px] text-stone-400 font-normal block">
                      {tab.desc}
                    </span>
                  </div>
                </div>

                <ChevronRight
                  className={`w-4 h-4 transition-transform ${
                    active ? "translate-x-0.5 opacity-100" : "opacity-30"
                  }`}
                  style={active ? { color: theme.accent } : {}}
                />
              </button>
            );
          })}
        </div>

        {/* Drawer Footer Actions */}
        <div
          className="p-4 border-t space-y-2"
          style={{ borderColor: theme.cardBorder }}
        >
          {/* Backup & Export inside sidebar */}
          {onOpenBackupExport && (
            <button
              onClick={() => {
                setIsMobileSidebarOpen(false);
                onOpenBackupExport();
              }}
              className="w-full py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border active:scale-95 transition-all cursor-pointer bg-white text-stone-800 border-[#E8E2D8] hover:bg-stone-50"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Ekspor Excel & Backup Data</span>
            </button>
          )}

          {/* Change PIN inside sidebar */}
          {onOpenChangePin && (
            <button
              onClick={() => {
                setIsMobileSidebarOpen(false);
                onOpenChangePin();
              }}
              className="w-full py-2 px-3 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 border active:scale-95 transition-all cursor-pointer bg-[#FAF7F2] text-stone-600 border-[#E8E2D8] hover:bg-stone-100"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-700" />
              <span>Keamanan PIN & Email</span>
            </button>
          )}

          {/* Quick Add inside sidebar */}
          <button
            onClick={() => {
              setIsMobileSidebarOpen(false);
              onOpenQuickAdd();
            }}
            className="w-full py-2.5 px-3 rounded-xl text-white text-xs font-black flex items-center justify-center gap-2 shadow-xs active:scale-95 transition-all cursor-pointer"
            style={{ backgroundColor: theme.accent }}
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Catat Transaksi Baru</span>
          </button>

          {/* Install App button if mobile */}
          <button
            onClick={() => {
              if (typeof window !== "undefined" && (window as any).triggerPwaInstall) {
                (window as any).triggerPwaInstall();
              }
            }}
            className="w-full py-2 px-3 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 border active:scale-95 transition-all cursor-pointer"
            style={{
              backgroundColor: theme.isDark ? "#1E293B" : "#FEF3C7",
              borderColor: theme.isDark ? "#334155" : "#FDE68A",
              color: theme.isDark ? "#FDE68A" : "#92400E",
            }}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Pasang Aplikasi (PWA / WebAPK)</span>
          </button>
        </div>
      </aside>
    </>
  );
};

"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Navbar } from "@/components/Navbar";
import { DashboardView } from "@/components/DashboardView";
import { FinanceStorage } from "@/lib/storage";
import {
  IncomeItem,
  ExpenseItem,
  SavingsAllocation,
  MoneyMarketProduct,
} from "@/types/finance";
import {
  CatPrototypeSwitcher,
  CAT_VARIANTS,
} from "@/components/cat-prototype/CatPrototypeSwitcher";
import {
  Variant1NekoBank,
  Variant2TokyoPaper,
  Variant3NordicPastel,
  Variant4NeoBrutalist,
  Variant5MidnightOnyx,
} from "@/components/cat-prototype/CatThemes";
import { CatNavbar } from "@/components/cat-prototype/CatNavbar";
import { CatTransactionsView } from "@/components/cat-prototype/CatTransactionsView";
import { CatSavingsView } from "@/components/cat-prototype/CatSavingsView";
import { CatReportView } from "@/components/cat-prototype/CatReportView";
import { getCatThemeConfig } from "@/components/cat-prototype/catThemeConfig";

// Tab Loading Skeleton (Swiss Minimalist Theme)
const ViewLoadingSkeleton = ({ title }: { title: string }) => (
  <div className="w-full py-16 flex flex-col items-center justify-center gap-3">
    <div className="w-8 h-8 rounded-full border-2 border-[#FFD9D9] border-t-[#8B0000] animate-spin" />
    <span className="text-xs font-semibold text-[#8B0000] tracking-wide uppercase">
      {title}
    </span>
  </div>
);

// High-Performance Dynamic Imports (Code-Splitting for Instant Page Load)
const TransactionsView = dynamic(
  () =>
    import("@/components/TransactionsView").then((mod) => mod.TransactionsView),
  {
    loading: () => <ViewLoadingSkeleton title="Memuat Data Transaksi..." />,
    ssr: false,
  }
);

const SavingsMoneyMarketView = dynamic(
  () =>
    import("@/components/SavingsMoneyMarketView").then(
      (mod) => mod.SavingsMoneyMarketView
    ),
  {
    loading: () => <ViewLoadingSkeleton title="Memuat Tabungan & Pasar Uang..." />,
    ssr: false,
  }
);

const ReconciliationReportView = dynamic(
  () =>
    import("@/components/ReconciliationReportView").then(
      (mod) => mod.ReconciliationReportView
    ),
  {
    loading: () => <ViewLoadingSkeleton title="Memuat Laporan Rekonsiliasi..." />,
    ssr: false,
  }
);

const QuickAddModal = dynamic(
  () => import("@/components/QuickAddModal").then((mod) => mod.QuickAddModal),
  {
    ssr: false,
  }
);

export default function Home() {
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "transactions" | "savings" | "report"
  >("dashboard");
  const [selectedMonth, setSelectedMonth] = useState<string>("2026-11");
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickAddType, setQuickAddType] = useState<"income" | "expense" | "savings">("income");

  // Tokyo Minimalist Paper Edition (Desain #2 Permanen)
  const [isCatMode, setIsCatMode] = useState<boolean>(true);
  const [catVariant, setCatVariant] = useState<number>(2);

  const openQuickAdd = (type?: "income" | "expense" | "savings") => {
    setQuickAddType(type || (activeTab === "savings" ? "savings" : "income"));
    setIsQuickAddOpen(true);
  };

  // Financial Data States
  const [incomes, setIncomes] = useState<IncomeItem[]>([]);
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [savings, setSavings] = useState<SavingsAllocation[]>([]);
  const [moneyMarket, setMoneyMarket] = useState<MoneyMarketProduct[]>([]);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(false);

  // Subscribe to FinanceStorage updates & Cloud Sync
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

    const unsubscribe = FinanceStorage.subscribe(() => {
      loadData();
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Helper to render the active Cat Prototype Variant (1 to 5)
  const renderCatVariant = () => {
    const commonProps = {
      incomes,
      expenses,
      savings,
      moneyMarket,
      selectedMonth,
      onOpenQuickAdd: openQuickAdd,
      onNavigateToTab: (tab: "transactions" | "savings" | "report") => setActiveTab(tab),
    };

    switch (catVariant) {
      case 1:
        return <Variant1NekoBank {...commonProps} />;
      case 2:
        return <Variant2TokyoPaper {...commonProps} />;
      case 3:
        return <Variant3NordicPastel {...commonProps} />;
      case 4:
        return <Variant4NeoBrutalist {...commonProps} />;
      case 5:
        return <Variant5MidnightOnyx {...commonProps} />;
      default:
        return <Variant1NekoBank {...commonProps} />;
    }
  };

  const currentCatTheme = getCatThemeConfig(catVariant);

  return (
    <div
      className="min-h-screen flex flex-col font-sans print:bg-white print:min-h-0 print:p-0 print:m-0 pb-20 transition-colors duration-300"
      style={{
        backgroundColor: isCatMode ? currentCatTheme.bgPage : "#FFF9F9",
        color: isCatMode ? currentCatTheme.textColor : "#1c0606",
      }}
    >
      {/* Header: Cat Themed Navbar or Original Swiss Minimalist */}
      <div className="print:hidden">
        {isCatMode ? (
          <CatNavbar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            selectedMonth={selectedMonth}
            setSelectedMonth={setSelectedMonth}
            isFirebaseConnected={isFirebaseConnected}
            onOpenQuickAdd={() => openQuickAdd()}
            variantId={catVariant}
          />
        ) : (
          <Navbar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            selectedMonth={selectedMonth}
            setSelectedMonth={setSelectedMonth}
            isFirebaseConnected={isFirebaseConnected}
            onOpenQuickAdd={() => openQuickAdd()}
          />
        )}
      </div>

      {/* Main Single Fixed View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 print:p-0 print:m-0 print:max-w-none print:w-full">
        {activeTab === "dashboard" && (
          isCatMode ? (
            renderCatVariant()
          ) : (
            <DashboardView
              selectedMonth={selectedMonth}
              incomes={incomes}
              expenses={expenses}
              savings={savings}
              moneyMarket={moneyMarket}
              onNavigateToTab={(tab) => setActiveTab(tab)}
              onOpenQuickAdd={() => openQuickAdd("income")}
            />
          )
        )}

        {activeTab === "transactions" && (
          isCatMode ? (
            <CatTransactionsView
              incomes={incomes}
              expenses={expenses}
              savings={savings}
              selectedMonth={selectedMonth}
              onOpenQuickAdd={() => openQuickAdd("expense")}
              variantId={catVariant}
            />
          ) : (
            <TransactionsView
              incomes={incomes}
              expenses={expenses}
              savings={savings}
              selectedMonth={selectedMonth}
              onOpenQuickAdd={() => openQuickAdd("expense")}
            />
          )
        )}

        {activeTab === "savings" && (
          isCatMode ? (
            <CatSavingsView
              savings={savings}
              moneyMarket={moneyMarket}
              selectedMonth={selectedMonth}
              onOpenQuickAdd={() => openQuickAdd("savings")}
              variantId={catVariant}
            />
          ) : (
            <SavingsMoneyMarketView
              savings={savings}
              moneyMarket={moneyMarket}
              selectedMonth={selectedMonth}
              onOpenQuickAdd={() => openQuickAdd("savings")}
            />
          )
        )}

        {activeTab === "report" && (
          isCatMode ? (
            <CatReportView
              incomes={incomes}
              expenses={expenses}
              savings={savings}
              moneyMarket={moneyMarket}
              selectedMonth={selectedMonth}
              variantId={catVariant}
            />
          ) : (
            <ReconciliationReportView
              incomes={incomes}
              expenses={expenses}
              savings={savings}
              moneyMarket={moneyMarket}
              selectedMonth={selectedMonth}
            />
          )
        )}
      </main>

      {/* Quick Add Modal */}
      {isQuickAddOpen && (
        <QuickAddModal
          isOpen={isQuickAddOpen}
          onClose={() => setIsQuickAddOpen(false)}
          selectedMonth={selectedMonth}
          initialType={quickAddType}
          isCatMode={isCatMode}
          catVariant={catVariant}
        />
      )}

      {/* Footer */}
      <footer
        className="mt-auto border-t py-6 text-center text-xs font-medium print:hidden bg-white border-[#E8E2D8] text-stone-500"
      >
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: currentCatTheme.accent }}
            />
            <span
              className="font-bold font-mono text-stone-900"
            >
              {currentCatTheme.navTitle}
            </span>
            <span className="text-stone-400">
              | Tokyo Minimalist Paper Edition
            </span>
          </div>
          <p className="text-stone-400">
            Realtime Firebase Cloud Database • Wabi-Sabi Warm Editorial FinPlan
          </p>
        </div>
      </footer>
    </div>
  );
}

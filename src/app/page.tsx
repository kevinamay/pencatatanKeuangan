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

  return (
    <div className="min-h-screen bg-[#FFF9F9] text-[#1c0606] flex flex-col font-sans">
      {/* Swiss Minimalist Navigation Header (Desain #2 Permanen) */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        isFirebaseConnected={isFirebaseConnected}
        onOpenQuickAdd={() => openQuickAdd()}
      />

      {/* Main Single Fixed View Area (Executive Neo-Bank) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {activeTab === "dashboard" && (
          <DashboardView
            selectedMonth={selectedMonth}
            incomes={incomes}
            expenses={expenses}
            savings={savings}
            moneyMarket={moneyMarket}
            onNavigateToTab={(tab) => setActiveTab(tab)}
            onOpenQuickAdd={() => openQuickAdd("income")}
          />
        )}

        {activeTab === "transactions" && (
          <TransactionsView
            incomes={incomes}
            expenses={expenses}
            savings={savings}
            selectedMonth={selectedMonth}
            onOpenQuickAdd={() => openQuickAdd("expense")}
          />
        )}

        {activeTab === "savings" && (
          <SavingsMoneyMarketView
            savings={savings}
            moneyMarket={moneyMarket}
            selectedMonth={selectedMonth}
            onOpenQuickAdd={() => openQuickAdd("savings")}
          />
        )}

        {activeTab === "report" && (
          <ReconciliationReportView
            incomes={incomes}
            expenses={expenses}
            savings={savings}
            moneyMarket={moneyMarket}
            selectedMonth={selectedMonth}
          />
        )}
      </main>

      {/* Quick Add Modal */}
      {isQuickAddOpen && (
        <QuickAddModal
          isOpen={isQuickAddOpen}
          onClose={() => setIsQuickAddOpen(false)}
          selectedMonth={selectedMonth}
          initialType={quickAddType}
        />
      )}

      {/* Professional Footer */}
      <footer className="mt-auto border-t border-[#FFD9D9] bg-white py-6 text-center text-xs text-slate-500 font-medium">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#8B0000]" />
            <span className="font-bold text-slate-900 font-mono">FIN.PLAN</span>
            <span className="text-slate-400">| Swiss Minimalist Edition</span>
          </div>
          <p className="text-slate-400">
            Realtime Firebase Cloud Database • Light Theme #8B0000 & #FFD9D9
          </p>
        </div>
      </footer>
    </div>
  );
}

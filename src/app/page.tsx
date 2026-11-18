"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { DashboardView } from "@/components/DashboardView";
import { TransactionsView } from "@/components/TransactionsView";
import { SavingsMoneyMarketView } from "@/components/SavingsMoneyMarketView";
import { ReconciliationReportView } from "@/components/ReconciliationReportView";
import { QuickAddModal } from "@/components/QuickAddModal";
import { HeaderSwitcher } from "@/components/headers/HeaderSwitcher";
import { FinanceStorage } from "@/lib/storage";
import {
  IncomeItem,
  ExpenseItem,
  SavingsAllocation,
  MoneyMarketProduct,
} from "@/types/finance";

export default function Home() {
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "transactions" | "savings" | "report"
  >("dashboard");
  const [selectedMonth, setSelectedMonth] = useState<string>("2026-11");
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [headerVariant, setHeaderVariant] = useState<number>(1);

  // Financial Data States
  const [incomes, setIncomes] = useState<IncomeItem[]>([]);
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [savings, setSavings] = useState<SavingsAllocation[]>([]);
  const [moneyMarket, setMoneyMarket] = useState<MoneyMarketProduct[]>([]);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(false);

  // Read URL query parameter for Header Prototype ?header= or ?variant=
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const h = parseInt(
        params.get("header") ||
          params.get("headerVariant") ||
          params.get("variant") ||
          "1",
        10
      );
      if (h >= 1 && h <= 10) {
        setHeaderVariant(h);
      }
    }
  }, []);

  const handleSelectHeaderVariant = (v: number) => {
    setHeaderVariant(v);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("header", v.toString());
      window.history.replaceState({}, "", url.toString());
    }
  };

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
    <div className="min-h-screen bg-[#FFF9F9] text-[#1c0606] flex flex-col font-sans pb-20">
      {/* Dynamic Header Component (10 Selectable Prototypes) */}
      <Navbar
        headerVariant={headerVariant}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        isFirebaseConnected={isFirebaseConnected}
        onOpenQuickAdd={() => setIsQuickAddOpen(true)}
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
            onOpenQuickAdd={() => setIsQuickAddOpen(true)}
          />
        )}

        {activeTab === "transactions" && (
          <TransactionsView
            incomes={incomes}
            expenses={expenses}
            savings={savings}
            selectedMonth={selectedMonth}
            onOpenQuickAdd={() => setIsQuickAddOpen(true)}
          />
        )}

        {activeTab === "savings" && (
          <SavingsMoneyMarketView
            savings={savings}
            moneyMarket={moneyMarket}
            selectedMonth={selectedMonth}
            onOpenQuickAdd={() => setIsQuickAddOpen(true)}
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
      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        selectedMonth={selectedMonth}
      />

      {/* Floating Header Prototype Switcher (10 Radically Different Header Designs) */}
      <HeaderSwitcher
        currentVariant={headerVariant}
        onSelectVariant={handleSelectHeaderVariant}
      />

      {/* Professional Footer */}
      <footer className="mt-auto border-t border-[#FFD9D9] bg-white py-6 text-center text-xs text-slate-500 font-medium">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#991213]" />
            <span className="font-bold text-slate-900">FinPlan Keuangan</span>
            <span className="text-slate-400">| Header Prototype Explorer</span>
          </div>
          <p className="text-slate-400">
            Pilih dari 10 desain header di bilah bawah atau gunakan tombol panah keyboard ← / →
          </p>
        </div>
      </footer>
    </div>
  );
}

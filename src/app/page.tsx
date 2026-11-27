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
  PlannedItem,
  FinancialGoal,
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
import { CatPlannedView } from "@/components/cat-prototype/CatPlannedView";
import { getCatThemeConfig } from "@/components/cat-prototype/catThemeConfig";
import { CatFooter } from "@/components/cat-prototype/CatFooter";
import { SplashScreen } from "@/components/cat-prototype/SplashScreen";
import { PinLockModal } from "@/components/PinLockModal";
import { PinSecurityService } from "@/lib/pinSecurity";
import { BackupExportModal } from "@/components/BackupExportModal";

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
    "dashboard" | "transactions" | "savings" | "report" | "planned"
  >("dashboard");
  const [selectedMonth, setSelectedMonth] = useState<string>("2026-11");
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickAddType, setQuickAddType] = useState<"income" | "expense" | "savings">("income");

  // Tokyo Minimalist Paper Edition (Desain #2 Permanen)
  const [isCatMode, setIsCatMode] = useState<boolean>(true);
  const [catVariant, setCatVariant] = useState<number>(2);
  const [showSplash, setShowSplash] = useState<boolean>(true);

  // Modal & Security States
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [isChangePinOpen, setIsChangePinOpen] = useState(false);
  const [isBalanceHidden, setIsBalanceHidden] = useState(false);

  useEffect(() => {
    setIsBalanceHidden(PinSecurityService.isBalanceHidden());
  }, []);

  const handleToggleHideBalance = () => {
    const next = !isBalanceHidden;
    setIsBalanceHidden(next);
    PinSecurityService.setBalanceHidden(next);
  };

  const openQuickAdd = (type?: "income" | "expense" | "savings") => {
    setQuickAddType(type || (activeTab === "savings" ? "savings" : "income"));
    setIsQuickAddOpen(true);
  };

  // Financial Data States
  const [incomes, setIncomes] = useState<IncomeItem[]>([]);
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [savings, setSavings] = useState<SavingsAllocation[]>([]);
  const [moneyMarket, setMoneyMarket] = useState<MoneyMarketProduct[]>([]);
  const [plannedItems, setPlannedItems] = useState<PlannedItem[]>([]);
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(false);

  // Subscribe to FinanceStorage updates & Cloud Sync
  useEffect(() => {
    FinanceStorage.initSync();

    const loadData = () => {
      setIncomes(FinanceStorage.getIncomes());
      setExpenses(FinanceStorage.getExpenses());
      setSavings(FinanceStorage.getSavings());
      setMoneyMarket(FinanceStorage.getMoneyMarket());
      setPlannedItems(FinanceStorage.getPlannedItems());
      setGoals(FinanceStorage.getGoals());
      setIsFirebaseConnected(FinanceStorage.getFirebaseStatus());
    };

    loadData();

    // Baca shortcut & parameter URL (?tab= atau ?action=) dari WebAPK / Home Widget
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      if (
        tabParam === "transactions" ||
        tabParam === "savings" ||
        tabParam === "report" ||
        tabParam === "dashboard" ||
        tabParam === "planned"
      ) {
        setActiveTab(tabParam as any);
      }
      const actionParam = params.get("action");
      if (
        actionParam === "income" ||
        actionParam === "expense" ||
        actionParam === "savings"
      ) {
        setQuickAddType(actionParam);
        setIsQuickAddOpen(true);
      }
    }

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
      plannedItems,
      goals,
      selectedMonth,
      isBalanceHidden,
      onToggleHideBalance: handleToggleHideBalance,
      onOpenQuickAdd: openQuickAdd,
      onNavigateToTab: (tab: any) => setActiveTab(tab),
      onOpenAddPlanned: () => setActiveTab("planned"),
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
    <>
      {showSplash && (
        <SplashScreen onFinish={() => setShowSplash(false)} />
      )}
      <div
        className="min-h-screen flex flex-col font-sans print:bg-white print:min-h-0 print:p-0 print:m-0 transition-colors duration-300 w-full max-w-full overflow-x-hidden min-w-0"
        style={{
          backgroundColor: isCatMode ? currentCatTheme.bgPage : "#FFF9F9",
          color: isCatMode ? currentCatTheme.textColor : "#1c0606",
        }}
      >
      {/* Header: Cat Themed Navbar or Original Swiss Minimalist */}
      <div className="print:hidden w-full max-w-full overflow-x-clip">
        {isCatMode ? (
          <CatNavbar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            selectedMonth={selectedMonth}
            setSelectedMonth={setSelectedMonth}
            isFirebaseConnected={isFirebaseConnected}
            onOpenQuickAdd={() => openQuickAdd()}
            variantId={catVariant}
            onOpenBackupExport={() => setIsBackupModalOpen(true)}
            onOpenChangePin={() => setIsChangePinOpen(true)}
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
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-8 pb-3 sm:pb-8 print:p-0 print:m-0 print:max-w-none print:w-full min-w-0 max-w-full overflow-x-hidden">
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
              goals={goals}
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
              onOpenBackupExport={() => setIsBackupModalOpen(true)}
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

        {activeTab === "planned" && (
          <CatPlannedView
            plannedItems={plannedItems}
            currentBalance={
              incomes.filter((i) => i.month === selectedMonth).reduce((a, b) => a + b.amount, 0) -
              expenses.filter((e) => e.month === selectedMonth).reduce((a, b) => a + b.amount, 0) -
              savings
                .filter((s) => s.month === selectedMonth && s.fundingSource !== "external")
                .reduce((a, b) => a + b.amount, 0)
            }
            selectedMonth={selectedMonth}
            variantId={catVariant}
            goals={goals}
            moneyMarket={moneyMarket}
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
          isCatMode={isCatMode}
          catVariant={catVariant}
        />
      )}

      {/* Footer with Lottie Rainbow Cat Remix Animation (by Victor Aremu) */}
      <CatFooter currentCatTheme={currentCatTheme} />

      {/* Security PIN Lock System (Layar Utama, Background Resume, dan Ganti PIN) */}
      <PinLockModal
        isChangeMode={isChangePinOpen}
        onCloseChangeMode={() => setIsChangePinOpen(false)}
      />

      {/* Backup & Export Multi-Sheet Excel (.xlsx) / JSON Modal */}
      <BackupExportModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        dataPayload={{
          month: selectedMonth,
          incomes,
          expenses,
          savings,
          moneyMarket,
          plannedItems,
          financialGoals: goals,
        }}
      />
    </div>
  </>
);
}

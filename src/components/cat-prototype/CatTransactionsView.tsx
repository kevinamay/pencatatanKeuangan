"use client";

import React, { useState } from "react";
import {
  ArrowUpDown,
  Search,
  Trash2,
  Pencil,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  PlusCircle,
  Fish,
  Sparkles,
  Layers,
  Cat,
} from "lucide-react";
import {
  IncomeItem,
  ExpenseItem,
  SavingsAllocation,
} from "@/types/finance";
import {
  FinanceStorage,
  formatRupiah,
  formatTanggalIndo,
} from "@/lib/storage";
import {
  EditTransactionModal,
  EditableTransaction,
} from "@/components/EditTransactionModal";
import { CatAnimation } from "./CatAnimations";
import { InteractiveCatMascot } from "./InteractiveCatMascot";
import { getCatThemeConfig } from "./catThemeConfig";

interface CatTransactionsViewProps {
  incomes: IncomeItem[];
  expenses: ExpenseItem[];
  savings: SavingsAllocation[];
  selectedMonth: string;
  onOpenQuickAdd: () => void;
  variantId: number;
}

export const CatTransactionsView: React.FC<CatTransactionsViewProps> = ({
  incomes,
  expenses,
  savings,
  selectedMonth,
  onOpenQuickAdd,
  variantId,
}) => {
  const theme = getCatThemeConfig(variantId);
  const [activeFilter, setActiveFilter] = useState<
    "all" | "income" | "expense" | "savings"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingTx, setEditingTx] = useState<EditableTransaction | null>(null);

  const monthIncomes = incomes.filter((i) => i.month === selectedMonth);
  const monthExpenses = expenses.filter((e) => e.month === selectedMonth);
  const monthSavings = savings.filter((s) => s.month === selectedMonth);

  const allTransactions = [
    ...monthIncomes.map((i) => ({
      ...i,
      txType: "income" as const,
      mainTitle: i.source || i.category,
      categoryLabel: i.category,
    })),
    ...monthExpenses.map((e) => ({
      ...e,
      txType: "expense" as const,
      mainTitle: e.title,
      categoryLabel: e.category,
    })),
    ...monthSavings.map((s) => ({
      ...s,
      txType: "savings" as const,
      mainTitle: s.accountName || "Alokasi Simpanan",
      categoryLabel:
        s.targetType === "money_market"
          ? "Pasar Uang"
          : s.targetType === "emergency"
          ? "Dana Darurat"
          : "Target Tabungan",
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filteredTransactions = allTransactions.filter((tx) => {
    if (activeFilter !== "all" && tx.txType !== activeFilter) return false;
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      const matchTitle = (tx.mainTitle || "").toLowerCase().includes(q);
      const matchCat = (tx.categoryLabel || "").toLowerCase().includes(q);
      const matchNote = tx.note ? tx.note.toLowerCase().includes(q) : false;
      return matchTitle || matchCat || matchNote;
    }
    return true;
  });

  const totalIn = monthIncomes.reduce((acc, curr) => acc + curr.amount, 0);
  const totalOut = monthExpenses.reduce((acc, curr) => acc + curr.amount, 0);
  const totalSav = monthSavings.reduce((acc, curr) => acc + curr.amount, 0);
  const netFlow = totalIn - totalOut - totalSav;

  const handleDelete = (tx: (typeof allTransactions)[0]) => {
    const confirmMsg = `Hapus catatan "${tx.mainTitle || 'transaksi'}" senilai ${formatRupiah(tx.amount)}?`;
    if (!window.confirm(confirmMsg)) return;

    if (tx.txType === "income") {
      FinanceStorage.deleteIncome(tx.id);
    } else if (tx.txType === "expense") {
      FinanceStorage.deleteExpense(tx.id);
    } else if (tx.txType === "savings") {
      FinanceStorage.deleteSavings(tx.id);
    }
  };

  const handleEdit = (tx: (typeof allTransactions)[0]) => {
    setEditingTx({
      id: tx.id,
      txType: tx.txType,
      month: tx.date.substring(0, 7),
      amount: tx.amount,
      date: tx.date,
      note: tx.note || "",
      category: tx.categoryLabel,
      title: tx.mainTitle,
      source: tx.txType === "income" ? (tx as any).source : undefined,
      targetType: tx.txType === "savings" ? (tx as any).targetType : undefined,
      accountName: tx.txType === "savings" ? (tx as any).accountName : undefined,
      fundingSource: tx.txType === "savings" ? (tx as any).fundingSource : undefined,
    });
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Header Banner Themed with Active Cat */}
      <div
        className="rounded-3xl p-6 sm:p-8 border shadow-sm relative overflow-hidden transition-all duration-300"
        style={{
          backgroundColor: theme.isDark ? "#111827" : "#FFFFFF",
          borderColor: theme.cardBorder,
        }}
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black"
              style={{
                backgroundColor: `${theme.accent}15`,
                color: theme.accent,
              }}
            >
              <Cat className="w-3.5 h-3.5" />
              <span>Buku Catatan Keuangan • {selectedMonth}</span>
            </div>
            <h1
              className="text-2xl sm:text-3xl font-black tracking-tight"
              style={{ color: theme.isDark ? "#FFFFFF" : theme.textColor }}
            >
              Daftar Transaksi & Riwayat Arus Kas
            </h1>
            <p
              className="text-xs sm:text-sm font-medium max-w-xl"
              style={{ color: theme.mutedText }}
            >
              Pantau seluruh arus masuk gaji, pengeluaran belanja harian, dan alokasi simpanan tabungan per tanggal.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <InteractiveCatMascot
              animation={theme.pageAnimations.transactions}
              theme={theme}
              size="lg"
            />

            <button
              onClick={onOpenQuickAdd}
              className="px-4 py-3 rounded-2xl text-white text-xs font-black shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center gap-2"
              style={{ backgroundColor: theme.accent }}
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Catat Transaksi</span>
            </button>
          </div>
        </div>

        {/* 4 Summary Stat Pills */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6 pt-6 border-t"
          style={{ borderColor: theme.cardBorder }}
        >
          <div className="p-3.5 rounded-2xl border"
            style={{
              backgroundColor: theme.isDark ? "#1F2937" : "#F0FDF4",
              borderColor: theme.isDark ? "#374151" : "#BBF7D0",
            }}
          >
            <span className="text-[10px] font-black uppercase text-emerald-600 block">
              Total Pemasukan
            </span>
            <span className="text-sm sm:text-base font-black text-emerald-700">
              +{formatRupiah(totalIn)}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl border"
            style={{
              backgroundColor: theme.isDark ? "#1F2937" : "#FEF2F2",
              borderColor: theme.isDark ? "#374151" : "#FECACA",
            }}
          >
            <span className="text-[10px] font-black uppercase text-rose-600 block">
              Total Pengeluaran
            </span>
            <span className="text-sm sm:text-base font-black text-rose-700">
              -{formatRupiah(totalOut)}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl border"
            style={{
              backgroundColor: theme.isDark ? "#1F2937" : "#EFF6FF",
              borderColor: theme.isDark ? "#374151" : "#BFDBFE",
            }}
          >
            <span className="text-[10px] font-black uppercase text-blue-600 block">
              Alokasi Tabungan
            </span>
            <span className="text-sm sm:text-base font-black text-blue-700">
              {formatRupiah(totalSav)}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl border"
            style={{
              backgroundColor: theme.isDark ? "#1F2937" : `${theme.accent}10`,
              borderColor: theme.cardBorder,
            }}
          >
            <span className="text-[10px] font-black uppercase block" style={{ color: theme.accent }}>
              Sisa Kas Bersih
            </span>
            <span
              className={`text-sm sm:text-base font-black ${
                netFlow >= 0 ? "text-emerald-600" : "text-rose-600"
              }`}
            >
              {formatRupiah(netFlow)}
            </span>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div
        className="rounded-2xl p-4 border flex flex-col sm:flex-row items-center justify-between gap-4"
        style={{
          backgroundColor: theme.isDark ? "#111827" : "#FFFFFF",
          borderColor: theme.cardBorder,
        }}
      >
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: "all", label: "Semua", count: allTransactions.length },
            { id: "income", label: "Pemasukan", count: monthIncomes.length },
            { id: "expense", label: "Pengeluaran", count: monthExpenses.length },
            { id: "savings", label: "Tabungan", count: monthSavings.length },
          ].map((tab) => {
            const active = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  active
                    ? "text-white shadow-xs"
                    : theme.isDark
                    ? "text-slate-400 hover:text-white hover:bg-slate-800"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
                style={active ? { backgroundColor: theme.accent } : {}}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-md text-[10px] ${
                    active ? "bg-white/20 text-white" : "bg-slate-200/50 text-slate-500"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div
          className="relative w-full sm:w-72 flex items-center px-3 py-1.5 rounded-xl border text-xs"
          style={{
            backgroundColor: theme.isDark ? "#1F2937" : theme.bgPage,
            borderColor: theme.cardBorder,
          }}
        >
          <Search className="w-3.5 h-3.5 mr-2 text-slate-400 flex-shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari transaksi kucing, gaji, belanja..."
            className="w-full bg-transparent border-none outline-none font-medium placeholder:text-slate-400"
            style={{ color: theme.isDark ? "#FFFFFF" : theme.textColor }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="text-[10px] text-slate-400 hover:text-slate-600 ml-1"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Transactions List */}
      <div
        className="rounded-3xl border overflow-hidden shadow-sm"
        style={{
          backgroundColor: theme.isDark ? "#111827" : "#FFFFFF",
          borderColor: theme.cardBorder,
        }}
      >
        {filteredTransactions.length === 0 ? (
          <div className="py-16 text-center space-y-4">
            <div className="w-24 h-24 mx-auto opacity-80">
              <CatAnimation variant={theme.pageAnimations.transactions} className="w-full h-full" />
            </div>
            <div className="space-y-1">
              <h4
                className="text-base font-black"
                style={{ color: theme.isDark ? "#FFFFFF" : theme.textColor }}
              >
                Belum Ada Catatan Transaksi!
              </h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {searchQuery
                  ? "Tidak ada transaksi yang cocok dengan kata kunci pencarian Anda."
                  : "Mulai tambahkan catatan pemasukan, belanja kebutuhan, atau alokasi tabungan pertama Anda."}
              </p>
            </div>
            <button
              onClick={onOpenQuickAdd}
              className="px-4 py-2 rounded-xl text-white text-xs font-black shadow-xs hover:brightness-110 active:scale-95 transition-all inline-flex items-center gap-1.5"
              style={{ backgroundColor: theme.accent }}
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>+ Tambah Transaksi Sekarang</span>
            </button>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: theme.cardBorder }}>
            {filteredTransactions.map((tx) => {
              const isIncome = tx.txType === "income";
              const isExpense = tx.txType === "expense";
              const isSavings = tx.txType === "savings";

              return (
                <div
                  key={tx.id}
                  className={`p-4 sm:p-5 flex items-center justify-between gap-4 transition-colors ${
                    theme.isDark ? "hover:bg-slate-800/50" : "hover:bg-slate-50/80"
                  }`}
                >
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 text-base shadow-xs ${
                        isIncome
                          ? "bg-emerald-100 text-emerald-700"
                          : isExpense
                          ? "bg-rose-100 text-rose-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {isIncome ? "✨" : isExpense ? "🐟" : "🪙"}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4
                          className="text-sm font-black truncate"
                          style={{
                            color: theme.isDark ? "#FFFFFF" : theme.textColor,
                          }}
                        >
                          {tx.mainTitle}
                        </h4>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            isIncome
                              ? "bg-emerald-100 text-emerald-800"
                              : isExpense
                              ? "bg-rose-100 text-rose-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {tx.categoryLabel}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                        <span>{formatTanggalIndo(tx.date)}</span>
                        {tx.note && (
                          <>
                            <span>•</span>
                            <span className="truncate italic">"{tx.note}"</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Amount & Actions */}
                  <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
                    <span
                      className={`text-sm sm:text-base font-black font-mono ${
                        isIncome
                          ? "text-emerald-600"
                          : isExpense
                          ? "text-rose-600"
                          : "text-blue-600"
                      }`}
                    >
                      {isIncome ? "+" : isExpense ? "-" : ""}
                      {formatRupiah(tx.amount)}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEdit(tx)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        title="Edit Catatan"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(tx)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Hapus Catatan"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Modal Hook */}
      {editingTx && (
        <EditTransactionModal
          isOpen={!!editingTx}
          onClose={() => setEditingTx(null)}
          transaction={editingTx}
        />
      )}
    </div>
  );
};

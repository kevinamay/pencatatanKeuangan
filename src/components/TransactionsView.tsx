"use client";

import React, { useState } from "react";
import {
  ArrowUpDown,
  Search,
  Trash2,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  PlusCircle,
  Layers,
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

interface TransactionsViewProps {
  incomes: IncomeItem[];
  expenses: ExpenseItem[];
  savings: SavingsAllocation[];
  selectedMonth: string;
  onOpenQuickAdd: () => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  incomes,
  expenses,
  savings,
  selectedMonth,
  onOpenQuickAdd,
}) => {
  const [activeFilter, setActiveFilter] = useState<
    "all" | "income" | "expense" | "savings"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");

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
      mainTitle: e.note || e.category,
      categoryLabel: e.category,
    })),
    ...monthSavings.map((s) => ({
      ...s,
      txType: "savings" as const,
      mainTitle: s.accountName,
      categoryLabel:
        s.targetType === "money_market"
          ? "Pasar Uang"
          : s.targetType === "emergency"
          ? "Dana Darurat"
          : "Tabungan",
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filteredList = allTransactions.filter((tx) => {
    if (activeFilter !== "all" && tx.txType !== activeFilter) return false;
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      const matchTitle = tx.mainTitle.toLowerCase().includes(q);
      const matchCat = tx.categoryLabel.toLowerCase().includes(q);
      const matchNote = (tx.note || "").toLowerCase().includes(q);
      return matchTitle || matchCat || matchNote;
    }
    return true;
  });

  const handleDelete = async (id: string, type: "income" | "expense" | "savings") => {
    if (confirm("Apakah Anda yakin ingin menghapus catatan transaksi ini?")) {
      if (type === "income") await FinanceStorage.deleteIncome(id);
      else if (type === "expense") await FinanceStorage.deleteExpense(id);
      else if (type === "savings") await FinanceStorage.deleteSavings(id);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white border border-[#FFD9D9] shadow-xs">
        <div>
          <h2 className="text-xl font-black text-[#991213]">
            Kelola Catatan Transaksi ({selectedMonth})
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Daftar lengkap seluruh aliran gaji masuk, pos pengeluaran, dan alokasi tabungan.
          </p>
        </div>

        <button
          onClick={onOpenQuickAdd}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#991213] hover:bg-[#7f0e0f] text-white font-extrabold text-sm shadow-md shadow-[#991213]/25 active:scale-95 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Tambah Transaksi Baru</span>
        </button>
      </div>

      {/* Filter Tabs & Search Controls */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Sub-tabs */}
        <div className="flex items-center gap-1.5 p-1.5 bg-[#FFF0F0] rounded-2xl w-full md:w-auto border border-[#FFD9D9]">
          <button
            onClick={() => setActiveFilter("all")}
            className={`flex-1 md:flex-initial px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeFilter === "all"
                ? "bg-[#991213] text-white shadow-xs"
                : "text-slate-700 hover:text-[#991213]"
            }`}
          >
            Semua ({allTransactions.length})
          </button>
          <button
            onClick={() => setActiveFilter("income")}
            className={`flex-1 md:flex-initial px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeFilter === "income"
                ? "bg-[#991213] text-white shadow-xs"
                : "text-slate-700 hover:text-[#991213]"
            }`}
          >
            Gaji / Masuk ({monthIncomes.length})
          </button>
          <button
            onClick={() => setActiveFilter("expense")}
            className={`flex-1 md:flex-initial px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeFilter === "expense"
                ? "bg-[#991213] text-white shadow-xs"
                : "text-slate-700 hover:text-[#991213]"
            }`}
          >
            Pengeluaran ({monthExpenses.length})
          </button>
          <button
            onClick={() => setActiveFilter("savings")}
            className={`flex-1 md:flex-initial px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeFilter === "savings"
                ? "bg-[#991213] text-white shadow-xs"
                : "text-slate-700 hover:text-[#991213]"
            }`}
          >
            Tabungan ({monthSavings.length})
          </button>
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-[#991213] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari transaksi atau kategori..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#FFD9D9] rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#991213]/40"
          />
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white border border-[#FFD9D9] rounded-3xl overflow-hidden shadow-xs">
        {filteredList.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <Layers className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-500">
              Tidak ada catatan transaksi yang sesuai dengan filter.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#FFD9D9]/50">
            {filteredList.map((tx) => (
              <div
                key={tx.id}
                className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-[#FFF9F9] transition-colors"
              >
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                      tx.txType === "income"
                        ? "bg-[#FFD9D9] text-[#991213]"
                        : tx.txType === "expense"
                        ? "bg-rose-100 text-rose-700"
                        : "bg-[#FFD9D9] text-[#991213]"
                    }`}
                  >
                    {tx.txType === "income" ? (
                      <TrendingUp className="w-5 h-5" />
                    ) : tx.txType === "expense" ? (
                      <TrendingDown className="w-5 h-5" />
                    ) : (
                      <PiggyBank className="w-5 h-5" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-sm sm:text-base text-slate-900 truncate">
                        {tx.mainTitle}
                      </h4>
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                          tx.txType === "income"
                            ? "bg-[#FFD9D9] text-[#991213]"
                            : tx.txType === "expense"
                            ? "bg-rose-100 text-rose-800"
                            : "bg-[#FFD9D9] text-[#991213]"
                        }`}
                      >
                        {tx.categoryLabel}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {formatTanggalIndo(tx.date)}
                      {tx.note && tx.note !== tx.mainTitle ? ` • ${tx.note}` : ""}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:gap-5 flex-shrink-0">
                  <div className="text-right">
                    <span
                      className={`text-sm sm:text-base font-black ${
                        tx.txType === "income"
                          ? "text-[#991213]"
                          : tx.txType === "expense"
                          ? "text-rose-600"
                          : "text-[#991213]"
                      }`}
                    >
                      {tx.txType === "income" ? "+" : "-"}
                      {formatRupiah(tx.amount)}
                    </span>
                    <span className="block text-[10px] uppercase font-bold text-slate-400">
                      {tx.txType === "income"
                        ? "Pemasukan"
                        : tx.txType === "expense"
                        ? "Pengeluaran"
                        : "Tabungan"}
                    </span>
                  </div>

                  <button
                    onClick={() => handleDelete(tx.id, tx.txType)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                    title="Hapus transaksi"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Pencil,
  CheckCircle2,
  Trash2,
  Coins,
  Receipt,
  PiggyBank,
} from "lucide-react";
import {
  IncomeCategory,
  ExpenseCategory,
  SavingsTargetType,
} from "@/types/finance";
import { FinanceStorage, formatRupiah } from "@/lib/storage";

export interface EditableTransaction {
  id: string;
  txType: "income" | "expense" | "savings";
  date: string;
  month: string;
  amount: number;
  category?: string;
  source?: string;
  title?: string;
  note?: string;
  targetType?: SavingsTargetType;
  accountName?: string;
}

interface EditTransactionModalProps {
  isOpen: boolean;
  transaction: EditableTransaction | null;
  onClose: () => void;
  onDeleted?: () => void;
}

export const EditTransactionModal: React.FC<EditTransactionModalProps> = ({
  isOpen,
  transaction,
  onClose,
  onDeleted,
}) => {
  const [amount, setAmount] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [note, setNote] = useState<string>("");

  // Expense
  const [expenseTitle, setExpenseTitle] = useState<string>("");
  const [expenseCategory, setExpenseCategory] = useState<ExpenseCategory>(
    "Makan & Minuman"
  );

  // Income
  const [incomeSource, setIncomeSource] = useState<string>("");
  const [incomeCategory, setIncomeCategory] = useState<IncomeCategory>("Gaji Pokok");

  // Savings
  const [savingsAccount, setSavingsAccount] = useState<string>("");
  const [savingsTarget, setSavingsTarget] = useState<SavingsTargetType>("money_market");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (transaction) {
      setAmount(transaction.amount ? transaction.amount.toLocaleString("id-ID") : "");
      setDate(transaction.date || new Date().toISOString().split("T")[0]);
      setNote(transaction.note || "");

      if (transaction.txType === "expense") {
        setExpenseTitle(transaction.title || transaction.note || "");
        setExpenseCategory((transaction.category as ExpenseCategory) || "Makan & Minuman");
      } else if (transaction.txType === "income") {
        setIncomeSource(transaction.source || "");
        setIncomeCategory((transaction.category as IncomeCategory) || "Gaji Pokok");
      } else if (transaction.txType === "savings") {
        setSavingsAccount(transaction.accountName || "");
        setSavingsTarget(transaction.targetType || "money_market");
      }
    }
  }, [transaction]);

  if (!isOpen || !transaction) return null;

  const parsedAmount = parseFloat(amount.replace(/[^0-9]/g, "")) || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedAmount <= 0) {
      alert("Masukkan nominal yang valid di atas Rp 0");
      return;
    }

    setIsSubmitting(true);
    const month = date.substring(0, 7);

    try {
      if (transaction.txType === "income") {
        await FinanceStorage.updateIncome(transaction.id, {
          date,
          month,
          amount: parsedAmount,
          category: incomeCategory,
          source: incomeSource.trim() || incomeCategory,
          note: note.trim(),
        });
        setSuccessMsg("Pemasukan berhasil diperbarui!");
      } else if (transaction.txType === "expense") {
        await FinanceStorage.updateExpense(transaction.id, {
          date,
          month,
          amount: parsedAmount,
          category: expenseCategory,
          title: expenseTitle.trim() || expenseCategory,
          note: note.trim(),
        });
        setSuccessMsg("Pengeluaran berhasil diperbarui!");
      } else if (transaction.txType === "savings") {
        await FinanceStorage.updateSavings(transaction.id, {
          date,
          month,
          amount: parsedAmount,
          targetType: savingsTarget,
          accountName: savingsAccount.trim() || "Tabungan",
          note: note.trim(),
        });
        setSuccessMsg("Alokasi Tabungan berhasil diperbarui!");
      }

      setTimeout(() => {
        setIsSubmitting(false);
        setSuccessMsg(null);
        onClose();
      }, 500);
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  const handleDeleteCurrent = async () => {
    if (confirm("Yakin ingin menghapus catatan transaksi ini secara permanen?")) {
      if (transaction.txType === "income") {
        await FinanceStorage.deleteIncome(transaction.id);
      } else if (transaction.txType === "expense") {
        await FinanceStorage.deleteExpense(transaction.id);
      } else if (transaction.txType === "savings") {
        await FinanceStorage.deleteSavings(transaction.id);
      }
      if (onDeleted) onDeleted();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-[#FFD9D9] overflow-hidden transform transition-all">
        {/* Header Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#FFD9D9] bg-[#FFF0F0]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FFD9D9] text-[#991213] flex items-center justify-center font-bold">
              <Pencil className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-[#991213]">
                  Edit Transaksi
                </h3>
                <span
                  className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                    transaction.txType === "income"
                      ? "bg-[#FFD9D9] text-[#991213]"
                      : transaction.txType === "expense"
                      ? "bg-rose-100 text-rose-800"
                      : "bg-[#FFD9D9] text-[#991213]"
                  }`}
                >
                  {transaction.txType === "income"
                    ? "Pemasukan"
                    : transaction.txType === "expense"
                    ? "Pengeluaran"
                    : "Tabungan"}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-[#991213] hover:bg-[#FFD9D9]/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          {/* Judul Pengeluaran (Tepat di atas nominal jika pengeluaran) */}
          {transaction.txType === "expense" && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Judul Pengeluaran
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Makan Siang, Beli Baju, Servis Motor"
                value={expenseTitle}
                onChange={(e) => setExpenseTitle(e.target.value)}
                className="w-full px-4 py-3 bg-[#FFF9F9] border border-[#FFD9D9] rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#991213]/40 focus:bg-white placeholder:text-slate-400"
              />
            </div>
          )}

          {/* Nominal (Rp) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Nominal (Rp)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-[#991213] text-lg">
                Rp
              </span>
              <input
                type="text"
                required
                placeholder="0"
                value={amount}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, "");
                  setAmount(val ? Number(val).toLocaleString("id-ID") : "");
                }}
                className="w-full pl-12 pr-4 py-3 bg-[#FFF9F9] border border-[#FFD9D9] rounded-2xl text-xl sm:text-2xl font-black text-[#991213] focus:outline-none focus:ring-2 focus:ring-[#991213]/40 focus:bg-white"
              />
            </div>
            {parsedAmount > 0 && (
              <p className="mt-1.5 text-xs text-[#991213] font-black pl-1">
                Terbaca: {formatRupiah(parsedAmount)}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tanggal
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FFF9F9] border border-[#FFD9D9] rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#991213]/40 focus:bg-white"
              />
            </div>

            {transaction.txType === "income" && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kategori Gaji / Pemasukan
                </label>
                <select
                  value={incomeCategory}
                  onChange={(e) =>
                    setIncomeCategory(e.target.value as IncomeCategory)
                  }
                  className="w-full px-3.5 py-2.5 bg-[#FFF9F9] border border-[#FFD9D9] rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#991213]/40 focus:bg-white"
                >
                  <option value="Gaji Pokok">Gaji Pokok</option>
                  <option value="Tunjangan">Tunjangan</option>
                  <option value="Bonus / THR">Bonus / THR</option>
                  <option value="Freelance / Side Job">Freelance / Side Job</option>
                  <option value="Hasil Investasi">Hasil Investasi</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>
            )}

            {transaction.txType === "expense" && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kategori Pengeluaran
                </label>
                <select
                  value={expenseCategory}
                  onChange={(e) =>
                    setExpenseCategory(e.target.value as ExpenseCategory)
                  }
                  className="w-full px-3.5 py-2.5 bg-[#FFF9F9] border border-[#FFD9D9] rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#991213]/40 focus:bg-white"
                >
                  <option value="Makan & Minuman">Makan & Minuman</option>
                  <option value="Belanja Bulanan">Belanja Bulanan</option>
                  <option value="Tempat Tinggal (Sewa/KPR)">Tempat Tinggal (Sewa/KPR)</option>
                  <option value="Tagihan & Utilitas">Tagihan & Utilitas</option>
                  <option value="Transportasi">Transportasi</option>
                  <option value="Hiburan & Gaya Hidup">Hiburan & Gaya Hidup</option>
                  <option value="Kesehatan & Asuransi">Kesehatan & Asuransi</option>
                  <option value="Pendidikan">Pendidikan</option>
                  <option value="Cicilan & Utang">Cicilan & Utang</option>
                  <option value="Keluarga & Donasi">Keluarga & Donasi</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>
            )}

            {transaction.txType === "savings" && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Jenis Alokasi Tabungan
                </label>
                <select
                  value={savingsTarget}
                  onChange={(e) =>
                    setSavingsTarget(e.target.value as SavingsTargetType)
                  }
                  className="w-full px-3.5 py-2.5 bg-[#FFF9F9] border border-[#FFD9D9] rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#991213]/40 focus:bg-white"
                >
                  <option value="money_market">📈 Pasar Uang (Money Market)</option>
                  <option value="emergency">🛡️ Dana Darurat</option>
                  <option value="regular">🏦 Tabungan Reguler Bank</option>
                  <option value="goal">🎯 Target Impian / Goals</option>
                </select>
              </div>
            )}
          </div>

          {transaction.txType === "income" && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Sumber / Keterangan Pemasukan
              </label>
              <input
                type="text"
                placeholder="Contoh: PT ABC, Klien Proyek Web, dsb."
                value={incomeSource}
                onChange={(e) => setIncomeSource(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FFF9F9] border border-[#FFD9D9] rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#991213]/40 focus:bg-white"
              />
            </div>
          )}

          {transaction.txType === "savings" && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tujuan / Akun Tabungan
              </label>
              <input
                type="text"
                placeholder="Contoh: Sucorinvest Pasar Uang, Bank Jago Darurat, dll."
                value={savingsAccount}
                onChange={(e) => setSavingsAccount(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FFF9F9] border border-[#FFD9D9] rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#991213]/40 focus:bg-white"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Catatan / Keterangan Tambahan
            </label>
            <input
              type="text"
              placeholder="Catatan kecil (opsional)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#FFF9F9] border border-[#FFD9D9] rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#991213]/40 focus:bg-white"
            />
          </div>

          {successMsg && (
            <div className="flex items-center gap-2 p-3 bg-[#FFF0F0] border border-[#991213] rounded-xl text-[#991213] text-xs font-black animate-pulse">
              <CheckCircle2 className="w-4 h-4 text-[#991213]" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={handleDeleteCurrent}
              className="px-4 py-3 rounded-2xl border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-sm transition-all flex items-center justify-center gap-2"
              title="Hapus data ini"
            >
              <Trash2 className="w-4 h-4" />
              <span>Hapus</span>
            </button>

            <button
              type="submit"
              disabled={isSubmitting || parsedAmount <= 0}
              className={`flex-1 py-3.5 rounded-2xl font-black text-sm sm:text-base text-white shadow-lg transition-all active:scale-98 flex items-center justify-center gap-2 bg-gradient-to-r from-[#991213] via-[#b51819] to-[#7f0e0f] hover:from-[#7f0e0f] hover:to-[#991213] shadow-[#991213]/25 ${
                isSubmitting || parsedAmount <= 0 ? "opacity-60 cursor-not-allowed" : ""
              }`}
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Simpan Perubahan
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


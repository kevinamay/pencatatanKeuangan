"use client";

import React, { useState } from "react";
import {
  X,
  Coins,
  Receipt,
  PiggyBank,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import {
  IncomeCategory,
  ExpenseCategory,
  SavingsTargetType,
  SavingsFundingSource,
} from "@/types/finance";
import {
  FinanceStorage,
  formatRupiah,
} from "@/lib/storage";
import { LottieAnimation } from "@/components/LottieAnimation";

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMonth?: string;
  defaultMonth?: string;
  initialType?: "income" | "expense" | "savings";
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  isOpen,
  onClose,
  selectedMonth,
  defaultMonth,
  initialType = "income",
}) => {
  const currentMonth = selectedMonth || defaultMonth || "2026-11";
  const [activeType, setActiveType] = useState<"income" | "expense" | "savings">(
    initialType
  );

  React.useEffect(() => {
    if (isOpen) {
      setActiveType(initialType);
    }
  }, [isOpen, initialType]);

  const [amount, setAmount] = useState<string>("");
  const [date, setDate] = useState<string>(() => new Date().toISOString().split("T")[0]);
  const [note, setNote] = useState<string>("");

  // Income Specific
  const [incomeCategory, setIncomeCategory] = useState<IncomeCategory>("Gaji Pokok");
  const [incomeSource, setIncomeSource] = useState<string>("");

  // Expense Specific
  const [expenseTitle, setExpenseTitle] = useState<string>("");
  const [expenseCategory, setExpenseCategory] = useState<ExpenseCategory>(
    "Makan & Minuman"
  );

  // Savings Specific
  const [savingsTarget, setSavingsTarget] = useState<SavingsTargetType>(
    "money_market"
  );
  const [savingsAccount, setSavingsAccount] = useState<string>(
    "Sucorinvest Pasar Uang"
  );
  const [fundingSource, setFundingSource] = useState<SavingsFundingSource>("salary");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

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
      if (activeType === "income") {
        await FinanceStorage.addIncome({
          date,
          month,
          amount: parsedAmount,
          category: incomeCategory,
          source: incomeSource.trim() || incomeCategory,
          note: note.trim(),
        });
        setSuccessMsg(`Pemasukan ${formatRupiah(parsedAmount)} berhasil dicatat!`);
      } else if (activeType === "expense") {
        await FinanceStorage.addExpense({
          date,
          month,
          amount: parsedAmount,
          category: expenseCategory,
          title: expenseTitle.trim() || expenseCategory,
          note: note.trim(),
        });
        setSuccessMsg(`Pengeluaran ${formatRupiah(parsedAmount)} berhasil dicatat!`);
      } else if (activeType === "savings") {
        await FinanceStorage.addSavings({
          date,
          month,
          amount: parsedAmount,
          targetType: savingsTarget,
          accountName: savingsAccount.trim() || "Tabungan",
          fundingSource,
          note: note.trim(),
        });
        setSuccessMsg(
          `Alokasi Tabungan ${formatRupiah(parsedAmount)} (${
            fundingSource === "salary" ? "Dari Gaji" : "Di Luar Gaji"
          }) berhasil dicatat!`
        );
      }

      setTimeout(() => {
        setAmount("");
        setNote("");
        setExpenseTitle("");
        setIncomeSource("");
        setIsSubmitting(false);
        setSuccessMsg(null);
        onClose();
      }, 700);
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-[#FFD9D9] overflow-hidden transform transition-all">
        {/* Header Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#FFD9D9] bg-[#FFF0F0]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FFD9D9] text-[#8B0000] flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="text-base sm:text-lg font-black text-[#8B0000]">
              Catat Keuangan Baru
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-[#8B0000] hover:bg-[#FFD9D9]/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="p-4 sm:p-6 pb-0">
          <div className="grid grid-cols-3 gap-2 p-1.5 bg-[#FFF0F0] rounded-2xl border border-[#FFD9D9]">
            <button
              type="button"
              onClick={() => setActiveType("income")}
              className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeType === "income"
                  ? "bg-[#8B0000] text-white shadow-sm"
                  : "text-slate-700 hover:text-[#8B0000]"
              }`}
            >
              <Coins className="w-4 h-4" />
              Gaji Masuk
            </button>
            <button
              type="button"
              onClick={() => setActiveType("expense")}
              className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeType === "expense"
                  ? "bg-[#8B0000] text-white shadow-sm"
                  : "text-slate-700 hover:text-[#8B0000]"
              }`}
            >
              <Receipt className="w-4 h-4" />
              Pengeluaran
            </button>
            <button
              type="button"
              onClick={() => setActiveType("savings")}
              className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeType === "savings"
                  ? "bg-[#8B0000] text-white shadow-sm"
                  : "text-slate-700 hover:text-[#8B0000]"
              }`}
            >
              <PiggyBank className="w-4 h-4" />
              Tabungan
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          {/* Judul Pengeluaran (Tampil di atas nominal saat tab Pengeluaran aktif) */}
          {activeType === "expense" && (
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
                className="w-full px-4 py-3 bg-[#FFF9F9] border border-[#FFD9D9] rounded-2xl text-sm sm:text-base font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#8B0000]/40 focus:bg-white placeholder:text-slate-400 placeholder:font-normal transition-all"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Nominal (Rp)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-[#8B0000] text-lg">
                Rp
              </span>
              <input
                type="text"
                required
                autoFocus
                placeholder="0"
                value={amount}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, "");
                  setAmount(val ? Number(val).toLocaleString("id-ID") : "");
                }}
                className="w-full pl-12 pr-4 py-3 bg-[#FFF9F9] border border-[#FFD9D9] rounded-2xl text-xl sm:text-2xl font-black text-[#8B0000] focus:outline-none focus:ring-2 focus:ring-[#8B0000]/40 focus:bg-white"
              />
            </div>
            {parsedAmount > 0 && (
              <p className="mt-1.5 text-xs text-[#8B0000] font-black pl-1">
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
                className="w-full px-3.5 py-2.5 bg-[#FFF9F9] border border-[#FFD9D9] rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#8B0000]/40 focus:bg-white"
              />
            </div>

            {activeType === "income" && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kategori Gaji / Pemasukan
                </label>
                <select
                  value={incomeCategory}
                  onChange={(e) =>
                    setIncomeCategory(e.target.value as IncomeCategory)
                  }
                  className="w-full px-3.5 py-2.5 bg-[#FFF9F9] border border-[#FFD9D9] rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#8B0000]/40 focus:bg-white"
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

            {activeType === "expense" && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kategori Pengeluaran
                </label>
                <select
                  value={expenseCategory}
                  onChange={(e) =>
                    setExpenseCategory(e.target.value as ExpenseCategory)
                  }
                  className="w-full px-3.5 py-2.5 bg-[#FFF9F9] border border-[#FFD9D9] rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#8B0000]/40 focus:bg-white"
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

            {activeType === "savings" && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Jenis Alokasi Tabungan
                </label>
                <select
                  value={savingsTarget}
                  onChange={(e) =>
                    setSavingsTarget(e.target.value as SavingsTargetType)
                  }
                  className="w-full px-3.5 py-2.5 bg-[#FFF9F9] border border-[#FFD9D9] rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#8B0000]/40 focus:bg-white"
                >
                  <option value="money_market">📈 Pasar Uang (Money Market)</option>
                  <option value="emergency">🛡️ Dana Darurat</option>
                  <option value="regular">🏦 Tabungan Reguler Bank</option>
                  <option value="goal">🎯 Target Impian / Goals</option>
                </select>
              </div>
            )}
          </div>

          {/* Pilihan Sumber Dana untuk Tabungan & Investasi */}
          {activeType === "savings" && (
            <div className="p-3.5 bg-[#FFF0F0] rounded-2xl border border-[#FFD9D9] space-y-2">
              <label className="block text-xs font-bold text-slate-800">
                Sumber Dana Tabungan / Investasi
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFundingSource("salary")}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all text-left flex flex-col gap-0.5 ${
                    fundingSource === "salary"
                      ? "bg-[#8B0000] text-white shadow-xs"
                      : "bg-white text-slate-700 border border-[#FFD9D9] hover:text-[#8B0000]"
                  }`}
                >
                  <span>💰 Dari Uang Gaji</span>
                  <span
                    className={`text-[10px] font-normal ${
                      fundingSource === "salary" ? "text-[#FFD9D9]" : "text-slate-400"
                    }`}
                  >
                    Dipotong dari sisa gaji
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setFundingSource("external")}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all text-left flex flex-col gap-0.5 ${
                    fundingSource === "external"
                      ? "bg-[#8B0000] text-white shadow-xs"
                      : "bg-white text-slate-700 border border-[#FFD9D9] hover:text-[#8B0000]"
                  }`}
                >
                  <span>🌱 Di Luar Gaji / Dana Lain</span>
                  <span
                    className={`text-[10px] font-normal ${
                      fundingSource === "external" ? "text-[#FFD9D9]" : "text-slate-400"
                    }`}
                  >
                    Tidak mengurangi gaji
                  </span>
                </button>
              </div>
            </div>
          )}

          {activeType === "income" && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Sumber / Perusahaan
              </label>
              <input
                type="text"
                placeholder="Contoh: PT ABC, Klien Proyek Web, dsb."
                value={incomeSource}
                onChange={(e) => setIncomeSource(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FFF9F9] border border-[#FFD9D9] rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#8B0000]/40 focus:bg-white"
              />
            </div>
          )}

          {activeType === "savings" && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tujuan / Akun Tabungan
              </label>
              <input
                type="text"
                placeholder="Contoh: Sucorinvest Pasar Uang, Bank Jago Darurat, dll."
                value={savingsAccount}
                onChange={(e) => setSavingsAccount(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FFF9F9] border border-[#FFD9D9] rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#8B0000]/40 focus:bg-white"
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
              className="w-full px-3.5 py-2.5 bg-[#FFF9F9] border border-[#FFD9D9] rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#8B0000]/40 focus:bg-white"
            />
          </div>

          {successMsg && (
            <div className="flex items-center gap-2 p-3 bg-[#FFF0F0] border border-[#8B0000] rounded-xl text-[#8B0000] text-xs font-black animate-pulse">
              <CheckCircle2 className="w-4 h-4 text-[#8B0000]" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || parsedAmount <= 0}
              className={`w-full py-3.5 rounded-2xl font-black text-sm sm:text-base text-white shadow-lg transition-all active:scale-98 flex items-center justify-center gap-2 bg-gradient-to-r from-[#8B0000] via-[#A00000] to-[#700000] hover:from-[#700000] hover:to-[#8B0000] shadow-[#8B0000]/25 ${
                isSubmitting || parsedAmount <= 0 ? "opacity-60 cursor-not-allowed" : ""
              }`}
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Simpan Transaksi
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

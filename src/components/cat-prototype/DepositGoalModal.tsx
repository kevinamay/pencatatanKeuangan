"use client";

import React, { useState, useEffect } from "react";
import { X, PiggyBank, Coins, AlertCircle, Sparkles, CheckCircle2, Wallet } from "lucide-react";
import { FinancialGoal } from "@/types/finance";
import { FinanceStorage, formatRupiah } from "@/lib/storage";

interface DepositGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal: FinancialGoal | null;
  onSuccess?: () => void;
}

export const DepositGoalModal: React.FC<DepositGoalModalProps> = ({
  isOpen,
  onClose,
  goal,
  onSuccess,
}) => {
  const [amountStr, setAmountStr] = useState("");
  const [date, setDate] = useState("");
  const [fundingSource, setFundingSource] = useState<"salary" | "external">("salary");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (goal) {
      setAmountStr("");
      setDate(new Date().toISOString().split("T")[0]);
      setFundingSource("salary");
      setErrorMsg(null);
    }
  }, [goal, isOpen]);

  if (!isOpen || !goal) return null;

  const depositAmount = parseFloat(amountStr.replace(/[^0-9]/g, "")) || 0;
  const newCurrent = goal.currentAmount + depositAmount;
  const progressPercent = Math.min(100, Math.round((newCurrent / goal.targetAmount) * 100));
  const remaining = Math.max(0, goal.targetAmount - newCurrent);

  const handleQuickAdd = (add: number) => {
    const cur = parseFloat(amountStr.replace(/[^0-9]/g, "")) || 0;
    setAmountStr((cur + add).toString());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (depositAmount <= 0) {
      setErrorMsg("Nominal setoran harus lebih besar dari Rp 0.");
      return;
    }
    if (!date) {
      setErrorMsg("Tanggal setoran wajib diisi.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await FinanceStorage.depositToGoal(goal.id, depositAmount, date, fundingSource);
      onSuccess?.();
      onClose();
    } catch {
      setErrorMsg("Gagal memproses setoran celengan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl border border-[#E8E2D8] shadow-2xl max-w-md w-full p-6 sm:p-7 relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E8E2D8]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#FAF7F2] border border-[#E8E2D8] flex items-center justify-center text-xl">
              {goal.iconEmoji}
            </div>
            <div>
              <h3 className="text-base font-black text-stone-900">
                Setor ke Celengan Impian
              </h3>
              <p className="text-xs text-stone-500 line-clamp-1">
                Target: {goal.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-stone-100 flex items-center justify-center text-stone-400 hover:text-stone-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Target Info & Projected Progress */}
          <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#E8E2D8] space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-stone-600">Progres Celengan Saat Ini:</span>
              <span className="font-mono font-bold text-stone-900">
                {formatRupiah(goal.currentAmount)} / {formatRupiah(goal.targetAmount)}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2.5 bg-stone-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#854D0E] rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="flex justify-between items-center text-[11px] text-stone-500 font-medium">
              <span>Setelah setoran: <b className="text-[#854D0E]">{progressPercent}%</b></span>
              <span>Sisa: {formatRupiah(remaining)}</span>
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              Nominal yang Disetor (Rp) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="text-xs font-black text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2">
                Rp
              </span>
              <input
                type="text"
                required
                value={amountStr ? parseInt(amountStr, 10).toLocaleString("id-ID") : ""}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^0-9]/g, "");
                  setAmountStr(raw);
                }}
                placeholder="0"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E8E2D8] text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#854D0E]/20 focus:border-[#854D0E] bg-[#FAF7F2]/50 text-stone-900"
              />
            </div>
          </div>

          {/* Quick Amount Chips */}
          <div className="flex flex-wrap gap-1.5">
            {[100000, 250000, 500000, 1000000].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => handleQuickAdd(val)}
                className="px-2.5 py-1 rounded-lg border border-[#E8E2D8] bg-white text-[11px] font-bold text-stone-700 hover:bg-stone-50 active:scale-95 transition-all"
              >
                +{val >= 1000000 ? `${val / 1000000}jt` : `${val / 1000}rb`}
              </button>
            ))}
          </div>

          {/* Funding Source Selector */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              Sumber Dana Setoran
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFundingSource("salary")}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all text-left flex items-center gap-2 ${
                  fundingSource === "salary"
                    ? "bg-[#FAF7F2] border-[#854D0E] text-[#854D0E]"
                    : "bg-white border-[#E8E2D8] text-stone-600 hover:bg-stone-50"
                }`}
              >
                <Coins className="w-3.5 h-3.5 flex-shrink-0" />
                <div>
                  <span className="block font-black">Dari Gaji</span>
                  <span className="text-[10px] text-stone-400 font-normal">Memotong sisa gaji</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFundingSource("external")}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all text-left flex items-center gap-2 ${
                  fundingSource === "external"
                    ? "bg-[#FAF7F2] border-[#854D0E] text-[#854D0E]"
                    : "bg-white border-[#E8E2D8] text-stone-600 hover:bg-stone-50"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 flex-shrink-0 text-amber-600" />
                <div>
                  <span className="block font-black">Luar Gaji</span>
                  <span className="text-[10px] text-stone-400 font-normal">Bonus / THR / Lepas</span>
                </div>
              </button>
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              Tanggal Transaksi
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#E8E2D8] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#854D0E]/20 focus:border-[#854D0E] bg-[#FAF7F2]/50 text-stone-900"
            />
          </div>

          {/* Submit Actions */}
          <div className="pt-3 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-[#E8E2D8] text-xs font-bold text-stone-600 hover:bg-stone-100 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-[#854D0E] hover:bg-[#713F12] text-white text-xs font-bold shadow-xs active:scale-95 transition-all flex items-center gap-1.5"
            >
              <PiggyBank className="w-4 h-4" />
              <span>{isSubmitting ? "Menyimpan..." : "Setor Tabungan"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

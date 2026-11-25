"use client";

import React, { useState, useEffect } from "react";
import { X, CheckCircle2, AlertCircle, Calendar, ArrowRight, ShieldCheck, Wallet } from "lucide-react";
import { PlannedItem } from "@/types/finance";
import { FinanceStorage, formatRupiah } from "@/lib/storage";

interface ExecutePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: PlannedItem | null;
  currentBalance: number;
  onSuccess?: () => void;
}

export const ExecutePaymentModal: React.FC<ExecutePaymentModalProps> = ({
  isOpen,
  onClose,
  item,
  currentBalance,
  onSuccess,
}) => {
  const [actualAmountStr, setActualAmountStr] = useState("");
  const [paidDate, setPaidDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (item) {
      setActualAmountStr(item.estimatedAmount.toString());
      setPaidDate(new Date().toISOString().split("T")[0]);
      setErrorMsg(null);
    }
  }, [item, isOpen]);

  if (!isOpen || !item) return null;

  const actualAmount = parseFloat(actualAmountStr.replace(/[^0-9]/g, "")) || 0;
  const projectedRemainingBalance = currentBalance - actualAmount;
  const isDeficit = projectedRemainingBalance < 0;

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (actualAmount <= 0) {
      setErrorMsg("Nominal pembayaran riil harus lebih besar dari Rp 0.");
      return;
    }
    if (!paidDate) {
      setErrorMsg("Tanggal pembayaran wajib diisi.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await FinanceStorage.executePlannedPayment(item.id, actualAmount, paidDate);
      onSuccess?.();
      onClose();
    } catch {
      setErrorMsg("Terjadi kendala saat memproses pembayaran.");
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
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center text-lg">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-stone-900">
                Eksekusi Pembayaran Wacana
              </h3>
              <p className="text-xs text-stone-500">
                Konfirmasi transaksi untuk memotong saldo kas
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

        <form onSubmit={handleConfirm} className="mt-5 space-y-4">
          {/* Target Item Card */}
          <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#E8E2D8] space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
              Barang / Tagihan Yang Dibayar
            </span>
            <div className="flex items-center justify-between">
              <span className="text-sm font-black text-stone-800">{item.title}</span>
              <span className="text-xs font-mono font-bold text-stone-600">
                Est: {formatRupiah(item.estimatedAmount)}
              </span>
            </div>
            <span className="text-[11px] text-stone-400 block">
              Kategori: {item.category}
            </span>
          </div>

          {/* Actual Price Input */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              Nominal Riil Dibayarkan (Rp) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="text-xs font-black text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2">
                Rp
              </span>
              <input
                type="text"
                required
                value={actualAmountStr ? parseInt(actualAmountStr, 10).toLocaleString("id-ID") : ""}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^0-9]/g, "");
                  setActualAmountStr(raw);
                }}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E8E2D8] text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#854D0E]/20 focus:border-[#854D0E] bg-[#FAF7F2]/50 text-stone-900"
              />
            </div>
            <span className="text-[10px] text-stone-400 mt-1 block">
              Bisa diubah jika harga toko/ongkir/diskon berbeda dari estimasi awal.
            </span>
          </div>

          {/* Paid Date */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              Tanggal Transaksi Pembayaran
            </label>
            <input
              type="date"
              required
              value={paidDate}
              onChange={(e) => setPaidDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#E8E2D8] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#854D0E]/20 focus:border-[#854D0E] bg-[#FAF7F2]/50 text-stone-900"
            />
          </div>

          {/* Balance Impact Simulation */}
          <div
            className={`p-3.5 rounded-2xl border space-y-2 text-xs ${
              isDeficit ? "bg-rose-50 border-rose-200" : "bg-emerald-50/50 border-emerald-200"
            }`}
          >
            <div className="flex items-center justify-between text-stone-600 font-semibold">
              <span className="flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5 text-stone-500" />
                Sisa Saldo Kas Saat Ini:
              </span>
              <span className="font-mono font-bold">{formatRupiah(currentBalance)}</span>
            </div>

            <div className="flex items-center justify-between text-rose-700 font-semibold">
              <span>Pengeluaran Ini:</span>
              <span className="font-mono font-bold">- {formatRupiah(actualAmount)}</span>
            </div>

            <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between font-black">
              <span className={isDeficit ? "text-rose-800" : "text-emerald-800"}>
                Simulasi Sisa Saldo:
              </span>
              <span
                className={`font-mono text-sm ${
                  isDeficit ? "text-rose-600" : "text-emerald-700"
                }`}
              >
                {formatRupiah(projectedRemainingBalance)}
              </span>
            </div>
            {isDeficit && (
              <p className="text-[10px] text-rose-600">
                ⚠️ Peringatan: Pembayaran ini akan menyebabkan defisit kas bulan ini.
              </p>
            )}
          </div>

          {/* Actions */}
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
              className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black shadow-md active:scale-95 transition-all flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? "Memproses..." : "Potong Saldo & Lunas"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

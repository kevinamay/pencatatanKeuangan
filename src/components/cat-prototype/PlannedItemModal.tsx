"use client";

import React, { useState, useEffect } from "react";
import { X, Sparkles, AlertCircle, ShoppingBag, Tag, Calendar, HelpCircle } from "lucide-react";
import { PlannedItem, PlannedItemUrgency, ExpenseCategory } from "@/types/finance";
import { FinanceStorage, formatRupiah } from "@/lib/storage";

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  "Makan & Minuman",
  "Tagihan & Utilitas",
  "Belanja Bulanan",
  "Transportasi",
  "Tempat Tinggal (Sewa/KPR)",
  "Hiburan & Gaya Hidup",
  "Kesehatan & Asuransi",
  "Pendidikan",
  "Cicilan & Utang",
  "Keluarga & Donasi",
  "Lainnya",
];

interface PlannedItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMonth: string;
  initialItem?: PlannedItem | null;
  onSuccess?: () => void;
}

export const PlannedItemModal: React.FC<PlannedItemModalProps> = ({
  isOpen,
  onClose,
  selectedMonth,
  initialItem,
  onSuccess,
}) => {
  const [title, setTitle] = useState("");
  const [amountStr, setAmountStr] = useState("");
  const [category, setCategory] = useState<ExpenseCategory>("Belanja Bulanan");
  const [urgency, setUrgency] = useState<PlannedItemUrgency>("keinginan");
  const [targetMonth, setTargetMonth] = useState(selectedMonth);
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (initialItem) {
      setTitle(initialItem.title);
      setAmountStr(initialItem.estimatedAmount.toString());
      setCategory(initialItem.category);
      setUrgency(initialItem.urgency);
      setTargetMonth(initialItem.targetMonth || selectedMonth);
      setNote(initialItem.note || "");
    } else {
      setTitle("");
      setAmountStr("");
      setCategory("Belanja Bulanan");
      setUrgency("keinginan");
      setTargetMonth(selectedMonth);
      setNote("");
    }
    setErrorMsg(null);
  }, [initialItem, selectedMonth, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanAmount = parseFloat(amountStr.replace(/[^0-9]/g, ""));
    if (!title.trim()) {
      setErrorMsg("Nama barang atau tagihan wacana wajib diisi.");
      return;
    }
    if (!cleanAmount || cleanAmount <= 0) {
      setErrorMsg("Estimasi nominal harus lebih besar dari Rp 0.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      if (initialItem) {
        await FinanceStorage.updatePlannedItem(initialItem.id, {
          title: title.trim(),
          estimatedAmount: cleanAmount,
          category,
          urgency,
          targetMonth,
          note: note.trim(),
        });
      } else {
        await FinanceStorage.addPlannedItem({
          title: title.trim(),
          estimatedAmount: cleanAmount,
          category,
          urgency,
          targetMonth,
          note: note.trim(),
        });
      }

      onSuccess?.();
      onClose();
    } catch {
      setErrorMsg("Gagal menyimpan rencana wacana. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, "");
    setAmountStr(raw);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl border border-[#E8E2D8] shadow-2xl max-w-lg w-full p-6 sm:p-7 relative overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E8E2D8]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#FAF7F2] border border-[#E8E2D8] flex items-center justify-center text-lg">
              📝
            </div>
            <div>
              <h3 className="text-base font-black text-stone-900">
                {initialItem ? "Edit Wacana Belanja" : "Tambah Wacana Belanja / Tagihan"}
              </h3>
              <p className="text-xs text-stone-500">
                Belum memotong saldo. Menjadi pengeluaran saat Anda centang nanti.
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
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              Nama Barang / Tagihan Wacana <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <ShoppingBag className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Sepatu Olahraga Baru, Service Motor, Wifi"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E8E2D8] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#854D0E]/20 focus:border-[#854D0E] bg-[#FAF7F2]/50 text-stone-900"
              />
            </div>
          </div>

          {/* Estimated Amount */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              Estimasi Nominal Harga (Rp) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="text-xs font-black text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2">
                Rp
              </span>
              <input
                type="text"
                required
                value={amountStr ? parseInt(amountStr, 10).toLocaleString("id-ID") : ""}
                onChange={handleAmountChange}
                placeholder="0"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E8E2D8] text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#854D0E]/20 focus:border-[#854D0E] bg-[#FAF7F2]/50 text-stone-900"
              />
            </div>
            {amountStr && (
              <span className="text-[11px] text-[#854D0E] font-medium mt-1 block">
                Estimasi: {formatRupiah(parseInt(amountStr, 10))}
              </span>
            )}
          </div>

          {/* Category & Month */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Kategori
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                className="w-full px-3 py-2.5 rounded-xl border border-[#E8E2D8] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#854D0E]/20 focus:border-[#854D0E] bg-[#FAF7F2]/50 text-stone-900"
              >
                {EXPENSE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Bulan Rencana
              </label>
              <input
                type="month"
                value={targetMonth}
                onChange={(e) => setTargetMonth(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E8E2D8] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#854D0E]/20 focus:border-[#854D0E] bg-[#FAF7F2]/50 text-stone-900"
              />
            </div>
          </div>

          {/* Urgency Radio Selector */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              Tingkat Urgensi / Prioritas
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setUrgency("penting")}
                className={`py-2 px-2.5 rounded-xl border text-center transition-all text-xs font-bold flex flex-col items-center gap-1 ${
                  urgency === "penting"
                    ? "bg-rose-50 border-rose-300 text-rose-800 shadow-2xs"
                    : "bg-white border-[#E8E2D8] text-stone-500 hover:bg-stone-50"
                }`}
              >
                <span>🔴 Penting</span>
                <span className="text-[10px] font-normal text-stone-400">Wajib Dibayar</span>
              </button>

              <button
                type="button"
                onClick={() => setUrgency("keinginan")}
                className={`py-2 px-2.5 rounded-xl border text-center transition-all text-xs font-bold flex flex-col items-center gap-1 ${
                  urgency === "keinginan"
                    ? "bg-amber-50 border-amber-300 text-amber-900 shadow-2xs"
                    : "bg-white border-[#E8E2D8] text-stone-500 hover:bg-stone-50"
                }`}
              >
                <span>🟡 Keinginan</span>
                <span className="text-[10px] font-normal text-stone-400">Wishlist Impian</span>
              </button>

              <button
                type="button"
                onClick={() => setUrgency("santai")}
                className={`py-2 px-2.5 rounded-xl border text-center transition-all text-xs font-bold flex flex-col items-center gap-1 ${
                  urgency === "santai"
                    ? "bg-emerald-50 border-emerald-300 text-emerald-800 shadow-2xs"
                    : "bg-white border-[#E8E2D8] text-stone-500 hover:bg-stone-50"
                }`}
              >
                <span>🟢 Santai</span>
                <span className="text-[10px] font-normal text-stone-400">Kapan-kapan</span>
              </button>
            </div>
          </div>

          {/* Optional Note */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              Catatan Tambahan (Opsional)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Contoh: Tunggu diskon promo tanggal kembar, link tokped..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E2D8] text-xs focus:outline-none focus:ring-2 focus:ring-[#854D0E]/20 focus:border-[#854D0E] bg-[#FAF7F2]/50 text-stone-900"
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
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isSubmitting ? "Menyimpan..." : initialItem ? "Perbarui Wacana" : "Simpan Wacana"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

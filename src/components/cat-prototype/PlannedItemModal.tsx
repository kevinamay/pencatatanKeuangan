"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Sparkles,
  AlertCircle,
  ShoppingBag,
  PiggyBank,
  Tag,
  Calendar,
  Target,
  TrendingUp,
  Shield,
  HelpCircle,
} from "lucide-react";
import {
  PlannedItem,
  PlannedItemUrgency,
  ExpenseCategory,
  FinancialGoal,
  MoneyMarketProduct,
  SavingsTargetType,
} from "@/types/finance";
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
  goals?: FinancialGoal[];
  moneyMarket?: MoneyMarketProduct[];
  onSuccess?: () => void;
}

export const PlannedItemModal: React.FC<PlannedItemModalProps> = ({
  isOpen,
  onClose,
  selectedMonth,
  initialItem,
  goals = [],
  moneyMarket = [],
  onSuccess,
}) => {
  const [itemType, setItemType] = useState<"expense" | "savings">("expense");
  const [title, setTitle] = useState("");
  const [amountStr, setAmountStr] = useState("");
  const [category, setCategory] = useState<ExpenseCategory | "Tabungan & Investasi">("Belanja Bulanan");
  const [urgency, setUrgency] = useState<PlannedItemUrgency>("keinginan");
  const [targetMonth, setTargetMonth] = useState(selectedMonth);
  const [note, setNote] = useState("");

  // Savings specific options
  const [savingsTargetType, setSavingsTargetType] = useState<SavingsTargetType>("regular");
  const [selectedGoalId, setSelectedGoalId] = useState<string>("none");
  const [selectedMMId, setSelectedMMId] = useState<string>("none");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (initialItem) {
      setTitle(initialItem.title);
      setAmountStr(initialItem.estimatedAmount.toString());
      const isSav =
        initialItem.itemType === "savings" ||
        initialItem.category === "Tabungan & Investasi" ||
        /menabung|tabung|nabung|investasi|celengan|pasar uang/i.test(initialItem.title);
      setItemType(isSav ? "savings" : "expense");
      setCategory(initialItem.category);
      setUrgency(initialItem.urgency);
      setTargetMonth(initialItem.targetMonth || selectedMonth);
      setNote(initialItem.note || "");
      setSavingsTargetType(initialItem.savingsTargetType || "regular");
      setSelectedGoalId(initialItem.goalId || "none");
      setSelectedMMId(initialItem.moneyMarketId || "none");
    } else {
      setTitle("");
      setAmountStr("");
      setItemType("expense");
      setCategory("Belanja Bulanan");
      setUrgency("keinginan");
      setTargetMonth(selectedMonth);
      setNote("");
      setSavingsTargetType("regular");
      setSelectedGoalId("none");
      setSelectedMMId("none");
    }
    setErrorMsg(null);
  }, [initialItem, selectedMonth, isOpen]);

  if (!isOpen) return null;

  // Handle title change with smart auto-detection
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    if (!initialItem) {
      if (/menabung|tabung|nabung|investasi|celengan|pasar uang/i.test(newTitle)) {
        setItemType("savings");
        setCategory("Tabungan & Investasi");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanAmount = parseFloat(amountStr.replace(/[^0-9]/g, ""));
    if (!title.trim()) {
      setErrorMsg("Nama wacana wajib diisi.");
      return;
    }
    if (!cleanAmount || cleanAmount <= 0) {
      setErrorMsg("Estimasi nominal harus lebih besar dari Rp 0.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const finalCategory = itemType === "savings" ? "Tabungan & Investasi" : category;
      const targetGoal = itemType === "savings" && selectedGoalId !== "none" ? selectedGoalId : undefined;
      const targetMM = itemType === "savings" && selectedMMId !== "none" ? selectedMMId : undefined;

      if (initialItem) {
        await FinanceStorage.updatePlannedItem(initialItem.id, {
          title: title.trim(),
          estimatedAmount: cleanAmount,
          category: finalCategory,
          urgency,
          targetMonth,
          note: note.trim(),
          itemType,
          savingsTargetType: itemType === "savings" ? savingsTargetType : undefined,
          goalId: targetGoal,
          moneyMarketId: targetMM,
        });
      } else {
        await FinanceStorage.addPlannedItem({
          title: title.trim(),
          estimatedAmount: cleanAmount,
          category: finalCategory,
          urgency,
          targetMonth,
          note: note.trim(),
          itemType,
          savingsTargetType: itemType === "savings" ? savingsTargetType : undefined,
          goalId: targetGoal,
          moneyMarketId: targetMM,
        });
      }

      onSuccess?.();
      onClose();
    } catch {
      setErrorMsg("Gagal menyimpan wacana. Silakan coba lagi.");
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
      <div className="bg-white rounded-3xl border border-[#E8E2D8] shadow-2xl max-w-lg w-full p-6 sm:p-7 relative overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E8E2D8]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#FAF7F2] border border-[#E8E2D8] flex items-center justify-center text-lg">
              {itemType === "savings" ? "💰" : "🛍️"}
            </div>
            <div>
              <h3 className="text-base font-black text-stone-900">
                {initialItem
                  ? "Edit Wacana"
                  : itemType === "savings"
                  ? "Rencana Alokasi Tabungan"
                  : "Tambah Wacana Belanja & Tagihan"}
              </h3>
              <p className="text-xs text-stone-500">
                Belum memotong saldo kas. Diproses saat Anda mencentang tombol hijau.
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
          {/* 1. Switcher: Belanja vs Tabungan */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              Jenis Rencana Wacana
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-[#FAF7F2] border border-[#E8E2D8]">
              <button
                type="button"
                onClick={() => {
                  setItemType("expense");
                  if (category === "Tabungan & Investasi") setCategory("Belanja Bulanan");
                }}
                className={`py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                  itemType === "expense"
                    ? "bg-white text-stone-900 shadow-2xs border border-[#E8E2D8]"
                    : "text-stone-500 hover:text-stone-800"
                }`}
              >
                <ShoppingBag className="w-4 h-4 text-amber-600" />
                <span>🛍️ Belanja / Tagihan</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setItemType("savings");
                  setCategory("Tabungan & Investasi");
                }}
                className={`py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                  itemType === "savings"
                    ? "bg-emerald-50 text-emerald-800 shadow-2xs border border-emerald-300"
                    : "text-stone-500 hover:text-emerald-700"
                }`}
              >
                <PiggyBank className="w-4 h-4 text-emerald-600" />
                <span>💰 Alokasi Tabungan</span>
              </button>
            </div>
            {itemType === "savings" && (
              <p className="text-[11px] text-emerald-700 font-semibold mt-1.5 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                Saat dicentang nanti, otomatis masuk ke <b>Halaman Tabungan & Celengan</b> dan memotong kas utama (gaji).
              </p>
            )}
          </div>

          {/* 2. Title Input */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              {itemType === "savings" ? "Nama Tabungan / Tujuan" : "Nama Barang / Tagihan"}{" "}
              <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder={
                itemType === "savings"
                  ? "Contoh: Menabung 2 Juta, Tabungan Liburan, Nabung Bibit"
                  : "Contoh: Headphone Bluetooth, Servis Motor, Beli Sepatu"
              }
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E2D8] text-sm focus:outline-none focus:ring-2 focus:ring-[#854D0E]/20 focus:border-[#854D0E] bg-[#FAF7F2]/50 text-stone-900 font-medium placeholder:text-stone-400"
            />
          </div>

          {/* 3. Estimated Amount */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              Estimasi Nominal (Rp) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="text-xs font-black text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2">
                Rp
              </span>
              <input
                type="text"
                required
                placeholder="0"
                value={amountStr ? parseInt(amountStr, 10).toLocaleString("id-ID") : ""}
                onChange={handleAmountChange}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E8E2D8] text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#854D0E]/20 focus:border-[#854D0E] bg-[#FAF7F2]/50 text-stone-900"
              />
            </div>
          </div>

          {/* 4. Target Alokasi Tabungan (Jika jenis Tabungan) */}
          {itemType === "savings" ? (
            <div className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-3">
              <div>
                <label className="block text-xs font-bold text-emerald-900 mb-1">
                  Pilih Tujuan Tabungan
                </label>
                <select
                  value={savingsTargetType}
                  onChange={(e) => setSavingsTargetType(e.target.value as SavingsTargetType)}
                  className="w-full px-3 py-2 rounded-xl border border-emerald-300 text-xs font-bold bg-white text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                >
                  <option value="regular">🏦 Tabungan Reguler / Bank Utama</option>
                  <option value="goal">🎯 Hubungkan ke Celengan Impian</option>
                  <option value="money_market">📈 Portofolio Tabungan Pasar Uang</option>
                  <option value="emergency">🛡️ Dana Darurat</option>
                </select>
              </div>

              {/* Pilih Celengan Impian jika targetType === "goal" */}
              {savingsTargetType === "goal" && goals.length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-emerald-900 mb-1">
                    Pilih Celengan Impian:
                  </label>
                  <select
                    value={selectedGoalId}
                    onChange={(e) => setSelectedGoalId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-emerald-300 text-xs font-bold bg-white text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  >
                    <option value="none">-- Pilih Celengan Impian --</option>
                    {goals.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.title} (Target: {formatRupiah(g.targetAmount)})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Pilih Pasar Uang jika targetType === "money_market" */}
              {savingsTargetType === "money_market" && moneyMarket.length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-emerald-900 mb-1">
                    Pilih Produk Pasar Uang:
                  </label>
                  <select
                    value={selectedMMId}
                    onChange={(e) => setSelectedMMId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-emerald-300 text-xs font-bold bg-white text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  >
                    <option value="none">-- Pilih Produk Pasar Uang --</option>
                    {moneyMarket.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.platform})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          ) : (
            /* 4. Kategori Belanja jika jenis Pengeluaran */
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Kategori Pengeluaran
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E2D8] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#854D0E]/20 focus:border-[#854D0E] bg-[#FAF7F2]/50 text-stone-900"
              >
                {EXPENSE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 5. Urgency & Target Month */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Tingkat Urgensi
              </label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as PlannedItemUrgency)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E2D8] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#854D0E]/20 focus:border-[#854D0E] bg-[#FAF7F2]/50 text-stone-900"
              >
                <option value="penting">🔴 Penting / Prioritas Utama</option>
                <option value="keinginan">🟡 Wishlist Impian</option>
                <option value="santai">🟢 Santai / Opsional</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Target Bulan
              </label>
              <input
                type="month"
                value={targetMonth}
                onChange={(e) => setTargetMonth(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E2D8] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#854D0E]/20 focus:border-[#854D0E] bg-[#FAF7F2]/50 text-stone-900"
              />
            </div>
          </div>

          {/* 6. Note */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              Catatan Tambahan (Opsional)
            </label>
            <textarea
              rows={2}
              placeholder="Misal: Link toko online, spesifikasi barang, atau alasan menabung..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-[#E8E2D8] text-xs focus:outline-none focus:ring-2 focus:ring-[#854D0E]/20 focus:border-[#854D0E] bg-[#FAF7F2]/50 text-stone-900 placeholder:text-stone-400"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-[#E8E2D8]">
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
              className={`px-5 py-2.5 rounded-xl text-white text-xs font-black shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5 ${
                itemType === "savings" ? "bg-emerald-700" : "bg-[#854D0E]"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                {isSubmitting
                  ? "Menyimpan..."
                  : initialItem
                  ? "Perbarui Wacana"
                  : itemType === "savings"
                  ? "Simpan Rencana Tabungan"
                  : "Simpan Wacana"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

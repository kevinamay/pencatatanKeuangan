"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Target,
  AlertCircle,
  Sparkles,
  Link2,
  TrendingUp,
} from "lucide-react";
import { FinancialGoal, GoalCategory, MoneyMarketProduct } from "@/types/finance";
import { FinanceStorage, formatRupiah } from "@/lib/storage";

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialGoal?: FinancialGoal | null;
  onSuccess?: () => void;
}

const GOAL_CATEGORIES: Array<{ id: GoalCategory; label: string }> = [
  { id: "gadget", label: "Gadget & Elektronik" },
  { id: "liburan", label: "Liburan & Healing" },
  { id: "darurat", label: "Dana Darurat" },
  { id: "kendaraan", label: "Kendaraan (Motor/Mobil)" },
  { id: "rumah", label: "Rumah / Renovasi" },
  { id: "pendidikan", label: "Pendidikan & Kursus" },
  { id: "investasi", label: "Modal Usaha / Investasi" },
  { id: "lainnya", label: "Lainnya" },
];

export const GoalModal: React.FC<GoalModalProps> = ({
  isOpen,
  onClose,
  initialGoal,
  onSuccess,
}) => {
  const [title, setTitle] = useState("");
  const [targetAmountStr, setTargetAmountStr] = useState("");
  const [currentAmountStr, setCurrentAmountStr] = useState("0");
  const [targetDate, setTargetDate] = useState("");
  const [category, setCategory] = useState<GoalCategory>("gadget");
  const [note, setNote] = useState("");
  const [linkedSelection, setLinkedSelection] = useState<string>("none");

  const [availableMM, setAvailableMM] = useState<MoneyMarketProduct[]>([]);
  const [availableAccounts, setAvailableAccounts] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Ambil daftar produk pasar uang & tabungan yang ada
      const mmList = FinanceStorage.getMoneyMarket().filter(
        (m) => m && m.name && m.name.trim() !== "" && m.name !== "-"
      );
      setAvailableMM(mmList);

      const savings = FinanceStorage.getSavings();
      const accounts = Array.from(
        new Set(
          savings
            .map((s) => s.accountName)
            .filter((name): name is string => Boolean(name && name.trim()))
        )
      );
      setAvailableAccounts(accounts);

      if (initialGoal) {
        setTitle(initialGoal.title);
        setTargetAmountStr(initialGoal.targetAmount.toString());
        setCurrentAmountStr(initialGoal.currentAmount.toString());
        setTargetDate(initialGoal.targetDate || "");
        setCategory(initialGoal.category);
        setNote(initialGoal.note || "");

        if (initialGoal.linkedMoneyMarketId) {
          setLinkedSelection(`mm:${initialGoal.linkedMoneyMarketId}`);
        } else if (initialGoal.linkedAccountName) {
          const found = mmList.find((m) => m.name === initialGoal.linkedAccountName);
          if (found) {
            setLinkedSelection(`mm:${found.id}`);
          } else {
            setLinkedSelection(`acc:${initialGoal.linkedAccountName}`);
          }
        } else {
          setLinkedSelection("none");
        }
      } else {
        setTitle("");
        setTargetAmountStr("");
        setCurrentAmountStr("0");
        // Default target date: 6 months ahead
        const future = new Date();
        future.setMonth(future.getMonth() + 6);
        setTargetDate(future.toISOString().slice(0, 7));
        setCategory("rumah");
        setNote("");

        // Default: jika sudah ada produk pasar uang, tawarkan untuk langsung dihubungkan
        if (mmList.length > 0) {
          setLinkedSelection(`mm:${mmList[0].id}`);
        } else {
          setLinkedSelection("none");
        }
      }
      setErrorMsg(null);
    }
  }, [initialGoal, isOpen]);

  if (!isOpen) return null;

  const selectedMM = linkedSelection.startsWith("mm:")
    ? availableMM.find((m) => m.id === linkedSelection.replace("mm:", ""))
    : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTarget = parseFloat(targetAmountStr.replace(/[^0-9]/g, ""));
    const cleanCurrent = parseFloat(currentAmountStr.replace(/[^0-9]/g, "")) || 0;

    if (!title.trim()) {
      setErrorMsg("Nama impian wajib diisi.");
      return;
    }
    if (!cleanTarget || cleanTarget <= 0) {
      setErrorMsg("Target nominal impian harus lebih besar dari Rp 0.");
      return;
    }
    if (!targetDate) {
      setErrorMsg("Bulan target pencapaian wajib dipilih.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    let linkedMMId: string | undefined = undefined;
    let linkedAccName: string | undefined = undefined;

    if (linkedSelection.startsWith("mm:")) {
      linkedMMId = linkedSelection.replace("mm:", "");
      const found = availableMM.find((m) => m.id === linkedMMId);
      linkedAccName = found?.name;
    } else if (linkedSelection.startsWith("acc:")) {
      linkedAccName = linkedSelection.replace("acc:", "");
    }

    try {
      if (initialGoal) {
        await FinanceStorage.updateGoal(initialGoal.id, {
          title: title.trim(),
          targetAmount: cleanTarget,
          currentAmount: cleanCurrent,
          targetDate,
          category,
          iconEmoji: "🎯",
          note: note.trim(),
          linkedMoneyMarketId: linkedMMId,
          linkedAccountName: linkedAccName,
        });
      } else {
        await FinanceStorage.addGoal({
          title: title.trim(),
          targetAmount: cleanTarget,
          currentAmount: cleanCurrent,
          targetDate,
          category,
          iconEmoji: "🎯",
          note: note.trim(),
          linkedMoneyMarketId: linkedMMId,
          linkedAccountName: linkedAccName,
        });
      }

      onSuccess?.();
      onClose();
    } catch {
      setErrorMsg("Gagal menyimpan celengan impian. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl border border-[#E8E2D8] shadow-2xl max-w-lg w-full p-6 sm:p-7 relative overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E8E2D8]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#FAF7F2] border border-[#E8E2D8] text-[#854D0E] flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-stone-900">
                {initialGoal ? "Edit Celengan Impian" : "Buat Celengan Impian Baru"}
              </h3>
              <p className="text-xs text-stone-500">
                Tetapkan target tabungan berjangka & hubungkan ke portofolio Anda.
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
              Nama Impian / Target Tabungan <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Renovasi Rumah, MacBook Pro M3, Dana Darurat"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E2D8] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#854D0E]/20 focus:border-[#854D0E] bg-[#FAF7F2]/50 text-stone-900"
            />
          </div>

          {/* Target Amount */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              Target Dana yang Ingin Dicapai (Rp) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="text-xs font-black text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2">
                Rp
              </span>
              <input
                type="text"
                required
                value={targetAmountStr ? parseInt(targetAmountStr, 10).toLocaleString("id-ID") : ""}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^0-9]/g, "");
                  setTargetAmountStr(raw);
                }}
                placeholder="0"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E8E2D8] text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#854D0E]/20 focus:border-[#854D0E] bg-[#FAF7F2]/50 text-stone-900"
              />
            </div>
            {targetAmountStr && (
              <span className="text-[11px] text-[#854D0E] font-medium mt-1 block">
                Target: {formatRupiah(parseInt(targetAmountStr, 10))}
              </span>
            )}
          </div>

          {/* Category & Target Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Kategori Impian
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as GoalCategory)}
                className="w-full px-3 py-2.5 rounded-xl border border-[#E8E2D8] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#854D0E]/20 focus:border-[#854D0E] bg-[#FAF7F2]/50 text-stone-900"
              >
                {GOAL_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Target Selesai (Bulan) <span className="text-rose-500">*</span>
              </label>
              <input
                type="month"
                required
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E8E2D8] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#854D0E]/20 focus:border-[#854D0E] bg-[#FAF7F2]/50 text-stone-900"
              />
            </div>
          </div>

          {/* Hubungkan ke Tabungan / Pasar Uang yang Ada */}
          <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#E8E2D8] space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-stone-800">
              <Link2 className="w-4 h-4 text-[#854D0E]" />
              <span>Hubungkan ke Tabungan / Pasar Uang yang Ada</span>
            </div>

            <select
              value={linkedSelection}
              onChange={(e) => setLinkedSelection(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-[#E8E2D8] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#854D0E]/20 focus:border-[#854D0E] bg-white text-stone-900"
            >
              {availableMM.length > 0 && (
                <optgroup label="Portofolio Pasar Uang">
                  {availableMM.map((m) => (
                    <option key={m.id} value={`mm:${m.id}`}>
                      📈 {m.name} ({m.platform}) — Saldo: {formatRupiah(m.initialCapital)}
                    </option>
                  ))}
                </optgroup>
              )}

              {availableAccounts.length > 0 && (
                <optgroup label="Rekening Tabungan">
                  {availableAccounts.map((acc) => (
                    <option key={acc} value={`acc:${acc}`}>
                      🏦 {acc}
                    </option>
                  ))}
                </optgroup>
              )}

              <option value="none">🎯 Simpan di Celengan Mandiri (Tanpa Akun)</option>
            </select>

            {/* Quick button to adopt initial balance if MM has balance */}
            {selectedMM && selectedMM.initialCapital > 0 && (
              <div className="p-2.5 rounded-xl bg-white border border-[#E8E2D8] flex items-center justify-between text-xs gap-2">
                <span className="text-[11px] text-stone-600">
                  Tersedia saldo <b>{formatRupiah(selectedMM.initialCapital)}</b> di produk ini.
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentAmountStr(selectedMM.initialCapital.toString())}
                  className="px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-300 text-[#854D0E] font-bold text-[10px] hover:bg-amber-100 active:scale-95 transition-all flex-shrink-0"
                >
                  + Tautkan Saldo Ini
                </button>
              </div>
            )}
          </div>

          {/* Saldo Awal yang Sudah Terkumpul */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              Saldo Awal yang Sudah Terkumpul (Opsional)
            </label>
            <div className="relative">
              <span className="text-xs font-black text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2">
                Rp
              </span>
              <input
                type="text"
                value={
                  currentAmountStr && currentAmountStr !== "0"
                    ? parseInt(currentAmountStr, 10).toLocaleString("id-ID")
                    : ""
                }
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^0-9]/g, "");
                  setCurrentAmountStr(raw || "0");
                }}
                placeholder="0"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E8E2D8] text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#854D0E]/20 focus:border-[#854D0E] bg-[#FAF7F2]/50 text-stone-900"
              />
            </div>
          </div>

          {/* Optional Note */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              Catatan Impian (Opsional)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Contoh: Rencana renovasi dapur & ruang tamu..."
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
              <span>
                {isSubmitting
                  ? "Menyimpan..."
                  : initialGoal
                  ? "Perbarui Impian"
                  : "Simpan Celengan"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

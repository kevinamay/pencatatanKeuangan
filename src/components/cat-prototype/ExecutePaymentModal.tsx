"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  CheckCircle2,
  AlertCircle,
  Calendar,
  ArrowRight,
  ShieldCheck,
  Wallet,
  PiggyBank,
  ShoppingBag,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import {
  PlannedItem,
  FinancialGoal,
  MoneyMarketProduct,
  SavingsTargetType,
} from "@/types/finance";
import { FinanceStorage, formatRupiah } from "@/lib/storage";

interface ExecutePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: PlannedItem | null;
  currentBalance: number;
  goals?: FinancialGoal[];
  moneyMarket?: MoneyMarketProduct[];
  onSuccess?: () => void;
}

export const ExecutePaymentModal: React.FC<ExecutePaymentModalProps> = ({
  isOpen,
  onClose,
  item,
  currentBalance,
  goals = [],
  moneyMarket = [],
  onSuccess,
}) => {
  const [actualAmountStr, setActualAmountStr] = useState("");
  const [paidDate, setPaidDate] = useState("");
  const [isSavingsMode, setIsSavingsMode] = useState(false);
  const [savingsTargetType, setSavingsTargetType] = useState<SavingsTargetType>("regular");
  const [selectedGoalId, setSelectedGoalId] = useState<string>("none");
  const [selectedMMId, setSelectedMMId] = useState<string>("none");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (item) {
      setActualAmountStr(item.estimatedAmount.toString());
      setPaidDate(new Date().toISOString().split("T")[0]);
      setErrorMsg(null);

      // Auto detect if this is a saving
      const isSav =
        item.itemType === "savings" ||
        item.category === "Tabungan & Investasi" ||
        /menabung|tabung|nabung|investasi|celengan|pasar uang/i.test(item.title);

      setIsSavingsMode(isSav);
      setSavingsTargetType(item.savingsTargetType || "regular");
      setSelectedGoalId(item.goalId || "none");
      setSelectedMMId(item.moneyMarketId || "none");
    }
  }, [item, isOpen]);

  if (!isOpen || !item) return null;

  const actualAmount = parseFloat(actualAmountStr.replace(/[^0-9]/g, "")) || 0;
  const projectedRemainingBalance = currentBalance - actualAmount;
  const isDeficit = projectedRemainingBalance < 0;

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (actualAmount <= 0) {
      setErrorMsg("Nominal riil harus lebih besar dari Rp 0.");
      return;
    }
    if (!paidDate) {
      setErrorMsg("Tanggal transaksi wajib diisi.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await FinanceStorage.executePlannedPayment(
        item.id,
        actualAmount,
        paidDate,
        {
          overrideType: isSavingsMode ? "savings" : "expense",
          savingsTargetType: isSavingsMode ? savingsTargetType : undefined,
          goalId: isSavingsMode && selectedGoalId !== "none" ? selectedGoalId : undefined,
          moneyMarketId: isSavingsMode && selectedMMId !== "none" ? selectedMMId : undefined,
        }
      );

      onSuccess?.();
      onClose();
    } catch {
      setErrorMsg("Terjadi kendala saat memproses eksekusi transaksi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl border border-[#E8E2D8] shadow-2xl max-w-md w-full p-6 sm:p-7 relative overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E8E2D8]">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg border ${
                isSavingsMode
                  ? "bg-emerald-50 border-emerald-200 text-emerald-600"
                  : "bg-amber-50 border-amber-200 text-amber-700"
              }`}
            >
              {isSavingsMode ? <PiggyBank className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-black text-stone-900">
                {isSavingsMode ? "Realisasikan Tabungan" : "Eksekusi Pembayaran Wacana"}
              </h3>
              <p className="text-xs text-stone-500">
                {isSavingsMode
                  ? "Memotong kas utama & masuk ke Halaman Tabungan"
                  : "Konfirmasi pembayaran riil untuk memotong saldo kas"}
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
          <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#E8E2D8] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                Rencana Yang Dicentang
              </span>
              <span
                className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                  isSavingsMode
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : "bg-amber-50 text-amber-800 border-amber-200"
                }`}
              >
                {isSavingsMode ? "💰 Alokasi Tabungan" : "🛍️ Belanja / Tagihan"}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-black text-stone-900">{item.title}</span>
              <span className="text-xs font-mono font-bold text-stone-600">
                Est: {formatRupiah(item.estimatedAmount)}
              </span>
            </div>

            {/* Quick Toggle if user wants to switch between Tabungan or Belanja */}
            <div className="pt-1 flex items-center justify-between text-[11px]">
              <span className="text-stone-400">Tipe Transaksi:</span>
              <button
                type="button"
                onClick={() => setIsSavingsMode(!isSavingsMode)}
                className="font-bold text-[#854D0E] hover:underline flex items-center gap-1"
              >
                {isSavingsMode ? "Ubah ke Belanja Biasa" : "Jadikan Alokasi Tabungan"}
              </button>
            </div>
          </div>

          {/* Actual Price Input */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              Nominal Riil (Rp) <span className="text-rose-500">*</span>
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
              Bisa disesuaikan jika nominal riil yang disimpan/dibelanjakan berbeda.
            </span>
          </div>

          {/* Destination if Savings Mode */}
          {isSavingsMode && (
            <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-3">
              <div>
                <label className="block text-xs font-bold text-emerald-950 mb-1">
                  Tujuan Simpan di Halaman Tabungan:
                </label>
                <select
                  value={savingsTargetType}
                  onChange={(e) => setSavingsTargetType(e.target.value as SavingsTargetType)}
                  className="w-full px-3 py-2 rounded-xl border border-emerald-300 text-xs font-bold bg-white text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                >
                  <option value="regular">🏦 Tabungan Reguler / Bank Utama</option>
                  <option value="goal">🎯 Masukkan ke Celengan Impian</option>
                  <option value="money_market">📈 Portofolio Tabungan Pasar Uang</option>
                  <option value="emergency">🛡️ Dana Darurat</option>
                </select>
              </div>

              {/* Pilih Celengan jika targetType === "goal" */}
              {savingsTargetType === "goal" && goals.length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-emerald-950 mb-1">
                    Pilih Target Celengan Impian:
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
                  <label className="block text-xs font-bold text-emerald-950 mb-1">
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
          )}

          {/* Paid Date */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              Tanggal Transaksi
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
              isDeficit ? "bg-rose-50 border-rose-200" : "bg-[#FAF7F2] border-[#E8E2D8]"
            }`}
          >
            <div className="flex items-center justify-between text-stone-600 font-semibold">
              <span className="flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5 text-stone-500" />
                Kas Utama (Gaji) Tersedia:
              </span>
              <span className="font-mono font-bold">{formatRupiah(currentBalance)}</span>
            </div>

            <div
              className={`flex items-center justify-between font-semibold ${
                isSavingsMode ? "text-emerald-700" : "text-rose-700"
              }`}
            >
              <span>{isSavingsMode ? "Disimpan ke Tabungan:" : "Pengeluaran Belanja:"}</span>
              <span className="font-mono font-bold">- {formatRupiah(actualAmount)}</span>
            </div>

            <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between font-black">
              <span className={isDeficit ? "text-rose-800" : "text-stone-800"}>
                Simulasi Sisa Gaji:
              </span>
              <span
                className={`font-mono text-sm ${
                  isDeficit ? "text-rose-600" : "text-stone-900"
                }`}
              >
                {formatRupiah(projectedRemainingBalance)}
              </span>
            </div>

            {isSavingsMode && (
              <div className="text-[11px] font-bold text-emerald-700 pt-1 flex items-center gap-1 border-t border-emerald-100">
                <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Halaman Tabungan otomatis bertambah +{formatRupiah(actualAmount)} realtime!</span>
              </div>
            )}

            {isDeficit && (
              <p className="text-[10px] text-rose-600">
                ⚠️ Peringatan: Transaksi ini melebihi sisa kas gaji Anda bulan ini.
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
              className={`px-5 py-2.5 rounded-xl text-white text-xs font-black shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5 ${
                isSavingsMode ? "bg-emerald-700" : "bg-[#854D0E]"
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {isSubmitting
                  ? "Memproses..."
                  : isSavingsMode
                  ? "✓ Simpan ke Tabungan (Potong Gaji)"
                  : "✓ Bayar & Potong Saldo"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

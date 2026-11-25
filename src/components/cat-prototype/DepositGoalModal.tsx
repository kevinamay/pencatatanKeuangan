"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  PiggyBank,
  Coins,
  AlertCircle,
  Sparkles,
  CheckCircle2,
  Wallet,
  Link2,
  Landmark,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { FinancialGoal, MoneyMarketProduct } from "@/types/finance";
import { FinanceStorage, formatRupiah, calculateMoneyMarketProfit } from "@/lib/storage";

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
  const [activeTab, setActiveTab] = useState<"deposit" | "link_existing">("deposit");
  const [amountStr, setAmountStr] = useState("");
  const [date, setDate] = useState("");
  const [fundingSource, setFundingSource] = useState<"salary" | "external">("salary");
  const [linkedSelection, setLinkedSelection] = useState<string>("none");

  // State untuk Tab Hubungkan Saldo yang Sudah Ada
  const [selectedSourceMMId, setSelectedSourceMMId] = useState<string>("");
  const [allocateAmountStr, setAllocateAmountStr] = useState<string>("");

  const [availableMM, setAvailableMM] = useState<MoneyMarketProduct[]>([]);
  const [availableAccounts, setAvailableAccounts] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && goal) {
      setAmountStr("");
      setDate(new Date().toISOString().split("T")[0]);
      setFundingSource("salary");
      setErrorMsg(null);

      // Ambil daftar produk pasar uang & rekening tabungan yang ada
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

      // Tentukan default linked selection
      if (goal.linkedMoneyMarketId) {
        setLinkedSelection(`mm:${goal.linkedMoneyMarketId}`);
        setSelectedSourceMMId(goal.linkedMoneyMarketId);
      } else if (goal.linkedAccountName) {
        const foundMM = mmList.find((m) => m.name === goal.linkedAccountName);
        if (foundMM) {
          setLinkedSelection(`mm:${foundMM.id}`);
          setSelectedSourceMMId(foundMM.id);
        } else {
          setLinkedSelection(`acc:${goal.linkedAccountName}`);
          if (mmList.length > 0) setSelectedSourceMMId(mmList[0].id);
        }
      } else if (mmList.length > 0) {
        setLinkedSelection(`mm:${mmList[0].id}`);
        setSelectedSourceMMId(mmList[0].id);
      } else {
        setLinkedSelection("none");
      }

      // Default sisa target untuk alokasi saldo yang sudah ada
      const remainingNeed = Math.max(0, goal.targetAmount - goal.currentAmount);
      const defaultMM = mmList[0];
      if (defaultMM) {
        const initialCap = defaultMM.initialCapital || 0;
        const defaultAllocate = Math.min(initialCap, remainingNeed > 0 ? remainingNeed : initialCap);
        setAllocateAmountStr(defaultAllocate.toString());
      } else {
        setAllocateAmountStr(remainingNeed.toString());
      }
    }
  }, [goal, isOpen]);

  if (!isOpen || !goal) return null;

  const depositAmount = parseFloat(amountStr.replace(/[^0-9]/g, "")) || 0;
  const newCurrentDeposit = goal.currentAmount + depositAmount;
  const progressPercentDeposit = Math.min(100, Math.round((newCurrentDeposit / goal.targetAmount) * 100));
  const remainingDeposit = Math.max(0, goal.targetAmount - newCurrentDeposit);

  const allocateAmount = parseFloat(allocateAmountStr.replace(/[^0-9]/g, "")) || 0;
  const newCurrentAllocate = goal.currentAmount + allocateAmount;
  const progressPercentAllocate = Math.min(100, Math.round((newCurrentAllocate / goal.targetAmount) * 100));
  const remainingAllocate = Math.max(0, goal.targetAmount - newCurrentAllocate);

  const selectedSourceMM = availableMM.find((m) => m.id === selectedSourceMMId);

  const handleQuickAdd = (add: number) => {
    const cur = parseFloat(amountStr.replace(/[^0-9]/g, "")) || 0;
    setAmountStr((cur + add).toString());
  };

  // Submit Tab 1: Setor Dana Baru
  const handleSubmitDeposit = async (e: React.FormEvent) => {
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
      await FinanceStorage.depositToGoal(
        goal.id,
        depositAmount,
        date,
        fundingSource,
        linkedAccName,
        linkedMMId
      );
      onSuccess?.();
      onClose();
    } catch {
      setErrorMsg("Gagal memproses setoran celengan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Tab 2: Hubungkan & Alokasikan Saldo yang Sudah Ada
  const handleSubmitAllocateExisting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (allocateAmount <= 0) {
      setErrorMsg("Nominal saldo yang dihubungkan harus lebih besar dari Rp 0.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const sourceName = selectedSourceMM
      ? `${selectedSourceMM.name} (${selectedSourceMM.platform})`
      : "Tabungan yang Ada";

    try {
      await FinanceStorage.allocateExistingSavingsToGoal(
        goal.id,
        allocateAmount,
        sourceName,
        selectedSourceMMId || undefined
      );
      onSuccess?.();
      onClose();
    } catch {
      setErrorMsg("Gagal menghubungkan saldo tabungan yang ada.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl border border-[#E8E2D8] shadow-2xl max-w-lg w-full p-6 sm:p-7 relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-[#E8E2D8]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#FAF7F2] border border-[#E8E2D8] text-[#854D0E] flex items-center justify-center">
              <PiggyBank className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-stone-900">
                Setor / Hubungkan ke Celengan
              </h3>
              <p className="text-xs text-stone-500 line-clamp-1">
                Target: <b className="text-stone-800">{goal.title}</b>
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

        {/* Tab Selection */}
        <div className="mt-4 p-1 rounded-2xl bg-[#FAF7F2] border border-[#E8E2D8] grid grid-cols-2 gap-1">
          <button
            type="button"
            onClick={() => {
              setActiveTab("deposit");
              setErrorMsg(null);
            }}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "deposit"
                ? "bg-white text-[#854D0E] shadow-2xs border border-[#E8E2D8]"
                : "text-stone-500 hover:text-stone-800"
            }`}
          >
            <Coins className="w-3.5 h-3.5" />
            <span>Setor Dana Baru</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("link_existing");
              setErrorMsg(null);
            }}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "link_existing"
                ? "bg-white text-[#854D0E] shadow-2xs border border-[#E8E2D8]"
                : "text-stone-500 hover:text-stone-800"
            }`}
          >
            <Link2 className="w-3.5 h-3.5" />
            <span>Tautkan Saldo yang Ada</span>
          </button>
        </div>

        {errorMsg && (
          <div className="mt-3.5 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* ================= TAB 1: SETOR DANA BARU ================= */}
        {activeTab === "deposit" ? (
          <form onSubmit={handleSubmitDeposit} className="mt-4 space-y-4">
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
                  style={{ width: `${progressPercentDeposit}%` }}
                />
              </div>

              <div className="flex justify-between items-center text-[11px] text-stone-500 font-medium">
                <span>
                  Setelah setoran: <b className="text-[#854D0E]">{progressPercentDeposit}%</b>
                </span>
                <span>Sisa: {formatRupiah(remainingDeposit)}</span>
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
              {remainingDeposit > 0 && (
                <button
                  type="button"
                  onClick={() => setAmountStr(remainingDeposit.toString())}
                  className="px-2.5 py-1 rounded-lg border border-amber-300 bg-amber-50 text-[11px] font-bold text-[#854D0E] hover:bg-amber-100 active:scale-95 transition-all"
                >
                  Penuhi Target ({formatRupiah(remainingDeposit)})
                </button>
              )}
            </div>

            {/* Hubungkan ke Akun Tabungan / Pasar Uang yang Ada */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Simpan & Hubungkan ke Akun Tabungan / Produk Yang Ada
              </label>
              <select
                value={linkedSelection}
                onChange={(e) => setLinkedSelection(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-[#E8E2D8] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#854D0E]/20 focus:border-[#854D0E] bg-[#FAF7F2]/50 text-stone-900"
              >
                {availableMM.length > 0 && (
                  <optgroup label="Pasar Uang & Investasi (Otomatis Top Up)">
                    {availableMM.map((m) => (
                      <option key={m.id} value={`mm:${m.id}`}>
                        📈 {m.name} ({m.platform}) — Saldo: {formatRupiah(m.initialCapital)}
                      </option>
                    ))}
                  </optgroup>
                )}

                {availableAccounts.length > 0 && (
                  <optgroup label="Rekening Tabungan Bank">
                    {availableAccounts.map((acc) => (
                      <option key={acc} value={`acc:${acc}`}>
                        🏦 {acc}
                      </option>
                    ))}
                  </optgroup>
                )}

                <option value="none">🎯 Simpan di Celengan Mandiri (Tanpa Rekening Khusus)</option>
              </select>
              <p className="text-[11px] text-stone-500 mt-1">
                💡 Setoran otomatis menambah progres celengan sekaligus menambah saldo tabungan/pasar uang yang dipilih.
              </p>
            </div>

            {/* Funding Source Selector */}
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
            <div className="pt-2 flex items-center justify-end gap-2.5">
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
        ) : (
          /* ================= TAB 2: HUBUNGKAN SALDO YANG SUDAH ADA ================= */
          <form onSubmit={handleSubmitAllocateExisting} className="mt-4 space-y-4">
            <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200 text-xs text-amber-900 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-[#854D0E]">
                <Link2 className="w-4 h-4" />
                <span>Hubungkan Saldo Setoran yang Telah Masuk</span>
              </div>
              <p className="text-[11px] text-stone-600 leading-relaxed">
                Tautkan setoran/investasi yang telah Anda simpan sebelumnya (misal saldo di <b>Sucorinvest Pasar Uang</b>) agar langsung dihitung ke progres celengan ini tanpa perlu transfer dana baru.
              </p>
            </div>

            {/* Pilih Produk Pasar Uang yang Ada */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Pilih Tabungan / Produk Pasar Uang Sumber Saldo <span className="text-rose-500">*</span>
              </label>
              {availableMM.length > 0 ? (
                <div className="space-y-2">
                  <select
                    value={selectedSourceMMId}
                    onChange={(e) => {
                      setSelectedSourceMMId(e.target.value);
                      const m = availableMM.find((item) => item.id === e.target.value);
                      if (m) {
                        const rem = Math.max(0, goal.targetAmount - goal.currentAmount);
                        const autoVal = Math.min(m.initialCapital, rem > 0 ? rem : m.initialCapital);
                        setAllocateAmountStr(autoVal.toString());
                      }
                    }}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#E8E2D8] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#854D0E]/20 focus:border-[#854D0E] bg-[#FAF7F2]/50 text-stone-900"
                  >
                    {availableMM.map((m) => (
                      <option key={m.id} value={m.id}>
                        📈 {m.name} ({m.platform}) — Saldo Modal: {formatRupiah(m.initialCapital)}
                      </option>
                    ))}
                  </select>

                  {selectedSourceMM && (
                    <div className="p-3 rounded-xl border border-[#E8E2D8] bg-[#FAF7F2] flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-stone-800 block">
                          {selectedSourceMM.name}
                        </span>
                        <span className="text-[10px] text-stone-500">
                          Platform: {selectedSourceMM.platform} • Imbal Hasil: {selectedSourceMM.returnRatePa}%
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-stone-400 block">Saldo Modal</span>
                        <span className="font-mono font-bold text-emerald-700">
                          {formatRupiah(selectedSourceMM.initialCapital)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-3 rounded-xl border border-dashed border-[#E8E2D8] text-xs text-stone-500 text-center">
                  Belum ada produk pasar uang tercatat. Tambahkan produk di tab Tabungan & Pasar Uang terlebih dahulu.
                </div>
              )}
            </div>

            {/* Input Nominal yang Dihubungkan */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Nominal Saldo yang Dihubungkan ke Celengan (Rp) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="text-xs font-black text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2">
                  Rp
                </span>
                <input
                  type="text"
                  required
                  value={allocateAmountStr ? parseInt(allocateAmountStr, 10).toLocaleString("id-ID") : ""}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/[^0-9]/g, "");
                    setAllocateAmountStr(raw);
                  }}
                  placeholder="0"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E8E2D8] text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#854D0E]/20 focus:border-[#854D0E] bg-[#FAF7F2]/50 text-stone-900"
                />
              </div>

              {selectedSourceMM && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <button
                    type="button"
                    onClick={() => setAllocateAmountStr(selectedSourceMM.initialCapital.toString())}
                    className="px-2.5 py-1 rounded-lg border border-[#E8E2D8] bg-white text-[11px] font-bold text-stone-700 hover:bg-stone-50"
                  >
                    Tautkan Seluruh Modal ({formatRupiah(selectedSourceMM.initialCapital)})
                  </button>
                  {remainingAllocate > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        const val = Math.min(selectedSourceMM.initialCapital, remainingAllocate);
                        setAllocateAmountStr(val.toString());
                      }}
                      className="px-2.5 py-1 rounded-lg border border-amber-300 bg-amber-50 text-[11px] font-bold text-[#854D0E] hover:bg-amber-100"
                    >
                      Sesuai Target ({formatRupiah(remainingAllocate)})
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Preview Setelah Dihubungkan */}
            <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#E8E2D8] space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-stone-600">Progres Celengan Setelah Dihubungkan:</span>
                <span className="font-mono font-bold text-[#854D0E]">
                  {formatRupiah(newCurrentAllocate)} / {formatRupiah(goal.targetAmount)}
                </span>
              </div>
              <div className="w-full h-2.5 bg-stone-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#854D0E] rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentAllocate}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[11px] text-stone-500 font-medium">
                <span>
                  Progres: <b className="text-[#854D0E]">{progressPercentAllocate}%</b>
                </span>
                <span>Sisa Target: {formatRupiah(remainingAllocate)}</span>
              </div>
            </div>

            {/* Submit Actions */}
            <div className="pt-2 flex items-center justify-end gap-2.5">
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
                disabled={isSubmitting || !selectedSourceMM}
                className="px-5 py-2.5 rounded-xl bg-[#854D0E] hover:bg-[#713F12] text-white text-xs font-bold shadow-xs active:scale-95 transition-all flex items-center gap-1.5"
              >
                <Link2 className="w-4 h-4" />
                <span>{isSubmitting ? "Menghubungkan..." : "Hubungkan & Tautkan Saldo"}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

"use client";

import React from "react";
import { Sparkles, ArrowRight, Plus, ShoppingBag, AlertCircle, CheckCircle2 } from "lucide-react";
import { PlannedItem } from "@/types/finance";
import { formatRupiah } from "@/lib/storage";

interface PlannedSummaryWidgetProps {
  plannedItems: PlannedItem[];
  currentBalance: number;
  onNavigateToTab?: (tab: "dashboard" | "transactions" | "savings" | "report" | "planned") => void;
  onOpenAddPlanned: () => void;
}

export const PlannedSummaryWidget: React.FC<PlannedSummaryWidgetProps> = ({
  plannedItems,
  currentBalance,
  onNavigateToTab,
  onOpenAddPlanned,
}) => {
  const activeItems = plannedItems.filter((item) => !item.isPaid);
  const totalPlannedAmount = activeItems.reduce((acc, curr) => acc + curr.estimatedAmount, 0);

  const pentingCount = activeItems.filter((i) => i.urgency === "penting").length;
  const keinginanCount = activeItems.filter((i) => i.urgency === "keinginan").length;
  const santaiCount = activeItems.filter((i) => i.urgency === "santai").length;

  const projectedBalance = currentBalance - totalPlannedAmount;
  const isDeficit = projectedBalance < 0 && activeItems.length > 0;

  return (
    <div className="rounded-3xl bg-white border border-[#E8E2D8] p-5 sm:p-6 shadow-2xs hover:shadow-sm transition-all space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#FAF7F2] border border-[#E8E2D8] flex items-center justify-center text-lg">
            🛍️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-stone-900 tracking-tight">
                Wacana Belanja & Tagihan Pending
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FAF7F2] text-[#854D0E] border border-[#E8E2D8]">
                {activeItems.length} Rencana
              </span>
            </div>
            <p className="text-xs text-stone-400">
              Belum memotong saldo. Sentuh tombol centang saat transaksi riil terjadi.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={onOpenAddPlanned}
            className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-[#854D0E] hover:bg-[#713F12] text-white font-bold text-xs shadow-2xs active:scale-95 transition-all flex items-center justify-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Catat Wacana</span>
          </button>
          {onNavigateToTab && (
            <button
              onClick={() => onNavigateToTab("planned")}
              className="px-3.5 py-2 rounded-xl bg-[#FAF7F2] hover:bg-stone-100 text-stone-700 font-bold text-xs border border-[#E8E2D8] active:scale-95 transition-all flex items-center gap-1"
            >
              <span>Buka Wishlist</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#854D0E]" />
            </button>
          )}
        </div>
      </div>

      {/* Overview Cards & Simulation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
        {/* Total Planned */}
        <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#E8E2D8] flex flex-col justify-between">
          <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
            Total Estimasi Wacana
          </span>
          <span className="text-base font-black font-mono text-stone-800 mt-1">
            {formatRupiah(totalPlannedAmount)}
          </span>
          <div className="flex items-center gap-2 text-[10px] font-medium text-stone-400 mt-2">
            <span>🔴 {pentingCount} Penting</span>
            <span>•</span>
            <span>🟡 {keinginanCount} Wishlist</span>
            <span>•</span>
            <span>🟢 {santaiCount} Santai</span>
          </div>
        </div>

        {/* Current Available Balance */}
        <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#E8E2D8] flex flex-col justify-between">
          <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
            Sisa Saldo Riil Saat Ini
          </span>
          <span className="text-base font-black font-mono text-emerald-700 mt-1">
            {formatRupiah(currentBalance)}
          </span>
          <span className="text-[10px] text-stone-400 mt-2">
            Saldo bersih dari gaji setelah dikurangi pengeluaran riil
          </span>
        </div>

        {/* Projected Impact */}
        <div
          className={`p-3.5 rounded-2xl border flex flex-col justify-between ${
            isDeficit ? "bg-rose-50 border-rose-200" : "bg-[#FAF7F2] border-[#E8E2D8]"
          }`}
        >
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
            Simulasi Sisa Jika Semua Dibeli
          </span>
          <span
            className={`text-base font-black font-mono mt-1 ${
              isDeficit ? "text-rose-600" : "text-stone-800"
            }`}
          >
            {formatRupiah(projectedBalance)}
          </span>
          <span
            className={`text-[10px] font-medium mt-2 ${
              isDeficit ? "text-rose-600" : "text-emerald-700"
            }`}
          >
            {isDeficit ? "⚠️ Melebihi saldo kas saat ini!" : "✓ Kas mencukupi untuk semua wacana"}
          </span>
        </div>
      </div>
    </div>
  );
};

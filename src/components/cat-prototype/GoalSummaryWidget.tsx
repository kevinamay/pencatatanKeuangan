"use client";

import React, { useState } from "react";
import { Target, Plus, ArrowRight, Sparkles, CheckCircle2, Coins, Link2 } from "lucide-react";
import { FinancialGoal } from "@/types/finance";
import { formatRupiah } from "@/lib/storage";
import { DepositGoalModal } from "./DepositGoalModal";
import { GoalModal } from "./GoalModal";

interface GoalSummaryWidgetProps {
  goals: FinancialGoal[];
  onNavigateToTab?: (tab: "dashboard" | "transactions" | "savings" | "report" | "planned") => void;
  onOpenAddGoal?: () => void;
}

export const GoalSummaryWidget: React.FC<GoalSummaryWidgetProps> = ({
  goals,
  onNavigateToTab,
  onOpenAddGoal,
}) => {
  const [selectedGoalForDeposit, setSelectedGoalForDeposit] = useState<FinancialGoal | null>(null);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);

  const activeGoals = goals.filter((g) => !g.isCompleted);
  const totalTarget = activeGoals.reduce((acc, curr) => acc + curr.targetAmount, 0);
  const totalCollected = activeGoals.reduce((acc, curr) => acc + curr.currentAmount, 0);
  const overallPercent = totalTarget > 0 ? Math.min(100, Math.round((totalCollected / totalTarget) * 100)) : 0;

  return (
    <div className="rounded-3xl bg-white border border-[#E8E2D8] p-5 sm:p-6 shadow-2xs hover:shadow-sm transition-all space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#FAF7F2] border border-[#E8E2D8] flex items-center justify-center text-lg">
            🎯
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-stone-900 tracking-tight">
                Celengan Impian & Target Tabungan
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FAF7F2] text-[#854D0E] border border-[#E8E2D8]">
                {activeGoals.length} Impian Aktif
              </span>
            </div>
            <p className="text-xs text-stone-400">
              Kumpulkan koin tabungan bertahap untuk wujudkan target impian Anda.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => onOpenAddGoal ? onOpenAddGoal() : setIsGoalModalOpen(true)}
            className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-[#854D0E] hover:bg-[#713F12] text-white font-bold text-xs shadow-2xs active:scale-95 transition-all flex items-center justify-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Buat Impian</span>
          </button>
          {onNavigateToTab && (
            <button
              onClick={() => onNavigateToTab("savings")}
              className="px-3.5 py-2 rounded-xl bg-[#FAF7F2] hover:bg-stone-100 text-stone-700 font-bold text-xs border border-[#E8E2D8] active:scale-95 transition-all flex items-center gap-1"
            >
              <span>Semua Celengan</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#854D0E]" />
            </button>
          )}
        </div>
      </div>

      {/* Overview Stats Bar */}
      <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#E8E2D8] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
            Total Progres Seluruh Celengan Aktif
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-base font-black font-mono text-[#854D0E]">
              {formatRupiah(totalCollected)}
            </span>
            <span className="text-xs text-stone-400 font-medium">
              dari target {formatRupiah(totalTarget)}
            </span>
          </div>
        </div>

        <div className="sm:w-48 space-y-1">
          <div className="flex justify-between text-[11px] font-bold text-stone-600">
            <span>Tercapai</span>
            <span className="text-[#854D0E]">{overallPercent}%</span>
          </div>
          <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#854D0E] rounded-full transition-all duration-500"
              style={{ width: `${overallPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Goal Preview Cards */}
      {activeGoals.length === 0 ? (
        <div className="py-6 text-center space-y-2 border border-dashed border-[#E8E2D8] rounded-2xl">
          <p className="text-xs text-stone-400">
            Belum ada celengan impian. Tentukan target laptop, liburan, atau dana darurat Anda!
          </p>
          <button
            onClick={() => setIsGoalModalOpen(true)}
            className="text-xs font-bold text-[#854D0E] hover:underline"
          >
            + Mulai Celengan Pertama
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {activeGoals.slice(0, 3).map((goal) => {
            const percent = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
            return (
              <div
                key={goal.id}
                className="p-3.5 rounded-2xl border border-[#E8E2D8] bg-[#FAF7F2]/40 hover:bg-[#FAF7F2] transition-all flex flex-col justify-between gap-3"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border border-[#E8E2D8] text-[#854D0E] uppercase tracking-wider">
                      {goal.category}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border border-[#E8E2D8] text-stone-600">
                      Target: {goal.targetDate || "Fleksibel"}
                    </span>
                  </div>
                  <h4 className="text-xs font-black text-stone-900 mt-2 line-clamp-1">
                    {goal.title}
                  </h4>
                  {goal.linkedAccountName && (
                    <div className="flex items-center gap-1 text-[10px] text-amber-800 font-bold mt-1 truncate">
                      <Link2 className="w-2.5 h-2.5 text-[#854D0E] flex-shrink-0" />
                      <span className="truncate">Terhubung: {goal.linkedAccountName}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-baseline mt-1">
                    <span className="text-xs font-bold font-mono text-[#854D0E]">
                      {formatRupiah(goal.currentAmount)}
                    </span>
                    <span className="text-[10px] text-stone-400 font-mono">
                      / {formatRupiah(goal.targetAmount)}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden mt-2">
                    <div
                      className="h-full bg-[#854D0E] rounded-full transition-all duration-300"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-stone-200/50 flex items-center justify-between text-[11px]">
                  <span className="font-bold text-stone-500">{percent}%</span>
                  <button
                    onClick={() => setSelectedGoalForDeposit(goal)}
                    className="px-2.5 py-1 rounded-lg bg-[#854D0E] hover:bg-[#713F12] text-white text-[10px] font-bold active:scale-95 transition-all flex items-center gap-1"
                  >
                    <Coins className="w-3 h-3" />
                    <span>+ Setor</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <DepositGoalModal
        isOpen={selectedGoalForDeposit !== null}
        onClose={() => setSelectedGoalForDeposit(null)}
        goal={selectedGoalForDeposit}
      />

      <GoalModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
      />
    </div>
  );
};

"use client";

import React, { useState, useMemo } from "react";
import {
  LineChart,
  Calendar,
  TrendingDown,
  TrendingUp,
  Receipt,
  ArrowDownRight,
  ArrowUpRight,
  Filter,
  Layers,
  Sparkles,
  Scale,
} from "lucide-react";
import { ExpenseItem, IncomeItem } from "@/types/finance";
import { formatRupiah, formatTanggalIndo } from "@/lib/storage";

interface DailyExpenseChartProps {
  expenses: ExpenseItem[];
  incomes?: IncomeItem[];
  selectedMonth: string; // format YYYY-MM
  onOpenQuickAdd?: (type?: "income" | "expense") => void;
}

export interface DayCashflowData {
  day: number;
  dateStr: string;
  dayName: string;
  expenseAmount: number;
  incomeAmount: number;
  netAmount: number;
  expenseItems: ExpenseItem[];
  incomeItems: IncomeItem[];
}

export type CashflowFilterMode = "all" | "expense" | "income";

export const DailyExpenseChart: React.FC<DailyExpenseChartProps> = ({
  expenses = [],
  incomes = [],
  selectedMonth,
  onOpenQuickAdd,
}) => {
  const [filterMode, setFilterMode] = useState<CashflowFilterMode>("all");
  const [hoveredDay, setHoveredDay] = useState<DayCashflowData | null>(null);

  // Parse year & month
  const { year, monthIndex, daysInMonth, monthLabel } = useMemo(() => {
    const parts = (selectedMonth || "2026-11").split("-");
    const y = parseInt(parts[0], 10) || 2026;
    const m = (parseInt(parts[1], 10) || 11) - 1;
    const totalDays = new Date(y, m + 1, 0).getDate();
    const dateObj = new Date(y, m, 1);
    const label = dateObj.toLocaleDateString("id-ID", {
      month: "long",
      year: "numeric",
    });
    return { year: y, monthIndex: m, daysInMonth: totalDays, monthLabel: label };
  }, [selectedMonth]);

  // Filter transactions for selected month
  const monthExpenses = useMemo(() => {
    return (expenses || []).filter((e) => e.month === selectedMonth);
  }, [expenses, selectedMonth]);

  const monthIncomes = useMemo(() => {
    return (incomes || []).filter((i) => i.month === selectedMonth);
  }, [incomes, selectedMonth]);

  // Aggregate daily data (Day 1 to daysInMonth)
  const {
    dailyData,
    maxDailyAmount,
    totalExpense,
    totalIncome,
    netCashflow,
    activeDaysCount,
    peakExpenseDay,
    peakIncomeDay,
  } = useMemo(() => {
    const data: DayCashflowData[] = [];
    let totExp = 0;
    let totInc = 0;
    let maxVal = 0;
    let peakExp: DayCashflowData | null = null;
    let peakInc: DayCashflowData | null = null;

    for (let d = 1; d <= daysInMonth; d++) {
      const dayStr = String(d).padStart(2, "0");
      const dateStr = `${selectedMonth}-${dayStr}`;
      const dDate = new Date(year, monthIndex, d);
      const dayName = dDate.toLocaleDateString("id-ID", { weekday: "short" });

      const dayExpItems = monthExpenses.filter((e) => e.date === dateStr);
      const dayIncItems = monthIncomes.filter((i) => i.date === dateStr);

      const dayExpTotal = dayExpItems.reduce((sum, item) => sum + item.amount, 0);
      const dayIncTotal = dayIncItems.reduce((sum, item) => sum + item.amount, 0);
      const dayNet = dayIncTotal - dayExpTotal;

      totExp += dayExpTotal;
      totInc += dayIncTotal;

      // Calculate max val based on filter mode
      if (filterMode === "all") {
        if (dayExpTotal > maxVal) maxVal = dayExpTotal;
        if (dayIncTotal > maxVal) maxVal = dayIncTotal;
      } else if (filterMode === "expense") {
        if (dayExpTotal > maxVal) maxVal = dayExpTotal;
      } else if (filterMode === "income") {
        if (dayIncTotal > maxVal) maxVal = dayIncTotal;
      }

      const dayEntry: DayCashflowData = {
        day: d,
        dateStr,
        dayName,
        expenseAmount: dayExpTotal,
        incomeAmount: dayIncTotal,
        netAmount: dayNet,
        expenseItems: dayExpItems,
        incomeItems: dayIncItems,
      };

      if (dayExpTotal > 0 && (!peakExp || dayExpTotal > peakExp.expenseAmount)) {
        peakExp = dayEntry;
      }
      if (dayIncTotal > 0 && (!peakInc || dayIncTotal > peakInc.incomeAmount)) {
        peakInc = dayEntry;
      }

      data.push(dayEntry);
    }

    const activeDays = data.filter(
      (d) => d.expenseAmount > 0 || d.incomeAmount > 0
    ).length;

    return {
      dailyData: data,
      maxDailyAmount: maxVal > 0 ? maxVal : 100000,
      totalExpense: totExp,
      totalIncome: totInc,
      netCashflow: totInc - totExp,
      activeDaysCount: activeDays,
      peakExpenseDay: peakExp,
      peakIncomeDay: peakInc,
    };
  }, [
    daysInMonth,
    year,
    monthIndex,
    selectedMonth,
    monthExpenses,
    monthIncomes,
    filterMode,
  ]);

  // Averages
  const avgExpensePerActiveDay =
    activeDaysCount > 0 ? Math.round(totalExpense / activeDaysCount) : 0;
  const avgExpensePerDayAll = Math.round(totalExpense / daysInMonth);

  // Active highlighted day (hovered or peak or first day with any transaction)
  const activeDetailDay = useMemo(() => {
    if (hoveredDay) return hoveredDay;
    if (filterMode === "income" && peakIncomeDay) return peakIncomeDay;
    if (filterMode === "expense" && peakExpenseDay) return peakExpenseDay;
    if (peakExpenseDay) return peakExpenseDay;
    if (peakIncomeDay) return peakIncomeDay;
    const firstActive = dailyData.find(
      (d) => d.expenseAmount > 0 || d.incomeAmount > 0
    );
    return firstActive || dailyData[0];
  }, [hoveredDay, filterMode, peakIncomeDay, peakExpenseDay, dailyData]);

  // SVG dimensions for Line Chart
  const svgWidth = 1000;
  const svgHeight = 220;
  const paddingX = 35;
  const paddingY = 32;
  const chartW = svgWidth - paddingX * 2;
  const chartH = svgHeight - paddingY * 2;

  // Build points for Expenses
  const expensePoints = useMemo(() => {
    return dailyData.map((d, index) => {
      const x = paddingX + (index / (daysInMonth - 1)) * chartW;
      const ratio = Math.min(1, d.expenseAmount / maxDailyAmount);
      const y = svgHeight - paddingY - ratio * chartH;
      return { x, y, data: d };
    });
  }, [dailyData, daysInMonth, chartW, chartH, maxDailyAmount, svgHeight]);

  // Build points for Incomes
  const incomePoints = useMemo(() => {
    return dailyData.map((d, index) => {
      const x = paddingX + (index / (daysInMonth - 1)) * chartW;
      const ratio = Math.min(1, d.incomeAmount / maxDailyAmount);
      const y = svgHeight - paddingY - ratio * chartH;
      return { x, y, data: d };
    });
  }, [dailyData, daysInMonth, chartW, chartH, maxDailyAmount, svgHeight]);

  // SVG Path generation helpers
  const expenseLinePathD = useMemo(() => {
    if (expensePoints.length === 0) return "";
    return expensePoints.reduce((acc, pt, idx) => {
      return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
    }, "");
  }, [expensePoints]);

  const expenseAreaPathD = useMemo(() => {
    if (expensePoints.length === 0) return "";
    const firstX = expensePoints[0].x;
    const lastX = expensePoints[expensePoints.length - 1].x;
    const bottomY = svgHeight - paddingY;
    return `${expenseLinePathD} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  }, [expenseLinePathD, expensePoints, svgHeight]);

  const incomeLinePathD = useMemo(() => {
    if (incomePoints.length === 0) return "";
    return incomePoints.reduce((acc, pt, idx) => {
      return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
    }, "");
  }, [incomePoints]);

  const incomeAreaPathD = useMemo(() => {
    if (incomePoints.length === 0) return "";
    const firstX = incomePoints[0].x;
    const lastX = incomePoints[incomePoints.length - 1].x;
    const bottomY = svgHeight - paddingY;
    return `${incomeLinePathD} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  }, [incomeLinePathD, incomePoints, svgHeight]);

  const totalTransactionsCount = monthExpenses.length + monthIncomes.length;

  return (
    <div className="space-y-6">
      {/* Header: Title, Realtime Status & Interactive Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#F4EBE1] text-[#854D0E] flex items-center justify-center font-bold shadow-2xs border border-[#E8E2D8]">
            <LineChart className="w-5 h-5 text-[#854D0E]" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-black text-base sm:text-lg text-stone-900">
                Grafik Arus Kas Harian (Keluar & Masuk)
              </h3>
              <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-[#FAF7F2] text-[#854D0E] border border-[#E8E2D8]">
                {monthLabel}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Realtime Terhubung
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Pantau dinamika uang masuk (pemasukan) dan keluar (pengeluaran) setiap tanggal secara langsung (Tgl 1 - {daysInMonth}).
            </p>
          </div>
        </div>

        {/* View Mode Switcher Pills */}
        <div className="flex items-center gap-1.5 bg-[#FAF7F2] p-1 rounded-2xl border border-[#E8E2D8] self-start lg:self-auto shadow-2xs">
          <button
            type="button"
            onClick={() => setFilterMode("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
              filterMode === "all"
                ? "bg-white text-stone-900 shadow-2xs border border-[#E8E2D8]"
                : "text-stone-500 hover:text-stone-800"
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-stone-700" />
            <span>Semua (Masuk & Keluar)</span>
          </button>

          <button
            type="button"
            onClick={() => setFilterMode("expense")}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
              filterMode === "expense"
                ? "bg-rose-50 text-rose-800 shadow-2xs border border-rose-200"
                : "text-stone-500 hover:text-rose-700"
            }`}
          >
            <ArrowDownRight className="w-3.5 h-3.5 text-rose-600" />
            <span>Pengeluaran (Keluar)</span>
          </button>

          <button
            type="button"
            onClick={() => setFilterMode("income")}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
              filterMode === "income"
                ? "bg-emerald-50 text-emerald-800 shadow-2xs border border-emerald-200"
                : "text-stone-500 hover:text-emerald-700"
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
            <span>Pemasukan (Masuk)</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total Uang Masuk */}
        <div
          onClick={() => setFilterMode("income")}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
            filterMode === "income"
              ? "bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-400/30"
              : "bg-[#FAF7F2] border-[#E8E2D8] hover:border-emerald-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="block text-[10px] uppercase font-bold text-stone-500">
              Total Uang Masuk
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
          <span className="text-base sm:text-lg font-black text-emerald-700 block mt-0.5">
            +{formatRupiah(totalIncome)}
          </span>
          <span className="block text-[10px] text-stone-400 font-medium mt-0.5">
            {monthIncomes.length} transaksi pemasukan
          </span>
        </div>

        {/* Total Uang Keluar */}
        <div
          onClick={() => setFilterMode("expense")}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
            filterMode === "expense"
              ? "bg-rose-50/70 border-rose-300 ring-2 ring-rose-400/30"
              : "bg-[#FAF7F2] border-[#E8E2D8] hover:border-rose-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="block text-[10px] uppercase font-bold text-stone-500">
              Total Uang Keluar
            </span>
            <span className="w-2 h-2 rounded-full bg-[#B91C1C]" />
          </div>
          <span className="text-base sm:text-lg font-black text-rose-700 block mt-0.5">
            -{formatRupiah(totalExpense)}
          </span>
          <span className="block text-[10px] text-stone-400 font-medium mt-0.5">
            {monthExpenses.length} transaksi pengeluaran
          </span>
        </div>

        {/* Arus Kas Bersih (Net) */}
        <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#E8E2D8]">
          <div className="flex items-center justify-between">
            <span className="block text-[10px] uppercase font-bold text-stone-500">
              Arus Kas Bersih (Surplus)
            </span>
            <Scale className="w-3.5 h-3.5 text-stone-400" />
          </div>
          <span
            className={`text-base sm:text-lg font-black block mt-0.5 ${
              netCashflow >= 0 ? "text-stone-900" : "text-amber-700"
            }`}
          >
            {netCashflow >= 0 ? "+" : ""}
            {formatRupiah(netCashflow)}
          </span>
          <span className="block text-[10px] text-stone-400 font-medium mt-0.5">
            {netCashflow >= 0 ? "Surplus kas bulan ini" : "Defisit dari pemasukan"}
          </span>
        </div>

        {/* Puncak Transaksi */}
        <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#E8E2D8]">
          <span className="block text-[10px] uppercase font-bold text-stone-500">
            Puncak Transaksi Harian
          </span>
          <span className="text-base sm:text-lg font-black text-[#854D0E] block mt-0.5 truncate">
            {filterMode === "income"
              ? peakIncomeDay
                ? formatRupiah(peakIncomeDay.incomeAmount)
                : "Rp 0"
              : peakExpenseDay
              ? formatRupiah(peakExpenseDay.expenseAmount)
              : "Rp 0"}
          </span>
          <span className="block text-[10px] text-stone-500 font-bold mt-0.5 truncate">
            {filterMode === "income"
              ? peakIncomeDay
                ? `Pemasukan Tgl ${peakIncomeDay.day} ${peakIncomeDay.dayName}`
                : "Belum ada pemasukan"
              : peakExpenseDay
              ? `Pengeluaran Tgl ${peakExpenseDay.day} ${peakExpenseDay.dayName}`
              : "Belum ada pengeluaran"}
          </span>
        </div>
      </div>

      {/* Main Chart Canvas */}
      {totalTransactionsCount === 0 ? (
        <div className="text-center py-14 px-4 bg-[#FAF7F2] rounded-3xl border border-dashed border-[#E8E2D8] space-y-3">
          <div className="w-12 h-12 rounded-full bg-white text-[#854D0E] flex items-center justify-center mx-auto shadow-2xs border border-[#E8E2D8]">
            <LineChart className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-stone-800">
              Belum Ada Transaksi Tercatat pada {monthLabel}
            </h4>
            <p className="text-xs text-stone-500 max-w-md mx-auto mt-1">
              Catat pemasukan atau pengeluaran baru untuk melihat grafik arus kas harian Anda secara real-time.
            </p>
          </div>
          {onOpenQuickAdd && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => onOpenQuickAdd("income")}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 text-white text-xs font-black rounded-xl hover:bg-emerald-700 transition-all shadow-2xs"
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                + Catat Pemasukan
              </button>
              <button
                onClick={() => onOpenQuickAdd("expense")}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#854D0E] text-white text-xs font-black rounded-xl hover:bg-[#6D3E0B] transition-all shadow-2xs"
              >
                <ArrowDownRight className="w-3.5 h-3.5" />
                + Catat Pengeluaran
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Legend and Active Scale */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-1 text-xs">
            <div className="flex items-center gap-4">
              {(filterMode === "all" || filterMode === "income") && (
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="font-extrabold text-stone-700">
                    Uang Masuk (Pemasukan)
                  </span>
                </div>
              )}
              {(filterMode === "all" || filterMode === "expense") && (
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-1.5 rounded-full bg-[#B91C1C]" />
                  <span className="font-extrabold text-stone-700">
                    Uang Keluar (Pengeluaran)
                  </span>
                </div>
              )}
            </div>

            <div className="text-[11px] text-stone-500 font-bold">
              Skala Maksimal: <span className="text-stone-800">{formatRupiah(maxDailyAmount)}</span>
            </div>
          </div>

          {/* Garis / Area Chart SVG */}
          <div className="overflow-x-auto pb-2">
            <div className="min-w-[700px]">
              <svg
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                className="w-full h-64 overflow-visible"
              >
                <defs>
                  {/* Expense Gradient */}
                  <linearGradient
                    id="expenseAreaGrad"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#DC2626" stopOpacity="0.30" />
                    <stop offset="100%" stopColor="#DC2626" stopOpacity="0.0" />
                  </linearGradient>

                  {/* Income Gradient */}
                  <linearGradient
                    id="incomeAreaGrad"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#10B981" stopOpacity="0.30" />
                    <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal Grid lines */}
                <line
                  x1={paddingX}
                  y1={paddingY}
                  x2={svgWidth - paddingX}
                  y2={paddingY}
                  stroke="#E8E2D8"
                  strokeDasharray="4 4"
                />
                <line
                  x1={paddingX}
                  y1={svgHeight / 2}
                  x2={svgWidth - paddingX}
                  y2={svgHeight / 2}
                  stroke="#E8E2D8"
                  strokeDasharray="4 4"
                />
                <line
                  x1={paddingX}
                  y1={svgHeight - paddingY}
                  x2={svgWidth - paddingX}
                  y2={svgHeight - paddingY}
                  stroke="#D6CFC4"
                />

                {/* Labels on Y Axis */}
                <text
                  x={paddingX}
                  y={paddingY - 8}
                  fill="#78716C"
                  fontSize="11"
                  fontWeight="700"
                >
                  Maks: {formatRupiah(maxDailyAmount)}
                </text>
                <text
                  x={paddingX}
                  y={svgHeight / 2 - 8}
                  fill="#A8A29E"
                  fontSize="11"
                  fontWeight="700"
                >
                  50%: {formatRupiah(maxDailyAmount / 2)}
                </text>

                {/* Vertical hover line indicator */}
                {hoveredDay && (
                  <line
                    x1={
                      paddingX +
                      ((hoveredDay.day - 1) / (daysInMonth - 1)) * chartW
                    }
                    y1={paddingY}
                    x2={
                      paddingX +
                      ((hoveredDay.day - 1) / (daysInMonth - 1)) * chartW
                    }
                    y2={svgHeight - paddingY}
                    stroke="#854D0E"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                  />
                )}

                {/* 1. Area Fill for Income (Green) */}
                {(filterMode === "all" || filterMode === "income") &&
                  incomeAreaPathD && (
                    <path
                      d={incomeAreaPathD}
                      fill="url(#incomeAreaGrad)"
                      className="transition-all duration-300 pointer-events-none"
                    />
                  )}

                {/* 2. Area Fill for Expense (Red/Amber) */}
                {(filterMode === "all" || filterMode === "expense") &&
                  expenseAreaPathD && (
                    <path
                      d={expenseAreaPathD}
                      fill="url(#expenseAreaGrad)"
                      className="transition-all duration-300 pointer-events-none"
                    />
                  )}

                {/* 3. Line stroke for Income */}
                {(filterMode === "all" || filterMode === "income") &&
                  incomeLinePathD && (
                    <path
                      d={incomeLinePathD}
                      fill="none"
                      stroke="#059669"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="transition-all duration-300 pointer-events-none"
                    />
                  )}

                {/* 4. Line stroke for Expense */}
                {(filterMode === "all" || filterMode === "expense") &&
                  expenseLinePathD && (
                    <path
                      d={expenseLinePathD}
                      fill="none"
                      stroke="#B91C1C"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="transition-all duration-300 pointer-events-none"
                    />
                  )}

                {/* 5. Interactive Data Points */}
                {dailyData.map((d, index) => {
                  const x = paddingX + (index / (daysInMonth - 1)) * chartW;
                  const expRatio = Math.min(1, d.expenseAmount / maxDailyAmount);
                  const expY = svgHeight - paddingY - expRatio * chartH;
                  const incRatio = Math.min(1, d.incomeAmount / maxDailyAmount);
                  const incY = svgHeight - paddingY - incRatio * chartH;

                  const hasExpense = d.expenseAmount > 0;
                  const hasIncome = d.incomeAmount > 0;
                  const hasAny = hasExpense || hasIncome;
                  const isHovered = hoveredDay?.day === d.day;
                  const isPeakExp =
                    peakExpenseDay?.day === d.day && hasExpense;
                  const isPeakInc =
                    peakIncomeDay?.day === d.day && hasIncome;

                  return (
                    <g
                      key={d.day}
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredDay(d)}
                      onClick={() => setHoveredDay(d)}
                    >
                      {/* Invisible hover bar for easy clicking */}
                      <rect
                        x={x - chartW / (daysInMonth * 2)}
                        y={paddingY}
                        width={chartW / daysInMonth}
                        height={chartH}
                        fill="transparent"
                      />

                      {/* Income Dot (Green) */}
                      {(filterMode === "all" || filterMode === "income") && (
                        <circle
                          cx={x}
                          cy={incY}
                          r={
                            isHovered && hasIncome
                              ? 6.5
                              : isPeakInc
                              ? 5.5
                              : hasIncome
                              ? 4.5
                              : 2
                          }
                          fill={hasIncome ? "#059669" : "#E2E8F0"}
                          stroke="#ffffff"
                          strokeWidth={hasIncome ? 2 : 0.5}
                          className="transition-all duration-150"
                        />
                      )}

                      {/* Expense Dot (Red/Crimson) */}
                      {(filterMode === "all" || filterMode === "expense") && (
                        <circle
                          cx={x}
                          cy={expY}
                          r={
                            isHovered && hasExpense
                              ? 6.5
                              : isPeakExp
                              ? 5.5
                              : hasExpense
                              ? 4.5
                              : 2
                          }
                          fill={hasExpense ? "#B91C1C" : "#E2E8F0"}
                          stroke="#ffffff"
                          strokeWidth={hasExpense ? 2 : 0.5}
                          className="transition-all duration-150"
                        />
                      )}

                      {/* X-axis label */}
                      {(d.day % 5 === 0 ||
                        d.day === 1 ||
                        d.day === daysInMonth ||
                        isHovered) && (
                        <text
                          x={x}
                          y={svgHeight - 10}
                          textAnchor="middle"
                          fill={isHovered ? "#854D0E" : "#78716C"}
                          fontSize="11"
                          fontWeight={isHovered ? "900" : "600"}
                        >
                          Tgl {d.day}
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Interactive Highlight Card (Detail Hari Terpilih: Masuk & Keluar) */}
          <div className="p-4 sm:p-5 rounded-3xl bg-[#FAF7F2] border border-[#E8E2D8] flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-all shadow-2xs">
            <div className="flex items-start gap-3.5 flex-1 min-w-0">
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold flex-shrink-0 border ${
                  activeDetailDay.expenseAmount > 0 ||
                  activeDetailDay.incomeAmount > 0
                    ? "bg-white text-[#854D0E] border-[#E8E2D8] shadow-2xs"
                    : "bg-stone-100 text-stone-400 border-stone-200"
                }`}
              >
                <Calendar className="w-5 h-5" />
              </div>

              <div className="space-y-2 min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] uppercase font-black text-stone-400 tracking-wider">
                    Detail Hari Terpilih:
                  </span>
                  <span className="text-sm font-black text-stone-900">
                    {formatTanggalIndo(activeDetailDay.dateStr)} ({activeDetailDay.dayName})
                  </span>

                  {peakExpenseDay?.day === activeDetailDay.day &&
                    activeDetailDay.expenseAmount > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-200">
                        🔥 Pengeluaran Tertinggi
                      </span>
                    )}

                  {peakIncomeDay?.day === activeDetailDay.day &&
                    activeDetailDay.incomeAmount > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                        ⭐ Pemasukan Tertinggi
                      </span>
                    )}
                </div>

                {/* List of Transactions (Masuk & Keluar) */}
                <div className="flex flex-wrap items-center gap-2">
                  {activeDetailDay.incomeItems.length === 0 &&
                  activeDetailDay.expenseItems.length === 0 ? (
                    <span className="text-xs text-stone-400 italic">
                      Tidak ada transaksi (uang masuk maupun keluar) pada tanggal ini.
                    </span>
                  ) : (
                    <>
                      {/* Incomes (Green) */}
                      {activeDetailDay.incomeItems.map((inc) => (
                        <span
                          key={`inc-${inc.id}`}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white border border-emerald-200 text-xs font-bold text-stone-800 shadow-2xs"
                        >
                          <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                          <span className="truncate max-w-[120px] sm:max-w-xs">
                            {inc.source || inc.category || inc.note || "Pemasukan"}
                          </span>
                          <span className="text-emerald-700 font-black">
                            (+{formatRupiah(inc.amount)})
                          </span>
                        </span>
                      ))}

                      {/* Expenses (Red) */}
                      {activeDetailDay.expenseItems.map((exp) => (
                        <span
                          key={`exp-${exp.id}`}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white border border-rose-200 text-xs font-bold text-stone-800 shadow-2xs"
                        >
                          <ArrowDownRight className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
                          <span className="truncate max-w-[120px] sm:max-w-xs">
                            {exp.title || exp.note || exp.category}
                          </span>
                          <span className="text-rose-700 font-black">
                            (-{formatRupiah(exp.amount)})
                          </span>
                        </span>
                      ))}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Right Summary Column for Selected Day */}
            <div className="flex lg:flex-col items-center lg:items-end justify-between border-t lg:border-t-0 pt-3 lg:pt-0 border-[#E8E2D8] gap-1 flex-shrink-0">
              <span className="block text-[10px] uppercase font-bold text-stone-400">
                Arus Kas Hari Ini
              </span>
              <div className="text-right">
                <span
                  className={`text-lg sm:text-xl font-black ${
                    activeDetailDay.netAmount > 0
                      ? "text-emerald-700"
                      : activeDetailDay.netAmount < 0
                      ? "text-rose-700"
                      : "text-stone-700"
                  }`}
                >
                  {activeDetailDay.netAmount > 0 ? "+" : ""}
                  {formatRupiah(activeDetailDay.netAmount)}
                </span>
                <div className="text-[10px] text-stone-500 font-semibold space-x-2">
                  <span>Masuk: +{formatRupiah(activeDetailDay.incomeAmount)}</span>
                  <span>•</span>
                  <span>Keluar: -{formatRupiah(activeDetailDay.expenseAmount)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

"use client";

import React, { useState, useMemo } from "react";
import {
  BarChart3,
  LineChart,
  Calendar,
  TrendingDown,
  Sparkles,
  Info,
  Receipt,
  ArrowDownRight,
} from "lucide-react";
import { ExpenseItem } from "@/types/finance";
import { formatRupiah, formatTanggalIndo } from "@/lib/storage";

interface DailyExpenseChartProps {
  expenses: ExpenseItem[];
  selectedMonth: string; // format YYYY-MM
  onOpenQuickAdd?: () => void;
}

interface DayExpenseData {
  day: number;
  dateStr: string;
  dayName: string;
  totalAmount: number;
  items: ExpenseItem[];
}

export const DailyExpenseChart: React.FC<DailyExpenseChartProps> = ({
  expenses,
  selectedMonth,
  onOpenQuickAdd,
}) => {
  const [chartType, setChartType] = useState<"bar" | "line">("bar");
  const [hoveredDay, setHoveredDay] = useState<DayExpenseData | null>(null);

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

  // Filter expenses for selected month
  const monthExpenses = useMemo(() => {
    return expenses.filter((e) => e.month === selectedMonth);
  }, [expenses, selectedMonth]);

  // Aggregate daily data (Day 1 to daysInMonth)
  const { dailyData, maxDailyAmount, totalExpense, activeDaysCount, peakDay } =
    useMemo(() => {
      const data: DayExpenseData[] = [];
      let total = 0;
      let maxVal = 0;
      let peak: DayExpenseData | null = null;

      for (let d = 1; d <= daysInMonth; d++) {
        const dayStr = String(d).padStart(2, "0");
        const dateStr = `${selectedMonth}-${dayStr}`;
        const dDate = new Date(year, monthIndex, d);
        const dayName = dDate.toLocaleDateString("id-ID", { weekday: "short" });
        const items = monthExpenses.filter((e) => e.date === dateStr);
        const dayTotal = items.reduce((sum, item) => sum + item.amount, 0);

        total += dayTotal;
        if (dayTotal > maxVal) {
          maxVal = dayTotal;
        }

        const dayEntry: DayExpenseData = {
          day: d,
          dateStr,
          dayName,
          totalAmount: dayTotal,
          items,
        };

        if (dayTotal > 0 && (!peak || dayTotal > peak.totalAmount)) {
          peak = dayEntry;
        }

        data.push(dayEntry);
      }

      const activeDays = data.filter((d) => d.totalAmount > 0).length;

      return {
        dailyData: data,
        maxDailyAmount: maxVal > 0 ? maxVal : 100000,
        totalExpense: total,
        activeDaysCount: activeDays,
        peakDay: peak,
      };
    }, [daysInMonth, year, monthIndex, selectedMonth, monthExpenses]);

  // Rata-rata pengeluaran per hari aktif
  const avgPerActiveDay =
    activeDaysCount > 0 ? Math.round(totalExpense / activeDaysCount) : 0;
  const avgPerDayAll = Math.round(totalExpense / daysInMonth);

  // Active highlighted day (hovered or peak or first day with expense)
  const activeDetailDay =
    hoveredDay ||
    peakDay ||
    dailyData.find((d) => d.totalAmount > 0) ||
    dailyData[0];

  // SVG dimensions for Line Chart
  const svgWidth = 1000;
  const svgHeight = 220;
  const paddingX = 35;
  const paddingY = 30;
  const chartW = svgWidth - paddingX * 2;
  const chartH = svgHeight - paddingY * 2;

  // Build points for Line/Area chart
  const linePoints = useMemo(() => {
    return dailyData.map((d, index) => {
      const x = paddingX + (index / (daysInMonth - 1)) * chartW;
      const ratio = d.totalAmount / maxDailyAmount;
      const y = svgHeight - paddingY - ratio * chartH;
      return { x, y, data: d };
    });
  }, [dailyData, daysInMonth, chartW, chartH, maxDailyAmount, svgHeight]);

  const linePathD = useMemo(() => {
    if (linePoints.length === 0) return "";
    return linePoints.reduce((acc, pt, idx) => {
      return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
    }, "");
  }, [linePoints]);

  const areaPathD = useMemo(() => {
    if (linePoints.length === 0) return "";
    const firstX = linePoints[0].x;
    const lastX = linePoints[linePoints.length - 1].x;
    const bottomY = svgHeight - paddingY;
    return `${linePathD} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  }, [linePathD, linePoints, svgHeight]);

  return (
    <div className="rounded-3xl bg-white border border-[#FFD9D9] p-6 sm:p-7 shadow-sm space-y-6">
      {/* Header & View Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#FFD9D9] text-[#991213] flex items-center justify-center font-bold shadow-xs">
            <BarChart3 className="w-5 h-5 text-[#991213]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-base sm:text-lg text-slate-900">
                Grafik Pengeluaran Harian
              </h3>
              <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-[#FFF0F0] text-[#991213] border border-[#FFD9D9]">
                {monthLabel}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Pantau akumulasi belanja riil yang dilakukan setiap harinya (Tanggal 1 - {daysInMonth})
            </p>
          </div>
        </div>

        {/* Chart type switch */}
        <div className="inline-flex items-center p-1 bg-[#FFF0F0] rounded-xl border border-[#FFD9D9] self-start sm:self-auto">
          <button
            onClick={() => setChartType("bar")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              chartType === "bar"
                ? "bg-[#991213] text-white shadow-xs"
                : "text-slate-600 hover:text-[#991213]"
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Batang</span>
          </button>
          <button
            onClick={() => setChartType("line")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              chartType === "line"
                ? "bg-[#991213] text-white shadow-xs"
                : "text-slate-600 hover:text-[#991213]"
            }`}
          >
            <LineChart className="w-3.5 h-3.5" />
            <span>Garis Tren</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-[#FFF9F9] border border-[#FFD9D9]/80">
          <span className="block text-[10px] uppercase font-bold text-slate-500">
            Total Pengeluaran Bulan Ini
          </span>
          <span className="text-base sm:text-lg font-black text-[#991213]">
            {formatRupiah(totalExpense)}
          </span>
          <span className="block text-[10px] text-slate-400 font-medium mt-0.5">
            {monthExpenses.length} transaksi tercatat
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#FFF9F9] border border-[#FFD9D9]/80">
          <span className="block text-[10px] uppercase font-bold text-slate-500">
            Rata-rata Hari Belanja
          </span>
          <span className="text-base sm:text-lg font-black text-rose-700">
            {formatRupiah(avgPerActiveDay)}
          </span>
          <span className="block text-[10px] text-slate-400 font-medium mt-0.5">
            {activeDaysCount} dari {daysInMonth} hari aktif belanja
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#FFF9F9] border border-[#FFD9D9]/80">
          <span className="block text-[10px] uppercase font-bold text-slate-500">
            Rata-rata Harian (30 Hari)
          </span>
          <span className="text-base sm:text-lg font-black text-slate-800">
            {formatRupiah(avgPerDayAll)}
          </span>
          <span className="block text-[10px] text-slate-400 font-medium mt-0.5">
            Estimasi laju bakar harian
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#FFF9F9] border border-[#FFD9D9]/80">
          <span className="block text-[10px] uppercase font-bold text-slate-500">
            Pengeluaran Tertinggi
          </span>
          <span className="text-base sm:text-lg font-black text-[#991213]">
            {peakDay ? formatRupiah(peakDay.totalAmount) : "Rp 0"}
          </span>
          <span className="block text-[10px] text-amber-700 font-bold mt-0.5 truncate">
            {peakDay ? `Tgl ${peakDay.day} ${peakDay.dayName}` : "-"}
          </span>
        </div>
      </div>

      {/* Main Chart Canvas */}
      {monthExpenses.length === 0 ? (
        <div className="text-center py-14 px-4 bg-[#FFF9F9] rounded-2xl border border-dashed border-[#FFD9D9] space-y-3">
          <div className="w-12 h-12 rounded-full bg-[#FFF0F0] text-[#991213] flex items-center justify-center mx-auto">
            <TrendingDown className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800">
              Belum Ada Pengeluaran pada {monthLabel}
            </h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              Catat pengeluaran baru untuk melihat pola dan grafik distribusi pengeluaran harian Anda secara real-time.
            </p>
          </div>
          {onOpenQuickAdd && (
            <button
              onClick={onOpenQuickAdd}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-[#991213] text-white text-xs font-black rounded-xl hover:bg-[#7f0e0f] transition-all"
            >
              <Receipt className="w-3.5 h-3.5" />
              + Catat Pengeluaran Sekarang
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Batang Mode */}
          {chartType === "bar" && (
            <div className="overflow-x-auto pb-2 pt-4">
              <div
                className="min-w-[680px] h-64 flex items-end gap-1.5 sm:gap-2 px-2 pb-6 border-b border-[#FFD9D9]/60 relative"
              >
                {/* Horizontal guide lines */}
                <div className="absolute inset-x-0 top-2 border-b border-dashed border-slate-200 pointer-events-none flex justify-between text-[10px] text-slate-400 font-semibold px-2">
                  <span>Maks: {formatRupiah(maxDailyAmount)}</span>
                </div>
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-b border-dashed border-slate-200 pointer-events-none flex justify-between text-[10px] text-slate-400 font-semibold px-2">
                  <span>50%: {formatRupiah(maxDailyAmount / 2)}</span>
                </div>

                {dailyData.map((d) => {
                  const heightPercent =
                    maxDailyAmount > 0
                      ? Math.min(100, Math.max(d.totalAmount > 0 ? 8 : 2, (d.totalAmount / maxDailyAmount) * 100))
                      : 2;
                  const isHovered = hoveredDay?.day === d.day;
                  const isPeak = peakDay?.day === d.day && d.totalAmount > 0;
                  const hasSpent = d.totalAmount > 0;

                  return (
                    <div
                      key={d.day}
                      onMouseEnter={() => setHoveredDay(d)}
                      onClick={() => setHoveredDay(d)}
                      className="flex-1 flex flex-col items-center justify-end h-full group cursor-pointer relative"
                    >
                      {/* Floating tooltip on hover or peak */}
                      {(isHovered || isPeak) && (
                        <div
                          className={`absolute -top-9 z-20 whitespace-nowrap px-2 py-0.5 rounded-md text-[10px] font-black shadow-md transition-all ${
                            isPeak && !isHovered
                              ? "bg-amber-500 text-white"
                              : "bg-[#991213] text-white"
                          }`}
                        >
                          {d.totalAmount > 0 ? formatRupiah(d.totalAmount) : "Rp 0"}
                        </div>
                      )}

                      {/* Bar Pillar */}
                      <div className="w-full max-w-[24px] h-[180px] flex items-end justify-center">
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className={`w-full rounded-t-lg transition-all duration-300 ${
                            hasSpent
                              ? isPeak
                                ? "bg-gradient-to-t from-[#991213] via-rose-600 to-amber-500 shadow-sm shadow-rose-900/30 ring-1 ring-amber-400"
                                : isHovered
                                ? "bg-gradient-to-t from-[#7f0e0f] to-rose-600 ring-2 ring-[#991213]"
                                : "bg-gradient-to-t from-[#991213] to-rose-500 hover:from-[#7f0e0f] hover:to-rose-600"
                              : "bg-[#FFD9D9]/30 hover:bg-[#FFD9D9]/60 rounded-t-sm"
                          }`}
                        />
                      </div>

                      {/* X-axis Day Label */}
                      <div className="mt-2 text-center">
                        <span
                          className={`block text-[11px] font-black transition-colors ${
                            hasSpent
                              ? isPeak
                                ? "text-[#991213] underline font-extrabold"
                                : "text-slate-900 font-black"
                              : "text-slate-400 font-medium"
                          }`}
                        >
                          {d.day}
                        </span>
                        <span className="block text-[9px] text-slate-400 leading-tight">
                          {d.dayName}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Garis / Area Mode */}
          {chartType === "line" && (
            <div className="overflow-x-auto pb-2">
              <div className="min-w-[680px]">
                <svg
                  viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                  className="w-full h-64 overflow-visible"
                >
                  <defs>
                    <linearGradient
                      id="expenseAreaGrad"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#991213" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#991213" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Grid lines */}
                  <line
                    x1={paddingX}
                    y1={paddingY}
                    x2={svgWidth - paddingX}
                    y2={paddingY}
                    stroke="#e2e8f0"
                    strokeDasharray="4 4"
                  />
                  <line
                    x1={paddingX}
                    y1={svgHeight / 2}
                    x2={svgWidth - paddingX}
                    y2={svgHeight / 2}
                    stroke="#e2e8f0"
                    strokeDasharray="4 4"
                  />
                  <line
                    x1={paddingX}
                    y1={svgHeight - paddingY}
                    x2={svgWidth - paddingX}
                    y2={svgHeight - paddingY}
                    stroke="#cbd5e1"
                  />

                  {/* Labels on Y Axis */}
                  <text
                    x={paddingX}
                    y={paddingY - 8}
                    fill="#94a3b8"
                    fontSize="11"
                    fontWeight="700"
                  >
                    Maks: {formatRupiah(maxDailyAmount)}
                  </text>
                  <text
                    x={paddingX}
                    y={svgHeight / 2 - 8}
                    fill="#94a3b8"
                    fontSize="11"
                    fontWeight="700"
                  >
                    50%: {formatRupiah(maxDailyAmount / 2)}
                  </text>

                  {/* Area fill */}
                  {areaPathD && (
                    <path
                      d={areaPathD}
                      fill="url(#expenseAreaGrad)"
                      className="transition-all duration-300"
                    />
                  )}

                  {/* Line stroke */}
                  {linePathD && (
                    <path
                      d={linePathD}
                      fill="none"
                      stroke="#991213"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="transition-all duration-300"
                    />
                  )}

                  {/* Data Points */}
                  {linePoints.map((pt) => {
                    const hasSpent = pt.data.totalAmount > 0;
                    const isHovered = hoveredDay?.day === pt.data.day;
                    const isPeak = peakDay?.day === pt.data.day && hasSpent;

                    return (
                      <g
                        key={pt.data.day}
                        className="cursor-pointer"
                        onMouseEnter={() => setHoveredDay(pt.data)}
                        onClick={() => setHoveredDay(pt.data)}
                      >
                        {/* Interactive Dot */}
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r={isHovered ? 7 : isPeak ? 6 : hasSpent ? 4.5 : 2.5}
                          fill={hasSpent ? (isPeak ? "#f59e0b" : "#991213") : "#cbd5e1"}
                          stroke="#ffffff"
                          strokeWidth={hasSpent ? 2 : 1}
                          className="transition-all duration-150 hover:scale-125"
                        />

                        {/* X-axis label */}
                        {(pt.data.day % 5 === 0 || pt.data.day === 1 || pt.data.day === daysInMonth || isHovered) && (
                          <text
                            x={pt.x}
                            y={svgHeight - 10}
                            textAnchor="middle"
                            fill={isHovered ? "#991213" : "#64748b"}
                            fontSize="11"
                            fontWeight={isHovered || isPeak ? "900" : "600"}
                          >
                            Tgl {pt.data.day}
                          </text>
                        )}
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>
          )}

          {/* Interactive Highlight Card (Detail Hari Terpilih) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#FFF9F9] border border-[#FFD9D9] flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all">
            <div className="flex items-start sm:items-center gap-3">
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold flex-shrink-0 ${
                  activeDetailDay.totalAmount > 0
                    ? "bg-[#FFD9D9] text-[#991213]"
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase font-black text-slate-400">
                    Detail Hari Terpilih:
                  </span>
                  <span className="text-sm font-black text-[#991213]">
                    {formatTanggalIndo(activeDetailDay.dateStr)} ({activeDetailDay.dayName})
                  </span>
                  {peakDay?.day === activeDetailDay.day && activeDetailDay.totalAmount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-300">
                      👑 Pengeluaran Tertinggi
                    </span>
                  )}
                </div>

                <div className="mt-1 flex flex-wrap items-center gap-2">
                  {activeDetailDay.items.length === 0 ? (
                    <span className="text-xs text-slate-500 italic">
                      Tidak ada pengeluaran pada tanggal ini.
                    </span>
                  ) : (
                    activeDetailDay.items.map((it) => (
                      <span
                        key={it.id}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white border border-[#FFD9D9] text-xs font-bold text-slate-800 shadow-2xs"
                      >
                        <ArrowDownRight className="w-3.5 h-3.5 text-rose-600" />
                        <span>{it.title || it.note || it.category}</span>
                        <span className="text-rose-600 font-black">
                          ({formatRupiah(it.amount)})
                        </span>
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="text-left sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0 border-[#FFD9D9]">
              <span className="block text-[10px] uppercase font-bold text-slate-400">
                Total Belanja Hari Ini
              </span>
              <span className="text-lg sm:text-xl font-black text-[#991213]">
                {formatRupiah(activeDetailDay.totalAmount)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


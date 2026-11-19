"use client";

import React, { useState, useMemo } from "react";
import {
  TrendingUp,
  ArrowDownRight,
  ArrowUpRight,
  Coins,
  ShieldCheck,
  BarChart3,
  LineChart as LineChartIcon,
  Calendar,
  Sparkles,
} from "lucide-react";
import { MoneyMarketProduct, SavingsAllocation } from "@/types/finance";
import {
  formatRupiah,
  formatTanggalIndo,
  calculateMoneyMarketProfit,
} from "@/lib/storage";

interface InvestmentChartProps {
  moneyMarket: MoneyMarketProduct[];
  savings?: SavingsAllocation[];
  selectedMonth?: string;
}

interface TimelinePoint {
  dateStr: string;
  dayLabel: string;
  capital: number;
  profit: number;
  totalValue: number;
  inflow: number;
  outflow: number;
}

export const InvestmentChart: React.FC<InvestmentChartProps> = ({
  moneyMarket,
  savings = [],
  selectedMonth = "2026-11",
}) => {
  const [chartMode, setChartMode] = useState<"trend" | "cashflow">("trend");
  const [hoveredPoint, setHoveredPoint] = useState<TimelinePoint | null>(null);

  // Parse Year and Month
  const { year, monthIndex, daysInMonth, monthLabel } = useMemo(() => {
    const parts = selectedMonth.split("-");
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

  // Aggregate Total Masuk, Total Keluar, Net Capital, and Profits
  const summary = useMemo(() => {
    let totalMasuk = 0;
    let totalKeluar = 0;
    let totalCurrentCapital = 0;
    let totalEstimatedProfit = 0;
    let totalCurrentValue = 0;

    moneyMarket.forEach((prod) => {
      totalCurrentCapital += prod.initialCapital;

      const calc = calculateMoneyMarketProfit(
        prod.initialCapital,
        prod.returnRatePa,
        prod.startDate,
        prod.accumulatedReturn
      );
      totalEstimatedProfit += calc.estimatedProfit;
      totalCurrentValue += calc.totalValue;

      // Scan history for inflows & outflows
      if (prod.history && prod.history.length > 0) {
        prod.history.forEach((h) => {
          if (h.type === "topup") {
            totalMasuk += h.amount;
          } else if (h.type === "tarik") {
            totalKeluar += h.amount;
          }
        });
      } else {
        totalMasuk += prod.initialCapital;
      }
    });

    // Fallback jika belum ada history detail
    if (totalMasuk < totalCurrentCapital) {
      totalMasuk = totalCurrentCapital + totalKeluar;
    }

    return {
      totalMasuk,
      totalKeluar,
      netCapital: totalCurrentCapital,
      totalProfit: totalEstimatedProfit,
      totalValue: totalCurrentValue > 0 ? totalCurrentValue : totalCurrentCapital + totalEstimatedProfit,
    };
  }, [moneyMarket]);

  // Build Daily Timeline Points for the Selected Month
  const timelinePoints: TimelinePoint[] = useMemo(() => {
    const points: TimelinePoint[] = [];

    // Collect all history transactions across products
    const allHistory: Array<{
      date: string;
      type: "topup" | "tarik" | "deviden";
      amount: number;
    }> = [];

    moneyMarket.forEach((p) => {
      if (p.history && p.history.length > 0) {
        p.history.forEach((h) => allHistory.push(h));
      } else if (p.initialCapital > 0) {
        allHistory.push({
          date: p.startDate,
          type: "topup",
          amount: p.initialCapital,
        });
      }
    });

    const averageRate =
      moneyMarket.length > 0
        ? moneyMarket.reduce((sum, p) => sum + p.returnRatePa, 0) /
          moneyMarket.length
        : 5.5;

    for (let d = 1; d <= daysInMonth; d++) {
      const dayStr = String(d).padStart(2, "0");
      const dateStr = `${selectedMonth}-${dayStr}`;
      const dDate = new Date(year, monthIndex, d);
      const dayLabel = `${d} ${dDate.toLocaleDateString("id-ID", {
        month: "short",
      })}`;

      // Calculate inflows and outflows on this specific day
      const dayInflows = allHistory
        .filter((h) => h.date === dateStr && h.type === "topup")
        .reduce((sum, h) => sum + h.amount, 0);

      const dayOutflows = allHistory
        .filter((h) => h.date === dateStr && h.type === "tarik")
        .reduce((sum, h) => sum + h.amount, 0);

      // Total capital up to this day
      const capitalUpToDay = allHistory
        .filter((h) => h.date <= dateStr)
        .reduce((sum, h) => {
          if (h.type === "topup") return sum + h.amount;
          if (h.type === "tarik") return Math.max(0, sum - h.amount);
          return sum;
        }, 0);

      // Estimate progressive return up to this day
      const dailyRate = averageRate / 100 / 365;
      const profitUpToDay = Math.round(capitalUpToDay * dailyRate * d);
      const totalVal = capitalUpToDay + profitUpToDay;

      points.push({
        dateStr,
        dayLabel,
        capital: capitalUpToDay,
        profit: profitUpToDay,
        totalValue: totalVal,
        inflow: dayInflows,
        outflow: dayOutflows,
      });
    }

    return points;
  }, [daysInMonth, selectedMonth, year, monthIndex, moneyMarket]);

  // Chart Scaling & SVG Coordinates
  const svgWidth = 1000;
  const svgHeight = 240;
  const paddingX = 40;
  const paddingY = 32;
  const chartW = svgWidth - paddingX * 2;
  const chartH = svgHeight - paddingY * 2;

  const maxVal = useMemo(() => {
    const highestVal = Math.max(
      ...timelinePoints.map((p) => Math.max(p.totalValue, p.capital, p.inflow, p.outflow)),
      summary.totalValue,
      1000000
    );
    return Math.ceil(highestVal * 1.15);
  }, [timelinePoints, summary.totalValue]);

  // SVG Line Path for Portfolio Value
  const linePoints = useMemo(() => {
    return timelinePoints.map((p, idx) => {
      const x = paddingX + (idx / (timelinePoints.length - 1)) * chartW;
      const ratio = p.totalValue / maxVal;
      const y = svgHeight - paddingY - ratio * chartH;
      return { x, y, data: p };
    });
  }, [timelinePoints, chartW, chartH, maxVal, svgHeight]);

  const capitalPoints = useMemo(() => {
    return timelinePoints.map((p, idx) => {
      const x = paddingX + (idx / (timelinePoints.length - 1)) * chartW;
      const ratio = p.capital / maxVal;
      const y = svgHeight - paddingY - ratio * chartH;
      return { x, y, data: p };
    });
  }, [timelinePoints, chartW, chartH, maxVal, svgHeight]);

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

  const capitalLinePathD = useMemo(() => {
    if (capitalPoints.length === 0) return "";
    return capitalPoints.reduce((acc, pt, idx) => {
      return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
    }, "");
  }, [capitalPoints]);

  const activeDetailPoint = hoveredPoint || timelinePoints[timelinePoints.length - 1];

  return (
    <div className="rounded-3xl bg-white border border-[#FFD9D9] p-6 sm:p-7 shadow-sm space-y-6 animate-fade-in">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#FFD9D9] text-[#8B0000] flex items-center justify-center font-bold shadow-xs">
            <TrendingUp className="w-5 h-5 text-[#8B0000]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-base sm:text-lg text-slate-900">
                Grafik Portofolio & Arus Investasi
              </h3>
              <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-[#FFF0F0] text-[#8B0000] border border-[#FFD9D9]">
                {monthLabel}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Pantau akumulasi modal masuk (beli/top up), modal keluar (jual/tarik), serta pertumbuhan nilai aset.
            </p>
          </div>
        </div>

        {/* Mode Toggle Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-[#FFF0F0] rounded-xl border border-[#FFD9D9] text-xs self-start sm:self-auto">
          <button
            onClick={() => setChartMode("trend")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
              chartMode === "trend"
                ? "bg-[#8B0000] text-white shadow-xs"
                : "text-slate-600 hover:text-[#8B0000]"
            }`}
          >
            <LineChartIcon className="w-3.5 h-3.5" />
            <span>Garis Tren Aset</span>
          </button>
          <button
            onClick={() => setChartMode("cashflow")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
              chartMode === "cashflow"
                ? "bg-[#8B0000] text-white shadow-xs"
                : "text-slate-600 hover:text-[#8B0000]"
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Arus Masuk vs Keluar</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total Masuk */}
        <div className="p-3.5 rounded-2xl bg-[#FFF9F9] border border-[#FFD9D9]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-500">
              Total Investasi Masuk
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
          <div className="text-base sm:text-lg font-black text-emerald-700 mt-1">
            {formatRupiah(summary.totalMasuk)}
          </div>
          <span className="text-[10px] text-slate-500 block">
            Setoran pokok + Top up modal
          </span>
        </div>

        {/* Total Keluar */}
        <div className="p-3.5 rounded-2xl bg-[#FFF9F9] border border-[#FFD9D9]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-500">
              Total Investasi Keluar
            </span>
            <span className="w-2 h-2 rounded-full bg-rose-500" />
          </div>
          <div className="text-base sm:text-lg font-black text-rose-600 mt-1">
            {formatRupiah(summary.totalKeluar)}
          </div>
          <span className="text-[10px] text-slate-500 block">
            Dana dijual / ditarik tunai
          </span>
        </div>

        {/* Modal Bersih Aktif */}
        <div className="p-3.5 rounded-2xl bg-[#FFF9F9] border border-[#FFD9D9]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-500">
              Modal Bersih Aktif
            </span>
            <span className="w-2 h-2 rounded-full bg-[#8B0000]" />
          </div>
          <div className="text-base sm:text-lg font-black text-[#8B0000] mt-1">
            {formatRupiah(summary.netCapital)}
          </div>
          <span className="text-[10px] text-slate-500 block">
            Masuk dikurangi keluar
          </span>
        </div>

        {/* Nilai Total & Keuntungan */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#FFF0F0] to-[#FFE5E5] border border-[#FFD9D9]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-black text-[#8B0000]">
              Nilai Portofolio Riil
            </span>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-md">
              +{formatRupiah(summary.totalProfit)}
            </span>
          </div>
          <div className="text-base sm:text-lg font-black text-slate-900 mt-1">
            {formatRupiah(summary.totalValue)}
          </div>
          <span className="text-[10px] text-[#8B0000] font-semibold block">
            Modal bersih + Akumulasi profit
          </span>
        </div>
      </div>

      {/* Main Visual Display */}
      {chartMode === "trend" ? (
        /* MODE 1: Smooth Area / Line Chart */
        <div className="relative pt-2 pb-1">
          {/* Legend */}
          <div className="flex items-center justify-end gap-4 mb-2 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#8B0000]" />
              <span className="font-bold text-slate-800 text-[11px]">
                Nilai Portofolio (Modal + Imbal Hasil)
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-slate-400 border border-dashed border-slate-500" />
              <span className="text-slate-500 text-[11px]">Modal Pokok Bersih</span>
            </div>
          </div>

          <div className="relative w-full overflow-hidden">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-44 sm:h-56 select-none"
            >
              <defs>
                <linearGradient id="invGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8B0000" stopOpacity="0.30" />
                  <stop offset="60%" stopColor="#FFD9D9" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#FFF9F9" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal Reference Grid Lines */}
              <line
                x1={paddingX}
                y1={paddingY}
                x2={svgWidth - paddingX}
                y2={paddingY}
                stroke="#FFD9D9"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              <line
                x1={paddingX}
                y1={paddingY + chartH / 2}
                x2={svgWidth - paddingX}
                y2={paddingY + chartH / 2}
                stroke="#FFD9D9"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              <line
                x1={paddingX}
                y1={svgHeight - paddingY}
                x2={svgWidth - paddingX}
                y2={svgHeight - paddingY}
                stroke="#FFD9D9"
                strokeWidth="1"
              />

              {/* Grid Value Labels */}
              <text
                x={paddingX}
                y={paddingY - 6}
                fill="#8f1012"
                fontSize="10"
                fontWeight="700"
              >
                Maks: {formatRupiah(maxVal)}
              </text>
              <text
                x={paddingX}
                y={paddingY + chartH / 2 - 6}
                fill="#94a3b8"
                fontSize="10"
              >
                50%: {formatRupiah(maxVal / 2)}
              </text>

              {/* Gradient Area */}
              {areaPathD && (
                <path d={areaPathD} fill="url(#invGradient)" />
              )}

              {/* Capital Dashed Line */}
              {capitalLinePathD && (
                <path
                  d={capitalLinePathD}
                  fill="none"
                  stroke="#94a3b8"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />
              )}

              {/* Main Curve Line */}
              {linePathD && (
                <path
                  d={linePathD}
                  fill="none"
                  stroke="#8B0000"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Interactive Hit Areas & Highlight Dots */}
              {linePoints.map((pt, i) => {
                const isHovered = hoveredPoint?.dateStr === pt.data.dateStr;
                return (
                  <g key={i}>
                    {/* Hover vertical crosshair */}
                    {isHovered && (
                      <line
                        x1={pt.x}
                        y1={paddingY}
                        x2={pt.x}
                        y2={svgHeight - paddingY}
                        stroke="#8B0000"
                        strokeWidth="1.5"
                        strokeDasharray="2 2"
                      />
                    )}

                    {/* Point dot if hovered or has significant transaction */}
                    {(isHovered || pt.data.inflow > 0 || pt.data.outflow > 0) && (
                      <circle
                        cx={pt.x}
                        y={pt.y}
                        r={isHovered ? 6 : 4}
                        fill={pt.data.outflow > 0 ? "#e11d48" : "#8B0000"}
                        stroke="#ffffff"
                        strokeWidth="2"
                        className="transition-all"
                      />
                    )}

                    {/* Invisible interaction hotspot */}
                    <rect
                      x={pt.x - chartW / (timelinePoints.length * 2)}
                      y={0}
                      width={chartW / timelinePoints.length}
                      height={svgHeight}
                      fill="transparent"
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredPoint(pt.data)}
                      onMouseLeave={() => setHoveredPoint(null)}
                    />
                  </g>
                );
              })}
            </svg>

            {/* X-axis Day Labels */}
            <div className="flex justify-between px-6 text-[10px] text-slate-500 font-semibold pt-1">
              <span>Tgl 1</span>
              <span>Tgl 5</span>
              <span>Tgl 10</span>
              <span>Tgl 15</span>
              <span>Tgl 20</span>
              <span>Tgl 25</span>
              <span>Tgl {daysInMonth}</span>
            </div>
          </div>
        </div>
      ) : (
        /* MODE 2: Cashflow Masuk vs Keluar Visual Comparison */
        <div className="space-y-4 pt-2">
          <div className="p-5 rounded-2xl bg-[#FFF9F9] border border-[#FFD9D9] space-y-4">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>Rasio Investasi Masuk vs Keluar</span>
              <span className="text-[#8B0000]">
                {summary.totalMasuk > 0
                  ? `${Math.round(
                      (summary.totalKeluar / summary.totalMasuk) * 100
                    )}% dana telah dicairkan`
                  : "0%"}
              </span>
            </div>

            {/* Stacked Progress Bar */}
            <div className="h-4 w-full bg-[#FFD9D9]/50 rounded-full overflow-hidden flex">
              <div
                style={{
                  width: `${
                    summary.totalMasuk > 0
                      ? Math.min(
                          100,
                          Math.max(
                            5,
                            (summary.netCapital / summary.totalMasuk) * 100
                          )
                        )
                      : 100
                  }%`,
                }}
                className="bg-emerald-600 h-full transition-all flex items-center justify-center text-[9px] text-white font-bold"
                title="Modal Aktif"
              >
                Aktif
              </div>
              <div
                style={{
                  width: `${
                    summary.totalMasuk > 0
                      ? (summary.totalKeluar / summary.totalMasuk) * 100
                      : 0
                  }%`,
                }}
                className="bg-rose-500 h-full transition-all flex items-center justify-center text-[9px] text-white font-bold"
                title="Telah Ditarik"
              >
                {summary.totalKeluar > 0 ? "Ditarik" : ""}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-3 bg-white rounded-xl border border-emerald-200">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                  <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                  <span>Akumulasi Disetor (Inflow)</span>
                </div>
                <div className="text-lg font-black text-emerald-700 mt-1">
                  +{formatRupiah(summary.totalMasuk)}
                </div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-rose-200">
                <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800">
                  <ArrowDownRight className="w-4 h-4 text-rose-600" />
                  <span>Akumulasi Ditarik (Outflow)</span>
                </div>
                <div className="text-lg font-black text-rose-600 mt-1">
                  -{formatRupiah(summary.totalKeluar)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Active Details Callout */}
      {activeDetailPoint && (
        <div className="p-4 rounded-2xl bg-[#FFF9F9] border border-[#FFD9D9] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <Calendar className="w-4 h-4 text-[#8B0000]" />
            <div>
              <span className="font-bold text-slate-800 block">
                {activeDetailPoint.dayLabel} ({formatTanggalIndo(activeDetailPoint.dateStr)})
              </span>
              <span className="text-[11px] text-slate-500">
                Modal Pokok: {formatRupiah(activeDetailPoint.capital)} • Akumulasi Imbal Hasil:{" "}
                <span className="font-bold text-emerald-700">
                  +{formatRupiah(activeDetailPoint.profit)}
                </span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {activeDetailPoint.inflow > 0 && (
              <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
                +Masuk: {formatRupiah(activeDetailPoint.inflow)}
              </span>
            )}
            {activeDetailPoint.outflow > 0 && (
              <span className="text-rose-600 font-bold bg-rose-50 px-2 py-1 rounded-lg border border-rose-200">
                -Keluar: {formatRupiah(activeDetailPoint.outflow)}
              </span>
            )}
            <div className="text-right">
              <span className="text-[10px] text-slate-500 block">Total Nilai Hari Ini</span>
              <span className="text-sm font-black text-[#8B0000]">
                {formatRupiah(activeDetailPoint.totalValue)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


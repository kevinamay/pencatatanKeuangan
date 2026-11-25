"use client";

import React, { useState } from "react";
import { CatAnimation } from "./CatAnimations";
import { Sparkles, Heart, AlertCircle, RefreshCw } from "lucide-react";

interface CatCoachCardProps {
  totalIncome: number;
  totalExpense: number;
  totalSavings: number;
  remainingSalary: number;
  monthName: string;
}

export type CatMood = "happy" | "chill" | "alert";

export const CatCoachCard: React.FC<CatCoachCardProps> = ({
  totalIncome,
  totalExpense,
  totalSavings,
  remainingSalary,
  monthName,
}) => {
  const [speechIndex, setSpeechIndex] = useState(0);
  const [isSparkling, setIsSparkling] = useState(false);

  // Hitung Rasio Keuangan
  const savingsRate = totalIncome > 0 ? (totalSavings / totalIncome) * 100 : 0;
  const expenseRate = totalIncome > 0 ? (totalExpense / totalIncome) * 100 : 0;

  // Tentukan Mood Kucing Berdasarkan Data Riil
  let mood: CatMood = "chill";
  let moodTitle = "Tenang & Seimbang";
  let moodColor = "text-amber-800 bg-amber-50 border-amber-200";
  let moodIcon = "😺";

  if (remainingSalary < 0 || expenseRate > 85) {
    mood = "alert";
    moodTitle = "Mode Waspada!";
    moodColor = "text-rose-700 bg-rose-50 border-rose-200";
    moodIcon = "😿";
  } else if (savingsRate >= 20 && remainingSalary >= 0) {
    mood = "happy";
    moodTitle = "Sangat Bangga!";
    moodColor = "text-emerald-800 bg-emerald-50 border-emerald-200";
    moodIcon = "😸";
  }

  // Rekomendasi / Dialog Cerdas berdasarkan Mood
  const dialogOptions: Record<CatMood, string[]> = {
    happy: [
      `"Meow~! Tabunganmu bulan ini mencapai ${savingsRate.toFixed(0)}%! Aku sangat bangga padamu! 🐾"`,
      `"Keren sekali! Disiplin finansialmu bulan ${monthName} membuat masa depan kita makin cerah! 💰"`,
      `"Uang terkelola dengan harmoni wabi-sabi. Terus pertahankan alokasi tabungan ya! ✨"`,
      `"Purrr... Sisa gaji masih aman dan tabungan bertambah. Kucing tenang hidup senang! 🌸"`,
    ],
    chill: [
      `"Arus kas bulan ini berjalan stabil. Jangan lupa sisihkan sedikit untuk tabungan darurat ya! 🐾"`,
      `"Pengeluaranmu saat ini ${expenseRate.toFixed(0)}% dari gaji. Masih terkendali dengan baik! ☕"`,
      `"Tenang dan fokus. Catat setiap transaksi kecil agar tidak ada yang terlewat! 📝"`,
      `"Wabi-sabi: temukan kedamaian dalam kesederhanaan dan pengeluaran yang terukur. 🍃"`,
    ],
    alert: [
      `"Waduh meow! Pengeluaran sudah ${expenseRate.toFixed(0)}% dari gaji. Yuk rem dulu jajan di luar! 🚨"`,
      `"Perhatian: Arus kas sedang defisit atau mendekati limit. Prioritaskan kebutuhan pokok ya! 😿"`,
      `"Jangan panik, mari cek pos pengeluaran terbesar dan cari yang bisa dihemat minggu ini! 💡"`,
      `"Kucing sedang pasang kuping waspada! Tunda dulu belanja impulsif sampai bulan depan ya! 🐾"`,
    ],
  };

  const currentQuotes = dialogOptions[mood];
  const activeQuote = currentQuotes[speechIndex % currentQuotes.length];

  // Efek Suara Meow Sintetis (Web Audio API)
  const playMeowSound = () => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === "suspended") ctx.resume();

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      if (mood === "alert") {
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(330, now + 0.2);
      } else {
        osc.frequency.setValueAtTime(659.25, now);
        osc.frequency.exponentialRampToValueAtTime(987.77, now + 0.12);
        osc.frequency.exponentialRampToValueAtTime(1318.51, now + 0.22);
      }

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.06, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
    } catch {
      // Audio safety fallback
    }
  };

  const handlePetCat = () => {
    playMeowSound();
    setIsSparkling(true);
    setSpeechIndex((prev) => prev + 1);
    setTimeout(() => setIsSparkling(false), 600);
  };

  // Skor Kesehatan Finansial (0 - 100)
  const healthScore = Math.max(
    10,
    Math.min(
      100,
      Math.round(
        (savingsRate * 1.5) + (expenseRate <= 60 ? 40 : Math.max(0, 100 - expenseRate))
      )
    )
  );

  return (
    <div className="rounded-3xl bg-white border border-[#E8E2D8] p-5 sm:p-6 shadow-xs relative overflow-hidden transition-all duration-300">
      {/* Background Accent Pill */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left: Mascot & Interactive Dialog */}
        <div className="flex items-center gap-4 sm:gap-5 w-full sm:w-auto">
          {/* Interactive Mascot Avatar with Click Reaction */}
          <div
            onClick={handlePetCat}
            className="relative cursor-pointer group flex-shrink-0 active:scale-95 transition-transform"
            title="Ketuk kucing untuk menyapa & dengarkan saran!"
          >
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[#FAF7F2] border border-[#E8E2D8] flex items-center justify-center p-1 relative overflow-visible group-hover:border-amber-400/80 transition-colors">
              {mood === "happy" ? (
                <CatAnimation variant="laughing" className="w-18 h-18 sm:w-20 sm:h-20" />
              ) : mood === "alert" ? (
                <CatAnimation variant="peeking" className="w-18 h-18 sm:w-20 sm:h-20" />
              ) : (
                <CatAnimation variant="calico" className="w-18 h-18 sm:w-20 sm:h-20" />
              )}

              {/* Sparkle Particles on Pet */}
              {isSparkling && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <span className="absolute -top-1 -right-1 text-xs animate-ping">✨</span>
                  <span className="absolute -bottom-1 -left-1 text-xs animate-ping">💖</span>
                </div>
              )}
            </div>

            <span className="block text-center text-[10px] font-mono text-stone-600 mt-1 group-hover:text-amber-800 transition-colors">
              🐾 Ketuk aku!
            </span>
          </div>

          {/* Dialog Bubble */}
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold border ${moodColor}`}>
                <span>{moodIcon}</span>
                <span>Mood Kucing: {moodTitle}</span>
              </span>

              <span className="text-[11px] font-mono text-stone-600 bg-stone-100 px-2 py-0.5 rounded-md border border-stone-200">
                ⭐ Skor Finansial: <strong className="text-stone-800">{healthScore}/100</strong>
              </span>
            </div>

            {/* Speech quote */}
            <div
              onClick={handlePetCat}
              className="p-3 sm:p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#E8E2D8] text-xs sm:text-sm text-stone-800 font-serif italic relative cursor-pointer hover:bg-stone-50 transition-colors group"
            >
              <p className="leading-relaxed">{activeQuote}</p>
              <div className="mt-1 flex items-center justify-between text-[10px] font-mono not-italic text-stone-600 pt-1 border-t border-stone-200/60">
                <span>Cat Financial Coach • Tokyo Neko</span>
                <span className="flex items-center gap-1 group-hover:text-amber-800 transition-colors">
                  <RefreshCw className="w-2.5 h-2.5" />
                  Ganti Saran
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Quick Ratio Mini Stats */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2 border-t sm:border-t-0 sm:border-l border-[#E8E2D8] pt-3 sm:pt-0 sm:pl-5 shrink-0 text-right">
          <div>
            <span className="text-[10px] uppercase font-bold text-stone-600 tracking-wider block">
              Rasio Tabungan
            </span>
            <span className={`text-base sm:text-lg font-black font-mono ${savingsRate >= 20 ? "text-emerald-700" : "text-amber-800"}`}>
              {savingsRate.toFixed(1)}%
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-stone-600 tracking-wider block">
              Rasio Belanja
            </span>
            <span className={`text-base sm:text-lg font-black font-mono ${expenseRate <= 70 ? "text-stone-800" : "text-rose-700"}`}>
              {expenseRate.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CatCoachCard;

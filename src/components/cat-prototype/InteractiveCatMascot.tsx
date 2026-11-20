"use client";

import React, { useState } from "react";
import { CatAnimation, CatAnimationVariant } from "./CatAnimations";
import { CatVariantConfig } from "./catThemeConfig";
import { Sparkles, Heart } from "lucide-react";

interface InteractiveCatMascotProps {
  animation: CatAnimationVariant;
  theme: CatVariantConfig;
  quotes?: string[];
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export const InteractiveCatMascot: React.FC<InteractiveCatMascotProps> = ({
  animation,
  theme,
  quotes,
  className = "",
  size = "md",
}) => {
  const defaultQuotes = quotes || theme.mascotQuotes || [
    "Purr~ Arus kas aman!",
    "Meow! Sisa gaji tercatat rapi.",
  ];

  const [quoteIndex, setQuoteIndex] = useState(0);
  const [showBubble, setShowBubble] = useState(false);
  const [hearts, setHearts] = useState<{ id: number; x: number; y: number }[]>([]);

  const handleInteraction = (e: React.MouseEvent) => {
    // Cycle to next quote
    setQuoteIndex((prev) => (prev + 1) % defaultQuotes.length);
    setShowBubble(true);

    // Spawn mini floating heart
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const newHeart = { id: Date.now(), x, y };
    setHearts((prev) => [...prev.slice(-3), newHeart]);

    setTimeout(() => {
      setHearts((prev) => prev.filter((h) => h.id !== newHeart.id));
    }, 1200);
  };

  const sizeClasses = {
    sm: "w-16 h-16 sm:w-20 sm:h-20",
    md: "w-28 h-28 sm:w-36 sm:h-36",
    lg: "w-36 h-36 sm:w-48 sm:h-48",
    xl: "w-52 h-52 sm:w-64 sm:h-64 lg:w-72 lg:h-72",
  }[size];

  return (
    <div className={`relative inline-block select-none ${className}`}>
      {/* Interactive Speech Bubble */}
      {showBubble && (
        <div
          onClick={() => setShowBubble(false)}
          className={`absolute -top-12 left-1/2 -translate-x-1/2 z-30 px-3 py-1.5 rounded-2xl shadow-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-all duration-300 animate-in fade-in zoom-in-90 border ${
            theme.isDark
              ? "bg-[#1E293B] text-slate-100 border-white/20 shadow-cyan-500/10"
              : "bg-white text-slate-900 border-slate-200 shadow-amber-500/10"
          }`}
        >
          <div className="flex items-center gap-1.5">
            <span className="text-xs">🐾</span>
            <span>{defaultQuotes[quoteIndex]}</span>
          </div>
          {/* Arrow */}
          <div
            className={`absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 border-r border-b ${
              theme.isDark ? "bg-[#1E293B] border-white/20" : "bg-white border-slate-200"
            }`}
          />
        </div>
      )}

      {/* Floating Interactive Hearts on Click */}
      {hearts.map((h) => (
        <div
          key={h.id}
          className="absolute pointer-events-none text-rose-500 text-xs animate-float-up z-40"
          style={{ left: h.x, top: h.y }}
        >
          ❤️
        </div>
      ))}

      {/* Cat Mascot Wrapper */}
      <div
        onClick={handleInteraction}
        onMouseEnter={() => setShowBubble(true)}
        className={`${sizeClasses} rounded-2xl flex items-center justify-center p-2 cursor-pointer transition-all duration-300 active:scale-90 hover:scale-105 group relative`}
        title="Klik kucing untuk interaksi! 🐾"
      >
        <CatAnimation variant={animation} className="w-full h-full drop-shadow-md" />

        {/* Subtle touch badge */}
        <span
          className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity shadow-xs"
          style={{
            backgroundColor: theme.accent,
            color: "#FFFFFF",
          }}
        >
          Tap me!
        </span>
      </div>
    </div>
  );
};

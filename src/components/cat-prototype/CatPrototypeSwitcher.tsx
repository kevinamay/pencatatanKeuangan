"use client";

import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Cat, RotateCcw, ChevronDown, ChevronUp } from "lucide-react";
import { CAT_THEME_CONFIGS } from "./catThemeConfig";

export interface CatVariantMeta {
  id: number;
  name: string;
  subtitle: string;
  badge: string;
  accent: string;
  bg: string;
}

export const CAT_VARIANTS: CatVariantMeta[] = Object.values(CAT_THEME_CONFIGS).map((c) => ({
  id: c.id,
  name: c.name,
  subtitle: c.subtitle,
  badge: c.badge,
  accent: c.accent,
  bg: c.bgPage,
}));

interface CatPrototypeSwitcherProps {
  currentVariant: number;
  onSelectVariant: (v: number) => void;
  isCatMode: boolean;
  onToggleCatMode: (active: boolean) => void;
}

export const CatPrototypeSwitcher: React.FC<CatPrototypeSwitcherProps> = ({
  currentVariant,
  onSelectVariant,
  isCatMode,
  onToggleCatMode,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const current = CAT_THEME_CONFIGS[currentVariant] || CAT_THEME_CONFIGS[1];
  const totalVariants = 5;

  const handlePrev = () => {
    const next = currentVariant === 1 ? totalVariants : currentVariant - 1;
    onSelectVariant(next);
  };

  const handleNext = () => {
    const next = currentVariant === totalVariants ? 1 : currentVariant + 1;
    onSelectVariant(next);
  };

  // Keyboard navigation: ArrowLeft / ArrowRight
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea" || (e.target as HTMLElement)?.isContentEditable) {
        return;
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentVariant]);

  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-50 w-auto max-w-[96%] select-none print:hidden animate-fade-in">
      <div className="bg-slate-900/95 backdrop-blur-md text-white px-3.5 py-2.5 rounded-2xl shadow-2xl border border-white/20 flex items-center gap-3">
        {/* Toggle Mode: Cat vs Original */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onToggleCatMode(!isCatMode)}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-xs ${
              isCatMode
                ? "bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-amber-500/25"
                : "bg-white/10 text-slate-300 hover:text-white"
            }`}
            title="Aktifkan / Matikan Prototipe Tema Kucing"
          >
            <Cat className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {isCatMode ? "🐾 Mode Kucing" : "Lihat 5 Desain Kucing"}
            </span>
            <span className="sm:hidden">{isCatMode ? "🐾 Kucing" : "Desain"}</span>
          </button>

          {isCatMode && (
            <button
              onClick={() => onToggleCatMode(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Kembali ke Desain Asli (Original Red)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* 5 Variants Controller */}
        {isCatMode && (
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all active:scale-95"
              title="Desain Sebelumnya (←)"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Quick Pills for 1-5 */}
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((id) => (
                <button
                  key={id}
                  onClick={() => onSelectVariant(id)}
                  className={`w-7 h-7 rounded-lg text-xs font-black transition-all flex items-center justify-center flex-shrink-0 ${
                    currentVariant === id
                      ? "bg-white text-slate-900 scale-110 shadow-sm"
                      : "bg-white/10 text-slate-300 hover:text-white hover:bg-white/20"
                  }`}
                  title={`${id}. ${CAT_THEME_CONFIGS[id].name} - ${CAT_THEME_CONFIGS[id].subtitle}`}
                >
                  {id}
                </button>
              ))}
            </div>

            <button
              onClick={handleNext}
              className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all active:scale-95"
              title="Desain Selanjutnya (→)"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Current Active Design Label */}
            <div className="hidden md:flex items-center gap-1.5 pl-2 border-l border-white/20 text-xs">
              <span className="font-extrabold text-amber-300 whitespace-nowrap">
                #{current.id} {current.name}
              </span>
              <span className="text-[10px] text-slate-400 hidden lg:inline">
                ({current.subtitle})
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

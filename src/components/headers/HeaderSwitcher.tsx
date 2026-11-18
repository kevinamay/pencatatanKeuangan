"use client";

import React, { useEffect } from "react";
import { ChevronLeft, ChevronRight, LayoutTemplate } from "lucide-react";
import { HEADER_DESIGNS } from "./HeaderVariants";

interface HeaderSwitcherProps {
  currentVariant: number;
  onSelectVariant: (variantId: number) => void;
}

export const HeaderSwitcher: React.FC<HeaderSwitcherProps> = ({
  currentVariant,
  onSelectVariant,
}) => {
  const currentDesign =
    HEADER_DESIGNS.find((d) => d.id === currentVariant) || HEADER_DESIGNS[0];

  const handlePrev = () => {
    const prev = currentVariant === 1 ? HEADER_DESIGNS.length : currentVariant - 1;
    onSelectVariant(prev);
  };

  const handleNext = () => {
    const next = currentVariant === HEADER_DESIGNS.length ? 1 : currentVariant + 1;
    onSelectVariant(next);
  };

  // Keyboard navigation ← / →
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName?.toLowerCase();
      if (
        activeTag === "input" ||
        activeTag === "textarea" ||
        document.activeElement?.getAttribute("contenteditable")
      ) {
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
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 max-w-full px-3 animate-fade-in pointer-events-auto">
      <div className="flex flex-col items-center gap-2 bg-slate-900/95 text-white backdrop-blur-xl border border-white/20 px-4 py-2.5 rounded-3xl shadow-2xl shadow-black/40">
        {/* Main Controls Row */}
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrev}
            className="p-1.5 rounded-full hover:bg-white/20 active:scale-90 transition-all text-slate-300 hover:text-white"
            title="Desain Header Sebelumnya (Arrow Left)"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 min-w-[260px] sm:min-w-[320px] justify-center text-center">
            <span className="w-6 h-6 rounded-full bg-[#991213] text-[#FFD9D9] flex items-center justify-center text-xs font-black">
              {currentVariant}
            </span>
            <div className="flex flex-col items-center">
              <span className="text-xs sm:text-sm font-black text-white tracking-wide">
                Desain #{currentDesign.id}: {currentDesign.name}
              </span>
              <span className="text-[10px] text-[#FFD9D9] font-medium hidden sm:inline">
                {currentDesign.desc}
              </span>
            </div>
          </div>

          <button
            onClick={handleNext}
            className="p-1.5 rounded-full hover:bg-white/20 active:scale-90 transition-all text-slate-300 hover:text-white"
            title="Desain Header Selanjutnya (Arrow Right)"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Numbered Pill Quick Selector [1..10] */}
        <div className="flex items-center gap-1 pt-1 border-t border-white/10 w-full justify-center overflow-x-auto py-0.5">
          <span className="text-[10px] uppercase font-bold text-slate-400 mr-1.5 hidden md:inline">
            PILIH HEADER:
          </span>
          {HEADER_DESIGNS.map((d) => (
            <button
              key={d.id}
              onClick={() => onSelectVariant(d.id)}
              className={`w-6 h-6 rounded-lg text-[11px] font-black transition-all flex items-center justify-center ${
                d.id === currentVariant
                  ? "bg-[#991213] text-white scale-110 shadow-md ring-1 ring-[#FFD9D9]"
                  : "bg-white/10 hover:bg-white/25 text-slate-300"
              }`}
              title={`Pilih ${d.name}`}
            >
              {d.id}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

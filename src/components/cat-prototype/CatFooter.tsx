"use client";

import React from "react";
import { CatVariantConfig } from "./catThemeConfig";
import { RainbowCatLottie } from "./RainbowCatLottie";

interface CatFooterProps {
  currentCatTheme: CatVariantConfig;
}

/**
 * Tokyo Minimalist Paper Edition Footer
 * Winner: Desain 1 (Clean Inline Right)
 * - Menjaga kesederhanaan dan keanggunan tata letak awal (single-row minimalist).
 * - Sisi Kiri: Dot tema + TOKYO.NEKO | Tokyo Minimalist Paper Edition.
 * - Sisi Kanan: Teks info realtime + animasi resmi Rainbow Cat Remix (Victor Aremu) tanpa border.
 */
export const CatFooter: React.FC<CatFooterProps> = ({ currentCatTheme }) => {
  return (
    <footer className="mt-auto border-t py-4 text-xs font-medium print:hidden bg-white border-[#E8E2D8] text-stone-500">
      <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Sisi Kiri: Brand & Edisi */}
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: currentCatTheme.accent }}
          />
          <span className="font-bold font-mono text-stone-900">
            {currentCatTheme.navTitle}
          </span>
          <span className="text-stone-400">
            | Tokyo Minimalist Paper Edition
          </span>
        </div>

        {/* Sisi Kanan: Teks info + Animasi Rainbow Cat tanpa border */}
        <div className="flex items-center gap-3">
          <p className="text-stone-400 text-center sm:text-right">
            Realtime Firebase Cloud Database • Wabi-Sabi Warm Editorial FinPlan
          </p>
          <div className="shrink-0 flex items-center justify-center">
            <RainbowCatLottie
              className="w-24 h-12 sm:w-28 sm:h-14 overflow-visible"
              showSpeech={true}
              showHoverHint={false}
            />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default CatFooter;

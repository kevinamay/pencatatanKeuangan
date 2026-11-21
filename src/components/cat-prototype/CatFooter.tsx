"use client";

import React from "react";
import { CatVariantConfig } from "./catThemeConfig";
import { RainbowCatLottie } from "./RainbowCatLottie";

interface CatFooterProps {
  currentCatTheme: CatVariantConfig;
}

/**
 * Tokyo Minimalist Paper Edition Footer
 * - Sisi Kiri: Brand bullet & Title (TOKYO.NEKO)
 * - Sisi Kanan: Animasi resmi Rainbow Cat Remix (Victor Aremu) tanpa border
 */
export const CatFooter: React.FC<CatFooterProps> = ({ currentCatTheme }) => {
  return (
    <footer className="mt-auto border-t py-3 sm:py-4 text-xs font-medium print:hidden bg-white border-[#E8E2D8] text-stone-500">
      <div className="max-w-7xl mx-auto px-4 flex flex-row items-center justify-between">
        {/* Sisi Kiri: Brand */}
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: currentCatTheme.accent }}
          />
          <span className="font-bold font-mono text-sm tracking-wide text-stone-900">
            {currentCatTheme.navTitle}
          </span>
        </div>

        {/* Sisi Kanan: Animasi Rainbow Cat tanpa border */}
        <div className="shrink-0 flex items-center justify-center">
          <RainbowCatLottie
            className="w-32 h-14 sm:w-40 sm:h-16 overflow-visible"
            scale={2.2}
            showSpeech={true}
            showHoverHint={false}
          />
        </div>
      </div>
    </footer>
  );
};

export default CatFooter;

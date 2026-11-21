"use client";

import React from "react";
import { RainbowCatLottie } from "./RainbowCatLottie";
import { CatVariantConfig } from "./catThemeConfig";

interface CatFooterProps {
  currentCatTheme: CatVariantConfig;
  onOpenPersonaModal?: () => void;
}

export const CatFooter: React.FC<CatFooterProps> = ({
  currentCatTheme,
  onOpenPersonaModal,
}) => {
  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <footer className="mt-auto relative border-t border-[#E8E2D8] bg-[#FAF7F2] text-stone-600 print:hidden overflow-hidden transition-colors">
      {/* 1. Animated Rainbow Wave Running Along Top Edge */}
      <div
        className="w-full h-1.5 opacity-90 shadow-xs"
        style={{
          background:
            "linear-gradient(90deg, #FF0000, #FF9900, #FFFF00, #33FF00, #0099FF, #6633FF, #FF0000)",
          backgroundSize: "200% 100%",
          animation: "rainbowSlide 4s linear infinite",
        }}
      />
      <style>{`
        @keyframes rainbowSlide {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
      `}</style>

      {/* 2. Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Col 1: Lottie Animation (Victor Aremu Rainbow Cat Remix) */}
          <div className="lg:col-span-4 flex flex-col items-center lg:items-start text-center lg:text-left">
            <div className="relative p-2 rounded-2xl bg-white/70 border border-[#E8E2D8] shadow-xs backdrop-blur-xs hover:border-amber-400/60 transition-all">
              <RainbowCatLottie className="w-48 h-28 sm:w-56 sm:h-32" />
            </div>
            <p className="mt-2 text-[11px] font-mono text-stone-600 flex items-center gap-1.5">
              <span>🌈</span>
              <span>
                Animation:{" "}
                <span className="font-semibold text-stone-700">
                  Rainbow Cat Remix
                </span>{" "}
                by Victor Aremu
              </span>
            </p>
          </div>

          {/* Col 2: Brand & Philosophy */}
          <div className="lg:col-span-5 flex flex-col items-center lg:items-start text-center lg:text-left space-y-3">
            <div className="flex items-center gap-2 flex-wrap justify-center lg:justify-start">
              <span
                className="w-3 h-3 rounded-full shadow-xs"
                style={{ backgroundColor: currentCatTheme.accent }}
              />
              <span className="font-bold font-mono text-base tracking-tight text-stone-900">
                {currentCatTheme.navTitle}
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100/70 text-amber-900 border border-amber-200/80 font-mono font-medium">
                Tokyo Minimalist Paper
              </span>
              <span className="text-xs font-serif italic text-stone-600">
                東京猫 • 幸運と貯蓄
              </span>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed max-w-md">
              Pencatatan keuangan modern berjiwa <span className="font-semibold text-stone-700">Wabi-Sabi</span> yang tenang,
              sinkronisasi cloud realtime Firebase, diperkaya keceriaan animasi resmi LottieFiles.
            </p>

            {/* Feature Badges */}
            <div className="flex items-center gap-2 flex-wrap justify-center lg:justify-start pt-1 text-[11px] font-mono text-stone-600">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-stone-100 border border-stone-200">
                ☁️ Cloud Sync
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-stone-100 border border-stone-200">
                📱 PWA & WebAPK
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-stone-100 border border-stone-200">
                🔒 100% Privacy
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-stone-100 border border-stone-200">
                ✨ 60 FPS Lottie
              </span>
            </div>
          </div>

          {/* Col 3: Actions & Scroll To Top */}
          <div className="lg:col-span-3 flex flex-col items-center lg:items-end justify-between space-y-4 text-center lg:text-right">
            {onOpenPersonaModal && (
              <button
                onClick={onOpenPersonaModal}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold font-mono bg-white border border-[#E8E2D8] text-stone-700 hover:bg-stone-50 hover:border-amber-400 active:scale-95 transition-all shadow-xs"
              >
                <span>🐾</span>
                <span>Ganti Persona Kucing</span>
              </button>
            )}

            <button
              onClick={scrollToTop}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold font-mono bg-stone-800 text-stone-100 hover:bg-stone-900 active:scale-95 transition-all shadow-xs group"
            >
              <span>Kembali ke Atas</span>
              <span className="group-hover:-translate-y-0.5 transition-transform">
                ↑
              </span>
            </button>

            <div className="text-[11px] font-mono text-stone-600">
              <span>Tokyo Neko © 2026 • Executive Financial Plan</span>
            </div>
          </div>

        </div>
      </div>

      {/* 3. Bottom Minimalist Sub-bar */}
      <div className="border-t border-[#E8E2D8]/70 py-3 bg-[#F4EFE6]/50 text-center text-[11px] text-stone-600 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Realtime Firebase Cloud Database • Wabi-Sabi Warm Editorial FinPlan</span>
          <span>Crafted with ❤️ and Nyan Energy 🐾</span>
        </div>
      </div>
    </footer>
  );
};

export default CatFooter;

"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import catLoaderData from "@/assets/animations/cat-loader.json";

// Dynamic import of Lottie component to guarantee safe client-side hydration
const Lottie = dynamic(
  () => import("lottie-react").then((mod) => mod.Lottie),
  {
    ssr: false,
    loading: () => <CatLoaderFallback />,
  }
);

/**
 * Instant SVG fallback while Lottie loads
 */
function CatLoaderFallback() {
  return (
    <div className="w-40 h-40 flex items-center justify-center">
      <div className="w-16 h-16 rounded-full border-4 border-amber-200 border-t-amber-600 animate-spin" />
    </div>
  );
}

interface SplashScreenProps {
  onFinish?: () => void;
  minDisplayTimeMs?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onFinish,
  minDisplayTimeMs = 2000,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [progress, setProgress] = useState(15);

  useEffect(() => {
    // Smooth progress simulation
    const p1 = setTimeout(() => setProgress(45), 400);
    const p2 = setTimeout(() => setProgress(75), 900);
    const p3 = setTimeout(() => setProgress(98), 1400);
    const p4 = setTimeout(() => setProgress(100), 1800);

    // Fade out and unmount
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, minDisplayTimeMs);

    const finishTimer = setTimeout(() => {
      setIsVisible(false);
      onFinish?.();
    }, minDisplayTimeMs + 500);

    return () => {
      clearTimeout(p1);
      clearTimeout(p2);
      clearTimeout(p3);
      clearTimeout(p4);
      clearTimeout(fadeTimer);
      clearTimeout(finishTimer);
    };
  }, [minDisplayTimeMs, onFinish]);

  const handleSkip = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      setIsVisible(false);
      onFinish?.();
    }, 300);
  };

  if (!isVisible) return null;

  return (
    <div
      onClick={handleSkip}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-between py-12 px-6 bg-[#FAF7F2] select-none cursor-pointer transition-opacity duration-500 ${
        isFadingOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      style={{
        backgroundImage:
          "radial-gradient(#E8E2D8 1px, transparent 1px), radial-gradient(#E8E2D8 1px, #FAF7F2 1px)",
        backgroundSize: "24px 24px",
        backgroundPosition: "0 0, 12px 12px",
      }}
      title="Klik untuk melewati splash screen"
    >
      {/* Top Header Label */}
      <div className="flex items-center gap-2 pt-2">
        <span className="w-2.5 h-2.5 rounded-full bg-[#854D0E] animate-ping" />
        <span className="text-[11px] font-mono tracking-widest text-stone-400 uppercase font-bold">
          Tokyo Minimalist Paper
        </span>
      </div>

      {/* Center Hero: Evgeny Marinin Cat Loader Lottie */}
      <div className="flex flex-col items-center justify-center -mt-6">
        <div className="relative w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center">
          <Lottie
            src={catLoaderData}
            loop={true}
            autoplay={true}
            className="w-full h-full object-contain pointer-events-none"
          />
        </div>

        {/* Brand & Subtitle */}
        <div className="text-center mt-2 space-y-1">
          <h1 className="text-2xl sm:text-3xl font-mono font-black tracking-tight text-stone-900 flex items-center justify-center gap-2">
            <span>TOKYO.NEKO</span>
            <span className="text-sm font-normal text-amber-800 font-serif italic">
              東京猫
            </span>
          </h1>
          <p className="text-xs font-mono text-stone-500 tracking-wide">
            Wabi-Sabi Warm Editorial FinPlan
          </p>
        </div>

        {/* Elegant Progress Indicator */}
        <div className="mt-6 w-48 sm:w-56 space-y-2">
          <div className="w-full bg-[#E8E2D8] h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[#854D0E] h-full rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono text-stone-400">
            <span>Memuat data keuangan...</span>
            <span>{progress}%</span>
          </div>
        </div>
      </div>

      {/* Bottom Footer Info & Creator Credit */}
      <div className="flex flex-col items-center gap-1.5 text-center">
        <span className="text-[10px] font-mono text-stone-400">
          Animation: <strong className="text-stone-600 font-medium">Cat — loader</strong> by Evgeny Marinin (LottieFiles)
        </span>
        <span className="text-[9px] font-mono text-stone-400/80 bg-stone-200/50 px-2 py-0.5 rounded-full">
          Ketuk layar untuk langsung masuk
        </span>
      </div>
    </div>
  );
};

export default SplashScreen;

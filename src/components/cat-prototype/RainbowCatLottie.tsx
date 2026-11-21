"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import rainbowCatData from "@/assets/animations/rainbow-cat.json";

// Dynamic import of Lottie component from lottie-react v3 with ssr: false
const Lottie = dynamic(
  () => import("lottie-react").then((mod) => mod.Lottie),
  {
    ssr: false,
    loading: () => <RainbowCatFallback />,
  }
);

/**
 * High-precision vector SVG fallback that displays instantly
 * before or during Lottie component hydration.
 */
function RainbowCatFallback() {
  return (
    <div className="relative w-full h-full flex items-center justify-center select-none overflow-hidden">
      <svg
        viewBox="0 0 800 500"
        className="w-full h-full max-h-28 drop-shadow-md animate-pulse"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Rainbow Trail */}
        <g opacity="0.9">
          <path d="M50 200 C 150 180, 250 220, 350 200" stroke="#FF0000" strokeWidth="18" strokeLinecap="round" />
          <path d="M50 218 C 150 198, 250 238, 350 218" stroke="#FF9900" strokeWidth="18" strokeLinecap="round" />
          <path d="M50 236 C 150 216, 250 256, 350 236" stroke="#FFFF00" strokeWidth="18" strokeLinecap="round" />
          <path d="M50 254 C 150 234, 250 274, 350 254" stroke="#33FF00" strokeWidth="18" strokeLinecap="round" />
          <path d="M50 272 C 150 252, 250 292, 350 272" stroke="#0099FF" strokeWidth="18" strokeLinecap="round" />
          <path d="M50 290 C 150 270, 250 310, 350 290" stroke="#6633FF" strokeWidth="18" strokeLinecap="round" />
        </g>
        {/* Pop-Tart Biscuit Body */}
        <rect x="330" y="170" width="220" height="150" rx="20" fill="#FED7AA" stroke="#1E293B" strokeWidth="10" />
        <rect x="345" y="185" width="190" height="120" rx="14" fill="#F472B6" />
        {/* Sprinkles */}
        <circle cx="370" cy="210" r="5" fill="#BE185D" />
        <circle cx="420" cy="200" r="5" fill="#BE185D" />
        <circle cx="480" cy="220" r="5" fill="#BE185D" />
        <circle cx="390" cy="260" r="5" fill="#BE185D" />
        <circle cx="450" cy="270" r="5" fill="#BE185D" />
        <circle cx="500" cy="250" r="5" fill="#BE185D" />
        {/* Cat Head */}
        <g>
          {/* Ears */}
          <polygon points="490,190 515,130 540,185" fill="#94A3B8" stroke="#1E293B" strokeWidth="8" />
          <polygon points="570,185 595,130 620,190" fill="#94A3B8" stroke="#1E293B" strokeWidth="8" />
          <polygon points="505,175 515,145 530,175" fill="#FDA4AF" />
          <polygon points="580,175 595,145 605,175" fill="#FDA4AF" />
          {/* Head base */}
          <rect x="490" y="175" width="130" height="100" rx="30" fill="#94A3B8" stroke="#1E293B" strokeWidth="8" />
          {/* Eyes */}
          <circle cx="530" cy="215" r="8" fill="#1E293B" />
          <circle cx="580" cy="215" r="8" fill="#1E293B" />
          <circle cx="533" cy="212" r="2.5" fill="#FFFFFF" />
          <circle cx="583" cy="212" r="2.5" fill="#FFFFFF" />
          {/* Cheeks */}
          <ellipse cx="515" cy="235" rx="8" ry="6" fill="#FB7185" />
          <ellipse cx="595" cy="235" rx="8" ry="6" fill="#FB7185" />
          {/* Mouth */}
          <path d="M545 230 C550 236, 555 236, 558 230 C561 236, 566 236, 571 230" stroke="#1E293B" strokeWidth="4" strokeLinecap="round" fill="none" />
          <circle cx="558" cy="225" r="3" fill="#1E293B" />
        </g>
      </svg>
    </div>
  );
}

interface RainbowCatLottieProps {
  className?: string;
  showSpeech?: boolean;
}

const NYAN_SOUNDS = [
  "Nyaaa~! 🌈",
  "Purrr... ✨",
  "Tokyo Neko! 🐾",
  "Hemat Pangkal Kaya! 💰",
  "Nyan Power: 100%! ⚡",
  "Wabi-Sabi Flow 🌸",
  "FinPlan On Track! 📈",
];

export const RainbowCatLottie: React.FC<RainbowCatLottieProps> = ({
  className = "w-44 h-28 sm:w-56 sm:h-32",
  showSpeech = true,
}) => {
  const [speech, setSpeech] = useState<string | null>(null);
  const [speechIndex, setSpeechIndex] = useState(0);
  const [isSparkling, setIsSparkling] = useState(false);

  // Play a soft cute synthesized 8-bit retro chime on click using Web Audio API
  const playCuteMeow = () => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      // Cute rising pitch contour (Meow effect: E5 -> G5 -> B5 -> E6)
      osc.frequency.setValueAtTime(659.25, now);
      osc.frequency.exponentialRampToValueAtTime(880.0, now + 0.08);
      osc.frequency.exponentialRampToValueAtTime(1318.51, now + 0.18);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.08, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.3);
    } catch {
      // Audio might be blocked by browser policy; safe fallback
    }
  };

  const handleClick = () => {
    playCuteMeow();
    setIsSparkling(true);
    setSpeech(NYAN_SOUNDS[speechIndex % NYAN_SOUNDS.length]);
    setSpeechIndex((prev) => prev + 1);

    setTimeout(() => {
      setIsSparkling(false);
    }, 600);

    setTimeout(() => {
      setSpeech(null);
    }, 2800);
  };

  return (
    <div
      onClick={handleClick}
      className={`relative inline-flex items-center justify-center cursor-pointer group transition-transform duration-200 active:scale-95 ${className}`}
      title="Klik Rainbow Nyan Cat untuk meow & sparkle!"
    >
      {/* Interactive Speech Bubble */}
      {showSpeech && speech && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-20 whitespace-nowrap bg-amber-900 text-amber-50 text-[11px] font-bold font-mono px-3 py-1 rounded-full shadow-lg border border-amber-700 animate-bounce">
          {speech}
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-amber-900 rotate-45 border-r border-b border-amber-700" />
        </div>
      )}

      {/* Sparkle Burst Animation on click */}
      {isSparkling && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10">
          <span className="absolute -top-2 left-4 text-xs animate-ping">✨</span>
          <span className="absolute -bottom-2 right-4 text-xs animate-ping">⭐</span>
          <span className="absolute top-1/2 -left-3 text-xs animate-ping">🌈</span>
          <span className="absolute top-1/2 -right-3 text-xs animate-ping">💖</span>
        </div>
      )}

      {/* Official Victor Aremu Rainbow Cat Remix Animation via Lottie */}
      <div className="w-full h-full flex items-center justify-center">
        <Lottie
          src={rainbowCatData}
          loop={true}
          autoplay={true}
          className="w-full h-full object-contain pointer-events-none"
        />
      </div>

      {/* Subtle Hint on Hover */}
      <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-90 transition-opacity text-[10px] text-amber-800/80 font-mono font-semibold pointer-events-none whitespace-nowrap bg-white/90 px-2 py-0.5 rounded-full border border-amber-200 shadow-xs">
        🐾 Click me!
      </span>
    </div>
  );
};

export default RainbowCatLottie;

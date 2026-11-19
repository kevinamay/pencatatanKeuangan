"use client";

import React from "react";

export type LottieAnimationType =
  | "wallet"
  | "wallet-coins"
  | "piggy-bank"
  | "save-money"
  | "chart-growth"
  | "chart-up"
  | "analytics"
  | "coins"
  | "coin-stack";

interface LottieAnimationProps {
  type: LottieAnimationType;
  className?: string;
  loop?: boolean;
  autoplay?: boolean;
}

/**
 * Ultra-Fast Vector Animated Illustrations (GPU-Accelerated SVG)
 * - Zero network overhead (0 KB external JSON requests)
 * - 0ms initial load time (Instant First Contentful Paint)
 * - 60 FPS smooth CSS keyframe animations
 * - Executive Neo-Bank aesthetic matching #991213 & #FFD9D9 theme
 */
export const LottieAnimation: React.FC<LottieAnimationProps> = ({
  type,
  className = "w-28 h-28",
}) => {
  // 1. Executive Wallet with Emerging Banknotes & Floating Coin
  if (type === "wallet" || type === "wallet-coins") {
    return (
      <div className={`relative flex items-center justify-center select-none ${className}`}>
        <svg
          viewBox="0 0 120 120"
          className="w-full h-full overflow-visible drop-shadow-md"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <style>{`
            @keyframes walletBob {
              0%, 100% { transform: translateY(0px) rotate(0deg); }
              50% { transform: translateY(-3px) rotate(1deg); }
            }
            @keyframes noteFlutter {
              0%, 100% { transform: translateY(0px) rotate(-12deg); }
              50% { transform: translateY(-5px) rotate(-9deg); }
            }
            @keyframes coinHover {
              0%, 100% { transform: translateY(0px) scale(1); }
              50% { transform: translateY(-6px) scale(1.05); }
            }
            @keyframes sparkleTwinkle {
              0%, 100% { opacity: 0.3; transform: scale(0.7); }
              50% { opacity: 1; transform: scale(1.15); }
            }
            .anim-wallet { animation: walletBob 4s ease-in-out infinite; transform-origin: center bottom; }
            .anim-note { animation: noteFlutter 3.2s ease-in-out infinite; transform-origin: 30px 40px; }
            .anim-coin { animation: coinHover 2.6s ease-in-out infinite; transform-origin: 88px 34px; }
            .anim-sparkle { animation: sparkleTwinkle 2s ease-in-out infinite; transform-origin: center; }
          `}</style>

          <defs>
            <linearGradient id="walletGrad" x1="15" y1="35" x2="105" y2="100" gradientUnits="userSpaceOnUse">
              <stop stopColor="#991213" />
              <stop offset="0.6" stopColor="#7F0E0F" />
              <stop offset="1" stopColor="#550A0B" />
            </linearGradient>
            <linearGradient id="walletFlapGrad" x1="50" y1="45" x2="105" y2="85" gradientUnits="userSpaceOnUse">
              <stop stopColor="#B31A1B" />
              <stop offset="1" stopColor="#7F0E0F" />
            </linearGradient>
            <linearGradient id="noteGrad1" x1="20" y1="20" x2="70" y2="50" gradientUnits="userSpaceOnUse">
              <stop stopColor="#34D399" />
              <stop offset="1" stopColor="#059669" />
            </linearGradient>
            <linearGradient id="noteGrad2" x1="30" y1="15" x2="80" y2="45" gradientUnits="userSpaceOnUse">
              <stop stopColor="#6EE7B7" />
              <stop offset="1" stopColor="#10B981" />
            </linearGradient>
            <linearGradient id="coinGrad" x1="75" y1="20" x2="100" y2="45" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FDE047" />
              <stop offset="0.5" stopColor="#EAB308" />
              <stop offset="1" stopColor="#CA8A04" />
            </linearGradient>
          </defs>

          {/* Sparkles */}
          <g className="anim-sparkle">
            <path d="M22 26L24 18L26 26L34 28L26 30L24 38L22 30L14 28Z" fill="#FDE047" />
            <path d="M98 75L99 71L100 75L104 76L100 77L99 81L98 77L94 76Z" fill="#FFD9D9" />
          </g>

          {/* Emerging Banknote 1 (Back) */}
          <g className="anim-note">
            <rect x="25" y="24" width="48" height="28" rx="4" fill="url(#noteGrad1)" stroke="#047857" strokeWidth="1.2" />
            <circle cx="49" cy="38" r="7" fill="#047857" fillOpacity="0.35" />
            <path d="M49 33V43M46 35C46 34 47 33 49 33C51 33 52 34 52 35C52 38 46 38 46 41C46 42 47 43 49 43C51 43 52 42 52 41" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" />
          </g>

          {/* Emerging Banknote 2 (Front) */}
          <g style={{ transform: "rotate(-4deg)", transformOrigin: "35px 35px" }}>
            <rect x="36" y="22" width="46" height="26" rx="4" fill="url(#noteGrad2)" stroke="#059669" strokeWidth="1.2" />
            <circle cx="59" cy="35" r="6" fill="#059669" fillOpacity="0.3" />
            <path d="M59 31V39M56.5 32.5C56.5 31.8 57.3 31 59 31C60.5 31 61.5 31.8 61.5 32.5C61.5 35 56.5 35 56.5 37.5C56.5 38.2 57.3 39 59 39C60.5 39 61.5 38.2 61.5 37.5" stroke="#FFFFFF" strokeWidth="1.1" strokeLinecap="round" />
          </g>

          {/* Wallet Base */}
          <g className="anim-wallet">
            <rect x="18" y="42" width="84" height="58" rx="14" fill="url(#walletGrad)" />
            {/* Wallet Stitching Accent */}
            <rect x="22" y="46" width="76" height="50" rx="10" stroke="#FFD9D9" strokeWidth="1.2" strokeDasharray="3 3" strokeOpacity="0.4" fill="none" />

            {/* Wallet Interior Shadow */}
            <path d="M18 56C18 48 24 42 32 42H88C96 42 102 48 102 56V62H18V56Z" fill="#000000" fillOpacity="0.15" />

            {/* Wallet Flap with Clasp */}
            <path d="M54 55H98C103 55 106 58 106 63V77C106 82 103 85 98 85H54C48 85 44 80 44 75V65C44 60 48 55 54 55Z" fill="url(#walletFlapGrad)" />
            <path d="M54 55H98C103 55 106 58 106 63V77C106 82 103 85 98 85H54C48 85 44 80 44 75V65C44 60 48 55 54 55Z" stroke="#FFD9D9" strokeWidth="1" strokeOpacity="0.3" fill="none" />

            {/* Metallic Gold Lock Clasp */}
            <circle cx="56" cy="70" r="7" fill="url(#coinGrad)" stroke="#B45309" strokeWidth="1" />
            <circle cx="56" cy="70" r="3" fill="#991213" />
            <circle cx="55" cy="69" r="1" fill="#FFFFFF" />
          </g>

          {/* Floating Gold Coin */}
          <g className="anim-coin">
            <circle cx="88" cy="34" r="14" fill="url(#coinGrad)" stroke="#B45309" strokeWidth="1.4" />
            <circle cx="88" cy="34" r="10.5" stroke="#FDE047" strokeWidth="1" strokeDasharray="2 1.5" fill="none" />
            {/* Rp / Currency sign on Coin */}
            <text x="88" y="38" textAnchor="middle" fill="#78350F" fontSize="10" fontWeight="900" fontFamily="sans-serif">Rp</text>
            <circle cx="84" cy="28" r="1.5" fill="#FFFFFF" fillOpacity="0.8" />
          </g>
        </svg>
      </div>
    );
  }

  // 2. Piggy Bank with Coin Drop Animation
  if (type === "piggy-bank") {
    return (
      <div className={`relative flex items-center justify-center select-none ${className}`}>
        <svg
          viewBox="0 0 120 120"
          className="w-full h-full overflow-visible drop-shadow-md"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <style>{`
            @keyframes coinDrop {
              0% { transform: translateY(-16px) scale(0.9); opacity: 0; }
              25% { transform: translateY(-4px) scale(1); opacity: 1; }
              65% { transform: translateY(14px) scale(0.85); opacity: 1; }
              80%, 100% { transform: translateY(22px) scale(0.5); opacity: 0; }
            }
            @keyframes pigBob {
              0%, 100% { transform: scale(1) translateY(0); }
              60% { transform: scale(1.02, 0.98) translateY(1px); }
            }
            @keyframes earWiggle {
              0%, 100% { transform: rotate(0deg); }
              50% { transform: rotate(-5deg); }
            }
            .anim-pig { animation: pigBob 2.8s ease-in-out infinite; transform-origin: 60px 75px; }
            .anim-drop-coin { animation: coinDrop 2.8s cubic-bezier(0.4, 0, 0.2, 1) infinite; transform-origin: 55px 25px; }
            .anim-ear { animation: earWiggle 3.2s ease-in-out infinite; transform-origin: 75px 38px; }
          `}</style>

          <defs>
            <linearGradient id="pigGrad" x1="20" y1="35" x2="105" y2="100" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FFD9D9" />
              <stop offset="0.6" stopColor="#FCA5A5" />
              <stop offset="1" stopColor="#E11D48" />
            </linearGradient>
            <linearGradient id="snoutGrad" x1="15" y1="60" x2="35" y2="85" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FFE4E6" />
              <stop offset="1" stopColor="#F43F5E" />
            </linearGradient>
            <linearGradient id="pigCoinGrad" x1="45" y1="12" x2="65" y2="35" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FDE047" />
              <stop offset="0.6" stopColor="#EAB308" />
              <stop offset="1" stopColor="#CA8A04" />
            </linearGradient>
          </defs>

          {/* Dropping Gold Coin */}
          <g className="anim-drop-coin">
            <circle cx="56" cy="22" r="9" fill="url(#pigCoinGrad)" stroke="#B45309" strokeWidth="1.2" />
            <circle cx="56" cy="22" r="6.5" stroke="#FEF08A" strokeWidth="0.8" fill="none" />
            <text x="56" y="25" textAnchor="middle" fill="#78350F" fontSize="8" fontWeight="bold">Rp</text>
          </g>

          {/* Piggy Body Group */}
          <g className="anim-pig">
            {/* Back Feet */}
            <rect x="36" y="86" width="12" height="15" rx="5" fill="#E11D48" />
            <rect x="74" y="86" width="12" height="15" rx="5" fill="#E11D48" />

            {/* Front Feet */}
            <rect x="44" y="88" width="12" height="16" rx="5" fill="#F43F5E" />
            <rect x="82" y="88" width="12" height="16" rx="5" fill="#F43F5E" />

            {/* Pig Body */}
            <ellipse cx="62" cy="68" rx="36" ry="28" fill="url(#pigGrad)" stroke="#991213" strokeWidth="1.5" />

            {/* Top Coin Slot */}
            <rect x="48" y="40" width="16" height="4" rx="2" fill="#991213" />

            {/* Curly Tail */}
            <path d="M98 64C104 62 108 66 106 70C104 73 100 70 102 67C103 65 106 66 107 68" stroke="#E11D48" strokeWidth="2.5" strokeLinecap="round" fill="none" />

            {/* Ear */}
            <g className="anim-ear">
              <path d="M72 44C73 34 85 36 86 44C87 49 76 50 72 44Z" fill="#F43F5E" stroke="#991213" strokeWidth="1.2" />
              <path d="M74 43C75 37 82 38 83 43" fill="#FFE4E6" />
            </g>

            {/* Eye */}
            <circle cx="42" cy="58" r="3" fill="#1C0606" />
            <circle cx="41" cy="57" r="1" fill="#FFFFFF" />

            {/* Snout */}
            <ellipse cx="27" cy="68" rx="11" ry="8" fill="url(#snoutGrad)" stroke="#991213" strokeWidth="1.2" />
            <circle cx="24" cy="68" r="2" fill="#881337" />
            <circle cx="30" cy="68" r="2" fill="#881337" />

            {/* Cute Cheek Blush */}
            <ellipse cx="40" cy="67" rx="4" ry="2.5" fill="#FB7185" fillOpacity="0.5" />
          </g>
        </svg>
      </div>
    );
  }

  // 3. Save Money / Vault Safe with Asset Growth
  if (type === "save-money") {
    return (
      <div className={`relative flex items-center justify-center select-none ${className}`}>
        <svg
          viewBox="0 0 120 120"
          className="w-full h-full overflow-visible drop-shadow-md"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <style>{`
            @keyframes dialRotate {
              0%, 100% { transform: rotate(0deg); }
              30% { transform: rotate(45deg); }
              70% { transform: rotate(-30deg); }
            }
            @keyframes pulseGlow {
              0%, 100% { opacity: 0.6; transform: scale(1); }
              50% { opacity: 1; transform: scale(1.04); }
            }
            .anim-dial { animation: dialRotate 6s ease-in-out infinite; transform-origin: 60px 65px; }
            .anim-glow { animation: pulseGlow 3s ease-in-out infinite; transform-origin: 60px 65px; }
          `}</style>

          <defs>
            <linearGradient id="vaultGrad" x1="20" y1="25" x2="100" y2="105" gradientUnits="userSpaceOnUse">
              <stop stopColor="#991213" />
              <stop offset="0.7" stopColor="#6E0B0C" />
              <stop offset="1" stopColor="#450607" />
            </linearGradient>
            <linearGradient id="goldRimGrad" x1="40" y1="45" x2="80" y2="85" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FDE047" />
              <stop offset="0.5" stopColor="#EAB308" />
              <stop offset="1" stopColor="#A16207" />
            </linearGradient>
          </defs>

          {/* Ambient Glow */}
          <circle cx="60" cy="65" r="42" fill="#FFD9D9" fillOpacity="0.3" className="anim-glow" />

          {/* Stacks of Cash on Top of Vault */}
          <rect x="36" y="22" width="48" height="10" rx="2" fill="#059669" stroke="#047857" strokeWidth="1" />
          <rect x="42" y="16" width="36" height="8" rx="2" fill="#10B981" stroke="#059669" strokeWidth="1" />
          <circle cx="60" cy="20" r="2.5" fill="#047857" />

          {/* Safe Main Body */}
          <rect x="22" y="30" width="76" height="70" rx="12" fill="url(#vaultGrad)" stroke="#FFD9D9" strokeWidth="1.5" strokeOpacity="0.5" />

          {/* Door Inset */}
          <rect x="28" y="36" width="64" height="58" rx="8" fill="#500708" stroke="#991213" strokeWidth="1.2" />

          {/* Safe Dial Handle with Golden Rim */}
          <circle cx="60" cy="65" r="20" fill="url(#goldRimGrad)" stroke="#78350F" strokeWidth="1.2" />
          <circle cx="60" cy="65" r="16" fill="#1C0606" />

          {/* Turning Dial Spokes */}
          <g className="anim-dial">
            <line x1="60" y1="52" x2="60" y2="78" stroke="#FDE047" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="47" y1="65" x2="73" y2="65" stroke="#FDE047" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="60" cy="65" r="5" fill="url(#goldRimGrad)" />
          </g>

          {/* Safe Hinges */}
          <rect x="20" y="44" width="4" height="10" rx="2" fill="#EAB308" />
          <rect x="20" y="76" width="4" height="10" rx="2" fill="#EAB308" />

          {/* Digital LED Status Indicator */}
          <circle cx="82" cy="44" r="2" fill="#34D399" />
        </svg>
      </div>
    );
  }

  // 4. Chart Growth / Upward Analytics
  if (type === "chart-growth" || type === "chart-up" || type === "analytics") {
    return (
      <div className={`relative flex items-center justify-center select-none ${className}`}>
        <svg
          viewBox="0 0 120 120"
          className="w-full h-full overflow-visible drop-shadow-md"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <style>{`
            @keyframes linePulse {
              0%, 100% { stroke-dashoffset: 0; }
              50% { stroke-dashoffset: 12; }
            }
            @keyframes barGrow {
              0%, 100% { transform: scaleY(1); }
              50% { transform: scaleY(1.08); }
            }
            @keyframes peakGlow {
              0%, 100% { transform: scale(1); filter: drop-shadow(0 0 2px #EAB308); }
              50% { transform: scale(1.25); filter: drop-shadow(0 0 6px #FDE047); }
            }
            .anim-chart-line { stroke-dasharray: 80; animation: linePulse 4s ease-in-out infinite; }
            .anim-bar-1 { animation: barGrow 3.2s ease-in-out infinite 0.2s; transform-origin: center bottom; }
            .anim-bar-2 { animation: barGrow 3.2s ease-in-out infinite 0.4s; transform-origin: center bottom; }
            .anim-bar-3 { animation: barGrow 3.2s ease-in-out infinite 0.6s; transform-origin: center bottom; }
            .anim-peak { animation: peakGlow 2.5s ease-in-out infinite; transform-origin: 90px 32px; }
          `}</style>

          <defs>
            <linearGradient id="chartBgGrad" x1="15" y1="20" x2="105" y2="105" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FFFFFF" />
              <stop offset="1" stopColor="#FFF2F2" />
            </linearGradient>
            <linearGradient id="barGrad1" x1="0" y1="0" x2="0" y2="1">
              <stop stopColor="#FCA5A5" />
              <stop offset="1" stopColor="#FFD9D9" />
            </linearGradient>
            <linearGradient id="barGrad2" x1="0" y1="0" x2="0" y2="1">
              <stop stopColor="#EF4444" />
              <stop offset="1" stopColor="#991213" />
            </linearGradient>
            <linearGradient id="barGrad3" x1="0" y1="0" x2="0" y2="1">
              <stop stopColor="#991213" />
              <stop offset="1" stopColor="#550A0B" />
            </linearGradient>
            <linearGradient id="lineTrendGrad" x1="25" y1="80" x2="95" y2="30" gradientUnits="userSpaceOnUse">
              <stop stopColor="#10B981" />
              <stop offset="0.6" stopColor="#F59E0B" />
              <stop offset="1" stopColor="#EAB308" />
            </linearGradient>
          </defs>

          {/* Background Card */}
          <rect x="15" y="18" width="90" height="84" rx="14" fill="url(#chartBgGrad)" stroke="#FFD9D9" strokeWidth="1.5" />

          {/* Subtle Grid Lines */}
          <line x1="24" y1="42" x2="96" y2="42" stroke="#FFD9D9" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="24" y1="62" x2="96" y2="62" stroke="#FFD9D9" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="24" y1="82" x2="96" y2="82" stroke="#FFD9D9" strokeWidth="1" />

          {/* Ascending Chart Bars */}
          <rect x="30" y="66" width="14" height="24" rx="4" fill="url(#barGrad1)" className="anim-bar-1" />
          <rect x="52" y="50" width="14" height="40" rx="4" fill="url(#barGrad2)" className="anim-bar-2" />
          <rect x="74" y="34" width="14" height="56" rx="4" fill="url(#barGrad3)" className="anim-bar-3" />

          {/* Upward Curved Glowing Trend Line */}
          <path
            d="M 28 78 Q 50 68 62 52 T 90 32"
            fill="none"
            stroke="url(#lineTrendGrad)"
            strokeWidth="3.5"
            strokeLinecap="round"
            className="anim-chart-line"
          />

          {/* Peak Indicator with Glowing Gold Dot */}
          <g className="anim-peak">
            <circle cx="90" cy="32" r="6" fill="#FDE047" stroke="#CA8A04" strokeWidth="1.5" />
            <circle cx="90" cy="32" r="2.5" fill="#78350F" />
          </g>

          {/* Ascending Arrow Badge */}
          <g style={{ transform: "translate(80px, 14px)" }}>
            <rect x="0" y="0" width="22" height="16" rx="8" fill="#10B981" />
            <path d="M7 10L11 6L15 10M11 6V12" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        </svg>
      </div>
    );
  }

  // 5. Coins / Coin Stack (Default Fallback)
  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      <svg
        viewBox="0 0 120 120"
        className="w-full h-full overflow-visible drop-shadow-md"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <style>{`
          @keyframes coinStackBob {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-3px); }
          }
          @keyframes floatingCoin {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            50% { transform: translateY(-7px) rotate(4deg); }
          }
          .anim-stack { animation: coinStackBob 3.5s ease-in-out infinite; transform-origin: center bottom; }
          .anim-top-coin { animation: floatingCoin 2.4s ease-in-out infinite; transform-origin: 60px 30px; }
        `}</style>
        <defs>
          <linearGradient id="goldCoinGrad" x1="20" y1="20" x2="80" y2="80" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FDE047" />
            <stop offset="0.6" stopColor="#EAB308" />
            <stop offset="1" stopColor="#CA8A04" />
          </linearGradient>
        </defs>

        {/* Stack Base */}
        <g className="anim-stack">
          {/* Bottom Coin */}
          <ellipse cx="60" cy="85" rx="32" ry="12" fill="#A16207" />
          <ellipse cx="60" cy="82" rx="32" ry="12" fill="url(#goldCoinGrad)" stroke="#CA8A04" strokeWidth="1" />

          {/* Middle Coin */}
          <ellipse cx="60" cy="73" rx="32" ry="12" fill="#A16207" />
          <ellipse cx="60" cy="70" rx="32" ry="12" fill="url(#goldCoinGrad)" stroke="#CA8A04" strokeWidth="1" />

          {/* Top Stack Coin */}
          <ellipse cx="60" cy="61" rx="32" ry="12" fill="#A16207" />
          <ellipse cx="60" cy="58" rx="32" ry="12" fill="url(#goldCoinGrad)" stroke="#CA8A04" strokeWidth="1" />
          <ellipse cx="60" cy="58" rx="25" ry="9" stroke="#FEF08A" strokeWidth="0.8" strokeDasharray="3 2" fill="none" />
          <text x="60" y="62" textAnchor="middle" fill="#78350F" fontSize="12" fontWeight="900">Rp</text>
        </g>

        {/* Floating Top Coin */}
        <g className="anim-top-coin">
          <circle cx="60" cy="28" r="16" fill="url(#goldCoinGrad)" stroke="#B45309" strokeWidth="1.5" />
          <circle cx="60" cy="28" r="12" stroke="#FEF08A" strokeWidth="1" strokeDasharray="2.5 1.5" fill="none" />
          <text x="60" y="33" textAnchor="middle" fill="#78350F" fontSize="13" fontWeight="900">Rp</text>
        </g>
      </svg>
    </div>
  );
};

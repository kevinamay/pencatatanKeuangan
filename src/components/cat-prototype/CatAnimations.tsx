"use client";

import React from "react";

export type CatAnimationVariant =
  | "maneki"      // 1. Lucky Gold Paw Cat
  | "calico"      // 2. Mochi Calico Cat
  | "hacker"      // 3. Cyber Black Cat on Pink Laptop
  | "laughing"    // 4. Chubby Orange Cat Rolling Laughing
  | "sleeping"    // 5. Cozy Sleeping Cat
  | "pixel"       // 6. 8-Bit Retro Pixel Cat
  | "moon"        // 7. Cat Fishing on Crescent Moon
  | "peeking"     // 8. Peeking Black Cat Eyes
  | "tuxedo"      // 9. Formal Tuxedo Gentleman Cat
  | "ufo";        // 10. Cute Cat in UFO Flying Saucer

interface CatAnimationProps {
  variant: CatAnimationVariant;
  className?: string;
}

export const CatAnimation: React.FC<CatAnimationProps> = ({
  variant,
  className = "w-32 h-32",
}) => {
  // 1. LUCKY MANEKI-NEKO (Gold Coin & Waving Paw)
  if (variant === "maneki") {
    return (
      <div className={`relative flex items-center justify-center select-none ${className}`}>
        <svg viewBox="0 0 160 160" className="w-full h-full overflow-visible drop-shadow-lg" fill="none">
          <style>{`
            @keyframes pawWave {
              0%, 100% { transform: rotate(0deg); }
              50% { transform: rotate(-25deg); }
            }
            @keyframes coinTwinkle {
              0%, 100% { transform: scale(1) translateY(0); filter: drop-shadow(0 0 2px #F59E0B); }
              50% { transform: scale(1.08) translateY(-3px); filter: drop-shadow(0 0 8px #F59E0B); }
            }
            .anim-paw { animation: pawWave 1.8s ease-in-out infinite; transform-origin: 45px 75px; }
            .anim-coin-glow { animation: coinTwinkle 2s ease-in-out infinite; }
          `}</style>
          {/* Base / Body */}
          <ellipse cx="80" cy="148" rx="45" ry="10" fill="#000000" opacity="0.12" />
          <path d="M45 85C45 60 60 50 80 50C100 50 115 60 115 85C115 125 110 145 80 145C50 145 45 125 45 85Z" fill="#FFF9F0" stroke="#8B0000" strokeWidth="3.5" />
          {/* Red Collar & Golden Bell */}
          <path d="M52 90C65 98 95 98 108 90" stroke="#DC2626" strokeWidth="6" strokeLinecap="round" />
          <circle cx="80" cy="98" r="8" fill="#F59E0B" stroke="#B45309" strokeWidth="2" />
          <line x1="75" y1="98" x2="85" y2="98" stroke="#78350F" strokeWidth="1.5" />
          {/* Left Waving Paw */}
          <g className="anim-paw">
            <path d="M48 78C38 65 30 50 42 42C50 38 56 50 56 68Z" fill="#FFF9F0" stroke="#8B0000" strokeWidth="3.5" />
            <ellipse cx="40" cy="46" rx="5" ry="6" fill="#FCA5A5" />
          </g>
          {/* Head & Ears */}
          <path d="M50 52L40 25C40 25 58 32 66 42" fill="#8B0000" stroke="#8B0000" strokeWidth="3" />
          <path d="M110 52L120 25C120 25 102 32 94 42" fill="#F59E0B" stroke="#B45309" strokeWidth="3" />
          <path d="M52 28L60 38" stroke="#FECACA" strokeWidth="3" strokeLinecap="round" />
          <path d="M108 28L100 38" stroke="#FDE68A" strokeWidth="3" strokeLinecap="round" />
          {/* Face */}
          <circle cx="68" cy="62" r="3.5" fill="#1C1917" />
          <circle cx="92" cy="62" r="3.5" fill="#1C1917" />
          <path d="M80 66L77 70H83L80 66Z" fill="#EF4444" />
          <path d="M80 70C78 74 72 74 72 72M80 70C82 74 88 74 88 72" stroke="#1C1917" strokeWidth="2" strokeLinecap="round" />
          {/* Whiskers */}
          <path d="M48 64L32 62M48 68L30 70M112 64L128 62M112 68L130 70" stroke="#8B0000" strokeWidth="2" strokeLinecap="round" />
          {/* Giant Gold Coin Held in Hand */}
          <g className="anim-coin-glow">
            <ellipse cx="80" cy="120" rx="20" ry="18" fill="#FBBF24" stroke="#D97706" strokeWidth="3" />
            <rect x="73" y="113" width="14" height="14" rx="2" fill="#FEF3C7" stroke="#D97706" strokeWidth="2" />
            <text x="80" y="136" textAnchor="middle" fontSize="9" fontWeight="900" fill="#92400E">千万両</text>
          </g>
        </svg>
      </div>
    );
  }

  // 2. MOCHI CALICO CAT (Soft Tri-Color Bubbly Cat)
  if (variant === "calico") {
    return (
      <div className={`relative flex items-center justify-center select-none ${className}`}>
        <svg viewBox="0 0 160 160" className="w-full h-full overflow-visible" fill="none">
          <style>{`
            @keyframes mochiBounce {
              0%, 100% { transform: scale(1, 1) translateY(0); }
              50% { transform: scale(1.05, 0.95) translateY(4px); }
            }
            @keyframes sparkleBlink {
              0%, 100% { opacity: 0.3; transform: scale(0.8); }
              50% { opacity: 1; transform: scale(1.2); }
            }
            .anim-mochi { animation: mochiBounce 2.4s ease-in-out infinite; transform-origin: bottom center; }
            .anim-sparkle { animation: sparkleBlink 1.8s ease-in-out infinite; }
          `}</style>
          {/* Shadow */}
          <ellipse cx="80" cy="142" rx="48" ry="12" fill="#4A4E69" opacity="0.15" />
          <g className="anim-mochi">
            {/* Body Pill */}
            <rect x="42" y="52" width="76" height="85" rx="38" fill="#FFFBF5" stroke="#4A4E69" strokeWidth="3" />
            {/* Calico Spots */}
            <path d="M43 70C55 60 70 65 72 82C62 92 45 90 43 70Z" fill="#FB923C" />
            <path d="M117 78C105 72 98 84 102 96C112 98 116 88 117 78Z" fill="#4B5563" />
            {/* Ears */}
            <path d="M50 56L42 30C42 30 58 35 64 48" fill="#FB923C" stroke="#4A4E69" strokeWidth="3" />
            <path d="M110 56L118 30C118 30 102 35 96 48" fill="#4B5563" stroke="#4A4E69" strokeWidth="3" />
            <path d="M51 34L57 44" stroke="#FED7AA" strokeWidth="2.5" strokeLinecap="round" />
            {/* Cute Antenna / Star from Screenshot */}
            <g className="anim-sparkle">
              <path d="M80 44V30M73 37H87M75 32L85 42M75 42L85 32" stroke="#93C5FD" strokeWidth="2.5" strokeLinecap="round" />
            </g>
            {/* Soft Eyes & Blushes */}
            <ellipse cx="64" cy="78" rx="4" ry="5" fill="#1F2937" />
            <ellipse cx="96" cy="78" rx="4" ry="5" fill="#1F2937" />
            <circle cx="65" cy="76" r="1.5" fill="#FFFFFF" />
            <circle cx="97" cy="76" r="1.5" fill="#FFFFFF" />
            <circle cx="56" cy="85" r="5" fill="#FDA4AF" opacity="0.6" />
            <circle cx="104" cy="85" r="5" fill="#FDA4AF" opacity="0.6" />
            {/* Mouth */}
            <path d="M80 82V85C77 88 74 88 74 86M80 85C83 88 86 88 86 86" stroke="#1F2937" strokeWidth="2.5" strokeLinecap="round" />
            {/* Tiny Paws */}
            <ellipse cx="68" cy="125" rx="8" ry="6" fill="#FFFFFF" stroke="#4A4E69" strokeWidth="2.5" />
            <ellipse cx="92" cy="125" rx="8" ry="6" fill="#FFFFFF" stroke="#4A4E69" strokeWidth="2.5" />
          </g>
        </svg>
      </div>
    );
  }

  // 3. CYBER-NEKO (Black Cat Typing on Pink Laptop - Screenshot Row 2 Item 3)
  if (variant === "hacker") {
    return (
      <div className={`relative flex items-center justify-center select-none ${className}`}>
        <svg viewBox="0 0 160 160" className="w-full h-full overflow-visible" fill="none">
          <style>{`
            @keyframes typingHands {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-4px); }
            }
            @keyframes screenGlow {
              0%, 100% { filter: drop-shadow(0 0 6px #EC4899); }
              50% { filter: drop-shadow(0 0 14px #F43F5E); }
            }
            .anim-typing { animation: typingHands 0.25s infinite; }
            .anim-laptop-glow { animation: screenGlow 1.8s ease-in-out infinite; }
          `}</style>
          {/* Dark Shadow */}
          <ellipse cx="80" cy="144" rx="55" ry="10" fill="#000" opacity="0.4" />
          {/* Black Cat Body */}
          <path d="M50 75C50 55 62 48 80 48C98 48 110 55 110 75C110 115 106 138 80 138C54 138 50 115 50 75Z" fill="#111827" stroke="#1F2937" strokeWidth="2" />
          {/* Ears */}
          <path d="M56 52L46 22L70 42Z" fill="#111827" stroke="#374151" strokeWidth="1.5" />
          <path d="M104 52L114 22L90 42Z" fill="#111827" stroke="#374151" strokeWidth="1.5" />
          <path d="M54 28L62 38" stroke="#F43F5E" strokeWidth="2" />
          <path d="M106 28L98 38" stroke="#F43F5E" strokeWidth="2" />
          {/* Eyes (Glow Yellow/Green) */}
          <ellipse cx="68" cy="62" rx="6" ry="7" fill="#FACC15" />
          <ellipse cx="92" cy="62" rx="6" ry="7" fill="#FACC15" />
          <ellipse cx="68" cy="62" rx="2" ry="6" fill="#000000" />
          <ellipse cx="92" cy="62" rx="2" ry="6" fill="#000000" />
          {/* Tail curving to left */}
          <path d="M50 120C32 118 24 100 24 88C24 80 32 80 32 88C32 94 38 106 50 108" stroke="#111827" strokeWidth="7" strokeLinecap="round" />
          {/* Pink Hacker Laptop (From Screenshot Row 2 Item 3) */}
          <g className="anim-laptop-glow">
            {/* Screen Open */}
            <rect x="85" y="70" width="46" height="36" rx="4" transform="rotate(-12 85 70)" fill="#F43F5E" stroke="#FB7185" strokeWidth="2" />
            <path d="M106 82C106 79 110 79 110 82C110 85 106 87 106 87C106 87 102 85 102 82C102 79 106 79 106 82Z" fill="#FFFFFF" />
            <circle cx="106" cy="77" r="2.5" fill="#FFFFFF" />
            <circle cx="101" cy="79" r="2" fill="#FFFFFF" />
            <circle cx="111" cy="79" r="2" fill="#FFFFFF" />
            {/* Keyboard Base */}
            <polygon points="76,128 126,120 134,136 84,142" fill="#BE123C" stroke="#FB7185" strokeWidth="1.5" />
          </g>
          {/* Typing Paws (Animated) */}
          <g className="anim-typing">
            <ellipse cx="86" cy="118" rx="6" ry="5" fill="#1F2937" stroke="#374151" strokeWidth="1.5" />
            <ellipse cx="98" cy="116" rx="6" ry="5" fill="#1F2937" stroke="#374151" strokeWidth="1.5" />
          </g>
        </svg>
      </div>
    );
  }

  // 4. CHUBBY LAUGHING ORANGE CAT (Rolling on Back - Screenshot Row 1 Item 4)
  if (variant === "laughing") {
    return (
      <div className={`relative flex items-center justify-center select-none ${className}`}>
        <svg viewBox="0 0 170 140" className="w-full h-full overflow-visible" fill="none">
          <style>{`
            @keyframes bellyRoll {
              0%, 100% { transform: rotate(0deg) translateY(0); }
              25% { transform: rotate(-5deg) translateY(-2px); }
              75% { transform: rotate(5deg) translateY(-2px); }
            }
            @keyframes pawsFlail {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-4px); }
            }
            .anim-belly { animation: bellyRoll 1.4s ease-in-out infinite; transform-origin: center bottom; }
            .anim-flail { animation: pawsFlail 0.5s ease-in-out infinite; }
          `}</style>
          {/* Shadow */}
          <ellipse cx="85" cy="125" rx="60" ry="10" fill="#EA580C" opacity="0.2" />
          <g className="anim-belly">
            {/* Round Chubby Body Lying on Back */}
            <ellipse cx="85" cy="85" rx="48" ry="36" fill="#F97316" stroke="#C2410C" strokeWidth="3" />
            {/* Belly Patch */}
            <ellipse cx="85" cy="88" rx="34" ry="24" fill="#FED7AA" />
            {/* Stripes */}
            <path d="M60 62L68 70M110 62L102 70M85 54V64" stroke="#EA580C" strokeWidth="3.5" strokeLinecap="round" />
            {/* Head Tilting Left with Open Laughing Mouth */}
            <circle cx="125" cy="65" r="24" fill="#F97316" stroke="#C2410C" strokeWidth="3" />
            {/* Ears */}
            <polygon points="126,44 140,24 142,48" fill="#F97316" stroke="#C2410C" strokeWidth="2.5" />
            <polygon points="112,48 106,26 122,44" fill="#F97316" stroke="#C2410C" strokeWidth="2.5" />
            <polygon points="128,42 136,30 138,46" fill="#FDA4AF" />
            {/* Laughing Closed Happy Eyes "^ ^" */}
            <path d="M116 58C118 54 124 54 126 58" stroke="#7C2D12" strokeWidth="3" strokeLinecap="round" />
            <path d="M132 60C134 56 140 56 142 60" stroke="#7C2D12" strokeWidth="3" strokeLinecap="round" />
            {/* Giant Laughing Open Mouth with Tongue */}
            <path d="M120 68C120 78 136 78 136 68H120Z" fill="#991B1B" stroke="#7C2D12" strokeWidth="2" />
            <path d="M124 73C126 71 130 71 132 73C132 76 124 76 124 73Z" fill="#F43F5E" />
            {/* Paws in the Air (Laughing Pose) */}
            <g className="anim-flail">
              <ellipse cx="65" cy="54" rx="8" ry="10" fill="#FED7AA" stroke="#C2410C" strokeWidth="2.5" />
              <ellipse cx="98" cy="52" rx="8" ry="10" fill="#FED7AA" stroke="#C2410C" strokeWidth="2.5" />
              {/* Little Paw Pads */}
              <circle cx="65" cy="52" r="3" fill="#FB7185" />
              <circle cx="98" cy="50" r="3" fill="#FB7185" />
            </g>
            {/* Back Feet */}
            <ellipse cx="42" cy="98" rx="10" ry="8" fill="#FED7AA" stroke="#C2410C" strokeWidth="2.5" />
            <circle cx="42" cy="98" r="3" fill="#FB7185" />
          </g>
        </svg>
      </div>
    );
  }

  // 5. COZY SLEEPING CAT (Curled Up Orange Tabby - Screenshot Row 3 Item 4)
  if (variant === "sleeping") {
    return (
      <div className={`relative flex items-center justify-center select-none ${className}`}>
        <svg viewBox="0 0 160 120" className="w-full h-full overflow-visible" fill="none">
          <style>{`
            @keyframes catBreathe {
              0%, 100% { transform: scale(1, 1); }
              50% { transform: scale(1.02, 1.04) translateY(-2px); }
            }
            @keyframes zzzFloat {
              0% { opacity: 0; transform: translate(0, 0) scale(0.6); }
              50% { opacity: 1; transform: translate(6px, -12px) scale(1); }
              100% { opacity: 0; transform: translate(14px, -24px) scale(1.2); }
            }
            .anim-breathe { animation: catBreathe 3.6s ease-in-out infinite; transform-origin: bottom center; }
            .anim-zzz1 { animation: zzzFloat 3s linear infinite; }
            .anim-zzz2 { animation: zzzFloat 3s linear infinite 1.5s; }
          `}</style>
          {/* Shadow */}
          <ellipse cx="80" cy="108" rx="52" ry="9" fill="#78350F" opacity="0.18" />
          <g className="anim-breathe">
            {/* Curled Body */}
            <path d="M40 85C40 60 62 50 88 50C115 50 128 65 128 85C128 105 110 110 85 110C55 110 40 102 40 85Z" fill="#F97316" stroke="#9A3412" strokeWidth="3" />
            {/* Back Stripes */}
            <path d="M68 53L64 68M84 51L82 66M100 54L104 69" stroke="#C2410C" strokeWidth="3" strokeLinecap="round" />
            {/* Tail Wrapped Around Body */}
            <path d="M125 82C134 85 136 98 120 104C100 110 65 110 52 104" stroke="#F97316" strokeWidth="9" strokeLinecap="round" />
            <path d="M125 82C134 85 136 98 120 104C100 110 65 110 52 104" stroke="#9A3412" strokeWidth="2" fill="none" />
            {/* Sleeping Head */}
            <circle cx="48" cy="85" r="20" fill="#F97316" stroke="#9A3412" strokeWidth="3" />
            {/* Ears */}
            <polygon points="40,68 32,50 48,60" fill="#F97316" stroke="#9A3412" strokeWidth="2.5" />
            <polygon points="54,66 64,50 62,68" fill="#F97316" stroke="#9A3412" strokeWidth="2.5" />
            <polygon points="40,64 36,54 44,60" fill="#FED7AA" />
            {/* Sleeping Peaceful Closed Eyes (- -) */}
            <path d="M38 88C41 90 45 90 48 88" stroke="#7C2D12" strokeWidth="2.5" strokeLinecap="round" />
            {/* Nose */}
            <circle cx="42" cy="94" r="2" fill="#FB7185" />
          </g>
          {/* ZZZ animations */}
          <text x="75" y="45" className="anim-zzz1" fill="#EA580C" fontSize="13" fontWeight="900" fontFamily="sans-serif">z</text>
          <text x="88" y="32" className="anim-zzz2" fill="#EA580C" fontSize="17" fontWeight="900" fontFamily="sans-serif">Z</text>
        </svg>
      </div>
    );
  }

  // 6. 8-BIT RETRO PIXEL CAT (Black Cat with Red Collar - Screenshot Row 2 Item 5)
  if (variant === "pixel") {
    return (
      <div className={`relative flex items-center justify-center select-none ${className}`}>
        <svg viewBox="0 0 140 140" className="w-full h-full overflow-visible" shapeRendering="crispEdges">
          <style>{`
            @keyframes pixelBlink {
              0%, 90%, 100% { opacity: 1; }
              95% { opacity: 0; }
            }
            @keyframes pixelTail {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-4px); }
            }
            .anim-pixel-eyes { animation: pixelBlink 3s infinite; }
            .anim-pixel-tail { animation: pixelTail 1.2s steps(2, jump-none) infinite; }
          `}</style>
          {/* Pixel Grid Layout */}
          <rect x="25" y="125" width="85" height="10" fill="#000" opacity="0.15" />
          {/* Body */}
          <rect x="45" y="65" width="45" height="55" fill="#1F2937" />
          <rect x="50" y="60" width="35" height="65" fill="#111827" />
          {/* Paws */}
          <rect x="40" y="115" width="15" height="10" fill="#374151" />
          <rect x="80" y="115" width="15" height="10" fill="#374151" />
          {/* Red Collar & Gold Tag */}
          <rect x="45" y="65" width="45" height="8" fill="#DC2626" />
          <rect x="64" y="73" width="8" height="8" fill="#F59E0B" />
          {/* Head */}
          <rect x="35" y="25" width="65" height="40" fill="#111827" />
          {/* Ears */}
          <rect x="35" y="10" width="15" height="15" fill="#111827" />
          <rect x="40" y="15" width="8" height="8" fill="#F43F5E" />
          <rect x="85" y="10" width="15" height="15" fill="#111827" />
          <rect x="88" y="15" width="8" height="8" fill="#F43F5E" />
          {/* Eyes (Pixel Green/Yellow) */}
          <g className="anim-pixel-eyes">
            <rect x="45" y="38" width="12" height="10" fill="#10B981" />
            <rect x="48" y="40" width="6" height="6" fill="#000000" />
            <rect x="78" y="38" width="12" height="10" fill="#10B981" />
            <rect x="81" y="40" width="6" height="6" fill="#000000" />
          </g>
          {/* Nose */}
          <rect x="65" y="48" width="6" height="4" fill="#F43F5E" />
          {/* Pixel Tail */}
          <g className="anim-pixel-tail">
            <rect x="90" y="90" width="10" height="8" fill="#111827" />
            <rect x="98" y="82" width="10" height="8" fill="#111827" />
            <rect x="104" y="74" width="10" height="10" fill="#111827" />
            <rect x="108" y="66" width="8" height="10" fill="#374151" />
          </g>
        </svg>
      </div>
    );
  }

  // 7. MOON FISHER CAT (Cat Fishing on Crescent Moon - Screenshot Row 2 Item 2)
  if (variant === "moon") {
    return (
      <div className={`relative flex items-center justify-center select-none ${className}`}>
        <svg viewBox="0 0 160 160" className="w-full h-full overflow-visible" fill="none">
          <style>{`
            @keyframes moonSway {
              0%, 100% { transform: rotate(0deg); }
              50% { transform: rotate(-5deg); }
            }
            @keyframes fishDangle {
              0%, 100% { transform: rotate(0deg) translateY(0); }
              50% { transform: rotate(12deg) translateY(3px); }
            }
            @keyframes starGlow {
              0%, 100% { opacity: 0.3; transform: scale(0.8); }
              50% { opacity: 1; transform: scale(1.15); }
            }
            .anim-moon { animation: moonSway 4s ease-in-out infinite; transform-origin: 80px 20px; }
            .anim-fish { animation: fishDangle 2.2s ease-in-out infinite; transform-origin: 125px 90px; }
            .anim-star { animation: starGlow 2s ease-in-out infinite; }
          `}</style>
          {/* Floating Stars */}
          <g className="anim-star">
            <path d="M30 35L32 28L34 35L41 37L34 39L32 46L30 39L23 37Z" fill="#FDE047" />
            <path d="M135 40L136 34L137 40L143 41L137 42L136 48L135 42L129 41Z" fill="#FDE047" />
          </g>
          <g className="anim-moon">
            {/* Crescent Yellow Moon */}
            <path d="M45 130C32 108 30 75 48 48C58 32 75 22 92 20C72 28 60 50 62 76C64 102 82 122 106 128C88 135 62 138 45 130Z" fill="#FBBF24" stroke="#F59E0B" strokeWidth="3" />
            {/* Cute Grey Kitten Sitting on Moon */}
            <ellipse cx="82" cy="85" rx="18" ry="16" fill="#9CA3AF" stroke="#4B5563" strokeWidth="2.5" />
            <circle cx="82" cy="62" r="15" fill="#9CA3AF" stroke="#4B5563" strokeWidth="2.5" />
            {/* Ears */}
            <polygon points="72,50 66,35 80,45" fill="#9CA3AF" stroke="#4B5563" strokeWidth="2" />
            <polygon points="86,45 100,35 94,50" fill="#9CA3AF" stroke="#4B5563" strokeWidth="2" />
            <polygon points="72,48 68,38 78,45" fill="#FDA4AF" />
            {/* Big Anime Eyes */}
            <circle cx="77" cy="62" r="3.5" fill="#1F2937" />
            <circle cx="89" cy="62" r="3.5" fill="#1F2937" />
            <circle cx="76" cy="60" r="1.5" fill="#FFFFFF" />
            <circle cx="88" cy="60" r="1.5" fill="#FFFFFF" />
            <ellipse cx="72" cy="66" rx="2.5" ry="1.5" fill="#FDA4AF" />
            <ellipse cx="94" cy="66" rx="2.5" ry="1.5" fill="#FDA4AF" />
            {/* Fishing Rod */}
            <line x1="88" y1="80" x2="128" y2="35" stroke="#78350F" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M128 35C132 60 128 90 128 100" stroke="#E0E7FF" strokeWidth="1.5" strokeDasharray="3 2" />
            {/* Fish Catch Hooked */}
            <g className="anim-fish">
              <path d="M128 100L125 108C125 108 120 112 120 118C120 124 136 124 136 118C136 112 131 108 131 108Z" fill="#60A5FA" stroke="#2563EB" strokeWidth="1.5" />
              <polygon points="128,122 122,130 134,130" fill="#3B82F6" />
              <circle cx="125" cy="114" r="1" fill="#000" />
            </g>
          </g>
        </svg>
      </div>
    );
  }

  // 8. PEEKING KURO-CAT (Curious Black Cat Eyes - Screenshot Row 2 Item 4)
  if (variant === "peeking") {
    return (
      <div className={`relative flex items-center justify-center select-none ${className}`}>
        <svg viewBox="0 0 160 120" className="w-full h-full overflow-visible" fill="none">
          <style>{`
            @keyframes peekUp {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-8px); }
            }
            @keyframes pupilTrack {
              0%, 100% { transform: translateX(0); }
              30% { transform: translateX(-3px); }
              70% { transform: translateX(3px); }
            }
            .anim-peek { animation: peekUp 3s ease-in-out infinite; }
            .anim-pupil { animation: pupilTrack 3.5s ease-in-out infinite; }
          `}</style>
          {/* Peeking Box / Card Edge Line */}
          <line x1="15" y1="95" x2="145" y2="95" stroke="#E2E8F0" strokeWidth="4" strokeLinecap="round" />
          <g className="anim-peek">
            {/* Black Cat Head Peeking Out */}
            <path d="M52 95C52 65 64 50 80 50C96 50 108 65 108 95Z" fill="#0F172A" stroke="#334155" strokeWidth="2.5" />
            {/* Pointy Ears */}
            <polygon points="56,60 48,28 72,48" fill="#0F172A" stroke="#334155" strokeWidth="2" />
            <polygon points="104,60 112,28 88,48" fill="#0F172A" stroke="#334155" strokeWidth="2" />
            <polygon points="55,36 64,48 58,54" fill="#38BDF8" opacity="0.4" />
            <polygon points="105,36 96,48 102,54" fill="#38BDF8" opacity="0.4" />
            {/* Big Bright Yellow Eyes */}
            <ellipse cx="68" cy="74" rx="9" ry="11" fill="#FBBF24" />
            <ellipse cx="92" cy="74" rx="9" ry="11" fill="#FBBF24" />
            {/* Pupils tracking */}
            <g className="anim-pupil">
              <ellipse cx="68" cy="74" rx="3.5" ry="9" fill="#020617" />
              <ellipse cx="92" cy="74" rx="3.5" ry="9" fill="#020617" />
              <circle cx="66" cy="70" r="2" fill="#FFFFFF" />
              <circle cx="90" cy="70" r="2" fill="#FFFFFF" />
            </g>
            {/* Tiny Paws Peeking over ledge */}
            <ellipse cx="62" cy="95" rx="7" ry="5" fill="#0F172A" stroke="#334155" strokeWidth="2" />
            <ellipse cx="98" cy="95" rx="7" ry="5" fill="#0F172A" stroke="#334155" strokeWidth="2" />
          </g>
        </svg>
      </div>
    );
  }

  // 9. TUXEDO GENTLEMAN CAT (Formal Sitting Tuxedo - Screenshot Row 1 Item 1)
  if (variant === "tuxedo") {
    return (
      <div className={`relative flex items-center justify-center select-none ${className}`}>
        <svg viewBox="0 0 160 160" className="w-full h-full overflow-visible" fill="none">
          <style>{`
            @keyframes earTwitch {
              0%, 90%, 100% { transform: rotate(0deg); }
              93% { transform: rotate(-8deg); }
              96% { transform: rotate(4deg); }
            }
            @keyframes tailSway {
              0%, 100% { transform: rotate(0deg); }
              50% { transform: rotate(14deg); }
            }
            .anim-ear { animation: earTwitch 4s ease-in-out infinite; transform-origin: 55px 38px; }
            .anim-tail { animation: tailSway 3s ease-in-out infinite; transform-origin: 105px 135px; }
          `}</style>
          {/* Shadow */}
          <ellipse cx="80" cy="146" rx="46" ry="10" fill="#0F172A" opacity="0.2" />
          {/* Long Curving Tail */}
          <g className="anim-tail">
            <path d="M100 135C125 135 140 115 138 95C136 85 125 85 127 95C128 105 118 120 100 124" stroke="#1E293B" strokeWidth="8" strokeLinecap="round" />
          </g>
          {/* Body Silhouette */}
          <path d="M48 85C48 60 62 50 80 50C98 50 112 60 112 85C112 125 106 142 80 142C54 142 48 125 48 85Z" fill="#1E293B" stroke="#0F172A" strokeWidth="3" />
          {/* White Chest "Tuxedo Shirt" */}
          <path d="M68 85C70 120 74 135 80 142C86 135 90 120 92 85C90 70 85 65 80 65C75 65 70 70 68 85Z" fill="#F8FAFC" />
          {/* Red Dapper Bowtie */}
          <polygon points="72,75 80,78 72,82" fill="#BE123C" />
          <polygon points="88,75 80,78 88,82" fill="#BE123C" />
          <circle cx="80" cy="78" r="2.5" fill="#E11D48" />
          {/* Head */}
          <circle cx="80" cy="52" r="22" fill="#1E293B" stroke="#0F172A" strokeWidth="3" />
          {/* White Mask / Snout */}
          <path d="M80 52L72 70C74 73 86 73 88 70L80 52Z" fill="#F8FAFC" />
          {/* Ears */}
          <g className="anim-ear">
            <polygon points="62,40 50,16 70,30" fill="#1E293B" stroke="#0F172A" strokeWidth="2.5" />
            <polygon points="56,24 64,32 58,35" fill="#FDA4AF" />
          </g>
          <polygon points="98,40 110,16 90,30" fill="#1E293B" stroke="#0F172A" strokeWidth="2.5" />
          <polygon points="104,24 96,32 102,35" fill="#FDA4AF" />
          {/* Eyes (Aristocratic Emerald Green) */}
          <ellipse cx="70" cy="52" rx="4.5" ry="6" fill="#10B981" />
          <ellipse cx="90" cy="52" rx="4.5" ry="6" fill="#10B981" />
          <circle cx="70" cy="52" r="2" fill="#0F172A" />
          <circle cx="90" cy="52" r="2" fill="#0F172A" />
          <circle cx="69" cy="50" r="1.5" fill="#FFFFFF" />
          <circle cx="89" cy="50" r="1.5" fill="#FFFFFF" />
          {/* Nose */}
          <polygon points="78,64 82,64 80,66" fill="#F43F5E" />
          {/* Whiskers */}
          <line x1="55" y1="64" x2="38" y2="62" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="55" y1="67" x2="36" y2="68" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="105" y1="64" x2="122" y2="62" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="105" y1="67" x2="124" y2="68" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  // 10. UFO ALIEN CAT (Saucer Flying Cat - Screenshot Row 3 Item 2)
  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      <svg viewBox="0 0 160 160" className="w-full h-full overflow-visible" fill="none">
        <style>{`
          @keyframes ufoHover {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            50% { transform: translateY(-8px) rotate(3deg); }
          }
          @keyframes tractorBeam {
            0%, 100% { opacity: 0.2; transform: scaleX(0.9); }
            50% { opacity: 0.6; transform: scaleX(1.1); }
          }
          .anim-ufo { animation: ufoHover 3s ease-in-out infinite; }
          .anim-beam { animation: tractorBeam 2s ease-in-out infinite; transform-origin: top center; }
        `}</style>
        {/* Tractor Beam */}
        <polygon points="50,110 110,110 135,155 25,155" fill="url(#beamGrad)" className="anim-beam" />
        <defs>
          <linearGradient id="beamGrad" x1="80" y1="110" x2="80" y2="155" gradientUnits="userSpaceOnUse">
            <stop stopColor="#34D399" stopOpacity="0.8" />
            <stop offset="1" stopColor="#34D399" stopOpacity="0" />
          </linearGradient>
        </defs>
        <g className="anim-ufo">
          {/* Glass Dome */}
          <path d="M50 82C50 48 64 36 80 36C96 36 110 48 110 82Z" fill="#A7F3D0" fillOpacity="0.45" stroke="#34D399" strokeWidth="2.5" />
          {/* White Cat Inside */}
          <circle cx="80" cy="66" r="16" fill="#FFFFFF" stroke="#6EE7B7" strokeWidth="2" />
          <polygon points="70,54 62,38 76,46" fill="#FFFFFF" stroke="#6EE7B7" strokeWidth="2" />
          <polygon points="90,46 104,38 96,54" fill="#FFFFFF" stroke="#6EE7B7" strokeWidth="2" />
          <polygon points="69,48 66,42 74,46" fill="#FDA4AF" />
          <polygon points="97,48 100,42 92,46" fill="#FDA4AF" />
          {/* Large Kawaii Alien Eyes */}
          <ellipse cx="74" cy="65" rx="3.5" ry="4.5" fill="#065F46" />
          <ellipse cx="86" cy="65" rx="3.5" ry="4.5" fill="#065F46" />
          <circle cx="73" cy="63" r="1.5" fill="#FFFFFF" />
          <circle cx="85" cy="63" r="1.5" fill="#FFFFFF" />
          <ellipse cx="70" cy="70" rx="2" ry="1" fill="#FDA4AF" />
          <ellipse cx="90" cy="70" rx="2" ry="1" fill="#FDA4AF" />
          {/* Saucer Base */}
          <ellipse cx="80" cy="88" rx="55" ry="16" fill="#10B981" stroke="#047857" strokeWidth="3" />
          <ellipse cx="80" cy="94" rx="42" ry="10" fill="#059669" />
          {/* Glowing Saucer Lights */}
          <circle cx="45" cy="88" r="3.5" fill="#FDE047" />
          <circle cx="68" cy="92" r="3.5" fill="#FDE047" />
          <circle cx="92" cy="92" r="3.5" fill="#FDE047" />
          <circle cx="115" cy="88" r="3.5" fill="#FDE047" />
        </g>
      </svg>
    </div>
  );
};

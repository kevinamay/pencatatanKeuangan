"use client";

import React, { useEffect, useState } from "react";
import { Lottie } from "lottie-react";

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

// In-memory cache for fast instant switches
const animationCache = new Map<string, object>();

export const LottieAnimation: React.FC<LottieAnimationProps> = ({
  type,
  className = "w-28 h-28",
  loop = true,
  autoplay = true,
}) => {
  const [mounted, setMounted] = useState(false);
  const [animationData, setAnimationData] = useState<object | null>(null);
  const [hasError, setHasError] = useState(false);

  // Map requested type to verified local LottieFiles JSON file
  const getAnimationPath = (t: LottieAnimationType): string => {
    switch (t) {
      case "wallet":
      case "wallet-coins":
        return "/animations/wallet.json";
      case "piggy-bank":
        return "/animations/piggy-bank.json";
      case "save-money":
        return "/animations/save-money.json";
      case "chart-growth":
      case "chart-up":
      case "analytics":
        return "/animations/chart-growth.json";
      case "coins":
      case "coin-stack":
        return "/animations/coins.json";
      default:
        return "/animations/wallet.json";
    }
  };

  const animPath = getAnimationPath(type);

  useEffect(() => {
    setMounted(true);
    let isCurrent = true;

    if (animationCache.has(animPath)) {
      setAnimationData(animationCache.get(animPath)!);
      return;
    }

    fetch(animPath)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json) => {
        animationCache.set(animPath, json);
        if (isCurrent) {
          setAnimationData(json);
        }
      })
      .catch((err) => {
        console.warn(`Lottie fetch error for ${animPath}:`, err);
        if (isCurrent) setHasError(true);
      });

    return () => {
      isCurrent = false;
    };
  }, [animPath]);

  // Animated Vector Fallback with finance icons in transparent floating container
  const renderFallback = () => {
    return (
      <div
        className={`${className} flex items-center justify-center relative p-1`}
      >
        {type === "piggy-bank" || type === "save-money" ? (
          <svg
            className="w-full h-full text-[#991213] animate-bounce"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8.7 3.5 2 4.6V19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-1h2v1a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-1.6c1.3-1 2-2.8 2-4.4 0-1.5-1-4-2-5 .2-.6.7-1.5 1-2.5 0-.5-.5-.5-1-.5z" />
            <path d="M16 11h.01" />
            <path d="M9 7h4" />
          </svg>
        ) : type === "chart-growth" || type === "chart-up" ? (
          <svg
            className="w-full h-full text-[#991213] animate-pulse"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M3 3v18h18" />
            <path d="m19 9-5 5-4-4-3 3" />
            <circle cx="19" cy="9" r="2" fill="#991213" />
          </svg>
        ) : (
          <svg
            className="w-full h-full text-[#991213] animate-pulse"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <rect x="2" y="6" width="20" height="13" rx="3" fill="#FFD9D9" />
            <path d="M2 10h20" stroke="#991213" />
            <circle cx="16" cy="14" r="2" fill="#991213" />
          </svg>
        )}
      </div>
    );
  };

  if (!mounted || !animationData || hasError) {
    return renderFallback();
  }

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden ${className}`}
    >
      <Lottie
        src={animationData}
        loop={loop}
        autoplay={autoplay}
        className="w-full h-full object-contain pointer-events-none"
      />
    </div>
  );
};

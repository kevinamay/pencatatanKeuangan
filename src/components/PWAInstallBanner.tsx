"use client";

import React, { useState, useEffect } from "react";
import { Download, Smartphone, X, CheckCircle, Share, PlusSquare } from "lucide-react";
import { CatAnimation } from "./cat-prototype/CatAnimations";

export const PWAInstallBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // 1. Register Service Worker
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          console.log("Service Worker registered successfully:", reg.scope);
        })
        .catch((err) => {
          console.log("Service Worker registration failed:", err);
        });
    }

    // 2. Check if already installed / standalone
    if (typeof window !== "undefined") {
      const isStandaloneMode =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone === true;
      setIsStandalone(isStandaloneMode);

      // Check if iOS
      const userAgent = window.navigator.userAgent.toLowerCase();
      const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
      setIsIOS(isIosDevice);
    }

    // 3. Listen for Android / Chrome beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Trigger native Android WebAPK / PWA installation
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setIsInstallable(false);
        setDeferredPrompt(null);
      }
    } else if (isIOS) {
      // Show iOS step-by-step guidance
      setShowIOSModal(true);
    }
  };

  // If already running inside installed standalone app or user dismissed, don't show banner
  if (isStandalone || isDismissed) {
    return null;
  }

  return (
    <>
      {/* Discreet Banner on Top or Floating */}
      {(isInstallable || isIOS) && (
        <div className="fixed bottom-4 right-4 z-40 max-w-sm w-[92%] sm:w-auto animate-fade-in print:hidden">
          <div className="rounded-2xl bg-white border border-[#E8E2D8] shadow-xl p-3.5 flex items-center justify-between gap-3 text-stone-900">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#FAF7F2] border border-[#E8E2D8] flex items-center justify-center p-1 flex-shrink-0">
                <CatAnimation variant="sleeping" className="w-full h-full" />
              </div>
              <div>
                <h4 className="text-xs font-black text-stone-900 flex items-center gap-1">
                  <span>Pasang Aplikasi Tokyo Neko</span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-[#854D0E]">
                    WebAPK
                  </span>
                </h4>
                <p className="text-[11px] text-stone-500">
                  Gunakan seperti aplikasi Android/iOS tanpa browser URL bar.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                onClick={handleInstallClick}
                className="px-3 py-1.5 rounded-xl bg-[#854D0E] hover:bg-[#713F12] text-white text-xs font-bold shadow-xs active:scale-95 transition-all flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Install</span>
              </button>
              <button
                onClick={() => setIsDismissed(true)}
                className="p-1 text-stone-400 hover:text-stone-600 rounded-lg"
                title="Tutup banner"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* iOS Safari Installation Guide Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white border border-[#E8E2D8] p-6 shadow-2xl space-y-4 text-stone-900">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-[#854D0E]" />
                <h3 className="font-black text-base">Pasang di iPhone / iPad</h3>
              </div>
              <button
                onClick={() => setShowIOSModal(false)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-stone-600 font-medium leading-relaxed">
              <div className="p-3 rounded-2xl bg-[#FAF7F2] border border-[#E8E2D8] flex items-start gap-2.5">
                <span className="font-bold text-[#854D0E]">1.</span>
                <p>
                  Ketuk tombol <strong>Bagikan (Share)</strong> <Share className="w-3.5 h-3.5 inline mx-0.5 text-blue-600" /> di bagian bawah layar Safari Anda.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-[#FAF7F2] border border-[#E8E2D8] flex items-start gap-2.5">
                <span className="font-bold text-[#854D0E]">2.</span>
                <p>
                  Gulir ke bawah dan pilih <strong>"Tambahkan ke Layar Utama" (Add to Home Screen)</strong> <PlusSquare className="w-3.5 h-3.5 inline mx-0.5 text-stone-800" />.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-[#FAF7F2] border border-[#E8E2D8] flex items-start gap-2.5">
                <span className="font-bold text-[#854D0E]">3.</span>
                <p>
                  Ketuk <strong>"Tambah"</strong> di pojok kanan atas. Ikon Tokyo Neko akan muncul di layar HP Anda seperti aplikasi bawaan!
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full py-2.5 rounded-xl bg-[#854D0E] text-white font-bold text-xs shadow-xs"
            >
              Mengerti, Terima Kasih!
            </button>
          </div>
        </div>
      )}
    </>
  );
};

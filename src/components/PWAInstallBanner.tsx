"use client";

import React, { useState, useEffect } from "react";
import { Download, Smartphone, X, Share, PlusSquare, Monitor, HelpCircle } from "lucide-react";
import { CatAnimation } from "./cat-prototype/CatAnimations";

export const PWAInstallBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"android" | "ios" | "pc">("android");
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // 1. Register Service Worker
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((reg) => {
            console.log("[PWA] Tokyo Neko Service Worker registered:", reg.scope);
          })
          .catch((err) => {
            console.warn("[PWA] Service Worker registration failed:", err);
          });
      });
    }

    // 2. Check if already installed / standalone
    if (typeof window !== "undefined") {
      const isStandaloneMode =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone === true;
      setIsStandalone(isStandaloneMode);

      const userAgent = window.navigator.userAgent.toLowerCase();
      if (/iphone|ipad|ipod/.test(userAgent)) {
        setActiveTab("ios");
      } else if (!/android/.test(userAgent)) {
        setActiveTab("pc");
      }

      // Show banner after 1.5s if not installed and not dismissed in this session
      if (!isStandaloneMode && !sessionStorage.getItem("tokyo_neko_pwa_dismissed")) {
        const timer = setTimeout(() => {
          setShowBanner(true);
        }, 1500);
        return () => clearTimeout(timer);
      }
    }

    // 3. Listen for Chromium / Android beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      (window as any).pwaDeferredPrompt = e;
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // 4. Listen for appinstalled
    const handleAppInstalled = () => {
      setIsStandalone(true);
      setShowBanner(false);
      setShowGuideModal(false);
      setDeferredPrompt(null);
      console.log("[PWA] Tokyo Neko successfully installed as WebAPK.");
    };

    window.addEventListener("appinstalled", handleAppInstalled);

    // 5. Expose trigger globally for header/navbar buttons
    (window as any).triggerPwaInstall = () => {
      if ((window as any).pwaDeferredPrompt) {
        (window as any).pwaDeferredPrompt.prompt();
      } else {
        setShowGuideModal(true);
      }
    };

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    const promptToUse = deferredPrompt || (typeof window !== "undefined" && (window as any).pwaDeferredPrompt);
    if (promptToUse) {
      promptToUse.prompt();
      const { outcome } = await promptToUse.userChoice;
      if (outcome === "accepted") {
        setShowBanner(false);
        setShowGuideModal(false);
      }
      setDeferredPrompt(null);
      (window as any).pwaDeferredPrompt = null;
    } else {
      setShowGuideModal(true);
    }
  };

  const handleDismissBanner = () => {
    setShowBanner(false);
    sessionStorage.setItem("tokyo_neko_pwa_dismissed", "true");
  };

  // If already running inside standalone app, don't show prompt
  if (isStandalone) {
    return null;
  }

  return (
    <>
      {/* Floating PWA Install Banner (Mobile Only) */}
      {showBanner && (
        <div className="md:hidden fixed bottom-4 left-3 right-3 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-fade-in print:hidden">
          <div className="rounded-2xl bg-white border border-[#E8E2D8] shadow-2xl p-4 flex items-start gap-3.5 text-stone-900">
            <div className="w-12 h-12 rounded-xl bg-[#FAF7F2] border border-[#E8E2D8] flex items-center justify-center p-1.5 flex-shrink-0 shadow-xs">
              <CatAnimation variant="sleeping" className="w-full h-full" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-[#854D0E] border border-amber-200">
                  WebAPK Resmi
                </span>
                <button
                  onClick={handleDismissBanner}
                  className="p-1 text-stone-400 hover:text-stone-600 rounded-lg transition"
                  title="Tutup banner"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <h4 className="text-xs sm:text-sm font-black text-stone-900 mt-1">
                Pasang Aplikasi Tokyo Neko (WebAPK)
              </h4>
              <p className="text-[11px] text-stone-500 mt-0.5 line-clamp-2">
                Pasang di layar utama HP: tampilan bersih tanpa bar browser, cepat, dan terasa seperti aplikasi Android asli!
              </p>

              <div className="mt-2.5 flex items-center gap-2">
                <button
                  onClick={handleInstallClick}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#854D0E] hover:bg-[#713F12] text-white text-xs font-bold shadow-md shadow-amber-900/20 active:scale-95 transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Install</span>
                </button>
                <button
                  onClick={() => {
                    setShowGuideModal(true);
                    setShowBanner(false);
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-[#FAF7F2] hover:bg-stone-200 text-stone-700 font-bold text-xs border border-[#E8E2D8] transition cursor-pointer"
                >
                  Petunjuk
                </button>
                <button
                  onClick={handleDismissBanner}
                  className="px-2.5 py-1.5 rounded-xl text-stone-400 hover:text-stone-600 font-semibold text-xs transition cursor-pointer"
                >
                  Nanti
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Multi-Platform Installation Guide Modal */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white border border-[#E8E2D8] p-5 sm:p-6 shadow-2xl space-y-4 text-stone-900 relative">
            <button
              onClick={() => setShowGuideModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-stone-400 hover:text-stone-600 transition"
              title="Tutup"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#FAF7F2] p-1.5 shadow-xs border border-[#E8E2D8] shrink-0">
                <CatAnimation variant="maneki" className="w-full h-full" />
              </div>
              <div>
                <h3 className="font-black text-base sm:text-lg leading-tight">
                  📱 Cara Memasang (Install) Web Ini ke HP Anda:
                </h3>
                <p className="text-xs text-stone-500">
                  Tokyo Neko FinPlan (WebAPK & PWA Standalone)
                </p>
              </div>
            </div>

            {/* Tab Selection */}
            <div className="flex rounded-xl bg-[#FAF7F2] border border-[#E8E2D8] p-1 gap-1 text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveTab("android")}
                className={`flex-1 py-1.5 rounded-lg transition text-center cursor-pointer ${
                  activeTab === "android"
                    ? "bg-[#854D0E] text-white shadow-xs"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                🤖 Android (Chrome)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("ios")}
                className={`flex-1 py-1.5 rounded-lg transition text-center cursor-pointer ${
                  activeTab === "ios"
                    ? "bg-[#854D0E] text-white shadow-xs"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                🍎 iPhone / iPad
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("pc")}
                className={`flex-1 py-1.5 rounded-lg transition text-center cursor-pointer ${
                  activeTab === "pc"
                    ? "bg-[#854D0E] text-white shadow-xs"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                💻 Laptop / PC
              </button>
            </div>

            {/* Tab A: Android */}
            {activeTab === "android" && (
              <div className="space-y-2.5 text-xs">
                <div className="bg-amber-50/80 p-3.5 rounded-2xl border border-amber-200/80 text-amber-950">
                  <p className="font-bold mb-1.5 text-sm">A. Untuk Pengguna Android (Chrome):</p>
                  <ol className="list-decimal list-inside space-y-1.5 text-[11px] sm:text-xs font-medium">
                    <li>Buka link web Anda di <strong>Google Chrome HP</strong>.</li>
                    <li>
                      Akan muncul banner di bawah bertuliskan <strong>"Pasang Aplikasi Tokyo Neko (WebAPK)"</strong> &rarr; Klik tombol <strong>"Install"</strong>.
                    </li>
                    <li>
                      <em>(Atau ketuk titik tiga <strong>(⋮)</strong> di pojok kanan atas Chrome &rarr; Pilih <strong>"Instal aplikasi"</strong> / <strong>"Tambahkan ke Layar Utama"</strong>).</em>
                    </li>
                    <li>
                      Sistem Android akan memproses dan memasang ikon aplikasi Tokyo Neko di layar utama & daftar aplikasi HP Anda.
                    </li>
                  </ol>
                </div>
                <p className="text-[11px] text-stone-600 italic">
                  ✨ Buka aplikasinya: tampilannya bersih tanpa bar browser, cepat, dan terasa seperti aplikasi Android asli!
                </p>
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="w-full py-2.5 rounded-xl bg-[#854D0E] hover:bg-[#713F12] text-white font-bold text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Download className="w-4 h-4" />
                  <span>Coba Munculkan Dialog Install Sekarang</span>
                </button>
              </div>
            )}

            {/* Tab B: iOS Safari */}
            {activeTab === "ios" && (
              <div className="space-y-2.5 text-xs">
                <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200 text-stone-800">
                  <p className="font-bold mb-1.5 text-sm">B. Untuk Pengguna iPhone / iPad (Safari):</p>
                  <ol className="list-decimal list-inside space-y-2 text-[11px] sm:text-xs font-medium">
                    <li>Buka link web Anda di <strong>Safari</strong>.</li>
                    <li>
                      Ketuk tombol <strong>Bagikan (Share) 📤</strong> di bagian bawah layar.
                    </li>
                    <li>
                      Gulir ke bawah dan pilih <strong>"Tambahkan ke Layar Utama" (Add to Home Screen) ➕</strong>.
                    </li>
                    <li>
                      Ketuk <strong>Tambah</strong>. Ikon Tokyo Neko akan langsung muncul di beranda iOS Anda.
                    </li>
                  </ol>
                </div>
              </div>
            )}

            {/* Tab C: PC / Laptop */}
            {activeTab === "pc" && (
              <div className="space-y-2.5 text-xs">
                <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200 text-stone-800">
                  <p className="font-bold mb-1.5 text-sm">C. Untuk Laptop / PC (Chrome / Edge):</p>
                  <ol className="list-decimal list-inside space-y-2 text-[11px] sm:text-xs font-medium">
                    <li>Buka web di browser Google Chrome atau Microsoft Edge.</li>
                    <li>
                      Di ujung kanan bilah alamat URL akan muncul ikon komputer kecil dengan tanda panah bawah <strong>"Install app"</strong> atau simbol <strong>(+)</strong>.
                    </li>
                    <li>
                      Klik untuk menginstalnya sebagai aplikasi desktop tersendiri di Windows/Mac.
                    </li>
                  </ol>
                </div>
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="w-full py-2.5 rounded-xl bg-[#854D0E] hover:bg-[#713F12] text-white font-bold text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Monitor className="w-4 h-4" />
                  <span>Install di Desktop / Laptop</span>
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowGuideModal(false)}
              className="w-full py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs transition cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </>
  );
};

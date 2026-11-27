"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Lock, KeyRound, Delete, AlertCircle, X, Sparkles, Mail, CheckCircle2, ArrowLeft, ExternalLink } from "lucide-react";
import { PinSecurityService } from "@/lib/pinSecurity";
import { CatAnimation } from "./cat-prototype/CatAnimations";

interface PinLockModalProps {
  isChangeMode?: boolean;
  onCloseChangeMode?: () => void;
  onUnlocked?: () => void;
}

export const PinLockModal: React.FC<PinLockModalProps> = ({
  isChangeMode = false,
  onCloseChangeMode,
  onUnlocked,
}) => {
  const [isLocked, setIsLocked] = useState(true);
  const [isConfigured, setIsConfigured] = useState(false);
  const [mode, setMode] = useState<
    "setup" | "confirm" | "verify" | "change_old" | "change_new" | "forgot_email" | "forgot_otp"
  >("verify");

  const [enteredPin, setEnteredPin] = useState("");
  const [tempFirstPin, setTempFirstPin] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);

  // Email pemulihan
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  // Inisialisasi status PIN & sinkronisasi dengan Firebase
  useEffect(() => {
    if (typeof window === "undefined") return;

    PinSecurityService.initSync(() => {
      const hasPin = PinSecurityService.isPinConfigured();
      setIsConfigured(hasPin);
    });

    const hasPin = PinSecurityService.isPinConfigured();
    setIsConfigured(hasPin);

    // Ambil email pemulihan terdaftar
    PinSecurityService.getRecoveryEmail().then((email) => {
      if (email) setRecoveryEmail(email);
    });

    if (isChangeMode) {
      setMode("change_old");
      setIsLocked(true);
      setEnteredPin("");
      setErrorMsg(null);
      setSuccessMsg(null);
    } else if (hasPin) {
      setMode("verify");
      if (PinSecurityService.isSessionUnlocked()) {
        setIsLocked(false);
      } else {
        setIsLocked(true);
      }
    } else {
      setMode("setup");
      setIsLocked(true);
    }
  }, [isChangeMode]);

  // Listener Auto-Lock saat tab berganti atau aplikasi diminimize ke background
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        PinSecurityService.lockSession();
      } else if (document.visibilityState === "visible") {
        if (!PinSecurityService.isSessionUnlocked()) {
          setIsLocked(true);
          setEnteredPin("");
          setErrorMsg(null);
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  const handleKeyPress = useCallback((digit: string) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setEnteredPin((prev) => {
      if (prev.length >= 6) return prev;
      return prev + digit;
    });
  }, []);

  const handleDelete = useCallback(() => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setEnteredPin((prev) => prev.slice(0, -1));
  }, []);

  const handleClear = useCallback(() => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setEnteredPin("");
  }, []);

  // Evaluasi ketika sudah 6 digit terisi
  useEffect(() => {
    if (enteredPin.length !== 6) return;

    const processPin = async () => {
      if (mode === "setup") {
        setTempFirstPin(enteredPin);
        setEnteredPin("");
        setMode("confirm");
      } else if (mode === "confirm") {
        if (enteredPin === tempFirstPin) {
          await PinSecurityService.setupNewPin(enteredPin);
          setIsConfigured(true);
          setIsLocked(false);
          setEnteredPin("");
          setTempFirstPin("");
          onUnlocked?.();
        } else {
          setErrorMsg("Konfirmasi PIN tidak cocok. Silakan ulangi.");
          triggerShake();
          setEnteredPin("");
          setTempFirstPin("");
          setMode("setup");
        }
      } else if (mode === "verify") {
        const valid = await PinSecurityService.verifyPin(enteredPin);
        if (valid) {
          setIsLocked(false);
          setEnteredPin("");
          onUnlocked?.();
        } else {
          const configured = PinSecurityService.isPinConfigured();
          if (!configured) {
            setErrorMsg("Belum ada PIN terdaftar. Ketuk 'Buat PIN Baru' di bawah.");
          } else {
            setErrorMsg("PIN salah. Silakan coba lagi.");
          }
          triggerShake();
          setEnteredPin("");
        }
      } else if (mode === "forgot_otp") {
        // Verifikasi kode OTP pemulihan email
        const res = await PinSecurityService.verifyEmailOtp(enteredPin);
        if (res.success) {
          setSuccessMsg(res.message);
          setMode("setup");
          setEnteredPin("");
        } else {
          setErrorMsg(res.message);
          triggerShake();
          setEnteredPin("");
        }
      } else if (mode === "change_old") {
        const valid = await PinSecurityService.verifyPin(enteredPin);
        if (valid) {
          setTempFirstPin(enteredPin);
          setEnteredPin("");
          setMode("change_new");
        } else {
          setErrorMsg("PIN lama Anda salah.");
          triggerShake();
          setEnteredPin("");
        }
      } else if (mode === "change_new") {
        const result = await PinSecurityService.changePin(tempFirstPin, enteredPin);
        if (result.success) {
          setIsLocked(false);
          setEnteredPin("");
          setTempFirstPin("");
          onCloseChangeMode?.();
          onUnlocked?.();
        } else {
          setErrorMsg(result.message);
          triggerShake();
          setEnteredPin("");
        }
      }
    };

    processPin();
  }, [enteredPin, mode, tempFirstPin, onCloseChangeMode, onUnlocked]);

  // Listener keyboard fisik (numpad komputer)
  useEffect(() => {
    if (!isLocked || mode === "forgot_email") return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key)) {
        handleKeyPress(e.key);
      } else if (e.key === "Backspace") {
        handleDelete();
      } else if (e.key === "Escape" && isChangeMode) {
        if (PinSecurityService.isSessionUnlocked()) {
          setIsLocked(false);
        }
        onCloseChangeMode?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isLocked, mode, handleKeyPress, handleDelete, isChangeMode, onCloseChangeMode]);

  // Handler saat meminta reset via email
  const handleRequestEmailReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryEmail) {
      setErrorMsg("Masukkan alamat email pemulihan.");
      return;
    }

    setIsSendingEmail(true);
    setErrorMsg(null);

    const res = await PinSecurityService.requestEmailReset(recoveryEmail);
    setIsSendingEmail(false);

    if (res.success) {
      setGeneratedOtp(res.otp || "");
      setMode("forgot_otp");
      setEnteredPin("");
      setSuccessMsg(`Kode 6-digit telah dibuat untuk ${recoveryEmail}. Masukkan kode untuk mereset PIN.`);

      // Buka email client (mailto) jika diizinkan browser
      if (typeof window !== "undefined") {
        const subject = encodeURIComponent("[Tokyo Neko] Kode Verifikasi Reset PIN");
        const body = encodeURIComponent(
          `Halo,\n\nKode verifikasi reset PIN Tokyo Neko Anda adalah: ${res.otp}\n\nKode ini berlaku selama 15 menit. Masukkan kode ini pada aplikasi untuk membuat PIN baru.\n\nSalam,\nTokyo Neko FinPlan`
        );
        window.open(`mailto:${recoveryEmail}?subject=${subject}&body=${body}`, "_blank");
      }
    } else {
      setErrorMsg(res.message);
      triggerShake();
    }
  };

  if (!isLocked) return null;

  const getTitle = () => {
    switch (mode) {
      case "forgot_email":
        return "Pemulihan PIN via Email";
      case "forgot_otp":
        return "Masukkan Kode Email";
      case "setup":
        return "Buat PIN Keamanan Baru";
      case "confirm":
        return "Konfirmasi Ulang PIN Anda";
      case "change_old":
        return "Masukkan PIN Lama Anda";
      case "change_new":
        return "Masukkan 6-Digit PIN Baru";
      case "verify":
      default:
        return "Masukkan PIN Keamanan";
    }
  };

  const getSubtitle = () => {
    switch (mode) {
      case "forgot_email":
        return "Ketik email pemulihan terdaftar untuk menerima kode verifikasi reset PIN.";
      case "forgot_otp":
        return `Kode verifikasi 6 digit telah dikirim ke ${recoveryEmail}.`;
      case "setup":
        return "Tentukan 6 digit PIN baru untuk mengamankan data Anda.";
      case "confirm":
        return "Ketik kembali 6 digit angka yang sama persis.";
      case "change_old":
        return "Verifikasi identitas Anda dengan PIN saat ini.";
      case "change_new":
        return "Tentukan 6 digit nomor PIN baru yang mudah Anda ingat.";
      case "verify":
      default:
        return "Ketik 6 digit PIN yang sudah Anda daftarkan untuk masuk.";
    }
  };

  return (
    <div className="fixed inset-0 z-100 bg-[#FAF7F2]/95 backdrop-blur-md flex flex-col items-center justify-center p-4 select-none animate-fade-in text-stone-900">
      {/* Tombol Tutup jika dalam mode Ganti PIN */}
      {isChangeMode && (
        <button
          onClick={() => {
            if (PinSecurityService.isSessionUnlocked()) {
              setIsLocked(false);
            }
            onCloseChangeMode?.();
          }}
          className="absolute top-5 right-5 p-2 rounded-full text-stone-400 hover:text-stone-700 bg-white/80 border border-[#E8E2D8] transition cursor-pointer"
          title="Batal"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      <div className={`w-full max-w-xs flex flex-col items-center text-center space-y-4 sm:space-y-5 ${isShaking ? "animate-shake" : ""}`}>
        {/* Ikon Neko Mascot / Kunci / Email */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-white border border-[#E8E2D8] p-2 shadow-md flex items-center justify-center relative">
          <CatAnimation variant="maneki" className="w-full h-full" />
          <div className="absolute -bottom-1 -right-1 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#854D0E] text-white flex items-center justify-center shadow-xs border-2 border-white">
            {mode === "forgot_email" ? <Mail className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
          </div>
        </div>

        {/* Teks Judul */}
        <div className="space-y-1">
          <h2 className="text-lg sm:text-xl font-black text-stone-900 tracking-tight leading-tight">
            {getTitle()}
          </h2>
          <p className="text-xs text-stone-500 max-w-xs leading-relaxed">
            {getSubtitle()}
          </p>
        </div>

        {/* Notifikasi Sukses */}
        {successMsg && (
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl animate-fade-in max-w-xs text-left">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Pesan Kesalahan */}
        {errorMsg && (
          <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-xl animate-fade-in max-w-xs text-left">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAMPILAN KHUSUS FORM EMAIL (FORGOT EMAIL) */}
        {/* ============================================================== */}
        {mode === "forgot_email" ? (
          <form onSubmit={handleRequestEmailReset} className="w-full space-y-3 pt-1">
            <div className="space-y-1 text-left">
              <label className="text-[11px] font-bold text-stone-600 flex items-center gap-1">
                <Mail className="w-3 h-3 text-[#854D0E]" />
                Alamat Email Pemulihan:
              </label>
              <input
                type="email"
                required
                value={recoveryEmail}
                onChange={(e) => setRecoveryEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E8E2D8] text-xs font-semibold text-stone-800 outline-none focus:border-[#854D0E] shadow-2xs transition"
              />
            </div>

            <button
              type="submit"
              disabled={isSendingEmail}
              className="w-full py-2.5 px-4 rounded-xl bg-[#854D0E] hover:bg-[#713F12] text-white font-bold text-xs shadow-xs active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              <Mail className="w-4 h-4" />
              <span>{isSendingEmail ? "Mengirim..." : "Kirim Kode Reset ke Email"}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMode("verify");
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className="w-full py-1.5 text-xs font-bold text-stone-500 hover:text-stone-800 transition cursor-pointer flex items-center justify-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali ke Layar PIN</span>
            </button>
          </form>
        ) : (
          /* ============================================================== */
          /* TAMPILAN STANDAR NUMPAD (VERIFY, SETUP, CONFIRM, FORGOT_OTP)   */
          /* ============================================================== */
          <>
            {/* Indikator 6 Digit Bulat */}
            <div className="flex items-center gap-3 py-1">
              {[0, 1, 2, 3, 4, 5].map((index) => {
                const isFilled = index < enteredPin.length;
                return (
                  <div
                    key={index}
                    className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full transition-all duration-200 border ${
                      isFilled
                        ? "bg-[#854D0E] border-[#854D0E] scale-110 shadow-xs"
                        : "bg-white border-[#D6CEC2]"
                    }`}
                  />
                );
              })}
            </div>

            {/* Numpad Sentuh Mobile Ramah */}
            <div className="grid grid-cols-3 gap-2.5 sm:gap-3 w-full max-w-[260px] pt-1">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((digit) => (
                <button
                  key={digit}
                  type="button"
                  onClick={() => handleKeyPress(digit)}
                  className="h-13 sm:h-14 rounded-2xl bg-white hover:bg-stone-100/80 active:bg-amber-100/60 active:scale-95 border border-[#E8E2D8] text-xl font-bold text-stone-800 shadow-xs transition-all flex items-center justify-center cursor-pointer"
                >
                  {digit}
                </button>
              ))}
              <button
                type="button"
                onClick={handleClear}
                className="h-13 sm:h-14 rounded-2xl bg-[#FAF7F2] hover:bg-stone-200/50 active:scale-95 text-xs font-bold text-stone-500 transition-all flex items-center justify-center cursor-pointer"
              >
                Hapus
              </button>
              <button
                type="button"
                onClick={() => handleKeyPress("0")}
                className="h-13 sm:h-14 rounded-2xl bg-white hover:bg-stone-100/80 active:bg-amber-100/60 active:scale-95 border border-[#E8E2D8] text-xl font-bold text-stone-800 shadow-xs transition-all flex items-center justify-center cursor-pointer"
              >
                0
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="h-13 sm:h-14 rounded-2xl bg-[#FAF7F2] hover:bg-stone-200/50 active:scale-95 text-stone-600 transition-all flex items-center justify-center cursor-pointer"
                title="Backspace"
              >
                <Delete className="w-5 h-5" />
              </button>
            </div>

            {/* Tombol Bantuan Tambahan di Bawah Numpad */}
            {!isChangeMode && mode === "verify" && (
              <div className="flex flex-col items-center gap-1.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setMode("forgot_email");
                    setEnteredPin("");
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  className="text-xs font-bold text-stone-500 hover:text-stone-800 transition cursor-pointer flex items-center gap-1"
                >
                  <Mail className="w-3.5 h-3.5 text-stone-400" />
                  <span>Lupa PIN? Reset via Email</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode("setup");
                    setEnteredPin("");
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  className="text-[11px] font-medium text-stone-400 hover:text-[#854D0E] transition cursor-pointer"
                >
                  Belum punya PIN? <span className="underline font-bold text-[#854D0E]">Buat PIN Baru</span>
                </button>
              </div>
            )}

            {!isChangeMode && mode === "forgot_otp" && (
              <div className="flex flex-col items-center gap-1.5 pt-2">
                {generatedOtp && (
                  <button
                    type="button"
                    onClick={() => {
                      const subject = encodeURIComponent("[Tokyo Neko] Kode Verifikasi Reset PIN");
                      const body = encodeURIComponent(
                        `Halo,\n\nKode verifikasi reset PIN Tokyo Neko Anda adalah: ${generatedOtp}\n\nMasukkan kode ini pada aplikasi untuk membuat PIN baru.\n\nSalam,\nTokyo Neko FinPlan`
                      );
                      window.open(`mailto:${recoveryEmail}?subject=${subject}&body=${body}`, "_blank");
                    }}
                    className="text-xs font-bold text-[#854D0E] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Buka Aplikasi Email Anda</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setMode("forgot_email");
                    setEnteredPin("");
                    setErrorMsg(null);
                  }}
                  className="text-[11px] font-medium text-stone-400 hover:text-stone-700 transition cursor-pointer"
                >
                  ← Ganti / Kirim Ulang Email
                </button>
              </div>
            )}

            {!isChangeMode && mode === "setup" && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setMode("verify");
                    setEnteredPin("");
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  className="text-xs font-bold text-stone-500 hover:text-[#854D0E] transition cursor-pointer"
                >
                  Sudah punya PIN? <span className="underline font-bold text-[#854D0E]">Masuk di sini →</span>
                </button>
              </div>
            )}
          </>
        )}

        {/* Footer Brand */}
        <div className="pt-1">
          <p className="text-[10px] text-stone-400 font-mono tracking-widest uppercase">
            TOKYO NEKO • PRIVASI TERJAGA 🐾
          </p>
        </div>
      </div>
    </div>
  );
};

"use client";

import React, { useState, useEffect } from "react";
import { IncomeItem, ExpenseItem } from "@/types/finance";
import { NotificationService } from "@/lib/notifications";
import { Bell, BellRing, PlusCircle, X, Sparkles } from "lucide-react";

interface DailyReminderBannerProps {
  incomes: IncomeItem[];
  expenses: ExpenseItem[];
  onOpenQuickAdd: (type?: "income" | "expense" | "savings") => void;
}

export const DailyReminderBanner: React.FC<DailyReminderBannerProps> = ({
  incomes,
  expenses,
  onOpenQuickAdd,
}) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isNotifActive, setIsNotifActive] = useState(false);
  const [justEnabledNotif, setJustEnabledNotif] = useState(false);

  const hasRecordedToday = NotificationService.hasRecordedToday(incomes, expenses);

  useEffect(() => {
    if (NotificationService.getPermission() === "granted") {
      setIsNotifActive(true);
    }
  }, []);

  const handleEnableNotification = async () => {
    const granted = await NotificationService.requestPermission();
    if (granted) {
      setIsNotifActive(true);
      setJustEnabledNotif(true);
      NotificationService.sendNotification(
        "Tokyo Neko • Pengingat Aktif! 🐾",
        "Meow! Notifikasi pengingat harian telah aktif. Kami akan mengingatkanmu mencatat keuangan tiap malam!"
      );
      setTimeout(() => setJustEnabledNotif(false), 4000);
    }
  };

  // If already recorded today or dismissed, do not show
  if (hasRecordedToday || isDismissed) return null;

  return (
    <div className="rounded-2xl bg-gradient-to-r from-amber-50/90 via-[#FAF7F2] to-amber-100/60 border border-amber-200/80 p-4 sm:p-4.5 shadow-2xs relative overflow-hidden transition-all animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        {/* Left message with cute icon */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-300 text-amber-900 flex items-center justify-center shrink-0 font-bold text-base shadow-2xs">
            🐾
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold font-mono text-amber-950">
                Pengingat Harian Tokyo Neko
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-200/60 text-amber-900 font-mono font-semibold">
                Hari ini
              </span>
            </div>
            <p className="text-xs text-stone-600 leading-snug">
              Meow! Hari ini belum ada catatan transaksi masuk atau keluar. Mau catat sekarang agar keuangan tetap rapi?
            </p>
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0 pt-1 sm:pt-0">
          {!isNotifActive ? (
            <button
              onClick={handleEnableNotification}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-stone-50 border border-amber-300 text-amber-900 text-xs font-bold font-mono flex items-center gap-1.5 active:scale-95 transition-all shadow-2xs"
              title="Aktifkan notifikasi pengingat harian"
            >
              <Bell className="w-3.5 h-3.5 text-amber-700" />
              <span>Aktifkan Notif</span>
            </button>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-100/70 text-emerald-800 text-[11px] font-mono font-bold border border-emerald-300/80">
              <BellRing className="w-3 h-3 text-emerald-700" />
              <span>Notif Aktif</span>
            </span>
          )}

          <button
            onClick={() => onOpenQuickAdd("expense")}
            className="px-3.5 py-1.5 rounded-xl bg-[#854D0E] hover:bg-[#713F12] text-white text-xs font-bold font-mono flex items-center gap-1.5 active:scale-95 transition-all shadow-xs"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>+ Catat Transaksi</span>
          </button>

          <button
            onClick={() => setIsDismissed(true)}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 transition-colors"
            title="Tutup pengingat untuk sesi ini"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {justEnabledNotif && (
        <div className="mt-2 text-[11px] font-mono text-emerald-700 flex items-center gap-1.5 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200 animate-fade-in">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Notifikasi aktif! Kucing akan mengingatkanmu mencatat keuangan secara berkala.</span>
        </div>
      )}
    </div>
  );
};

export default DailyReminderBanner;

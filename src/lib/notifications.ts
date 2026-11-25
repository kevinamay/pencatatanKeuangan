"use client";

import { IncomeItem, ExpenseItem } from "@/types/finance";

export const NotificationService = {
  // Check if browser supports notifications
  isSupported(): boolean {
    return typeof window !== "undefined" && "Notification" in window;
  },

  // Get current permission state
  getPermission(): NotificationPermission {
    if (!this.isSupported()) return "denied";
    return Notification.permission;
  },

  // Request user permission
  async requestPermission(): Promise<boolean> {
    if (!this.isSupported()) return false;
    try {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    } catch {
      return false;
    }
  },

  // Send an instant friendly local notification
  sendNotification(title: string, body: string) {
    if (!this.isSupported() || Notification.permission !== "granted") return;
    try {
      new Notification(title, {
        body,
        icon: "/icons/icon-192.png",
        badge: "/icons/icon-192.png",
      });
    } catch {
      // Fallback if ServiceWorkerRegistration is required
      if (navigator.serviceWorker) {
        navigator.serviceWorker.ready.then((reg) => {
          reg.showNotification(title, {
            body,
            icon: "/icons/icon-192.png",
          });
        }).catch(() => {});
      }
    }
  },

  // Check if any transaction has been recorded today
  hasRecordedToday(incomes: IncomeItem[], expenses: ExpenseItem[]): boolean {
    const todayStr = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const hasIncomeToday = incomes.some((i) => i.date === todayStr);
    const hasExpenseToday = expenses.some((e) => e.date === todayStr);
    return hasIncomeToday || hasExpenseToday;
  },
};

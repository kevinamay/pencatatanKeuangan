"use client";

import { rtdb } from "./firebase";
import { ref, set, get, onValue, remove } from "firebase/database";

/**
 * Layanan Keamanan PIN 6-Digit & Mode Privasi Saldo
 * - Sinkronisasi dua arah ke Firebase Realtime Database (/app_security/pin_hash)
 * - Hash SHA-256 tersimpan di localStorage & Firebase Cloud
 * - Auto-lock saat app blur atau visibilityState berubah ke hidden
 * - Toggle sembunyikan nominal saldo (Mode Mata Tertutup)
 */

const STORAGE_KEYS = {
  PIN_HASH: "tokyo_neko_pin_hash_v1",
  PIN_ENABLED: "tokyo_neko_pin_enabled_v1",
  HIDE_BALANCE: "tokyo_neko_hide_balance_v1",
};

/**
 * Hash PIN menggunakan Web Crypto API SHA-256 dengan salt
 */
async function hashPin(pin: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode("tokyo_neko_salt_" + pin);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export class PinSecurityService {
  private static sessionUnlocked = false;
  private static cachedFirebaseHash: string | null = null;
  private static isInitialized = false;

  /**
   * Menginisialisasi sinkronisasi status PIN dengan Firebase Realtime Database
   */
  public static initSync(onUpdate?: () => void): void {
    if (typeof window === "undefined" || this.isInitialized) return;
    this.isInitialized = true;

    try {
      const pinRef = ref(rtdb, "app_security/pin_hash");
      onValue(
        pinRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const cloudHash = snapshot.val();
            if (typeof cloudHash === "string" && cloudHash.length > 0) {
              this.cachedFirebaseHash = cloudHash;
              localStorage.setItem(STORAGE_KEYS.PIN_HASH, cloudHash);
              localStorage.setItem(STORAGE_KEYS.PIN_ENABLED, "true");
              onUpdate?.();
            }
          }
        },
        (err) => {
          console.warn("RTDB [app_security] error:", err.message);
        }
      );
    } catch (e) {
      console.warn("Failed to init pin sync:", e);
    }
  }

  /**
   * Mengecek apakah PIN sudah dibuat sebelumnya (baik di LocalStorage maupun Firebase)
   */
  public static isPinConfigured(): boolean {
    if (typeof window === "undefined") return false;
    return !!(this.cachedFirebaseHash || localStorage.getItem(STORAGE_KEYS.PIN_HASH));
  }

  /**
   * Mengecek apakah sesi saat ini sudah terbuka
   */
  public static isSessionUnlocked(): boolean {
    return this.sessionUnlocked;
  }

  /**
   * Membuka kunci sesi saat ini
   */
  public static unlockSession(): void {
    this.sessionUnlocked = true;
  }

  /**
   * Mengunci kembali sesi saat ini
   */
  public static lockSession(): void {
    this.sessionUnlocked = false;
  }

  /**
   * Mendaftarkan / membuat PIN baru pertama kali dan sinkron ke Firebase
   */
  public static async setupNewPin(pin: string): Promise<boolean> {
    if (pin.length !== 6 || !/^\d{6}$/.test(pin)) {
      return false;
    }
    const hash = await hashPin(pin);
    localStorage.setItem(STORAGE_KEYS.PIN_HASH, hash);
    localStorage.setItem(STORAGE_KEYS.PIN_ENABLED, "true");
    this.cachedFirebaseHash = hash;
    this.sessionUnlocked = true;

    try {
      await set(ref(rtdb, "app_security/pin_hash"), hash);
    } catch (e) {
      console.warn("Gagal simpan PIN ke Firebase:", e);
    }
    return true;
  }

  /**
   * Memverifikasi PIN input pengguna (cek lokal dan Firebase)
   */
  public static async verifyPin(pin: string): Promise<boolean> {
    if (typeof window === "undefined") return false;
    let storedHash = this.cachedFirebaseHash || localStorage.getItem(STORAGE_KEYS.PIN_HASH);

    // Jika belum ada di memori lokal, coba ambil sekali dari Firebase
    if (!storedHash) {
      try {
        const snap = await get(ref(rtdb, "app_security/pin_hash"));
        if (snap.exists()) {
          storedHash = snap.val();
          if (storedHash) {
            this.cachedFirebaseHash = storedHash;
            localStorage.setItem(STORAGE_KEYS.PIN_HASH, storedHash);
          }
        }
      } catch (e) {
        console.warn("Gagal get PIN dari Firebase:", e);
      }
    }

    if (!storedHash) return false;

    const inputHash = await hashPin(pin);
    const isValid = storedHash === inputHash;
    if (isValid) {
      this.sessionUnlocked = true;
    }
    return isValid;
  }

  /**
   * Mengganti PIN lama dengan PIN baru (update lokal dan Firebase)
   */
  public static async changePin(oldPin: string, newPin: string): Promise<{ success: boolean; message: string }> {
    const isOldValid = await this.verifyPin(oldPin);
    if (!isOldValid) {
      return { success: false, message: "PIN lama yang Anda masukkan salah." };
    }
    if (newPin.length !== 6 || !/^\d{6}$/.test(newPin)) {
      return { success: false, message: "PIN baru harus terdiri dari 6 digit angka." };
    }
    const newHash = await hashPin(newPin);
    localStorage.setItem(STORAGE_KEYS.PIN_HASH, newHash);
    this.cachedFirebaseHash = newHash;

    try {
      await set(ref(rtdb, "app_security/pin_hash"), newHash);
    } catch (e) {
      console.warn("Gagal update PIN di Firebase:", e);
    }

    return { success: true, message: "PIN keamanan berhasil diperbarui." };
  }

  /**
   * Mereset PIN keamanan (menghapus dari lokal dan Firebase)
   */
  public static async resetPin(): Promise<void> {
    localStorage.removeItem(STORAGE_KEYS.PIN_HASH);
    localStorage.removeItem(STORAGE_KEYS.PIN_ENABLED);
    this.cachedFirebaseHash = null;
    this.sessionUnlocked = false;

    try {
      await remove(ref(rtdb, "app_security/pin_hash"));
    } catch (e) {
      console.warn("Gagal reset PIN di Firebase:", e);
    }
  }

  /**
   * Mengambil status mode sembunyikan saldo
   */
  public static isBalanceHidden(): boolean {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(STORAGE_KEYS.HIDE_BALANCE) === "true";
  }

  /**
   * Menyimpan status mode sembunyikan saldo
   */
  public static setBalanceHidden(hidden: boolean): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEYS.HIDE_BALANCE, hidden ? "true" : "false");
  }
}

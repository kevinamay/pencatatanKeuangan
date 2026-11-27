"use client";

/**
 * Layanan Keamanan PIN 6-Digit & Mode Privasi Saldo
 * - Hash SHA-256 tersimpan di localStorage
 * - Auto-lock saat app blur atau visibilityState berubah ke hidden
 * - Toggle sembunyikan nominal saldo (Mode Mata Tertutup)
 */

const STORAGE_KEYS = {
  PIN_HASH: "tokyo_neko_pin_hash_v1",
  PIN_ENABLED: "tokyo_neko_pin_enabled_v1",
  HIDE_BALANCE: "tokyo_neko_hide_balance_v1",
};

/**
 * Hash PIN menggunakan Web Crypto API SHA-256
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

  /**
   * Mengecek apakah PIN sudah dibuat sebelumnya
   */
  public static isPinConfigured(): boolean {
    if (typeof window === "undefined") return false;
    return !!localStorage.getItem(STORAGE_KEYS.PIN_HASH);
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
   * Mendaftarkan / membuat PIN baru pertama kali
   */
  public static async setupNewPin(pin: string): Promise<boolean> {
    if (pin.length !== 6 || !/^\d{6}$/.test(pin)) {
      return false;
    }
    const hash = await hashPin(pin);
    localStorage.setItem(STORAGE_KEYS.PIN_HASH, hash);
    localStorage.setItem(STORAGE_KEYS.PIN_ENABLED, "true");
    this.sessionUnlocked = true;
    return true;
  }

  /**
   * Memverifikasi PIN input pengguna
   */
  public static async verifyPin(pin: string): Promise<boolean> {
    if (typeof window === "undefined") return false;
    const storedHash = localStorage.getItem(STORAGE_KEYS.PIN_HASH);
    if (!storedHash) return false;

    const inputHash = await hashPin(pin);
    const isValid = storedHash === inputHash;
    if (isValid) {
      this.sessionUnlocked = true;
    }
    return isValid;
  }

  /**
   * Mengganti PIN lama dengan PIN baru
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
    return { success: true, message: "PIN keamanan berhasil diperbarui." };
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

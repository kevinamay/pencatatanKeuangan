import { rtdb } from "./firebase";
import { ref, set, get, onValue, remove } from "firebase/database";

/**
 * Layanan Keamanan PIN 6-Digit, Pemulihan Email & Mode Privasi Saldo
 * - Sinkronisasi dua arah ke Firebase Realtime Database (/app_security/pin_hash)
 * - Pemulihan PIN melalui verifikasi Email (/app_security/recovery_email & /app_security/reset_request)
 * - Hash SHA-256 tersimpan di localStorage & Firebase Cloud
 * - Auto-lock saat app blur atau visibilityState berubah ke hidden
 * - Toggle sembunyikan nominal saldo (Mode Mata Tertutup)
 */

const STORAGE_KEYS = {
  PIN_HASH: "tokyo_neko_pin_hash_v1",
  PIN_ENABLED: "tokyo_neko_pin_enabled_v1",
  HIDE_BALANCE: "tokyo_neko_hide_balance_v1",
  RECOVERY_EMAIL: "tokyo_neko_recovery_email_v1",
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
  private static cachedRecoveryEmail: string | null = null;
  private static isInitialized = false;

  /**
   * Menginisialisasi sinkronisasi status PIN & Email Pemulihan dengan Firebase Realtime Database
   */
  public static initSync(onUpdate?: () => void): void {
    if (typeof window === "undefined" || this.isInitialized) return;
    this.isInitialized = true;

    try {
      // 1. Listener PIN Hash
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
          console.warn("RTDB [app_security/pin_hash] error:", err.message);
        }
      );

      // 2. Listener Recovery Email
      const emailRef = ref(rtdb, "app_security/recovery_email");
      onValue(
        emailRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const email = snapshot.val();
            if (typeof email === "string" && email.length > 0) {
              this.cachedRecoveryEmail = email;
              localStorage.setItem(STORAGE_KEYS.RECOVERY_EMAIL, email);
            }
          }
        },
        (err) => {
          console.warn("RTDB [app_security/recovery_email] error:", err.message);
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
   * Mengecek apakah PIN sudah ada di Cloud (Firebase RTDB) atau LocalStorage secara asynchronous
   * Memastikan tidak ada race condition saat aplikasi dibuka di device baru
   */
  public static async checkCloudPin(): Promise<boolean> {
    if (this.cachedFirebaseHash) return true;
    if (typeof window !== "undefined") {
      const local = localStorage.getItem(STORAGE_KEYS.PIN_HASH);
      if (local && local.length > 0) {
        this.cachedFirebaseHash = local;
        return true;
      }
    }
    try {
      const snap = await get(ref(rtdb, "app_security/pin_hash"));
      if (snap.exists()) {
        const val = snap.val();
        if (typeof val === "string" && val.length > 0) {
          this.cachedFirebaseHash = val;
          if (typeof window !== "undefined") {
            localStorage.setItem(STORAGE_KEYS.PIN_HASH, val);
            localStorage.setItem(STORAGE_KEYS.PIN_ENABLED, "true");
          }
          return true;
        }
      }
    } catch (e) {
      console.warn("Gagal cek cloud PIN:", e);
    }
    return false;
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
  public static async setupNewPin(pin: string, recoveryEmail?: string): Promise<boolean> {
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
      if (recoveryEmail && recoveryEmail.includes("@")) {
        await this.setRecoveryEmail(recoveryEmail);
      }
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

  // --- PEMULIHAN VIA EMAIL (RECOVERY EMAIL & OTP) ---

  /**
   * Mengambil alamat email pemulihan yang tersimpan
   */
  public static async getRecoveryEmail(): Promise<string | null> {
    if (typeof window !== "undefined") {
      const local = localStorage.getItem(STORAGE_KEYS.RECOVERY_EMAIL);
      if (local && local.includes("@")) return local;
    }
    if (this.cachedRecoveryEmail && this.cachedRecoveryEmail.includes("@")) {
      return this.cachedRecoveryEmail;
    }

    try {
      const snap = await get(ref(rtdb, "app_security/recovery_email"));
      if (snap.exists() && typeof snap.val() === "string" && snap.val().includes("@")) {
        this.cachedRecoveryEmail = snap.val();
        if (typeof window !== "undefined") {
          localStorage.setItem(STORAGE_KEYS.RECOVERY_EMAIL, snap.val());
        }
        return snap.val();
      }
    } catch (e) {
      console.warn("Gagal get recovery email dari Firebase:", e);
    }

    return null;
  }

  /**
   * Mendaftarkan / memperbarui alamat email pemulihan
   */
  public static async setRecoveryEmail(email: string): Promise<void> {
    const cleanEmail = email.trim().toLowerCase();
    this.cachedRecoveryEmail = cleanEmail;
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.RECOVERY_EMAIL, cleanEmail);
    }
    try {
      await set(ref(rtdb, "app_security/recovery_email"), cleanEmail);
    } catch (e) {
      console.warn("Gagal simpan recovery email ke Firebase:", e);
    }
  }

  /**
   * Meminta kode reset PIN via email (Verifikasi kecocokan email & buat kode OTP 6-digit)
   */
  public static async requestEmailReset(inputEmail: string): Promise<{ success: boolean; message: string; otp?: string }> {
    const cleanInput = inputEmail.trim().toLowerCase();

    // Validasi format email
    if (!cleanInput || !cleanInput.includes("@") || !cleanInput.includes(".")) {
      return { success: false, message: "Format alamat email tidak valid." };
    }

    const registeredEmail = await this.getRecoveryEmail();

    // Cek apakah email cocok dengan email pemulihan terdaftar
    if (registeredEmail && cleanInput !== registeredEmail.toLowerCase()) {
      const parts = registeredEmail.split("@");
      const masked = (parts[0] ? parts[0].slice(0, 3) : "") + "***@" + (parts[1] || "***");
      return {
        success: false,
        message: `Email tidak cocok dengan email pemulihan yang terdaftar (${masked}).`,
      };
    }

    // Jika belum pernah ada email terdaftar, simpan email ini sebagai email pemulihan
    if (!registeredEmail) {
      await this.setRecoveryEmail(cleanInput);
    }

    // Buat kode verifikasi OTP 6 digit acak
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 15 * 60 * 1000; // berlaku 15 menit

    try {
      await set(ref(rtdb, "app_security/reset_request"), {
        otp,
        email: cleanInput,
        expiresAt,
        createdAt: Date.now(),
      });
    } catch (e) {
      console.warn("Gagal simpan reset_request ke Firebase:", e);
    }

    return {
      success: true,
      message: `Kode pemulihan telah dibuat untuk ${cleanInput}.`,
      otp,
    };
  }

  /**
   * Memverifikasi kode OTP email untuk membuka izin reset PIN
   */
  public static async verifyEmailOtp(inputOtp: string): Promise<{ success: boolean; message: string }> {
    try {
      const snap = await get(ref(rtdb, "app_security/reset_request"));
      if (!snap.exists()) {
        return { success: false, message: "Tidak ada permintaan reset aktif. Silakan ajukan ulang." };
      }

      const data = snap.val();
      if (!data || !data.otp) {
        return { success: false, message: "Data permintaan reset tidak valid." };
      }

      if (Date.now() > data.expiresAt) {
        return { success: false, message: "Kode pemulihan telah kedaluwarsa. Silakan ajukan ulang." };
      }

      if (inputOtp.trim() !== data.otp) {
        return { success: false, message: "Kode verifikasi salah. Periksa kembali email Anda." };
      }

      // Hapus permintaan reset dan hapus PIN lama agar user bisa buat PIN baru
      await remove(ref(rtdb, "app_security/reset_request"));
      await this.resetPin();

      return {
        success: true,
        message: "Verifikasi email berhasil! Silakan buat PIN baru Anda.",
      };
    } catch (e: any) {
      return { success: false, message: e.message || "Gagal memverifikasi kode pemulihan." };
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

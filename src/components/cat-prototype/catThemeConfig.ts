import { CatAnimationVariant } from "./CatAnimations";

export interface CatPageAnimations {
  dashboard: CatAnimationVariant;
  transactions: CatAnimationVariant;
  savings: CatAnimationVariant;
  report: CatAnimationVariant;
  modal: CatAnimationVariant;
}

export interface CatVariantConfig {
  id: number;
  name: string;
  subtitle: string;
  badge: string;
  pageAnimations: CatPageAnimations;
  accent: string;
  accentHover: string;
  bgPage: string;
  cardBg: string;
  cardBorder: string;
  textColor: string;
  mutedText: string;
  isDark: boolean;
  navTitle: string;
  navSubtitle: string;
  heroTagline: string;
  mascotQuotes: string[];
}

export const CAT_THEME_CONFIGS: Record<number, CatVariantConfig> = {
  1: {
    id: 1,
    name: "Neko-Bank Executive",
    subtitle: "Refined Japanese Red & Gold Wealth",
    badge: "Executive",
    pageAnimations: {
      dashboard: "maneki",      // Lucky gold coin & waving paw
      transactions: "hacker",    // Cyber black cat auditing records on laptop
      savings: "moon",          // Cat on crescent moon fishing for stars/wealth
      report: "tuxedo",         // Formal gentleman cat with bow tie auditor
      modal: "laughing",        // Joyful chubby rolling cat
    },
    accent: "#8B0000",
    accentHover: "#700000",
    bgPage: "#FFFBF9",
    cardBg: "#FFFFFF",
    cardBorder: "#FFD9D9",
    textColor: "#1C0606",
    mutedText: "#8C4A4A",
    isDark: false,
    navTitle: "NEKO.BANK",
    navSubtitle: "Executive Wealth Edition",
    heroTagline: "Sistem Rekonsiliasi Keuangan & Arus Kas Pribadi",
    mascotQuotes: [
      "Purr~ Arus kas bulan ini tercatat rapi majikan!",
      "Maneki Neko melambai: rezeki lancar dan berkah!",
      "Meow! Sisa gaji aman, pos tabungan sudah terisi.",
      "Kuitansi dan pencatatan sinkron 100%!",
    ],
  },
  2: {
    id: 2,
    name: "Tokyo Minimalist Paper",
    subtitle: "Wabi-Sabi Warm Editorial Café",
    badge: "Wabi-Sabi",
    pageAnimations: {
      dashboard: "sleeping",    // Cozy curled up sleeping cat with Zzz
      transactions: "peeking",  // Curious black cat peeking over paper receipt
      savings: "calico",        // Soft mochi calico cat with antennae
      report: "tuxedo",         // Dapper cat signing audit with quill
      modal: "maneki",          // Gentle lucky paw
    },
    accent: "#854D0E",
    accentHover: "#713F12",
    bgPage: "#FAF7F2",
    cardBg: "#FFFFFF",
    cardBorder: "#E8E2D8",
    textColor: "#292524",
    mutedText: "#78716C",
    isDark: false,
    navTitle: "TOKYO.NEKO",
    navSubtitle: "Handcrafted Editorial FinPlan",
    heroTagline: "Pencatatan Keuangan Tenang, Terstruktur & Estetis",
    mascotQuotes: [
      "Zzz... Anggaranmu aman, tidur pun jadi nyenyak.",
      "Secangkir kopi hangat dan neraca kas yang seimbang.",
      "Meow~ Catat setiap pengeluaran kecil agar dompet tetap sehat.",
      "Wabi-sabi: Kesederhanaan dalam mengelola finansial.",
    ],
  },
  3: {
    id: 3,
    name: "Nordic Studio Pastel",
    subtitle: "Scandinavian Soft Peach & Sage Mint",
    badge: "Nordic",
    pageAnimations: {
      dashboard: "calico",      // Mochi calico floating with sparkles
      transactions: "laughing", // Chubby orange cat rolling in joy
      savings: "ufo",           // Flying saucer beaming up coins
      report: "peeking",        // Peeking cat eyes behind balance sheet
      modal: "sleeping",        // Cozy sleepy kitty
    },
    accent: "#EA580C",
    accentHover: "#C2410C",
    bgPage: "#FFF9F5",
    cardBg: "#FFFFFF",
    cardBorder: "#FED7AA",
    textColor: "#334155",
    mutedText: "#64748B",
    isDark: false,
    navTitle: "NORDIC.MEOW",
    navSubtitle: "Clean Studio Budgeting",
    heroTagline: "Desain Skandinavia yang Ramah, Ringan & Nyaman",
    mascotQuotes: [
      "Hore! Rekening tabunganmu makin montok dan bahagia!",
      "Meow~ Jangan lupa prioritaskan kebutuhan sebelum keinginan ya!",
      "UFO traktor siap mengumpulkan aset masa depanmu!",
      "Keuangan sehat, hati tenang, hidup ceria!",
    ],
  },
  4: {
    id: 4,
    name: "Neo-Brutalist Arcade Pop",
    subtitle: "Contemporary Retro 8-Bit FinTech",
    badge: "Arcade",
    pageAnimations: {
      dashboard: "pixel",       // 8-bit retro arcade cat
      transactions: "hacker",   // Retro terminal hacker cat
      savings: "moon",          // 8-bit moon star fishing
      report: "tuxedo",         // Pixel gentleman official stamp
      modal: "pixel",           // Pixel cat jump
    },
    accent: "#0F172A",
    accentHover: "#1E293B",
    bgPage: "#FEFCE8",
    cardBg: "#FFFFFF",
    cardBorder: "#0F172A",
    textColor: "#0F172A",
    mutedText: "#475569",
    isDark: false,
    navTitle: "PIXEL.NEKO",
    navSubtitle: "1994 Arcade RPG [Lv.99]",
    heroTagline: "Level-Up Kekayaanmu Tanpa Terjebak Defisit!",
    mascotQuotes: [
      "QUEST CLEAR! Seluruh transaksi berhasil direkonsiliasi.",
      "INSERT COIN: Tambah tabungan untuk dapat bonus EXP!",
      "8-bit Meow: Boss Defisit berhasil dikalahkan bulan ini!",
      "Combo 100% disiplin anggaran!",
    ],
  },
  5: {
    id: 5,
    name: "Midnight Kuro Onyx",
    subtitle: "Luxury Dark Executive & Amber Gold",
    badge: "Noir Onyx",
    pageAnimations: {
      dashboard: "peeking",     // Glowing amber cat eyes in obsidian dark
      transactions: "hacker",   // Neon cyber hacker cat
      savings: "ufo",           // Cosmic UFO saucer with green glow
      report: "tuxedo",         // Noir aristocat seal
      modal: "moon",            // Midnight starlight moon
    },
    accent: "#F59E0B",
    accentHover: "#D97706",
    bgPage: "#0A0E17",
    cardBg: "#121826",
    cardBorder: "#1E293B",
    textColor: "#F8FAFC",
    mutedText: "#94A3B8",
    isDark: true,
    navTitle: "KURO.ONYX",
    navSubtitle: "Private Night Wealth Club",
    heroTagline: "Manajemen Kekayaan Eksklusif Mode Gelap Berkelas",
    mascotQuotes: [
      "Mata kucing hitam mengawasi setiap pergerakan arus kasmu.",
      "Sistem privasi tinggi aktif. Seluruh saldo terlindungi rapi.",
      "Cahaya emas di malam hari: portofolio tetap bertumbuh.",
      "Stealth mode on: belanja hemat, aset melesat.",
    ],
  },
};

export function getCatThemeConfig(variantId: number): CatVariantConfig {
  return CAT_THEME_CONFIGS[variantId] || CAT_THEME_CONFIGS[1];
}

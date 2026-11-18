import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FinPlan Keuangan - Pencatatan Gaji, Pengeluaran, Tabungan & Pasar Uang",
  description: "Aplikasi manajemen keuangan pribadi, rekonsiliasi gaji, tabungan dan kalkulator portofolio reksadana pasar uang terintegrasi Firebase.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full light`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 antialiased">{children}</body>
    </html>
  );
}

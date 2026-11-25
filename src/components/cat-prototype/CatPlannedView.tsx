"use client";

import React, { useState } from "react";
import {
  Plus,
  ShoppingBag,
  CheckCircle2,
  Clock,
  Tag,
  AlertCircle,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronUp,
  Search,
  Sparkles,
  Wallet,
  Check,
} from "lucide-react";
import { PlannedItem, PlannedItemUrgency } from "@/types/finance";
import { FinanceStorage, formatRupiah, formatTanggalIndo } from "@/lib/storage";
import { getCatThemeConfig } from "./catThemeConfig";
import { InteractiveCatMascot } from "./InteractiveCatMascot";
import { PlannedItemModal } from "./PlannedItemModal";
import { ExecutePaymentModal } from "./ExecutePaymentModal";

interface CatPlannedViewProps {
  plannedItems: PlannedItem[];
  currentBalance: number;
  selectedMonth: string;
  variantId: number;
}

export const CatPlannedView: React.FC<CatPlannedViewProps> = ({
  plannedItems,
  currentBalance,
  selectedMonth,
  variantId,
}) => {
  const theme = getCatThemeConfig(variantId);

  // States
  const [filterUrgency, setFilterUrgency] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showPaidHistory, setShowPaidHistory] = useState(false);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PlannedItem | null>(null);
  const [paymentExecutionItem, setPaymentExecutionItem] = useState<PlannedItem | null>(null);

  // Filter items
  const activeItems = plannedItems.filter((i) => !i.isPaid);
  const paidItems = plannedItems.filter((i) => i.isPaid);

  const filteredActiveItems = activeItems.filter((item) => {
    const matchesMonth = !item.targetMonth || item.targetMonth === selectedMonth;
    const matchesUrgency = filterUrgency === "all" || item.urgency === filterUrgency;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.note && item.note.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesMonth && matchesUrgency && matchesSearch;
  });

  const totalActivePlanned = activeItems.reduce((acc, curr) => acc + curr.estimatedAmount, 0);
  const projectedBalance = currentBalance - totalActivePlanned;
  const isDeficit = projectedBalance < 0 && activeItems.length > 0;

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Hapus rencana "${title}" dari daftar wacana?`)) {
      await FinanceStorage.deletePlannedItem(id);
    }
  };

  const getUrgencyBadge = (urgency: PlannedItemUrgency) => {
    switch (urgency) {
      case "penting":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-50 text-rose-700 border border-rose-200">
            🔴 Penting / Wajib
          </span>
        );
      case "keinginan":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-50 text-amber-800 border border-amber-200">
            🟡 Wishlist Impian
          </span>
        );
      case "santai":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-800 border border-emerald-200">
            🟢 Santai
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in pb-16">
      {/* 1. Header Banner */}
      <div
        className="rounded-3xl p-6 sm:p-8 border shadow-sm flex flex-col md:flex-row items-center justify-between gap-6"
        style={{
          backgroundColor: theme.isDark ? "#111827" : "#FFFFFF",
          borderColor: theme.cardBorder,
        }}
      >
        <div className="space-y-2 text-center md:text-left">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black"
            style={{
              backgroundColor: `${theme.accent}15`,
              color: theme.accent,
            }}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Wacana Belanja & Tagihan Pending</span>
          </div>
          <h1
            className="text-2xl sm:text-3xl font-black tracking-tight"
            style={{ color: theme.isDark ? "#FFFFFF" : theme.textColor }}
          >
            Daftar Rencana & Wishlist
          </h1>
          <p
            className="text-xs sm:text-sm font-medium max-w-xl"
            style={{ color: theme.mutedText }}
          >
            Catat barang, keinginan, atau tagihan yang masih wacana. <b>Saldo kas Anda belum berkurang</b> sampai Anda menekan tombol centang hijau.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <InteractiveCatMascot
            animation={theme.pageAnimations.dashboard}
            theme={theme}
            size="lg"
          />

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-3 rounded-2xl text-white text-xs font-black shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center gap-2"
            style={{ backgroundColor: theme.accent }}
          >
            <Plus className="w-4 h-4" />
            <span>+ Catat Wacana Baru</span>
          </button>
        </div>
      </div>

      {/* 2. Interactive Live Balance Impact Simulation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Current Available Balance */}
        <div className="p-5 rounded-3xl bg-white border border-[#E8E2D8] shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
              Kas Bersih Tersedia
            </span>
            <Wallet className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-xl sm:text-2xl font-black font-mono text-emerald-700 block">
            {formatRupiah(currentBalance)}
          </span>
          <span className="text-[11px] text-stone-400 block">
            Saldo kas riil setelah dikurangi seluruh pengeluaran
          </span>
        </div>

        {/* Total Active Planned */}
        <div className="p-5 rounded-3xl bg-white border border-[#E8E2D8] shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
              Total Rencana Wacana
            </span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <span className="text-xl sm:text-2xl font-black font-mono text-amber-700 block">
            {formatRupiah(totalActivePlanned)}
          </span>
          <span className="text-[11px] text-stone-400 block">
            {activeItems.length} barang masih berstatus wacana (pending)
          </span>
        </div>

        {/* Projected Balance */}
        <div
          className={`p-5 rounded-3xl border shadow-2xs space-y-1 ${
            isDeficit ? "bg-rose-50 border-rose-200" : "bg-white border-[#E8E2D8]"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
              Simulasi Sisa Jika Semua Dibeli
            </span>
            <Sparkles className="w-4 h-4 text-[#854D0E]" />
          </div>
          <span
            className={`text-xl sm:text-2xl font-black font-mono block ${
              isDeficit ? "text-rose-600" : "text-stone-900"
            }`}
          >
            {formatRupiah(projectedBalance)}
          </span>
          <span
            className={`text-[11px] font-bold block ${
              isDeficit ? "text-rose-600" : "text-emerald-700"
            }`}
          >
            {isDeficit ? "⚠️ Melebihi batas saldo kas Anda!" : "✓ Kas mencukupi untuk semua wacana"}
          </span>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Urgency Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#FAF7F2] border border-[#E8E2D8] overflow-x-auto">
          <button
            onClick={() => setFilterUrgency("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterUrgency === "all"
                ? "bg-white text-stone-900 shadow-2xs"
                : "text-stone-500 hover:text-stone-900"
            }`}
          >
            Semua ({activeItems.length})
          </button>
          <button
            onClick={() => setFilterUrgency("penting")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterUrgency === "penting"
                ? "bg-rose-100 text-rose-800 shadow-2xs"
                : "text-stone-500 hover:text-rose-700"
            }`}
          >
            🔴 Penting ({activeItems.filter((i) => i.urgency === "penting").length})
          </button>
          <button
            onClick={() => setFilterUrgency("keinginan")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterUrgency === "keinginan"
                ? "bg-amber-100 text-amber-900 shadow-2xs"
                : "text-stone-500 hover:text-amber-700"
            }`}
          >
            🟡 Wishlist ({activeItems.filter((i) => i.urgency === "keinginan").length})
          </button>
          <button
            onClick={() => setFilterUrgency("santai")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterUrgency === "santai"
                ? "bg-emerald-100 text-emerald-900 shadow-2xs"
                : "text-stone-500 hover:text-emerald-700"
            }`}
          >
            🟢 Santai ({activeItems.filter((i) => i.urgency === "santai").length})
          </button>
        </div>

        {/* Search */}
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari barang wacana..."
            className="w-full pl-9 pr-3.5 py-1.5 rounded-xl border border-[#E8E2D8] text-xs bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#854D0E]/20"
          />
        </div>
      </div>

      {/* 4. Active Planned Items List */}
      <div className="space-y-3">
        {filteredActiveItems.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[#E8E2D8] bg-white p-10 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#FAF7F2] text-[#854D0E] flex items-center justify-center text-xl mx-auto border border-[#E8E2D8]">
              🛍️
            </div>
            <h4 className="text-sm font-bold text-stone-800">
              Belum ada wacana barang untuk filter ini
            </h4>
            <p className="text-xs text-stone-400 max-w-sm mx-auto">
              Tuliskan barang atau tagihan yang ingin Anda beli. Nanti jika sudah terbeli, tinggal klik centang!
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#854D0E] text-white text-xs font-bold hover:bg-[#713F12] transition-all"
            >
              + Buat Wacana Sekarang
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredActiveItems.map((item) => (
              <div
                key={item.id}
                className="rounded-3xl bg-white border border-[#E8E2D8] p-5 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between gap-4 group"
              >
                <div className="space-y-2">
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {getUrgencyBadge(item.urgency)}
                      <span className="text-[10px] font-bold text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full">
                        {item.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setEditingItem(item)}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100"
                        title="Edit Wacana"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id, item.title)}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50"
                        title="Hapus Wacana"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Title */}
                  <h4 className="text-base font-black text-stone-900 tracking-tight">
                    {item.title}
                  </h4>

                  {/* Note */}
                  {item.note && (
                    <p className="text-xs text-stone-500 line-clamp-2 italic">
                      "{item.note}"
                    </p>
                  )}
                </div>

                {/* Bottom Row: Amount & Prominent Checkmark Button */}
                <div className="pt-3 border-t border-[#E8E2D8] flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                      Estimasi Harga
                    </span>
                    <span className="text-base font-black font-mono text-stone-800">
                      {formatRupiah(item.estimatedAmount)}
                    </span>
                  </div>

                  {/* PROMINENT CENTANG BUTTON */}
                  <button
                    onClick={() => setPaymentExecutionItem(item)}
                    className="px-3.5 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs hover:shadow-md active:scale-95 transition-all flex items-center gap-1.5"
                    title="Centang untuk konfirmasi pembayaran riil & kurangi saldo kas"
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Bayar & Potong Saldo</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. Paid / Realized Items Collapsible History */}
      {paidItems.length > 0 && (
        <div className="pt-4">
          <button
            onClick={() => setShowPaidHistory(!showPaidHistory)}
            className="w-full flex items-center justify-between p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8E2D8] text-xs font-bold text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>
                Riwayat Wacana yang Sudah Terealisasi / Lunas ({paidItems.length} Barang)
              </span>
            </div>
            {showPaidHistory ? (
              <ChevronUp className="w-4 h-4 text-stone-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-stone-400" />
            )}
          </button>

          {showPaidHistory && (
            <div className="mt-3 space-y-2 animate-fade-in">
              {paidItems.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl bg-white border border-[#E8E2D8] flex items-center justify-between gap-3 opacity-80 hover:opacity-100 transition-opacity"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                      ✓
                    </div>
                    <div>
                      <span className="text-xs font-bold text-stone-800 line-through">
                        {item.title}
                      </span>
                      <div className="flex items-center gap-2 text-[10px] text-stone-400">
                        <span>Lunas pada {item.paidDate ? formatTanggalIndo(item.paidDate) : "-"}</span>
                        <span>•</span>
                        <span>{item.category}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black font-mono text-emerald-700">
                      {formatRupiah(item.paidAmount || item.estimatedAmount)}
                    </span>
                    <button
                      onClick={() => handleDelete(item.id, item.title)}
                      className="text-stone-300 hover:text-rose-500 p-1 rounded-md"
                      title="Hapus riwayat"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <PlannedItemModal
        isOpen={isAddModalOpen || editingItem !== null}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingItem(null);
        }}
        selectedMonth={selectedMonth}
        initialItem={editingItem}
      />

      <ExecutePaymentModal
        isOpen={paymentExecutionItem !== null}
        onClose={() => setPaymentExecutionItem(null)}
        item={paymentExecutionItem}
        currentBalance={currentBalance}
      />
    </div>
  );
};

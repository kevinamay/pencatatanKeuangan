"use client";

import React, { useState, useRef } from "react";
import {
  X,
  FileSpreadsheet,
  Download,
  Upload,
  Database,
  CheckCircle2,
  AlertCircle,
  FileText,
  Calendar,
  Layers,
} from "lucide-react";
import {
  exportToExcel,
  exportBackupJson,
  restoreBackupJson,
  ExportDataPayload,
} from "@/lib/exportService";

interface BackupExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  dataPayload: ExportDataPayload;
}

export const BackupExportModal: React.FC<BackupExportModalProps> = ({
  isOpen,
  onClose,
  dataPayload,
}) => {
  const [activeTab, setActiveTab] = useState<"excel" | "backup">("excel");
  const [selectedPeriod, setSelectedPeriod] = useState<string>(dataPayload.month);
  const [restoreStatus, setRestoreStatus] = useState<{
    loading: boolean;
    success?: boolean;
    message?: string;
  }>({ loading: false });

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDownloadExcel = () => {
    exportToExcel({
      ...dataPayload,
      month: selectedPeriod,
    });
  };

  const handleDownloadBackup = () => {
    exportBackupJson(dataPayload);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!confirm("Apakah Anda yakin ingin memulihkan data dari file ini? Data baru dari file akan disinkronkan ke Firebase.")) {
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setRestoreStatus({ loading: true });
    const result = await restoreBackupJson(file);
    setRestoreStatus({
      loading: false,
      success: result.success,
      message: result.message,
    });

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in">
      <div className="w-full max-w-lg bg-[#FAF7F2] border border-[#E8E2D8] rounded-3xl p-5 sm:p-6 shadow-2xl relative my-auto space-y-5 text-stone-900">
        {/* Tombol Tutup */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 transition cursor-pointer"
          title="Tutup"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Modal */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#854D0E]/10 flex items-center justify-center text-[#854D0E] shrink-0 border border-[#854D0E]/20">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-stone-900 leading-tight">
              Ekspor Laporan & Cadangkan Data
            </h3>
            <p className="text-xs text-stone-500">
              Unduh ke Excel (.xlsx) atau cadangkan database (.json)
            </p>
          </div>
        </div>

        {/* Tab Navigasi */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-stone-200/50 rounded-2xl border border-[#E8E2D8] text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab("excel")}
            className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "excel"
                ? "bg-white text-stone-900 shadow-xs border border-[#E8E2D8]"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Ekspor Excel (.xlsx)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("backup")}
            className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "backup"
                ? "bg-white text-stone-900 shadow-xs border border-[#E8E2D8]"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            <Layers className="w-4 h-4 text-amber-700" />
            <span>Backup & Restore</span>
          </button>
        </div>

        {/* Konten Tab 1: Ekspor Excel */}
        {activeTab === "excel" && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-[#E8E2D8] p-4 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-stone-400" />
                  Pilih Periode Transaksi:
                </span>
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="text-xs font-bold bg-[#FAF7F2] border border-[#E8E2D8] rounded-xl px-3 py-1.5 text-stone-800 outline-none focus:border-[#854D0E]"
                >
                  <option value={dataPayload.month}>Bulan Aktif ({dataPayload.month})</option>
                  <option value="">Semua Riwayat (Seluruh Waktu)</option>
                </select>
              </div>

              <div className="border-t border-[#E8E2D8]/60 pt-3 space-y-1.5 text-xs text-stone-600">
                <p className="font-bold text-stone-800 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-emerald-600" />
                  Format Lembar Kerja Multi-Sheet:
                </p>
                <ul className="list-disc list-inside space-y-1 text-[11px] text-stone-500 pl-1">
                  <li>Sheet 1: <strong>Ringkasan Gaji & Sisa Bersih</strong></li>
                  <li>Sheet 2: <strong>Riwayat Belanja Harian</strong></li>
                  <li>Sheet 3: <strong>Tabungan & Reksa Dana Pasar Uang</strong></li>
                  <li>Sheet 4: <strong>Rencana & Wacana Pengeluaran</strong></li>
                </ul>
              </div>
            </div>

            <button
              onClick={handleDownloadExcel}
              className="w-full py-3 px-4 rounded-2xl bg-[#854D0E] hover:bg-[#713F12] text-white font-bold text-sm shadow-md shadow-amber-900/15 flex items-center justify-center gap-2 active:scale-98 transition cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Unduh File Excel (.xlsx)</span>
            </button>
          </div>
        )}

        {/* Konten Tab 2: Backup & Restore */}
        {activeTab === "backup" && (
          <div className="space-y-4">
            {/* Cadangkan */}
            <div className="bg-white rounded-2xl border border-[#E8E2D8] p-4 space-y-2 shadow-xs">
              <h4 className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                <Download className="w-4 h-4 text-[#854D0E]" />
                Cadangkan Seluruh Data (Backup)
              </h4>
              <p className="text-[11px] text-stone-500 leading-relaxed">
                Unduh file cadangan mandiri (.json) yang memuat seluruh transaksi, gaji, tabungan, dan portofolio pasar uang Anda.
              </p>
              <button
                onClick={handleDownloadBackup}
                className="mt-2 w-full py-2.5 px-3 rounded-xl bg-[#FAF7F2] hover:bg-stone-200/60 border border-[#E8E2D8] text-stone-800 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-stone-600" />
                <span>Download File Cadangan (.json)</span>
              </button>
            </div>

            {/* Pulihkan */}
            <div className="bg-white rounded-2xl border border-[#E8E2D8] p-4 space-y-2 shadow-xs">
              <h4 className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-emerald-700" />
                Pulihkan Data (Restore)
              </h4>
              <p className="text-[11px] text-stone-500 leading-relaxed">
                Pilih file .json cadangan sebelumnya untuk disinkronkan kembali ke database Firebase aplikasi ini.
              </p>

              <input
                type="file"
                ref={fileInputRef}
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />

              <button
                disabled={restoreStatus.loading}
                onClick={() => fileInputRef.current?.click()}
                className="mt-2 w-full py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100/70 border border-emerald-200 text-emerald-900 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-50"
              >
                <Upload className="w-3.5 h-3.5 text-emerald-700" />
                <span>{restoreStatus.loading ? "Sedang Memproses..." : "Pilih File Cadangan (.json)"}</span>
              </button>
            </div>

            {/* Status Notifikasi */}
            {restoreStatus.message && (
              <div
                className={`p-3 rounded-xl text-xs flex items-start gap-2 border ${
                  restoreStatus.success
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : "bg-rose-50 text-rose-800 border-rose-200"
                }`}
              >
                {restoreStatus.success ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                )}
                <span>{restoreStatus.message}</span>
              </div>
            )}
          </div>
        )}

        <div className="pt-2 text-center">
          <p className="text-[10px] text-stone-400">
            Tokyo Neko FinPlan • Data Anda aman dan terenkripsi di Google Cloud Firebase
          </p>
        </div>
      </div>
    </div>
  );
};

"use client";

import React, { useState } from "react";
import { Upload, FileText, CheckCircle, AlertCircle, X, ArrowDownRight, ArrowUpRight } from "lucide-react";
import { FinanceStorage, formatRupiah } from "@/lib/storage";
import { IncomeCategory, ExpenseCategory } from "@/types/finance";

interface ParsedTransaction {
  id: string;
  date: string;
  title: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  selected: boolean;
}

interface ImportStatementModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMonth: string;
  onImportSuccess: () => void;
}

export const ImportStatementModal: React.FC<ImportStatementModalProps> = ({
  isOpen,
  onClose,
  selectedMonth,
  onImportSuccess,
}) => {
  const [fileContent, setFileContent] = useState<string>("");
  const [parsedRows, setParsedRows] = useState<ParsedTransaction[]>([]);
  const [fileName, setFileName] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Handle File Upload or Paste
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setErrorMsg(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setFileContent(text);
      parseCSV(text);
    };
    reader.onerror = () => {
      setErrorMsg("Gagal membaca file CSV. Pastikan file valid.");
    };
    reader.readAsText(file);
  };

  // Smart CSV Parser for Bank Statements (BCA, Mandiri, Jenius, GoPay, CSV standar)
  const parseCSV = (csvText: string) => {
    try {
      const lines = csvText.split(/\r?\n/).filter((line) => line.trim().length > 0);
      if (lines.length < 2) {
        setErrorMsg("File CSV kosong atau tidak memiliki baris data.");
        return;
      }

      const rows: ParsedTransaction[] = [];
      const todayStr = new Date().toISOString().split("T")[0];

      // Scan rows
      for (let i = 1; i < lines.length; i++) {
        const rawLine = lines[i];
        // Split by comma or semicolon or tab, handling quotes
        const cols = rawLine.split(/[,;\t]/).map((c) => c.replace(/^["']|["']$/g, "").trim());
        if (cols.length < 2) continue;

        let date = todayStr;
        let title = "Transaksi Mutasi";
        let amount = 0;
        let type: "income" | "expense" = "expense";
        let category = "Lain-lain";

        // Try to identify date in col 0 or 1 (YYYY-MM-DD or DD/MM/YYYY)
        for (const col of cols.slice(0, 3)) {
          if (col.match(/^\d{4}-\d{2}-\d{2}$/)) {
            date = col;
            break;
          } else if (col.match(/^\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}$/)) {
            const parts = col.split(/[\/\-\.]/);
            const y = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
            const m = parts[1].padStart(2, "0");
            const d = parts[0].padStart(2, "0");
            date = `${y}-${m}-${d}`;
            break;
          }
        }

        // Try to find amount (number with possible Rp, dots, commas)
        for (let cIdx = 0; cIdx < cols.length; cIdx++) {
          const col = cols[cIdx];
          const cleanNum = col.replace(/[^0-9]/g, "");
          const val = parseInt(cleanNum, 10);
          if (!isNaN(val) && val > 1000 && val > amount) {
            amount = val;
            // Guess type: if column or previous columns contain 'CR', 'KREDIT', 'MASUK', 'TOPUP', 'GAJI' -> income
            const lineLower = rawLine.toLowerCase();
            if (
              lineLower.includes("cr") ||
              lineLower.includes("kredit") ||
              lineLower.includes("gaji") ||
              lineLower.includes("masuk") ||
              lineLower.includes("transfer dari")
            ) {
              type = "income";
            }
          }
        }

        // Find description (longest text column that isn't date or number)
        const textCols = cols.filter(
          (c) => c.length > 2 && isNaN(Number(c.replace(/[^0-9]/g, ""))) && !c.includes("/")
        );
        if (textCols.length > 0) {
          title = textCols.sort((a, b) => b.length - a.length)[0];
        }

        // Auto-assign category
        const titleLower = title.toLowerCase();
        if (titleLower.includes("makan") || titleLower.includes("kopi") || titleLower.includes("cafe") || titleLower.includes("resto") || titleLower.includes("gofood") || titleLower.includes("shopeefood")) {
          category = "Konsumsi / Makanan";
        } else if (titleLower.includes("listrik") || titleLower.includes("pln") || titleLower.includes("wifi") || titleLower.includes("internet") || titleLower.includes("pulsa") || titleLower.includes("air")) {
          category = "Tagihan & Utilitas";
        } else if (titleLower.includes("bensin") || titleLower.includes("spbu") || titleLower.includes("pertamina") || titleLower.includes("grab") || titleLower.includes("gojek") || titleLower.includes("tol")) {
          category = "Transportasi";
        } else if (titleLower.includes("tokopedia") || titleLower.includes("shopee") || titleLower.includes("lazada") || titleLower.includes("blibli")) {
          category = "Belanja";
        } else if (type === "income") {
          category = "Gaji Pokok";
        }

        if (amount > 0) {
          rows.push({
            id: `import-${Date.now()}-${i}`,
            date,
            title: title.slice(0, 40),
            amount,
            type,
            category,
            selected: true,
          });
        }
      }

      setParsedRows(rows);
      if (rows.length === 0) {
        setErrorMsg("Tidak dapat mendeteksi nominal transaksi dari file CSV.");
      }
    } catch {
      setErrorMsg("Format CSV tidak dikenali. Silakan gunakan format CSV standar.");
    }
  };

  const toggleSelect = (id: string) => {
    setParsedRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, selected: !r.selected } : r))
    );
  };

  const handleExecuteImport = async () => {
    const selectedRows = parsedRows.filter((r) => r.selected);
    if (selectedRows.length === 0) return;

    setIsProcessing(true);
    try {
      for (const row of selectedRows) {
        const month = row.date.slice(0, 7) || selectedMonth;
        if (row.type === "income") {
          await FinanceStorage.addIncome({
            source: row.title,
            amount: row.amount,
            date: row.date,
            month,
            category: (row.category as IncomeCategory) || "Lainnya",
            note: row.title,
          });
        } else {
          await FinanceStorage.addExpense({
            category: (row.category as ExpenseCategory) || "Lainnya",
            amount: row.amount,
            title: row.title,
            note: row.title,
            date: row.date,
            month,
          });
        }
      }

      onImportSuccess();
      onClose();
    } catch {
      setErrorMsg("Terjadi kendala saat menyimpan transaksi.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl border border-[#E8E2D8] shadow-2xl max-w-2xl w-full p-6 sm:p-7 relative overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E8E2D8]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FAF7F2] border border-[#E8E2D8] flex items-center justify-center text-[#854D0E]">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold font-mono text-base text-stone-900">
                Import Mutasi CSV Bank / E-Wallet
              </h3>
              <p className="text-[11px] font-mono text-stone-500">
                Otomatis mapping kolom Tanggal, Judul, Kategori & Nominal
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Upload Zone */}
        <div className="py-4 space-y-4 overflow-y-auto flex-1">
          {parsedRows.length === 0 ? (
            <div className="border-2 border-dashed border-[#E8E2D8] rounded-2xl p-8 text-center hover:border-amber-400 transition-colors bg-[#FAF7F2]/60 flex flex-col items-center justify-center gap-3">
              <FileText className="w-10 h-10 text-amber-700/60" />
              <div className="space-y-1">
                <p className="text-xs font-bold text-stone-800">
                  Pilih file CSV mutasi rekening Anda
                </p>
                <p className="text-[11px] text-stone-500 max-w-sm">
                  Mendukung ekspor mutasi dari BCA, Mandiri, Jenius, GoPay, OVO, ShopeePay, atau spreadsheet standar.
                </p>
              </div>
              <label className="cursor-pointer px-4 py-2 rounded-xl bg-[#854D0E] hover:bg-[#713F12] text-white text-xs font-bold font-mono active:scale-95 transition-all shadow-xs inline-flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5" />
                <span>Pilih File .CSV</span>
                <input
                  type="file"
                  accept=".csv,.txt"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-stone-600 bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E8E2D8]">
                <span>
                  File: <strong className="text-stone-900">{fileName}</strong> ({parsedRows.length} baris terdeteksi)
                </span>
                <button
                  onClick={() => {
                    setParsedRows([]);
                    setFileName("");
                  }}
                  className="text-[11px] text-amber-800 hover:underline font-bold"
                >
                  Ganti File
                </button>
              </div>

              {/* Preview Table */}
              <div className="border border-[#E8E2D8] rounded-2xl overflow-hidden max-h-60 overflow-y-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-[#FAF7F2] border-b border-[#E8E2D8] text-[10px] uppercase text-stone-500">
                    <tr>
                      <th className="p-2 w-8 text-center">✓</th>
                      <th className="p-2">Tanggal</th>
                      <th className="p-2">Keterangan</th>
                      <th className="p-2">Kategori</th>
                      <th className="p-2 text-right">Nominal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8E2D8]">
                    {parsedRows.map((row) => (
                      <tr
                        key={row.id}
                        onClick={() => toggleSelect(row.id)}
                        className={`cursor-pointer hover:bg-stone-50 transition-colors ${
                          row.selected ? "bg-amber-50/40" : "opacity-40"
                        }`}
                      >
                        <td className="p-2 text-center">
                          <input
                            type="checkbox"
                            checked={row.selected}
                            onChange={() => {}}
                            className="rounded border-stone-300 text-amber-700 focus:ring-0"
                          />
                        </td>
                        <td className="p-2 text-stone-600 whitespace-nowrap">{row.date}</td>
                        <td className="p-2 font-medium text-stone-900 truncate max-w-[150px]">
                          {row.title}
                        </td>
                        <td className="p-2 text-stone-600 whitespace-nowrap">{row.category}</td>
                        <td className="p-2 text-right whitespace-nowrap">
                          <span
                            className={`font-bold inline-flex items-center gap-0.5 ${
                              row.type === "income" ? "text-emerald-700" : "text-stone-800"
                            }`}
                          >
                            {row.type === "income" ? "+" : "-"}
                            {formatRupiah(row.amount)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="pt-4 border-t border-[#E8E2D8] flex items-center justify-between">
          <span className="text-[11px] font-mono text-stone-500">
            {parsedRows.filter((r) => r.selected).length} transaksi dipilih
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-mono font-bold text-stone-600 hover:bg-stone-100 transition-colors"
            >
              Batal
            </button>
            <button
              onClick={handleExecuteImport}
              disabled={parsedRows.filter((r) => r.selected).length === 0 || isProcessing}
              className="px-4.5 py-2 rounded-xl bg-[#854D0E] hover:bg-[#713F12] disabled:opacity-50 text-white text-xs font-mono font-bold transition-all shadow-xs flex items-center gap-1.5"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>{isProcessing ? "Menyimpan..." : "Simpan ke Catatan"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportStatementModal;

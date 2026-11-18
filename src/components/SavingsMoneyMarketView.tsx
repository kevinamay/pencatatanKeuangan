"use client";

import React, { useState } from "react";
import {
  TrendingUp,
  PiggyBank,
  Landmark,
  PlusCircle,
  Shield,
  Target,
  ArrowUpRight,
  Calculator,
  Trash2,
} from "lucide-react";
import {
  SavingsAllocation,
  MoneyMarketProduct,
} from "@/types/finance";
import {
  FinanceStorage,
  formatRupiah,
  formatTanggalIndo,
  calculateMoneyMarketProfit,
} from "@/lib/storage";
import { LottieAnimation } from "@/components/LottieAnimation";

interface SavingsMoneyMarketViewProps {
  savings: SavingsAllocation[];
  moneyMarket: MoneyMarketProduct[];
  selectedMonth: string;
  onOpenQuickAdd?: () => void;
}

export const SavingsMoneyMarketView: React.FC<SavingsMoneyMarketViewProps> = ({
  savings,
  moneyMarket,
  selectedMonth,
  onOpenQuickAdd,
}) => {
  const [showAddMMModal, setShowAddMMModal] = useState(false);
  const [showTopUpModal, setShowTopUpModal] = useState<string | null>(null);

  const [mmName, setMmName] = useState("");
  const [mmPlatform, setMmPlatform] = useState("Bibit");
  const [mmCapital, setMmCapital] = useState("");
  const [mmRate, setMmRate] = useState("5.8");
  const [mmStartDate, setMmStartDate] = useState("");
  const [mmNotes, setMmNotes] = useState("");

  const [topUpAmount, setTopUpAmount] = useState("");
  const [topUpDate, setTopUpDate] = useState("");
  const [topUpNote, setTopUpNote] = useState("");

  React.useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    if (!mmStartDate) setMmStartDate(today);
    if (!topUpDate) setTopUpDate(today);
  }, [mmStartDate, topUpDate]);

  const [simCapital, setSimCapital] = useState<number>(20000000);
  const [simMonthlyAdd, setSimMonthlyAdd] = useState<number>(2000000);
  const [simRate, setSimRate] = useState<number>(6.0);
  const [simYears, setSimYears] = useState<number>(3);

  const calculateCompoundSimulation = () => {
    const monthlyRate = simRate / 100 / 12;
    const totalMonths = simYears * 12;
    let totalValue = simCapital;
    let totalDeposited = simCapital;

    for (let m = 1; m <= totalMonths; m++) {
      totalValue = totalValue * (1 + monthlyRate) + simMonthlyAdd;
      totalDeposited += simMonthlyAdd;
    }

    const totalProfit = Math.max(0, totalValue - totalDeposited);
    return {
      totalValue: Math.round(totalValue),
      totalDeposited: Math.round(totalDeposited),
      totalProfit: Math.round(totalProfit),
    };
  };

  const simResult = calculateCompoundSimulation();

  const regularSavings = savings.filter(
    (s) => s.targetType === "regular" || s.targetType === "emergency" || s.targetType === "goal"
  );
  const totalRegularSavings = regularSavings.reduce((acc, curr) => acc + curr.amount, 0);

  const mmSummary = moneyMarket.reduce(
    (acc, item) => {
      const calc = calculateMoneyMarketProfit(
        item.initialCapital,
        item.returnRatePa,
        item.startDate,
        item.accumulatedReturn
      );
      acc.totalCapital += item.initialCapital;
      acc.totalProfit += calc.estimatedProfit;
      acc.totalValue += calc.totalValue;
      return acc;
    },
    { totalCapital: 0, totalProfit: 0, totalValue: 0 }
  );

  const grandTotalSavings = totalRegularSavings + mmSummary.totalValue;

  const handleAddMM = async (e: React.FormEvent) => {
    e.preventDefault();
    const cap = parseFloat(mmCapital.replace(/[^0-9]/g, "")) || 0;
    const rate = parseFloat(mmRate) || 0;
    if (!mmName || cap <= 0) {
      alert("Lengkapi nama produk dan nominal modal");
      return;
    }

    await FinanceStorage.addMoneyMarketProduct({
      name: mmName,
      platform: mmPlatform,
      initialCapital: cap,
      returnRatePa: rate,
      startDate: mmStartDate,
      notes: mmNotes,
    });

    setMmName("");
    setMmCapital("");
    setShowAddMMModal(false);
  };

  const handleTopUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showTopUpModal) return;
    const amount = parseFloat(topUpAmount.replace(/[^0-9]/g, "")) || 0;
    if (amount <= 0) {
      alert("Masukkan nominal top up yang valid");
      return;
    }

    await FinanceStorage.topUpMoneyMarket(
      showTopUpModal,
      amount,
      topUpDate,
      topUpNote
    );
    setTopUpAmount("");
    setShowTopUpModal(null);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#991213] via-[#b51819] to-[#7f0e0f] text-white p-6 sm:p-8 shadow-xl shadow-[#991213]/20 border border-[#991213]">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFD9D9] text-[#991213] text-xs font-black shadow-xs">
              <Landmark className="w-3.5 h-3.5 text-[#991213]" />
              <span>Portofolio Tabungan & Pasar Uang Terintegrasi</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Tabungan & Aset Pasar Uang
            </h1>
            <p className="text-[#FFD9D9] text-xs sm:text-sm leading-relaxed font-medium">
              Pantau tabungan yang sudah ada digabungkan dengan tabungan yang dialokasikan
              ke instrumen pasar uang, lengkap dengan akumulasi keuntungan (imbal hasil)
              secara riil.
            </p>
          </div>

          {/* Grand Total Value Card with Lottie Save Money */}
          <div className="flex items-center gap-4 bg-black/25 backdrop-blur-md border border-[#FFD9D9]/30 p-5 sm:p-6 rounded-2xl min-w-[280px]">
            <div className="flex-1">
              <span className="text-xs uppercase tracking-wider font-extrabold text-[#FFD9D9]">
                Total Keseluruhan Tabungan & Aset
              </span>
              <div className="text-3xl font-black text-white mt-1">
                {formatRupiah(grandTotalSavings)}
              </div>
              <div className="flex items-center gap-2 mt-2 text-xs font-bold text-emerald-300">
                <span className="flex items-center gap-1">
                  <ArrowUpRight className="w-4 h-4" />
                  +{formatRupiah(mmSummary.totalProfit)}
                </span>
                <span className="text-[#FFD9D9] font-normal">profit pasar uang</span>
              </div>
            </div>
            <div className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0">
              <LottieAnimation type="save-money" className="w-full h-full" />
            </div>
          </div>
        </div>

        <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* 2 Main Sections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Kolom 1: Tabungan Yang Sudah Ada */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white border border-[#FFD9D9] shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#FFD9D9] text-[#991213] flex items-center justify-center font-bold">
                <PiggyBank className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-black text-base sm:text-lg text-slate-900">
                  Tabungan Yang Sudah Ada
                </h2>
                <p className="text-xs text-slate-500">
                  Tabungan darurat, tabungan bank reguler & target impian
                </p>
              </div>
            </div>
            <span className="text-xs font-black px-3 py-1 bg-[#FFF0F0] border border-[#FFD9D9] rounded-full text-[#991213]">
              {formatRupiah(totalRegularSavings)}
            </span>
          </div>

          <div className="space-y-3">
            {regularSavings.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-sm">
                Belum ada tabungan konvensional yang tercatat.
              </div>
            ) : (
              regularSavings.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-[#FFF9F9] border border-[#FFD9D9] flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white shadow-xs border border-[#FFD9D9]/50 flex items-center justify-center text-slate-700">
                      {item.targetType === "emergency" ? (
                        <Shield className="w-4 h-4 text-[#991213]" />
                      ) : (
                        <Target className="w-4 h-4 text-[#991213]" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        {item.accountName}
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        {formatTanggalIndo(item.date)} •{" "}
                        {item.targetType === "emergency"
                          ? "Dana Darurat"
                          : "Tabungan Reguler"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-black text-[#991213] text-sm">
                      {formatRupiah(item.amount)}
                    </span>
                    <button
                      onClick={() => FinanceStorage.deleteSavings(item.id)}
                      className="text-slate-400 hover:text-rose-500 p-1"
                      title="Hapus"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Kolom 2: Tabungan Yang Dimasukkan Ke Pasar Uang */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white border border-[#FFD9D9] shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#FFD9D9] text-[#991213] flex items-center justify-center font-bold">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-black text-base sm:text-lg text-slate-900">
                  Tabungan di Pasar Uang
                </h2>
                <p className="text-xs text-slate-500">
                  Modal pokok disetor + Akumulasi keuntungan imbal hasil
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowAddMMModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#991213] hover:bg-[#7f0e0f] text-white font-bold text-xs shadow-md shadow-[#991213]/20 active:scale-95 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              Tambah Produk
            </button>
          </div>

          <div className="space-y-4">
            {moneyMarket.map((item) => {
              const calc = calculateMoneyMarketProfit(
                item.initialCapital,
                item.returnRatePa,
                item.startDate,
                item.accumulatedReturn
              );

              return (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl bg-[#FFF9F9] border border-[#FFD9D9] shadow-xs space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-black text-slate-900 text-base">
                          {item.name}
                        </h3>
                        <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-md bg-[#FFD9D9] text-[#991213]">
                          {item.platform}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Mulai {formatTanggalIndo(item.startDate)} • Aktif {calc.daysActive} hari
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-slate-400 block font-semibold">
                        Nilai Saat Ini
                      </span>
                      <span className="text-lg font-black text-[#991213]">
                        {formatRupiah(calc.totalValue)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 p-3 bg-white rounded-xl border border-[#FFD9D9] text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">
                        Modal Pokok
                      </span>
                      <span className="font-bold text-slate-800">
                        {formatRupiah(item.initialCapital)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">
                        Imbal Hasil (% p.a.)
                      </span>
                      <span className="font-black text-[#991213]">
                        {item.returnRatePa}% /thn
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-emerald-700 block font-bold">
                        Keuntungan Didapat
                      </span>
                      <span className="font-extrabold text-emerald-700">
                        +{formatRupiah(calc.estimatedProfit)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-slate-500 font-medium">
                      ~ {formatRupiah(calc.monthlyReturn)} estimasi keuntungan per bulan
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowTopUpModal(item.id)}
                        className="px-3 py-1.5 rounded-lg bg-[#991213] hover:bg-[#7f0e0f] text-white font-bold text-xs shadow-xs transition-all"
                      >
                        + Top Up Dana
                      </button>
                      <button
                        onClick={() => FinanceStorage.deleteMoneyMarket(item.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition-all"
                        title="Hapus instrumen"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Simulator Compound Calculator */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#FFD9D9] shadow-xs space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#FFD9D9] text-[#991213] flex items-center justify-center font-bold">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900">
              Kalkulator & Simulasi Pertumbuhan Pasar Uang
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Lihat proyeksi imbal hasil tabungan Anda jika diinvestasikan rutin ke pasar
              uang dibandingkan tabungan biasa.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Sliders */}
          <div className="lg:col-span-2 space-y-5 p-5 rounded-2xl bg-[#FFF9F9] border border-[#FFD9D9]">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-700">Modal Awal Setoran</span>
                <span className="font-black text-[#991213]">
                  {formatRupiah(simCapital)}
                </span>
              </div>
              <input
                type="range"
                min="1000000"
                max="100000000"
                step="1000000"
                value={simCapital}
                onChange={(e) => setSimCapital(Number(e.target.value))}
                className="w-full accent-[#991213] h-2 bg-[#FFD9D9] rounded-lg cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-700">Rutin Tambah Tiap Bulan (DCA)</span>
                <span className="font-black text-[#991213]">
                  {formatRupiah(simMonthlyAdd)}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="20000000"
                step="500000"
                value={simMonthlyAdd}
                onChange={(e) => setSimMonthlyAdd(Number(e.target.value))}
                className="w-full accent-[#991213] h-2 bg-[#FFD9D9] rounded-lg cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-700">Tenor Investasi</span>
                  <span className="font-black text-[#991213]">{simYears} Tahun</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={simYears}
                  onChange={(e) => setSimYears(Number(e.target.value))}
                  className="w-full accent-[#991213] h-2 bg-[#FFD9D9] rounded-lg cursor-pointer"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-700">Imbal Hasil (% p.a.)</span>
                  <span className="font-black text-[#991213]">{simRate}%</span>
                </div>
                <input
                  type="range"
                  min="3.0"
                  max="8.0"
                  step="0.1"
                  value={simRate}
                  onChange={(e) => setSimRate(Number(e.target.value))}
                  className="w-full accent-[#991213] h-2 bg-[#FFD9D9] rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Hasil Proyeksi Card with Lottie Chart Growth */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-[#991213] via-[#851011] to-[#5e0809] text-white shadow-xl flex flex-col justify-between border border-[#FFD9D9]/30">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-black tracking-wider text-[#FFD9D9]">
                  Estimasi Hasil Akhir ({simYears} Tahun)
                </span>
                <div className="w-14 h-14 flex-shrink-0">
                  <LottieAnimation type="chart-growth" className="w-full h-full" />
                </div>
              </div>
              <h3 className="text-3xl font-black text-white tracking-tight">
                {formatRupiah(simResult.totalValue)}
              </h3>

              <div className="pt-4 border-t border-white/20 space-y-2 text-xs">
                <div className="flex justify-between text-[#FFD9D9]">
                  <span>Total Uang Disetor:</span>
                  <span className="font-bold text-white">
                    {formatRupiah(simResult.totalDeposited)}
                  </span>
                </div>
                <div className="flex justify-between text-white font-extrabold">
                  <span>Total Keuntungan Bersih:</span>
                  <span className="text-emerald-300 font-black">
                    +{formatRupiah(simResult.totalProfit)}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-[#FFD9D9] mt-4 leading-relaxed font-medium">
              💡 Reksadana Pasar Uang di Indonesia bukan objek pajak (bebas PPh 20%
              seperti deposito) dan bebas biaya pembelian maupun penjualan.
            </p>
          </div>
        </div>
      </div>

      {/* Modal Tambah Produk Pasar Uang Baru */}
      {showAddMMModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-[#FFD9D9] space-y-4">
            <h3 className="text-lg font-black text-[#991213]">
              Tambah Produk Reksa Dana Pasar Uang
            </h3>

            <form onSubmit={handleAddMM} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Produk
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Sucorinvest Money Market Fund"
                  value={mmName}
                  onChange={(e) => setMmName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FFF9F9] border border-[#FFD9D9] rounded-xl text-sm font-medium text-slate-900 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Platform / Sekuritas
                  </label>
                  <select
                    value={mmPlatform}
                    onChange={(e) => setMmPlatform(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#FFF9F9] border border-[#FFD9D9] rounded-xl text-sm font-medium text-slate-900 focus:bg-white"
                  >
                    <option value="Bibit">Bibit</option>
                    <option value="Bareksa">Bareksa</option>
                    <option value="Ajaib">Ajaib</option>
                    <option value="Pluang">Pluang</option>
                    <option value="Bank BCA">Bank BCA</option>
                    <option value="Bank Mandiri">Bank Mandiri</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Return (% p.a.)
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    required
                    value={mmRate}
                    onChange={(e) => setMmRate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#FFF9F9] border border-[#FFD9D9] rounded-xl text-sm font-medium text-slate-900 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Modal Pokok Awal (Rp)
                </label>
                <input
                  type="text"
                  required
                  placeholder="0"
                  value={mmCapital}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, "");
                    setMmCapital(val ? Number(val).toLocaleString("id-ID") : "");
                  }}
                  className="w-full px-3.5 py-2.5 bg-[#FFF9F9] border border-[#FFD9D9] rounded-xl text-sm font-bold text-slate-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tanggal Mulai
                </label>
                <input
                  type="date"
                  required
                  value={mmStartDate}
                  onChange={(e) => setMmStartDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FFF9F9] border border-[#FFD9D9] rounded-xl text-sm font-medium text-slate-900 focus:bg-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddMMModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 font-bold text-xs text-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#991213] hover:bg-[#7f0e0f] font-bold text-xs text-white shadow-md shadow-[#991213]/20"
                >
                  Simpan Produk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Top Up Dana Pasar Uang */}
      {showTopUpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-[#FFD9D9] space-y-4">
            <h3 className="text-base font-black text-[#991213]">
              Top Up Saldo Pasar Uang
            </h3>

            <form onSubmit={handleTopUp} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nominal Top Up (Rp)
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="0"
                  value={topUpAmount}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, "");
                    setTopUpAmount(val ? Number(val).toLocaleString("id-ID") : "");
                  }}
                  className="w-full px-3.5 py-2.5 bg-[#FFF9F9] border border-[#FFD9D9] rounded-xl text-sm font-bold text-slate-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tanggal Top Up
                </label>
                <input
                  type="date"
                  required
                  value={topUpDate}
                  onChange={(e) => setTopUpDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FFF9F9] border border-[#FFD9D9] rounded-xl text-sm font-medium text-slate-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Keterangan / Sumber Dana
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Dari alokasi sisa gaji November"
                  value={topUpNote}
                  onChange={(e) => setTopUpNote(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FFF9F9] border border-[#FFD9D9] rounded-xl text-sm font-medium text-slate-900 focus:bg-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTopUpModal(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 font-bold text-xs text-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#991213] hover:bg-[#7f0e0f] font-bold text-xs text-white shadow-md shadow-[#991213]/20"
                >
                  Konfirmasi Top Up
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

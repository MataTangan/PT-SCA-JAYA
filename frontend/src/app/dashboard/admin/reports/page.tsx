"use client";

import { useMemo, useState } from "react";
import AdminSidebar from "@/components/admin/Sidebar";
import AdminTopbar from "@/components/admin/Topbar";

type Tab = "occupancy" | "transactions";
type PaymentStatus = "Lunas" | "Belum bayar";

type Transaction = {
  id: string;
  guest: string;
  type: string;
  checkIn: string;
  checkOut: string;
  status: string;
  payment: PaymentStatus;
  total: number;
};

const ACTIVE_ROOMS = 12;

const transactions: Transaction[] = [
  {
    id: "R001",
    guest: "Budi Santoso",
    type: "Deluxe",
    checkIn: "2026-11-11",
    checkOut: "2026-11-14",
    status: "Check-in",
    payment: "Lunas",
    total: 2250000,
  },
  {
    id: "R002",
    guest: "Sinta Dewi",
    type: "Superior",
    checkIn: "2026-11-13",
    checkOut: "2026-11-15",
    status: "Dipesan",
    payment: "Belum bayar",
    total: 900000,
  },
  {
    id: "R005",
    guest: "Sinta Dewi",
    type: "Deluxe",
    checkIn: "2026-11-03",
    checkOut: "2026-11-05",
    status: "Selesai",
    payment: "Lunas",
    total: 1500000,
  },
  {
    id: "R006",
    guest: "Andi Wijaya",
    type: "Superior",
    checkIn: "2026-11-12",
    checkOut: "2026-11-14",
    status: "Check-in",
    payment: "Belum bayar",
    total: 900000,
  },
  {
    id: "R007",
    guest: "Dewi Lestari",
    type: "Suite",
    checkIn: "2026-11-06",
    checkOut: "2026-11-08",
    status: "Selesai",
    payment: "Lunas",
    total: 1900000,
  },
  {
    id: "R008",
    guest: "Rizky Maulana",
    type: "Deluxe",
    checkIn: "2026-11-08",
    checkOut: "2026-11-10",
    status: "Selesai",
    payment: "Lunas",
    total: 1200000,
  },
  {
    id: "R009",
    guest: "Nadia Putri",
    type: "Superior",
    checkIn: "2026-11-09",
    checkOut: "2026-11-11",
    status: "Selesai",
    payment: "Lunas",
    total: 900000,
  },
  {
    id: "R010",
    guest: "Fajar Nugraha",
    type: "Suite",
    checkIn: "2026-11-10",
    checkOut: "2026-11-12",
    status: "Selesai",
    payment: "Lunas",
    total: 650000,
  },
];

const dailyOccupied = [
  1, 0, 1, 1, 1, 0, 1, 2, 1, 1, 0, 1, 1, 2, 1, 1, 0, 1, 2, 1, 1, 0, 1, 2, 1, 1, 0, 1, 2, 1, 1,
];

const dailyReserved = [
  0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0,
];

function getToday() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getMonthStart() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");

  return `${year}-${month}-01`;
}

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: string) {
  return new Date(value + "T00:00:00").toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getDateRange(start: string, end: string) {
  if (!start || !end || start > end) return [];

  const dates: string[] = [];
  const current = new Date(start + "T00:00:00");
  const last = new Date(end + "T00:00:00");

  while (current <= last && dates.length < 366) {
    const year = current.getFullYear();
    const month = String(current.getMonth() + 1).padStart(2, "0");
    const day = String(current.getDate()).padStart(2, "0");

    dates.push(`${year}-${month}-${day}`);
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

function getOccupancy(date: string) {
  const day = Number(date.slice(8, 10));
  const index = (day - 1) % dailyOccupied.length;

  const occupied = dailyOccupied[index];
  const reserved = dailyReserved[index];
  const empty = Math.max(0, ACTIVE_ROOMS - occupied - reserved);

  return {
    date,
    occupied,
    reserved,
    empty,
    percentage: Math.round((occupied / ACTIVE_ROOMS) * 100),
  };
}

export default function AdminReportsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("occupancy");

  const [startDate, setStartDate] = useState(getMonthStart);
  const [endDate, setEndDate] = useState(getToday());

  const [appliedStart, setAppliedStart] = useState(getMonthStart);
  const [appliedEnd, setAppliedEnd] = useState(getToday());

  const [search, setSearch] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("Semua status");

  const [dateError, setDateError] = useState("");

  const dateRange = useMemo(
    () => getDateRange(appliedStart, appliedEnd),
    [appliedStart, appliedEnd],
  );

  const occupancyData = useMemo(() => dateRange.map((date) => getOccupancy(date)), [dateRange]);

  const averageOccupancy = useMemo(() => {
    if (occupancyData.length === 0) return 0;

    const total = occupancyData.reduce((sum, item) => sum + item.percentage, 0);

    return Math.round(total / occupancyData.length);
  }, [occupancyData]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((item) => {
      const matchesDate = item.checkIn >= appliedStart && item.checkIn <= appliedEnd;

      const matchesSearch =
        item.id.toLowerCase().includes(search.toLowerCase()) ||
        item.guest.toLowerCase().includes(search.toLowerCase()) ||
        item.type.toLowerCase().includes(search.toLowerCase());

      const matchesPayment = paymentFilter === "Semua status" || item.payment === paymentFilter;

      return matchesDate && matchesSearch && matchesPayment;
    });
  }, [appliedStart, appliedEnd, search, paymentFilter]);

  const transactionSummary = useMemo(() => {
    const paid = filteredTransactions.filter((item) => item.payment === "Lunas");

    const unpaid = filteredTransactions.filter((item) => item.payment === "Belum bayar");

    return {
      total: filteredTransactions.length,
      paid: paid.reduce((sum, item) => sum + item.total, 0),
      unpaid: unpaid.reduce((sum, item) => sum + item.total, 0),
    };
  }, [filteredTransactions]);

  function applyDateFilter() {
    if (!startDate || !endDate) {
      setDateError("Tanggal awal dan akhir harus diisi.");
      return;
    }

    if (startDate > endDate) {
      setDateError("Tanggal awal tidak boleh melebihi tanggal akhir.");
      return;
    }

    setDateError("");
    setAppliedStart(startDate);
    setAppliedEnd(endDate);
  }

  function setPreset(days: number) {
    const end = getToday();
    const date = new Date(end + "T00:00:00");

    if (days === 0) {
      date.setDate(1);
    } else {
      date.setDate(date.getDate() - (days - 1));
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    const start = `${year}-${month}-${day}`;

    setStartDate(start);
    setEndDate(end);
    setAppliedStart(start);
    setAppliedEnd(end);
    setDateError("");
  }

  return (
    <div className="min-h-screen bg-[#F5F0E8]">
      <AdminSidebar />

      <div className="ml-[210px] min-h-screen">
        <AdminTopbar />
        <main className="px-6 pt-6 pb-6 lg:px-8">
          <div className="rounded-2xl border border-[#E8DED0] bg-[#FFFDFA] px-5 pt-3 pb-5 lg:px-7">
            {/* Filter Periode */}
            <div className="mb-4 flex flex-wrap items-end gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-medium text-gray-600">Dari</label>
                <input
                  type="date"
                  value={startDate}
                  max={endDate || undefined}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="h-8 w-[145px] rounded-xl border border-[#E5D9C8] bg-[#F7F3EC] px-3 text-[14px] text-[#192B35] outline-none focus:border-[#C6A46A]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-medium text-gray-600">Sampai</label>
                <input
                  type="date"
                  value={endDate}
                  min={startDate || undefined}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="h-8 w-[145px] rounded-xl border border-[#E5D9C8] bg-[#F7F3EC] px-3 text-[14px] text-[#192B35] outline-none focus:border-[#C6A46A]"
                />
              </div>

              <button
                onClick={applyDateFilter}
                className="h-8 rounded-xl bg-[#C6A46A] px-5 text-[14px] font-semibold text-[#192B35] transition hover:bg-[#B8955D]"
              >
                Terapkan
              </button>
            </div>

            {dateError && <p className="mb-4 text-xs text-red-600">{dateError}</p>}

            {/* Tab Laporan */}
            <div className="mb-5 flex flex-wrap gap-2">
              <button
                onClick={() => setActiveTab("occupancy")}
                className={`rounded-xl border px-5 py-3 text-sm font-semibold transition ${
                  activeTab === "occupancy"
                    ? "border-[#192B35] bg-[#192B35] text-white"
                    : "border-[#E5D9C8] bg-white text-[#192B35] hover:bg-[#F7F3EC]"
                }`}
              >
                Okupansi kamar
              </button>

              <button
                onClick={() => setActiveTab("transactions")}
                className={`rounded-xl border px-5 py-3 text-sm font-semibold transition ${
                  activeTab === "transactions"
                    ? "border-[#192B35] bg-[#192B35] text-white"
                    : "border-[#E5D9C8] bg-white text-[#192B35] hover:bg-[#F7F3EC]"
                }`}
              >
                Transaksi &amp; pembayaran
              </button>
            </div>

            {/* TAB OKUPANSI */}
            {activeTab === "occupancy" && (
              <>
                {/* Ringkasan Okupansi */}
                <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="rounded-2xl border border-[#E8DED0] border-t-[5px] border-t-[#C6A46A] bg-white p-5">
                    <p className="text-3xl font-semibold text-[#192B35]">{averageOccupancy}%</p>
                    <p className="mt-1 text-sm text-gray-500">Rata-rata keterisian</p>
                  </div>

                  <div className="rounded-2xl border border-[#E8DED0] border-t-[5px] border-t-[#A5B1A0] bg-white p-5">
                    <p className="text-3xl font-semibold text-[#192B35]">{dateRange.length}</p>
                    <p className="mt-1 text-sm text-gray-500">Hari dalam periode</p>
                  </div>

                  <div className="rounded-2xl border border-[#E8DED0] border-t-[5px] border-t-[#192B35] bg-white p-5">
                    <p className="text-3xl font-semibold text-[#192B35]">{ACTIVE_ROOMS}</p>
                    <p className="mt-1 text-sm text-gray-500">Kamar aktif</p>
                  </div>
                </div>

                {/* Pencarian */}
                <div className="mb-4 flex flex-wrap items-center gap-3">
                  <input
                    type="text"
                    placeholder="Cari tanggal..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="h-8 w-full max-w-[280px] rounded-xl border border-[#E5D9C8] bg-[#F7F3EC] px-3 text-[12px] outline-none focus:border-[#C6A46A]"
                  />
                </div>

                {/* Tabel Okupansi */}
                <div className="w-full overflow-x-auto">
                  <table className="w-full min-w-[650px] table-fixed text-left text-xs">
                    <thead className="border-b border-[#E5D9C8] text-xs uppercase text-gray-500">
                      <tr>
                        <th className="w-[24%] px-3 py-4 font-medium">Tanggal</th>
                        <th className="w-[15%] px-3 py-4 font-medium">Terisi</th>
                        <th className="w-[18%] px-3 py-4 font-medium">Dipesan</th>
                        <th className="w-[18%] px-3 py-4 font-medium">Kosong</th>
                        <th className="w-[25%] px-3 py-4 font-medium">Keterisian</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-[#E8DED0]">
                      {occupancyData
                        .filter((item) => item.date.includes(search))
                        .map((item) => (
                          <tr key={item.date} className="transition hover:bg-[#FAF7F1]">
                            <td className="px-3 py-4 text-[#192B35]">{item.date}</td>
                            <td className="px-3 py-4 text-[#192B35]">{item.occupied}</td>
                            <td className="px-3 py-4 text-[#192B35]">{item.reserved}</td>
                            <td className="px-3 py-4 text-[#192B35]">{item.empty}</td>
                            <td className="px-3 py-4 text-[#192B35]">{item.percentage}%</td>
                          </tr>
                        ))}

                      {occupancyData.filter((item) => item.date.includes(search)).length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-3 py-10 text-center text-gray-400">
                            Tidak ada data okupansi.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* TAB TRANSAKSI */}
            {activeTab === "transactions" && (
              <>
                {/* Ringkasan Transaksi */}
                <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="rounded-2xl border border-[#E8DED0] border-t-[5px] border-t-[#C6A46A] bg-white p-5">
                    <p className="text-3xl font-semibold text-[#192B35]">
                      {transactionSummary.total}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">Transaksi</p>
                  </div>

                  <div className="rounded-2xl border border-[#E8DED0] border-t-[5px] border-t-[#A5B1A0] bg-white p-5">
                    <p className="text-2xl font-semibold text-[#192B35]">
                      {formatRupiah(transactionSummary.paid)}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">Lunas</p>
                  </div>

                  <div className="rounded-2xl border border-[#E8DED0] border-t-[5px] border-t-[#192B35] bg-white p-5">
                    <p className="text-2xl font-semibold text-[#192B35]">
                      {formatRupiah(transactionSummary.unpaid)}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">Belum dibayar</p>
                  </div>
                </div>

                {/* Pencarian dan Filter Status */}
                <div className="mb-4 flex flex-wrap items-center gap-3">
                  <input
                    type="text"
                    placeholder="Cari..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="h-8 w-full max-w-[280px] rounded-xl border border-[#E5D9C8] bg-[#F7F3EC] px-3 text-[12px] outline-none focus:border-[#C6A46A]"
                  />

                  <select
                    value={paymentFilter}
                    onChange={(e) => setPaymentFilter(e.target.value)}
                    className="h-8 rounded-xl border border-[#E5D9C8] bg-[#F7F3EC] px-3 text-[12px] text-[#192B35] outline-none focus:border-[#C6A46A]"
                  >
                    <option>Semua status</option>
                    <option>Lunas</option>
                    <option>Belum bayar</option>
                  </select>
                </div>

                {/* Tabel Transaksi */}
                <div className="w-full overflow-x-auto">
                  <table className="w-full min-w-[900px] table-fixed text-left text-xs">
                    <thead className="border-b border-[#E5D9C8] text-xs uppercase text-gray-500">
                      <tr>
                        <th className="w-[8%] px-3 py-4 font-medium">ID</th>
                        <th className="w-[16%] px-3 py-4 font-medium">Tamu</th>
                        <th className="w-[11%] px-3 py-4 font-medium">Tipe</th>
                        <th className="w-[23%] px-3 py-4 font-medium">Tanggal</th>
                        <th className="w-[13%] px-3 py-4 font-medium">Status</th>
                        <th className="w-[15%] px-3 py-4 font-medium">Pembayaran</th>
                        <th className="w-[14%] px-3 py-4 font-medium">Total</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-[#E8DED0]">
                      {filteredTransactions.map((item) => (
                        <tr key={item.id} className="transition hover:bg-[#FAF7F1]">
                          <td className="px-3 py-4 text-[#192B35]">{item.id}</td>
                          <td className="px-3 py-4 text-[#192B35]">{item.guest}</td>
                          <td className="px-3 py-4 text-[#192B35]">{item.type}</td>
                          <td className="px-3 py-4 text-[#192B35]">
                            {item.checkIn} → {item.checkOut}
                          </td>
                          <td className="px-3 py-4">
                            <span
                              className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs ${
                                item.status === "Check-in"
                                  ? "bg-[#E2E9E0] text-[#49664E]"
                                  : item.status === "Dipesan"
                                    ? "bg-[#F4E7C9] text-[#8A6A2E]"
                                    : "bg-[#EEEAE3] text-[#68645D]"
                              }`}
                            >
                              {item.status}
                            </span>
                          </td>
                          <td className="px-3 py-4">
                            <span
                              className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs ${
                                item.payment === "Lunas"
                                  ? "bg-[#E2E9E0] text-[#49664E]"
                                  : "bg-[#F3DAD5] text-[#A45E52]"
                              }`}
                            >
                              {item.payment}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-[#192B35]">
                            {formatRupiah(item.total)}
                          </td>
                        </tr>
                      ))}

                      {filteredTransactions.length === 0 && (
                        <tr>
                          <td colSpan={7} className="px-3 py-10 text-center text-gray-400">
                            Tidak ada transaksi pada periode ini.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            <div className="mt-5 border-t border-[#E8DED0] pt-4">
              <p className="text-[11px] text-gray-400">
                Periode laporan: {formatDate(appliedStart)} – {formatDate(appliedEnd)}
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

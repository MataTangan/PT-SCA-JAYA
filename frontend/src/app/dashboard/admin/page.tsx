"use client";

import AdminSidebar from "@/components/admin/Sidebar";
import AdminTopbar from "@/components/admin/Topbar";

const transactions = [
  {
    code: "TRX-001",
    guest: "Andi Pratama",
    date: "11 Nov 2026",
    amount: "Rp900.000",
    status: "Lunas",
  },
  {
    code: "TRX-002",
    guest: "Siti Rahma",
    date: "11 Nov 2026",
    amount: "Rp750.000",
    status: "Lunas",
  },
  {
    code: "TRX-003",
    guest: "Budi Santoso",
    date: "10 Nov 2026",
    amount: "Rp1.500.000",
    status: "Belum Lunas",
  },
  {
    code: "TRX-004",
    guest: "Dewi Anggraini",
    date: "10 Nov 2026",
    amount: "Rp450.000",
    status: "Lunas",
  },
];

const roomTypes = [
  { name: "Superior", total: 15, occupied: 9, available: 6 },
  { name: "Deluxe", total: 15, occupied: 8, available: 7 },
  { name: "Suite", total: 10, occupied: 5, available: 5 },
];

const summaryCards = [
  { label: "Total kamar", value: "40", color: "#C6A46A" },
  { label: "Total reservasi", value: "128", color: "#A5B1A0" },
  { label: "Kamar tersedia", value: "18", color: "#192B35" },
  { label: "Kamar terisi", value: "22", color: "#A5B1A0" },
  { label: "Okupansi hari ini", value: "55%", color: "#C6A46A" },
];

export default function AdminDashboard() {
  const occupancy = 55;

  return (
    <div className="min-h-screen bg-[#F5F0E8] text-[#343A3D]">
      <AdminSidebar />

      <div className="ml-[210px] min-h-screen">
        <AdminTopbar />

        <main className="px-8 pt-8 pb-16">
          {/* Ringkasan Operasional */}
          <section className="mb-9">
            <div className="mb-6">
              <h1 className="font-heading text-3xl font-semibold text-[#192B35]">
                Ringkasan Operasional
              </h1>
              <p className="mt-1 text-[13px] text-gray-500">Ringkasan operasional hotel.</p>
            </div>

            {/* Kartu Ringkasan */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {summaryCards.map((card) => (
                <div
                  key={card.label}
                  className="rounded-[18px] border border-[#E2D8C8] bg-[#FFFDFA] px-3 py-3"
                  style={{ borderTop: `5px solid ${card.color}` }}
                >
                  <p className="font-heading text-2xl font-semibold text-[#192B35]">{card.value}</p>

                  <p className="mt-2 text-[14px] text-gray-600">{card.label}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Okupansi dan Ringkasan Transaksi */}
          <section className="grid grid-cols-1 gap-6 pb-8 lg:grid-cols-2">
            {/* Tingkat Okupansi */}
            <div className="rounded-[20px] border border-[#E2D8C8] bg-[#FFFDFA] p-7">
              <h2 className="font-heading text-2xl font-semibold text-[#192B35]">
                Tingkat Okupansi
              </h2>
              <p className="mt-1 text-sm text-gray-500">Persentase kamar yang sedang terisi.</p>

              <div className="mt-8 flex items-end gap-3">
                <span className="font-heading text-5xl text-[#192B35]">{occupancy}%</span>
                <span className="mb-2 text-sm text-gray-500">22 dari 40 kamar</span>
              </div>

              <div className="mt-6 h-3 w-full rounded-full bg-[#E3DED5]">
                <div className="h-3 rounded-full bg-[#C6A46A]" style={{ width: `${occupancy}%` }} />
              </div>

              <div className="mt-3 flex justify-between text-xs text-gray-500">
                <span>Kamar terisi</span>
                <span>Kamar belum terisi</span>
              </div>
            </div>

            {/* Ringkasan Transaksi */}
            <div className="rounded-[20px] border border-[#E2D8C8] bg-[#FFFDFA] p-7">
              <h2 className="font-heading text-2xl font-semibold text-[#192B35]">
                Ringkasan Transaksi
              </h2>
              <p className="mt-1 text-sm text-gray-500">Total pembayaran yang tercatat.</p>

              <p className="mt-6 text-3xl font-semibold text-[#192B35]">Rp24.850.000</p>
              <p className="mt-1 text-xs text-gray-400">Total pendapatan</p>

              <div className="mt-7 grid grid-cols-2 gap-4 border-t border-[#E2D8C8] pt-5">
                <div>
                  <p className="text-sm text-gray-500">Lunas</p>
                  <p className="mt-1 text-xl font-semibold text-[#687D68]">35</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Belum Lunas</p>
                  <p className="mt-1 text-xl font-semibold text-[#B28B4E]">5</p>
                </div>
              </div>
            </div>
          </section>

          {/* Transaksi Terbaru */}
          <section className="mt-9">
            <div className="mb-4">
              <h2 className="text-base font-semibold text-[#192B35]">Transaksi Terbaru</h2>
            </div>

            <div className="overflow-x-auto rounded-xl border border-[#E2DDD4] bg-white">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#F9F7F2] text-xs text-gray-500">
                  <tr>
                    <th className="px-5 py-4 font-medium">Kode Transaksi</th>
                    <th className="px-5 py-4 font-medium">Nama Tamu</th>
                    <th className="px-5 py-4 font-medium">Tanggal</th>
                    <th className="px-5 py-4 font-medium">Jumlah</th>
                    <th className="px-5 py-4 font-medium">Status Pembayaran</th>
                  </tr>
                </thead>

                <tbody>
                  {transactions.map((item) => (
                    <tr key={item.code} className="border-t border-[#EEEAE3] hover:bg-[#FAF9F6]">
                      <td className="px-5 py-4 font-medium text-[#192B35]">{item.code}</td>
                      <td className="px-5 py-4">{item.guest}</td>
                      <td className="px-5 py-4 text-gray-500">{item.date}</td>
                      <td className="px-5 py-4 font-medium">{item.amount}</td>
                      <td className="px-5 py-4">
                        <span
                          className={item.status === "Lunas" ? "text-[#687D68]" : "text-[#B28B4E]"}
                        >
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

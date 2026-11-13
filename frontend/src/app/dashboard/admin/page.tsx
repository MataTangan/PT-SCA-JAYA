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
    <div className="min-h-screen w-full overflow-x-hidden bg-[#F5F0E8] text-[#343A3D]">
      <AdminSidebar />

      {/* Konten utama */}
      <div className="min-h-screen min-w-0 w-full md:ml-[210px] md:w-[calc(100%-210px)]">
        <AdminTopbar />

        <main className="w-full min-w-0 px-4 pb-10 pt-[84px] sm:px-6 md:px-8 md:pt-[74px] md:pb-16">
          {/* Ringkasan Operasional */}
          <section className="mb-8 md:mb-9">
            <div className="mb-5 md:mb-6">
              <h1 className="font-heading text-2xl font-semibold text-[#192B35] sm:text-3xl">
                Ringkasan Operasional
              </h1>

              <p className="mt-1 text-xs text-gray-500 sm:text-[13px]">
                Ringkasan operasional hotel.
              </p>
            </div>

            {/* Kartu Ringkasan */}
            <div className="grid min-w-0 grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
              {summaryCards.map((card) => (
                <div
                  key={card.label}
                  className="min-w-0 rounded-[16px] border border-[#E2D8C8] bg-[#FFFDFA] px-3 py-3 sm:px-4 sm:py-4 md:rounded-[18px]"
                  style={{ borderTop: `5px solid ${card.color}` }}
                >
                  <p className="font-heading text-2xl font-semibold text-[#192B35] sm:text-3xl">
                    {card.value}
                  </p>

                  <p className="mt-1.5 text-xs leading-relaxed text-gray-600 sm:mt-2 sm:text-sm">
                    {card.label}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Okupansi dan Ringkasan Transaksi */}
          <section className="grid min-w-0 grid-cols-1 gap-4 pb-6 lg:grid-cols-2 lg:gap-6">
            {/* Tingkat Okupansi */}
            <div className="min-w-0 rounded-[18px] border border-[#E2D8C8] bg-[#FFFDFA] p-4 sm:p-6 md:rounded-[20px] md:p-7">
              <h2 className="font-heading text-xl font-semibold text-[#192B35] sm:text-2xl">
                Tingkat Okupansi
              </h2>

              <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                Persentase kamar yang sedang terisi.
              </p>

              <div className="mt-6 flex flex-wrap items-end gap-2 sm:mt-8 sm:gap-3">
                <span className="font-heading text-4xl text-[#192B35] sm:text-5xl">
                  {occupancy}%
                </span>

                <span className="mb-1 text-xs text-gray-500 sm:mb-2 sm:text-sm">
                  22 dari 40 kamar
                </span>
              </div>

              <div className="mt-5 h-3 w-full overflow-hidden rounded-full bg-[#E3DED5] sm:mt-6">
                <div className="h-3 rounded-full bg-[#C6A46A]" style={{ width: `${occupancy}%` }} />
              </div>

              <div className="mt-3 flex justify-between gap-2 text-[10px] text-gray-500 sm:text-xs">
                <span>Kamar terisi</span>
                <span>Kamar belum terisi</span>
              </div>
            </div>

            {/* Ringkasan Transaksi */}
            <div className="min-w-0 rounded-[18px] border border-[#E2D8C8] bg-[#FFFDFA] p-4 sm:p-6 md:rounded-[20px] md:p-7">
              <h2 className="font-heading text-xl font-semibold text-[#192B35] sm:text-2xl">
                Ringkasan Transaksi
              </h2>

              <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                Total pembayaran yang tercatat.
              </p>

              <p className="mt-6 break-words text-2xl font-semibold text-[#192B35] sm:text-3xl">
                Rp24.850.000
              </p>

              <p className="mt-1 text-xs text-gray-400">Total pendapatan</p>

              <div className="mt-6 grid grid-cols-2 gap-3 border-t border-[#E2D8C8] pt-4 sm:mt-7 sm:gap-4 sm:pt-5">
                <div>
                  <p className="text-xs text-gray-500 sm:text-sm">Lunas</p>

                  <p className="mt-1 text-xl font-semibold text-[#687D68]">35</p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 sm:text-sm">Belum Lunas</p>

                  <p className="mt-1 text-xl font-semibold text-[#B28B4E]">5</p>
                </div>
              </div>
            </div>
          </section>

          {/* Transaksi Terbaru */}
          <section className="mt-5 min-w-0 md:mt-9">
            <div className="mb-4">
              <h2 className="text-base font-semibold text-[#192B35]">Transaksi Terbaru</h2>
            </div>

            <div className="w-full overflow-x-auto rounded-xl border border-[#E2DDD4] bg-white">
              <table className="w-full min-w-[650px] text-left text-sm">
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

"use client";

import AdminSidebar from "@/components/admin/Sidebar";
import AdminTopbar from "@/components/admin/Topbar";

const transactions = [
  {
    code: "TRX-001",
    guest: "Andi Pratama",
    date: "11 Nov 2026",
    amount: "Rp900.000",
    status: "Paid",
  },
  {
    code: "TRX-002",
    guest: "Siti Rahma",
    date: "11 Nov 2026",
    amount: "Rp750.000",
    status: "Paid",
  },
  {
    code: "TRX-003",
    guest: "Budi Santoso",
    date: "10 Nov 2026",
    amount: "Rp1.500.000",
    status: "Unpaid",
  },
  {
    code: "TRX-004",
    guest: "Dewi Anggraini",
    date: "10 Nov 2026",
    amount: "Rp450.000",
    status: "Paid",
  },
];

const summaryCards = [
  { label: "Total Rooms", value: "40", color: "#C6A46A" },
  { label: "Total Reservations", value: "128", color: "#A5B1A0" },
  { label: "Available Rooms", value: "18", color: "#192B35" },
  { label: "Occupied Rooms", value: "22", color: "#A5B1A0" },
  { label: "Today's Occupancy", value: "55%", color: "#C6A46A" },
];

export default function AdminDashboard() {
  const occupancy = 55;

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#F5F0E8] text-[#343A3D]">
      <AdminSidebar />

      <div className="min-h-screen min-w-0 w-full md:ml-[210px] md:w-[calc(100%-210px)]">
        <AdminTopbar />

        {/* Spacing for the fixed Topbar */}
        <div className="h-[60px] md:h-[50px]" aria-hidden="true" />

        <main className="w-full min-w-0 space-y-7 px-4 pb-10 pt-5 sm:space-y-8 sm:px-6 md:px-8 md:pb-16 md:pt-6">
          {/* Welcome Banner */}
          <section className="relative overflow-hidden rounded-[28px] bg-[#192B35] px-6 py-10 text-white shadow-md sm:px-10 sm:py-8">
            <div className="relative z-10 max-w-4xl">
              <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-[#C6A46A]">
                SCA JAYA MANAGEMENT
              </p>

              <h1 className="mb-2 text-3xl font-bold leading-tight sm:text-4xl md:text-4xl">
                Welcome, Administrator!
              </h1>

              <p className="mb-8 max-w-3xl text-base leading-relaxed text-white/80 sm:text-sm">
                Easily manage hotel operations, room data, users, and hotel activity reports through
                this dashboard.
              </p>

              <div className="flex flex-col gap-3 sm:flex-row">
                <a
                  href="/dashboard/admin/rooms"
                  className="rounded-xl bg-[#C6A46A] px-6 py-4 text-center font-semibold text-[#192B35] transition hover:bg-[#d5b77f]"
                >
                  Room Management
                </a>

                <a
                  href="/dashboard/admin/reports"
                  className="rounded-xl border border-white/30 px-6 py-4 text-center font-medium text-white transition hover:bg-white/10"
                >
                  View Reports
                </a>
              </div>
            </div>

            <div className="pointer-events-none absolute -right-16 -top-28 h-80 w-80 rounded-full border border-[#C6A46A]/20" />
            <div className="pointer-events-none absolute -right-8 -top-16 h-64 w-64 rounded-full border border-[#C6A46A]/20" />
          </section>

          {/* Operational Summary */}
          <section className="min-w-0">
            <div className="mb-5 md:mb-6">
              <h2 className="font-heading text-2xl font-semibold text-[#192B35] sm:text-3xl">
                Operational Summary
              </h2>

              <p className="mt-1 text-xs text-gray-500 sm:text-[13px]">
                Overview of hotel operations.
              </p>
            </div>

            {/* Summary Cards */}
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

          {/* Occupancy and Transaction Summary */}
          <section className="grid min-w-0 grid-cols-1 gap-4 pb-6 lg:grid-cols-2 lg:gap-6">
            {/* Occupancy Rate */}
            <div className="min-w-0 rounded-[18px] border border-[#E2D8C8] bg-[#FFFDFA] p-4 sm:p-6 md:rounded-[20px] md:p-7">
              <h2 className="font-heading text-xl font-semibold text-[#192B35] sm:text-2xl">
                Occupancy Rate
              </h2>

              <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                Percentage of rooms currently occupied.
              </p>

              <div className="mt-6 flex flex-wrap items-end gap-2 sm:mt-8 sm:gap-3">
                <span className="font-heading text-4xl text-[#192B35] sm:text-5xl">
                  {occupancy}%
                </span>

                <span className="mb-1 text-xs text-gray-500 sm:mb-2 sm:text-sm">
                  22 out of 40 rooms
                </span>
              </div>

              <div className="mt-5 h-3 w-full overflow-hidden rounded-full bg-[#E3DED5] sm:mt-6">
                <div className="h-3 rounded-full bg-[#C6A46A]" style={{ width: `${occupancy}%` }} />
              </div>

              <div className="mt-3 flex justify-between gap-2 text-[10px] text-gray-500 sm:text-xs">
                <span>Occupied Rooms</span>
                <span>Unoccupied Rooms</span>
              </div>
            </div>

            {/* Transaction Summary */}
            <div className="min-w-0 rounded-[18px] border border-[#E2D8C8] bg-[#FFFDFA] p-4 sm:p-6 md:rounded-[20px] md:p-7">
              <h2 className="font-heading text-xl font-semibold text-[#192B35] sm:text-2xl">
                Transaction Summary
              </h2>

              <p className="mt-1 text-xs text-gray-500 sm:text-sm">Total recorded payments.</p>

              <p className="mt-6 break-words text-2xl font-semibold text-[#192B35] sm:text-3xl">
                Rp24.850.000
              </p>

              <p className="mt-1 text-xs text-gray-400">Total Revenue</p>

              <div className="mt-6 grid grid-cols-2 gap-3 border-t border-[#E2D8C8] pt-4 sm:mt-7 sm:gap-4 sm:pt-5">
                <div>
                  <p className="text-xs text-gray-500 sm:text-sm">Paid</p>
                  <p className="mt-1 text-xl font-semibold text-[#687D68]">35</p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 sm:text-sm">Unpaid</p>
                  <p className="mt-1 text-xl font-semibold text-[#B28B4E]">5</p>
                </div>
              </div>
            </div>
          </section>

          {/* Recent Transactions */}
          <section className="min-w-0">
            <div className="mb-4">
              <h2 className="text-base font-semibold text-[#192B35]">Recent Transactions</h2>
            </div>

            <div className="w-full overflow-x-auto rounded-xl border border-[#E2DDD4] bg-white">
              <table className="w-full min-w-[650px] text-left text-sm">
                <thead className="bg-[#F9F7F2] text-xs text-gray-500">
                  <tr>
                    <th className="px-5 py-4 font-medium">Transaction Code</th>
                    <th className="px-5 py-4 font-medium">Guest Name</th>
                    <th className="px-5 py-4 font-medium">Date</th>
                    <th className="px-5 py-4 font-medium">Amount</th>
                    <th className="px-5 py-4 font-medium">Payment Status</th>
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
                          className={item.status === "Paid" ? "text-[#687D68]" : "text-[#B28B4E]"}
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

"use client";

import Link from "next/link";
import Sidebar from "@/components/receptionist/Sidebar";
import Topbar from "@/components/receptionist/Topbar";

// ==========================================
// DATA RINGKASAN AKTIVITAS
// ==========================================

const statistics = [
  {
    title: "Total Reservations",
    value: "24",
    detail: "Today's reservations",
    accent: "border-t-[#C6A46A]",
  },
  {
    title: "Today's Check-ins",
    value: "08",
    detail: "Guests arriving",
    accent: "border-t-[#A5B1A0]",
  },
  {
    title: "Currently Staying",
    value: "16",
    detail: "Active guests",
    accent: "border-t-[#192B35]",
  },
  {
    title: "Today's Check-outs",
    value: "05",
    detail: "Guests departing",
    accent: "border-t-[#C9897E]",
  },
];

// ==========================================
// DATA STATUS KAMAR
// ==========================================

const roomStatuses = [
  {
    title: "Available Rooms",
    value: 12,
    description: "Ready for occupancy",
    color: "bg-green-100 text-green-700",
    dot: "bg-green-500",
    accent: "border-t-[#A5B1A0]",
  },
  {
    title: "Reserved Rooms",
    value: 8,
    description: "Already reserved",
    color: "bg-amber-100 text-amber-700",
    dot: "bg-amber-500",
    accent: "border-t-[#C6A46A]",
  },
  {
    title: "Occupied Rooms",
    value: 15,
    description: "Currently occupied by guests",
    color: "bg-blue-100 text-blue-700",
    dot: "bg-[#192B35]",
    accent: "border-t-[#192B35]",
  },
];

// ==========================================
// DATA RESERVASI TERBARU
// ==========================================

const reservations = [
  {
    code: "RSV-001",
    guest: "Andi Pratama",
    room: "Deluxe Room",
    date: "09 Nov 2026",
    status: "Confirmed",
  },
  {
    code: "RSV-002",
    guest: "Siti Rahma",
    room: "Superior Room",
    date: "09 Nov 2026",
    status: "Pending",
  },
  {
    code: "RSV-003",
    guest: "Budi Santoso",
    room: "Suite Room",
    date: "09 Nov 2026",
    status: "Checked-in",
  },
];

// ==========================================
// DASHBOARD RESEPSIONIS
// ==========================================

export default function ReceptionistDashboard() {
  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#F5F0E8] text-[#343A3D]">
      <Sidebar />

      {/* Konten Utama */}
      <div className="min-h-screen min-w-0 w-full md:ml-[210px] md:w-[calc(100%-210px)]">
        <Topbar />

        {/* Spacer Topbar Fixed */}
        <div className="h-[60px] md:h-[50px]" aria-hidden="true" />

        <main className="w-full min-w-0 space-y-7 px-4 pb-10 pt-5 sm:space-y-8 sm:px-6 md:px-8 md:pb-16 md:pt-6">
          {/* ==================================
              WELCOME SECTION
          ================================== */}

          <section className="relative overflow-hidden rounded-2xl bg-[#192B35] p-5 text-white shadow-sm sm:p-7 md:p-8">
            <div className="relative z-10">
              <p className="mb-2 text-[10px] font-medium tracking-[0.2em] text-[#C6A46A] sm:text-xs">
                SCA JAYA MANAGEMENT
              </p>

              <h1 className="font-heading text-2xl font-semibold leading-tight sm:text-3xl md:text-4xl">
                Welcome, Receptionist!
              </h1>

              <p className="mt-3 max-w-xl text-xs leading-6 text-white/70 sm:text-sm">
                Manage reservations, guest services, and check-in and check-out activities easily
                through this dashboard.
              </p>

              <div className="mt-5 flex flex-col gap-3 sm:mt-6 sm:flex-row sm:flex-wrap">
                <Link
                  href="/dashboard/receptionist/reservations"
                  className="inline-flex items-center justify-center rounded-lg bg-[#C6A46A] px-5 py-3 text-xs font-semibold text-[#192B35] transition hover:bg-[#d8b77e] sm:text-sm"
                >
                  Manage Reservations
                </Link>

                <Link
                  href="/dashboard/receptionist/check-in-out"
                  className="inline-flex items-center justify-center rounded-lg border border-white/30 px-5 py-3 text-xs text-white transition hover:bg-white/10 sm:text-sm"
                >
                  Check-in / Check-out
                </Link>
              </div>
            </div>

            {/* Dekorasi */}
            <div className="pointer-events-none absolute -right-12 -top-20 h-64 w-64 rounded-full border border-[#C6A46A]/20" />
            <div className="pointer-events-none absolute -right-4 -top-12 h-48 w-48 rounded-full border border-[#C6A46A]/30" />
          </section>

          {/* ==================================
              STATISTICS
          ================================== */}

          <section>
            <div className="mb-4 sm:mb-5">
              <h2 className="font-heading text-2xl font-semibold text-[#192B35] sm:text-3xl">
                Activity Overview
              </h2>

              <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                Hotel operational activity information.
              </p>
            </div>

            {/* Empat Kotak Sejajar */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
              {statistics.map((item) => (
                <div
                  key={item.title}
                  className={`min-w-0 rounded-xl border border-[#E5D9C7] border-t-[6px] bg-[#FFFEFC] p-3 shadow-sm transition hover:shadow-md sm:rounded-2xl sm:p-5 ${item.accent}`}
                >
                  <p className="text-[10px] font-bold leading-4 text-gray-700 sm:whitespace-nowrap sm:text-sm">
                    {item.title}
                  </p>

                  <h3 className="mt-3 text-xl font-bold text-[#192B35] sm:mt-5 sm:text-3xl">
                    {item.value}
                  </h3>

                  <p className="mt-1 text-[10px] leading-4 text-gray-400 sm:text-xs">
                    {item.detail}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* ==================================
              ROOM STATUS
          ================================== */}

          <section>
            <div className="mb-4 sm:mb-5">
              <h2 className="font-heading text-2xl font-semibold text-[#192B35] sm:text-3xl">
                Room Status Overview
              </h2>

              <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                Monitor room availability at SCA JAYA Hotel.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
              {roomStatuses.map((room) => (
                <div
                  key={room.title}
                  className={`rounded-xl border border-[#E5D9C7] border-t-[6px] bg-[#FFFEFC] p-4 shadow-sm transition hover:shadow-md sm:rounded-2xl sm:p-5 md:p-6 ${room.accent}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-bold text-gray-700">{room.title}</p>

                    <span className={`h-3 w-3 shrink-0 rounded-full ${room.dot}`} />
                  </div>

                  <h3 className="mt-3 text-3xl font-bold text-[#192B35] sm:mt-4 sm:text-4xl">
                    {room.value}
                  </h3>

                  <span
                    className={`mt-3 inline-block rounded-full px-3 py-1 text-[10px] font-medium sm:text-xs ${room.color}`}
                  >
                    {room.description}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* ==================================
              RESERVASI TERBARU
          ================================== */}

          <section className="min-w-0">
            <div className="mb-4 sm:mb-5">
              <h2 className="font-heading text-xl font-semibold text-[#192B35] sm:text-2xl">
                Recent Reservations
              </h2>
            </div>

            {/* Tabel dapat digeser pada layar HP */}
            <div className="w-full overflow-hidden rounded-xl border border-[#E5D9C7] bg-white sm:rounded-2xl">
              <div className="w-full overflow-x-auto">
                <table className="w-full min-w-[650px] table-fixed border-collapse text-left sm:min-w-0">
                  <thead className="bg-[#FAF8F4] text-gray-500">
                    <tr>
                      <th className="w-[19%] px-2 py-4 text-[10px] font-medium sm:px-4 sm:text-xs">
                        Booking Code
                      </th>
                      <th className="w-[22%] px-2 py-4 text-[10px] font-medium sm:px-4 sm:text-xs">
                        Guest Name
                      </th>
                      <th className="w-[17%] px-2 py-4 text-[10px] font-medium sm:px-4 sm:text-xs">
                        Date
                      </th>
                      <th className="w-[20%] px-2 py-4 text-[10px] font-medium sm:px-4 sm:text-xs">
                        Room Type
                      </th>
                      <th className="w-[22%] px-2 py-4 text-[10px] font-medium sm:px-4 sm:text-xs">
                        Reservation Status
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-[#EAE7E1]">
                    {reservations.map((reservation) => (
                      <tr key={reservation.code} className="transition hover:bg-[#FAF8F4]">
                        <td className="break-words px-2 py-5 text-[10px] font-medium text-[#192B35] sm:px-4 sm:text-xs">
                          {reservation.code}
                        </td>

                        <td className="break-words px-2 py-5 text-[10px] text-[#343A3D] sm:px-4 sm:text-xs">
                          {reservation.guest}
                        </td>

                        <td className="break-words px-2 py-5 text-[10px] text-gray-500 sm:px-4 sm:text-xs">
                          {reservation.date}
                        </td>

                        <td className="break-words px-2 py-5 text-[10px] text-[#343A3D] sm:px-4 sm:text-xs">
                          {reservation.room}
                        </td>

                        <td className="break-words px-2 py-5 text-[10px] font-medium sm:px-4 sm:text-xs">
                          <span
                            className={
                              reservation.status === "Confirmed"
                                ? "text-[#6F8F75]"
                                : reservation.status === "Pending"
                                  ? "text-[#C18B3C]"
                                  : "text-[#547B9B]"
                            }
                          >
                            {reservation.status === "Confirmed"
                              ? "Confirmed"
                              : reservation.status === "Pending"
                                ? "Awaiting Confirmation"
                                : "Currently Staying"}
                          </span>
                        </td>
                      </tr>
                    ))}

                    {reservations.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-3 py-8 text-center text-xs text-gray-400">
                          No recent reservations yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

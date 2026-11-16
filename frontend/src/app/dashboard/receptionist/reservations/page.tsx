"use client";

import { useMemo, useState } from "react";
import Sidebar from "@/components/receptionist/Sidebar";
import Topbar from "@/components/receptionist/Topbar";

// ==========================================
// DATA RESERVASI DUMMY
// ==========================================

const reservationData = [
  {
    code: "RSV-001",
    name: "Andi Pratama",
    email: "andi@email.com",
    room: "Deluxe Room",
    roomNumber: "D-201",
    checkIn: "2026-11-09",
    checkOut: "2026-11-11",
    guests: 2,
    status: "Confirmed",
    payment: "Paid",
  },
  {
    code: "RSV-002",
    name: "Siti Rahma",
    email: "siti@email.com",
    room: "Superior Room",
    roomNumber: "Belum dialokasikan",
    checkIn: "2026-11-09",
    checkOut: "2026-11-10",
    guests: 1,
    status: "Pending",
    payment: "Unpaid",
  },
  {
    code: "RSV-003",
    name: "Budi Santoso",
    email: "budi@email.com",
    room: "Suite Room",
    roomNumber: "SU-301",
    checkIn: "2026-11-10",
    checkOut: "2026-11-12",
    guests: 2,
    status: "Checked-in",
    payment: "Paid",
  },
  {
    code: "RSV-004",
    name: "Dewi Anggraini",
    email: "dewi@email.com",
    room: "Deluxe Room",
    roomNumber: "D-202",
    checkIn: "2026-11-12",
    checkOut: "2026-11-14",
    guests: 3,
    status: "Cancelled",
    payment: "Unpaid",
  },
  {
    code: "RSV-005",
    name: "Rizky Maulana",
    email: "rizky@email.com",
    room: "Superior Room",
    roomNumber: "S-108",
    checkIn: "2026-11-13",
    checkOut: "2026-11-15",
    guests: 2,
    status: "Confirmed",
    payment: "Paid",
  },
];

type Reservation = (typeof reservationData)[number];

// ==========================================
// DATA UNIT KAMAR DUMMY
// ==========================================

const roomUnits = [
  { number: "D-201", type: "Deluxe Room", status: "Available" },
  { number: "D-202", type: "Deluxe Room", status: "Available" },
  { number: "D-203", type: "Deluxe Room", status: "Available" },
  { number: "S-105", type: "Superior Room", status: "Available" },
  { number: "S-108", type: "Superior Room", status: "Available" },
  { number: "S-110", type: "Superior Room", status: "Available" },
  { number: "SU-301", type: "Suite Room", status: "Available" },
  { number: "SU-302", type: "Suite Room", status: "Maintenance" },
];

// ==========================================
// RIWAYAT KUNJUNGAN TAMU DUMMY
// ==========================================

const visitHistory: Record<
  string,
  {
    date: string;
    room: string;
    duration: string;
    status: string;
  }[]
> = {
  "andi@email.com": [
    {
      date: "2026-08-12",
      room: "Deluxe Room",
      duration: "2 malam",
      status: "Completed",
    },
  ],
  "budi@email.com": [
    {
      date: "2026-07-20",
      room: "Suite Room",
      duration: "2 malam",
      status: "Completed",
    },
  ],
};

// ==========================================
// STYLE STATUS
// ==========================================

const statusStyles: Record<string, string> = {
  Confirmed: "bg-green-100 text-green-700",
  Pending: "bg-amber-100 text-amber-700",
  "Checked-in": "bg-blue-100 text-blue-700",
  Cancelled: "bg-red-100 text-red-700",
  Completed: "bg-gray-100 text-gray-600",
};

// ==========================================
// FORMAT TANGGAL
// ==========================================

function formatDate(date: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date + "T00:00:00"));
}

// ==========================================
// HALAMAN MANAJEMEN RESERVASI
// ==========================================

export default function ReservationPage() {
  // State data reservasi
  const [reservations, setReservations] = useState(reservationData);

  // State pencarian dan filter
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [checkInDate, setCheckInDate] = useState("");

  // State modal detail
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);

  // State alokasi kamar
  const [selectedRoom, setSelectedRoom] = useState("");
  const [allocationMessage, setAllocationMessage] = useState("");

  // ==========================================
  // FILTER RESERVASI
  // ==========================================

  const filteredReservations = useMemo(() => {
    return reservations.filter((reservation) => {
      const matchesSearch =
        reservation.code.toLowerCase().includes(search.toLowerCase()) ||
        reservation.name.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = status === "All" || reservation.status === status;

      const matchesDate = !checkInDate || reservation.checkIn === checkInDate;

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [reservations, search, status, checkInDate]);

  // ==========================================
  // RINGKASAN RESERVASI
  // ==========================================

  const total = reservations.length;

  const pending = reservations.filter((r) => r.status === "Pending").length;

  const confirmed = reservations.filter((r) => r.status === "Confirmed").length;

  const checkedIn = reservations.filter((r) => r.status === "Checked-in").length;

  // ==========================================
  // CEK KETERSEDIAAN UNIT KAMAR
  // ==========================================

  const availableRooms = selectedReservation
    ? roomUnits.filter((unit) => {
        // Tipe kamar harus sesuai dengan reservasi
        const sameType = unit.type === selectedReservation.room;

        // Kamar harus berstatus Available
        const isAvailable = unit.status === "Available";

        // Cek apakah kamar sudah digunakan reservasi lain
        const isBooked = reservations.some((reservation) => {
          if (
            reservation.code === selectedReservation.code ||
            reservation.roomNumber !== unit.number ||
            ["Cancelled", "Completed"].includes(reservation.status)
          ) {
            return false;
          }

          // Cek bentrok tanggal reservasi
          return (
            reservation.checkIn < selectedReservation.checkOut &&
            selectedReservation.checkIn < reservation.checkOut
          );
        });

        return sameType && isAvailable && !isBooked;
      })
    : [];

  // ==========================================
  // MEMBUKA DETAIL RESERVASI
  // ==========================================

  function handleOpenDetail(reservation: Reservation) {
    setSelectedReservation(reservation);

    setSelectedRoom(reservation.roomNumber === "Belum dialokasikan" ? "" : reservation.roomNumber);

    setAllocationMessage("");
  }

  // ==========================================
  // KONFIRMASI ALOKASI KAMAR
  // ==========================================

  function handleConfirmAllocation() {
    if (!selectedReservation || !selectedRoom) {
      setAllocationMessage("Silakan pilih unit kamar terlebih dahulu.");
      return;
    }

    if (["Cancelled", "Completed"].includes(selectedReservation.status)) {
      setAllocationMessage("Reservasi ini tidak dapat dialokasikan.");
      return;
    }

    // Pastikan kamar masih tersedia pada saat konfirmasi
    const selectedUnit = availableRooms.find((unit) => unit.number === selectedRoom);

    if (!selectedUnit) {
      setAllocationMessage("Unit kamar tidak tersedia atau sudah digunakan.");
      return;
    }

    const updatedReservation: Reservation = {
      ...selectedReservation,
      roomNumber: selectedRoom,
      status: selectedReservation.status === "Pending" ? "Confirmed" : selectedReservation.status,
    };

    // Perbarui data reservasi
    setReservations((prev) =>
      prev.map((reservation) =>
        reservation.code === selectedReservation.code ? updatedReservation : reservation,
      ),
    );

    // Perbarui data modal
    setSelectedReservation(updatedReservation);

    setAllocationMessage(`Unit kamar ${selectedRoom} berhasil dialokasikan.`);
  }

  // ==========================================
  // RESET FILTER
  // ==========================================

  function handleResetFilter() {
    setSearch("");
    setStatus("All");
    setCheckInDate("");
  }

  // ==========================================
  // TAMPILAN HALAMAN
  // ==========================================

  return (
    <div className="min-h-screen bg-[#F5F0E8]">
      <Sidebar />

      <main className="ml-64 min-h-screen">
        <Topbar />

        <div className="space-y-7 p-8">
          {/* PAGE HEADING */}

          <section>
            <h1 className="mt-2 font-heading text-4xl font-semibold text-[#192B35]">
              Manajemen Reservasi
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Kelola dan pantau seluruh reservasi tamu Arunika Hotel.
            </p>
          </section>

          {/* SUMMARY CARDS */}

          <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {[
              {
                label: "Total Reservasi",
                value: total,
                color: "bg-[#E9EEF1]",
                icon: "▤",
              },
              {
                label: "Menunggu Konfirmasi",
                value: pending,
                color: "bg-[#FBF0D9]",
                icon: "◷",
              },
              {
                label: "Terkonfirmasi",
                value: confirmed,
                color: "bg-[#E5F1E7]",
                icon: "✓",
              },
              {
                label: "Sedang Menginap",
                value: checkedIn,
                color: "bg-[#E5EDF8]",
                icon: "⌂",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">{item.label}</p>

                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg text-[#192B35] ${item.color}`}
                  >
                    {item.icon}
                  </span>
                </div>

                <h2 className="mt-4 text-3xl font-bold text-[#192B35]">{item.value}</h2>
              </div>
            ))}
          </section>

          {/* RESERVATION TABLE */}

          <section className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
            {/* TABLE HEADER */}

            <div className="border-b border-gray-100 p-6">
              <h2 className="font-heading text-2xl font-semibold text-[#192B35]">
                Daftar Reservasi
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Informasi reservasi dan data kunjungan tamu.
              </p>
            </div>

            {/* SEARCH AND FILTER */}

            <div className="flex flex-wrap items-end gap-4 border-b border-gray-100 p-6">
              {/* Search */}

              <div className="min-w-64 flex-1">
                <label className="mb-2 block text-xs font-semibold text-gray-600">
                  Cari Reservasi
                </label>

                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari kode atau nama tamu..."
                  className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#C6A46A] focus:ring-2 focus:ring-[#C6A46A]/20"
                />
              </div>

              {/* Status Filter */}

              <div className="w-48">
                <label className="mb-2 block text-xs font-semibold text-gray-600">
                  Status Reservasi
                </label>

                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-3 text-sm outline-none focus:border-[#C6A46A]"
                >
                  <option value="All">Semua Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Checked-in">Checked-in</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              {/* Date Filter */}

              <div className="w-48">
                <label className="mb-2 block text-xs font-semibold text-gray-600">
                  Tanggal Check-in
                </label>

                <input
                  type="date"
                  value={checkInDate}
                  onChange={(e) => setCheckInDate(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-3 text-sm outline-none focus:border-[#C6A46A]"
                />
              </div>

              {/* Reset Button */}

              <button
                onClick={handleResetFilter}
                className="rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-600 transition hover:bg-gray-50"
              >
                Reset Filter
              </button>
            </div>

            {/* TABLE CONTENT */}

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#FAF8F4] text-xs uppercase tracking-wider text-gray-500">
                  <tr>
                    <th className="px-6 py-4">Kode / Tamu</th>
                    <th className="px-6 py-4">Tipe Kamar</th>
                    <th className="px-6 py-4">Check-in</th>
                    <th className="px-6 py-4">Check-out</th>
                    <th className="px-6 py-4">Tamu</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Pembayaran</th>
                    <th className="px-6 py-4">Aksi</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {filteredReservations.map((reservation) => (
                    <tr key={reservation.code} className="transition hover:bg-[#FAF8F4]">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-[#192B35]">{reservation.code}</p>

                        <p className="mt-1 text-xs text-gray-500">{reservation.name}</p>
                      </td>

                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-700">{reservation.room}</p>

                        <p className="mt-1 text-xs text-gray-400">Kamar {reservation.roomNumber}</p>
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-gray-600">
                        {formatDate(reservation.checkIn)}
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-gray-600">
                        {formatDate(reservation.checkOut)}
                      </td>

                      <td className="px-6 py-4 text-gray-600">{reservation.guests} orang</td>

                      <td className="px-6 py-4">
                        <span
                          className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold ${statusStyles[reservation.status]}`}
                        >
                          {reservation.status}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`text-xs font-semibold ${
                            reservation.payment === "Paid" ? "text-green-700" : "text-amber-700"
                          }`}
                        >
                          {reservation.payment}
                        </span>
                      </td>

                      {/* DETAIL BUTTON */}

                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleOpenDetail(reservation)}
                          className="rounded-lg border border-[#C6A46A] px-4 py-2 text-xs font-semibold text-[#A78348] transition hover:bg-[#C6A46A] hover:text-white"
                        >
                          Detail
                        </button>
                      </td>
                    </tr>
                  ))}

                  {/* EMPTY STATE */}

                  {filteredReservations.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center">
                        <p className="font-medium text-gray-500">Reservasi tidak ditemukan.</p>

                        <p className="mt-1 text-xs text-gray-400">
                          Coba ubah kata kunci atau filter pencarian.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* TABLE FOOTER */}

            <div className="border-t border-gray-100 px-6 py-4">
              <p className="text-xs text-gray-500">
                Menampilkan {filteredReservations.length} dari {total} reservasi
              </p>
            </div>
          </section>
        </div>
      </main>

      {/* ======================================
          DETAIL RESERVATION MODAL
      ====================================== */}

      {selectedReservation && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
          onClick={() => setSelectedReservation(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* MODAL HEADER */}

            <div className="flex items-center justify-between border-b border-gray-100 p-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-[#A78348]">
                  Reservation Detail
                </p>

                <h2 className="mt-1 font-heading text-2xl font-semibold text-[#192B35]">
                  Detail Reservasi
                </h2>

                <p className="mt-1 text-sm text-gray-500">{selectedReservation.code}</p>
              </div>

              <button
                onClick={() => setSelectedReservation(null)}
                className="rounded-lg px-3 py-2 text-xl text-gray-400 hover:bg-gray-100"
                aria-label="Tutup detail reservasi"
              >
                ×
              </button>
            </div>

            <div className="space-y-6 p-6">
              {/* RESERVATION INFORMATION */}

              <section>
                <h3 className="mb-3 font-semibold text-[#192B35]">Informasi Reservasi</h3>

                <div className="grid grid-cols-2 gap-4 rounded-xl bg-[#FAF8F4] p-4">
                  <div>
                    <p className="text-xs text-gray-500">Kode Reservasi</p>

                    <p className="mt-1 font-semibold text-[#192B35]">{selectedReservation.code}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Status Reservasi</p>

                    <span
                      className={`mt-1 inline-block rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[selectedReservation.status]}`}
                    >
                      {selectedReservation.status}
                    </span>
                  </div>
                </div>
              </section>

              {/* GUEST INFORMATION */}

              <section>
                <h3 className="mb-3 font-semibold text-[#192B35]">Informasi Tamu</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Nama Tamu</p>

                    <p className="mt-1 text-sm font-medium text-gray-700">
                      {selectedReservation.name}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Email</p>

                    <p className="mt-1 break-all text-sm font-medium text-gray-700">
                      {selectedReservation.email}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Jumlah Tamu</p>

                    <p className="mt-1 text-sm font-medium text-gray-700">
                      {selectedReservation.guests} orang
                    </p>
                  </div>
                </div>
              </section>

              {/* ROOM INFORMATION */}

              <section>
                <h3 className="mb-3 font-semibold text-[#192B35]">Informasi Kamar</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Tipe Kamar</p>

                    <p className="mt-1 text-sm font-medium text-gray-700">
                      {selectedReservation.room}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Nomor Unit Kamar</p>

                    <p className="mt-1 text-sm font-medium text-gray-700">
                      {selectedReservation.roomNumber}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Check-in</p>

                    <p className="mt-1 text-sm font-medium text-gray-700">
                      {formatDate(selectedReservation.checkIn)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Check-out</p>

                    <p className="mt-1 text-sm font-medium text-gray-700">
                      {formatDate(selectedReservation.checkOut)}
                    </p>
                  </div>
                </div>
              </section>

              {/* ROOM ALLOCATION */}

              <section>
                <h3 className="mb-3 font-semibold text-[#192B35]">Alokasi Unit Kamar</h3>

                <div className="rounded-xl bg-[#FAF8F4] p-4">
                  <p className="mb-3 text-xs text-gray-500">
                    Pilih unit kamar yang tersedia untuk tipe{" "}
                    <span className="font-semibold text-[#192B35]">{selectedReservation.room}</span>
                  </p>

                  <select
                    value={selectedRoom}
                    onChange={(e) => {
                      setSelectedRoom(e.target.value);
                      setAllocationMessage("");
                    }}
                    disabled={["Cancelled", "Completed"].includes(selectedReservation.status)}
                    className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#C6A46A] disabled:cursor-not-allowed disabled:bg-gray-100"
                  >
                    <option value="">Pilih Nomor Kamar</option>

                    {availableRooms.map((unit) => (
                      <option key={unit.number} value={unit.number}>
                        {unit.number} - {unit.type}
                      </option>
                    ))}
                  </select>

                  {availableRooms.length === 0 && (
                    <p className="mt-2 text-xs text-red-600">
                      Tidak ada unit kamar tersedia untuk tanggal tersebut.
                    </p>
                  )}

                  {selectedReservation.roomNumber !== "Belum dialokasikan" && (
                    <p className="mt-3 text-xs text-gray-500">
                      Unit kamar saat ini:{" "}
                      <span className="font-semibold text-[#192B35]">
                        {selectedReservation.roomNumber}
                      </span>
                    </p>
                  )}

                  {allocationMessage && (
                    <p
                      className={`mt-3 text-sm font-medium ${
                        allocationMessage.includes("berhasil") ? "text-green-700" : "text-red-600"
                      }`}
                    >
                      {allocationMessage}
                    </p>
                  )}

                  <button
                    onClick={handleConfirmAllocation}
                    disabled={
                      !selectedRoom ||
                      ["Cancelled", "Completed"].includes(selectedReservation.status)
                    }
                    className="mt-4 w-full rounded-lg bg-[#192B35] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#34464E] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Konfirmasi Alokasi Kamar
                  </button>
                </div>
              </section>

              {/* PAYMENT INFORMATION */}

              <section>
                <h3 className="mb-3 font-semibold text-[#192B35]">Informasi Pembayaran</h3>

                <p
                  className={`text-sm font-semibold ${
                    selectedReservation.payment === "Paid" ? "text-green-700" : "text-amber-700"
                  }`}
                >
                  {selectedReservation.payment}
                </p>
              </section>

              {/* GUEST VISIT HISTORY */}

              <section>
                <h3 className="mb-3 font-semibold text-[#192B35]">Riwayat Kunjungan Tamu</h3>

                {visitHistory[selectedReservation.email]?.length ? (
                  <div className="overflow-x-auto rounded-xl border border-gray-100">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-[#FAF8F4] text-xs text-gray-500">
                        <tr>
                          <th className="px-4 py-3">Tanggal</th>

                          <th className="px-4 py-3">Tipe Kamar</th>

                          <th className="px-4 py-3">Durasi</th>

                          <th className="px-4 py-3">Status</th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-gray-100">
                        {visitHistory[selectedReservation.email].map((history, index) => (
                          <tr key={index}>
                            <td className="whitespace-nowrap px-4 py-3 text-gray-600">
                              {formatDate(history.date)}
                            </td>

                            <td className="px-4 py-3 text-gray-700">{history.room}</td>

                            <td className="px-4 py-3 text-gray-600">{history.duration}</td>

                            <td className="px-4 py-3">
                              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                                {history.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-gray-200 p-5 text-center">
                    <p className="text-sm text-gray-500">Belum ada riwayat kunjungan sebelumnya.</p>
                  </div>
                )}
              </section>
            </div>

            {/* MODAL FOOTER */}

            <div className="flex justify-end border-t border-gray-100 p-5">
              <button
                onClick={() => setSelectedReservation(null)}
                className="rounded-lg bg-[#192B35] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#34464E]"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

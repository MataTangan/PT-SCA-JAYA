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
    roomNumber: "Not Allocated",
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
// RIWAYAT KUNJUNGAN TAMU
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
      duration: "2 nights",
      status: "Completed",
    },
  ],
  "budi@email.com": [
    {
      date: "2026-07-20",
      room: "Suite Room",
      duration: "2 nights",
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
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date + "T00:00:00"));
}

// ==========================================
// HALAMAN MANAJEMEN RESERVASI
// ==========================================

export default function ReservationPage() {
  const [reservations, setReservations] = useState(reservationData);

  // Pencarian dan filter
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [checkInDate, setCheckInDate] = useState("");

  // Modal detail
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);

  // Alokasi kamar
  const [selectedRoom, setSelectedRoom] = useState("");
  const [allocationMessage, setAllocationMessage] = useState("");

  // ==========================================
  // FILTER RESERVASI
  // ==========================================

  const filteredReservations = useMemo(() => {
    return reservations.filter((reservation) => {
      const keyword = search.toLowerCase();

      const matchesSearch =
        reservation.code.toLowerCase().includes(keyword) ||
        reservation.name.toLowerCase().includes(keyword);

      const matchesStatus = status === "All" || reservation.status === status;

      const matchesDate = !checkInDate || reservation.checkIn === checkInDate;

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [reservations, search, status, checkInDate]);

  // ==========================================
  // RINGKASAN RESERVASI
  // ==========================================

  const total = reservations.length;

  const pending = reservations.filter((reservation) => reservation.status === "Pending").length;

  const confirmed = reservations.filter((reservation) => reservation.status === "Confirmed").length;

  const checkedIn = reservations.filter(
    (reservation) => reservation.status === "Checked-in",
  ).length;

  const summaryCards = [
    {
      label: "Total Reservations",
      value: total,
      accent: "border-t-[#C6A46A]",
    },
    {
      label: "Awaiting Confirmation",
      value: pending,
      accent: "border-t-[#A5B1A0]",
    },
    {
      label: "Confirmed",
      value: confirmed,
      accent: "border-t-[#192B35]",
    },
    {
      label: "Currently Staying",
      value: checkedIn,
      accent: "border-t-[#C9897E]",
    },
  ];

  // ==========================================
  // RIWAYAT KUNJUNGAN YANG DIPILIH
  // ==========================================

  const selectedVisitHistory = selectedReservation
    ? (visitHistory[selectedReservation.email] ?? [])
    : [];

  // ==========================================
  // KETERSEDIAAN UNIT KAMAR
  // ==========================================

  const availableRooms = selectedReservation
    ? roomUnits.filter((unit) => {
        const sameType = unit.type === selectedReservation.room;
        const isAvailable = unit.status === "Available";

        const isBooked = reservations.some((reservation) => {
          if (
            reservation.code === selectedReservation.code ||
            reservation.roomNumber !== unit.number ||
            ["Cancelled", "Completed"].includes(reservation.status)
          ) {
            return false;
          }

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

    setSelectedRoom(reservation.roomNumber === "Not Allocated" ? "" : reservation.roomNumber);

    setAllocationMessage("");
  }

  // ==========================================
  // KONFIRMASI ALOKASI KAMAR
  // ==========================================

  function handleConfirmAllocation() {
    if (!selectedReservation || !selectedRoom) {
      setAllocationMessage("Please select a room unit first.");
      return;
    }

    if (["Cancelled", "Completed"].includes(selectedReservation.status)) {
      setAllocationMessage("This reservation cannot be allocated.");
      return;
    }

    const selectedUnit = availableRooms.find((unit) => unit.number === selectedRoom);

    if (!selectedUnit) {
      setAllocationMessage("The selected room unit is unavailable or already occupied.");
      return;
    }

    const updatedReservation: Reservation = {
      ...selectedReservation,
      roomNumber: selectedRoom,
      status: selectedReservation.status === "Pending" ? "Confirmed" : selectedReservation.status,
    };

    setReservations((previous) =>
      previous.map((reservation) =>
        reservation.code === selectedReservation.code ? updatedReservation : reservation,
      ),
    );

    setSelectedReservation(updatedReservation);
    setAllocationMessage(`Room ${selectedRoom} has been successfully allocated.`);
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
    <div className="min-h-screen w-full overflow-x-hidden bg-[#F5F0E8] text-[#343A3D]">
      <Sidebar />

      <div className="min-h-screen min-w-0 w-full md:ml-[210px] md:w-[calc(100%-210px)]">
        <Topbar />

        <div className="h-[60px] md:h-[50px]" aria-hidden="true" />

        <main className="w-full min-w-0 space-y-7 px-4 pb-10 pt-5 sm:px-6 md:px-8 md:pb-16 md:pt-6">
          {/* PAGE HEADING */}

          <section>
            <h1 className="font-heading text-2xl font-semibold text-[#192B35] sm:text-3xl md:text-4xl">
              Reservation Management
            </h1>

            <p className="mt-2 text-xs text-gray-500 sm:text-sm">
              Manage and monitor all guest reservations at SCA JAYA Hotel.
            </p>
          </section>

          {/* SUMMARY CARDS */}

          <section className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {summaryCards.map((item) => (
              <div
                key={item.label}
                className={`min-w-0 rounded-xl border border-[#E5D9C7] border-t-[5px] bg-[#FFFEFC] p-3 shadow-sm transition hover:shadow-md sm:rounded-2xl sm:p-5 md:p-4 ${item.accent}`}
              >
                <p className="text-[10px] leading-4 font-bold text-gray-700 sm:whitespace-nowrap sm:text-xs md:text-sm">
                  {item.label}
                </p>

                <h2 className="mt-3 text-xl font-bold text-[#192B35] sm:mt-5 sm:text-3xl md:text-4xl">
                  {item.value}
                </h2>
              </div>
            ))}
          </section>

          {/* DAFTAR RESERVASI */}

          <div className="min-w-0 space-y-2">
            <h2 className="font-heading text-2xl font-semibold text-[#192B35] sm:text-3xl md:text-[27px]">
              Reservation List
            </h2>

            <section className="min-w-0 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
              {/* SEARCH AND FILTER */}

              <div className="grid grid-cols-1 gap-3 border-b border-gray-100 p-4 sm:grid-cols-2 sm:gap-2 sm:p-5 lg:grid-cols-[180px_130px_140px_80px] lg:items-end md:p-6">
                <div className="min-w-0">
                  <label className="mb-2 block text-xs font-semibold text-gray-600">
                    Search Reservations
                  </label>

                  <input
                    type="text"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search by code or guest name..."
                    className="h-9 w-full rounded-lg border border-gray-200 px-3 text-[12px] outline-none transition focus:border-[#C6A46A] focus:ring-2 focus:ring-[#C6A46A]/20 lg:h-8 lg:w-45 lg:px-2"
                  />
                </div>

                <div className="min-w-0">
                  <label className="mb-2 block text-xs font-semibold text-gray-600">
                    Reservation Status
                  </label>

                  <select
                    value={status}
                    onChange={(event) => setStatus(event.target.value)}
                    className="h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-[12px] outline-none focus:border-[#C6A46A] lg:h-8 lg:w-30 lg:px-2"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Checked-in">Checked-in</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="min-w-0">
                  <label className="mb-2 block text-xs font-semibold text-gray-600">
                    Check-in Date
                  </label>

                  <input
                    type="date"
                    value={checkInDate}
                    onChange={(event) => setCheckInDate(event.target.value)}
                    className="h-9 w-full rounded-lg border border-gray-200 px-3 text-[12px] outline-none focus:border-[#C6A46A] lg:h-8 lg:w-33 lg:px-2"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleResetFilter}
                  className="h-9 w-full rounded-lg border border-gray-200 px-2 text-[12px] text-gray-600 transition hover:bg-gray-50 lg:h-8 lg:w-20"
                >
                  Reset Filters
                </button>
              </div>

              {/* TABLE */}

              <div className="w-full overflow-x-auto">
                <table className="w-full min-w-[1055px] table-fixed text-left text-[11px] md:min-w-0">
                  <thead className="border-b border-[#E2D8C8] text-[10px] uppercase text-gray-500">
                    <tr>
                      <th className="w-[18%] px-3 py-3 font-medium">Code & Guest</th>

                      <th className="w-[16%] px-3 py-3 font-medium">Room Type & Unit</th>

                      <th className="w-[12%] px-3 py-3 font-medium">Check-in</th>

                      <th className="w-[12%] px-3 py-3 font-medium">Check-out</th>

                      <th className="w-[10%] px-3 py-3 font-medium">Guests</th>

                      <th className="w-[14%] px-4 py-3 font-medium">Status</th>

                      <th className="w-[12%] px-4 py-3 font-medium">Payment</th>

                      <th className="w-[13%] px-3 py-3 text-center font-medium">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {filteredReservations.map((reservation) => (
                      <tr key={reservation.code} className="transition hover:bg-[#FAF8F4]">
                        <td className="px-3 py-4">
                          <p className="font-semibold text-[#192B35]">{reservation.code}</p>

                          <p className="mt-1 text-xs text-gray-500">{reservation.name}</p>
                        </td>

                        <td className="px-3 py-4">
                          <p className="font-medium text-gray-700">{reservation.room}</p>

                          <p className="mt-1 text-xs text-gray-400">
                            Room {reservation.roomNumber}
                          </p>
                        </td>

                        <td className="whitespace-nowrap px-3 py-4 text-gray-600">
                          {formatDate(reservation.checkIn)}
                        </td>

                        <td className="whitespace-nowrap px-3 py-4 text-gray-600">
                          {formatDate(reservation.checkOut)}
                        </td>

                        <td className="whitespace-nowrap px-3 py-4 text-gray-600">
                          {reservation.guests} guests
                        </td>

                        <td className="px-3 py-4">
                          <span
                            className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold ${statusStyles[reservation.status]}`}
                          >
                            {reservation.status}
                          </span>
                        </td>

                        <td className="px-3 py-4">
                          <span
                            className={`text-xs font-semibold ${
                              reservation.payment === "Paid" ? "text-green-700" : "text-amber-700"
                            }`}
                          >
                            {reservation.payment}
                          </span>
                        </td>

                        <td className="px-3 py-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleOpenDetail(reservation)}
                            className="rounded-lg border border-[#C6A46A] px-4 py-2 text-xs font-semibold text-[#A78348] transition hover:bg-[#C6A46A] hover:text-white"
                          >
                            Details
                          </button>
                        </td>
                      </tr>
                    ))}

                    {filteredReservations.length === 0 && (
                      <tr>
                        <td colSpan={8} className="px-6 py-12 text-center">
                          <p className="font-medium text-gray-500">No reservations found.</p>

                          <p className="mt-1 text-xs text-gray-400">
                            Try changing your search keyword or filters.
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* FOOTER */}

              <div className="border-t border-gray-100 px-4 py-4 sm:px-6">
                <p className="text-xs text-gray-500">
                  Showing {filteredReservations.length} of {total} reservations
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
            className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/40 p-3 sm:p-5"
            onClick={() => setSelectedReservation(null)}
          >
            <div
              className="my-auto max-h-[92dvh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-xl sm:rounded-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              {/* MODAL HEADER */}

              <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-gray-100 bg-white p-4 sm:p-6">
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-[#A78348] sm:text-xs">
                    Reservation Detail
                  </p>

                  <h2 className="mt-1 font-heading text-xl font-semibold text-[#192B35] sm:text-2xl">
                    Reservation Details
                  </h2>

                  <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                    {selectedReservation.code}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedReservation(null)}
                  className="shrink-0 rounded-lg px-3 py-2 text-xl text-gray-400 hover:bg-gray-100"
                  aria-label="Close reservation details"
                >
                  ×
                </button>
              </div>

              <div className="space-y-5 p-4 sm:space-y-6 sm:p-6">
                {/* INFORMASI RESERVASI */}

                <section>
                  <h3 className="mb-3 text-sm font-semibold text-[#192B35]">
                    Reservation Information
                  </h3>

                  <div className="grid grid-cols-2 gap-3 rounded-xl bg-[#FAF8F4] p-3 sm:gap-4 sm:p-4">
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">Reservation Code</p>

                      <p className="mt-1 text-sm font-semibold text-[#192B35]">
                        {selectedReservation.code}
                      </p>
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">Reservation Status</p>

                      <span
                        className={`mt-1 inline-block rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[selectedReservation.status]}`}
                      >
                        {selectedReservation.status}
                      </span>
                    </div>
                  </div>
                </section>

                {/* INFORMASI TAMU */}

                <section>
                  <h3 className="mb-3 text-sm font-semibold text-[#192B35]">Guest Information</h3>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">Guest Name</p>

                      <p className="mt-1 text-sm font-medium text-gray-700">
                        {selectedReservation.name}
                      </p>
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">Email</p>

                      <p className="mt-1 break-all text-sm font-medium text-gray-700">
                        {selectedReservation.email}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">Number of Guests</p>

                      <p className="mt-1 text-sm font-medium text-gray-700">
                        {selectedReservation.guests} guests
                      </p>
                    </div>
                  </div>
                </section>

                {/* INFORMASI KAMAR */}

                <section>
                  <h3 className="mb-3 text-sm font-semibold text-[#192B35]">Room Information</h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">Room Type</p>

                      <p className="mt-1 text-sm font-medium text-gray-700">
                        {selectedReservation.room}
                      </p>
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">Room Unit Number</p>

                      <p className="mt-1 break-words text-sm font-medium text-gray-700">
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

                {/* ALOKASI UNIT KAMAR */}

                <section>
                  <h3 className="mb-3 text-sm font-semibold text-[#192B35]">Room Allocation</h3>

                  <div className="rounded-xl bg-[#FAF8F4] p-3 sm:p-4">
                    <p className="mb-3 text-xs leading-5 text-gray-500">
                      Select an available room unit for{" "}
                      <span className="font-semibold text-[#192B35]">
                        {selectedReservation.room}
                      </span>
                    </p>

                    <select
                      value={selectedRoom}
                      onChange={(event) => {
                        setSelectedRoom(event.target.value);
                        setAllocationMessage("");
                      }}
                      disabled={["Cancelled", "Completed"].includes(selectedReservation.status)}
                      className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:border-[#C6A46A] disabled:cursor-not-allowed disabled:bg-gray-100"
                    >
                      <option value="">Select Room Number</option>

                      {availableRooms.map((unit) => (
                        <option key={unit.number} value={unit.number}>
                          {unit.number} - {unit.type}
                        </option>
                      ))}
                    </select>

                    {availableRooms.length === 0 && (
                      <p className="mt-2 text-xs text-red-600">
                        No available room units for the selected dates.
                      </p>
                    )}

                    {selectedReservation.roomNumber !== "Not Allocated" && (
                      <p className="mt-3 text-xs text-gray-500">
                        Currently Allocated Room:{" "}
                        <span className="font-semibold text-[#192B35]">
                          {selectedReservation.roomNumber}
                        </span>
                      </p>
                    )}

                    {allocationMessage && (
                      <p
                        className={`mt-3 text-xs font-medium sm:text-sm ${
                          allocationMessage.includes("successfully")
                            ? "text-green-700"
                            : "text-red-600"
                        }`}
                      >
                        {allocationMessage}
                      </p>
                    )}

                    <button
                      type="button"
                      onClick={handleConfirmAllocation}
                      disabled={
                        !selectedRoom ||
                        ["Cancelled", "Completed"].includes(selectedReservation.status)
                      }
                      className="mt-4 w-full rounded-lg bg-[#192B35] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#34464E] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Confirm Room Allocation
                    </button>
                  </div>
                </section>

                {/* INFORMASI PEMBAYARAN */}

                <section>
                  <h3 className="mb-3 text-sm font-semibold text-[#192B35]">Payment Information</h3>

                  <p
                    className={`text-sm font-semibold ${
                      selectedReservation.payment === "Paid" ? "text-green-700" : "text-amber-700"
                    }`}
                  >
                    {selectedReservation.payment}
                  </p>
                </section>

                {/* RIWAYAT KUNJUNGAN */}

                <section>
                  <h3 className="mb-3 text-sm font-semibold text-[#192B35]">Guest Visit History</h3>

                  {selectedVisitHistory.length > 0 ? (
                    <div className="overflow-x-auto rounded-xl border border-gray-100">
                      <table className="w-full min-w-[480px] text-left text-sm">
                        <thead className="bg-[#FAF8F4] text-xs text-gray-500">
                          <tr>
                            <th className="px-4 py-3">Date</th>
                            <th className="px-4 py-3">Room Type</th>
                            <th className="px-4 py-3">Duration</th>
                            <th className="px-4 py-3">Status</th>
                          </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100">
                          {selectedVisitHistory.map((history, index) => (
                            <tr key={index}>
                              <td className="whitespace-nowrap px-4 py-3 text-gray-600">
                                {formatDate(history.date)}
                              </td>

                              <td className="px-4 py-3 text-gray-700">{history.room}</td>

                              <td className="px-4 py-3 text-gray-600">{history.duration}</td>

                              <td className="px-4 py-3">
                                <span className="whitespace-nowrap rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
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
                      <p className="text-xs text-gray-500 sm:text-sm">No previous visit history.</p>
                    </div>
                  )}
                </section>
              </div>

              {/* MODAL FOOTER */}

              <div className="flex justify-end border-t border-gray-100 bg-white p-4 sm:p-5">
                <button
                  type="button"
                  onClick={() => setSelectedReservation(null)}
                  className="rounded-lg bg-[#192B35] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#34464E]"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

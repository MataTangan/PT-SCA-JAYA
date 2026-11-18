"use client";

import { useEffect, useMemo, useState } from "react";
import Sidebar from "@/components/receptionist/Sidebar";
import Topbar from "@/components/receptionist/Topbar";

type StayStatus = "Confirmed" | "Checked-in" | "Completed";
type RoomStatus = "Occupied" | "Reserved" | "Available" | "Dirty";

type Stay = {
  id: string;
  guestName: string;
  email: string;
  phone: string;
  roomType: string;
  roomNumber: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  status: StayStatus;
  roomPrice: number;
  nights: number;
  additionalCost: number;
};

type Room = {
  number: string;
  type: string;
  status: RoomStatus;
};

// DUMMY RESERVATION DATA
const initialStays: Stay[] = [
  {
    id: "RSV-001",
    guestName: "Andi Pratama",
    email: "andi@email.com",
    phone: "081234567890",
    roomType: "Deluxe Room",
    roomNumber: "D-201",
    checkIn: "2026-11-09",
    checkOut: "2026-11-11",
    guests: 2,
    status: "Confirmed",
    roomPrice: 450000,
    nights: 2,
    additionalCost: 50000,
  },
  {
    id: "RSV-003",
    guestName: "Budi Santoso",
    email: "budi@email.com",
    phone: "082345678901",
    roomType: "Suite Room",
    roomNumber: "SU-301",
    checkIn: "2026-11-08",
    checkOut: "2026-11-10",
    guests: 2,
    status: "Checked-in",
    roomPrice: 750000,
    nights: 2,
    additionalCost: 100000,
  },
  {
    id: "RSV-005",
    guestName: "Rizky Maulana",
    email: "rizky@email.com",
    phone: "085678901234",
    roomType: "Superior Room",
    roomNumber: "S-108",
    checkIn: "2026-11-09",
    checkOut: "2026-11-12",
    guests: 2,
    status: "Confirmed",
    roomPrice: 350000,
    nights: 3,
    additionalCost: 0,
  },
];

// DUMMY ROOM DATA
const initialRooms: Room[] = [
  { number: "S-101", type: "Superior", status: "Available" },
  { number: "S-102", type: "Superior", status: "Available" },
  { number: "S-103", type: "Superior", status: "Dirty" },
  { number: "S-104", type: "Superior", status: "Available" },
  { number: "S-105", type: "Superior", status: "Available" },
  { number: "S-108", type: "Superior", status: "Reserved" },

  { number: "D-201", type: "Deluxe", status: "Reserved" },
  { number: "D-202", type: "Deluxe", status: "Occupied" },
  { number: "D-203", type: "Deluxe", status: "Available" },
  { number: "D-204", type: "Deluxe", status: "Dirty" },
  { number: "D-205", type: "Deluxe", status: "Available" },

  { number: "SU-301", type: "Suite", status: "Occupied" },
  { number: "SU-302", type: "Suite", status: "Available" },
];

// CURRENCY FORMAT
const formatRupiah = (amount: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);

// DATE FORMAT
const formatDate = (date: string) =>
  new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

export default function CheckInOutPage() {
  const [stays, setStays] = useState<Stay[]>(initialStays);
  const [rooms, setRooms] = useState<Room[]>(initialRooms);

  const [selectedStay, setSelectedStay] = useState<Stay | null>(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [currentDate, setCurrentDate] = useState("");

  // AUTOMATIC DATE
  useEffect(() => {
    const today = new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date());

    setCurrentDate(today);
  }, []);

  // SEARCH AND FILTER
  const filteredStays = useMemo(() => {
    return stays.filter((stay) => {
      const keyword = search.toLowerCase();

      const matchesSearch =
        stay.id.toLowerCase().includes(keyword) ||
        stay.guestName.toLowerCase().includes(keyword) ||
        stay.roomNumber.toLowerCase().includes(keyword);

      const matchesStatus = filterStatus === "All" || stay.status === filterStatus;

      return matchesSearch && matchesStatus;
    });
  }, [stays, search, filterStatus]);

  // RESERVATION STATUS SUMMARY
  const totalCheckIn = stays.filter((stay) => stay.status === "Confirmed").length;

  const totalStaying = stays.filter((stay) => stay.status === "Checked-in").length;

  const totalCheckOut = stays.filter((stay) => stay.status === "Completed").length;

  // ROOM STATUS SUMMARY
  const totalOccupied = rooms.filter((room) => room.status === "Occupied").length;

  const totalReserved = rooms.filter((room) => room.status === "Reserved").length;

  const totalAvailable = rooms.filter((room) => room.status === "Available").length;

  const totalDirty = rooms.filter((room) => room.status === "Dirty").length;

  // CHECK-IN CONFIRMATION
  const handleCheckIn = (id: string) => {
    const stay = stays.find((item) => item.id === id);

    if (!stay || stay.status !== "Confirmed") return;

    setStays((previous) =>
      previous.map((item) => (item.id === id ? { ...item, status: "Checked-in" } : item)),
    );

    setRooms((previous) =>
      previous.map((room) =>
        room.number === stay.roomNumber ? { ...room, status: "Occupied" } : room,
      ),
    );

    setSelectedStay({
      ...stay,
      status: "Checked-in",
    });
  };

  // CHECK-OUT CONFIRMATION
  const handleCheckOut = (id: string) => {
    const stay = stays.find((item) => item.id === id);

    if (!stay || stay.status !== "Checked-in") return;

    const confirmed = window.confirm(`Has the check-out for ${stay.guestName} been completed?`);

    if (!confirmed) return;

    setStays((previous) =>
      previous.map((item) => (item.id === id ? { ...item, status: "Completed" } : item)),
    );

    setRooms((previous) =>
      previous.map((room) =>
        room.number === stay.roomNumber ? { ...room, status: "Dirty" } : room,
      ),
    );

    setSelectedStay({
      ...stay,
      status: "Completed",
    });
  };

  // RESERVATION STATUS COLORS
  const getStatusStyle = (status: StayStatus) => {
    switch (status) {
      case "Confirmed":
        return "bg-blue-50 text-blue-700";
      case "Checked-in":
        return "bg-green-50 text-green-700";
      case "Completed":
        return "bg-gray-100 text-gray-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  // ROOM STATUS COLORS
  const roomStatusStyle: Record<RoomStatus, string> = {
    Occupied: "bg-[#192B35] text-white",
    Reserved: "bg-[#C6A46A] text-white",
    Available: "bg-[#A5B1A0] text-[#192B35]",
    Dirty: "bg-[#EED4CE] text-[#192B35]",
  };

  // ROOM STATUS LABELS
  const roomStatusLabel: Record<RoomStatus, string> = {
    Occupied: "Occupied",
    Reserved: "Reserved",
    Available: "Available",
    Dirty: "Needs Cleaning",
  };

  // TOTAL BILL
  const selectedTotal = selectedStay
    ? selectedStay.roomPrice * selectedStay.nights + selectedStay.additionalCost
    : 0;

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#F5F0E8] text-[#343A3D]">
      <Sidebar />

      <div className="min-h-screen min-w-0 w-full md:ml-[210px] md:w-[calc(100%-210px)]">
        <Topbar />

        {/* SPACING FOR FIXED TOPBAR */}
        <div className="h-[60px] md:h-[50px]" aria-hidden="true" />

        <main className="w-full min-w-0 space-y-7 px-4 pb-10 pt-5 sm:space-y-8 sm:px-6 md:px-8 md:pb-16 md:pt-6">
          {/* WELCOME SECTION */}
          <section className="min-w-0 rounded-2xl bg-[#192B35] p-5 text-white sm:rounded-3xl sm:p-7">
            <section>
              <h1 className="font-heading text-2xl font-semibold text-[#C6A46A] sm:text-3xl">
                Check-in & Check-out
              </h1>

              <p className="mt-1 text-xs text-gray-300 sm:text-sm">{currentDate}</p>
            </section>

            <h2 className="mt-4 font-heading text-xl font-semibold sm:text-3xl">
              Manage Guest Arrivals and Departures
            </h2>

            <p className="mt-2 max-w-2xl text-xs leading-6 text-white/70 sm:text-sm">
              Monitor guest information, manage check-in, and complete check-out easily through this
              page.
            </p>
          </section>

          {/* RESERVATION LIST */}
          <section className="min-w-0">
            <div className="mb-3">
              <h2 className="font-heading text-xl font-semibold text-[#192B35] sm:text-3xl">
                Check-in & Check-out List
              </h2>
            </div>

            <div className="min-w-0 overflow-hidden rounded-2xl border border-[#E7E0D5] bg-white shadow-sm sm:rounded-3xl">
              <div className="p-3 sm:p-6">
                {/* SEARCH AND FILTER */}
                <div className="mb-5 flex min-w-0 flex-col gap-2 sm:flex-row">
                  <input
                    type="text"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search by booking code, guest name, or room number..."
                    className="h-9 w-full min-w-0 flex-1 rounded-lg border border-gray-200 px-3 text-xs outline-none transition focus:border-[#C6A46A] sm:h-8 sm:text-xs"
                  />

                  <select
                    value={filterStatus}
                    onChange={(event) => setFilterStatus(event.target.value)}
                    className="h-9 w-full min-w-0 rounded-lg border border-gray-200 bg-white px-3 text-xs outline-none focus:border-[#C6A46A] sm:h-8 sm:w-48 sm:text-xs"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Confirmed">Awaiting Check-in</option>
                    <option value="Checked-in">Currently Staying</option>
                    <option value="Completed">Checked Out</option>
                  </select>
                </div>

                {/* TABLE */}
                <div className="w-full min-w-0 overflow-x-auto">
                  <table className="w-full min-w-[850px] text-left">
                    <thead>
                      <tr className="border-b border-gray-100 text-[10px] uppercase tracking-wider text-gray-500 sm:text-[10px]">
                        <th className="px-4 py-4 font-medium">Booking Code</th>
                        <th className="px-4 py-4 font-medium">Guest Name</th>
                        <th className="px-4 py-4 font-medium">Room</th>
                        <th className="px-4 py-4 font-medium">Check-in</th>
                        <th className="px-4 py-4 font-medium">Check-out</th>
                        <th className="px-4 py-4 font-medium">Status</th>
                        <th className="px-6 py-4 text-center font-medium">Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredStays.map((stay) => (
                        <tr
                          key={stay.id}
                          className="border-b border-gray-50 transition hover:bg-[#FAF8F4]"
                        >
                          <td className="px-4 py-5 text-[11px] font-semibold text-[#192B35]">
                            {stay.id}
                          </td>

                          <td className="px-4 py-5">
                            <p className="text-[11px] font-medium text-[#192B35]">
                              {stay.guestName}
                            </p>
                            <p className="mt-1 text-[11px] text-gray-400">{stay.guests} guests</p>
                          </td>

                          <td className="px-4 py-5">
                            <p className="text-[11px] font-medium text-[#192B35]">
                              {stay.roomNumber}
                            </p>
                            <p className="mt-1 text-[11px] text-gray-400">{stay.roomType}</p>
                          </td>

                          <td className="px-4 py-5 text-[11px] text-gray-600">
                            {formatDate(stay.checkIn)}
                          </td>

                          <td className="px-4 py-5 text-[11px] text-gray-600">
                            {formatDate(stay.checkOut)}
                          </td>

                          <td className="px-4 py-5">
                            <span
                              className={`whitespace-nowrap rounded-full px-3 py-1.5 text-[11px] font-medium ${getStatusStyle(
                                stay.status,
                              )}`}
                            >
                              {stay.status === "Confirmed"
                                ? "Awaiting Check-in"
                                : stay.status === "Checked-in"
                                  ? "Currently Staying"
                                  : "Completed"}
                            </span>
                          </td>

                          <td className="px-6 py-5 text-center">
                            <button
                              onClick={() => setSelectedStay(stay)}
                              className="rounded-lg bg-[#192B35] px-3 py-2 text-[11px] font-medium text-white transition hover:bg-[#34464E]"
                            >
                              Details
                            </button>
                          </td>
                        </tr>
                      ))}

                      {filteredStays.length === 0 && (
                        <tr>
                          <td colSpan={7} className="px-4 py-12 text-center text-sm text-gray-400">
                            No reservations found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>

          {/* ROOM STATUS INFORMATION */}
          <section className="min-w-0">
            <div className="mb-4">
              <h2 className="font-heading text-xl font-semibold text-[#192B35] sm:text-3xl">
                Room Status Overview
              </h2>
            </div>

            {/* ROOM STATUS SUMMARY */}
            <div className="mb-3 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
              <div className="min-w-0 rounded-xl border border-[#E7E0D5] border-t-4 border-t-[#192B35] bg-white p-3 shadow-sm sm:p-4">
                <p className="text-xs text-gray-500">Occupied</p>
                <p className="mt-1 text-xl font-semibold text-[#192B35] sm:text-2xl">
                  {totalOccupied}
                </p>
              </div>

              <div className="min-w-0 rounded-xl border border-[#E7E0D5] border-t-4 border-t-[#C6A46A] bg-white p-3 shadow-sm sm:p-4">
                <p className="text-xs text-gray-500">Reserved</p>
                <p className="mt-1 text-xl font-semibold text-[#A27D3D] sm:text-2xl">
                  {totalReserved}
                </p>
              </div>

              <div className="min-w-0 rounded-xl border border-[#E7E0D5] border-t-4 border-t-[#A5B1A0] bg-white p-3 shadow-sm sm:p-4">
                <p className="text-xs text-gray-500">Ready for Use</p>
                <p className="mt-1 text-xl font-semibold text-[#52634F] sm:text-2xl">
                  {totalAvailable}
                </p>
              </div>

              <div className="min-w-0 rounded-xl border border-[#E7E0D5] border-t-4 border-t-[#EED4CE] bg-white p-3 shadow-sm sm:p-4">
                <p className="text-xs text-gray-500">Needs Cleaning</p>
                <p className="mt-1 text-xl font-semibold text-[#A65F54] sm:text-2xl">
                  {totalDirty}
                </p>
              </div>
            </div>

            {/* ROOM LIST */}
            <div className="min-w-0 rounded-2xl border border-[#E7E0D5] bg-white p-3 shadow-sm sm:rounded-3xl sm:p-6">
              {/* ROOM CARDS */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {rooms.map((room) => (
                  <div
                    key={room.number}
                    className={`flex min-h-[100px] min-w-0 flex-col items-center justify-center rounded-xl p-3 text-center transition duration-200 hover:-translate-y-1 hover:shadow-md sm:min-h-[105px] sm:rounded-2xl ${
                      roomStatusStyle[room.status]
                    }`}
                  >
                    <p className="text-lg font-bold sm:text-xl">{room.number}</p>

                    <p className="mt-1 text-xs opacity-80">{room.type}</p>

                    <p className="mt-2 text-[10px] font-medium leading-4 sm:text-xs">
                      {roomStatusLabel[room.status]}
                    </p>
                  </div>
                ))}
              </div>

              {/* LEGEND */}
              <div className="mt-6 border-t border-gray-100 pt-5">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Status Legend
                </p>

                <div className="flex flex-wrap gap-x-5 gap-y-3">
                  {[
                    { label: "Occupied", color: "#192B35" },
                    { label: "Reserved", color: "#C6A46A" },
                    { label: "Ready for Use", color: "#A5B1A0" },
                    { label: "Needs Cleaning", color: "#EED4CE" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-2">
                      <span
                        className="h-3.5 w-3.5 shrink-0 rounded"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-xs text-gray-500">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>

      {/* RESERVATION DETAILS MODAL */}
      {selectedStay && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/40 p-3 sm:p-4">
          <div className="my-auto max-h-[90dvh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-4 shadow-xl sm:rounded-3xl sm:p-7">
            {/* MODAL HEADER */}
            <div className="flex min-w-0 items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wider text-[#C6A46A]">
                  Reservation Details
                </p>

                <h2 className="mt-2 break-words font-heading text-xl font-semibold text-[#192B35] sm:text-2xl">
                  {selectedStay.guestName}
                </h2>

                <p className="mt-1 text-sm text-gray-400">{selectedStay.id}</p>
              </div>

              <button
                onClick={() => setSelectedStay(null)}
                className="shrink-0 rounded-full px-3 py-1 text-xl text-gray-400 hover:bg-gray-100"
                aria-label="Close details"
              >
                ×
              </button>
            </div>

            {/* GUEST AND ROOM INFORMATION */}
            <div className="mt-5 grid min-w-0 grid-cols-1 gap-3 sm:mt-6 sm:grid-cols-2 sm:gap-4">
              <div className="min-w-0 rounded-xl bg-[#F8F6F1] p-4 sm:rounded-2xl sm:p-5">
                <h3 className="mb-3 text-sm font-semibold text-[#192B35]">Guest Information</h3>

                <p className="text-xs text-gray-500">Name</p>
                <p className="mt-1 break-words text-sm font-medium text-[#192B35]">
                  {selectedStay.guestName}
                </p>

                <p className="mt-3 text-xs text-gray-500">Email</p>
                <p className="mt-1 break-all text-sm text-[#192B35]">{selectedStay.email}</p>

                <p className="mt-3 text-xs text-gray-500">Phone Number</p>
                <p className="mt-1 break-words text-sm text-[#192B35]">{selectedStay.phone}</p>

                <p className="mt-3 text-xs text-gray-500">Number of Guests</p>
                <p className="mt-1 text-sm text-[#192B35]">{selectedStay.guests} guests</p>
              </div>

              <div className="min-w-0 rounded-xl bg-[#F8F6F1] p-4 sm:rounded-2xl sm:p-5">
                <h3 className="mb-3 text-sm font-semibold text-[#192B35]">Room Information</h3>

                <p className="text-xs text-gray-500">Room Type</p>
                <p className="mt-1 break-words text-sm font-medium text-[#192B35]">
                  {selectedStay.roomType}
                </p>

                <p className="mt-3 text-xs text-gray-500">Room Number</p>
                <p className="mt-1 text-sm text-[#192B35]">{selectedStay.roomNumber}</p>

                <p className="mt-3 text-xs text-gray-500">Check-in Date</p>
                <p className="mt-1 text-sm text-[#192B35]">{formatDate(selectedStay.checkIn)}</p>

                <p className="mt-3 text-xs text-gray-500">Check-out Date</p>
                <p className="mt-1 text-sm text-[#192B35]">{formatDate(selectedStay.checkOut)}</p>
              </div>
            </div>

            {/* BILLING DETAILS */}
            <div className="mt-4 rounded-xl border border-[#E7E0D5] p-4 sm:mt-6 sm:rounded-2xl sm:p-5">
              <h3 className="text-sm font-semibold text-[#192B35]">Billing Details</h3>

              <div className="mt-4 space-y-3 text-xs sm:text-sm">
                <div className="flex justify-between gap-4 text-gray-500">
                  <span>Room rate per night</span>
                  <span className="text-right">{formatRupiah(selectedStay.roomPrice)}</span>
                </div>

                <div className="flex justify-between gap-4 text-gray-500">
                  <span>Length of Stay</span>
                  <span className="shrink-0">{selectedStay.nights} nights</span>
                </div>

                <div className="flex justify-between gap-4 text-gray-500">
                  <span>Additional charges</span>
                  <span className="text-right">{formatRupiah(selectedStay.additionalCost)}</span>
                </div>

                <div className="border-t border-dashed border-gray-200 pt-3">
                  <div className="flex justify-between gap-4 font-semibold text-[#192B35]">
                    <span>Total Bill</span>
                    <span className="text-right">{formatRupiah(selectedTotal)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ROOM STATUS */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#F8F6F1] p-4">
              <span className="text-xs text-gray-500 sm:text-sm">Room Status</span>

              {(() => {
                const room = rooms.find((item) => item.number === selectedStay.roomNumber);

                const status = room?.status ?? "Available";

                return (
                  <span
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold ${roomStatusStyle[status]}`}
                  >
                    {roomStatusLabel[status]}
                  </span>
                );
              })()}
            </div>

            {/* ACTION BUTTONS */}
            <div className="mt-5">
              {selectedStay.status === "Confirmed" && (
                <div>
                  <p className="mb-3 text-xs leading-5 text-gray-500 sm:text-sm">
                    Please make sure the guest and room details are correct before confirming
                    check-in.
                  </p>

                  <button
                    onClick={() => handleCheckIn(selectedStay.id)}
                    className="w-full rounded-xl bg-[#192B35] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#34464E]"
                  >
                    Confirm Check-in
                  </button>
                </div>
              )}

              {selectedStay.status === "Checked-in" && (
                <div>
                  <p className="mb-3 text-xs leading-5 text-gray-500 sm:text-sm">
                    Please review the bill before completing the check-out process.
                  </p>

                  <button
                    onClick={() => handleCheckOut(selectedStay.id)}
                    className="w-full rounded-xl bg-[#C6A46A] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#AE8D55]"
                  >
                    Confirm Check-out
                  </button>
                </div>
              )}

              {selectedStay.status === "Completed" && (
                <div className="rounded-xl bg-green-50 p-4 text-center text-xs font-medium text-green-700 sm:text-sm">
                  Check-out is complete. The room is marked as Needs Cleaning and is waiting for
                  housekeeping.
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedStay(null)}
              className="mt-3 w-full rounded-xl border border-gray-200 px-5 py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

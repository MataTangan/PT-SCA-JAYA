"use client";

import { useEffect, useMemo, useState } from "react";
import Sidebar from "@/components/receptionist/Sidebar";

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

// DATA RESERVASI DUMMY
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

// DATA UNIT KAMAR DUMMY
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

const formatRupiah = (amount: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);

const formatDate = (date: string) =>
  new Date(`${date}T00:00:00`).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

export default function CheckInOutPage() {
  const [stays, setStays] = useState<Stay[]>(initialStays);
  const [rooms, setRooms] = useState<Room[]>(initialRooms);

  const [selectedStay, setSelectedStay] = useState<Stay | null>(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [currentDate, setCurrentDate] = useState("");

  // TANGGAL OTOMATIS
  useEffect(() => {
    const today = new Intl.DateTimeFormat("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date());

    setCurrentDate(today);
  }, []);

  // PENCARIAN DAN FILTER
  const filteredStays = useMemo(() => {
    return stays.filter((stay) => {
      const keyword = search.toLowerCase();

      const matchesSearch =
        stay.id.toLowerCase().includes(keyword) ||
        stay.guestName.toLowerCase().includes(keyword) ||
        stay.roomNumber.toLowerCase().includes(keyword);

      const matchesStatus = filterStatus === "Semua" || stay.status === filterStatus;

      return matchesSearch && matchesStatus;
    });
  }, [stays, search, filterStatus]);

  // RINGKASAN STATUS
  const totalCheckIn = stays.filter((stay) => stay.status === "Confirmed").length;

  const totalStaying = stays.filter((stay) => stay.status === "Checked-in").length;

  const totalCheckOut = stays.filter((stay) => stay.status === "Completed").length;

  // RINGKASAN KAMAR
  const totalOccupied = rooms.filter((room) => room.status === "Occupied").length;

  const totalReserved = rooms.filter((room) => room.status === "Reserved").length;

  const totalAvailable = rooms.filter((room) => room.status === "Available").length;

  const totalDirty = rooms.filter((room) => room.status === "Dirty").length;

  // KONFIRMASI CHECK-IN
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

  // KONFIRMASI CHECK-OUT
  const handleCheckOut = (id: string) => {
    const stay = stays.find((item) => item.id === id);

    if (!stay || stay.status !== "Checked-in") return;

    const confirmed = window.confirm(`Apakah check-out untuk ${stay.guestName} sudah selesai?`);

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

  // WARNA STATUS RESERVASI
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

  // WARNA KARTU STATUS KAMAR
  const roomStatusStyle: Record<RoomStatus, string> = {
    Occupied: "bg-[#192B35] text-white",
    Reserved: "bg-[#C6A46A] text-white",
    Available: "bg-[#A5B1A0] text-[#192B35]",
    Dirty: "bg-[#EED4CE] text-[#192B35]",
  };

  // LABEL STATUS KAMAR
  const roomStatusLabel: Record<RoomStatus, string> = {
    Occupied: "Terisi",
    Reserved: "Dipesan",
    Available: "Siap",
    Dirty: "Perlu Dibersihkan",
  };

  // TOTAL TAGIHAN
  const selectedTotal = selectedStay
    ? selectedStay.roomPrice * selectedStay.nights + selectedStay.additionalCost
    : 0;

  return (
    <div className="min-h-screen bg-[#F5F0E8]">
      <Sidebar />

      <main className="ml-64 min-h-screen">
        {/* HEADER */}
        <header className="sticky top-0 z-40 bg-[#F5F0E8] px-8 pb-5 pt-8">
          <h1 className="font-heading text-3xl font-semibold text-[#192B35]">
            Check-in & Check-out
          </h1>
          <p className="mt-2 text-sm text-gray-500">{currentDate}</p>
        </header>

        <div className="px-8 pb-10">
          {/* WELCOME SECTION */}
          <section className="mb-8 rounded-3xl bg-[#192B35] p-7 text-white">
            <p className="text-sm tracking-widest text-[#C6A46A]">SCA JAYA MANAGEMENT</p>

            <h2 className="mt-2 font-heading text-3xl font-semibold">
              Kelola Kedatangan dan Kepulangan Tamu
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/70">
              Pantau informasi tamu, proses check-in, dan selesaikan check-out dengan mudah melalui
              halaman ini.
            </p>
          </section>

          {/* SUMMARY RESERVASI */}
          <section className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-3">
            <div className="rounded-2xl border border-[#E7E0D5] bg-white p-6">
              <p className="text-sm text-gray-500">Menunggu Check-in</p>
              <h3 className="mt-3 text-3xl font-semibold text-[#192B35]">{totalCheckIn}</h3>
              <p className="mt-2 text-xs text-gray-400">Reservasi terkonfirmasi</p>
            </div>

            <div className="rounded-2xl border border-[#E7E0D5] bg-white p-6">
              <p className="text-sm text-gray-500">Sedang Menginap</p>
              <h3 className="mt-3 text-3xl font-semibold text-green-700">{totalStaying}</h3>
              <p className="mt-2 text-xs text-gray-400">Tamu yang masih berada di hotel</p>
            </div>

            <div className="rounded-2xl border border-[#E7E0D5] bg-white p-6">
              <p className="text-sm text-gray-500">Check-out Selesai</p>
              <h3 className="mt-3 text-3xl font-semibold text-[#C6A46A]">{totalCheckOut}</h3>
              <p className="mt-2 text-xs text-gray-400">Tamu telah menyelesaikan masa menginap</p>
            </div>
          </section>

          {/* DAFTAR RESERVASI */}
          <section className="rounded-3xl border border-[#E7E0D5] bg-white p-6">
            <div className="mb-6">
              <h2 className="font-heading text-2xl font-semibold text-[#192B35]">
                Daftar Check-in & Check-out
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Pilih reservasi untuk melihat informasi tamu dan memproses kedatangan atau
                kepulangan.
              </p>
            </div>

            {/* SEARCH DAN FILTER */}
            <div className="mb-5 flex flex-col gap-3 md:flex-row">
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Cari kode, nama tamu, atau nomor kamar..."
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#C6A46A] md:flex-1"
              />

              <select
                value={filterStatus}
                onChange={(event) => setFilterStatus(event.target.value)}
                className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#C6A46A]"
              >
                <option value="Semua">Semua Status</option>
                <option value="Confirmed">Menunggu Check-in</option>
                <option value="Checked-in">Sedang Menginap</option>
                <option value="Completed">Selesai Check-out</option>
              </select>
            </div>

            {/* TABLE */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left">
                <thead>
                  <tr className="border-b border-gray-100 text-xs uppercase tracking-wider text-gray-400">
                    <th className="px-4 py-4 font-medium">Kode Reservasi</th>
                    <th className="px-4 py-4 font-medium">Nama Tamu</th>
                    <th className="px-4 py-4 font-medium">Unit Kamar</th>
                    <th className="px-4 py-4 font-medium">Check-in</th>
                    <th className="px-4 py-4 font-medium">Check-out</th>
                    <th className="px-4 py-4 font-medium">Status</th>
                    <th className="px-4 py-4 text-center font-medium">Aksi</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredStays.map((stay) => (
                    <tr
                      key={stay.id}
                      className="border-b border-gray-50 transition hover:bg-[#FAF8F4]"
                    >
                      <td className="px-4 py-5 text-sm font-semibold text-[#192B35]">{stay.id}</td>

                      <td className="px-4 py-5">
                        <p className="text-sm font-medium text-[#192B35]">{stay.guestName}</p>
                        <p className="mt-1 text-xs text-gray-400">{stay.guests} tamu</p>
                      </td>

                      <td className="px-4 py-5">
                        <p className="text-sm font-medium text-[#192B35]">{stay.roomNumber}</p>
                        <p className="mt-1 text-xs text-gray-400">{stay.roomType}</p>
                      </td>

                      <td className="px-4 py-5 text-sm text-gray-600">
                        {formatDate(stay.checkIn)}
                      </td>

                      <td className="px-4 py-5 text-sm text-gray-600">
                        {formatDate(stay.checkOut)}
                      </td>

                      <td className="px-4 py-5">
                        <span
                          className={`rounded-full px-3 py-1.5 text-xs font-medium ${getStatusStyle(
                            stay.status,
                          )}`}
                        >
                          {stay.status === "Confirmed"
                            ? "Menunggu Check-in"
                            : stay.status === "Checked-in"
                              ? "Sedang Menginap"
                              : "Selesai"}
                        </span>
                      </td>

                      <td className="px-4 py-5 text-center">
                        <button
                          onClick={() => setSelectedStay(stay)}
                          className="rounded-lg bg-[#192B35] px-4 py-2 text-xs font-medium text-white transition hover:bg-[#34464E]"
                        >
                          Detail
                        </button>
                      </td>
                    </tr>
                  ))}

                  {filteredStays.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-sm text-gray-400">
                        Data reservasi tidak ditemukan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* STATUS KAMAR */}
          <section className="mt-6 rounded-3xl border border-[#E7E0D5] bg-white p-6">
            <div className="mb-6">
              <h2 className="font-heading text-2xl font-semibold text-[#192B35]">
                Informasi Status Kamar
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Pantau kondisi dan ketersediaan setiap unit kamar hotel.
              </p>
            </div>

            {/* SUMMARY STATUS KAMAR */}
            <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
              <div className="rounded-xl bg-[#192B35]/5 p-4">
                <p className="text-xs text-gray-500">Terisi</p>
                <p className="mt-1 text-2xl font-semibold text-[#192B35]">{totalOccupied}</p>
              </div>

              <div className="rounded-xl bg-[#C6A46A]/10 p-4">
                <p className="text-xs text-gray-500">Dipesan</p>
                <p className="mt-1 text-2xl font-semibold text-[#A27D3D]">{totalReserved}</p>
              </div>

              <div className="rounded-xl bg-[#A5B1A0]/20 p-4">
                <p className="text-xs text-gray-500">Siap Digunakan</p>
                <p className="mt-1 text-2xl font-semibold text-[#52634F]">{totalAvailable}</p>
              </div>

              <div className="rounded-xl bg-[#EED4CE]/50 p-4">
                <p className="text-xs text-gray-500">Perlu Dibersihkan</p>
                <p className="mt-1 text-2xl font-semibold text-[#A65F54]">{totalDirty}</p>
              </div>
            </div>

            {/* ROOM CARDS */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {rooms.map((room) => (
                <div
                  key={room.number}
                  className={`flex min-h-[105px] flex-col items-center justify-center rounded-2xl p-3 transition duration-200 hover:-translate-y-1 hover:shadow-md ${
                    roomStatusStyle[room.status]
                  }`}
                >
                  <p className="text-xl font-bold">{room.number}</p>

                  <p className="mt-1 text-xs opacity-80">{room.type}</p>

                  <p className="mt-2 text-xs font-medium">{roomStatusLabel[room.status]}</p>
                </div>
              ))}
            </div>

            {/* LEGEND */}
            <div className="mt-7 border-t border-gray-100 pt-5">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                Keterangan Status
              </p>

              <div className="flex flex-wrap gap-x-6 gap-y-3">
                {[
                  {
                    label: "Terisi",
                    color: "#192B35",
                  },
                  {
                    label: "Dipesan",
                    color: "#C6A46A",
                  },
                  {
                    label: "Siap Digunakan",
                    color: "#A5B1A0",
                  },
                  {
                    label: "Perlu Dibersihkan",
                    color: "#EED4CE",
                  },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2">
                    <span className="h-4 w-4 rounded" style={{ backgroundColor: item.color }} />
                    <span className="text-xs text-gray-500">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* MODAL DETAIL RESERVASI */}
      {selectedStay && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-7 shadow-xl">
            {/* MODAL HEADER */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-[#C6A46A]">
                  Detail Reservasi
                </p>

                <h2 className="mt-2 font-heading text-2xl font-semibold text-[#192B35]">
                  {selectedStay.guestName}
                </h2>

                <p className="mt-1 text-sm text-gray-400">{selectedStay.id}</p>
              </div>

              <button
                onClick={() => setSelectedStay(null)}
                className="rounded-full px-3 py-1 text-xl text-gray-400 hover:bg-gray-100"
                aria-label="Tutup detail"
              >
                ×
              </button>
            </div>

            {/* INFORMASI TAMU DAN KAMAR */}
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-[#F8F6F1] p-5">
                <h3 className="mb-3 text-sm font-semibold text-[#192B35]">Informasi Tamu</h3>

                <p className="text-sm text-gray-500">Nama</p>
                <p className="mt-1 text-sm font-medium text-[#192B35]">{selectedStay.guestName}</p>

                <p className="mt-3 text-sm text-gray-500">Email</p>
                <p className="mt-1 break-all text-sm text-[#192B35]">{selectedStay.email}</p>

                <p className="mt-3 text-sm text-gray-500">Nomor Telepon</p>
                <p className="mt-1 text-sm text-[#192B35]">{selectedStay.phone}</p>

                <p className="mt-3 text-sm text-gray-500">Jumlah Tamu</p>
                <p className="mt-1 text-sm text-[#192B35]">{selectedStay.guests} orang</p>
              </div>

              <div className="rounded-2xl bg-[#F8F6F1] p-5">
                <h3 className="mb-3 text-sm font-semibold text-[#192B35]">Informasi Kamar</h3>

                <p className="text-sm text-gray-500">Tipe Kamar</p>
                <p className="mt-1 text-sm font-medium text-[#192B35]">{selectedStay.roomType}</p>

                <p className="mt-3 text-sm text-gray-500">Nomor Unit</p>
                <p className="mt-1 text-sm text-[#192B35]">{selectedStay.roomNumber}</p>

                <p className="mt-3 text-sm text-gray-500">Tanggal Check-in</p>
                <p className="mt-1 text-sm text-[#192B35]">{formatDate(selectedStay.checkIn)}</p>

                <p className="mt-3 text-sm text-gray-500">Tanggal Check-out</p>
                <p className="mt-1 text-sm text-[#192B35]">{formatDate(selectedStay.checkOut)}</p>
              </div>
            </div>

            {/* RINCIAN TAGIHAN */}
            <div className="mt-6 rounded-2xl border border-[#E7E0D5] p-5">
              <h3 className="font-semibold text-[#192B35]">Rincian Tagihan</h3>

              <div className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between gap-4 text-gray-500">
                  <span>Harga kamar per malam</span>
                  <span>{formatRupiah(selectedStay.roomPrice)}</span>
                </div>

                <div className="flex justify-between gap-4 text-gray-500">
                  <span>Durasi menginap</span>
                  <span>{selectedStay.nights} malam</span>
                </div>

                <div className="flex justify-between gap-4 text-gray-500">
                  <span>Biaya tambahan</span>
                  <span>{formatRupiah(selectedStay.additionalCost)}</span>
                </div>

                <div className="border-t border-dashed border-gray-200 pt-3">
                  <div className="flex justify-between gap-4 font-semibold text-[#192B35]">
                    <span>Total Tagihan</span>
                    <span>{formatRupiah(selectedTotal)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* STATUS KAMAR */}
            <div className="mt-5 flex items-center justify-between rounded-xl bg-[#F8F6F1] p-4">
              <span className="text-sm text-gray-500">Status Unit Kamar</span>

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

            {/* TOMBOL AKSI */}
            <div className="mt-6">
              {selectedStay.status === "Confirmed" && (
                <div>
                  <p className="mb-3 text-sm text-gray-500">
                    Pastikan data tamu dan unit kamar sudah sesuai sebelum mengonfirmasi kedatangan.
                  </p>

                  <button
                    onClick={() => handleCheckIn(selectedStay.id)}
                    className="w-full rounded-xl bg-[#192B35] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#34464E]"
                  >
                    Konfirmasi Check-in
                  </button>
                </div>
              )}

              {selectedStay.status === "Checked-in" && (
                <div>
                  <p className="mb-3 text-sm text-gray-500">
                    Periksa rincian tagihan sebelum menyelesaikan proses check-out.
                  </p>

                  <button
                    onClick={() => handleCheckOut(selectedStay.id)}
                    className="w-full rounded-xl bg-[#C6A46A] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#AE8D55]"
                  >
                    Konfirmasi Check-out
                  </button>
                </div>
              )}

              {selectedStay.status === "Completed" && (
                <div className="rounded-xl bg-green-50 p-4 text-center text-sm font-medium text-green-700">
                  Check-out telah selesai. Unit kamar berstatus Perlu Dibersihkan dan menunggu
                  proses housekeeping.
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedStay(null)}
              className="mt-3 w-full rounded-xl border border-gray-200 px-5 py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

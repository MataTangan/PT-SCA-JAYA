import Sidebar from "@/components/receptionist/Sidebar";
import Topbar from "@/components/receptionist/Topbar";

const statistics = [
  {
    title: "Total Reservasi",
    value: "24",
    detail: "Reservasi hari ini",
    icon: "▤",
    color: "bg-blue-50 text-blue-700",
  },
  {
    title: "Check-in Hari Ini",
    value: "08",
    detail: "Tamu akan datang",
    icon: "↘",
    color: "bg-green-50 text-green-700",
  },
  {
    title: "Sedang Menginap",
    value: "16",
    detail: "Tamu aktif",
    icon: "⌂",
    color: "bg-amber-50 text-amber-700",
  },
  {
    title: "Check-out Hari Ini",
    value: "05",
    detail: "Tamu akan keluar",
    icon: "↗",
    color: "bg-purple-50 text-purple-700",
  },
];

const roomStatuses = [
  {
    title: "Kamar Tersedia",
    value: 12,
    description: "Siap untuk ditempati",
    color: "bg-green-100 text-green-700",
    dot: "bg-green-500",
  },
  {
    title: "Kamar Dipesan",
    value: 8,
    description: "Sudah memiliki reservasi",
    color: "bg-amber-100 text-amber-700",
    dot: "bg-amber-500",
  },
  {
    title: "Kamar Terisi",
    value: 15,
    description: "Sedang ditempati tamu",
    color: "bg-blue-100 text-blue-700",
    dot: "bg-blue-500",
  },
];

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

export default function ReceptionistDashboard() {
  return (
    <div className="min-h-screen bg-[#F5F0E8]">
      <Sidebar />

      <main className="ml-64 min-h-screen">
        <Topbar />

        <div className="space-y-8 p-8">
          {/* Welcome Section */}
          <section className="relative overflow-hidden rounded-2xl bg-[#192B35] p-8 text-white shadow-lg">
            <div className="relative z-10">
              <p className="mb-2 text-sm tracking-widest text-[#C6A46A]">SCA JAYA MANAGEMENT</p>

              <h1 className="font-heading text-4xl font-semibold">Selamat Datang, Resepsionis!</h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-white/70">
                Kelola reservasi, pelayanan tamu, serta aktivitas check-in dan check-out dengan
                mudah melalui dashboard ini.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href="/dashboard/receptionist/reservations"
                  className="rounded-lg bg-[#C6A46A] px-5 py-3 text-sm font-semibold text-[#192B35] transition hover:bg-[#d8b77e]"
                >
                  Kelola Reservasi
                </a>

                <a
                  href="/dashboard/receptionist/check-in-out"
                  className="rounded-lg border border-white/30 px-5 py-3 text-sm text-white transition hover:bg-white/10"
                >
                  Check-in / Check-out
                </a>
              </div>
            </div>

            <div className="absolute -right-12 -top-20 h-64 w-64 rounded-full border border-[#C6A46A]/20" />
            <div className="absolute -right-4 -top-12 h-48 w-48 rounded-full border border-[#C6A46A]/30" />
          </section>

          {/* Statistics */}
          <section>
            <div className="mb-5">
              <h2 className="font-heading text-3xl font-semibold text-[#192B35]">
                Ringkasan Aktivitas
              </h2>
              <p className="mt-1 text-sm text-gray-500">Informasi aktivitas operasional hotel.</p>
            </div>

            <div className="grid grid-cols-4 gap-5">
              {statistics.map((item) => (
                <div
                  key={item.title}
                  className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">{item.title}</p>
                    <span
                      className={`flex h-10 w-10 items-center justify-center rounded-xl text-xl ${item.color}`}
                    >
                      {item.icon}
                    </span>
                  </div>

                  <h3 className="mt-5 text-3xl font-bold text-[#192B35]">{item.value}</h3>

                  <p className="mt-1 text-xs text-gray-400">{item.detail}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Room Status */}
          <section>
            <div className="mb-5">
              <h2 className="font-heading text-3xl font-semibold text-[#192B35]">
                Ringkasan Status Kamar
              </h2>
              <p className="mt-1 text-sm text-gray-500">Pantau ketersediaan kamar Arunika Hotel.</p>
            </div>

            <div className="grid grid-cols-3 gap-5">
              {roomStatuses.map((room) => (
                <div
                  key={room.title}
                  className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-500">{room.title}</p>

                    <span className={`h-3 w-3 rounded-full ${room.dot}`} />
                  </div>

                  <h3 className="mt-4 text-4xl font-bold text-[#192B35]">{room.value}</h3>

                  <span
                    className={`mt-3 inline-block rounded-full px-3 py-1 text-xs font-medium ${room.color}`}
                  >
                    {room.description}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Reservations Table */}
          <section className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 p-6">
              <div>
                <h2 className="font-heading text-2xl font-semibold text-[#192B35]">
                  Reservasi Terbaru
                </h2>
                <p className="mt-1 text-sm text-gray-500">Daftar reservasi tamu hotel.</p>
              </div>

              <a
                href="/dashboard/receptionist/reservations"
                className="text-sm font-semibold text-[#A78348] hover:underline"
              >
                Lihat Semua
              </a>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#FAF8F4] text-xs uppercase tracking-wider text-gray-500">
                  <tr>
                    <th className="px-6 py-4">Kode Reservasi</th>
                    <th className="px-6 py-4">Nama Tamu</th>
                    <th className="px-6 py-4">Tipe Kamar</th>
                    <th className="px-6 py-4">Tanggal</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {reservations.map((reservation) => (
                    <tr key={reservation.code} className="transition hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-[#192B35]">{reservation.code}</td>
                      <td className="px-6 py-4 text-gray-600">{reservation.guest}</td>
                      <td className="px-6 py-4 text-gray-600">{reservation.room}</td>
                      <td className="px-6 py-4 text-gray-600">{reservation.date}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            reservation.status === "Confirmed"
                              ? "bg-green-100 text-green-700"
                              : reservation.status === "Pending"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {reservation.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

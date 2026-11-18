
import Link from "next/link";
import GuestSidebar from "@/components/guest/Sidebar";
import GuestTopbar from "@/components/guest/Topbar";

const summaryCards = [
  { label: "Total Reservasi", value: "0", color: "#C6A46A", note: "All bookings" },
  { label: "Upcoming Reservation", value: "0", color: "#A5B1A0", note: "Upcoming Reservation" },
  { label: "Completed Reservation", value: "0", color: "#192B35", note: "Your stay history" },
];

export default function GuestDashboard() {
  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#F5F0E8] text-[#343A3D]">
      <GuestSidebar />

      <div className="min-h-screen min-w-0 w-full md:ml-[210px] md:w-[calc(100%-210px)]">
        <GuestTopbar />

        <div className="h-[60px] md:h-[50px]" aria-hidden="true" />

        <main className="w-full min-w-0 space-y-6 px-4 pb-8 pt-4 sm:space-y-8 sm:px-6 md:space-y-7 md:px-8 md:pb-16 md:pt-6">

          {/* Welcome Banner */}
          <section className="relative overflow-hidden rounded-[22px] bg-[#192B35] px-5 py-8 text-white shadow-md sm:rounded-[28px] sm:px-10 sm:py-8">
            <div className="relative z-10 max-w-4xl">
              <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.2em] text-[#C6A46A] sm:text-sm">
                SCA JAYA GUEST
              </p>

              <h1 className="mb-2 text-3xl font-bold leading-tight sm:text-4xl md:text-4xl">
                Welcome Back!
              </h1>

              <p className="mb-6 max-w-3xl text-sm leading-relaxed text-white/80 sm:mb-8 sm:text-sm md:text-base">
                Enjoy a comfortable stay and easily manage your reservations through the SCA JAYA dashboard.
              </p>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/#rooms"
                  className="rounded-xl bg-[#C6A46A] px-5 py-3.5 text-center text-sm font-semibold text-[#192B35] transition hover:bg-[#d5b77f] sm:px-6 sm:py-4"
                >
                  Explore Rooms
                </Link>

                <Link
                  href="/dashboard/guest/reservations"
                  className="rounded-xl border border-white/30 px-5 py-3.5 text-center text-sm font-medium text-white transition hover:bg-white/10 sm:px-6 sm:py-4"
                >
                  View Reservations
                </Link>
              </div>
            </div>

            <div className="pointer-events-none absolute -right-16 -top-28 h-80 w-80 rounded-full border border-[#C6A46A]/20" />
            <div className="pointer-events-none absolute -right-8 -top-16 h-64 w-64 rounded-full border border-[#C6A46A]/20" />
          </section>

          {/* Reservation Summary */}
          <section className="min-w-0">
            <div className="mb-4 sm:mb-5 md:mb-6">
              <h2 className="font-heading text-2xl font-semibold text-[#192B35] sm:text-3xl">
                Reservation Summary
              </h2>

              <p className="mt-1 text-xs leading-relaxed text-gray-500 sm:text-[13px]">
                An overview of your hotel reservation activity.
              </p>
            </div>

            <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
              {summaryCards.map((item) => (
                <div
                  key={item.label}
                  className="min-w-0 rounded-[16px] border border-[#E2D8C8] bg-[#FFFDFA] px-4 py-4 md:rounded-[18px]"
                  style={{ borderTop: `5px solid ${item.color}` }}
                >
                  <p className="font-heading text-2xl font-semibold text-[#192B35] sm:text-3xl">
                    {item.value}
                  </p>

                  <p className="mt-1.5 text-xs leading-relaxed text-gray-600 sm:mt-2 sm:text-sm">
                    {item.label}
                  </p>

                  <p className="mt-1 text-[11px] text-gray-400">
                    {item.note}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Upcoming Reservations */}
          <section className="min-w-0">
            <div className="mb-4 flex items-end justify-between gap-2 sm:gap-3">
              <div className="min-w-0">
                <h2 className="font-heading text-lg font-semibold leading-tight text-[#192B35] sm:text-2xl">
                  Upcoming Reservations
                </h2>

                <p className="mt-1 text-xs leading-relaxed text-gray-500 sm:text-sm">
                  Details of your next scheduled stay.
                </p>
              </div>

              <Link
                href="/dashboard/guest/reservations"
                className="shrink-0 text-[11px] font-medium text-[#C6A46A] transition hover:underline sm:text-xs"
              >
                View All →
              </Link>
            </div>

            <div className="rounded-[18px] border border-[#E2D8C8] bg-[#FFFDFA] px-4 py-10 text-center sm:px-6 sm:py-12 md:rounded-[20px] md:py-16">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#F5F0E8] text-2xl font-semibold text-[#C6A46A]">
                S
              </div>

              <h3 className="mt-5 font-heading text-xl font-semibold text-[#192B35] sm:text-2xl">
                No Reservations Yet
              </h3>

              <p className="mx-auto mt-3 max-w-sm text-xs leading-6 text-gray-500 sm:text-sm">
                Your reservations will appear here once you have booked a room.
              </p>

              <Link
                href="/#rooms"
                className="mt-6 inline-block rounded-xl bg-[#C6A46A] px-6 py-3.5 text-center text-sm font-semibold text-[#192B35] shadow-sm transition hover:bg-[#D5B77F] sm:mt-7 sm:py-4"
              >
                Find a Room
              </Link>
            </div>
          </section>

          {/* Footer */}
          <footer className="border-t border-[#E2D8C8] pt-5 text-center sm:pt-6">
            <p className="text-[8px] tracking-[0.15em] text-gray-400 sm:text-[10px] sm:tracking-[0.2em]">
              © 2026 SCA JAYA HOTEL. ALL RIGHTS RESERVED.
            </p>
          </footer>

        </main>
      </div>
    </div>
  );
}

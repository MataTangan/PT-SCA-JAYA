
"use client";

import Link from "next/link";
import GuestSidebar from "@/components/guest/Sidebar";
import GuestTopbar from "@/components/guest/Topbar";

const reservations = [
  {
    id: "SCA-2026-001",
    room: "Deluxe Room",
    checkIn: "20 Nov 2026",
    checkOut: "23 Nov 2026",
    nights: 3,
    guests: 2,
    total: 1950000,
    reservationStatus: "Pending",
    paymentStatus: "Unpaid",
  },
];

function formatPrice(price: number) {
  return new Intl.NumberFormat("id-ID").format(price);
}

export default function GuestReservations() {
  const totalReservations = reservations.length;
  const waitingReservations = reservations.filter(
    (item) => item.reservationStatus === "Pending",
  ).length;
  const completedReservations = reservations.filter(
    (item) => item.reservationStatus === "Checked-out",
  ).length;

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#F5F0E8] text-[#343A3D]">
      <GuestSidebar />

      <div className="min-h-screen min-w-0 w-full md:ml-[210px] md:w-[calc(100%-210px)]">
        <GuestTopbar />

        <div className="h-[60px] md:h-[50px]" aria-hidden="true" />

        <main className="w-full min-w-0 space-y-6 px-4 pb-8 pt-4 sm:space-y-8 sm:px-6 md:space-y-7 md:px-8 md:pb-16 md:pt-6">
          {/* PAGE HEADER */}
          <section>
            <h1 className="font-heading text-2xl font-semibold text-[#192B35] sm:text-3xl">
              My Reservations
            </h1>
            <p className="mt-2 text-xs leading-relaxed text-gray-500 sm:text-sm">
              View and manage all your room bookings at SCA JAYA Hotel.
            </p>
          </section>

          {/* RESERVATION SUMMARY */}
          <section>
            <div className="mb-4 sm:mb-5">
              <h2 className="font-heading text-xl font-semibold text-[#192B35] sm:text-2xl">
                Reservation Summary
              </h2>
              <p className="mt-1 text-xs text-gray-500 sm:text-[13px]">
                An overview of all your bookings.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
              {[
                {
                  label: "Total Reservations",
                  value: totalReservations,
                  color: "#C6A46A",
                },
                {
                  label: "Awaiting Confirmation",
                  value: waitingReservations,
                  color: "#A5B1A0",
                },
                {
                  label: "Completed Reservations",
                  value: completedReservations,
                  color: "#192B35",
                },
              ].map((item) => (
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
                </div>
              ))}
            </div>
          </section>

          {/* RESERVATION LIST */}
          <section>
            <div className="mb-4">
              <h2 className="font-heading text-xl font-semibold text-[#192B35] sm:text-2xl">
                Reservation List
              </h2>
              <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                Your room booking history and status.
              </p>
            </div>

            {reservations.length === 0 ? (
              <div className="rounded-[18px] border border-[#E2D8C8] bg-[#FFFDFA] px-4 py-10 text-center sm:px-5 sm:py-12 md:rounded-[20px] md:py-16">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#F5F0E8] text-2xl text-[#C6A46A] sm:h-16 sm:w-16">
                  <span aria-hidden="true">⌂</span>
                </div>

                <h3 className="mt-5 font-heading text-xl font-semibold text-[#192B35] sm:text-2xl">
                  No Reservations Yet
                </h3>
                <p className="mx-auto mt-3 max-w-md text-xs leading-6 text-gray-500 sm:text-sm">
                  You have no room bookings yet. Find the perfect room and plan your stay with us.
                </p>

                <Link
                  href="/#rooms"
                  className="mt-6 inline-block rounded-xl bg-[#C6A46A] px-6 py-3.5 text-sm font-semibold text-[#192B35] shadow-sm transition hover:bg-[#D5B77F] sm:mt-7 sm:py-4"
                >
                  Explore Rooms
                </Link>
              </div>
            ) : (
              <div className="space-y-4 sm:space-y-5">
                {reservations.map((reservation) => (
                  <article
                    key={reservation.id}
                    className="min-w-0 overflow-hidden rounded-[18px] border border-[#E2D8C8] bg-[#FFFDFA] shadow-sm"
                  >
                    <div className="flex flex-col gap-3 border-b border-[#E2D8C8] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-5 md:px-7">
                      <div className="min-w-0">
                        <p className="text-[9px] font-semibold tracking-[0.18em] text-[#A78B5C]">
                          RESERVATION ID
                        </p>
                        <p className="mt-1 break-all text-sm font-semibold text-[#192B35]">
                          {reservation.id}
                        </p>
                      </div>

                      <span className="w-fit rounded-full bg-[#F5EBD8] px-4 py-2 text-[10px] font-semibold text-[#98733C]">
                        {reservation.reservationStatus}
                      </span>
                    </div>

                    <div className="grid min-w-0 gap-5 p-4 sm:gap-6 sm:p-5 md:grid-cols-[1.4fr_0.8fr] md:p-7">
                      <div className="min-w-0">
                        <p className="text-[9px] font-semibold tracking-[0.15em] text-[#A78B5C]">
                          ROOM TYPE
                        </p>
                        <h3 className="mt-2 font-serif text-2xl text-[#192B35]">
                          {reservation.room}
                        </h3>

                        <div className="mt-5 grid grid-cols-2 gap-x-3 gap-y-5 sm:mt-6 sm:gap-5">
                          <div className="min-w-0">
                            <p className="text-[9px] tracking-[0.15em] text-gray-400">
                              CHECK IN
                            </p>
                            <p className="mt-1.5 text-xs font-semibold text-[#192B35] sm:mt-2 sm:text-sm">
                              {reservation.checkIn}
                            </p>
                          </div>
                          <div className="min-w-0">
                            <p className="text-[9px] tracking-[0.15em] text-gray-400">
                              CHECK OUT
                            </p>
                            <p className="mt-1.5 text-xs font-semibold text-[#192B35] sm:mt-2 sm:text-sm">
                              {reservation.checkOut}
                            </p>
                          </div>
                          <div>
                            <p className="text-[9px] tracking-[0.15em] text-gray-400">
                              DURATION
                            </p>
                            <p className="mt-1.5 text-xs font-semibold text-[#192B35] sm:mt-2 sm:text-sm">
                              {reservation.nights} Nights
                            </p>
                          </div>
                          <div>
                            <p className="text-[9px] tracking-[0.15em] text-gray-400">
                              GUESTS
                            </p>
                            <p className="mt-1.5 text-xs font-semibold text-[#192B35] sm:mt-2 sm:text-sm">
                              {reservation.guests} Guests
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex min-w-0 flex-col justify-between border-t border-[#E2D8C8] pt-4 sm:pt-5 md:border-l md:border-t-0 md:pl-6 md:pt-0">
                        <div>
                          <p className="text-[9px] tracking-[0.15em] text-gray-400">
                            TOTAL PAYMENT
                          </p>
                          <p className="mt-2 break-words font-serif text-2xl text-[#192B35]">
                            Rp {formatPrice(reservation.total)}
                          </p>

                          <p className="mt-4 text-[9px] tracking-[0.15em] text-gray-400 sm:mt-5">
                            PAYMENT STATUS
                          </p>
                          <p className="mt-2 text-sm font-semibold text-[#98733C]">
                            {reservation.paymentStatus}
                          </p>
                        </div>

                        <Link
                          href={`/dashboard/guest/reservations/${reservation.id}`}
                          className="mt-5 flex w-full items-center justify-center rounded-md bg-[#C6A46A] px-5 py-3 text-[10px] font-extrabold tracking-[0.15em] !text-[#192B35] shadow-sm transition hover:bg-[#D5B77F] sm:mt-6"
                        >
                          VIEW DETAILS
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          {/* FOOTER */}
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

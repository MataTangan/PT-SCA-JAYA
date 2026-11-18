
"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import GuestSidebar from "@/components/guest/Sidebar";
import GuestTopbar from "@/components/guest/Topbar";

const reservation = {
  id: "SCA-2026-001",
  room: "Deluxe Room",
  checkIn: "20 November 2026",
  checkOut: "23 November 2026",
  nights: 3,
  guests: 2,
  price: 650000,
  total: 1950000,
  reservationStatus: "Pending",
  paymentStatus: "Unpaid",
  paymentMethod: "Bank Transfer",
};

function formatPrice(price: number) {
  return new Intl.NumberFormat("id-ID").format(price);
}

export default function ReservationDetailPage() {
  const params = useParams();
  const reservationId = params.id;

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#F5F0E8] text-[#343A3D]">
      <GuestSidebar />

      <div className="min-h-screen min-w-0 w-full md:ml-[210px] md:w-[calc(100%-210px)]">
        <GuestTopbar />

        <div className="h-[60px] md:h-[50px]" />

        <main className="w-full min-w-0 space-y-5 px-4 pb-8 pt-4 sm:space-y-7 sm:px-6 md:px-8 md:pb-16 md:pt-6">
          {/* PAGE HEADER */}
          <div>
            <Link
              href="/dashboard/guest/reservations"
              className="inline-block text-[9px] font-semibold tracking-wide text-[#9A7B48] hover:text-[#192B35] sm:text-xs"
            >
              ← BACK TO MY RESERVATIONS
            </Link>

            <div className="mt-4 sm:mt-5">
              <p className="text-[9px] font-semibold tracking-[0.2em] text-[#A78B5C] sm:text-[10px]">
                RESERVATION DETAILS
              </p>
              <h1 className="mt-2 font-serif text-2xl text-[#192B35] sm:text-3xl">
                Reservation Details
              </h1>
              <p className="mt-2 text-xs leading-relaxed text-[#777777] sm:text-sm">
                Complete information about your room reservation.
              </p>
            </div>
          </div>

          {/* RESERVATION STATUS */}
          <div className="flex min-w-0 flex-col items-start justify-between gap-3 border border-[#E2D8C8] bg-white p-4 sm:flex-row sm:items-center sm:gap-4 sm:p-5">
            <div className="min-w-0">
              <p className="text-[9px] tracking-[0.15em] text-[#999999] sm:text-[10px]">
                RESERVATION ID
              </p>
              <p className="mt-1 break-all text-sm font-semibold text-[#192B35]">
                {reservationId}
              </p>
            </div>

            <span className="w-fit shrink-0 rounded-full bg-[#FFF3D9] px-4 py-2 text-[10px] font-semibold text-[#9A702D] sm:text-xs">
              {reservation.reservationStatus}
            </span>
          </div>

          {/* RESERVATION CONTENT */}
          <div className="grid min-w-0 gap-5 sm:gap-6 lg:grid-cols-[1.5fr_1fr]">
            {/* ROOM AND PAYMENT DETAILS */}
            <section className="min-w-0 space-y-5 border border-[#E2D8C8] bg-white p-4 sm:space-y-6 sm:p-6">
              <div>
                <p className="text-[9px] font-semibold tracking-[0.15em] text-[#A78B5C] sm:text-[10px]">
                  ROOM INFORMATION
                </p>
                <h2 className="mt-2 font-serif text-xl text-[#192B35] sm:text-2xl">
                  {reservation.room}
                </h2>
                <p className="mt-1 text-xs text-[#777777] sm:text-sm">
                  SCA JAYA Hotel
                </p>
              </div>

              <div className="grid grid-cols-2 gap-x-3 gap-y-5 border-y border-[#EEE8DF] py-5 sm:gap-5 sm:py-6">
                <div className="min-w-0">
                  <p className="text-[9px] tracking-wide text-[#999999] sm:text-[10px]">
                    CHECK IN
                  </p>
                  <p className="mt-1.5 break-words text-xs font-semibold leading-relaxed text-[#192B35] sm:mt-2 sm:text-sm">
                    {reservation.checkIn}
                  </p>
                </div>

                <div className="min-w-0">
                  <p className="text-[9px] tracking-wide text-[#999999] sm:text-[10px]">
                    CHECK OUT
                  </p>
                  <p className="mt-1.5 break-words text-xs font-semibold leading-relaxed text-[#192B35] sm:mt-2 sm:text-sm">
                    {reservation.checkOut}
                  </p>
                </div>

                <div>
                  <p className="text-[9px] tracking-wide text-[#999999] sm:text-[10px]">
                    DURATION
                  </p>
                  <p className="mt-1.5 text-xs font-semibold text-[#192B35] sm:mt-2 sm:text-sm">
                    {reservation.nights} Nights
                  </p>
                </div>

                <div>
                  <p className="text-[9px] tracking-wide text-[#999999] sm:text-[10px]">
                    GUESTS
                  </p>
                  <p className="mt-1.5 text-xs font-semibold text-[#192B35] sm:mt-2 sm:text-sm">
                    {reservation.guests} Guests
                  </p>
                </div>
              </div>

              {/* PAYMENT INFORMATION */}
              <div>
                <p className="text-[9px] font-semibold tracking-[0.15em] text-[#A78B5C] sm:text-[10px]">
                  PAYMENT INFORMATION
                </p>

                <div className="mt-4 flex items-center justify-between gap-3">
                  <span className="text-xs text-[#777777] sm:text-sm">
                    Payment Method
                  </span>
                  <span className="text-right text-xs font-medium text-[#192B35] sm:text-sm">
                    {reservation.paymentMethod}
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3">
                  <span className="text-xs text-[#777777] sm:text-sm">
                    Payment Status
                  </span>
                  <span className="shrink-0 rounded-full bg-[#FCE9E7] px-3 py-1 text-[10px] font-semibold text-[#A94438] sm:text-xs">
                    {reservation.paymentStatus}
                  </span>
                </div>
              </div>
            </section>

            {/* PRICE SUMMARY */}
            <section className="h-fit min-w-0 border border-[#E2D8C8] bg-white p-4 sm:p-6">
              <p className="text-[9px] font-semibold tracking-[0.15em] text-[#A78B5C] sm:text-[10px]">
                PRICE SUMMARY
              </p>

              <div className="mt-5 flex justify-between gap-3 text-xs sm:mt-6 sm:text-sm">
                <span className="text-[#777777]">Room Rate / Night</span>
                <span className="text-right font-medium text-[#192B35]">
                  Rp {formatPrice(reservation.price)}
                </span>
              </div>

              <div className="mt-4 flex justify-between gap-3 text-xs sm:text-sm">
                <span className="text-[#777777]">Duration</span>
                <span className="font-medium text-[#192B35]">
                  {reservation.nights} Nights
                </span>
              </div>

              <div className="mt-5 border-t border-[#EEE8DF] pt-4 sm:mt-6 sm:pt-5">
                <p className="text-[9px] tracking-[0.15em] text-[#999999] sm:text-[10px]">
                  TOTAL PAYMENT
                </p>
                <p className="mt-2 break-words font-serif text-xl font-semibold text-[#192B35] sm:text-2xl">
                  Rp {formatPrice(reservation.total)}
                </p>
              </div>

              <Link
                href="/dashboard/guest/payment?room=Deluxe%20Room&checkIn=2026-11-20&checkOut=2026-11-23&guests=2&method=transfer"
                className="mt-5 flex w-full items-center justify-center rounded-md bg-[#C6A46A] px-3 py-3.5 text-center text-[9px] font-bold tracking-[0.1em] text-[#192B35] transition hover:bg-[#D5B77F] sm:mt-6 sm:px-5 sm:py-4 sm:text-xs sm:tracking-[0.12em]"
              >
                CONTINUE PAYMENT
              </Link>

              <p className="mt-4 text-center text-[9px] leading-relaxed text-[#999999] sm:text-[10px]">
                Payment details are currently displayed using temporary data.
              </p>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

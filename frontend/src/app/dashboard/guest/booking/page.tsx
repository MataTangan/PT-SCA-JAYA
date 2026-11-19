
"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import GuestSidebar from "@/components/guest/Sidebar";
import GuestTopbar from "@/components/guest/Topbar";

const roomPrices: Record<string, number> = {
  "Standard Room": 450000,
  "Deluxe Room": 650000,
  "Suite Room": 950000,
};

function BookingContent() {
  const searchParams = useSearchParams();

  const room = searchParams.get("room") || "Deluxe Room";
  const checkIn = searchParams.get("checkIn") || "";
  const checkOut = searchParams.get("checkOut") || "";
  const guests = Number(searchParams.get("guests") || 1);

  const [paymentMethod, setPaymentMethod] = useState("transfer");

  const startDate = new Date(`${checkIn}T00:00:00`);
  const endDate = new Date(`${checkOut}T00:00:00`);

  const totalNights =
    checkIn && checkOut
      ? Math.max(
          0,
          Math.round(
            (endDate.getTime() - startDate.getTime()) /
              (1000 * 60 * 60 * 24)
          )
        )
      : 0;

  const price = roomPrices[room] || 0;
  const totalPrice = price * totalNights;

  const formatPrice = (value: number) =>
    new Intl.NumberFormat("id-ID").format(value);

  const formatDate = (value: string) =>
    value
      ? new Date(`${value}T00:00:00`).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : "-";

  const nextUrl =
    `/dashboard/guest/payment?room=${encodeURIComponent(room)}` +
    `&checkIn=${checkIn}&checkOut=${checkOut}` +
    `&guests=${guests}&method=${paymentMethod}`;

  return (
    <div className="flex min-h-screen min-w-0 bg-[#F5F0E8]">
      <GuestSidebar />

      <div className="min-w-0 flex-1 md:ml-[210px]">
        <GuestTopbar />

        <main className="min-w-0 px-4 pb-8 pt-[80px] sm:px-6 sm:pb-10 md:px-10 md:pb-16 md:pt-[70px]">
          {/* PAGE HEADER */}
          <div className="mb-6 sm:mb-8">
            <p className="text-[9px] font-semibold tracking-[0.2em] text-[#C6A46A] sm:text-[10px]">
              RESERVATION PROCESS
            </p>
            <h1 className="mt-2 font-serif text-2xl text-[#192B35] sm:text-3xl md:text-4xl">
              Booking Confirmation
            </h1>
            <p className="mt-2 text-xs leading-relaxed text-[#77766f] sm:text-sm">
              Review your stay details and choose your payment method.
            </p>
          </div>

          <div className="grid min-w-0 gap-5 sm:gap-7 lg:grid-cols-[1.4fr_0.8fr]">
            {/* BOOKING DETAILS */}
            <section className="min-w-0 space-y-5 sm:space-y-6">
              <div className="border border-[#E2D8C8] bg-[#FFFEFC] p-4 sm:p-6">
                <h2 className="font-serif text-xl text-[#192B35] sm:text-2xl">
                  Your Stay Details
                </h2>

                <div className="mt-5 border-b border-[#E2D8C8] pb-4 sm:mt-6 sm:pb-5">
                  <p className="text-[9px] tracking-[0.15em] text-[#A78B5C]">
                    SELECTED ROOM
                  </p>
                  <p className="mt-2 font-serif text-xl text-[#192B35] sm:text-2xl">
                    {room}
                  </p>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-x-3 gap-y-5 sm:mt-5 sm:gap-6">
                  <div className="min-w-0">
                    <p className="text-[9px] tracking-[0.15em] text-[#A78B5C]">
                      CHECK IN
                    </p>
                    <p className="mt-1.5 text-xs font-semibold leading-relaxed text-[#192B35] sm:mt-2 sm:text-sm">
                      {formatDate(checkIn)}
                    </p>
                  </div>

                  <div className="min-w-0">
                    <p className="text-[9px] tracking-[0.15em] text-[#A78B5C]">
                      CHECK OUT
                    </p>
                    <p className="mt-1.5 text-xs font-semibold leading-relaxed text-[#192B35] sm:mt-2 sm:text-sm">
                      {formatDate(checkOut)}
                    </p>
                  </div>

                  <div>
                    <p className="text-[9px] tracking-[0.15em] text-[#A78B5C]">
                      GUESTS
                    </p>
                    <p className="mt-1.5 text-xs font-semibold text-[#192B35] sm:mt-2 sm:text-sm">
                      {guests} {guests === 1 ? "Guest" : "Guests"}
                    </p>
                  </div>

                  <div>
                    <p className="text-[9px] tracking-[0.15em] text-[#A78B5C]">
                      DURATION
                    </p>
                    <p className="mt-1.5 text-xs font-semibold text-[#192B35] sm:mt-2 sm:text-sm">
                      {totalNights} {totalNights === 1 ? "Night" : "Nights"}
                    </p>
                  </div>
                </div>
              </div>

              {/* PAYMENT METHOD */}
              <div className="border border-[#E2D8C8] bg-[#FFFEFC] p-4 sm:p-6">
                <h2 className="font-serif text-xl text-[#192B35] sm:text-2xl">
                  Payment Method
                </h2>

                <div className="mt-5 space-y-3">
                  <label className="flex cursor-pointer items-start gap-3 border border-[#E2D8C8] p-3 transition hover:border-[#C6A46A] sm:gap-4 sm:p-4">
                    <input
                      type="radio"
                      name="payment"
                      value="transfer"
                      checked={paymentMethod === "transfer"}
                      onChange={() => setPaymentMethod("transfer")}
                      className="mt-1 shrink-0 accent-[#192B35]"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-[#192B35] sm:text-sm">
                        Bank Transfer
                      </p>
                      <p className="mt-1 text-[11px] leading-relaxed text-[#77766f] sm:text-xs">
                        Pay through bank transfer and upload your payment
                        receipt.
                      </p>
                    </div>
                  </label>

                  <label className="flex cursor-pointer items-start gap-3 border border-[#E2D8C8] p-3 transition hover:border-[#C6A46A] sm:gap-4 sm:p-4">
                    <input
                      type="radio"
                      name="payment"
                      value="hotel"
                      checked={paymentMethod === "hotel"}
                      onChange={() => setPaymentMethod("hotel")}
                      className="mt-1 shrink-0 accent-[#192B35]"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-[#192B35] sm:text-sm">
                        Pay at Hotel
                      </p>
                      <p className="mt-1 text-[11px] leading-relaxed text-[#77766f] sm:text-xs">
                        Complete your payment directly at the hotel.
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </section>

            {/* PRICE SUMMARY */}
            <aside className="min-w-0">
              <div className="border border-[#192B35] bg-[#192B35] p-4 text-white sm:p-6">
                <p className="text-[9px] tracking-[0.2em] text-[#C6A46A] sm:text-[10px]">
                  PRICE SUMMARY
                </p>

                <h2 className="mt-3 font-serif text-xl sm:text-2xl">
                  Reservation Summary
                </h2>

                <div className="mt-5 space-y-4 border-b border-white/15 pb-5 sm:mt-7">
                  <div className="flex justify-between gap-3 text-xs sm:text-sm">
                    <span className="text-white/65">Room rate</span>
                    <span className="text-right">
                      Rp {formatPrice(price)}
                    </span>
                  </div>

                  <div className="flex justify-between gap-3 text-xs sm:text-sm">
                    <span className="text-white/65">Duration</span>
                    <span>{totalNights} nights</span>
                  </div>

                  <div className="flex justify-between gap-3 text-xs sm:text-sm">
                    <span className="text-white/65">Guests</span>
                    <span>{guests} guests</span>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs text-white/65 sm:text-sm">
                    Estimated Total
                  </span>
                  <span className="font-serif text-xl text-[#C6A46A] sm:text-2xl">
                    Rp {formatPrice(totalPrice)}
                  </span>
                </div>

                <Link
                  href={nextUrl}
                  className="mt-6 flex w-full items-center justify-center rounded-md bg-[#C6A46A] px-4 py-3.5 text-center text-[10px] font-bold tracking-[0.15em] text-[#192B35] transition hover:bg-[#D5B77F] sm:mt-8 sm:px-5 sm:py-4"
                >
                  CONTINUE
                </Link>

                <p className="mt-4 text-center text-[9px] leading-5 text-white/50 sm:text-[10px]">
                  This is a temporary booking preview. Final reservation
                  confirmation will be processed after backend integration.
                </p>
              </div>

              <Link
                href="/dashboard/guest"
                className="mt-4 block text-center text-xs text-[#77766f] transition hover:text-[#192B35] sm:mt-5"
              >
                ← Back to Dashboard
              </Link>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#F5F0E8]" />}>
      <BookingContent />
    </Suspense>
  );
}

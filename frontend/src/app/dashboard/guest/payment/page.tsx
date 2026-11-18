
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

function formatPrice(price: number) {
  return new Intl.NumberFormat("id-ID").format(price);
}

function PaymentContent() {
  const searchParams = useSearchParams();

  const room = searchParams.get("room") || "Deluxe Room";
  const checkIn = searchParams.get("checkIn") || "";
  const checkOut = searchParams.get("checkOut") || "";
  const guests = Number(searchParams.get("guests") || "1");
  const method = searchParams.get("method") || "transfer";

  const [proofFile, setProofFile] = useState<File | null>(null);

  const price = roomPrices[room] || roomPrices["Deluxe Room"];

  const dateIn = checkIn ? new Date(`${checkIn}T00:00:00`) : null;
  const dateOut = checkOut ? new Date(`${checkOut}T00:00:00`) : null;

  const totalNights =
    dateIn && dateOut
      ? Math.max(
          0,
          Math.ceil(
            (dateOut.getTime() - dateIn.getTime()) /
              (1000 * 60 * 60 * 24),
          ),
        )
      : 0;

  const totalPrice = price * totalNights;

  const formatDate = (date: string) => {
    if (!date) return "-";
    return new Date(`${date}T00:00:00`).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

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
              Payment
            </h1>
            <p className="mt-2 text-xs leading-relaxed text-[#77766f] sm:text-sm">
              Complete your payment details to proceed with your reservation.
            </p>
          </div>

          <div className="grid min-w-0 gap-5 sm:gap-7 lg:grid-cols-[1.4fr_0.8fr]">
            <section className="min-w-0 space-y-5 sm:space-y-6">
              {method === "transfer" ? (
                <>
                  {/* BANK TRANSFER */}
                  <div className="border border-[#E2D8C8] bg-[#FFFEFC] p-4 sm:p-6">
                    <h2 className="font-serif text-xl text-[#192B35] sm:text-2xl">
                      Bank Transfer
                    </h2>
                    <p className="mt-2 text-xs leading-relaxed text-[#77766f] sm:text-sm">
                      Please transfer the payment to the following account.
                    </p>

                    <div className="mt-5 border border-[#E2D8C8] bg-[#F5F0E8] p-4 sm:mt-6 sm:p-5">
                      <p className="text-[9px] tracking-[0.15em] text-[#A78B5C]">
                        BANK ACCOUNT
                      </p>
                      <p className="mt-3 font-serif text-2xl text-[#192B35]">
                        BCA
                      </p>
                      <p className="mt-2 break-words text-xs leading-relaxed text-[#192B35] sm:text-sm">
                        Account Number: <strong>Backend Pending</strong>
                      </p>
                      <p className="mt-1 break-words text-xs leading-relaxed text-[#192B35] sm:text-sm">
                        Account Name: <strong>SCA JAYA Hotel</strong>
                      </p>
                      <p className="mt-3 text-[11px] leading-relaxed text-[#77766f] sm:text-xs">
                        Bank account details will be provided by the hotel.
                      </p>
                    </div>
                  </div>

                  {/* UPLOAD PAYMENT PROOF */}
                  <div className="border border-[#E2D8C8] bg-[#FFFEFC] p-4 sm:p-6">
                    <h2 className="font-serif text-xl text-[#192B35] sm:text-2xl">
                      Upload Payment Proof
                    </h2>
                    <p className="mt-2 text-xs leading-relaxed text-[#77766f] sm:text-sm">
                      Select your transfer receipt. Upload functionality will
                      be connected to the backend later.
                    </p>

                    <label className="mt-5 flex cursor-pointer flex-col items-center justify-center border-2 border-dashed border-[#D8CDBB] bg-[#F5F0E8] px-3 py-7 text-center transition hover:border-[#C6A46A] sm:px-5 sm:py-9">
                      <span className="text-3xl text-[#A78B5C]">↑</span>
                      <span className="mt-3 text-xs font-semibold text-[#192B35] sm:text-sm">
                        Choose payment receipt
                      </span>
                      <span className="mt-1 text-[11px] text-[#77766f] sm:text-xs">
                        PNG, JPG, or PDF
                      </span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,application/pdf"
                        className="hidden"
                        onChange={(event) =>
                          setProofFile(event.target.files?.[0] || null)
                        }
                      />
                    </label>

                    {proofFile && (
                      <p className="mt-3 break-all text-xs leading-relaxed text-[#192B35] sm:text-sm">
                        Selected file: <strong>{proofFile.name}</strong>
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <div className="border border-[#E2D8C8] bg-[#FFFEFC] p-4 sm:p-6">
                  <h2 className="font-serif text-xl text-[#192B35] sm:text-2xl">
                    Pay at Hotel
                  </h2>
                  <p className="mt-3 text-xs leading-6 text-[#77766f] sm:text-sm sm:leading-7">
                    You have selected Pay at Hotel. Please complete your
                    payment directly at the reception desk when you arrive.
                  </p>
                  <div className="mt-5 border border-[#E2D8C8] bg-[#F5F0E8] p-4 sm:p-5">
                    <p className="text-[9px] font-semibold tracking-[0.15em] text-[#A78B5C] sm:text-[10px]">
                      PAYMENT REMINDER
                    </p>
                    <p className="mt-2 text-xs leading-6 text-[#192B35] sm:text-sm">
                      Your reservation will be subject to confirmation by the
                      hotel staff.
                    </p>
                  </div>
                </div>
              )}
            </section>

            {/* PAYMENT SUMMARY */}
            <aside className="min-w-0">
              <div className="border border-[#192B35] bg-[#192B35] p-4 text-white sm:p-6">
                <p className="text-[9px] tracking-[0.2em] text-[#C6A46A] sm:text-[10px]">
                  PAYMENT SUMMARY
                </p>
                <h2 className="mt-3 font-serif text-xl sm:text-2xl">
                  Reservation Details
                </h2>

                <div className="mt-5 space-y-4 border-b border-white/15 pb-5 sm:mt-7">
                  <div>
                    <p className="text-[11px] text-white/60 sm:text-xs">
                      Selected Room
                    </p>
                    <p className="mt-1 break-words text-sm font-semibold">
                      {room}
                    </p>
                  </div>

                  <div className="flex justify-between gap-3 text-xs sm:text-sm">
                    <span className="text-white/60">Check-in</span>
                    <span className="text-right">{formatDate(checkIn)}</span>
                  </div>

                  <div className="flex justify-between gap-3 text-xs sm:text-sm">
                    <span className="text-white/60">Check-out</span>
                    <span className="text-right">{formatDate(checkOut)}</span>
                  </div>

                  <div className="flex justify-between gap-3 text-xs sm:text-sm">
                    <span className="text-white/60">Guests</span>
                    <span>{guests}</span>
                  </div>

                  <div className="flex justify-between gap-3 text-xs sm:text-sm">
                    <span className="text-white/60">Duration</span>
                    <span>{totalNights} nights</span>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs text-white/60 sm:text-sm">
                    Total Payment
                  </span>
                  <span className="font-serif text-xl text-[#C6A46A] sm:text-2xl">
                    Rp {formatPrice(totalPrice)}
                  </span>
                </div>

                <button
                  type="button"
                  disabled={method === "transfer" && !proofFile}
                  className="mt-6 w-full rounded-md bg-[#C6A46A] px-4 py-3.5 text-center text-[9px] font-bold tracking-[0.12em] text-[#192B35] transition hover:bg-[#D5B77F] disabled:cursor-not-allowed disabled:opacity-40 sm:mt-8 sm:px-5 sm:py-4 sm:text-[10px] sm:tracking-[0.15em]"
                >
                  {method === "transfer"
                    ? "SUBMIT PAYMENT PROOF"
                    : "CONFIRM RESERVATION"}
                </button>

                <p className="mt-4 text-center text-[9px] leading-5 text-white/50 sm:text-[10px]">
                  Payment submission will be activated after backend
                  integration.
                </p>
              </div>

              <Link
                href={`/dashboard/guest/booking?room=${encodeURIComponent(room)}&checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`}
                className="mt-4 block text-center text-xs leading-relaxed text-[#77766f] transition hover:text-[#192B35] sm:mt-5"
              >
                ← Back to Booking Confirmation
              </Link>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#F5F0E8]" />}>
      <PaymentContent />
    </Suspense>
  );
}

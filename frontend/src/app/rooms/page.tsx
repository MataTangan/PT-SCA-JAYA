
"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

const rooms = [
  {
    number: "01",
    name: "Standard Room",
    description: "A refined space for a restful and comfortable stay.",
    price: 450000,
    size: "24 m²",
    capacity: 2,
    image:
      "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1000&q=90",
    tag: "ESSENTIAL COMFORT",
  },
  {
    number: "02",
    name: "Deluxe Room",
    description: "More room to unwind, with thoughtful details throughout.",
    price: 650000,
    size: "32 m²",
    capacity: 2,
    image:
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1000&q=90",
    tag: "MOST LOVED",
  },
  {
    number: "03",
    name: "Suite Room",
    description: "An elevated retreat for an exceptional experience.",
    price: 950000,
    size: "48 m²",
    capacity: 4,
    image:
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1000&q=90",
    tag: "EXCLUSIVE STAY",
  },
];

function RoomSearchResults() {
  const searchParams = useSearchParams();

  const checkIn = searchParams.get("checkIn") || "";
  const checkOut = searchParams.get("checkOut") || "";
  const guests = Number(searchParams.get("guests") || 1);

  const startDate = new Date(`${checkIn}T00:00:00`);
  const endDate = new Date(`${checkOut}T00:00:00`);

  const totalNights = Math.round(
    (endDate.getTime() - startDate.getTime()) /
      (1000 * 60 * 60 * 24)
  );

  const isValidSearch =
    /^\d{4}-\d{2}-\d{2}$/.test(checkIn) &&
    /^\d{4}-\d{2}-\d{2}$/.test(checkOut) &&
    !isNaN(startDate.getTime()) &&
    !isNaN(endDate.getTime()) &&
    totalNights > 0 &&
    guests >= 1 &&
    guests <= 4;

  const availableRooms = isValidSearch
    ? rooms.filter((room) => room.capacity >= guests)
    : [];

  const formatDate = (date: string) =>
    new Date(`${date}T00:00:00`).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("id-ID").format(price);

  return (
    <main className="min-h-screen bg-[#faf8f3] text-[#192a40]">
      {/* NAVIGATION */}
      <header className="border-b border-[#e7e0d5] bg-white">
        <nav className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 py-4 sm:px-6 sm:py-5 md:px-12">
          <Link href="/" className="flex min-w-0 items-center">
            <img
              src="/logo-sca.png"
              alt="SCA JAYA Hotel"
              className="h-9 w-auto sm:h-11"
            />
          </Link>

          <Link
            href="/"
            className="shrink-0 text-[9px] font-semibold tracking-[0.12em] text-[#192a40] transition hover:text-[#a78b5c] sm:text-[10px] sm:tracking-[0.18em]"
          >
            BACK TO HOME
          </Link>
        </nav>
      </header>

      {/* PAGE INTRO */}
      <section className="mx-auto max-w-[1200px] px-5 pb-7 pt-10 sm:px-6 sm:pb-8 sm:pt-14 md:px-12">
        <p className="mb-3 text-[9px] tracking-[0.25em] text-[#a78b5c] sm:text-[10px] sm:tracking-[0.3em]">
          SCA JAYA HOTEL
        </p>

        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl">
          Find Your <span className="italic text-[#a78b5c]">Stay.</span>
        </h1>

        <p className="mt-3 text-xs leading-6 text-[#77766f] sm:text-sm">
          Discover the perfect room for your stay with us.
        </p>
      </section>

      {/* SEARCH SUMMARY */}
      <section className="mx-auto max-w-[1200px] px-5 sm:px-6 md:px-12">
        <div className="grid grid-cols-2 gap-x-3 gap-y-5 border border-[#192a40] bg-[#192a40] p-4 text-center text-white shadow-md sm:gap-4 sm:p-5 md:grid-cols-4 md:p-6">
          <div className="min-w-0">
            <p className="text-[8px] tracking-[0.12em] text-[#dfc18a] sm:text-[9px] sm:tracking-[0.18em]">
              CHECK IN
            </p>
            <p className="mt-2 text-xs font-medium sm:text-sm">
              {isValidSearch ? formatDate(checkIn) : "Invalid date"}
            </p>
          </div>

          <div className="min-w-0">
            <p className="text-[8px] tracking-[0.12em] text-[#dfc18a] sm:text-[9px] sm:tracking-[0.18em]">
              CHECK OUT
            </p>
            <p className="mt-2 text-xs font-medium sm:text-sm">
              {isValidSearch ? formatDate(checkOut) : "Invalid date"}
            </p>
          </div>

          <div className="min-w-0">
            <p className="text-[8px] tracking-[0.12em] text-[#a78b5c] sm:text-[9px] sm:tracking-[0.18em]">
              GUESTS
            </p>
            <p className="mt-2 text-xs font-medium sm:text-sm">
              {guests} {guests === 1 ? "Guest" : "Guests"}
            </p>
          </div>

          <div className="min-w-0">
            <p className="text-[8px] tracking-[0.12em] text-[#a78b5c] sm:text-[9px] sm:tracking-[0.18em]">
              DURATION
            </p>
            <p className="mt-2 text-xs font-medium sm:text-sm">
              {isValidSearch
                ? `${totalNights} ${totalNights === 1 ? "Night" : "Nights"}`
                : "-"}
            </p>
          </div>
        </div>
      </section>

      {/* ROOM RESULTS */}
      <section className="mx-auto max-w-[1200px] px-5 py-9 sm:px-6 sm:py-12 md:px-12">
        <div className="mb-7 flex flex-col items-start justify-between gap-5 sm:mb-8 sm:flex-row sm:items-center">
          <div>
            <p className="text-[9px] tracking-[0.2em] text-[#a78b5c] sm:text-[10px] sm:tracking-[0.25em]">
              ACCOMMODATION
            </p>
            <h2 className="mt-2 font-serif text-2xl sm:text-3xl">
              Available Room Types
            </h2>
          </div>

          <Link
            href="/#booking"
            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#192a40] px-5 py-3 text-[9px] font-bold tracking-[0.12em] !text-white shadow-sm transition hover:bg-[#c6a46a] hover:!text-[#192a40] sm:w-auto sm:text-[10px] sm:tracking-[0.15em]"
          >
            Modify Search
          </Link>
        </div>

        {!isValidSearch ? (
          <div className="border border-[#e7e0d5] bg-white p-6 text-center sm:p-10">
            <h3 className="font-serif text-xl sm:text-2xl">
              Invalid Search
            </h3>
            <p className="mt-3 text-xs leading-6 text-[#77766f] sm:text-sm">
              Please return to the booking panel and select valid dates and guests.
            </p>
            <Link
              href="/#booking"
              className="mt-6 inline-block bg-[#192a40] px-7 py-3 text-xs font-semibold tracking-widest text-white"
            >
              SEARCH AGAIN
            </Link>
          </div>
        ) : availableRooms.length === 0 ? (
          <div className="border border-[#e7e0d5] bg-white p-6 text-center sm:p-10">
            <h3 className="font-serif text-xl sm:text-2xl">
              No Suitable Room Types
            </h3>
            <p className="mt-3 text-xs leading-6 text-[#77766f] sm:text-sm">
              No room type matches the number of guests selected.
            </p>
          </div>
        ) : (
          <div className="space-y-6 sm:space-y-7">
            {availableRooms.map((room) => (
              <article
                key={room.number}
                className="grid overflow-hidden border border-[#e7e0d5] bg-white md:grid-cols-[35%_65%]"
              >
                <div className="relative min-h-[210px] sm:min-h-[250px] md:min-h-[250px]">
                  <img
                    src={room.image}
                    alt={room.name}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </div>

                <div className="flex flex-col justify-between p-5 sm:p-6 md:p-8">
                  <div>
                    <p className="text-[8px] tracking-[0.16em] text-[#a78b5c] sm:text-[9px] sm:tracking-[0.2em]">
                      {room.tag}
                    </p>

                    <h3 className="mt-2 font-serif text-2xl sm:text-3xl">
                      {room.name}
                    </h3>

                    <p className="mt-3 text-xs leading-6 text-[#77766f] sm:text-sm sm:leading-7">
                      {room.description}
                    </p>

                    <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-[11px] text-[#77766f] sm:mt-6 sm:gap-x-7 sm:text-xs">
                      <span>{room.size}</span>
                      <span>Up to {room.capacity} Guests</span>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col items-stretch justify-between gap-4 border-t border-[#eee8df] pt-5 sm:mt-8 sm:flex-row sm:items-end sm:gap-5 sm:pt-6">
                    <div className="w-full max-w-[360px] rounded-lg bg-[#192a40] px-5 py-4 text-white sm:px-6 sm:py-5">
                      <p className="text-[9px] tracking-[0.15em] text-[#dfc18a]">
                        ROOM RATE
                      </p>

                      <p className="mt-2 font-serif text-xl sm:text-2xl">
                        Rp {formatPrice(room.price)}
                      </p>

                      <p className="mt-1 text-[10px] text-white/60">
                        per room / night
                      </p>

                      <div className="mt-3 border-t border-white/15 pt-3">
                        <p className="text-[9px] text-white/60 sm:text-[10px]">
                          ESTIMATED TOTAL · {totalNights} NIGHTS
                        </p>
                        <p className="mt-1 text-base font-semibold text-[#dfc18a] sm:text-lg">
                          Rp {formatPrice(room.price * totalNights)}
                        </p>
                      </div>
                    </div>

                    <Link
                      href={`/login?room=${encodeURIComponent(room.name)}&checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`}
                      className="inline-flex w-full items-center justify-center rounded-sm bg-[#c6a46a] px-6 py-4 text-[10px] font-bold tracking-[0.15em] text-[#192a40] shadow-sm transition hover:bg-[#d5b77f] sm:w-auto sm:px-8"
                    >
                      RESERVE NOW
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        <p className="mt-7 text-center text-[9px] leading-5 text-[#99948b] sm:mt-8 sm:text-[10px] sm:leading-6">
          Room rates and availability shown are temporary demonstration data
          and will be connected to the hotel database.
        </p>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#e7e0d5] bg-white px-5 py-7 text-center sm:px-6 sm:py-8">
        <p className="text-[8px] tracking-[0.18em] text-[#aaa69e] sm:text-[9px] sm:tracking-[0.25em]">
          © 2026 SCA JAYA HOTEL — HOSPITALITY
        </p>
      </footer>
    </main>
  );
}

export default function RoomsPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#faf8f3] px-5 text-center text-sm text-[#77766f]">
          Loading available rooms...
        </main>
      }
    >
      <RoomSearchResults />
    </Suspense>
  );
}

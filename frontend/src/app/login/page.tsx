
"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginContent() {
  const searchParams = useSearchParams();

  const room = searchParams.get("room");
  const checkIn = searchParams.get("checkIn");
  const checkOut = searchParams.get("checkOut");
  const guests = searchParams.get("guests");

  const hasBookingDetails = room && checkIn && checkOut && guests;

  return (
    <main className="grid min-h-screen bg-[#faf8f3] md:grid-cols-2">
      {/* LEFT SIDE */}
      <section
        className="relative hidden min-h-screen flex-col justify-between bg-cover bg-center p-12 text-white md:flex"
        style={{ backgroundImage: "url('/hero-hotel.png')" }}
      >
        <div className="absolute inset-0 bg-[#17263d]/65" />

        <div className="relative z-10">
          <p className="font-serif text-3xl tracking-wide">
            SCA JAYA
          </p>
          <p className="mt-1 text-[9px] tracking-[0.35em]">
            HOTEL MANAGEMENT
          </p>
        </div>

        <div className="relative z-10 max-w-lg pb-8 -translate-y-10">
          <p className="mb-5 text-[10px] tracking-[0.3em] text-[#dfc18a]">
            WELCOME BACK
          </p>
          <h1 className="font-serif text-5xl leading-tight lg:text-6xl">
            Your comfort,
            <br />
            our <span className="italic text-[#dfc18a]">priority.</span>
          </h1>
          <p className="mt-6 max-w-sm text-sm leading-7 text-white/75">
            Experience comfort and thoughtful hospitality
            with SCA JAYA. Your journey begins here.
          </p>
        </div>

        <p className="relative z-10 text-[9px] tracking-[0.2em] text-white/60">
          © 2026 SCA JAYA HOTEL
        </p>
      </section>

      {/* RIGHT SIDE */}
      <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8 sm:py-12 md:px-12">
        <div className="w-full max-w-md">
          <div className="mb-9 sm:mb-12 md:hidden">
            <p className="font-serif text-3xl text-[#192a40]">
              SCA JAYA
            </p>
            <p className="mt-1 text-[9px] tracking-[0.3em] text-[#a28a61]">
              HOTEL MANAGEMENT
            </p>
          </div>

          <div className="mb-8 sm:mb-10">
            <p className="mb-3 text-[9px] tracking-[0.22em] text-[#a28a61] sm:mb-4 sm:text-[10px] sm:tracking-[0.3em]">
              YOUR JOURNEY STARTS HERE
            </p>
            <h2 className="font-serif text-4xl text-[#192a40] sm:text-5xl">
              Welcome <span className="italic text-[#a78b5c]">Back.</span>
            </h2>
            <p className="mt-3 text-xs leading-6 text-[#77766f] sm:mt-4 sm:text-sm sm:leading-7">
              Sign in to access your SCA JAYA account
              and manage your stay.
            </p>

            {hasBookingDetails && (
              <div className="mt-6 mb-7 rounded-lg border border-[#ded7c9] bg-white p-4 sm:mt-0 sm:mb-8 sm:p-5">
                <p className="text-[9px] font-semibold tracking-[0.2em] text-[#a78b5c]">
                  YOUR SELECTED STAY
                </p>

                <p className="mt-3 break-words font-serif text-lg text-[#192a40] sm:text-xl">
                  {room}
                </p>

                <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-4 border-t border-[#eee8df] pt-4 sm:gap-4">
                  <div>
                    <p className="text-[8px] tracking-[0.12em] text-[#a78b5c] sm:text-[9px] sm:tracking-[0.15em]">
                      CHECK IN
                    </p>
                    <p className="mt-1 text-xs font-medium text-[#192a40]">
                      {checkIn}
                    </p>
                  </div>

                  <div>
                    <p className="text-[8px] tracking-[0.12em] text-[#a78b5c] sm:text-[9px] sm:tracking-[0.15em]">
                      CHECK OUT
                    </p>
                    <p className="mt-1 text-xs font-medium text-[#192a40]">
                      {checkOut}
                    </p>
                  </div>

                  <div>
                    <p className="text-[8px] tracking-[0.12em] text-[#a78b5c] sm:text-[9px] sm:tracking-[0.15em]">
                      GUESTS
                    </p>
                    <p className="mt-1 text-xs font-medium text-[#192a40]">
                      {guests} {guests === "1" ? "Guest" : "Guests"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <form className="space-y-5 sm:space-y-6">
            <div>
              <label className="mb-2 block text-[9px] font-semibold tracking-[0.12em] text-[#192a40] sm:text-[10px] sm:tracking-[0.15em]">
                EMAIL ADDRESS
              </label>
              <input
                type="email"
                placeholder="Enter your email address"
                className="h-11 w-full border border-[#ded7c9] bg-white px-4 text-xs text-[#192a40] outline-none transition focus:border-[#b99a62] sm:h-12 sm:text-sm"
              />
            </div>

            <div>
              <label className="mb-2 block text-[9px] font-semibold tracking-[0.12em] text-[#192a40] sm:text-[10px] sm:tracking-[0.15em]">
                PASSWORD
              </label>
              <input
                type="password"
                placeholder="Enter your password"
                className="h-11 w-full border border-[#ded7c9] bg-white px-4 text-xs text-[#192a40] outline-none transition focus:border-[#b99a62] sm:h-12 sm:text-sm"
              />
            </div>

            <div className="flex justify-end">
              <Link
                href="/forgot-password"
                className="text-[11px] text-[#a28a61] transition hover:text-[#192a40] sm:text-xs"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="button"
              className="h-11 w-full bg-[#192a40] text-[9px] font-semibold tracking-[0.2em] text-[#dfc18a] transition hover:bg-[#a78b5c] hover:text-white sm:h-12 sm:text-[10px]"
            >
              SIGN IN
            </button>
          </form>

          <p className="mt-7 text-center text-xs text-[#77766f] sm:mt-8 sm:text-sm">
            Don't have an account?{" "}
            <Link
              href="/register"
              className="font-semibold text-[#a28a61] hover:text-[#192a40]"
            >
              Create Account
            </Link>
          </p>

          <div className="mt-9 flex items-center justify-center gap-3 sm:mt-12">
            <span className="h-px w-7 bg-[#ded7c9] sm:w-10" />
            <span className="text-[8px] tracking-[0.15em] text-[#aaa49a] sm:text-[9px] sm:tracking-[0.2em]">
              SCA JAYA HOSPITALITY
            </span>
            <span className="h-px w-7 bg-[#ded7c9] sm:w-10" />
          </div>
        </div>
      </section>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={<main className="min-h-screen bg-[#faf8f3]" />}
    >
      <LoginContent />
    </Suspense>
  );
}

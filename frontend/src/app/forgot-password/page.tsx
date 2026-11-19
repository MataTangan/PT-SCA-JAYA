
"use client";

import Link from "next/link";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(
      "Password recovery will be available once the system is connected."
    );
  }

  return (
    <main className="grid min-h-screen bg-[#faf8f3] md:grid-cols-2">
      {/* LEFT SIDE */}
      <section
        className="relative hidden min-h-screen flex-col justify-between bg-cover bg-center p-12 text-white md:flex"
        style={{ backgroundImage: "url('/hero-hotel.png')" }}
      >
        <div className="absolute inset-0 bg-[#17263d]/65" />

        <div className="relative z-10">
          <p className="font-serif text-3xl tracking-wide">SCA JAYA</p>
          <p className="mt-1 text-[9px] tracking-[0.35em]">
            HOTEL MANAGEMENT
          </p>
        </div>

        <div className="relative z-10 max-w-lg -translate-y-10 pb-8">
          <p className="mb-5 text-[10px] tracking-[0.3em] text-[#dfc18a]">
            ACCOUNT RECOVERY
          </p>

          <h1 className="font-serif text-5xl leading-tight lg:text-6xl">
            A fresh start,
            <br />
            <span className="italic text-[#dfc18a]">
              just one step away.
            </span>
          </h1>

          <p className="mt-6 max-w-sm text-sm leading-7 text-white/75">
            Don't worry. We'll help you get back to your
            SCA JAYA account and continue your journey.
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
              PASSWORD RECOVERY
            </p>

            <h2 className="font-serif text-4xl text-[#192a40] sm:text-5xl">
              Forgot{" "}
              <span className="italic text-[#a78b5c]">Password?</span>
            </h2>

            <p className="mt-3 text-xs leading-6 text-[#77766f] sm:mt-4 sm:text-sm sm:leading-7">
              Enter the email address associated with your account.
              We'll help you recover access to your account.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            <div>
              <label className="mb-2 block text-[9px] font-semibold tracking-[0.12em] text-[#192a40] sm:text-[10px] sm:tracking-[0.18em]">
                EMAIL ADDRESS
              </label>

              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="h-11 w-full rounded-lg border border-[#e2ddd3] bg-white px-3 text-xs text-[#192a40] outline-none transition placeholder:text-[#aaa69e] focus:border-[#a78b5c] focus:ring-1 focus:ring-[#a78b5c] sm:h-12 sm:px-4 sm:text-sm"
              />
            </div>

            <button
              type="submit"
              className="h-11 w-full rounded-lg bg-[#192a40] text-[10px] font-semibold tracking-[0.16em] text-white transition hover:bg-[#263c55] sm:h-12 sm:text-xs sm:tracking-[0.2em]"
            >
              SEND RESET LINK
            </button>

            {message && (
              <p className="rounded-lg bg-[#f1e9da] p-3 text-center text-[11px] leading-6 text-[#776344] sm:p-4 sm:text-xs">
                {message}
              </p>
            )}
          </form>

          <p className="mt-8 text-center text-xs text-[#77766f] sm:mt-10 sm:text-sm">
            Remember your password?{" "}
            <Link
              href="/login"
              className="font-semibold text-[#a78b5c] transition hover:text-[#192a40]"
            >
              Back to Login
            </Link>
          </p>

          <div className="mt-8 border-t border-[#e7e0d5] pt-5 text-center sm:mt-12 sm:pt-6">
            <p className="text-[8px] tracking-[0.2em] text-[#aaa69e] sm:text-[9px] sm:tracking-[0.25em]">
              SCA JAYA HOSPITALITY
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}


"use client";

import Link from "next/link";
import { useState } from "react";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");

    if (password.length < 8) {
      setMessage("Password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match. Please try again.");
      return;
    }

    setMessage(
      "Registration will be available once the system is connected."
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

        <div className="relative z-10 max-w-lg -translate-y-35 pb-8">
          <p className="mb-5 text-[10px] tracking-[0.3em] text-[#dfc18a]">
            JOIN OUR HOSPITALITY
          </p>

          <h1 className="font-serif text-5xl leading-tight lg:text-6xl">
            Begin Your
            <br />
            <span className="italic text-[#dfc18a]">Stay With Us</span>
          </h1>

          <p className="mt-6 max-w-sm text-sm leading-7 text-white/75">
            Create your account and enjoy a seamless hotel reservation
            experience with SCA JAYA.
          </p>
        </div>

        <p className="relative z-10 text-[9px] tracking-[0.2em] text-white/60">
          © 2026 SCA JAYA HOTEL
        </p>
      </section>

      {/* RIGHT SIDE */}
      <section className="flex min-h-screen items-center justify-center px-5 py-9 sm:px-8 sm:py-10 md:px-12">
        <div className="w-full max-w-md">
          <div className="mb-7 sm:mb-8 md:hidden">
            <p className="font-serif text-3xl text-[#192a40]">SCA JAYA</p>
            <p className="mt-1 text-[9px] tracking-[0.3em] text-[#a28a61]">
              HOTEL MANAGEMENT
            </p>
          </div>

          <div className="mb-7 sm:mb-8">
            <p className="mb-3 text-[9px] tracking-[0.22em] text-[#a28a61] sm:text-[10px] sm:tracking-[0.3em]">
              YOUR JOURNEY STARTS HERE
            </p>

            <h2 className="font-serif text-4xl text-[#192a40] sm:text-5xl">
              Create <span className="italic text-[#a78b5c]">Account.</span>
            </h2>

            <p className="mt-3 text-xs leading-6 text-[#77766f] sm:mt-4 sm:text-sm sm:leading-7">
              Register to start your comfortable stay with us.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-[9px] font-semibold tracking-[0.12em] text-[#192a40] sm:text-[10px] sm:tracking-[0.18em]">
                FULL NAME
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                className="h-11 w-full rounded-lg border border-[#e2ddd3] bg-white px-3 text-xs text-[#192a40] outline-none transition placeholder:text-[#aaa69e] focus:border-[#a78b5c] focus:ring-1 focus:ring-[#a78b5c] sm:h-12 sm:px-4 sm:text-sm"
              />
            </div>

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

            <div>
              <label className="mb-2 block text-[9px] font-semibold tracking-[0.12em] text-[#192a40] sm:text-[10px] sm:tracking-[0.18em]">
                PHONE NUMBER
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter your phone number"
                className="h-11 w-full rounded-lg border border-[#e2ddd3] bg-white px-3 text-xs text-[#192a40] outline-none transition placeholder:text-[#aaa69e] focus:border-[#a78b5c] focus:ring-1 focus:ring-[#a78b5c] sm:h-12 sm:px-4 sm:text-sm"
              />
            </div>

            <div>
              <label className="mb-2 block text-[9px] font-semibold tracking-[0.12em] text-[#192a40] sm:text-[10px] sm:tracking-[0.18em]">
                PASSWORD
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                className="h-11 w-full rounded-lg border border-[#e2ddd3] bg-white px-3 text-xs text-[#192a40] outline-none transition placeholder:text-[#aaa69e] focus:border-[#a78b5c] focus:ring-1 focus:ring-[#a78b5c] sm:h-12 sm:px-4 sm:text-sm"
              />
            </div>

            <div>
              <label className="mb-2 block text-[9px] font-semibold tracking-[0.12em] text-[#192a40] sm:text-[10px] sm:tracking-[0.18em]">
                CONFIRM PASSWORD
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                className="h-11 w-full rounded-lg border border-[#e2ddd3] bg-white px-3 text-xs text-[#192a40] outline-none transition placeholder:text-[#aaa69e] focus:border-[#a78b5c] focus:ring-1 focus:ring-[#a78b5c] sm:h-12 sm:px-4 sm:text-sm"
              />
            </div>

            <button
              type="submit"
              className="h-11 w-full rounded-lg bg-[#192a40] text-[10px] font-semibold tracking-[0.16em] text-white transition hover:bg-[#263c55] sm:h-12 sm:text-xs sm:tracking-[0.2em]"
            >
              CREATE ACCOUNT
            </button>

            {message && (
              <p className="rounded-lg bg-[#f1e9da] p-3 text-center text-[11px] leading-6 text-[#776344] sm:p-4 sm:text-xs">
                {message}
              </p>
            )}
          </form>

          <p className="mt-6 text-center text-xs text-[#77766f] sm:mt-7 sm:text-sm">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-[#a78b5c] transition hover:text-[#192a40]"
            >
              Sign In
            </Link>
          </p>

          <div className="mt-8 border-t border-[#e7e0d5] pt-5 text-center sm:mt-10 sm:pt-6">
            <p className="text-[8px] tracking-[0.2em] text-[#aaa69e] sm:text-[9px] sm:tracking-[0.25em]">
              SCA JAYA HOSPITALITY
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

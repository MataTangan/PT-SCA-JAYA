
import Link from "next/link";

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-[#faf8f3] md:grid md:grid-cols-2">
      {/* LEFT SIDE */}
      <section className="relative hidden min-h-screen overflow-hidden md:flex md:items-start">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/hero-hotel.png')" }}
        />
        <div className="absolute inset-0 bg-[#17263d]/65" />

        <div className="relative z-10 p-14 pt-20 text-white">
          <p className="mb-5 text-sm tracking-[0.35em] text-[#dfc18a]">
            SCA JAYA HOTEL
          </p>

          <h1 className="mb-5 font-serif text-5xl leading-tight">
            Begin Your
            <br />
            Stay With Us.
          </h1>

          <p className="max-w-md text-sm leading-7 text-white/75">
            Create your account and enjoy a seamless hotel reservation
            experience with SCA JAYA.
          </p>

          <div className="mt-10">
            <div className="mb-4 h-px w-16 bg-[#dfc18a]" />

            <p className="font-serif text-2xl italic tracking-wide text-[#dfc18a]">
                SCA JAYA
            </p>

            <p className="mt-1 text-[10px] tracking-[0.35em] text-white/60">
                HOTEL & HOSPITALITY
            </p>
            </div>
        </div>
      </section>

      {/* RIGHT SIDE */}
      <section className="flex min-h-screen items-center justify-center px-6 py-10 md:px-14">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <p className="mb-3 text-xs tracking-[0.3em] text-[#b99a62]">
              SCA JAYA HOTEL
            </p>

            <h2 className="font-serif text-4xl text-[#17263d]">
              Create Account
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Register to start your comfortable stay with us.
            </p>
          </div>

          <form className="space-y-4">
            <div>
              <label className="mb-2 block text-sm text-[#17263d]">
                Full Name
              </label>
              <input
                type="text"
                placeholder="Enter your full name"
                className="w-full border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#b99a62]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-[#17263d]">
                Email Address
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#b99a62]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-[#17263d]">
                Phone Number
              </label>
              <input
                type="tel"
                placeholder="Enter your phone number"
                className="w-full border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#b99a62]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-[#17263d]">
                Password
              </label>
              <input
                type="password"
                placeholder="Create a password"
                className="w-full border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#b99a62]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-[#17263d]">
                Confirm Password
              </label>
              <input
                type="password"
                placeholder="Confirm your password"
                className="w-full border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#b99a62]"
              />
            </div>

            <button
              type="button"
              className="w-full bg-[#17263d] py-3.5 text-sm tracking-widest text-white transition hover:bg-[#263b58]"
            >
              CREATE ACCOUNT
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-[#b99a62] hover:underline"
            >
              Sign In
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}

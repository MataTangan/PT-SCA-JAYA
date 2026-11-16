
import Link from "next/link";

export default function LoginPage() {
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
      <section className="flex min-h-screen items-center justify-center px-6 py-12 md:px-12">
        <div className="w-full max-w-md">
          <div className="mb-12 md:hidden">
            <p className="font-serif text-3xl text-[#192a40]">
              SCA JAYA
            </p>
            <p className="mt-1 text-[9px] tracking-[0.3em] text-[#a28a61]">
              HOTEL MANAGEMENT
            </p>
          </div>

          <div className="mb-10">
            <p className="mb-4 text-[10px] tracking-[0.3em] text-[#a28a61]">
              YOUR JOURNEY STARTS HERE
            </p>
            <h2 className="font-serif text-5xl text-[#192a40]">
              Welcome <span className="italic text-[#a78b5c]">Back.</span>
            </h2>
            <p className="mt-4 text-sm leading-7 text-[#77766f]">
              Sign in to access your SCA JAYA account
              and manage your stay.
            </p>
          </div>

          <form className="space-y-6">
            <div>
              <label className="mb-2 block text-[10px] font-semibold tracking-[0.15em] text-[#192a40]">
                EMAIL ADDRESS
              </label>
              <input
                type="email"
                placeholder="Enter your email address"
                className="h-12 w-full border border-[#ded7c9] bg-white px-4 text-sm text-[#192a40] outline-none transition focus:border-[#b99a62]"
              />
            </div>

            <div>
              <label className="mb-2 block text-[10px] font-semibold tracking-[0.15em] text-[#192a40]">
                PASSWORD
              </label>
              <input
                type="password"
                placeholder="Enter your password"
                className="h-12 w-full border border-[#ded7c9] bg-white px-4 text-sm text-[#192a40] outline-none transition focus:border-[#b99a62]"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                className="text-xs text-[#a28a61] transition hover:text-[#192a40]"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="button"
              className="h-12 w-full bg-[#192a40] text-[10px] font-semibold tracking-[0.2em] text-[#dfc18a] transition hover:bg-[#a78b5c] hover:text-white"
            >
              SIGN IN
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-[#77766f]">
            Don't have an account?{" "}
            <Link
              href="/register"
              className="font-semibold text-[#a28a61] hover:text-[#192a40]"
            >
              Create Account
            </Link>
          </p>

          <div className="mt-12 flex items-center justify-center gap-3">
            <span className="h-px w-10 bg-[#ded7c9]" />
            <span className="text-[9px] tracking-[0.2em] text-[#aaa49a]">
              SCA JAYA HOSPITALITY
            </span>
            <span className="h-px w-10 bg-[#ded7c9]" />
          </div>
        </div>
      </section>
    </main>
  );
}

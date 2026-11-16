
import Link from "next/link";

const menuItems = [
  { label: "Overview", href: "#overview", number: "01" },
  { label: "My Reservations", href: "#reservations", number: "02" },
  { label: "My Profile", href: "#profile", number: "03" },
];

export default function GuestDashboard() {
  return (
    <main className="min-h-screen bg-[#f7f6f2] text-[#17263d]">
      {/* SIDEBAR */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col bg-[#17263d] px-7 py-9 text-white md:flex">
        <div className="mb-16">
          <p className="font-serif text-3xl tracking-wide">SCA JAYA</p>
          <p className="mt-2 text-[9px] tracking-[0.35em] text-[#dfc18a]">
            HOTEL & HOSPITALITY
          </p>
        </div>

        <p className="mb-5 text-[10px] tracking-[0.25em] text-white/40">
          MAIN MENU
        </p>

        <nav className="space-y-2">
          {menuItems.map((item, index) => (
            <Link
              key={item.number}
              href={item.href}
              className={`flex items-center gap-4 rounded-sm px-4 py-3.5 text-sm transition ${
                index === 0
                  ? "bg-white/10 text-[#dfc18a]"
                  : "text-white/65 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span className="text-[10px] text-[#dfc18a]/70">
                {item.number}
              </span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto border-t border-white/10 pt-7">
          <p className="text-xs text-white/40">Need assistance?</p>
          <p className="mt-2 font-serif text-lg text-[#dfc18a]">
            We're here for you.
          </p>
          <p className="mt-2 text-xs leading-6 text-white/50">
            Enjoy a comfortable and memorable stay with SCA JAYA.
          </p>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="md:ml-64">
        {/* TOPBAR */}
        <header className="flex items-center justify-between border-b border-[#17263d]/10 bg-white px-6 py-5 md:px-10">
          <div>
            <p className="font-serif text-xl tracking-wide md:text-2xl">
              SCA JAYA
            </p>
            <p className="text-[9px] tracking-[0.25em] text-[#b99a62] md:hidden">
              GUEST PORTAL
            </p>
          </div>

          <Link
            href="#profile"
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#17263d] font-serif text-lg text-[#dfc18a]">
              G
            </div>
            <div className="hidden text-left sm:block">
              <p className="text-sm font-medium">Guest</p>
              <p className="text-xs text-gray-400">Guest Account</p>
            </div>
          </Link>
        </header>

        <div className="mx-auto max-w-7xl space-y-8 px-6 py-9 md:px-10 md:py-12">
          {/* WELCOME */}
          <section id="overview" className="relative overflow-hidden bg-[#17263d] px-7 py-10 text-white md:px-12 md:py-14">
            <div className="absolute -right-16 -top-24 h-72 w-72 rounded-full border border-[#dfc18a]/15" />
            <div className="absolute -right-6 -top-14 h-52 w-52 rounded-full border border-[#dfc18a]/15" />

            <div className="relative z-10 max-w-xl">
              <p className="mb-4 text-[10px] tracking-[0.3em] text-[#dfc18a]">
                GUEST DASHBOARD
              </p>

              <h1 className="font-serif text-4xl leading-tight md:text-5xl">
                Welcome to
                <br />
                SCA JAYA.
              </h1>

              <p className="mt-5 max-w-md text-sm leading-7 text-white/65">
                Your personal space to manage reservations and make every
                stay more comfortable.
              </p>

              <Link
                href="/#rooms"
                className="mt-8 inline-flex items-center gap-4 border border-[#dfc18a] px-6 py-3 text-[10px] tracking-[0.2em] text-[#dfc18a] transition hover:bg-[#dfc18a] hover:text-[#17263d]"
              >
                EXPLORE OUR ROOMS
                <span>→</span>
              </Link>
            </div>
          </section>

          {/* SUMMARY */}
          <section>
            <div className="mb-5">
              <p className="text-[10px] tracking-[0.25em] text-[#b99a62]">
                YOUR ACTIVITY
              </p>
              <h2 className="mt-2 font-serif text-2xl md:text-3xl">
                Reservation Overview
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { label: "Total Reservations", value: "0", note: "All bookings" },
                { label: "Upcoming Stays", value: "0", note: "Future reservations" },
                { label: "Completed Stays", value: "0", note: "Past reservations" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="border border-[#17263d]/10 bg-white p-6"
                >
                  <p className="text-xs text-gray-500">{item.label}</p>
                  <p className="mt-4 font-serif text-4xl">{item.value}</p>
                  <p className="mt-2 text-[10px] tracking-wide text-[#b99a62]">
                    {item.note}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* RESERVATIONS */}
          <section id="reservations">
            <div className="mb-5 flex items-end justify-between">
              <div>
                <p className="text-[10px] tracking-[0.25em] text-[#b99a62]">
                  YOUR STAYS
                </p>
                <h2 className="mt-2 font-serif text-2xl md:text-3xl">
                  Upcoming Reservation
                </h2>
              </div>

              <Link
                href="#reservations"
                className="text-xs text-[#b99a62] hover:underline"
              >
                View All
              </Link>
            </div>

            <div className="border border-[#17263d]/10 bg-white px-6 py-12 text-center md:py-16">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#f7f6f2] font-serif text-2xl text-[#b99a62]">
                S
              </div>

              <h3 className="mt-5 font-serif text-2xl">
                No Reservations Yet
              </h3>

              <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-gray-500">
                Your upcoming stays will appear here once you make a
                reservation with us.
              </p>

              <Link
                href="/#rooms"
                className="mt-7 inline-block bg-[#17263d] px-7 py-3.5 text-[10px] tracking-[0.2em] text-white transition hover:bg-[#263b58]"
              >
                FIND YOUR ROOM
              </Link>
            </div>
          </section>

          {/* PROFILE */}
          <section id="profile" className="border border-[#17263d]/10 bg-white p-6 md:p-8">
            <p className="text-[10px] tracking-[0.25em] text-[#b99a62]">
              ACCOUNT INFORMATION
            </p>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-2xl">My Profile</h2>
                <p className="mt-2 text-sm text-gray-500">
                  Manage your personal account information.
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f7f6f2] font-serif text-xl text-[#b99a62]">
                G
              </div>
            </div>

            <div className="mt-6 grid gap-5 border-t border-[#17263d]/10 pt-6 sm:grid-cols-2">
              <div>
                <p className="text-xs text-gray-400">Account Name</p>
                <p className="mt-2 text-sm">Guest</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Account Role</p>
                <p className="mt-2 text-sm">Guest</p>
              </div>
            </div>
          </section>

          {/* FOOTER */}
          <footer className="border-t border-[#17263d]/10 pt-6 text-center">
            <p className="text-[10px] tracking-[0.2em] text-gray-400">
              © 2026 SCA JAYA HOTEL. ALL RIGHTS RESERVED.
            </p>
          </footer>
        </div>
      </div>
    </main>
  );
}

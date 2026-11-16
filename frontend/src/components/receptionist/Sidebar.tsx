"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menus = [
  { label: "Dashboard", href: "/dashboard/receptionist" },
  { label: "Manajemen Reservasi", href: "/dashboard/receptionist/reservations" },
  { label: "Check-in & Check-out", href: "/dashboard/receptionist/check-in-out" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-50 flex h-screen w-64 flex-col bg-[#192B35] px-5 py-7 text-white">
      <div className="mb-12">
        <h1 className="font-heading text-3xl font-semibold">SCA JAYA</h1>
        <p className="mt-1 text-xs tracking-[0.2em] text-sage">HOTEL MANAGEMENT</p>
      </div>

      <p className="mb-4 text-xs uppercase tracking-widest text-sage">Menu Resepsionis</p>

      <nav className="space-y-2">
        {menus.map((menu) => {
          const active = pathname === menu.href;

          return (
            <Link
              key={menu.href}
              href={menu.href}
              className={`flex w-full items-center justify-start gap-3 rounded-2xl border-l-4 px-5 py-5 text-left text-base transition-all duration-300 ${
                active
                  ? "border-[#C6A46A] bg-[#34464E] font-semibold text-[#C6A46A] shadow-sm"
                  : "border-transparent text-white/85 hover:border-[#C6A46A]/60 hover:bg-white/10 hover:text-[#C6A46A]"
              }`}
            >
              {menu.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

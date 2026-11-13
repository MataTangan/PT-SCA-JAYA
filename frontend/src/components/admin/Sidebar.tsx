"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const menus = [
  { label: "Dashboard", href: "/dashboard/admin" },
  { label: "Manajemen Kamar", href: "/dashboard/admin/rooms" },
  { label: "Pengguna", href: "/dashboard/admin/users" },
  { label: "Laporan", href: "/dashboard/admin/reports" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const menuContent = (
    <>
      <div className="mb-5 flex flex-col items-center">
        <Image
          src="/logo.png"
          alt="Logo SCA JAYA"
          width={90}
          height={90}
          priority
          className="h-25 w-25 object-contain brightness-0 invert"
        />
      </div>

      <div>
        <p className="mb-4 text-[12px] uppercase tracking-widest text-[#C6A46A]">Panel Admin</p>

        <nav className="space-y-2">
          {menus.map((menu) => {
            const active = pathname === menu.href;

            return (
              <Link
                key={menu.href}
                href={menu.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center rounded-xl border-l-4 px-2 py-3.5 text-[13.5px] transition-all ${
                  active
                    ? "border-[#C6A46A] bg-[#34464E] font-semibold text-[#C6A46A]"
                    : "border-transparent text-white/85 hover:border-[#C6A46A]/60 hover:bg-white/10 hover:text-[#C6A46A]"
                }`}
              >
                {menu.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );

  return (
    <>
      {/* Sidebar Desktop */}
      <aside className="fixed left-0 top-0 z-50 hidden h-screen w-[210px] flex-col overflow-y-auto bg-[#192B35] px-5 py-2 text-white [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:flex">
        {menuContent}
      </aside>

      {/* Tombol Hamburger Mobile */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Buka menu navigasi"
        aria-expanded={isOpen}
        className="fixed left-4 top-4 z-[70] flex h-10 w-10 items-center justify-center rounded-lg bg-[#192B35] text-xl text-white shadow-md md:hidden"
      >
        ☰
      </button>

      {/* Background Gelap */}
      {isOpen && (
        <button
          type="button"
          aria-label="Tutup menu"
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-[80] bg-black/40 md:hidden"
        />
      )}

      {/* Sidebar Mobile */}
      <aside
        className={`fixed left-0 top-0 z-[90] flex h-dvh w-[260px] flex-col overflow-y-auto bg-[#192B35] px-5 py-5 text-white shadow-xl transition-transform duration-300 md:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          aria-label="Tutup menu"
          className="mb-4 self-end text-2xl text-white"
        >
          ×
        </button>

        {menuContent}
      </aside>
    </>
  );
}

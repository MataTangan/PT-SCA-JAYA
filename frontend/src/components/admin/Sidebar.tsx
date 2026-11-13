"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const menus = [
  { label: "Dashboard", href: "/dashboard/admin" },
  { label: "Manajemen Kamar", href: "/dashboard/admin/rooms" },
  { label: "Pengguna", href: "/dashboard/admin/users" },
  { label: "Laporan", href: "/dashboard/admin/reports" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-50 flex h-screen w-[210px] flex-col overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden bg-[#192B35] px-5 py-2 text-white">
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

      {/* Menu */}
      <div>
        <p className="mb-4 text-[12px] uppercase tracking-widest text-[#C6A46A]">Panel Admin</p>

        <nav className="space-y-2">
          {menus.map((menu) => {
            const active = pathname === menu.href;

            return (
              <Link
                key={menu.href}
                href={menu.href}
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
    </aside>
  );
}

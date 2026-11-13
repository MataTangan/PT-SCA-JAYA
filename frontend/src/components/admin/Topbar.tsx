"use client";

import Image from "next/image";

export default function AdminTopbar() {
  return (
    <header className="sticky top-0 z-40 flex h-[50px] w-full items-center justify-between border-b border-[#EAE7E1] bg-white pl-2 pr-7 shadow-sm">
      {/* Kiri: Logo dan Judul */}
      <div className="flex items-center gap-2   ">
        <Image
          src="/logo.png"
          alt="Logo SCA JAYA"
          width={100}
          height={100}
          className="h-17 w-17 object-contain"
          quality={100}
        />

        <h2 className="text-lg font-semibold text-[#192B35]">Dashboard Admin</h2>
      </div>

      {/* Tengah: Search */}
      <div className="relative w-[280px]">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-4-4" />
        </svg>

        <input
          type="text"
          placeholder="Search here..."
          className="h-7 w-full rounded-full border border-[#E5E2DC] bg-white pl-10 pr-4 text-sm outline-none transition focus:border-[#C6A46A]"
        />
      </div>

      {/* Kanan: Profil Admin */}
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#192B35] text-sm font-semibold text-white">
          A
        </div>

        <div>
          <p className="text-sm font-semibold text-[#343A3D]">Administrator</p>
          <p className="text-xs text-gray-400">Admin SCA JAYA</p>
        </div>
      </div>
    </header>
  );
}

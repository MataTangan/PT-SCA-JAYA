"use client";

import Image from "next/image";

export default function AdminTopbar() {
  return (
    <header className="fixed left-0 right-0 top-0 z-40 flex h-[60px] w-full items-center justify-between border-b border-[#EAE7E1] bg-white px-3 shadow-sm sm:px-5 md:left-[210px] md:h-[50px] md:w-[calc(100%-210px)] md:pl-2 md:pr-7">
      {/* Kiri: Logo dan Judul */}
      <div className="flex min-w-0 items-center gap-2 pl-11 md:pl-0">
        <Image
          src="/logo.png"
          alt="Logo SCA JAYA"
          width={100}
          height={100}
          className="h-10 w-10 shrink-0 object-contain md:h-17 md:w-17"
          quality={100}
        />

        <h2 className="truncate text-sm font-semibold text-[#192B35] sm:text-base md:text-lg">
          Dashboard Admin
        </h2>
      </div>

      {/* Tengah: Search */}
      <div className="relative mx-4 hidden w-[280px] shrink-0 md:block">
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
      <div className="flex shrink-0 items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#192B35] text-sm font-semibold text-white">
          A
        </div>

        <div className="hidden sm:block">
          <p className="text-sm font-semibold text-[#343A3D]">Administrator</p>
          <p className="text-xs text-gray-400">Admin SCA JAYA</p>
        </div>
      </div>
    </header>
  );
}

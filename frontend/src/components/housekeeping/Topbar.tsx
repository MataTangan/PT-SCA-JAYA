
"use client";

import Image from "next/image";

export default function HousekeepingTopbar() {
  return (
    <header className="fixed left-0 right-0 top-0 z-40 flex h-[60px] w-full items-center justify-between border-b border-[#EAE7E1] bg-white px-3 shadow-sm sm:px-5 md:left-[210px] md:h-[50px] md:w-[calc(100%-210px)] md:pl-2 md:pr-7">
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
          Dashboard Housekeeping
        </h2>
      </div>

      <div className="relative mx-4 hidden w-[280px] shrink-0 md:block">
        <svg
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="m21 21-4.35-4.35m1.85-5.15a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"
          />
        </svg>

        <input
          type="text"
          placeholder="Search here..."
          className="h-7 w-full rounded-full border border-[#E5E2DC] bg-white pl-10 pr-4 text-sm outline-none transition focus:border-[#C6A46A]"
        />
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#192B35] text-sm font-semibold text-white">
          H
        </div>

        <div className="hidden sm:block">
          <p className="text-sm font-semibold text-[#343A3D]">
            Housekeeping
          </p>
          <p className="text-xs text-gray-400">
            SCA JAYA Staff
          </p>
        </div>
      </div>
    </header>
  );
}

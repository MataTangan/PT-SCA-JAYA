"use client";

import { useEffect, useState } from "react";

export default function Topbar() {
  const [currentDate, setCurrentDate] = useState("");

  useEffect(() => {
    const today = new Date();

    const formattedDate = new Intl.DateTimeFormat("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(today);

    setCurrentDate(formattedDate);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-[#F5F0E8] px-8 pt-8 pb-4">
      <h2 className="font-heading text-3xl font-semibold text-[#192B35]">Dashboard</h2>
      <p className="mt-2 text-sm text-gray-500">{currentDate}</p>
    </header>
  );
}

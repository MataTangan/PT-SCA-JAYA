
import Link from "next/link";
import HousekeepingSidebar from "@/components/housekeeping/Sidebar";
import HousekeepingTopbar from "@/components/housekeeping/Topbar";

export default function HousekeepingDashboard() {
  const summaryCards = [
    {
      label: "Total Tasks",
      value: "0",
      color: "#C6A46A",
      note: "All housekeeping tasks",
    },
    {
      label: "Pending Tasks",
      value: "0",
      color: "#A5B1A0",
      note: "Awaiting action",
    },
    {
      label: "Completed",
      value: "0",
      color: "#192B35",
      note: "Tasks completed",
    },
  ];

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#F5F0E8] text-[#343A3D]">
      <HousekeepingSidebar />

      <div className="min-h-screen min-w-0 w-full md:ml-[210px] md:w-[calc(100%-210px)]">
        <HousekeepingTopbar />

        <div className="h-[60px] md:h-[50px]" aria-hidden="true" />

        <main className="w-full min-w-0 space-y-6 px-4 pb-8 pt-4 sm:space-y-8 sm:px-6 sm:pb-10 md:px-8 md:pb-16 md:pt-6">
          {/* Welcome Banner */}
          <section className="relative overflow-hidden rounded-[20px] bg-[#192B35] px-5 py-7 text-white shadow-md sm:rounded-[24px] sm:px-9 sm:py-9">
            <div className="relative z-10 max-w-3xl">
              <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.2em] text-[#C6A46A] sm:text-xs">
                SCA JAYA HOTEL
              </p>

              <h1 className="font-heading text-2xl font-semibold sm:text-3xl">
                Welcome, Housekeeping!
              </h1>

              <p className="mt-3 max-w-2xl text-xs leading-relaxed text-white/75 sm:text-sm">
                Manage room cleaning tasks and ensure every room is ready to
                provide guests with the best comfort.
              </p>

              <Link
                href="/dashboard/housekeeping/tasks"
                className="mt-5 inline-block rounded-xl bg-[#C6A46A] px-5 py-3 text-xs font-semibold text-[#192B35] transition hover:bg-[#D5B77F] sm:mt-6 sm:px-6 sm:py-3.5 sm:text-sm"
              >
                View Room Tasks
              </Link>
            </div>

            <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full border border-[#C6A46A]/20" />
            <div className="pointer-events-none absolute -right-8 -top-12 h-56 w-56 rounded-full border border-[#C6A46A]/20" />
          </section>

          {/* Summary */}
          <section>
            <div className="mb-4 sm:mb-5">
              <h2 className="font-heading text-xl font-semibold text-[#192B35] sm:text-2xl">
                Task Summary
              </h2>
              <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                Overview of room cleaning activities.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
              {summaryCards.map((item) => (
                <div
                  key={item.label}
                  className="rounded-[16px] border border-[#E2D8C8] bg-[#FFFDFA] px-4 py-4 sm:rounded-[18px] sm:px-5 sm:py-5"
                  style={{ borderTop: `5px solid ${item.color}` }}
                >
                  <p className="font-heading text-2xl font-semibold text-[#192B35] sm:text-3xl">
                    {item.value}
                  </p>
                  <p className="mt-2 text-xs text-gray-600 sm:text-sm">
                    {item.label}
                  </p>
                  <p className="mt-1 text-[11px] text-gray-400 sm:text-xs">
                    {item.note}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Recent Tasks */}
          <section>
            <div className="mb-4 flex items-end justify-between gap-2 sm:gap-3">
              <div className="min-w-0">
                <h2 className="font-heading text-xl font-semibold text-[#192B35] sm:text-2xl">
                  Recent Tasks
                </h2>
                <p className="mt-1 text-xs leading-relaxed text-gray-500 sm:text-sm">
                  List of room cleaning tasks that require attention.
                </p>
              </div>

              <Link
                href="/dashboard/housekeeping/tasks"
                className="shrink-0 whitespace-nowrap text-[11px] font-medium text-[#A17E43] transition hover:underline sm:text-xs"
              >
                View All →
              </Link>
            </div>

            <div className="rounded-[18px] border border-[#E2D8C8] bg-[#FFFDFA] px-4 py-10 text-center sm:rounded-[20px] sm:px-6 sm:py-16">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#F5F0E8] text-xl text-[#C6A46A] sm:h-14 sm:w-14 sm:text-2xl">
                ✦
              </div>

              <h3 className="mt-4 font-heading text-lg font-semibold text-[#192B35] sm:mt-5 sm:text-xl">
                No Tasks Yet
              </h3>

              <p className="mx-auto mt-2 max-w-md text-xs leading-6 text-gray-500 sm:mt-3 sm:text-sm">
                Room cleaning tasks will appear here when a room requires
                attention.
              </p>

              <Link
                href="/dashboard/housekeeping/tasks"
                className="mt-5 inline-block rounded-xl bg-[#C6A46A] px-5 py-3 text-xs font-semibold text-[#192B35] shadow-sm transition hover:bg-[#D5B77F] sm:mt-7 sm:px-6 sm:py-3.5 sm:text-sm"
              >
                View Room Tasks
              </Link>
            </div>
          </section>

          {/* Footer */}
          <footer className="border-t border-[#E2D8C8] pt-5 text-center sm:pt-6">
            <p className="text-[9px] tracking-[0.2em] text-gray-400 sm:text-[10px]">
              © 2026 SCA JAYA HOTEL. ALL RIGHTS RESERVED.
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}

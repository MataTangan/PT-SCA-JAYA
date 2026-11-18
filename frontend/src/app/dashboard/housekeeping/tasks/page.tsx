
import HousekeepingSidebar from "@/components/housekeeping/Sidebar";
import HousekeepingTopbar from "@/components/housekeeping/Topbar";

export default function HousekeepingTasks() {
  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#F5F0E8] text-[#343A3D]">
      <HousekeepingSidebar />

      <div className="min-h-screen min-w-0 w-full md:ml-[210px] md:w-[calc(100%-210px)]">
        <HousekeepingTopbar />

        <div className="h-[60px] md:h-[50px]" aria-hidden="true" />

        <main className="w-full min-w-0 space-y-6 px-4 pb-8 pt-4 sm:space-y-8 sm:px-6 sm:pb-10 md:px-8 md:pb-16 md:pt-6">
          {/* Header */}
          <section>
            <h1 className="font-heading text-2xl font-semibold text-[#192B35] sm:text-3xl">
              Room Tasks
            </h1>
            <p className="mt-2 text-xs leading-relaxed text-gray-500 sm:text-sm">
              Manage the list of rooms that require cleaning and maintenance.
            </p>
          </section>

          {/* Summary */}
          <section>
            <div className="mb-4 sm:mb-5">
              <h2 className="font-heading text-xl font-semibold text-[#192B35] sm:text-2xl">
                Task Summary
              </h2>
              <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                Monitor the progress of room cleaning tasks.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
              {[
                { label: "Total Tasks", value: "0", color: "#C6A46A" },
                { label: "Pending Tasks", value: "0", color: "#A5B1A0" },
                { label: "Completed", value: "0", color: "#192B35" },
              ].map((item) => (
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
                </div>
              ))}
            </div>
          </section>

          {/* Task List */}
          <section className="min-w-0">
            <div className="mb-4">
              <h2 className="font-heading text-xl font-semibold text-[#192B35] sm:text-2xl">
                Housekeeping Task List
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-gray-500 sm:text-sm">
                List of rooms that require housekeeping attention.
              </p>
            </div>

            <div className="overflow-hidden rounded-[16px] border border-[#E2D8C8] bg-[#FFFDFA] sm:rounded-[20px]">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[650px] text-left text-sm">
                  <thead className="bg-[#192B35] text-white">
                    <tr>
                      <th className="px-5 py-4 font-medium">No.</th>
                      <th className="px-5 py-4 font-medium">Room Number</th>
                      <th className="px-5 py-4 font-medium">Room Type</th>
                      <th className="px-5 py-4 font-medium">Check-out Date</th>
                      <th className="px-5 py-4 font-medium">Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    <tr>
                      <td colSpan={5} className="px-4 py-10 text-center sm:px-5 sm:py-12">
                        <p className="text-sm font-semibold text-[#192B35]">
                          No Housekeeping Tasks Yet
                        </p>
                        <p className="mt-2 text-xs leading-relaxed text-gray-500 sm:text-sm">
                          Tasks will appear here when a room requires cleaning.
                        </p>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Information */}
          <section className="rounded-[16px] border border-[#E2D8C8] bg-[#FFFDFA] p-4 sm:rounded-[18px] sm:p-6">
            <h3 className="font-heading text-base font-semibold text-[#192B35] sm:text-lg">
              Housekeeping Information
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-gray-500 sm:text-sm sm:leading-relaxed">
              Cleaning tasks are created after guests check out.
              Housekeeping can update the room status once cleaning is complete
              so the room can be used again.
            </p>
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

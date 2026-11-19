
import GuestSidebar from "@/components/guest/Sidebar";
import GuestTopbar from "@/components/guest/Topbar";

const profileFields = [
  { label: "Full Name", value: "Not provided" },
  { label: "Email Address", value: "Not provided" },
  { label: "Phone Number", value: "Not provided" },
  { label: "Address", value: "Not provided" },
];

export default function GuestProfile() {
  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#F5F0E8] text-[#343A3D]">
      <GuestSidebar />

      <div className="min-h-screen min-w-0 w-full md:ml-[210px] md:w-[calc(100%-210px)]">
        <GuestTopbar />
        <div className="h-[60px] md:h-[50px]" aria-hidden="true" />

        <main className="w-full min-w-0 space-y-6 px-4 pb-8 pt-4 sm:space-y-8 sm:px-6 md:space-y-7 md:px-8 md:pb-16 md:pt-6">

          {/* PAGE HEADER */}
          <section>
            <h1 className="font-heading text-2xl font-semibold text-[#192B35] sm:text-3xl">
              My Profile
            </h1>
            <p className="mt-2 text-xs leading-relaxed text-gray-500 sm:text-sm">
              View your account information and personal details.
            </p>
          </section>

          {/* PROFILE INFORMATION */}
          <section className="min-w-0 rounded-[18px] border border-[#E2D8C8] bg-[#FFFDFA] p-4 sm:rounded-[20px] sm:p-7">

            <div className="flex flex-col items-center border-b border-[#E2D8C8] pb-6 sm:flex-row sm:gap-5 sm:pb-7">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#192B35] font-heading text-2xl font-semibold text-[#C6A46A] sm:h-20 sm:w-20 sm:text-3xl">
                G
              </div>

              <div className="mt-3 text-center sm:mt-0 sm:text-left">
                <h2 className="font-heading text-xl font-semibold text-[#192B35]">
                  Guest
                </h2>
                <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                  SCA JAYA Hotel Member
                </p>
              </div>
            </div>

            <div className="pt-5 sm:pt-6">
              <h3 className="font-heading text-lg font-semibold text-[#192B35]">
                Personal Information
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-gray-500 sm:text-sm">
                Account information registered in the system.
              </p>

              <div className="mt-5 grid grid-cols-1 gap-4 sm:mt-6 sm:grid-cols-2 sm:gap-5">
                {profileFields.map((field) => (
                  <div key={field.label} className="min-w-0">
                    <p className="mb-2 text-xs font-medium text-gray-500 sm:text-sm">
                      {field.label}
                    </p>
                    <div className="break-words rounded-xl border border-[#E2D8C8] bg-[#F5F0E8]/50 px-3 py-3 text-xs text-gray-400 sm:px-4 sm:py-3.5 sm:text-sm">
                      {field.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ACCOUNT INFORMATION */}
          <section className="min-w-0 rounded-[18px] border border-[#E2D8C8] bg-[#FFFDFA] p-4 sm:rounded-[20px] sm:p-7">
            <h3 className="font-heading text-lg font-semibold text-[#192B35]">
              Account Information
            </h3>

            <div className="mt-5 flex items-center justify-between gap-3 border-b border-[#E2D8C8] pb-4">
              <div className="min-w-0">
                <p className="text-xs font-medium text-[#192B35] sm:text-sm">
                  Account Type
                </p>
                <p className="mt-1 text-[11px] leading-relaxed text-gray-500 sm:text-xs">
                  User role in the SCA JAYA system
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-[#F5F0E8] px-3 py-1.5 text-[11px] font-semibold text-[#192B35] sm:px-4 sm:py-2 sm:text-xs">
                Guest
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 pt-4">
              <div className="min-w-0">
                <p className="text-xs font-medium text-[#192B35] sm:text-sm">
                  Account Status
                </p>
                <p className="mt-1 text-[11px] leading-relaxed text-gray-500 sm:text-xs">
                  Your membership status
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-[#E8EFE7] px-3 py-1.5 text-[11px] font-semibold text-[#526B50] sm:px-4 sm:py-2 sm:text-xs">
                Active
              </span>
            </div>
          </section>

          {/* FOOTER */}
          <footer className="border-t border-[#E2D8C8] pt-5 text-center sm:pt-6">
            <p className="text-[8px] tracking-[0.15em] text-gray-400 sm:text-[10px] sm:tracking-[0.2em]">
              © 2026 SCA JAYA HOTEL. ALL RIGHTS RESERVED.
            </p>
          </footer>

        </main>
      </div>
    </div>
  );
}

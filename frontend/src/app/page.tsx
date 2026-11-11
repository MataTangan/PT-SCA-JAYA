
const rooms = [
  {
    number: "01",
    name: "Standard Room",
    description: "A refined space for a restful and comfortable stay.",
    price: "450.000",
    size: "24 m²",
    image:
      "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1000&q=90",
    tag: "ESSENTIAL COMFORT",
  },
  {
    number: "02",
    name: "Deluxe Room",
    description: "More room to unwind, with thoughtful details throughout.",
    price: "650.000",
    size: "32 m²",
    image:
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1000&q=90",
    tag: "MOST LOVED",
  },
  {
    number: "03",
    name: "Suite Room",
    description: "An elevated retreat for an exceptional experience.",
    price: "950.000",
    size: "48 m²",
    image:
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1000&q=90",
    tag: "EXCLUSIVE STAY",
  },
];

const facilities = [
  {
    number: "01",
    name: "Restaurant",
    description: "Enjoy a delightful dining experience with a selection of food and beverages.",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=900&q=85",
  },
  {
    number: "02",
    name: "Swimming Pool",
    description: "Unwind and refresh yourself in our relaxing swimming pool.",
    image: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=900&q=85",
  },
  {
    number: "03",
    name: "Fitness Center",
    description: "Stay active and maintain your fitness during your stay.",
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=900&q=85",
  },
  {
    number: "04",
    name: "Meeting Room",
    description: "A comfortable and professional space for meetings and business activities.",
    image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=900&q=85",
  },
];

export default function Home() {
  return (
    <main className="overflow-hidden bg-[#faf8f3] text-[#192a40]">
      
      {/* NAVIGATION */}
      <header className="absolute left-0 top-0 z-30 w-full border-b border-white/15 bg-[#17263d]/65 shadow-sm backdrop-blur-md">
        <nav className="mx-auto flex max-w-[1440px] items-center justify-between px-6 py-2.5 text-white md:px-12 lg:px-16">

          <a href="#home" className="flex items-center">
            <img
              src="/logo-sca.png"
              alt="SCA JAYA Hotel Logo"
              className="h-11 w-auto object-contain brightness-0 invert md:h-12"
            />
          </a>

          <div className="ml-auto mr-10 hidden items-center gap-9 text-[10px] tracking-[0.17em] text-white md:flex">
            <a href="#home" className="transition hover:text-[#dfc18a]">HOME</a>
            <a href="#about" className="transition hover:text-[#dfc18a]">ABOUT</a>
            <a href="#rooms" className="transition hover:text-[#dfc18a]">ROOMS</a>
            <a href="#facilities" className="transition hover:text-[#dfc18a]">FACILITIES</a>
          </div>

          <a
            href="#booking"
            className="border border-[#dfc18a] px-5 py-2.5 text-[9px] tracking-[0.16em] text-white transition hover:bg-[#dfc18a] hover:text-[#17263d]"
          >
            BOOK YOUR STAY
          </a>

        </nav>
      </header>

      {/* HERO */}
      <section
        id="home"
        className="relative flex h-[520px] items-end bg-cover bg-center md:h-[590px] lg:h-[620px]"
        style={{ backgroundImage: "url('/hero-hotel.png')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#101d30]/80 via-[#101d30]/35 to-[#101d30]/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#101d30]/60 via-transparent to-[#101d30]/25" />

        <div className="relative z-10 mx-auto flex w-full max-w-[1440px] items-end justify-between px-6 pb-40 pt-32 text-white md:px-12 md:pb-44 lg:px-16">

          <div className="max-w-3xl">
            <div className="mb-5 flex items-center gap-3">
              <span className="h-px w-10 bg-[#dfc18a]" />
              <p className="text-[10px] tracking-[0.3em] text-[#e5cc9f]">
                A PLACE TO BELONG
              </p>
            </div>

            <h1 className="font-serif text-[54px] font-light leading-[0.95] tracking-[-0.035em] md:text-[76px] lg:text-[88px]">
              Stay in
              <br />
              <span className="italic text-[#e5cc9f]">Elegance.</span>
            </h1>

            <p className="mt-5 max-w-lg text-xs leading-7 text-white/85 md:text-sm">
              Discover a thoughtful balance of comfort, warmth, and refined
              hospitality. Your time away deserves something special.
            </p>

            <a
              href="#rooms"
              className="mt-6 inline-flex items-center gap-4 border-b border-[#dfc18a] pb-2 text-[10px] tracking-[0.2em] transition hover:gap-6"
            >
              DISCOVER THE EXPERIENCE
              <span className="text-base text-[#dfc18a]">→</span>
            </a>
          </div>

          <div className="hidden items-center gap-3 pb-2 lg:flex">
            <span className="h-px w-9 bg-white/50" />
            <p className="text-[8px] tracking-[0.25em] text-white/70">
              COMFORT · ELEGANCE · HOSPITALITY
            </p>
          </div>

        </div>
      </section>

      {/* BOOKING PANEL */}
      <section
        id="booking"
        style={{ scrollMarginTop: "-30px" }}
        className="relative z-20 mx-auto -mt-24 w-full max-w-[620px] px-5 md:-mt-28"
      >
        <div className="bg-white p-5 shadow-[0_15px_50px_rgba(25,42,64,0.16)] md:p-7">

          <div className="mb-5 text-center">
            <p className="text-[9px] tracking-[0.25em] text-[#a78b5c]">
              PLAN YOUR STAY
            </p>
            <h2 className="mt-1 font-serif text-2xl text-[#192a40]">
              Find Your Room
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-3">

            <div className="border border-[#e9e3d8] px-3 py-3">
              <label className="mb-2 block text-[8px] tracking-[0.18em] text-[#a28a61]">
                CHECK IN
              </label>
              <input
                type="date"
                className="w-full bg-transparent text-[11px] text-[#192a40] outline-none"
                aria-label="Check-in date"
              />
            </div>

            <div className="border border-[#e9e3d8] px-3 py-3">
              <label className="mb-2 block text-[8px] tracking-[0.18em] text-[#a28a61]">
                CHECK OUT
              </label>
              <input
                type="date"
                className="w-full bg-transparent text-[11px] text-[#192a40] outline-none"
                aria-label="Check-out date"
              />
            </div>

            <div className="col-span-2 border border-[#e9e3d8] px-3 py-3">
              <label className="mb-2 block text-[8px] tracking-[0.18em] text-[#a28a61]">
                GUESTS
              </label>
              <select
                className="w-full bg-transparent text-[11px] text-[#192a40] outline-none"
                aria-label="Number of guests"
              >
                <option>1 Guest</option>
                <option>2 Guests</option>
                <option>3 Guests</option>
                <option>4 Guests</option>
              </select>
            </div>

            <a
              href="#rooms"
              className="col-span-2 flex min-h-[46px] items-center justify-center gap-3 bg-[#192a40] px-5 text-[9px] font-semibold tracking-[0.18em] !text-[#dfc18a] transition hover:bg-[#a78b5c] hover:!text-white"
            >
              <span className="!text-[#dfc18a]">FIND A ROOM</span>
              <span className="text-base !text-[#dfc18a]">→</span>
            </a>

          </div>
        </div>
      </section>


      
      {/* ABOUT */}
      <section
        id="about"
        style={{ scrollMarginTop: "-160px" }}
        className="mx-auto grid max-w-[1200px] items-center gap-12 px-6 pt-16 pb-24 md:grid-cols-2 md:gap-16 md:px-12 md:pt-20 md:pb-20"
      >
        {/* IMAGE COMPOSITION */}
        <div className="relative min-h-[360px] md:min-h-[460px]">
          <img
            src="https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1100&q=90"
            alt="Elegant hotel interior"
            className="absolute left-0 top-0 h-[80%] w-[76%] object-cover"
          />

          <img
            src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=85"
            alt="Hotel swimming pool"
            className="absolute bottom-0 right-0 h-[43%] w-[43%] border-[8px] border-[#faf8f3] object-cover md:border-[10px]"
          />

        </div>

        {/* ABOUT CONTENT */}
        <div className="max-w-xl">
          <div className="mb-4 flex items-center gap-4">
            <span className="h-px w-10 bg-[#b99a62]" />
            <p className="text-[10px] tracking-[0.3em] text-[#a28a61]">
              WELCOME TO SCA JAYA
            </p>
          </div>

          <h2 className="font-serif text-5xl font-normal leading-[1.05] tracking-tight md:text-6xl">
            More than a stay.
            <br />
            <span className="italic text-[#a78b5c]">A feeling.</span>
          </h2>

          <p className="mt-5 text-[13px] leading-7 text-[#77766f]">
            At SCA JAYA, every detail is thoughtfully considered to make your
            stay feel effortless. From welcoming spaces to comfortable rooms,
            we create an atmosphere where you can pause, unwind, and feel at
            home.
          </p>

          <p className="mt-4 text-[13px] leading-7 text-[#77766f]">
            Whether you are travelling for business or leisure, discover a
            place that makes every moment worth remembering.
          </p>

          <a
            href="#facilities"
            className="mt-8 inline-flex items-center gap-5 border-b border-[#b99a62] pb-3 text-[10px] tracking-[0.2em] transition hover:gap-8"
          >
            EXPLORE OUR HOTEL
            <span className="text-lg text-[#a78b5c]">→</span>
          </a>
        </div>
      </section>


      
      {/* ROOMS */}
      <section
        id="rooms"
        style={{ scrollMarginTop: "-145px" }}
        className="bg-[#f5f2ec] pt-20 pb-20 md:pt-24 md:pb-24"
      >
        <div className="mx-auto max-w-[1200px] px-6 md:px-12">

          {/* SECTION HEADING */}
          <div className="mb-10 flex flex-col justify-between gap-5 md:mb-12 md:flex-row md:items-end">
            <div>
              <div className="mb-5 flex items-center gap-4">
                <span className="h-px w-10 bg-[#b99a62]" />
                <p className="text-[10px] tracking-[0.3em] text-[#a28a61]">
                  YOUR PRIVATE RETREAT
                </p>
              </div>

              <h2 className="font-serif text-5xl font-normal tracking-tight md:text-6xl">
                Rooms & <span className="italic text-[#a78b5c]">Suites.</span>
              </h2>
            </div>

            <p className="max-w-sm text-[12px] leading-7 text-[#77766f]">
              Find your perfect space to rest and recharge. Each room is
              designed with comfort in mind.
            </p>
          </div>

          {/* ROOM CARDS */}
          <div className="grid gap-6 md:grid-cols-3">
            {rooms.map((room) => (
              <article key={room.number} className="group">

                {/* ROOM IMAGE */}
                <div className="relative overflow-hidden">
                  <img
                    src={room.image}
                    alt={room.name}
                    className="h-[230px] w-full object-cover transition duration-700 group-hover:scale-105 md:h-[270px]"
                  />

                  <span className="absolute left-4 top-4 bg-[#faf8f3] px-3 py-2 text-[8px] tracking-[0.2em] text-[#8e744d]">
                    {room.tag}
                  </span>

                  <span className="absolute bottom-4 right-4 font-serif text-3xl text-white">
                    {room.number}
                  </span>
                </div>

                {/* ROOM DETAILS */}
                <div className="bg-white px-5 py-5 md:px-6 md:py-6">

                  <div className="flex items-center justify-between">
                    <p className="text-[9px] tracking-[0.2em] text-[#a28a61]">
                      {room.size}
                    </p>

                    <span className="text-[9px] tracking-[0.15em] text-[#aaa49a]">
                      SCA JAYA
                    </span>
                  </div>

                  <h3 className="mt-3 font-serif text-2xl md:text-[27px]">
                    {room.name}
                  </h3>

                  <p className="mt-2 min-h-[44px] text-[11px] leading-6 text-[#77766f]">
                    {room.description}
                  </p>

                  <div className="mt-5 flex items-end justify-between border-t border-[#eee9df] pt-4">
                    <div>
                      <p className="text-[8px] tracking-[0.18em] text-[#999184]">
                        STARTING FROM
                      </p>

                      <p className="mt-1 text-[14px] font-medium">
                        Rp {room.price}
                        <span className="ml-1 text-[10px] font-normal text-[#999184]">
                          / night
                        </span>
                      </p>
                    </div>

                    <a
                      href="#booking"
                      className="text-[9px] tracking-[0.15em] text-[#a28a61] transition hover:text-[#192a40]"
                    >
                      BOOK NOW →
                    </a>
                  </div>

                </div>
              </article>
            ))}
          </div>

        </div>
      </section>


      {/* EXPERIENCE / FACILITIES */}
      <section
        id="facilities"
        style={{ scrollMarginTop: "-120px" }}
        className="bg-[#faf8f3] pt-16 pb-20 md:pt-20 md:pb-24"
      >
        <div className="mx-auto max-w-[1200px] px-6 md:px-12">

          {/* SECTION HEADING */}
          <div className="mb-10 flex flex-col justify-between gap-4 md:mb-12 md:flex-row md:items-end">
            <div>
              <div className="mb-5 flex items-center gap-4">
                <span className="h-px w-10 bg-[#b99a62]" />
                <p className="text-[10px] tracking-[0.3em] text-[#a28a61]">
                  THE SCA JAYA EXPERIENCE
                </p>
              </div>

              <h2 className="font-serif text-5xl tracking-tight md:text-6xl">
                Thoughtful in{" "}
                <span className="italic text-[#a78b5c]">Every Way.</span>
              </h2>
            </div>

            <p className="max-w-sm text-[12px] leading-7 text-[#77766f]">
              Discover thoughtful facilities and services designed
              to make every moment of your stay comfortable.
            </p>
          </div>

          {/* MAIN FACILITIES */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {facilities.map((facility) => (
              <article key={facility.number} className="group">
                <div className="overflow-hidden">
                  <img
                    src={facility.image}
                    alt={facility.name}
                    className="h-[190px] w-full object-cover transition duration-700 group-hover:scale-105 md:h-[210px]"
                  />
                </div>

                <div className="flex gap-4 border-b border-[#ded7c9] py-5">
                  <span className="pt-1 text-[10px] text-[#a28a61]">
                    {facility.number}
                  </span>

                  <div>
                    <h3 className="font-serif text-2xl">
                      {facility.name}
                    </h3>
                    <p className="mt-2 text-[11px] leading-6 text-[#77766f]">
                      {facility.description}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* ADDITIONAL SERVICES */}
          <div className="mt-12 border-y border-[#ded7c9] py-7">
            <p className="mb-6 text-center text-[9px] tracking-[0.25em] text-[#a28a61]">
              ADDITIONAL SERVICES
            </p>

            <div className="grid gap-6 text-center md:grid-cols-3">
              <div>
                <h3 className="font-serif text-xl">Parking Area</h3>
                <p className="mt-2 text-[11px] text-[#77766f]">
                  Convenient parking for hotel guests.
                </p>
              </div>

              <div>
                <h3 className="font-serif text-xl">Free Wi-Fi</h3>
                <p className="mt-2 text-[11px] text-[#77766f]">
                  Complimentary internet access throughout the hotel.
                </p>
              </div>

              <div>
                <h3 className="font-serif text-xl">24-Hour Front Desk</h3>
                <p className="mt-2 text-[11px] text-[#77766f]">
                  Assistance and reception services available around the clock.
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* CLOSING BANNER */}
      <section
        className="relative flex min-h-[480px] items-center justify-center bg-cover bg-center px-6 py-24 text-center text-white"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1800&q=90')",
        }}
      >
        <div className="absolute inset-0 bg-[#14243a]/75" />
        <div className="relative z-10 max-w-2xl">
          <p className="mb-4 text-[10px] tracking-[0.35em] text-[#e5cc9f]">
            YOUR TIME, YOUR PLACE
          </p>
          <h2 className="font-serif text-5xl font-normal leading-tight md:text-7xl">
            Let every stay
            <br />
            become a <span className="italic text-[#e5cc9f]">story.</span>
          </h2>
          <p className="mx-auto mt-7 max-w-md text-[12px] leading-7 text-white/75">
            Make room for moments worth remembering. We look forward to
            welcoming you to SCA JAYA.
          </p>
          <a
            href="#booking"
            className="mt-6 inline-flex border border-[#dfc18a] px-9 py-4 text-[9px] tracking-[0.2em] transition hover:bg-[#dfc18a] hover:text-[#192a40]"
          >
            RESERVE YOUR STAY
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#14243a] px-6 pb-8 pt-16 text-white md:px-12">
        <div className="mx-auto grid max-w-[1280px] gap-12 border-b border-white/15 pb-14 md:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <p className="font-serif text-4xl tracking-[0.08em]">SCA JAYA</p>
            <p className="mt-3 text-[9px] tracking-[0.3em] text-[#dfc18a]">
              HOTEL & HOSPITALITY
            </p>
            <p className="mt-6 max-w-xs text-[11px] leading-7 text-white/55">
              A thoughtful destination for comfort, elegance, and meaningful
              moments.
            </p>
          </div>

          <div>
            <p className="mb-6 text-[9px] tracking-[0.25em] text-[#dfc18a]">
              EXPLORE
            </p>
            <div className="flex flex-col gap-4 text-[11px] text-white/70">
              <a href="#home" className="hover:text-white">Home</a>
              <a href="#about" className="hover:text-white">About Us</a>
              <a href="#rooms" className="hover:text-white">Rooms & Suites</a>
              <a href="#facilities" className="hover:text-white">Facilities</a>
            </div>
          </div>

          <div>
            <p className="mb-6 text-[9px] tracking-[0.25em] text-[#dfc18a]">
              GET IN TOUCH
            </p>
            <p className="text-[11px] leading-7 text-white/70">
              For reservations and enquiries,
              <br />
              please contact our hotel team.
            </p>
            <a
              href="#booking"
              className="mt-5 inline-block border-b border-[#dfc18a] pb-2 text-[9px] tracking-[0.18em] text-[#dfc18a]"
            >
              MAKE A RESERVATION →
            </a>
          </div>
        </div>

        <div className="mx-auto flex max-w-[1280px] flex-col justify-between gap-3 pt-7 text-[9px] tracking-[0.08em] text-white/40 md:flex-row">
          <p>© 2026 SCA JAYA Hotel. All rights reserved.</p>
          <p>COMFORT · ELEGANCE · HOSPITALITY</p>
        </div>
      </footer>
    </main>
  );
}

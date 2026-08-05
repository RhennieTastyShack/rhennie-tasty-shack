"use client";

import Image from "next/image";

const services = [
  {
    title: "Corporate Catering",
    image: "/images/catering-platter.jpeg",
    badge: "Corporate",
    description:
      "Premium catering for meetings, conferences, seminars, trainings and corporate events.",
  },
  {
    title: "Luxury Food Boxes",
    image: "/images/food-box-2.png",
    badge: "Most Popular",
    description:
      "Beautifully curated food boxes for birthdays, bridal showers, anniversaries and celebrations.",
  },
  {
    title: "Premium Lunch Packs",
    image: "/images/jollofrice-turkey.jpeg",
    badge: "Daily Orders",
    description:
      "Freshly prepared lunch packs for offices, schools, businesses and private events.",
  },
];

export default function Catering() {
  return (
    <section
      id="catering"
      className="bg-[#111111] py-20 md:py-28"
    >
      <div className="mx-auto max-w-7xl px-5 md:px-8">

        {/* Heading */}

        <div className="mb-16 text-center">

          <span className="inline-block rounded-full border border-[#D4AF37]/30 bg-[#1A1A1A] px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#D4AF37]">
            Luxury Catering
          </span>

          <h2 className="mt-6 text-3xl font-extrabold text-white md:text-5xl">
            Catering Crafted For Every Occasion
          </h2>

          <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-[#B8B8B8] md:text-lg">
            Whether you're hosting an intimate gathering or a grand celebration,
            Rhennie Tasty Shack delivers exceptional meals and unforgettable
            experiences tailored to your event.
          </p>

        </div>

        {/* Cards */}

        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">

          {services.map((service) => (

            <div
              key={service.title}
              className="group overflow-hidden rounded-3xl border border-[#D4AF37]/15 bg-[#171717] shadow-xl transition-all duration-500 hover:-translate-y-3 hover:border-[#D4AF37] hover:shadow-2xl"
            >

              <div className="relative overflow-hidden">

                <Image
                  src={service.image}
                  alt={service.title}
                  width={700}
                  height={500}
                  className="h-72 w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />

                <span className="absolute left-5 top-5 rounded-full bg-[#D4AF37] px-4 py-2 text-xs font-bold uppercase tracking-wider text-black shadow-lg">
                  {service.badge}
                </span>

              </div>

              <div className="p-8">

                <h3 className="text-2xl font-bold text-white md:text-3xl">
                  {service.title}
                </h3>

                <p className="mt-5 leading-8 text-[#B8B8B8]">
                  {service.description}
                </p>

                <a
                  href="https://wa.me/2348121577759?text=Hello%20Rhennie%20Tasty%20Shack,%20I%20would%20like%20to%20book%20your%20catering%20service."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-8 flex h-14 w-full items-center justify-center rounded-xl bg-[#D4AF37] text-lg font-bold text-black transition-all duration-300 hover:scale-105 hover:bg-yellow-400"
                >
                  Book Catering
                </a>

              </div>

            </div>

          ))}

        </div>

      </div>
    </section>
  );
}
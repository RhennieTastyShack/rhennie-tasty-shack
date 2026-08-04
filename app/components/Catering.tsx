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
    badge: "Best Seller",
    description:
      "Beautifully curated food boxes for birthdays, surprises, bridal showers and celebrations.",
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
      className="bg-[#111111] py-28"
    >
      <div className="max-w-7xl mx-auto px-6">

        {/* Heading */}

        <div className="text-center mb-20">

          <span className="inline-block rounded-full border border-[#D4AF37]/20 bg-[#1A1A1A] px-6 py-2 text-sm tracking-[0.3em] text-[#D4AF37]">
            EVENT CATERING
          </span>

          <h2 className="mt-6 text-6xl font-bold text-white">
            Luxury Catering Services
          </h2>

          <p className="mt-6 max-w-3xl mx-auto text-[#B8B8B8] leading-8">
            From intimate celebrations to large corporate events,
            Rhennie Tasty Shack delivers beautifully prepared meals
            that leave a lasting impression.
          </p>

        </div>

        {/* Cards */}

        <div className="grid lg:grid-cols-3 gap-10">

          {services.map((service) => (

            <div
              key={service.title}
              className="group overflow-hidden rounded-[35px] border border-[#D4AF37]/15 bg-[#171717] hover:border-[#D4AF37] transition duration-500 hover:-translate-y-2"
            >

              <div className="relative overflow-hidden">

                <Image
                  src={service.image}
                  alt={service.title}
                  width={700}
                  height={500}
                  className="w-full h-72 object-cover transition duration-700 group-hover:scale-110"
                />

                <span className="absolute left-5 top-5 rounded-full bg-[#D4AF37] px-4 py-2 text-sm font-bold text-black">
                  {service.badge}
                </span>

              </div>

              <div className="p-8">

                <h3 className="text-3xl font-bold text-white">
                  {service.title}
                </h3>

                <p className="mt-5 leading-8 text-[#B8B8B8]">
                  {service.description}
                </p>

                <a
                  href="https://wa.me/2348121577759?text=Hello%20Rhennie%20Tasty%20Shack,%20I%20would%20like%20to%20book%20your%20catering%20service."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="gold-btn inline-block mt-8 px-8 py-4"
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
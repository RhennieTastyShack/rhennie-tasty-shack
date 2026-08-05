"use client";

import Image from "next/image";

const gallery = [
  "/images/jollofrice-turkey.jpeg",
  "/images/jollof-chicken.jpeg",
  "/images/pasta.jpg",
  "/images/food-brunch.jpeg",
  "/images/catering-platter.jpeg",
  "/images/seafood-rice.jpg",
  "/images/burger.jpg",
  "/images/smallchops.jpeg",
];

export default function Gallery() {
  return (
    <section
      id="gallery"
      className="bg-[#0B0B0B] py-20 md:py-28"
    >
      <div className="mx-auto max-w-7xl px-5 md:px-8">

        {/* Heading */}

        <div className="mb-16 text-center">

          <span className="inline-block rounded-full border border-[#D4AF37]/30 bg-[#1A1A1A] px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#D4AF37]">
            Our Gallery
          </span>

          <h2 className="mt-6 text-3xl font-extrabold text-white md:text-5xl">
            A Taste of Luxury
          </h2>

          <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-[#B8B8B8] md:text-lg">
            Every dish is carefully prepared, beautifully presented,
            and crafted to create unforgettable dining experiences.
          </p>

        </div>

        {/* Gallery */}

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">

          {gallery.map((image, index) => (

            <div
              key={index}
              className="group relative overflow-hidden rounded-3xl shadow-xl"
            >

              <Image
                src={image}
                alt={`Gallery ${index + 1}`}
                width={600}
                height={600}
                className="h-80 w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />

              {/* Overlay */}

              <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all duration-500 group-hover:bg-black/40">

                <span className="translate-y-4 rounded-full bg-[#D4AF37] px-5 py-3 font-semibold text-black opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                  View
                </span>

              </div>

            </div>

          ))}

        </div>

      </div>
    </section>
  );
}
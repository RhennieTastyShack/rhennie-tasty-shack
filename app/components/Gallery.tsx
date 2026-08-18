"use client";

import Image from "next/image";

const gallery = [
  {
    image: "/images/jollofrice-turkey.jpeg",
    title: "Jollof Rice & Turkey",
  },
  {
    image: "/images/jollof-chicken.jpeg",
    title: "Jollof Rice & Chicken",
  },
  {
    image: "/images/pasta.jpg",
    title: "Royal Pasta",
  },
  {
    image: "/images/signature brunch.jpeg",
    title: "Signature Brunch",
  },
  {
    image: "/images/catering-platter.jpeg",
    title: "Catering Collection",
  },
  {
    image: "/images/seafood-rice.jpg",
    title: "Seafood Rice",
  },
  {
    image: "/images/burger.jpg",
    title: "Gourmet Burger",
  },
  {
    image: "/images/smallchops.jpeg",
    title: "Small Chops",
  },
];

export default function Gallery() {
  return (
    <section
      id="gallery"
      className="relative overflow-hidden bg-[#080808] py-20 text-white md:py-28"
    >
      {/* Decorative gold glow */}
      <div className="pointer-events-none absolute -left-40 top-20 h-96 w-96 rounded-full bg-yellow-500/10 blur-3xl" />

      <div className="pointer-events-none absolute -right-40 bottom-20 h-96 w-96 rounded-full bg-yellow-500/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-6">

        {/* ================= HEADER ================= */}
        <div className="mx-auto mb-14 max-w-4xl text-center">

          <div className="mb-5 flex items-center justify-center gap-4">
            <span className="h-px w-12 bg-yellow-500" />

            <span className="text-xs font-bold uppercase tracking-[0.35em] text-yellow-500">
              Our Gallery
            </span>

            <span className="h-px w-12 bg-yellow-500" />
          </div>

          <h2 className="font-serif text-4xl font-bold leading-tight sm:text-5xl md:text-6xl">
            A Taste of{" "}
            <span className="text-yellow-500">
              Luxury
            </span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-gray-400 sm:text-base">
            Every dish is carefully prepared, beautifully presented,
            and crafted to create unforgettable dining experiences.
          </p>

        </div>

        {/* ================= GALLERY GRID ================= */}
        <div className="grid auto-rows-[240px] grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">

          {gallery.map((item, index) => {

            const featured = index === 0 || index === 4;

            return (
              <div
                key={item.image}
                className={`group relative overflow-hidden rounded-[28px] border border-white/10 bg-[#101010] ${
                  featured
                    ? "sm:col-span-2 sm:row-span-2"
                    : ""
                }`}
              >

                {/* Image */}
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes={
                    featured
                      ? "(max-width: 768px) 100vw, 50vw"
                      : "(max-width: 768px) 100vw, 25vw"
                  }
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />

                {/* Dark gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-100" />

                {/* Gold hover border */}
                <div className="absolute inset-0 rounded-[28px] border border-transparent transition-all duration-500 group-hover:border-yellow-500/70" />

                {/* Number */}
                <span className="absolute left-5 top-5 flex h-8 w-8 items-center justify-center rounded-full border border-yellow-500/70 bg-black/70 text-xs font-bold text-yellow-500">
                  {String(index + 1).padStart(2, "0")}
                </span>

                {/* Bottom content */}
                <div className="absolute bottom-0 left-0 right-0 p-6">

                  <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-yellow-500">
                    Rhennie Tasty Shack
                  </p>

                  <h3
                    className={
                      featured
                        ? "mt-2 text-2xl font-bold text-white md:text-3xl"
                        : "mt-2 text-lg font-bold text-white"
                    }
                  >
                    {item.title}
                  </h3>

                  {/* Hover action */}
                  <div className="mt-3 max-h-0 overflow-hidden opacity-0 transition-all duration-500 group-hover:max-h-12 group-hover:opacity-100">
                    <span className="inline-flex items-center gap-2 text-xs font-bold text-yellow-500">
                      Explore dish
                      <span>→</span>
                    </span>
                  </div>

                </div>

              </div>
            );
          })}

        </div>

        {/* ================= BOTTOM CTA ================= */}
        <div className="mt-12 text-center">

          <p className="text-sm text-gray-500">
            Hungry for more?
          </p>

          <a
            href="/menu"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-yellow-500 px-7 py-3.5 text-sm font-bold text-black transition-all duration-300 hover:bg-yellow-400"
          >
            Explore Our Menu
            <span>→</span>
          </a>

        </div>

      </div>
    </section>
  );
}
"use client";

import Link from "next/link";

const collections = [
  {
    icon: "👑",
    title: "Signature Feast Collection",
    description: "Chef-curated premium meals for every craving.",
    meals: "10 Premium Meals",
    category: "signature",
  },
  {
    icon: "🍽️",
    title: "Build Your Plate",
    description: "Create your own perfect meal.",
    meals: "Unlimited Combinations",
    category: "build-your-plate",
  },
  {
    icon: "🍱",
    title: "Executive Lunch Collection",
    description: "Premium lunch packs for work and business.",
    meals: "8 Lunch Specials",
    category: "executive-lunch",
  },
  {
    icon: "🌅",
    title: "Sunrise Collection",
    description: "Delicious breakfast served fresh every morning.",
    meals: "Breakfast Menu",
    category: "breakfast",
  },
  {
    icon: "🌯",
    title: "Street Kitchen",
    description: "Shawarma, wraps and quick bites.",
    meals: "Quick Meals",
    category: "street-kitchen",
  },
  {
    icon: "🔥",
    title: "Grill House",
    description: "Freshly grilled chicken and seafood.",
    meals: "Grilled Specials",
    category: "grill-house",
  },
  {
    icon: "🍲",
    title: "Grand Pot Collection",
    description: "Family pots perfect for sharing and celebrations.",
    meals: "1L & 2.5L Pots",
    category: "grand-pot",
  },
  {
    icon: "🥂",
    title: "Appetizers",
    description: "Party bites served before the regular menu.",
    meals: "Waffles, seafood, tapioca",
    category: "appetizers",
  },
  {
    icon: "🎁",
    title: "Luxury Food Boxes",
    description: "Beautifully packaged premium food boxes.",
    meals: "Luxury Packages",
    category: "food-boxes",
  },
];

export default function CollectionCard() {
  return (
    <section className="bg-[#0B0B0B] py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-5 md:px-8">

        {/* Section heading */}
        <div className="mb-12 text-center">

          <span className="text-xs font-bold uppercase tracking-[0.3em] text-yellow-500">
            Explore Our Collections
          </span>

          <h2 className="mt-4 text-3xl font-extrabold text-white md:text-5xl">
            Find Something{" "}
            <span className="text-yellow-500">
              Delicious
            </span>
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-gray-400 md:text-base">
            Explore our carefully curated collections and discover meals
            created for every taste, occasion and craving.
          </p>

        </div>

        {/* Collection cards */}
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">

          {collections.map((collection, index) => (

            <article
              key={collection.title}
              className={`group flex min-h-[330px] flex-col overflow-hidden rounded-[28px] border bg-[#151515] p-7 transition-all duration-500 hover:-translate-y-2 ${
                index === 0
                  ? "border-yellow-500 shadow-[0_20px_60px_rgba(234,179,8,0.08)]"
                  : "border-white/10 hover:border-yellow-500/60"
              }`}
            >

              {/* Number */}
              <div className="flex items-center justify-between">

                <span className="text-[10px] font-bold tracking-[0.25em] text-yellow-500">
                  {String(index + 1).padStart(2, "0")}
                </span>

                {index === 0 && (
                  <span className="rounded-full bg-yellow-500 px-3 py-1 text-[9px] font-extrabold uppercase tracking-wider text-black">
                    Featured
                  </span>
                )}

              </div>

              {/* Icon */}
              <div className="mt-6 text-5xl transition-transform duration-500 group-hover:scale-110">
                {collection.icon}
              </div>

              {/* Title */}
              <h3 className="mt-6 min-h-[58px] text-xl font-bold leading-tight text-white md:text-2xl">
                {collection.title}
              </h3>

              {/* Description */}
              <p className="mt-3 min-h-[60px] text-sm leading-6 text-gray-400">
                {collection.description}
              </p>

              {/* Meal count */}
              <p className="mt-4 text-xs font-bold uppercase tracking-[0.15em] text-yellow-500">
                {collection.meals}
              </p>

              {/* Button */}
              <Link
                href={`/menu?category=${collection.category}`}
                className="mt-auto flex h-12 items-center justify-center rounded-xl bg-yellow-500 text-sm font-bold text-black transition-all duration-300 hover:bg-yellow-400 hover:shadow-lg"
              >
                Explore Collection
                <span className="ml-2 transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </Link>

            </article>

          ))}

        </div>

      </div>
    </section>
  );
}
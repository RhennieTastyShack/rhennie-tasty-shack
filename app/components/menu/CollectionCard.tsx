"use client";

import Link from "next/link";

const collections = [
  {
    title: "Signature Feast Collection",
    description: "Chef-curated premium meals for every craving.",
    meals: "10 premium meals",
    category: "signature",
    icon: "👑",
  },
  {
    title: "Build Your Plate",
    description: "Create your own perfect meal.",
    meals: "Custom combinations",
    category: "build-your-plate",
    icon: "🍽️",
  },
  {
    title: "Executive Lunch Collection",
    description: "Premium lunch packs for work and business.",
    meals: "8 lunch specials",
    category: "executive-lunch",
    icon: "🍱",
  },
  {
    title: "Sunrise Collection",
    description: "Breakfast served fresh every morning.",
    meals: "Breakfast menu",
    category: "breakfast",
    icon: "🌅",
  },
  {
    title: "Street Kitchen",
    description: "Shawarma, wraps and quick bites.",
    meals: "Quick meals",
    category: "street-kitchen-wraps",
    icon: "🌯",
  },
  {
    title: "Grill House",
    description: "Freshly grilled chicken and seafood.",
    meals: "Grilled specials",
    category: "street-kitchen-wraps",
    icon: "🔥",
  },
  {
    title: "Grand Pot Collection",
    description: "Family pots perfect for sharing and celebrations.",
    meals: "1L & 2.5L pots",
    category: "grand-pot",
    icon: "🍲",
  },
  {
    title: "Appetizers",
    description: "Party bites served before the main meal.",
    meals: "Party table",
    category: "appetizers",
    icon: "🥳",
  },
  {
    title: "Luxury Food Boxes",
    description: "Beautifully packaged premium food boxes.",
    meals: "Luxury packages",
    category: "food-boxes",
    icon: "🎁",
  },
];

export default function CollectionCard() {
  return (
    <div className="mb-8 overflow-x-hidden pt-6 sm:pt-8">
      <div className="mb-5 text-center sm:mb-6">
        <p className="text-[9px] font-bold uppercase tracking-[0.35em] text-[#F26A21]">
          Explore Our Collections
        </p>
        <h2 className="mt-3 font-serif text-[22px] font-bold leading-tight text-[#171717] sm:text-3xl md:text-4xl">
          Find Something Delicious
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-gray-500 sm:leading-7">
          Pick a collection to browse meals made for every taste and occasion.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {collections.map((collection, index) => (
          <Link
            key={collection.title}
            href={`/menu?category=${collection.category}`}
            className="group flex min-h-0 flex-col rounded-[20px] border border-black/[0.08] bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-[#F26A21]/35 hover:shadow-[0_18px_40px_rgba(242,106,33,0.12)] md:min-h-[148px] md:rounded-[24px] md:px-6 md:py-6"
          >
            <div className="flex items-start justify-between gap-3">
              <span
                aria-hidden="true"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#D4AF37]/45 bg-[#FFF8E8] text-[20px] leading-none md:hidden"
              >
                {collection.icon}
              </span>
              <span className="hidden text-[10px] font-bold tracking-[0.22em] text-[#F26A21] md:inline">
                {String(index + 1).padStart(2, "0")}
              </span>
              {index === 0 ? (
                <span className="rounded-full bg-[#FFF1E9] px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-[#F26A21]">
                  Featured
                </span>
              ) : null}
            </div>

            <h3 className="mt-3 font-serif text-[21px] font-bold leading-snug text-[#171717] md:mt-4 md:text-xl">
              {collection.title}
            </h3>

            <p className="mt-2 flex-1 text-sm leading-6 text-gray-500">
              {collection.description}
            </p>

            <p className="mt-3 text-[13px] font-medium tracking-wide text-[#171717]/55 md:hidden">
              {collection.meals}
            </p>

            <div className="mt-4 md:mt-5 md:flex md:items-center md:justify-between md:gap-3 md:border-t md:border-black/[0.06] md:pt-4">
              <span className="hidden text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400 md:inline">
                {collection.meals}
              </span>
              <span className="hidden text-sm font-semibold text-[#F26A21] transition-transform duration-300 group-hover:translate-x-1 md:inline">
                Browse →
              </span>
              <span className="flex h-11 w-full items-center justify-center rounded-full bg-[#F26A21] text-sm font-bold text-white transition group-hover:bg-[#D95512] md:hidden">
                Explore Collection
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

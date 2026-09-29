"use client";

import Link from "next/link";

const collections = [
  {
    title: "Signature Feast Collection",
    description: "Chef-curated premium meals for every craving.",
    meals: "10 premium meals",
    category: "signature",
  },
  {
    title: "Build Your Plate",
    description: "Create your own perfect meal.",
    meals: "Custom combinations",
    category: "build-your-plate",
  },
  {
    title: "Executive Lunch Collection",
    description: "Premium lunch packs for work and business.",
    meals: "8 lunch specials",
    category: "executive-lunch",
  },
  {
    title: "Sunrise Collection",
    description: "Breakfast served fresh every morning.",
    meals: "Breakfast menu",
    category: "breakfast",
  },
  {
    title: "Street Kitchen",
    description: "Shawarma, wraps and quick bites.",
    meals: "Quick meals",
    category: "street-kitchen-wraps",
  },
  {
    title: "Grill House",
    description: "Freshly grilled chicken and seafood.",
    meals: "Grilled specials",
    category: "street-kitchen-wraps",
  },
  {
    title: "Grand Pot Collection",
    description: "Family pots perfect for sharing and celebrations.",
    meals: "1L & 2.5L pots",
    category: "grand-pot",
  },
  {
    title: "Appetizers",
    description: "Party bites served before the main meal.",
    meals: "Party table",
    category: "appetizers",
  },
  {
    title: "Luxury Food Boxes",
    description: "Beautifully packaged premium food boxes.",
    meals: "Luxury packages",
    category: "food-boxes",
  },
];

export default function CollectionCard() {
  return (
    <div className="mb-8 pt-8">
      <div className="mb-6 text-center">
        <p className="text-[9px] font-bold uppercase tracking-[0.35em] text-[#F26A21]">
          Explore Our Collections
        </p>
        <h2 className="mt-3 font-serif text-3xl font-bold text-[#171717] sm:text-4xl">
          Find Something Delicious
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-gray-500">
          Pick a collection to browse meals made for every taste and occasion.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {collections.map((collection, index) => (
          <Link
            key={collection.title}
            href={`/menu?category=${collection.category}`}
            className="group flex min-h-[148px] flex-col rounded-[24px] border border-black/[0.08] bg-white px-5 py-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-[#F26A21]/35 hover:shadow-[0_18px_40px_rgba(242,106,33,0.12)] sm:px-6 sm:py-6"
          >
            <div className="flex items-start justify-between gap-3">
              <span className="text-[10px] font-bold tracking-[0.22em] text-[#F26A21]">
                {String(index + 1).padStart(2, "0")}
              </span>
              {index === 0 ? (
                <span className="rounded-full bg-[#FFF1E9] px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-[#F26A21]">
                  Featured
                </span>
              ) : null}
            </div>

            <h3 className="mt-4 font-serif text-xl font-bold leading-snug text-[#171717]">
              {collection.title}
            </h3>

            <p className="mt-2 flex-1 text-sm leading-6 text-gray-500">
              {collection.description}
            </p>

            <div className="mt-5 flex items-center justify-between gap-3 border-t border-black/[0.06] pt-4">
              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">
                {collection.meals}
              </span>
              <span className="text-sm font-semibold text-[#F26A21] transition-transform duration-300 group-hover:translate-x-1">
                Browse →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

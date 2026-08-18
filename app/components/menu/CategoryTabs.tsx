"use client";

import Link from "next/link";

const tabs = [
  {
    label: "👑 Signature Feast",
    category: "signature",
  },
  {
    label: "🍽️ Build Your Plate",
    category: "build-your-plate",
  },
  {
    label: "🍱 Executive Lunch",
    category: "executive-lunch",
  },
  {
    label: "🌅 Breakfast",
    category: "breakfast",
  },
  {
    label: "🌯 Street Kitchen",
    category: "street-kitchen",
  },
  {
    label: "🔥 Grill House",
    category: "grill-house",
  },
  {
    label: "🍲 Grand Pot Collection",
    category: "grand-pot",
  },
  {
    label: "🎁 Food Boxes",
    category: "food-boxes",
  },
];

export default function CategoryTabs() {
  return (
    <section className="bg-[#0B0B0B] py-5">
      <div className="mx-auto max-w-7xl px-5 md:px-8">

        <div className="scrollbar-hide flex gap-3 overflow-x-auto pb-2">

          {tabs.map((tab) => (
            <Link
              key={tab.category}
              href={`/menu?category=${tab.category}`}
              className="whitespace-nowrap rounded-full border border-yellow-500/70 bg-[#111111] px-5 py-2.5 text-sm font-medium text-white transition-all duration-300 hover:bg-yellow-500 hover:text-black hover:shadow-lg"
            >
              {tab.label}
            </Link>
          ))}

        </div>

      </div>
    </section>
  );
}
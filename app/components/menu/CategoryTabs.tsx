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
    <section className="overflow-x-hidden bg-[#0B0B0B] py-3 sm:py-5">
      <div className="mx-auto w-full max-w-7xl px-4 md:px-8">
        <div className="scrollbar-hide -mx-0 overflow-x-auto overscroll-x-contain pb-1 [scrollbar-width:none] [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:hidden">
          <div className="flex w-max min-w-full gap-2 sm:gap-3">
            {tabs.map((tab) => (
              <Link
                key={tab.category}
                href={`/menu?category=${tab.category}`}
                className="whitespace-nowrap rounded-full border border-[#D4AF37]/70 bg-[#111111] px-3.5 py-1.5 text-[12px] font-medium text-white transition-all duration-300 hover:bg-[#D4AF37] hover:text-black hover:shadow-lg sm:px-5 sm:py-2.5 sm:text-sm"
              >
                {tab.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

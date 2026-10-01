"use client";

import { useEffect, useState } from "react";
import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";

const categories = [
  { label: "All Meals", value: "" },
  { label: "Signature Feast", value: "signature" },
  { label: "Build Your Plate", value: "build-your-plate" },
  { label: "Executive Lunch", value: "executive-lunch" },
  { label: "Breakfast", value: "breakfast" },
  { label: "Street Kitchen & Wraps", value: "street-kitchen-wraps" },
  { label: "Soups, Sides & Sauces", value: "soups-sides-sauces" },
  { label: "Appetizers", value: "appetizers" },
  { label: "Food Boxes", value: "food-boxes" },
  { label: "Food by Litre", value: "grand-pot" },
];

type MenuFiltersProps = {
  showCollectionChips?: boolean;
};

export default function MenuFilters({
  showCollectionChips = true,
}: MenuFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeCategory = searchParams.get("category") || "";
  const urlSearch = searchParams.get("search") || "";
  const [search, setSearch] = useState(urlSearch);

  useEffect(() => {
    setSearch(urlSearch);
  }, [urlSearch]);

  function handleCategory(value: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set("category", value);
    } else {
      params.delete("category");
    }

    const query = params.toString();

    router.push(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }

  function handleSearch(value: string) {
    setSearch(value);

    const params = new URLSearchParams(searchParams.toString());
    const trimmedValue = value.trim();

    if (trimmedValue) {
      params.set("search", trimmedValue);
    } else {
      params.delete("search");
    }

    const query = params.toString();

    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }

  function clearFilters() {
    setSearch("");
    router.push(pathname, { scroll: false });
  }

  const activeCategoryLabel =
    categories.find((category) => category.value === activeCategory)
      ?.label || "All Meals";

  const hasFilters = Boolean(activeCategory || urlSearch);

  return (
    <section className="relative z-30 border-y border-black/[0.06] bg-white px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {showCollectionChips ? (
          <div className="flex flex-col items-center">
            <div className="mb-3 flex items-center gap-3">
              <span className="h-px w-8 bg-[#D4AF37]" />
              <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-[#D4AF37]">
                Collections
              </p>
              <span className="h-px w-8 bg-[#D4AF37]" />
            </div>

            <h3 className="text-center font-serif text-2xl font-bold text-[#171717] sm:text-3xl">
              Browse the menu
            </h3>

            <p className="mt-2 text-center text-xs text-gray-500 sm:text-sm">
              Including Food Boxes, pots by the litre and signature meals.
            </p>
          </div>
        ) : null}

        <div
          className={`mx-auto w-full max-w-2xl ${
            showCollectionChips ? "mt-6" : ""
          }`}
        >
          <div className="group relative">
            <div className="pointer-events-none absolute left-5 top-1/2 z-10 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-[#F26A21]">
              <svg
                width="19"
                height="19"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
            </div>

            <input
              type="search"
              value={search}
              onChange={(event) => handleSearch(event.target.value)}
              placeholder="Search meals, dishes or collections..."
              aria-label="Search meals"
              className="h-14 w-full rounded-full border border-black/10 bg-[#F8F6F2] pl-12 pr-12 text-sm text-[#171717] outline-none transition-all duration-300 placeholder:text-gray-400 focus:border-[#F26A21] focus:bg-white focus:ring-4 focus:ring-[#F26A21]/10"
            />

            {search ? (
              <button
                type="button"
                onClick={() => handleSearch("")}
                aria-label="Clear search"
                className="absolute right-4 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-[#F26A21] hover:text-white"
              >
                ×
              </button>
            ) : null}
          </div>
        </div>

        {showCollectionChips ? (
          <div className="mt-7">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-gray-400">
                Collections
              </p>
              <p className="text-[9px] text-gray-400 sm:hidden">Swipe →</p>
            </div>

            <div className="overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div className="flex min-w-max items-center gap-2 sm:flex-wrap sm:justify-center sm:gap-3">
                {categories.map((category) => {
                  const isActive = activeCategory === category.value;

                  return (
                    <button
                      key={category.value || "all"}
                      type="button"
                      onClick={() => handleCategory(category.value)}
                      aria-pressed={isActive}
                      className={`group relative flex min-h-[42px] items-center justify-center whitespace-nowrap rounded-full border px-5 text-[9px] font-bold uppercase tracking-[0.12em] transition-all duration-300 sm:min-h-[44px] sm:px-6 ${
                        isActive
                          ? "border-[#0B0B0B] bg-[#0B0B0B] text-[#D4AF37] shadow-[0_8px_25px_rgba(0,0,0,0.12)]"
                          : "border-black/10 bg-white text-gray-600 hover:border-[#D4AF37]/50 hover:text-[#171717] hover:shadow-sm"
                      }`}
                    >
                      {category.label}
                      {isActive ? (
                        <span className="ml-2 h-1.5 w-1.5 rounded-full bg-white" />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : null}

        {hasFilters ? (
          <div className="mt-6 flex flex-col items-center justify-center gap-3 border-t border-black/[0.06] pt-5 sm:flex-row">
            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400">
                Showing
              </span>

              {activeCategory ? (
                <span className="rounded-full bg-[#FFF1E9] px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider text-[#F26A21]">
                  {activeCategoryLabel}
                </span>
              ) : null}

              {urlSearch ? (
                <span className="max-w-[220px] truncate rounded-full bg-[#FFF1E9] px-3 py-1.5 text-[9px] font-bold text-[#F26A21]">
                  “{urlSearch}”
                </span>
              ) : null}
            </div>

            <button
              type="button"
              onClick={clearFilters}
              className="rounded-full border border-black/10 px-4 py-2 text-[9px] font-bold uppercase tracking-[0.15em] text-gray-500 transition-all duration-300 hover:border-[#F26A21] hover:bg-[#F26A21] hover:text-white"
            >
              Clear Filters
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}

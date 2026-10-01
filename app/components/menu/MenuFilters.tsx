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
    <section className="relative z-30 border-b border-black/[0.06] bg-[#FAF8F4] py-8">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-12 xl:px-16">
        {showCollectionChips ? (
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#F26A21]">
              The Menu
            </p>
            <h3 className="mt-2 font-serif text-2xl font-bold text-[#171717] sm:text-3xl">
              Browse by collection
            </h3>
          </div>
        ) : null}

        <div
          className={`mx-auto w-full max-w-xl ${
            showCollectionChips ? "mt-6" : ""
          }`}
        >
          <div className="relative">
            <input
              type="search"
              value={search}
              onChange={(event) => handleSearch(event.target.value)}
              placeholder="Search the menu..."
              aria-label="Search meals"
              className="h-12 w-full rounded-full border border-black/10 bg-white px-5 text-sm text-[#171717] outline-none transition placeholder:text-black/35 focus:border-[#F26A21]"
            />
            {search ? (
              <button
                type="button"
                onClick={() => handleSearch("")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-black/40 hover:bg-black/5"
              >
                ×
              </button>
            ) : null}
          </div>
        </div>

        {showCollectionChips ? (
          <div className="mt-7 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex min-w-max items-center justify-start gap-1 sm:flex-wrap sm:justify-center sm:gap-x-1 sm:gap-y-2">
              {categories.map((category) => {
                const isActive = activeCategory === category.value;

                return (
                  <button
                    key={category.value || "all"}
                    type="button"
                    onClick={() => handleCategory(category.value)}
                    aria-pressed={isActive}
                    className={`min-h-[40px] whitespace-nowrap rounded-full px-4 text-[12px] font-medium transition-colors sm:px-5 ${
                      isActive
                        ? "bg-[#F26A21] text-white"
                        : "bg-white text-black/55 hover:text-[#171717]"
                    }`}
                  >
                    {category.label}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        {hasFilters ? (
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3 text-xs text-black/45">
            <span>
              Showing {activeCategory ? activeCategoryLabel : "all meals"}
              {urlSearch ? ` · “${urlSearch}”` : ""}
            </span>
            <button
              type="button"
              onClick={clearFilters}
              className="font-semibold text-[#171717] underline-offset-4 hover:underline"
            >
              Clear
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}

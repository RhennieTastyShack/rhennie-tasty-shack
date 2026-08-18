"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function MenuSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentSearch = searchParams.get("search") || "";

  const [search, setSearch] = useState(currentSearch);

  useEffect(() => {
    setSearch(currentSearch);
  }, [currentSearch]);

  function handleSearch(value: string) {
    setSearch(value);

    const params = new URLSearchParams(searchParams.toString());

    if (value.trim()) {
      params.set("search", value.trim());
    } else {
      params.delete("search");
    }

    const query = params.toString();

    router.push(
      query
        ? `${pathname}?${query}`
        : pathname
    );
  }

  function clearSearch() {
    setSearch("");

    const params = new URLSearchParams(searchParams.toString());

    params.delete("search");

    const query = params.toString();

    router.push(
      query
        ? `${pathname}?${query}`
        : pathname
    );
  }

  return (
    <section className="bg-[#0B0B0B] py-6">

      <div className="mx-auto max-w-7xl px-6">

        <div className="relative">

          <input
            type="text"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search meals..."
            className="w-full rounded-xl border border-zinc-700 bg-zinc-900 p-4 pr-12 text-white placeholder:text-gray-500 outline-none transition focus:border-yellow-500"
          />

          {search && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xl text-gray-400 transition hover:text-yellow-500"
              aria-label="Clear search"
            >
              ×
            </button>
          )}

        </div>

        {search && (
          <p className="mt-3 text-xs text-gray-500">
            Searching for{" "}
            <span className="text-yellow-500">
              "{search}"
            </span>
          </p>
        )}

      </div>

    </section>
  );
}
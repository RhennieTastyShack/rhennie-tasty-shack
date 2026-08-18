"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

type MenuItem = {
  id: string;
  name: string;
  collection: string;
  description: string;
  price: number;
  image_url: string | null;
  available: boolean;
};

/* =========================================================
   IMAGE PATH
   Handles filenames with spaces, &, etc.
========================================================= */

function getImagePath(imageUrl: string | null) {
  if (!imageUrl) {
    return "/images/logo.png";
  }

  if (
    imageUrl.startsWith("/") ||
    imageUrl.startsWith("http://") ||
    imageUrl.startsWith("https://")
  ) {
    return imageUrl;
  }

  return `/images/${encodeURIComponent(imageUrl)}`;
}

/* =========================================================
   CATEGORY FILTER
========================================================= */

function matchesCategory(collection: string, category: string) {
  const value = collection.toLowerCase().trim();

  const categoryMap: Record<string, string[]> = {
    signature: [
      "signature feast",
      "signature meals",
      "signature meal",
      "signature",
    ],

    "build-your-plate": [
      "build your plate",
    ],

    "executive-lunch": [
      "executive lunch",
      "executive",
      "lunch",
    ],

    breakfast: [
      "breakfast",
      "sunrise",
    ],

    "street-kitchen": [
      "street kitchen",
      "street",
    ],

    "grill-house": [
      "grill house",
      "grill",
    ],

    "grand-pot": [
      "grand pot",
      "food by litre",
      "food by liter",
      "food by litre",
      "party orders",
    ],

    "food-boxes": [
      "food boxes",
      "food box",
    ],
  };

  const matches = categoryMap[category];

  // If there is no category filter,
  // allow everything.
  if (!matches) {
    return true;
  }

  return matches.some((item) => value.includes(item));
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function MenuGrid() {
  const searchParams = useSearchParams();

  const category = searchParams.get("category") || "";
  const search = searchParams.get("search") || "";

  const [meals, setMeals] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* =======================================================
     LOAD MENU FROM SUPABASE
  ======================================================= */

  useEffect(() => {
    async function loadMeals() {
      setLoading(true);
      setError("");

      const { data, error } = await supabase
        .from("menu")
        .select(
          "id, name, collection, description, price, image_url, available"
        )
        .eq("available", true)
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        console.error("Menu loading error:", error);

        setError("Unable to load our menu right now.");
        setMeals([]);
      } else {
        setMeals(data || []);
      }

      setLoading(false);
    }

    loadMeals();
  }, []);

  /* =======================================================
     FILTER MEALS
  ======================================================= */

  const filteredMeals = useMemo(() => {
    const searchValue = search.toLowerCase().trim();

    return meals.filter((meal) => {
      const categoryMatch =
        !category || matchesCategory(meal.collection, category);

      const searchMatch =
        !searchValue ||
        meal.name.toLowerCase().includes(searchValue) ||
        meal.description.toLowerCase().includes(searchValue) ||
        meal.collection.toLowerCase().includes(searchValue);

      return categoryMatch && searchMatch;
    });
  }, [meals, category, search]);

  /* =======================================================
     FORMAT PRICE
  ======================================================= */

  function formatPrice(price: number) {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(price);
  }

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <section className="bg-[#0B0B0B] px-5 py-20 text-white md:px-8">
        <div className="mx-auto max-w-7xl">

          <div className="mb-10 text-center">
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-yellow-500">
              Our Menu
            </span>

            <h2 className="mt-3 text-3xl font-bold md:text-4xl">
              Loading Deliciousness...
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-[500px] animate-pulse rounded-[28px] border border-white/10 bg-[#151515]"
              />
            ))}
          </div>

        </div>
      </section>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (error) {
    return (
      <section className="bg-[#0B0B0B] px-5 py-20 text-center text-white">
        <p className="text-lg font-semibold text-red-400">
          {error}
        </p>

        <p className="mt-2 text-sm text-gray-500">
          Please refresh the page and try again.
        </p>
      </section>
    );
  }

  /* =======================================================
     MENU
  ======================================================= */

  return (
    <section
      id="meals"
      className="bg-[#0B0B0B] px-5 py-16 text-white md:px-8 md:py-20"
    >
      <div className="mx-auto max-w-7xl">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-10">

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">

            <div>
              <span className="text-xs font-bold uppercase tracking-[0.3em] text-yellow-500">
                Freshly Prepared
              </span>

              <h2 className="mt-3 text-3xl font-extrabold md:text-4xl">
                {category
                  ? "Explore This Collection"
                  : "Our Signature Menu"}
              </h2>
            </div>

            <p className="text-sm text-gray-500">
              {filteredMeals.length}{" "}
              {filteredMeals.length === 1 ? "meal" : "meals"}
            </p>

          </div>

          {search && (
            <p className="mt-4 text-sm text-gray-400">
              Search results for{" "}
              <span className="font-semibold text-yellow-500">
                "{search}"
              </span>
            </p>
          )}

        </div>

        {/* =================================================
            EMPTY STATE
        ================================================= */}

        {filteredMeals.length === 0 ? (
          <div className="rounded-[28px] border border-white/10 bg-[#111111] px-6 py-20 text-center">

            <div className="text-5xl">
              🍽️
            </div>

            <h3 className="mt-5 text-2xl font-bold">
              No meals found
            </h3>

            <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-gray-500">
              We couldn't find a meal matching your search or
              selected collection. Try another category or search
              term.
            </p>

            {category && (
              <p className="mt-4 text-sm text-gray-500">
                Selected category:{" "}
                <span className="font-semibold text-yellow-500">
                  {category}
                </span>
              </p>
            )}

          </div>
        ) : (

          /* =================================================
             MEAL GRID
          ================================================= */

          <div className="grid items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

            {filteredMeals.map((meal) => (

              <article
                key={meal.id}
                className="group flex h-[500px] flex-col overflow-hidden rounded-[28px] border border-white/10 bg-[#151515] transition-all duration-500 hover:-translate-y-2 hover:border-yellow-500/60 hover:shadow-[0_20px_60px_rgba(234,179,8,0.08)]"
              >

                {/* =================================================
                    IMAGE
                ================================================= */}

                <div className="relative h-[245px] w-full shrink-0 overflow-hidden">

                  <Image
                    src={getImagePath(meal.image_url)}
                    alt={meal.name}
                    fill
                    priority={false}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                  {/* Collection Badge */}

                  <span className="absolute left-4 top-4 rounded-full border border-yellow-500/50 bg-black/70 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.18em] text-yellow-500">
                    {meal.collection}
                  </span>

                </div>

                {/* =================================================
                    CONTENT
                ================================================= */}

                <div className="flex flex-1 flex-col p-5">

                  <h3 className="min-h-[56px] text-xl font-bold leading-tight text-white">
                    {meal.name}
                  </h3>

                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-gray-400">
                    {meal.description}
                  </p>

                  {/* =================================================
                      BOTTOM
                  ================================================= */}

                  <div className="mt-auto border-t border-white/10 pt-5">

                    <div className="flex items-end justify-between gap-3">

                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-500">
                          Price
                        </p>

                        <p className="mt-1 text-2xl font-extrabold text-yellow-500">
                          {formatPrice(meal.price)}
                        </p>
                      </div>

                      <span className="text-xs text-green-500">
                        Available
                      </span>

                    </div>

                    {/* =================================================
                        WHATSAPP ORDER
                    ================================================= */}

                    <a
                      href={`https://wa.me/2348121577759?text=${encodeURIComponent(
                        `Hello Rhennie Tasty Shack, I would like to order ${meal.name} for ${formatPrice(
                          meal.price
                        )}.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 flex h-11 w-full items-center justify-center rounded-xl bg-yellow-500 text-sm font-bold text-black transition-all duration-300 hover:bg-yellow-400"
                    >
                      Order This Meal →
                    </a>

                  </div>

                </div>

              </article>

            ))}

          </div>
        )}

      </div>
    </section>
  );
}
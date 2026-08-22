"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { supabase } from "@/lib/supabase";
import MenuFilters from "./MenuFilters";
import MealCard from "./MealCard";

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
   CATEGORY MATCHING
========================================================= */

function matchesCategory(
  collection: string,
  category: string
) {
  const value = collection.toLowerCase().trim();

  const categoryMap: Record<string, string[]> = {
    signature: [
      "signature",
      "signature meal",
      "signature meals",
      "signature feast",
    ],

    "build-your-plate": [
      "build your plate",
      "build-your-plate",
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

    "food-boxes": [
      "food box",
      "food boxes",
    ],

    "grand-pot": [
      "grand pot",
      "food by litre",
      "food by liter",
      "party orders",
      "litre",
      "liter",
    ],
  };

  const matches = categoryMap[category];

  if (!matches) {
    return true;
  }

  return matches.some((item) =>
    value.includes(item)
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function MenuGrid() {
  const searchParams = useSearchParams();

  const category =
    searchParams.get("category") || "";

  const search =
    searchParams.get("search") || "";

  const [meals, setMeals] =
    useState<MenuItem[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

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
        console.error(
          "Menu loading error:",
          error
        );

        setError(
          "Unable to load our menu right now."
        );

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
    const searchValue =
      search.toLowerCase().trim();

    return meals.filter((meal) => {
      const categoryMatch =
        !category ||
        matchesCategory(
          meal.collection,
          category
        );

      const searchMatch =
        !searchValue ||
        meal.name
          .toLowerCase()
          .includes(searchValue) ||
        meal.description
          .toLowerCase()
          .includes(searchValue) ||
        meal.collection
          .toLowerCase()
          .includes(searchValue);

      return (
        categoryMatch &&
        searchMatch
      );
    });
  }, [
    meals,
    category,
    search,
  ]);

  /* =======================================================
     LOADING SKELETON
  ======================================================= */

  if (loading) {
    return (
      <section className="bg-[#F8F6F2] px-4 py-10 sm:px-6 lg:px-8">

        <div className="mx-auto max-w-7xl">

          <MenuFilters />

          <div className="mb-7 flex items-end justify-between gap-4">

            <div>
              <div className="h-3 w-24 animate-pulse rounded bg-black/10" />

              <div className="mt-3 h-8 w-48 animate-pulse rounded bg-black/10" />
            </div>

            <div className="h-9 w-20 animate-pulse rounded-full bg-black/10" />

          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

            {Array.from({ length: 8 }).map(
              (_, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-[26px] border border-black/5 bg-white shadow-sm"
                >
                  <div className="aspect-[4/3] animate-pulse bg-black/10" />

                  <div className="space-y-4 p-5">

                    <div className="h-6 animate-pulse rounded bg-black/10" />

                    <div className="h-4 animate-pulse rounded bg-black/5" />

                    <div className="h-4 w-3/4 animate-pulse rounded bg-black/5" />

                    <div className="h-12 animate-pulse rounded-full bg-black/10" />

                  </div>
                </div>
              )
            )}

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
      <section className="bg-[#F8F6F2] px-4 py-16 sm:px-6 lg:px-8">

        <div className="mx-auto max-w-7xl">

          <MenuFilters />

          <div className="rounded-[28px] border border-red-200 bg-white px-6 py-20 text-center shadow-sm">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-2xl text-red-500">
              !
            </div>

            <h2 className="mt-6 font-serif text-3xl font-bold text-[#171717]">
              Something went wrong
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-gray-500">
              {error}
            </p>

            <button
              type="button"
              onClick={() =>
                window.location.reload()
              }
              className="mt-7 rounded-full bg-[#F26A21] px-7 py-3 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-[#D95512]"
            >
              Try Again
            </button>

          </div>

        </div>
      </section>
    );
  }

  /* =======================================================
     MAIN MENU GRID
  ======================================================= */

  return (
    <section
      id="meals"
      className="relative overflow-hidden bg-[#F8F6F2] px-4 pb-20 pt-0 text-[#171717] sm:px-6 lg:px-8"
    >

      {/* Decorative orange atmosphere */}

      <div className="pointer-events-none absolute -left-40 top-40 h-80 w-80 rounded-full bg-[#F26A21]/5 blur-[100px]" />

      <div className="pointer-events-none absolute -right-40 bottom-40 h-80 w-80 rounded-full bg-[#F26A21]/5 blur-[100px]" />

      <div className="relative mx-auto max-w-7xl">

        {/* ===================================================
            FILTERS
        =================================================== */}

        <MenuFilters />

        {/* ===================================================
            RESULT HEADER
        =================================================== */}

        <div className="mb-8 mt-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

          <div>

            <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#F26A21]">
              Freshly Prepared
            </p>

            <h2 className="mt-2 font-serif text-2xl font-bold text-[#171717] sm:text-3xl">
              {category
                ? "Explore This Collection"
                : "Our Signature Menu"}
            </h2>

            {search && (
              <p className="mt-2 text-sm text-gray-500">
                Showing results for{" "}
                <span className="font-semibold text-[#F26A21]">
                  "{search}"
                </span>
              </p>
            )}

          </div>

          <div className="flex w-fit items-center rounded-full border border-black/10 bg-white px-4 py-2.5 shadow-sm">

            <span className="mr-2 h-2 w-2 rounded-full bg-[#F26A21]" />

            <span className="text-xs font-semibold text-gray-500">
              {filteredMeals.length}{" "}
              {filteredMeals.length === 1
                ? "meal"
                : "meals"}
            </span>

          </div>

        </div>

        {/* ===================================================
            EMPTY STATE
        =================================================== */}

        {filteredMeals.length === 0 ? (
          <div className="rounded-[30px] border border-black/10 bg-white px-6 py-20 text-center shadow-sm">

            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#FFF1E9] text-3xl">
              🍽️
            </div>

            <h3 className="mt-6 font-serif text-2xl font-bold text-[#171717] sm:text-3xl">
              No meals found
            </h3>

            <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-gray-500">
              We couldn't find a meal matching your
              current search or selected collection.
              Try another option.
            </p>

          </div>
        ) : (

          /* =================================================
             MEAL GRID
          ================================================= */

          <div className="grid items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

            {filteredMeals.map((meal) => (

              <MealCard
                key={meal.id}
                name={meal.name}
                collection={meal.collection}
                description={meal.description}
                price={meal.price}
                imageUrl={meal.image_url}
                available={meal.available}
              />

            ))}

          </div>
        )}

        {/* ===================================================
            BOTTOM BRAND MESSAGE
        =================================================== */}

        {filteredMeals.length > 0 && (
          <div className="mt-16 text-center">

            <div className="mx-auto mb-5 h-px max-w-xs bg-gradient-to-r from-transparent via-[#F26A21]/40 to-transparent" />

            <p className="text-[8px] font-bold uppercase tracking-[0.4em] text-gray-400 sm:text-[9px]">
              Premium Taste
              <span className="mx-3 text-[#F26A21]">
                •
              </span>
              Freshly Prepared
              <span className="mx-3 text-[#F26A21]">
                •
              </span>
              Fast Delivery
            </p>

          </div>
        )}

      </div>
    </section>
  );
}
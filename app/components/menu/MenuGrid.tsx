"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { supabase } from "@/lib/supabase";
import { RETIRED_CATALOG_NAMES } from "@/lib/catalog-dishes";
import { polishCollectionName } from "@/lib/menu-images";
import { PARTY_DISHES, RETIRED_PARTY_DISHES } from "@/lib/party-menu";
import MenuFilters from "./MenuFilters";
import MealCard from "./MealCard";
import FoodByLitreCard from "./FoodByLitreCard";

type MenuItem = {
  id: string;
  name: string;
  collection: string;
  collectionSlug: string;
  description: string;
  price: number;
  image_url: string | null;
  available: boolean;
  featured: boolean;
  display_order: number;
  sort_order: number;
};

type LitreOption = {
  size: string;
  price: number;
};

type GroupedLitreMeal = {
  id: string;
  name: string;
  description: string;
  available: boolean;
  options: LitreOption[];
};

/* =========================================================
   CATEGORY MATCHING
========================================================= */

function matchesCategory(
  collection: string,
  collectionSlug: string,
  category: string
) {
  const name = collection.toLowerCase().trim();
  const slug = collectionSlug.toLowerCase().trim();

  if (!category) {
    return true;
  }

  const categoryMap: Record<string, string[]> = {
    signature: [
      "signature",
      "signature feast",
      "signature feast collection",
    ],

    "build-your-plate": [
      "build your plate",
      "build-your-plate",
      "main meals",
      "main meal",
      "main-meals",
      "pasta",
    ],

    "executive-lunch": [
      "executive lunch",
      "executive-lunch",
      "executive lunch collection",
      "executive",
      "combo",
      "combo collection",
      "combo-collection",
    ],

    breakfast: [
      "breakfast",
      "sunrise",
      "sunrise collection",
      "sunrise-collection",
    ],

    "street-kitchen-wraps": [
      "street kitchen & wraps",
      "street-kitchen-wraps",
      "street kitchen",
      "street-kitchen",
      "street",
      "wraps",
      "shawarma",
      "shawarma & wraps",
      "shawarma-wraps",
      "sharwarma",
      "grill house",
      "grill-house",
      "grill",
    ],

    "soups-sides-sauces": [
      "soups, sides & sauces",
      "soups-sides-sauces",

      "soups & swallows",
      "soups and swallows",
      "soups-swallow",
      "soups",
      "swallows",
      "soup",

      "proteins & sides",
      "proteins and sides",
      "proteins-sides",
      "proteins",
      "sides",

      "sauces",
      "sauce",
    ],

    appetizers: [
      "appetizers",
      "appetizer",
      "party table",
      "party-table",
    ],

    "food-boxes": [
      "luxury food boxes",
      "luxury-food-boxes",
      "food boxes",
      "food-boxes",
      "food box",
      "platter",
      "feast box",
    ],

    "grand-pot": [
      "grand pot",
      "grand-pot",
      "food by litre",
      "food-by-litre",
      "food by liter",
      "food-by-liter",
      "party orders",
      "litre",
      "liter",
    ],
  };

  const matches = categoryMap[category];

  if (!matches) {
    return (
      name.includes(category) ||
      slug.includes(category)
    );
  }

  return matches.some(
    (value) =>
      name.includes(value) ||
      slug.includes(value)
  );
}

/* =========================================================
   FOOD BY LITRE CHECK
========================================================= */

function isFoodByLitre(
  collection: string,
  collectionSlug: string
) {
  const name = collection.toLowerCase().trim();
  const slug = collectionSlug.toLowerCase().trim();

  return (
    name.includes("grand pot") ||
    name.includes("food by litre") ||
    name.includes("food by liter") ||
    slug.includes("grand-pot") ||
    slug.includes("food-by-litre") ||
    slug.includes("food-by-liter")
  );
}

/* =========================================================
   LITRE SIZES
========================================================= */

const litreSizes = [
  "1L",
  "2L",
  "2.5L",
  "3L",
  "4L",
  "5L",
];

/* =========================================================
   COMPONENT
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
     LOAD MENU
  ======================================================= */

  useEffect(() => {
    let mounted = true;

    async function loadMeals() {
      setLoading(true);
      setError("");

      const { data, error } = await supabase
        .from("menu_items")
        .select(`
          id,
          name,
          description,
          price,
          image_url,
          available,
          featured,
          display_order,
          sort_order,
          collections!inner (
            name,
            slug,
            active,
            display_order
          )
        `)
        .eq("collections.active", true)
        .order("display_order", {
          ascending: true,
        })
        .order("sort_order", {
          ascending: true,
        });

      if (!mounted) {
        return;
      }

      if (error) {
        console.error(
          "Menu loading error:",
          error
        );

        setError(
          "Unable to load our menu right now."
        );

        setMeals([]);
        setLoading(false);

        return;
      }

      const formattedMeals: MenuItem[] =
        (data || []).map((item: any) => {
          const name = item.name || "";
          const rawCollection =
            item.collections?.name || "";

          return {
            id: item.id,

            name,

            collection: polishCollectionName(
              name,
              rawCollection
            ),

            collectionSlug:
              item.collections?.slug || "",

            description:
              item.description || "",

            price:
              Number(item.price) || 0,

            image_url:
              item.image_url || null,

            available:
              item.available ?? true,

            featured:
              item.featured ?? false,

            display_order:
              Number(item.display_order) || 0,

            sort_order:
              Number(item.sort_order) || 0,
          };
        });

      setMeals(formattedMeals);
      setLoading(false);

      try {
        const partyResponse = await fetch("/api/menu", {
          cache: "no-store",
        });
        const partyRows = await partyResponse.json();

        if (Array.isArray(partyRows)) {
          const hiddenNames = new Set(
            [
              ...RETIRED_PARTY_DISHES,
              ...PARTY_DISHES.flatMap((dish) => dish.previousNames || []),
            ].map((name) => name.toLowerCase())
          );

          const partyMeals: MenuItem[] = partyRows
            .filter((row) =>
              /appetizer|party table/i.test(String(row.collection || ""))
            )
            .filter((row) => row.available !== false)
            .filter(
              (row) =>
                !hiddenNames.has(String(row.name || "").toLowerCase())
            )
            .map((row, index) => ({
              id: String(row.id),
              name: String(row.name || ""),
              collection: "Appetizers",
              collectionSlug: "appetizers",
              description: String(row.description || ""),
              price: Number(row.price) || 0,
              image_url: row.image_url || null,
              available: true,
              featured: false,
              display_order: 80 + index,
              sort_order: index,
            }));

          const partyByName = new Map(
            partyMeals.map((meal) => [meal.name.toLowerCase(), meal])
          );

          const refreshed = formattedMeals
            .filter(
              (meal) => !hiddenNames.has(meal.name.toLowerCase())
            )
            .map((meal) => {
              const party = partyByName.get(meal.name.toLowerCase());
              const isAppetizer = /appetizer|party/i.test(
                `${meal.collection} ${meal.collectionSlug}`
              );

              if (!party || !isAppetizer) return meal;

              return {
                ...meal,
                description: party.description,
                price: party.price,
                image_url: party.image_url || meal.image_url,
              };
            });

          const names = new Set(
            refreshed.map((meal) => meal.name.toLowerCase())
          );

          if (!mounted) return;

          setMeals([
            ...refreshed,
            ...partyMeals.filter(
              (meal) => !names.has(meal.name.toLowerCase())
            ),
          ]);
        }
      } catch {
        // The dishes already on screen stay visible if the appetizer refresh is slow.
      }
    }

    loadMeals();

    return () => {
      mounted = false;
    };
  }, []);

  /* =======================================================
     FILTER MENU
  ======================================================= */

  const filteredMeals = useMemo(() => {
    const searchValue =
      search.toLowerCase().trim();

    return meals.filter((meal) => {
      const categoryMatch =
        !category ||
        matchesCategory(
          meal.collection,
          meal.collectionSlug,
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
        searchMatch &&
        meal.available !== false &&
        !RETIRED_CATALOG_NAMES.includes(meal.name) &&
        !/titus\s*pepper/i.test(meal.name)
      );
    });
  }, [
    meals,
    category,
    search,
  ]);

  /* =======================================================
     FOOD BY LITRE
  ======================================================= */

  const groupedLitreMeals =
    useMemo<GroupedLitreMeal[]>(() => {
      const litreMeals =
        filteredMeals.filter((meal) =>
          isFoodByLitre(
            meal.collection,
            meal.collectionSlug
          )
        );

      const groups =
        new Map<string, MenuItem[]>();

      litreMeals.forEach((meal) => {
        const key = meal.name
          .toLowerCase()
          .trim();

        const existing =
          groups.get(key) || [];

        existing.push(meal);

        groups.set(key, existing);
      });

      return Array.from(groups.values())
        .map((items) => {
          const sorted = [...items].sort(
            (a, b) =>
              a.display_order -
                b.display_order ||
              a.sort_order -
                b.sort_order
          );

          const seenPrices = new Set<number>();
          const unique = sorted.filter((item) => {
            if (item.available === false) return false;
            if (seenPrices.has(item.price)) return false;
            seenPrices.add(item.price);
            return true;
          });

          const options: LitreOption[] = unique
            .slice(0, litreSizes.length)
            .map((item, index) => ({
              size: litreSizes[index],
              price: item.price,
            }));

          return {
            id:
              sorted[0]?.id || "",

            name:
              sorted[0]?.name || "",

            description:
              sorted[0]?.description ||
              "Premium bulk order, freshly prepared.",

            available:
              sorted.some(
                (item) => item.available
              ),

            options,
          };
        })
        .filter(
          (meal) =>
            meal.id &&
            meal.name &&
            meal.options.length > 0
        );
    }, [filteredMeals]);

  /* =======================================================
     NORMAL MEALS
  ======================================================= */

  const normalMeals = useMemo(() => {
    return filteredMeals.filter(
      (meal) =>
        !isFoodByLitre(
          meal.collection,
          meal.collectionSlug
        )
    );
  }, [filteredMeals]);

  /* =======================================================
     COUNT
  ======================================================= */

  const displayCount =
    category === "grand-pot"
      ? groupedLitreMeals.length
      : normalMeals.length +
        groupedLitreMeals.length;

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <section className="bg-[#F8F6F2] px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <MenuFilters />

          <div className="mb-7 mt-8 flex items-end justify-between gap-4">
            <div>
              <div className="h-3 w-24 animate-pulse rounded bg-black/10" />

              <div className="mt-3 h-8 w-48 animate-pulse rounded bg-black/10" />
            </div>

            <div className="h-9 w-20 animate-pulse rounded-full bg-black/10" />
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({
              length: 8,
            }).map((_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-[26px] border border-black/5 bg-white shadow-sm"
              >
                <div className="h-[230px] animate-pulse bg-black/10" />

                <div className="space-y-4 p-6">
                  <div className="h-6 animate-pulse rounded bg-black/10" />

                  <div className="h-4 animate-pulse rounded bg-black/5" />

                  <div className="h-4 w-3/4 animate-pulse rounded bg-black/5" />

                  <div className="h-12 animate-pulse rounded-full bg-black/10" />
                </div>
              </div>
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
      <section className="bg-[#F8F6F2] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <MenuFilters />

          <div className="mt-8 rounded-[28px] border border-red-200 bg-white px-6 py-20 text-center shadow-sm">
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
     EMPTY
  ======================================================= */

  if (displayCount === 0) {
    return (
      <section className="bg-[#F8F6F2] px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <MenuFilters />

          <div className="mt-8 rounded-[30px] border border-black/10 bg-white px-6 py-20 text-center shadow-sm">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#FFF1E9] text-3xl">
              🍽️
            </div>

            <h3 className="mt-6 font-serif text-2xl font-bold text-[#171717] sm:text-3xl">
              No meals found
            </h3>

            <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-gray-500">
              We couldn&apos;t find a meal matching
              your current search or selected
              collection. Try another option.
            </p>
          </div>
        </div>
      </section>
    );
  }

  /* =======================================================
     MAIN MENU
  ======================================================= */

  return (
    <section
      id="meals"
      className="relative overflow-hidden bg-[#F8F6F2] px-4 pb-20 pt-0 text-[#171717] sm:px-6 lg:px-8"
    >
      {/* BACKGROUND DECORATION */}

      <div className="pointer-events-none absolute -left-40 top-40 h-80 w-80 rounded-full bg-[#F26A21]/5 blur-[100px]" />

      <div className="pointer-events-none absolute -right-40 bottom-40 h-80 w-80 rounded-full bg-[#F26A21]/5 blur-[100px]" />

      <div className="relative mx-auto max-w-7xl">
        {/* FILTERS */}

        <MenuFilters />

        {/* RESULT HEADER */}

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
                  &quot;{search}&quot;
                </span>
              </p>
            )}
          </div>

          <div className="flex w-fit items-center rounded-full border border-black/10 bg-white px-4 py-2.5 shadow-sm">
            <span className="mr-2 h-2 w-2 rounded-full bg-[#F26A21]" />

            <span className="text-xs font-semibold text-gray-500">
              {displayCount}{" "}
              {displayCount === 1
                ? "meal"
                : "meals"}
            </span>
          </div>
        </div>

        {/* FOOD BY LITRE ONLY */}

        {category === "grand-pot" ? (
          <div className="grid items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {groupedLitreMeals.map(
              (meal) => (
                <FoodByLitreCard
                  key={meal.id}
                  id={meal.id}
                  name={meal.name}
                  collection="Food by Litre"
                  description={meal.description}
                  options={meal.options}
                  available={meal.available}
                />
              )
            )}
          </div>
        ) : (
          /* NORMAL MENU */

          <div className="grid items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {normalMeals.map((meal, index) => (
              <MealCard
                key={meal.id}
                id={meal.id}
                name={meal.name}
                collection={meal.collection}
                description={meal.description}
                price={meal.price}
                imageUrl={meal.image_url}
                available={meal.available}
                priority={index < 4}
              />
            ))}

            {groupedLitreMeals.map(
              (meal) => (
                <FoodByLitreCard
                  key={`litre-${meal.id}`}
                  id={meal.id}
                  name={meal.name}
                  collection="Food by Litre"
                  description={meal.description}
                  options={meal.options}
                  available={meal.available}
                />
              )
            )}
          </div>
        )}

        {/* BRAND MESSAGE */}

        {displayCount > 0 && (
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
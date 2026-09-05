"use client";

import { useState } from "react";
import { useCart } from "@/app/context/CartContext";

type MealCardProps = {
  id?: string;
  name: string;
  collection: string;
  description: string;
  price: number;
  available?: boolean;
};

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(price);
}

export default function MealCard({
  id,
  name,
  collection,
  description,
  price,
  available = true,
}: MealCardProps) {
  const { addToCart } = useCart();

  const [added, setAdded] =
    useState(false);

  /*
   * Use the database ID when available.
   * The fallback keeps the card safe if an older
   * component doesn't pass an ID yet.
   */
  const mealId =
    id ||
    `${collection}-${name}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

  function handleAddToCart() {
    if (!available) {
      return;
    }

    addToCart({
      id: mealId,
      name,
      collection,
      price,
      quantity: 1,
    });

    setAdded(true);

    /*
     * Return button to normal state after a moment.
     */
    window.setTimeout(() => {
      setAdded(false);
    }, 1800);
  }

  return (
    <article
      className="
        group flex h-full min-w-0 flex-col overflow-hidden
        rounded-[26px]
        border border-black/[0.08]
        bg-white
        shadow-[0_8px_30px_rgba(0,0,0,0.05)]
        transition-all duration-500
        hover:-translate-y-2
        hover:border-[#F26A21]/40
        hover:shadow-[0_25px_60px_rgba(242,106,33,0.12)]
      "
    >
      {/* =====================================================
          TOP ACCENT
      ====================================================== */}

      <div className="h-1.5 w-full bg-[#F26A21]" />

      {/* =====================================================
          CONTENT
      ====================================================== */}

      <div className="flex flex-1 flex-col p-6 sm:p-7">

        {/* ===================================================
            COLLECTION + AVAILABILITY
        ==================================================== */}

        <div className="flex items-center justify-between gap-3">

          <span
            className="
              inline-flex max-w-[75%] truncate
              rounded-full
              bg-[#FFF1E9]
              px-3 py-1.5
              text-[8px]
              font-bold
              uppercase
              tracking-[0.16em]
              text-[#F26A21]
            "
          >
            {collection}
          </span>

          {available && (
            <span
              className="
                flex shrink-0 items-center gap-1.5
                text-[8px]
                font-bold
                uppercase
                tracking-[0.12em]
                text-green-600
              "
            >
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
              Available
            </span>
          )}

        </div>

        {/* ===================================================
            MEAL NAME
        ==================================================== */}

        <h3
          className="
            mt-6
            min-h-[56px]
            font-serif
            text-xl
            font-bold
            leading-tight
            text-[#171717]
            sm:text-[22px]
          "
        >
          {name}
        </h3>

        {/* ===================================================
            DESCRIPTION
        ==================================================== */}

        <p
          className="
            mt-3
            min-h-[72px]
            text-sm
            leading-6
            text-black/55
          "
        >
          {description ||
            "Freshly prepared with premium ingredients."}
        </p>

        {/* ===================================================
            PRICE
        ==================================================== */}

        <div className="mt-auto border-t border-black/[0.07] pt-5">

          <p
            className="
              text-[8px]
              font-bold
              uppercase
              tracking-[0.25em]
              text-black/35
            "
          >
            Price
          </p>

          <p
            className="
              mt-1
              text-2xl
              font-extrabold
              tracking-tight
              text-[#F26A21]
            "
          >
            {formatPrice(price)}
          </p>

          {/* =================================================
              ADD TO CART
          ================================================== */}

          {available ? (
            <button
              type="button"
              onClick={handleAddToCart}
              className={`
                mt-5
                flex
                min-h-[50px]
                w-full
                items-center
                justify-center
                rounded-full
                px-5
                text-sm
                font-bold
                text-white
                shadow-[0_10px_25px_rgba(242,106,33,0.18)]
                transition-all
                duration-300
                hover:-translate-y-1
                hover:shadow-[0_15px_35px_rgba(242,106,33,0.28)]
                ${
                  added
                    ? "bg-green-600"
                    : "bg-[#F26A21] hover:bg-[#D95512]"
                }
              `}
            >
              {added ? (
                <>
                  <span className="mr-2 text-lg">
                    ✓
                  </span>

                  Added to Cart
                </>
              ) : (
                <>
                  <span className="mr-2 text-lg">
                    +
                  </span>

                  Add to Cart
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              disabled
              className="
                mt-5
                flex
                min-h-[50px]
                w-full
                cursor-not-allowed
                items-center
                justify-center
                rounded-full
                bg-black/10
                px-5
                text-sm
                font-bold
                text-black/35
              "
            >
              Currently Unavailable
            </button>
          )}

        </div>

      </div>
    </article>
  );
}
"use client";

import { useState } from "react";
import { useCart } from "@/app/context/CartContext";

type LitreOption = {
  size: string;
  price: number;
};

type FoodByLitreCardProps = {
  id: string;
  name: string;
  collection?: string;
  description: string;
  options: LitreOption[];
  available?: boolean;
};

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(price);
}

export default function FoodByLitreCard({
  id,
  name,
  collection = "Food by Litre",
  description,
  options,
  available = true,
}: FoodByLitreCardProps) {
  const { addToCart } = useCart();

  const [selectedSize, setSelectedSize] =
    useState(options[0]?.size || "");

  const [added, setAdded] =
    useState(false);

  const selectedOption =
    options.find(
      (option) =>
        option.size === selectedSize
    ) || options[0];

  function handleAddToCart() {
    if (
      !available ||
      !selectedOption
    ) {
      return;
    }

    addToCart({
      id,
      name,
      collection,
      price: selectedOption.price,
      quantity: 1,
      selectedSize:
        selectedOption.size,
    });

    setAdded(true);

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
              inline-flex max-w-[70%] truncate
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
            NAME
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
            "Freshly prepared for your next gathering."}
        </p>

        {/* ===================================================
            SIZE SELECTOR
        ==================================================== */}

        <div className="mt-5">

          <div className="mb-3 flex items-center justify-between">

            <p
              className="
                text-[8px]
                font-bold
                uppercase
                tracking-[0.25em]
                text-black/35
              "
            >
              Choose Your Size
            </p>

            <span className="text-[9px] font-semibold text-[#F26A21]">
              {selectedSize}
            </span>

          </div>

          <div className="grid grid-cols-3 gap-2">

            {options.map((option) => {
              const isSelected =
                option.size ===
                selectedSize;

              return (
                <button
                  key={option.size}
                  type="button"
                  onClick={() =>
                    setSelectedSize(
                      option.size
                    )
                  }
                  disabled={!available}
                  aria-pressed={
                    isSelected
                  }
                  className={`
                    flex
                    min-h-[44px]
                    items-center
                    justify-center
                    rounded-xl
                    border
                    px-2
                    text-xs
                    font-bold
                    transition-all
                    duration-300
                    ${
                      isSelected
                        ? "border-[#F26A21] bg-[#F26A21] text-white shadow-[0_8px_20px_rgba(242,106,33,0.18)]"
                        : "border-black/10 bg-[#F8F6F2] text-black/60 hover:border-[#F26A21]/50 hover:text-[#F26A21]"
                    }
                  `}
                >
                  {option.size}
                </button>
              );
            })}

          </div>

        </div>

        {/* ===================================================
            SELECTED PRICE
        ==================================================== */}

        <div
          className="
            mt-5
            border-t
            border-black/[0.07]
            pt-5
          "
        >

          <p
            className="
              text-[8px]
              font-bold
              uppercase
              tracking-[0.25em]
              text-black/35
            "
          >
            {selectedSize} Price
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
            {selectedOption
              ? formatPrice(
                  selectedOption.price
                )
              : "—"}
          </p>

        </div>

        {/* ===================================================
            ADD TO CART
        ==================================================== */}

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
    </article>
  );
}
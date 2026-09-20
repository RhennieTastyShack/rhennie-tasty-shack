"use client";

import Image from "next/image";
import { useState } from "react";
import { useCart } from "@/app/context/CartContext";
import { resolveMenuImage } from "@/lib/menu-images";

/* =========================================================
   TYPES
========================================================= */

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

/* =========================================================
   FORMAT PRICE
========================================================= */

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(price);
}

/* =========================================================
   COMPONENT
========================================================= */

export default function FoodByLitreCard({
  id,
  name,
  collection = "Food by Litre",
  description,
  options,
  available = true,
}: FoodByLitreCardProps) {
  const { addToCart } = useCart();

  const [selectedSize, setSelectedSize] = useState(
    options[0]?.size || ""
  );

  const [added, setAdded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const selectedOption =
    options.find(
      (option) =>
        option.size === selectedSize
    ) || options[0];

  const image = resolveMenuImage(name);

  /* =======================================================
     ADD TO CART
  ======================================================= */

  function handleAddToCart() {
    if (!available || !selectedOption) {
      return;
    }

    addToCart({
      id,
      name,
      collection,
      price: selectedOption.price,
      quantity: 1,
      selectedSize: selectedOption.size,
    });

    setAdded(true);

    window.setTimeout(() => {
      setAdded(false);
    }, 1800);
  }

  return (
    <article
      className="
        group
        flex
        h-full
        min-w-0
        flex-col
        overflow-hidden
        rounded-[28px]
        border
        border-black/[0.08]
        bg-white
        shadow-[0_8px_30px_rgba(0,0,0,0.05)]
        transition-all
        duration-500
        hover:-translate-y-1
        hover:border-[#F26A21]/40
        hover:shadow-[0_25px_60px_rgba(242,106,33,0.12)]
      "
    >
      {/* =====================================================
          IMAGE
      ====================================================== */}

      {image && !imageError ? (
        <div
          className="
            relative
            aspect-[4/3]
            w-full
            shrink-0
            overflow-hidden
            bg-[#F4F0EA]
          "
        >
          <Image
            src={image}
            alt={name}
            fill
            sizes="
              (max-width: 640px) 100vw,
              (max-width: 1024px) 50vw,
              33vw
            "
            className="
              object-cover
              transition-transform
              duration-700
              ease-out
              group-hover:scale-[1.04]
            "
            onError={() => {
              setImageError(true);
            }}
          />

          {/* IMAGE GRADIENT */}

          <div
            className="
              pointer-events-none
              absolute
              inset-x-0
              bottom-0
              h-24
              bg-gradient-to-t
              from-black/25
              to-transparent
            "
          />

          {/* FOOD BY LITRE BADGE */}

          <div
            className="
              absolute
              left-4
              top-4
              rounded-full
              border
              border-white/20
              bg-black/65
              px-3.5
              py-2
              backdrop-blur-md
              sm:left-5
              sm:top-5
            "
          >
            <span
              className="
                text-[8px]
                font-bold
                uppercase
                tracking-[0.16em]
                text-white
              "
            >
              {collection}
            </span>
          </div>

          {/* AVAILABILITY ON IMAGE */}

          <div
            className="
              absolute
              right-4
              top-4
              sm:right-5
              sm:top-5
            "
          >
            {available ? (
              <span
                className="
                  flex
                  items-center
                  gap-1.5
                  rounded-full
                  border
                  border-white/20
                  bg-white/95
                  px-3
                  py-2
                  text-[8px]
                  font-bold
                  uppercase
                  tracking-[0.1em]
                  text-green-600
                  shadow-sm
                  backdrop-blur-md
                "
              >
                <span
                  className="
                    h-1.5
                    w-1.5
                    rounded-full
                    bg-green-500
                  "
                />

                Available
              </span>
            ) : (
              <span
                className="
                  flex
                  items-center
                  gap-1.5
                  rounded-full
                  border
                  border-white/20
                  bg-white/95
                  px-3
                  py-2
                  text-[8px]
                  font-bold
                  uppercase
                  tracking-[0.1em]
                  text-black/45
                  shadow-sm
                  backdrop-blur-md
                "
              >
                <span
                  className="
                    h-1.5
                    w-1.5
                    rounded-full
                    bg-black/30
                  "
                />

                Unavailable
              </span>
            )}
          </div>
        </div>
      ) : (
        /* ===================================================
           FALLBACK WHEN NO IMAGE MATCHES
        ==================================================== */

        <div
          className="
            relative
            flex
            aspect-[4/3]
            w-full
            shrink-0
            items-center
            justify-center
            overflow-hidden
            bg-gradient-to-br
            from-[#FFF7F2]
            via-[#F8F6F2]
            to-[#FCE9DD]
          "
        >
          <div
            className="
              absolute
              -right-12
              -top-12
              h-36
              w-36
              rounded-full
              bg-[#F26A21]/10
              blur-2xl
            "
          />

          <div className="relative text-center">
            <div
              className="
                mx-auto
                flex
                h-16
                w-16
                items-center
                justify-center
                rounded-full
                border
                border-[#F26A21]/15
                bg-white
                text-3xl
                shadow-sm
              "
            >
              🍲
            </div>

            <p
              className="
                mt-4
                text-[9px]
                font-bold
                uppercase
                tracking-[0.22em]
                text-[#F26A21]
              "
            >
              Freshly Prepared
            </p>
          </div>
        </div>
      )}

      {/* =====================================================
          ORANGE ACCENT
      ====================================================== */}

      <div
        className="
          h-1.5
          w-full
          shrink-0
          bg-[#F26A21]
        "
      />

      {/* =====================================================
          CARD CONTENT

          Mobile: 20px
          Tablet: 24px
          Desktop: 28px
      ====================================================== */}

      <div
        className="
          flex
          flex-1
          flex-col
          px-5
          py-6
          sm:px-6
          sm:py-7
          lg:px-7
          lg:py-7
        "
      >
        {/* ===================================================
            COLLECTION + AVAILABILITY
            Used when image is unavailable
        ==================================================== */}

        {!image && (
          <div
            className="
              flex
              min-w-0
              items-center
              justify-between
              gap-3
            "
          >
            <span
              className="
                inline-flex
                min-w-0
                max-w-[70%]
                truncate
                rounded-full
                bg-[#FFF1E9]
                px-3.5
                py-2
                text-[8px]
                font-bold
                uppercase
                tracking-[0.16em]
                text-[#F26A21]
                sm:px-4
              "
            >
              {collection}
            </span>

            {available ? (
              <span
                className="
                  flex
                  shrink-0
                  items-center
                  gap-1.5
                  text-[8px]
                  font-bold
                  uppercase
                  tracking-[0.12em]
                  text-green-600
                "
              >
                <span
                  className="
                    h-1.5
                    w-1.5
                    shrink-0
                    rounded-full
                    bg-green-500
                  "
                />

                Available
              </span>
            ) : (
              <span
                className="
                  flex
                  shrink-0
                  items-center
                  gap-1.5
                  text-[8px]
                  font-bold
                  uppercase
                  tracking-[0.12em]
                  text-black/35
                "
              >
                <span
                  className="
                    h-1.5
                    w-1.5
                    shrink-0
                    rounded-full
                    bg-black/25
                  "
                />

                Unavailable
              </span>
            )}
          </div>
        )}

        {/* ===================================================
            NAME
        ==================================================== */}

        <h3
          className={`
            min-h-[52px]
            break-words
            pr-1
            font-serif
            text-xl
            font-bold
            leading-[1.25]
            text-[#171717]
            sm:min-h-[56px]
            sm:text-[22px]
            ${
              image
                ? ""
                : "mt-6"
            }
          `}
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
            break-words
            pr-1
            text-sm
            leading-6
            text-black/55
          "
        >
          {description ||
            "Freshly prepared in generous quantities for your next gathering."}
        </p>

        {/* ===================================================
            SIZE SELECTOR
        ==================================================== */}

        <div className="mt-6">
          <div
            className="
              mb-3
              flex
              min-w-0
              items-center
              justify-between
              gap-3
            "
          >
            <p
              className="
                min-w-0
                text-[8px]
                font-bold
                uppercase
                tracking-[0.22em]
                text-black/35
              "
            >
              Choose Your Size
            </p>

            {selectedSize && (
              <span
                className="
                  shrink-0
                  rounded-full
                  bg-[#FFF1E9]
                  px-2.5
                  py-1
                  text-[9px]
                  font-bold
                  text-[#F26A21]
                "
              >
                {selectedSize}
              </span>
            )}
          </div>

          {/* SIZE BUTTONS */}

          <div
            className="
              grid
              grid-cols-2
              gap-2.5
              sm:grid-cols-3
            "
          >
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
                  aria-label={`Select ${option.size}`}
                  className={`
                    flex
                    min-h-[48px]
                    min-w-0
                    items-center
                    justify-center
                    rounded-xl
                    border
                    px-3
                    py-2.5
                    text-center
                    text-xs
                    font-bold
                    leading-tight
                    transition-all
                    duration-300
                    focus-visible:outline
                    focus-visible:outline-2
                    focus-visible:outline-offset-2
                    focus-visible:outline-[#F26A21]
                    ${
                      !available
                        ? "cursor-not-allowed border-black/[0.06] bg-black/[0.04] text-black/25"
                        : isSelected
                          ? "border-[#F26A21] bg-[#F26A21] text-white shadow-[0_8px_20px_rgba(242,106,33,0.18)]"
                          : "border-black/10 bg-[#F8F6F2] text-black/60 hover:border-[#F26A21]/50 hover:bg-[#FFF8F4] hover:text-[#F26A21]"
                    }
                  `}
                >
                  <span className="break-words">
                    {option.size}
                  </span>
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
            mt-6
            border-t
            border-black/[0.07]
            pt-5
            sm:pt-6
          "
        >
          <div
            className="
              flex
              items-end
              justify-between
              gap-4
            "
          >
            <div>
              <p
                className="
                  text-[8px]
                  font-bold
                  uppercase
                  tracking-[0.25em]
                  text-black/35
                "
              >
                {selectedSize
                  ? `${selectedSize} Price`
                  : "Price"}
              </p>

              <p
                className="
                  mt-1.5
                  break-words
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

            {selectedSize && (
              <div
                className="
                  hidden
                  rounded-full
                  border
                  border-black/[0.07]
                  bg-[#F8F6F2]
                  px-3
                  py-1.5
                  text-[9px]
                  font-bold
                  uppercase
                  tracking-[0.12em]
                  text-black/45
                  sm:block
                "
              >
                {selectedSize}
              </div>
            )}
          </div>
        </div>

        {/* ===================================================
            ADD TO CART
        ==================================================== */}

        <div className="mt-5 w-full">
          {available &&
          selectedOption ? (
            <button
              type="button"
              onClick={
                handleAddToCart
              }
              aria-label={`Add ${name} ${selectedSize} to cart`}
              className={`
                relative
                z-10
                flex
                min-h-[52px]
                w-full
                items-center
                justify-center
                gap-2
                rounded-full
                px-5
                py-3
                text-center
                text-sm
                font-bold
                text-white
                shadow-[0_10px_25px_rgba(242,106,33,0.18)]
                transition-all
                duration-300
                focus-visible:outline
                focus-visible:outline-2
                focus-visible:outline-offset-2
                focus-visible:outline-[#F26A21]
                sm:px-6
                ${
                  added
                    ? "bg-green-600"
                    : "bg-[#F26A21] hover:-translate-y-0.5 hover:bg-[#D95512] hover:shadow-[0_15px_35px_rgba(242,106,33,0.28)]"
                }
              `}
            >
              <span
                className="
                  relative
                  z-20
                  flex
                  h-5
                  w-5
                  shrink-0
                  items-center
                  justify-center
                  text-lg
                  leading-none
                  text-white
                  opacity-100
                "
                aria-hidden="true"
              >
                {added
                  ? "✓"
                  : "+"}
              </span>

              <span
                className="
                  relative
                  z-20
                  whitespace-nowrap
                  text-white
                  opacity-100
                "
              >
                {added
                  ? "Added to Cart"
                  : "Add to Cart"}
              </span>
            </button>
          ) : (
            <button
              type="button"
              disabled
              className="
                flex
                min-h-[52px]
                w-full
                cursor-not-allowed
                items-center
                justify-center
                rounded-full
                bg-black/[0.07]
                px-5
                py-3
                text-center
                text-sm
                font-bold
                text-black/35
                sm:px-6
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
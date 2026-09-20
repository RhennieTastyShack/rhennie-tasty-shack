"use client";

import Image from "next/image";
import { useState } from "react";
import { useCart } from "@/app/context/CartContext";
import { resolveMenuImage } from "@/lib/menu-images";

type MealCardProps = {
  id: string;
  name: string;
  collection: string;
  description: string;
  price: number;
  imageUrl?: string | null;
  available?: boolean;
  priority?: boolean;
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
  imageUrl,
  available = true,
  priority = false,
}: MealCardProps) {
  const { addToCart } = useCart();

  const [added, setAdded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const imagePath = resolveMenuImage(name, imageUrl);

  function handleAddToCart() {
    if (!available) {
      return;
    }

    addToCart({
      id,
      name,
      collection,
      price,
      quantity: 1,
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
        rounded-[26px]
        border
        border-black/[0.08]
        bg-white
        shadow-[0_8px_30px_rgba(0,0,0,0.05)]
        transition-all
        duration-500
        hover:-translate-y-2
        hover:border-[#F26A21]/40
        hover:shadow-[0_25px_60px_rgba(242,106,33,0.12)]
      "
    >
      {/* ===================================================
          MEAL IMAGE
      ==================================================== */}

      <div className="relative h-[230px] w-full overflow-hidden bg-[#F3F0EB]">
        {imagePath && !imageError ? (
          <Image
            src={imagePath}
            alt={name}
            fill
            priority={priority}
            sizes="
              (max-width: 640px) 100vw,
              (max-width: 1024px) 50vw,
              (max-width: 1280px) 33vw,
              25vw
            "
            className="
              object-cover
              transition-transform
              duration-700
              group-hover:scale-105
            "
            onError={() => {
              setImageError(true);
            }}
          />
        ) : (
          /* ===============================================
             NO IMAGE PLACEHOLDER
          ================================================ */

          <div
            className="
              flex
              h-full
              w-full
              items-center
              justify-center
              bg-gradient-to-br
              from-[#FFF7F2]
              via-[#FAF4EF]
              to-[#F1EAE4]
            "
          >
            <div className="px-6 text-center">
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
                  border-[#F26A21]/10
                  bg-white/80
                  text-3xl
                  shadow-sm
                "
              >
                🍽️
              </div>

              <p
                className="
                  mt-4
                  text-[9px]
                  font-bold
                  uppercase
                  tracking-[0.25em]
                  text-[#F26A21]
                "
              >
                Rhennie Tasty Shack
              </p>

              <p
                className="
                  mt-1
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.16em]
                  text-gray-400
                "
              >
                Image Coming Soon
              </p>
            </div>
          </div>
        )}

        {/* IMAGE OVERLAY */}

        {imagePath && !imageError && (
          <div
            className="
              pointer-events-none
              absolute
              inset-0
              bg-gradient-to-t
              from-black/45
              via-black/5
              to-transparent
            "
          />
        )}

        {/* COLLECTION BADGE */}

        <span
          className="
            absolute
            left-4
            top-4
            max-w-[65%]
            truncate
            rounded-full
            border
            border-white/20
            bg-black/65
            px-3
            py-1.5
            text-[8px]
            font-bold
            uppercase
            tracking-[0.15em]
            text-white
            shadow-sm
            backdrop-blur-md
          "
        >
          {collection}
        </span>

        {/* AVAILABILITY BADGE */}

        <span
          className={`
            absolute
            right-4
            top-4
            rounded-full
            px-3
            py-1.5
            text-[8px]
            font-bold
            uppercase
            tracking-[0.12em]
            shadow-sm
            backdrop-blur-md
            ${
              available
                ? "bg-white/90 text-green-700"
                : "bg-black/75 text-white"
            }
          `}
        >
          {available ? "Available" : "Unavailable"}
        </span>
      </div>

      {/* ===================================================
          CARD CONTENT
      ==================================================== */}

      <div
        className="
          flex
          flex-1
          flex-col
          px-5
          py-6
          sm:px-6
          lg:px-7
        "
      >
        {/* COLLECTION LABEL */}

        <p
          className="
            text-[8px]
            font-bold
            uppercase
            tracking-[0.25em]
            text-[#F26A21]
          "
        >
          {collection}
        </p>

        {/* MEAL NAME */}

        <h3
          className="
            mt-2
            font-serif
            text-xl
            font-bold
            leading-tight
            text-[#171717]
          "
        >
          {name}
        </h3>

        {/* DESCRIPTION */}

        {description ? (
          <p
            className="
              mt-3
              line-clamp-3
              text-sm
              leading-6
              text-gray-500
            "
          >
            {description}
          </p>
        ) : (
          <p
            className="
              mt-3
              text-sm
              leading-6
              text-gray-400
            "
          >
            Freshly prepared with premium ingredients.
          </p>
        )}

        {/* =================================================
            PRICE + CART
        ================================================== */}

        <div className="mt-auto pt-6">
          <div className="border-t border-black/[0.06] pt-5">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p
                  className="
                    text-[8px]
                    font-bold
                    uppercase
                    tracking-[0.25em]
                    text-gray-400
                  "
                >
                  Price
                </p>

                <p
                  className="
                    mt-1
                    font-serif
                    text-2xl
                    font-bold
                    text-[#F26A21]
                  "
                >
                  {formatPrice(price)}
                </p>
              </div>

              {available && (
                <div className="mb-1 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500" />

                  <span
                    className="
                      text-[8px]
                      font-bold
                      uppercase
                      tracking-[0.12em]
                      text-green-700
                    "
                  >
                    Ready
                  </span>
                </div>
              )}
            </div>

            {/* ADD TO CART */}

            <button
              type="button"
              onClick={handleAddToCart}
              disabled={!available}
              className={`
                mt-5
                flex
                min-h-[48px]
                w-full
                items-center
                justify-center
                rounded-full
                px-5
                text-sm
                font-bold
                transition-all
                duration-300

                ${
                  available
                    ? added
                      ? `
                        bg-green-600
                        text-white
                        shadow-md
                      `
                      : `
                        bg-[#F26A21]
                        text-white
                        shadow-[0_8px_20px_rgba(242,106,33,0.18)]
                        hover:-translate-y-0.5
                        hover:bg-[#D95512]
                        hover:shadow-[0_12px_28px_rgba(242,106,33,0.25)]
                      `
                    : `
                      cursor-not-allowed
                      bg-gray-200
                      text-gray-400
                    `
                }
              `}
            >
              {!available
                ? "Currently Unavailable"
                : added
                  ? "Added to Cart ✓"
                  : "Add to Cart"}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
"use client";

import Image from "next/image";
import Link from "next/link";

/* =========================================================
   FEATURED MEALS
========================================================= */

const featuredMeals = [
  {
    id: 1,
    name: "Jollof Rice & Turkey",
    description:
      "Smoky party jollof served with juicy grilled turkey.",
    price: 8000,
    image: "/images/jollofrice-turkey.jpeg",
    bestSeller: true,
  },
  {
    id: 2,
    name: "Seafood Rice",
    description:
      "Premium seafood rice loaded with prawns, fish and more.",
    price: 12500,
    image: "/images/seafood-rice.jpg",
    bestSeller: true,
  },
  {
    id: 3,
    name: "Seafood Okra",
    description:
      "Rich okra soup packed with fresh seafood.",
    price: 10000,
    image: "/images/seafoodokra.jpeg",
    bestSeller: false,
  },
  {
    id: 4,
    name: "Royale Pasta Bowl",
    description:
      "Rich, flavourful pasta prepared with our signature house touch.",
    price: 8000,
    image: "/images/pasta.jpg",
    bestSeller: false,
  },
  {
    id: 5,
    name: "Jollof Rice & Chicken",
    description:
      "Classic smoky jollof rice paired with perfectly seasoned chicken.",
    price: 5500,
    image: "/images/jollof-chicken.jpeg",
    bestSeller: false,
  },
  {
    id: 6,
    name: "Amala & Assorted",
    description:
      "Traditional amala served with rich soup and assorted meat.",
    price: 6000,
    image: "/images/amala.jpeg",
    bestSeller: false,
  },
];

/* =========================================================
   PRICE FORMATTER
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

export default function FeaturedMeals() {
  return (
    <section
      id="featured-meals"
      className="
        relative
        overflow-hidden
        bg-[#F8F6F2]
        px-5
        py-20
        text-[#171717]
        sm:px-6
        sm:py-24
        lg:px-8
        lg:py-28
      "
    >
      {/* ===================================================
          DECORATIVE BACKGROUND
      ==================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          -left-40
          top-20
          h-80
          w-80
          rounded-full
          bg-[#F26A21]/5
          blur-[110px]
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          -right-40
          bottom-20
          h-80
          w-80
          rounded-full
          bg-[#F26A21]/5
          blur-[110px]
        "
      />

      <div className="relative mx-auto max-w-7xl">
        {/* =================================================
            SECTION HEADER
        ================================================== */}

        <div
          className="
            flex
            flex-col
            gap-6
            sm:flex-row
            sm:items-end
            sm:justify-between
          "
        >
          <div className="max-w-2xl">
            <p
              className="
                text-[10px]
                font-extrabold
                uppercase
                tracking-[0.35em]
                text-[#D4AF37]
              "
            >
              Featured
            </p>

            <h2
              className="
                mt-4
                font-serif
                text-4xl
                font-bold
                leading-[1.05]
                tracking-tight
                text-[#171717]
                sm:text-5xl
                lg:text-6xl
              "
            >
              Worth
              <span className="text-[#D4AF37]">
                {" "}
                remembering.
              </span>
            </h2>

            <p
              className="
                mt-5
                max-w-xl
                text-sm
                leading-7
                text-black/55
                sm:text-base
              "
            >
              Signature favourites — freshly prepared and ready to order.
            </p>
          </div>

          <Link
            href="/menu"
            className="
              group
              inline-flex
              w-fit
              items-center
              gap-2
              text-sm
              font-extrabold
              text-[#171717]
              transition-colors
              hover:text-[#F26A21]
            "
          >
            <span>Explore the full menu</span>

            <span
              aria-hidden="true"
              className="
                text-[#F26A21]
                transition-transform
                duration-300
                group-hover:translate-x-1
              "
            >
              →
            </span>
          </Link>
        </div>

        {/* =================================================
            FEATURED MEALS GRID
            1 column mobile
            2 columns tablet
            3 columns desktop
            = 3 × 2 on desktop
        ================================================== */}

        <div
          className="
            mt-14
            grid
            grid-cols-1
            items-stretch
            gap-6
            sm:mt-16
            sm:grid-cols-2
            lg:grid-cols-3
            lg:gap-7
          "
        >
          {featuredMeals.map((meal, index) => (
            <article
              key={meal.id}
              className="
                group
                flex
                h-full
                min-w-0
                flex-col
                overflow-hidden
                rounded-[28px]
                border
                border-black/[0.07]
                bg-white
                shadow-[0_10px_35px_rgba(0,0,0,0.055)]
                transition-all
                duration-500
                hover:-translate-y-2
                hover:border-[#D4AF37]/35
                hover:shadow-[0_25px_60px_rgba(0,0,0,0.10)]
              "
            >
              {/* =============================================
                  IMAGE
              ============================================== */}

              <div
                className="
                  relative
                  aspect-[4/3]
                  w-full
                  shrink-0
                  overflow-hidden
                  bg-[#ECE8E1]
                "
              >
                <Image
                  src={meal.image}
                  alt={meal.name}
                  fill
                  priority={index < 3}
                  sizes="
                    (max-width: 639px) 100vw,
                    (max-width: 1023px) 50vw,
                    33vw
                  "
                  className="
                    object-cover
                    transition-transform
                    duration-700
                    ease-out
                    group-hover:scale-105
                  "
                />

                {/* Image gradient */}

                <div
                  className="
                    pointer-events-none
                    absolute
                    inset-x-0
                    bottom-0
                    h-28
                    bg-gradient-to-t
                    from-black/35
                    via-black/10
                    to-transparent
                  "
                />

                {/* BEST SELLER */}

                {meal.bestSeller && (
                  <span
                    className="
                      absolute
                      left-5
                      top-5
                      z-10
                      rounded-full
                      bg-[#0B0B0B]
                      px-4
                      py-2.5
                      text-[8px]
                      font-extrabold
                      uppercase
                      tracking-[0.18em]
                      text-[#D4AF37]
                      shadow-lg
                      sm:left-6
                      sm:top-6
                    "
                  >
                    Best Seller
                  </span>
                )}

                {/* ITEM NUMBER */}

                <span
                  className="
                    absolute
                    bottom-5
                    right-5
                    z-10
                    text-[9px]
                    font-extrabold
                    tracking-[0.2em]
                    text-white
                    sm:bottom-6
                    sm:right-6
                  "
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>

              {/* =============================================
                  CARD BODY
              ============================================== */}

              <div
                className="
                  flex
                  flex-1
                  flex-col
                  px-5
                  pb-6
                  pt-6
                  sm:px-6
                  sm:pb-7
                  sm:pt-7
                  lg:px-7
                  lg:pb-8
                  lg:pt-7
                "
              >
                {/* MEAL NAME */}

                <h3
                  className="
                    break-words
                    font-serif
                    text-2xl
                    font-bold
                    leading-tight
                    tracking-tight
                    text-[#171717]
                  "
                >
                  {meal.name}
                </h3>

                {/* DESCRIPTION */}

                <p
                  className="
                    mt-3
                    min-h-[56px]
                    break-words
                    text-sm
                    leading-6
                    text-black/55
                  "
                >
                  {meal.description}
                </p>

                {/* ===========================================
                    PRICE + BUTTON
                ============================================ */}

                <div
                  className="
                    mt-auto
                    border-t
                    border-black/[0.08]
                    pt-5
                    sm:pt-6
                  "
                >
                  <div
                    className="
                      flex
                      flex-col
                      gap-5
                      sm:flex-row
                      sm:items-end
                      sm:justify-between
                    "
                  >
                    {/* PRICE */}

                    <div className="min-w-0">
                      <p
                        className="
                          text-[8px]
                          font-extrabold
                          uppercase
                          tracking-[0.25em]
                          text-black/40
                        "
                      >
                        From
                      </p>

                      <p
                        className="
                          mt-1.5
                          text-2xl
                          font-extrabold
                          tracking-tight
                          text-[#171717]
                        "
                      >
                        {formatPrice(meal.price)}
                      </p>
                    </div>

                    {/* =======================================
                        ORDER BUTTON
                        FIXED VISIBLE CONTENT
                    ======================================== */}

                    <Link
                      href="/menu"
                      aria-label={`Order ${meal.name}`}
                      className="
                        relative
                        z-10
                        inline-flex
                        min-h-[50px]
                        w-full
                        shrink-0
                        items-center
                        justify-center
                        gap-2
                        overflow-visible
                        rounded-full
                        border
                        border-[#171717]
                        bg-[#171717]
                        px-6
                        py-3.5
                        text-center
                        text-sm
                        font-extrabold
                        text-white
                        opacity-100
                        shadow-[0_8px_22px_rgba(0,0,0,0.15)]
                        transition-all
                        duration-300
                        hover:-translate-y-0.5
                        hover:border-[#F26A21]
                        hover:bg-[#F26A21]
                        hover:text-white
                        focus-visible:outline
                        focus-visible:outline-2
                        focus-visible:outline-offset-2
                        focus-visible:outline-[#F26A21]
                        sm:w-auto
                      "
                    >
                      <span
                        className="
                          relative
                          z-20
                          block
                          whitespace-nowrap
                          font-extrabold
                          leading-none
                          text-white
                          opacity-100
                        "
                      >
                        Order
                      </span>

                      <span
                        aria-hidden="true"
                        className="
                          relative
                          z-20
                          block
                          whitespace-nowrap
                          text-base
                          font-extrabold
                          leading-none
                          text-white
                          opacity-100
                        "
                      >
                        →
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* =================================================
            VIEW FULL MENU
        ================================================== */}

        <div className="mt-12 flex justify-center sm:mt-14">
          <Link
            href="/menu"
            className="
              relative
              z-10
              inline-flex
              min-h-[52px]
              items-center
              justify-center
              gap-2.5
              rounded-full
              border
              border-[#171717]
              bg-transparent
              px-7
              py-3.5
              text-sm
              font-extrabold
              text-[#171717]
              opacity-100
              transition-all
              duration-300
              hover:-translate-y-0.5
              hover:bg-[#171717]
              hover:text-white
              sm:px-8
            "
          >
            <span className="relative z-20 whitespace-nowrap">
              View Full Menu
            </span>

            <span
              aria-hidden="true"
              className="relative z-20 text-base"
            >
              →
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
"use client";

import Image from "next/image";
import { useState } from "react";

const litreMeals = [
  {
    number: "01",
    title: "Party Jollof Rice",
    image: "/images/jollof-rice.jpg",
    featured: true,
    description:
      "Our signature smoky party-style jollof rice, cooked to perfection and ideal for birthdays, owambes and celebrations.",
    prices: {
      "1 Litre": "₦28,000",
      "1.5 Litres": "₦42,000",
      "2.5 Litres": "₦70,000",
      "5 Litres": "₦140,000",
    },
  },
  {
    number: "02",
    title: "Seafood Rice",
    image: "/images/seafood-rice.jpg",
    featured: false,
    description:
      "Premium seafood rice loaded with prawns, fish and carefully selected seafood for unforgettable flavour.",
    prices: {
      "1 Litre": "₦40,000",
      "1.5 Litres": "₦60,000",
      "2.5 Litres": "₦100,000",
      "5 Litres": "₦200,000",
    },
  },
  {
    number: "03",
    title: "Seafood Okra",
    image: "/images/seafoodokra.jpeg",
    featured: false,
    description:
      "Rich seafood okra prepared with premium seafood and authentic Nigerian flavours.",
    prices: {
      "1 Litre": "₦45,000",
      "1.5 Litres": "₦67,500",
      "2.5 Litres": "₦112,500",
      "5 Litres": "₦225,000",
    },
  },
];

const litreSizes = [
  "1 Litre",
  "1.5 Litres",
  "2.5 Litres",
  "5 Litres",
];

export default function FoodByLitre() {
  const [selectedSize, setSelectedSize] = useState("1 Litre");

  return (
    <section
      id="litre"
      className="relative overflow-hidden bg-[#080808] py-20 text-white md:py-24"
    >
      {/* Decorative gold glow */}
      <div className="pointer-events-none absolute -left-40 top-20 h-96 w-96 rounded-full bg-yellow-500/10 blur-3xl" />

      <div className="pointer-events-none absolute -right-40 top-1/3 h-96 w-96 rounded-full bg-yellow-500/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-6">

        {/* HEADER */}
        <div className="mx-auto mb-14 max-w-4xl text-center">

          <div className="mb-5 flex items-center justify-center gap-4">
            <span className="h-px w-12 bg-yellow-500" />

            <span className="text-xs font-bold uppercase tracking-[0.35em] text-yellow-500">
              Party Catering
            </span>

            <span className="h-px w-12 bg-yellow-500" />
          </div>

          <h2 className="font-serif text-4xl font-bold leading-tight sm:text-5xl md:text-6xl">
            Party Orders{" "}
            <span className="text-yellow-500">
              by the Litre
            </span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-gray-400 sm:text-base">
            Perfect for weddings, birthdays, owambes, corporate events,
            family celebrations and every special occasion.
          </p>

        </div>

        {/* LITRE SIZE SELECTOR */}
        <div className="mx-auto mb-10 max-w-3xl">

          <p className="mb-4 text-center text-xs font-bold uppercase tracking-[0.25em] text-gray-500">
            Select Your Quantity
          </p>

          <div className="flex flex-wrap justify-center gap-3">

            {litreSizes.map((size) => {
              const active = selectedSize === size;

              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSelectedSize(size)}
                  className={`rounded-full border px-6 py-3 text-sm font-bold transition-all duration-300 ${
                    active
                      ? "border-yellow-500 bg-yellow-500 text-black shadow-lg shadow-yellow-500/10"
                      : "border-white/15 bg-[#111111] text-gray-300 hover:border-yellow-500/60 hover:text-yellow-500"
                  }`}
                >
                  {size}
                </button>
              );
            })}

          </div>

        </div>

        {/* LITRE MEALS */}
        <div className="grid items-stretch gap-7 md:grid-cols-2 xl:grid-cols-3">

          {litreMeals.map((meal) => (

            <article
              key={meal.title}
              className={`group flex h-[570px] w-full flex-col overflow-hidden rounded-[28px] border bg-[#0d0d0d] transition-all duration-500 hover:-translate-y-2 ${
                meal.featured
                  ? "border-yellow-500 bg-[#15130c] shadow-[0_25px_70px_rgba(234,179,8,0.14)]"
                  : "border-white/10 hover:border-yellow-500/50"
              }`}
            >

              {/* IMAGE */}
              <div className="relative h-[270px] w-full shrink-0 overflow-hidden">

                <Image
                  src={meal.image}
                  alt={meal.title}
                  fill
                  priority={meal.number === "01"}
                  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

                {/* NUMBER */}
                <div className="absolute left-5 top-5 flex h-8 w-8 items-center justify-center rounded-full border border-yellow-500 bg-black/80 text-xs font-bold text-yellow-500">
                  {meal.number}
                </div>

                {/* FEATURED */}
                {meal.featured && (
                  <div className="absolute right-5 top-5 rounded-full bg-yellow-500 px-4 py-2 text-[10px] font-extrabold uppercase tracking-[0.15em] text-black shadow-lg">
                    Chef's Recommendation
                  </div>
                )}

              </div>

              {/* CONTENT */}
              <div className="flex flex-1 flex-col p-6">

                <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-yellow-500">
                  Premium Party Menu
                </p>

                <h3 className="mt-3 min-h-[55px] text-[23px] font-bold leading-tight sm:text-2xl">
                  {meal.title}
                </h3>

                <p className="mt-3 h-[72px] overflow-hidden text-sm leading-6 text-gray-400">
                  {meal.description}
                </p>

                {/* SELECTED SIZE */}
                <div className="mt-5 rounded-2xl border border-white/10 bg-black/30 p-4">

                  <div className="flex items-center justify-between">

                    <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-gray-500">
                      Selected Quantity
                    </span>

                    <span className="text-sm font-bold text-white">
                      {selectedSize}
                    </span>

                  </div>

                  <div className="mt-2 flex items-end justify-between">

                    <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-gray-500">
                      Price
                    </span>

                    <span className="text-2xl font-extrabold text-yellow-500">
                      {meal.prices[selectedSize as keyof typeof meal.prices]}
                    </span>

                  </div>

                </div>

                {/* ORDER BUTTON */}
                <a
                  href={`https://wa.me/2348121577759?text=${encodeURIComponent(
                    `Hello Rhennie Tasty Shack, I would like to order ${meal.title} - ${selectedSize} at ${meal.prices[selectedSize as keyof typeof meal.prices]}.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto flex h-12 w-full items-center justify-center rounded-xl bg-yellow-500 text-sm font-bold text-black transition-all duration-300 hover:bg-yellow-400 hover:shadow-lg"
                >
                  Order on WhatsApp →
                </a>

              </div>

            </article>

          ))}

        </div>

        {/* BOTTOM CTA */}
        <div className="mt-14 text-center">

          <p className="text-sm text-gray-500">
            Need larger quantities or a custom catering package?
          </p>

          <a
            href="https://wa.me/2348121577759"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center rounded-full border border-yellow-500/50 px-6 py-3 text-sm font-bold text-yellow-500 transition-all duration-300 hover:bg-yellow-500 hover:text-black"
          >
            Speak With Us →
          </a>

        </div>

      </div>
    </section>
  );
}
"use client";

import Image from "next/image";

const litreMeals = [
  {
    title: "Party Jollof Rice",
    image: "/images/jollof-rice.jpg",
    price: "₦28,000 / Litre",
    description:
      "Our signature smoky party-style jollof rice, cooked to perfection and ideal for birthdays, owambes and celebrations.",
    featured: true,
  },
  {
    title: "Seafood Rice",
    image: "/images/seafood-rice.jpg",
    price: "₦40,000 / Litre",
    description:
      "Premium seafood rice loaded with prawns, fish and carefully selected seafood for unforgettable flavour.",
    featured: false,
  },
  {
    title: "Seafood Okra",
    image: "/images/seafoodokra.jpeg",
    price: "₦45,000 / Litre",
    description:
      "Rich seafood okra prepared with premium seafood and authentic Nigerian flavours.",
    featured: false,
  },
];

export default function FoodByLitre() {
  return (
    <section
      id="litre"
      className="bg-[#0B0B0B] py-20 md:py-28"
    >
      <div className="mx-auto max-w-7xl px-5 md:px-8">

        <div className="mb-16 text-center">

          <span className="inline-block rounded-full border border-[#D4AF37]/30 bg-[#1A1A1A] px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#D4AF37]">
            Party Catering
          </span>

          <h2 className="mt-6 text-3xl font-extrabold text-white md:text-5xl">
            Party Orders by the Litre
          </h2>

          <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-[#B8B8B8] md:text-lg">
            Perfect for weddings, birthdays, owambes, corporate events,
            family celebrations and every special occasion.
          </p>

        </div>

        <div className="space-y-10">

          {litreMeals.map((meal) => (

            <div
              key={meal.title}
              className="group overflow-hidden rounded-3xl border border-[#D4AF37]/15 bg-[#171717] shadow-xl transition-all duration-500 hover:-translate-y-2 hover:border-[#D4AF37] hover:shadow-2xl"
            >

              <div className="grid lg:grid-cols-2">

                <div className="relative overflow-hidden">

                  {meal.featured && (
                    <span className="absolute left-5 top-5 z-20 rounded-full bg-yellow-500 px-4 py-2 text-xs font-bold uppercase tracking-wider text-black shadow-lg">
                      Chef's Recommendation
                    </span>
                  )}

                  <Image
                    src={meal.image}
                    alt={meal.title}
                    width={700}
                    height={500}
                    className="h-72 w-full object-cover transition-transform duration-700 group-hover:scale-110 md:h-96"
                  />

                </div>

                <div className="flex flex-col justify-center p-8 md:p-12">

                  <span className="text-sm uppercase tracking-[0.3em] text-[#D4AF37]">
                    Premium Party Menu
                  </span>

                  <h3 className="mt-4 text-3xl font-bold text-white md:text-4xl">
                    {meal.title}
                  </h3>

                  <p className="mt-6 leading-8 text-[#B8B8B8]">
                    {meal.description}
                  </p>

                  <div className="mt-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

                    <div>
                      <p className="text-sm text-[#B8B8B8]">
                        Starting From
                      </p>

                      <h4 className="mt-2 text-3xl font-extrabold text-[#D4AF37] md:text-4xl">
                        {meal.price}
                      </h4>
                    </div>

                    <a
                      href="https://wa.me/2348121577759"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-14 w-full items-center justify-center rounded-xl bg-[#D4AF37] text-lg font-bold text-black transition-all duration-300 hover:scale-105 hover:bg-yellow-400 md:w-60"
                    >
                      Order on WhatsApp
                    </a>

                  </div>

                </div>

              </div>

            </div>

          ))}

        </div>

      </div>
    </section>
  );
}
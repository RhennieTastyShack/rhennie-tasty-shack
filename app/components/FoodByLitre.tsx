"use client";

import Image from "next/image";

const litreMeals = [
  {
    title: "Party Jollof Rice",
    image: "/images/jollof-rice.jpg",
    price: "₦28,000 / Litre",
    description:
      "Our signature smoky party-style jollof rice, cooked to perfection and ideal for birthdays, owambes and celebrations.",
  },
  {
    title: "Seafood Rice",
    image: "/images/seafood-rice.jpg",
    price: "₦40,000 / Litre",
    description:
      "Premium seafood rice loaded with prawns, fish and carefully selected seafood for unforgettable flavour.",
  },
  {
    title: "Seafood Okra",
    image: "/images/seafoodokra.jpeg",
    price: "₦45,000 / Litre",
    description:
      "Rich seafood okra prepared with premium seafood and authentic Nigerian flavours.",
  },
];

export default function FoodByLitre() {
  return (
    <section
      id="litre"
      className="bg-[#0B0B0B] py-28"
    >
      <div className="max-w-7xl mx-auto px-6">

        {/* Heading */}

        <div className="text-center mb-20">

          <span className="inline-block rounded-full border border-[#D4AF37]/20 bg-[#1A1A1A] px-6 py-2 text-sm tracking-[0.3em] text-[#D4AF37]">
            PARTY CATERING
          </span>

          <h2 className="mt-6 text-6xl font-bold text-white">
            Party Orders by the Litre
          </h2>

          <p className="mt-6 max-w-3xl mx-auto text-[#B8B8B8] leading-8">
            Perfect for weddings, birthdays, owambes,
            corporate events, family celebrations and every
            special occasion. Freshly prepared in generous
            portions that bring people together.
          </p>

        </div>

        {/* Cards */}

        <div className="space-y-12">

          {litreMeals.map((meal) => (

            <div
              key={meal.title}
              className="grid lg:grid-cols-2 overflow-hidden rounded-[35px] border border-[#D4AF37]/15 bg-[#171717] hover:border-[#D4AF37] transition duration-500"
            >

              <div className="overflow-hidden">

                <Image
                  src={meal.image}
                  alt={meal.title}
                  width={700}
                  height={500}
                  className="h-[350px] w-full object-cover transition duration-700 hover:scale-110"
                />

              </div>

              <div className="flex flex-col justify-center p-10">

                <span className="text-[#D4AF37] uppercase tracking-[0.25em] text-sm">
                  Premium Party Menu
                </span>

                <h3 className="mt-4 text-4xl font-bold text-white">
                  {meal.title}
                </h3>

                <p className="mt-6 leading-8 text-[#B8B8B8]">
                  {meal.description}
                </p>

                <div className="mt-10 flex flex-wrap items-center justify-between gap-6">

                  <div>

                    <p className="text-sm text-[#B8B8B8]">
                      Starting From
                    </p>

                    <h4 className="text-4xl font-bold text-[#D4AF37]">
                      {meal.price}
                    </h4>

                  </div>

                  <a
                    href="https://wa.me/2348121577759"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="gold-btn px-8 py-4"
                  >
                    Order on WhatsApp
                  </a>

                </div>

              </div>

            </div>

          ))}

        </div>

      </div>
    </section>
  );
}
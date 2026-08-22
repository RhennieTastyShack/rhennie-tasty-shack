import Image from "next/image";
import Link from "next/link";

const meals = [
  {
    name: "Jollof Rice & Turkey",
    image: "/images/jollofrice-turkey.jpeg",
    price: "₦8,000",
    description:
      "Smoky party jollof served with juicy grilled turkey.",
    bestseller: true,
  },
  {
    name: "Seafood Rice",
    image: "/images/seafood-rice.jpg",
    price: "₦12,500",
    description:
      "Premium seafood rice loaded with prawns, fish and more.",
    bestseller: true,
  },
  {
    name: "Seafood Okra",
    image: "/images/seafoodokra.jpeg",
    price: "₦10,000",
    description:
      "Rich okra soup packed with fresh seafood.",
    bestseller: false,
  },
  {
    name: "Royale Pasta Bowl",
    image: "/images/pasta.jpg",
    price: "₦8,000",
    description:
      "Creamy pasta served with grilled turkey.",
    bestseller: false,
  },
];

export default function FeaturedMeals() {
  return (
    <section
      id="featured"
      className="overflow-hidden bg-[#F8F6F1] py-20 sm:py-24 lg:py-32"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">

        {/* =====================================================
            SECTION HEADER
        ====================================================== */}

        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">

          <div>
            <div className="flex items-center gap-3">
              <span className="h-px w-10 bg-[#F26A21]" />

              <span className="text-[10px] font-extrabold uppercase tracking-[0.35em] text-[#F26A21]">
                Signature Selection
              </span>
            </div>

            <h2 className="mt-5 max-w-xl text-4xl font-bold leading-[0.95] tracking-tight text-[#171717] sm:text-5xl lg:text-6xl">
              Food worth
              <span className="block text-[#F26A21]">
                remembering.
              </span>
            </h2>
          </div>

          <div className="lg:pb-1">
            <p className="max-w-xl text-sm leading-7 text-[#77736D] sm:text-base sm:leading-8 lg:ml-auto">
              Freshly prepared meals made with premium ingredients,
              bold flavours and the kind of detail that turns an
              ordinary meal into an experience.
            </p>

            <Link
              href="/menu"
              className="mt-6 inline-flex items-center text-sm font-bold text-[#171717] transition-colors hover:text-[#F26A21]"
            >
              Explore the full menu
              <span className="ml-2 text-[#F26A21]">→</span>
            </Link>
          </div>

        </div>

        {/* =====================================================
            MEAL GRID
        ====================================================== */}

        <div className="mt-14 grid gap-5 sm:mt-16 sm:grid-cols-2 lg:grid-cols-4">

          {meals.map((meal, index) => (
            <article
              key={meal.name}
              className={`group overflow-hidden rounded-[28px] border border-black/[0.07] bg-white shadow-[0_15px_50px_rgba(23,23,23,0.05)] transition-all duration-500 hover:-translate-y-2 hover:border-[#F26A21]/25 hover:shadow-[0_25px_70px_rgba(23,23,23,0.10)] ${
                index === 0 ? "sm:col-span-2 lg:col-span-1" : ""
              }`}
            >

              {/* =================================================
                  IMAGE
              ================================================== */}

              <div className="relative aspect-[4/4.5] overflow-hidden bg-[#EEEAE2]">

                <Image
                  src={meal.image}
                  alt={meal.name}
                  fill
                  sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 25vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />

                {/* Image gradient */}
                <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/45 to-transparent opacity-70" />

                {/* Bestseller */}
                {meal.bestseller && (
                  <div className="absolute left-4 top-4">
                    <span className="inline-flex items-center rounded-full bg-[#F26A21] px-3.5 py-2 text-[9px] font-extrabold uppercase tracking-[0.18em] text-white shadow-lg">
                      Best Seller
                    </span>
                  </div>
                )}

                {/* Item number */}
                <span className="absolute bottom-4 right-4 text-[10px] font-bold tracking-[0.2em] text-white/80">
                  0{index + 1}
                </span>

              </div>

              {/* =================================================
                  CONTENT
              ================================================== */}

              <div className="p-5 sm:p-6">

                <h3 className="text-xl font-bold leading-tight text-[#171717] sm:text-2xl">
                  {meal.name}
                </h3>

                <p className="mt-3 min-h-[66px] text-sm leading-6 text-[#77736D]">
                  {meal.description}
                </p>

                {/* Divider */}
                <div className="my-5 h-px bg-black/[0.07]" />

                <div className="flex items-center justify-between gap-3">

                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#99948D]">
                      From
                    </p>

                    <span className="mt-1 block text-xl font-extrabold text-[#171717]">
                      {meal.price}
                    </span>
                  </div>

                  <Link
                    href="/menu"
                    className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-full bg-[#171717] px-5 text-xs font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#F26A21]"
                  >
                    Order
                    <span className="ml-1.5">→</span>
                  </Link>

                </div>

              </div>

            </article>
          ))}

        </div>

        {/* =====================================================
            BOTTOM STATEMENT
        ====================================================== */}

        <div className="mt-14 flex flex-col gap-5 border-t border-black/[0.08] pt-7 sm:mt-16 sm:flex-row sm:items-center sm:justify-between">

          <p className="max-w-xl text-xs leading-6 text-[#88837C] sm:text-sm">
            From everyday lunches to special celebrations, every
            Rhennie experience is prepared with intention.
          </p>

          <Link
            href="/menu"
            className="inline-flex shrink-0 items-center text-sm font-extrabold text-[#F26A21] hover:text-[#D95512]"
          >
            View all meals
            <span className="ml-2">↗</span>
          </Link>

        </div>

      </div>
    </section>
  );
}
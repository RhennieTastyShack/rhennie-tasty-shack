import Image from "next/image";
import Link from "next/link";

const meals = [
  {
    name: "Jollof Rice & Turkey",
    image: "/images/jollofrice-turkey.jpeg",
    price: "₦8,000",
    description: "Smoky party jollof served with juicy grilled turkey.",
    bestseller: true,
  },
  {
    name: "Seafood Rice",
    image: "/images/seafood-rice.jpg",
    price: "₦12,500",
    description: "Premium seafood rice loaded with prawns, fish and more.",
    bestseller: true,
  },
  {
    name: "Seafood Okra",
    image: "/images/seafoodokra.jpeg",
    price: "₦10,000",
    description: "Rich okra soup packed with fresh seafood.",
    bestseller: false,
  },
  {
    name: "Royale Pasta Bowl",
    image: "/images/pasta.jpg",
    price: "₦8,000",
    description: "Creamy pasta served with grilled turkey.",
    bestseller: false,
  },
];

export default function FeaturedMeals() {
  return (
    <section
      id="featured"
      className="bg-gradient-to-b from-white to-gray-50 py-20 md:py-28"
    >
      <div className="mx-auto max-w-7xl px-5 md:px-8">

        <div className="mb-16 text-center">
          <span className="inline-block rounded-full bg-yellow-100 px-4 py-2 text-sm font-semibold text-yellow-700">
            Signature Selection
          </span>

          <h2 className="mt-5 text-3xl font-extrabold text-gray-900 md:text-5xl">
            Featured Meals
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-gray-600 text-base md:text-lg">
            Freshly prepared with premium ingredients and unforgettable
            flavours, crafted for every occasion.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-4">

          {meals.map((meal) => (
            <div
              key={meal.name}
              className="group overflow-hidden rounded-3xl bg-white shadow-md transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl"
            >
              <div className="relative h-72 overflow-hidden">

                {meal.bestseller && (
                  <span className="absolute left-4 top-4 z-20 rounded-full bg-yellow-500 px-4 py-2 text-xs font-bold uppercase tracking-wider text-black shadow-lg">
                    Best Seller
                  </span>
                )}

                <Image
                  src={meal.image}
                  alt={meal.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>

              <div className="p-6">

                <h3 className="text-2xl font-bold text-gray-900">
                  {meal.name}
                </h3>

                <p className="mt-3 min-h-[72px] text-gray-600 leading-7">
                  {meal.description}
                </p>

                <div className="mt-8 flex items-center justify-between">

                  <span className="text-3xl font-extrabold text-yellow-500">
                    {meal.price}
                  </span>

                  <Link
                    href="/menu"
                    className="flex h-11 w-28 items-center justify-center rounded-xl bg-black text-sm font-semibold text-white transition-all duration-300 hover:bg-yellow-500 hover:text-black"
                  >
                    Order Now
                  </Link>

                </div>

              </div>
            </div>
          ))}

        </div>

      </div>
    </section>
  );
}
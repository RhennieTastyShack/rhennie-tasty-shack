import Image from "next/image";
import Link from "next/link";

const meals = [
  {
    name: "Jollof Rice & Turkey",
    image: "/images/jollofrice-turkey.jpeg",
    price: "₦8,000",
    description: "Smoky party jollof served with juicy grilled turkey."
  },
  {
    name: "Seafood Rice",
    image: "/images/seafood-rice.jpg",
    price: "₦12,500",
    description: "Premium seafood rice loaded with prawns, fish and more."
  },
  {
    name: "Seafood Okra",
    image: "/images/seafoodokra.jpeg",
    price: "₦10,000",
    description: "Rich okra soup packed with fresh seafood."
  },
  {
    name: "Royale Pasta Bowl",
    image: "/images/pasta.jpg",
    price: "₦8,000",
    description: "Creamy pasta served with grilled turkey."
  },
];

export default function FeaturedMeals() {
  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6">

        <div className="mb-14 text-center">
          <h2 className="text-4xl font-bold text-gray-900">
            Featured Meals
          </h2>

          <p className="mt-4 text-gray-600">
            Freshly prepared with premium ingredients.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">

          {meals.map((meal) => (
            <div
              key={meal.name}
              className="group overflow-hidden rounded-3xl bg-white shadow-lg transition duration-500 hover:-translate-y-3 hover:shadow-2xl"
            >

              <div className="relative h-64 overflow-hidden">

                <Image
                  src={meal.image}
                  alt={meal.name}
                  fill
                  className="object-cover transition duration-700 group-hover:scale-110"
                />

              </div>

              <div className="p-6">

                <h3 className="text-xl font-bold">
                  {meal.name}
                </h3>

                <p className="mt-3 text-gray-600">
                  {meal.description}
                </p>

                <div className="mt-6 flex items-center justify-between">

                  <span className="text-2xl font-bold text-yellow-500">
                    {meal.price}
                  </span>

                  <Link
                    href="/menu"
                    className="rounded-full bg-black px-5 py-2 text-white transition hover:bg-yellow-500 hover:text-black"
                  >
                    Order
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
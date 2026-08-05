import Image from "next/image";
import Link from "next/link";

const boxes = [
  {
    title: "Luxury Brunch Box",
    image: "/images/food-brunch.jpeg",
    price: "From ₦35,000",
    popular: true,
    items: [
      "Mini Burgers",
      "Chicken Wings",
      "Pancakes",
      "Fresh Juice",
      "Fresh Fruits",
      "Dessert",
    ],
  },
  {
    title: "Weekend Treat Box",
    image: "/images/food-box-2.png",
    price: "From ₦40,000",
    popular: false,
    items: [
      "Jollof Rice",
      "Turkey",
      "Small Chops",
      "Drinks",
      "Dessert",
      "Chef's Special",
    ],
  },
];

export default function FoodBoxes() {
  return (
    <section
      id="foodboxes"
      className="bg-gradient-to-b from-gray-50 to-white py-20 md:py-28"
    >
      <div className="mx-auto max-w-7xl px-5 md:px-8">

        <div className="mb-16 text-center">

          <span className="inline-block rounded-full bg-yellow-100 px-4 py-2 text-sm font-semibold text-yellow-700">
            Premium Catering
          </span>

          <h2 className="mt-5 text-3xl font-extrabold text-gray-900 md:text-5xl">
            Signature Food Boxes
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-gray-600 text-base md:text-lg">
            Beautifully curated food boxes perfect for birthdays,
            corporate meetings, weddings and every special celebration.
          </p>

        </div>

        <div className="grid gap-10 lg:grid-cols-2">

          {boxes.map((box) => (
            <div
              key={box.title}
              className="group overflow-hidden rounded-3xl bg-white shadow-lg transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl"
            >

              <div className="relative h-80 overflow-hidden">

                {box.popular && (
                  <span className="absolute left-5 top-5 z-20 rounded-full bg-yellow-500 px-4 py-2 text-xs font-bold uppercase tracking-widest text-black shadow-lg">
                    Most Popular
                  </span>
                )}

                <Image
                  src={box.image}
                  alt={box.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />

              </div>

              <div className="p-8">

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                  <h3 className="text-3xl font-bold text-gray-900">
                    {box.title}
                  </h3>

                  <span className="inline-flex w-fit rounded-full bg-yellow-500 px-5 py-2 text-lg font-bold text-black">
                    {box.price}
                  </span>

                </div>

                <ul className="mt-8 space-y-4">

                  {box.items.map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-3 text-gray-700"
                    >
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-yellow-500 font-bold text-black">
                        ✓
                      </span>

                      <span>{item}</span>

                    </li>
                  ))}

                </ul>

                <Link
                  href="/menu"
                  className="mt-10 flex h-14 w-full items-center justify-center rounded-xl bg-black text-lg font-bold text-white transition-all duration-300 hover:bg-yellow-500 hover:text-black"
                >
                  Order This Box
                </Link>

              </div>

            </div>
          ))}

        </div>

      </div>
    </section>
  );
}
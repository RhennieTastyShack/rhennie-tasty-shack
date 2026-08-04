import Image from "next/image";
import Link from "next/link";

const boxes = [
  {
    title: "Luxury Brunch Box",
    image: "/images/food-brunch.jpeg",
    price: "From ₦35,000",
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
    <section className="bg-gray-50 py-24">
      <div className="mx-auto max-w-7xl px-6">

        <div className="mb-14 text-center">
          <h2 className="text-4xl font-bold text-gray-900">
            Signature Food Boxes
          </h2>

          <p className="mt-4 text-gray-600">
            Perfect for birthdays, office lunches, meetings and special occasions.
          </p>
        </div>

        <div className="grid gap-10 lg:grid-cols-2">

          {boxes.map((box) => (
            <div
              key={box.title}
              className="overflow-hidden rounded-3xl bg-white shadow-xl transition duration-500 hover:-translate-y-2 hover:shadow-2xl"
            >

              <div className="relative h-80">
                <Image
                  src={box.image}
                  alt={box.title}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="p-8">

                <div className="flex items-center justify-between">
                  <h3 className="text-3xl font-bold">
                    {box.title}
                  </h3>

                  <span className="rounded-full bg-yellow-500 px-4 py-2 font-bold text-black">
                    {box.price}
                  </span>
                </div>

                <ul className="mt-8 space-y-3">
                  {box.items.map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-3 text-gray-700"
                    >
                      <span className="text-yellow-500">✔</span>
                      {item}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/menu"
                  className="mt-10 inline-block rounded-full bg-black px-8 py-4 font-semibold text-white transition hover:bg-yellow-500 hover:text-black"
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
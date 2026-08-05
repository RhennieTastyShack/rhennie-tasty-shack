"use client";

import Image from "next/image";

const reviews = [
  {
    name: "Feyishola Bakare",
    role: "Corporate Client",
    image: "/images/feyishola.jpeg",
    review:
      "Rhennie Tasty Shack exceeded my expectations. The food was fresh, beautifully packaged, and absolutely delicious. I'll definitely be ordering again!",
  },
  {
    name: "Samad Faronbi",
    role: "Loyal Customer",
    image: "/images/samad.jpeg",
    review:
      "Excellent customer service and amazing meals. Every order arrives on time and tastes just as good as it looks.",
  },
  {
    name: "Sinmiloluwa A.",
    role: "Food Enthusiast",
    image: "/images/simi.jpeg",
    review:
      "Hands down one of the best food brands I've tried. Quality, taste, and presentation are always top-notch.",
  },
];

export default function Reviews() {
  return (
    <section
      id="reviews"
      className="bg-gradient-to-b from-white to-gray-50 py-20 md:py-28"
    >
      <div className="mx-auto max-w-7xl px-5 md:px-8">

        <div className="mb-16 text-center">

          <span className="inline-block rounded-full bg-yellow-100 px-4 py-2 text-sm font-semibold text-yellow-700">
            Customer Reviews
          </span>

          <h2 className="mt-5 text-3xl font-extrabold text-gray-900 md:text-5xl">
            What Our Customers Say
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base text-gray-600 md:text-lg">
            Every meal is prepared with care, and these reviews reflect the
            experiences of our valued customers.
          </p>

        </div>

        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">

          {reviews.map((review) => (
            <div
              key={review.name}
              className="group rounded-3xl border border-gray-100 bg-white p-8 shadow-lg transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
            >

              <div className="flex items-center gap-5">

                <Image
                  src={review.image}
                  alt={review.name}
                  width={80}
                  height={80}
                  className="h-20 w-20 rounded-full object-cover ring-4 ring-yellow-100"
                />

                <div>

                  <h3 className="text-xl font-bold text-gray-900">
                    {review.name}
                  </h3>

                  <p className="text-sm text-yellow-600">
                    {review.role}
                  </p>

                  <span className="mt-2 inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                    ✔ Verified Customer
                  </span>

                </div>

              </div>

              <div className="mt-6 text-2xl text-yellow-500">
                ★★★★★
              </div>

              <p className="mt-5 italic leading-8 text-gray-600">
                "{review.review}"
              </p>

            </div>
          ))}

        </div>

      </div>
    </section>
  );
}
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
    name: "Sinmiloluwa",
    role: "Food Enthusiast",
    image: "/images/simi.jpeg",
    review:
      "Hands down one of the best food brands I've tried. Quality, taste, and presentation are always top-notch.",
  },
];

export default function Reviews() {
  return (
    <section className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-14">
          <h2 className="text-4xl font-bold text-black">
            What Our Customers Say
          </h2>
          <p className="text-gray-600 mt-3">
            Real reviews from happy customers.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-2xl transition duration-300"
            >
              <div className="flex items-center mb-6">
                <Image
                  src={review.image}
                  alt={review.name}
                  width={70}
                  height={70}
                  className="rounded-full object-cover w-[70px] h-[70px]"
                />

                <div className="ml-4">
                  <h3 className="font-semibold text-lg text-black">
                    {review.name}
                  </h3>
                  <p className="text-sm text-yellow-600">{review.role}</p>
                </div>
              </div>

              <p className="text-gray-700 italic leading-relaxed">
                "{review.review}"
              </p>

              <div className="mt-6 text-yellow-500 text-xl">
                ★★★★★
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
"use client";

import Image from "next/image";

const reviews = [
  {
    name: "Feyishola Bakare",
    role: "Corporate Client",
    image: "/images/feyishola.jpeg",
    review:
      "The food was fresh, beautifully packaged, and absolutely delicious. I’ll definitely be ordering again.",
  },
  {
    name: "Samad Faronbi",
    role: "Loyal Customer",
    image: "/images/samad.jpeg",
    review:
      "Excellent service and amazing meals. Every order arrives on time and tastes as good as it looks.",
  },
  {
    name: "Sinmiloluwa A.",
    role: "Food Enthusiast",
    image: "/images/simi.jpeg",
    review:
      "Quality, taste and presentation are always top-notch. One of the best food brands I’ve tried.",
  },
];

export default function Reviews() {
  return (
    <section id="reviews" className="bg-[#FAF8F4] py-12 sm:py-16 lg:py-20">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-12 xl:px-16">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#F26A21]">
            Testimonials
          </p>
          <h2 className="mt-3 font-serif text-3xl font-bold text-[#171717] sm:text-4xl">
            Loved by our guests.
          </h2>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {reviews.map((review) => (
            <article
              key={review.name}
              className="rounded-[24px] border border-black/6 bg-white p-7"
            >
              <div className="flex items-center gap-4">
                <Image
                  src={review.image}
                  alt={review.name}
                  width={56}
                  height={56}
                  className="h-14 w-14 rounded-full object-cover"
                />
                <div>
                  <h3 className="text-base font-bold text-[#171717]">
                    {review.name}
                  </h3>
                  <p className="text-xs text-black/45">{review.role}</p>
                </div>
              </div>
              <p className="mt-5 text-sm leading-7 text-black/60">
                “{review.review}”
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

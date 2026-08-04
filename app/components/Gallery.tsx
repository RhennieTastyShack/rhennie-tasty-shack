"use client";

import Image from "next/image";

const gallery = [
  "/images/jollofrice-turkey.jpeg",
  "/images/jollof-chicken.jpeg",
  "/images/pasta.jpg",
  "/images/food-brunch.jpeg",
  "/images/catering-platter.jpeg",
  "/images/seafood-rice.jpg",
  "/images/burger.jpg",
  "/images/smallchops.jpeg",
];

export default function Gallery() {
  return (
    <section className="bg-[#0B0B0B] py-28">
      <div className="max-w-7xl mx-auto px-6">

        <div className="text-center mb-20">

          <span className="inline-block rounded-full border border-[#D4AF37]/20 bg-[#1A1A1A] px-6 py-2 text-sm tracking-[0.3em] text-[#D4AF37]">
            OUR GALLERY
          </span>

          <h2 className="text-6xl font-bold text-white mt-6">
            A Taste of Luxury
          </h2>

          <p className="mt-6 text-[#B8B8B8] max-w-3xl mx-auto leading-8">
            Every dish is prepared with passion, beautifully presented,
            and made to create unforgettable dining experiences.
          </p>

        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">

          {gallery.map((image, index) => (

            <div
              key={index}
              className="group overflow-hidden rounded-[30px]"
            >

              <Image
                src={image}
                alt="Gallery"
                width={500}
                height={500}
                className="h-72 w-full object-cover transition duration-700 group-hover:scale-110"
              />

            </div>

          ))}

        </div>

      </div>
    </section>
  );
}
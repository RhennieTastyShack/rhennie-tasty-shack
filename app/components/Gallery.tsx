"use client";

import Image from "next/image";
import Link from "next/link";

const gallery = [
  {
    image: "/images/jollofrice-turkey.jpeg",
    title: "Jollof Rice & Turkey",
  },
  {
    image: "/images/jollof-chicken.jpeg",
    title: "Jollof Rice & Chicken",
  },
  {
    image: "/images/pasta.jpg",
    title: "Royal Pasta",
  },
  {
    image: "/images/signature brunch.jpeg",
    title: "Signature Brunch",
  },
  {
    image: "/images/catering-platter.jpeg",
    title: "Catering Collection",
  },
  {
    image: "/images/seafood-rice.jpg",
    title: "Seafood Rice",
  },
  {
    image: "/images/burger.jpg",
    title: "Gourmet Burger",
  },
  {
    image: "/images/smallchops.jpeg",
    title: "Small Chops",
  },
];

export default function Gallery() {
  return (
    <section id="gallery" className="bg-[#080808] py-16 text-white sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#D4AF37]">
            Gallery
          </p>
          <h2 className="mt-3 font-serif text-3xl font-bold sm:text-4xl">
            A taste of luxury
          </h2>
        </div>

        <div className="mt-12 grid auto-rows-[220px] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {gallery.map((item, index) => {
            const featured = index === 0 || index === 4;
            return (
              <figure
                key={item.image}
                className={`group relative overflow-hidden rounded-[24px] ${
                  featured ? "sm:col-span-2 sm:row-span-2" : ""
                }`}
              >
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes={
                    featured
                      ? "(max-width: 768px) 100vw, 50vw"
                      : "(max-width: 768px) 100vw, 25vw"
                  }
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent p-5">
                  <p className="text-sm font-semibold text-white">{item.title}</p>
                </figcaption>
              </figure>
            );
          })}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/menu"
            className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-[#D4AF37] px-7 text-sm font-bold text-black transition hover:bg-[#E5C65A]"
          >
            View Menu
          </Link>
        </div>
      </div>
    </section>
  );
}

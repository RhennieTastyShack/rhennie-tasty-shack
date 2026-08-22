"use client";

import Image from "next/image";

type MealCardProps = {
  name: string;
  collection: string;
  description: string;
  price: number;
  imageUrl: string | null;
  available?: boolean;
  whatsappNumber?: string;
};

function getImagePath(imageUrl: string | null) {
  if (!imageUrl) {
    return "/images/logo.png";
  }

  if (
    imageUrl.startsWith("/") ||
    imageUrl.startsWith("http://") ||
    imageUrl.startsWith("https://")
  ) {
    return imageUrl;
  }

  return `/images/${encodeURIComponent(imageUrl)}`;
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(price);
}

export default function MealCard({
  name,
  collection,
  description,
  price,
  imageUrl,
  available = true,
  whatsappNumber = "2348121577759",
}: MealCardProps) {
  const message = `Hello Rhennie Tasty Shack, I would like to order ${name} for ${formatPrice(
    price
  )}.`;

  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    message
  )}`;

  return (
    <article className="group flex h-full min-w-0 flex-col overflow-hidden rounded-[26px] border border-black/[0.08] bg-white shadow-[0_8px_30px_rgba(0,0,0,0.05)] transition-all duration-500 hover:-translate-y-2 hover:border-[#F26A21]/40 hover:shadow-[0_25px_60px_rgba(242,106,33,0.12)]">

      {/* IMAGE */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#F1EFEB]">

        <Image
          src={getImagePath(imageUrl)}
          alt={name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* Image overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Collection */}
        <div className="absolute left-4 top-4 max-w-[75%]">
          <span className="inline-flex max-w-full truncate rounded-full border border-white/25 bg-black/65 px-3 py-1.5 text-[8px] font-bold uppercase tracking-[0.16em] text-white backdrop-blur-md">
            {collection}
          </span>
        </div>

        {/* Availability */}
        {available && (
          <div className="absolute bottom-4 right-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[8px] font-bold uppercase tracking-[0.15em] text-green-600 shadow-lg">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
              Available
            </span>
          </div>
        )}
      </div>

      {/* CONTENT */}
      <div className="flex flex-1 flex-col p-5 sm:p-6">

        {/* Name */}
        <h3 className="line-clamp-2 min-h-[56px] font-serif text-xl font-bold leading-tight text-[#171717] sm:text-[22px]">
          {name}
        </h3>

        {/* Description */}
        <p className="mt-3 line-clamp-3 min-h-[72px] text-sm leading-6 text-black/55">
          {description}
        </p>

        {/* Price */}
        <div className="mt-auto border-t border-black/[0.07] pt-5">

          <p className="text-[8px] font-bold uppercase tracking-[0.25em] text-black/35">
            Price
          </p>

          <p className="mt-1 text-2xl font-extrabold tracking-tight text-[#F26A21]">
            {formatPrice(price)}
          </p>

          {/* Order */}
          {available ? (
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 flex min-h-[50px] w-full items-center justify-center rounded-full bg-[#F26A21] px-5 text-sm font-bold text-white shadow-[0_10px_25px_rgba(242,106,33,0.18)] transition-all duration-300 hover:-translate-y-1 hover:bg-[#D95512] hover:shadow-[0_15px_35px_rgba(242,106,33,0.28)]"
            >
              Order This Meal
              <span className="ml-2 transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </a>
          ) : (
            <button
              type="button"
              disabled
              className="mt-5 flex min-h-[50px] w-full cursor-not-allowed items-center justify-center rounded-full bg-black/10 px-5 text-sm font-bold text-black/35"
            >
              Currently Unavailable
            </button>
          )}

        </div>
      </div>
    </article>
  );
}
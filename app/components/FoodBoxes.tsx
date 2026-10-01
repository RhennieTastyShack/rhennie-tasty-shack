import Image from "next/image";
import Link from "next/link";

/**
 * Homepage Food Boxes preview only.
 * Full collection lives under Menu → Food Boxes.
 */
const featuredBoxes = [
  {
    number: "01",
    title: "RTS Pasta Box",
    price: "₦15,000",
    image: "/images/rts-pasta-box.jpg",
    description:
      "Hearty RTS pasta box with sides and drinks. Available Wednesdays only.",
  },
  {
    number: "02",
    title: "RTS Treat Box",
    price: "₦65,000",
    image: "/images/rts-treat-box.jpg",
    popular: true,
    description:
      "A generous RTS treat box with rice, chicken, plantain, snacks and drinks for sharing.",
  },
  {
    number: "03",
    title: "RTS Grand Feast Box",
    price: "₦260,000",
    image: "/images/rts-grand-feast-box.jpg",
    description:
      "Our grand RTS celebration spread with rice, pasta, proteins, small chops, desserts, fruit and drinks.",
  },
  {
    number: "04",
    title: "RTS Feast Box",
    price: "₦280,000",
    image: "/images/rts-feast-box.jpg",
    description:
      "Premium RTS feast box packed with rice, pasta, proteins, small chops, fruit and drinks.",
  },
];

export default function FoodBoxes() {
  return (
    <section
      id="foodboxes"
      className="relative overflow-hidden bg-white py-12 text-[#171717] sm:py-16 lg:py-20"
    >
      <div className="pointer-events-none absolute -left-40 top-20 h-96 w-96 rounded-full bg-[#F26A21]/6 blur-3xl" />
      <div className="pointer-events-none absolute -right-40 top-1/3 h-96 w-96 rounded-full bg-[#F26A21]/6 blur-3xl" />

      <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-12 xl:px-16">
        <div className="mx-auto mb-12 max-w-4xl text-center">
          <div className="mb-5 flex items-center justify-center gap-4">
            <span className="h-px w-12 bg-[#F26A21]" />
            <span className="text-xs font-bold uppercase tracking-[0.35em] text-[#F26A21]">
              Signature Collection
            </span>
            <span className="h-px w-12 bg-[#F26A21]" />
          </div>

          <h2 className="font-serif text-4xl font-bold leading-tight sm:text-5xl md:text-6xl">
            Signature <span className="text-[#F26A21]">Food Boxes</span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-black/55 sm:text-base">
            A curated preview of our celebration boxes — explore the full
            collection in the Menu.
          </p>
        </div>

        <div className="grid items-stretch gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {featuredBoxes.map((box, index) => (
            <article
              key={box.title}
              className={`group flex h-[480px] w-full flex-col overflow-hidden rounded-[28px] border bg-white transition-all duration-500 hover:-translate-y-2 ${
                box.popular
                  ? "border-[#F26A21] shadow-[0_20px_50px_rgba(242,106,33,0.12)]"
                  : "border-black/8 hover:border-[#F26A21]/40"
              }`}
            >
              <div className="relative h-[220px] w-full shrink-0 overflow-hidden bg-[#ECE8E1]">
                <Image
                  src={box.image}
                  alt={box.title}
                  fill
                  priority={index < 2}
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/5 to-transparent" />

                <div className="absolute left-5 top-5 flex h-8 w-8 items-center justify-center rounded-full border border-[#F26A21] bg-white text-xs font-bold text-[#F26A21]">
                  {box.number}
                </div>

                {box.popular ? (
                  <div className="absolute right-5 top-5 rounded-full bg-[#F26A21] px-4 py-2 text-[10px] font-extrabold uppercase tracking-[0.15em] text-white shadow-lg">
                    Most Popular
                  </div>
                ) : null}
              </div>

              <div className="flex flex-1 flex-col p-6">
                <h3 className="min-h-[54px] text-[20px] font-bold leading-tight text-[#171717] sm:text-[22px]">
                  {box.title}
                </h3>

                <p className="mt-3 h-[72px] overflow-hidden text-sm leading-6 text-black/55">
                  {box.description}
                </p>

                <div className="mt-auto flex items-end justify-between gap-4 border-t border-black/8 pt-5">
                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-black/40">
                      Starting from
                    </p>
                    <p className="mt-1 text-[22px] font-extrabold tracking-tight text-[#F26A21]">
                      {box.price}
                    </p>
                  </div>

                  <Link
                    href="/menu?category=food-boxes"
                    className="flex items-center gap-2 rounded-full border border-[#F26A21] px-5 py-2.5 text-xs font-bold text-[#F26A21] transition-all duration-300 hover:bg-[#F26A21] hover:text-white"
                  >
                    View Box
                    <span>→</span>
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <Link
            href="/menu?category=food-boxes"
            className="inline-flex min-h-[52px] items-center justify-center rounded-full bg-[#F26A21] px-8 text-sm font-bold text-white transition hover:bg-[#D95512]"
          >
            View All Food Boxes →
          </Link>
        </div>
      </div>
    </section>
  );
}

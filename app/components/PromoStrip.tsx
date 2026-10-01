import Link from "next/link";

export default function PromoStrip() {
  return (
    <section className="bg-[#111111] px-4 py-14 text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#D4AF37]">
            Promos and discounts
          </p>
          <h2 className="mt-3 font-serif text-3xl font-bold">
            A little something at checkout
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-7 text-white/70">
            Active codes take a percentage off the food. Delivery and tips stay
            the same.
          </p>
        </div>
        <Link
          href="/promos"
          className="inline-flex min-h-[52px] items-center justify-center rounded-full bg-[#D4AF37] px-8 text-sm font-bold text-black"
        >
          View Promos
        </Link>
      </div>
    </section>
  );
}

import Link from "next/link";

export default function PromoStrip() {
  return (
    <section className="bg-[#111111] py-12 text-white sm:py-14">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-12 xl:px-16">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#F26A21]">
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
          className="inline-flex min-h-[52px] items-center justify-center rounded-full bg-[#F26A21] px-8 text-sm font-bold text-white transition hover:bg-[#D95512]"
        >
          View Promos
        </Link>
      </div>
    </section>
  );
}

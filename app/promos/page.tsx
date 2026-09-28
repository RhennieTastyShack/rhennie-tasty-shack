import Link from "next/link";
import { PROMOS } from "@/lib/promos";

export default function PromosPage() {
  return (
    <main className="min-h-screen bg-[#0B0B0B] px-4 py-16 text-white">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#D4AF37]">
          Rhennie Tasty Shack
        </p>
        <h1 className="mt-4 text-4xl font-bold sm:text-5xl">Promos and discounts</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-white/70">
          A promo code takes a percentage off the food on your plate. Delivery
          and the rider tip stay the same. Enter the code at checkout before
          you pay.
        </p>

        <section className="mt-10 space-y-4">
          {PROMOS.length === 0 ? (
            <article className="rounded-3xl border border-[#D4AF37]/30 bg-[#171717] p-6">
              <h2 className="text-xl font-bold text-[#D4AF37]">No live code today</h2>
              <p className="mt-3 text-sm leading-7 text-white/70">
                When the kitchen turns a code on, it shows here and works at
                checkout. A code that is not listed is turned away.
              </p>
            </article>
          ) : (
            PROMOS.map((promo) => (
              <article
                key={promo.code}
                className="rounded-3xl border border-[#D4AF37]/30 bg-[#171717] p-6"
              >
                <p className="text-xs uppercase tracking-[0.25em] text-[#D4AF37]">
                  {promo.code}
                </p>
                <h2 className="mt-2 text-2xl font-bold">{promo.label}</h2>
                <p className="mt-2 text-sm text-white/70">
                  {promo.percent}% off the food subtotal. {promo.note}
                </p>
              </article>
            ))
          )}
        </section>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/menu"
            className="rounded-full bg-[#F26A21] px-6 py-3 text-sm font-bold text-white"
          >
            Order from the menu
          </Link>
          <a
            href="https://wa.me/2348121577759"
            className="rounded-full border border-white/20 px-6 py-3 text-sm font-bold"
          >
            WhatsApp support
          </a>
        </div>
      </div>
    </main>
  );
}

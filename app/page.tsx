import Hero from "@/app/components/Hero";
import FeaturedMeals from "@/app/components/FeaturedMeals";
import ChefSpecial from "@/app/components/ChefSpecial";
import FoodBoxes from "@/app/components/FoodBoxes";
import PromoStrip from "@/app/components/PromoStrip";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-white">
      <Hero />
      <FeaturedMeals />
      <ChefSpecial />
      <PromoStrip />
      <FoodBoxes />

      <section className="bg-[#FAF8F4] px-5 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-2">
          <div className="rounded-[28px] border border-black/8 bg-white p-8 sm:p-10">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#D4AF37]">
              Event Concierge
            </p>
            <h2 className="mt-3 font-serif text-3xl font-bold text-[#171717]">
              Planning something special?
            </h2>
            <p className="mt-3 max-w-md text-sm leading-7 text-black/55">
              Catering and event orders — quotes, consultations and custom
              menus in one place.
            </p>
            <Link
              href="/event-concierge"
              className="mt-7 inline-flex min-h-[48px] items-center justify-center rounded-full bg-[#0B0B0B] px-7 text-sm font-bold text-[#D4AF37] transition hover:bg-[#171717]"
            >
              Plan Your Event
            </Link>
          </div>

          <div className="rounded-[28px] border border-black/8 bg-[#080808] p-8 text-white sm:p-10">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#D4AF37]">
              Customer Care
            </p>
            <h2 className="mt-3 font-serif text-3xl font-bold">
              Need a hand?
            </h2>
            <p className="mt-3 max-w-md text-sm leading-7 text-white/60">
              Contact, WhatsApp support, order help and FAQs — clear answers
              when you need them.
            </p>
            <Link
              href="/customer-care"
              className="mt-7 inline-flex min-h-[48px] items-center justify-center rounded-full bg-[#D4AF37] px-7 text-sm font-bold text-black transition hover:bg-[#E5C65A]"
            >
              Contact Customer Care
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

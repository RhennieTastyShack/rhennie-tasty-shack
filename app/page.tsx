import Hero from "@/app/components/Hero";
import FeaturedMeals from "@/app/components/FeaturedMeals";
import FoodBoxes from "@/app/components/FoodBoxes";
import WhyChooseUs from "@/app/components/WhyChoose";
import Reviews from "@/app/components/Reviews";
import Gallery from "@/app/components/Gallery";
import PromoStrip from "@/app/components/PromoStrip";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-white">
      <Hero />
      <FeaturedMeals />
      <FoodBoxes />

      <section className="bg-[#FAF8F4] px-5 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#D4AF37]">
            Event Concierge
          </p>
          <h2 className="mt-3 max-w-xl font-serif text-3xl font-bold text-[#171717] sm:text-4xl">
            Exceptional food for unforgettable occasions.
          </h2>
          <p className="mt-4 max-w-lg text-sm leading-7 text-black/55">
            Catering for birthdays, weddings, corporate events and private
            celebrations — planned through one Event Concierge experience.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/event-concierge"
              className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-[#0B0B0B] px-7 text-sm font-bold text-[#D4AF37] transition hover:bg-[#171717]"
            >
              Plan Your Event
            </Link>
            <Link
              href="/event-concierge/request"
              className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-black/15 px-7 text-sm font-bold text-[#171717] transition hover:border-[#D4AF37] hover:text-[#D4AF37]"
            >
              Request a Quote
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#D4AF37]">
              Party Orders
            </p>
            <h2 className="mt-3 font-serif text-3xl font-bold text-[#171717] sm:text-4xl">
              Food by the litre.
            </h2>
            <p className="mt-4 text-sm leading-7 text-black/55">
              Generous pots and party portions for gatherings — browse the Food
              by Litre collection in the Menu.
            </p>
          </div>
          <Link
            href="/menu?category=grand-pot"
            className="inline-flex min-h-[48px] shrink-0 items-center justify-center rounded-full bg-[#D4AF37] px-7 text-sm font-bold text-black transition hover:bg-[#E5C65A]"
          >
            Browse Party Orders
          </Link>
        </div>
      </section>

      <WhyChooseUs />
      <Reviews />
      <Gallery />
      <PromoStrip />

      <section className="bg-[#FAF8F4] px-5 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-2">
          <div className="rounded-[28px] border border-black/8 bg-white p-8 sm:p-10">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#D4AF37]">
              Order
            </p>
            <h2 className="mt-3 font-serif text-3xl font-bold text-[#171717]">
              Ready when you are.
            </h2>
            <p className="mt-3 max-w-md text-sm leading-7 text-black/55">
              Explore the full menu, including Food Boxes and signature meals.
            </p>
            <Link
              href="/menu"
              className="mt-7 inline-flex min-h-[48px] items-center justify-center rounded-full bg-[#0B0B0B] px-7 text-sm font-bold text-[#D4AF37] transition hover:bg-[#171717]"
            >
              View Menu
            </Link>
          </div>

          <div className="rounded-[28px] border border-black/8 bg-[#080808] p-8 text-white sm:p-10">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#D4AF37]">
              Customer Support
            </p>
            <h2 className="mt-3 font-serif text-3xl font-bold">
              Need a hand?
            </h2>
            <p className="mt-3 max-w-md text-sm leading-7 text-white/60">
              WhatsApp, order help, delivery questions and FAQs — calmly in one
              place.
            </p>
            <Link
              href="/customer-care"
              className="mt-7 inline-flex min-h-[48px] items-center justify-center rounded-full bg-[#D4AF37] px-7 text-sm font-bold text-black transition hover:bg-[#E5C65A]"
            >
              Contact Customer Support
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

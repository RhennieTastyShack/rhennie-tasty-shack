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

      <section className="bg-[#FAF8F4] py-12 sm:py-16 lg:py-20">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-12 xl:px-16">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#F26A21]">
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
              className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-[#F26A21] px-7 text-sm font-bold text-white transition hover:bg-[#D95512]"
            >
              Plan Your Event
            </Link>
            <Link
              href="/event-concierge/request"
              className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-black/15 px-7 text-sm font-bold text-[#171717] transition hover:border-[#F26A21] hover:text-[#F26A21]"
            >
              Request a Quote
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-white py-12 sm:py-16 lg:py-20">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 sm:px-6 md:flex-row md:items-end md:justify-between lg:px-12 xl:px-16">
          <div className="max-w-xl">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#F26A21]">
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
            className="inline-flex min-h-[48px] shrink-0 items-center justify-center rounded-full bg-[#F26A21] px-7 text-sm font-bold text-white transition hover:bg-[#D95512]"
          >
            Browse Party Orders
          </Link>
        </div>
      </section>

      <WhyChooseUs />
      <Reviews />
      <Gallery />
      <PromoStrip />

      <section className="bg-[#FAF8F4] py-12 sm:py-16 lg:py-20">
        <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-2 lg:px-12 xl:px-16">
          <div className="rounded-[28px] border border-black/8 bg-white p-8 sm:p-10">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#F26A21]">
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
              className="mt-7 inline-flex min-h-[48px] items-center justify-center rounded-full bg-[#F26A21] px-7 text-sm font-bold text-white transition hover:bg-[#D95512]"
            >
              View Menu
            </Link>
          </div>

          <div className="rounded-[28px] border border-black/8 bg-[#171717] p-8 text-white sm:p-10">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#F26A21]">
              Customer Support
            </p>
            <h2 className="mt-3 font-serif text-3xl font-bold">
              Need a hand?
            </h2>
            <p className="mt-3 max-w-md text-sm leading-7 text-white/70">
              WhatsApp, order help, delivery questions and FAQs — calmly in one
              place.
            </p>
            <Link
              href="/customer-care"
              className="mt-7 inline-flex min-h-[48px] items-center justify-center rounded-full bg-[#F26A21] px-7 text-sm font-bold text-white transition hover:bg-[#D95512]"
            >
              Contact Customer Support
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

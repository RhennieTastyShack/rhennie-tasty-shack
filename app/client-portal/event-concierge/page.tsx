"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  PARTY_DISHES,
  formatPartyPrice,
  type PartyDish,
} from "@/lib/party-menu";

const eventTypes = [
  {
    title: "Weddings",
    description:
      "Elegant dining experiences designed around your special day, from intimate celebrations to grand receptions.",
    icon: "✦",
  },
  {
    title: "Birthdays",
    description:
      "Beautifully curated menus and food experiences that make every birthday celebration unforgettable.",
    icon: "♢",
  },
  {
    title: "Corporate Events",
    description:
      "Professional catering for meetings, launches, office celebrations and corporate gatherings.",
    icon: "◇",
  },
  {
    title: "Conferences",
    description:
      "Reliable, beautifully presented meals for conferences, seminars, workshops and large gatherings.",
    icon: "✧",
  },
  {
    title: "Private Dining",
    description:
      "A more intimate culinary experience, thoughtfully prepared for private celebrations and special moments.",
    icon: "❖",
  },
  {
    title: "Celebrations",
    description:
      "From anniversaries to graduations and everything worth celebrating, we create menus around your occasion.",
    icon: "✦",
  },
];

const services = [
  "The regular menu for the table",
  "Appetizers for the reception",
  "Seafood, grill and small chops",
  "Private dining and receptions",
  "Logistics quoted for each event",
  "A host who stays with the details",
];

function AppetizerCard({ dish }: { dish: PartyDish }) {
  const [selectedCups, setSelectedCups] = useState<string[]>([]);
  const [cupsOpen, setCupsOpen] = useState(false);
  const choices = dish.choices || [];

  return (
    <article className="overflow-hidden rounded-[28px] border border-black/[0.06] bg-white">
      {dish.image ? (
        <div className="relative aspect-[4/3]">
          <Image
            src={dish.image}
            alt={dish.name}
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          />
        </div>
      ) : null}
      <div className="p-6">
        <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-[#F26A21]">
          {dish.kind}
        </p>
        <h3 className="mt-3 font-serif text-2xl font-bold">{dish.name}</h3>
        <p className="mt-2 text-sm leading-6 text-black/50">{dish.description}</p>
        {choices.length > 0 ? (
          <div className="mt-4">
            <button
              type="button"
              onClick={() => setCupsOpen((open) => !open)}
              aria-expanded={cupsOpen}
              className="text-[8px] font-bold uppercase tracking-[0.2em] text-[#F26A21]"
            >
              {cupsOpen ? "Hide cups" : "Choose cups"}
              {selectedCups.length > 0 ? ` · ${selectedCups.length} selected` : ""}
            </button>
            {cupsOpen ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {choices.map((option) => {
                  const selected = selectedCups.includes(option);

                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() =>
                        setSelectedCups((current) =>
                          current.includes(option)
                            ? current.filter((cup) => cup !== option)
                            : [...current, option]
                        )
                      }
                      aria-pressed={selected}
                      className={`rounded-full border px-3 py-1.5 text-left text-xs font-semibold ${
                        selected
                          ? "border-[#F26A21] bg-[#F26A21] text-white"
                          : "border-black/10 bg-white text-[#171717]"
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            ) : null}
            {selectedCups.length > 0 && cupsOpen ? (
              <p className="mt-3 text-xs font-semibold text-[#171717]">
                Selected: {selectedCups.join(", ")}
              </p>
            ) : null}
          </div>
        ) : null}
        <p className="mt-4 text-sm font-bold text-[#171717]">
          {formatPartyPrice(dish)}
        </p>
      </div>
    </article>
  );
}

export default function EventConciergePage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#F8F6F2] text-[#171717]">

      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="relative overflow-hidden bg-[#0B0B0B] text-white">

        {/* Decorative atmosphere */}
        <div className="pointer-events-none absolute -left-40 top-20 h-96 w-96 rounded-full bg-[#F26A21]/10 blur-[120px]" />

        <div className="pointer-events-none absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-[#F26A21]/10 blur-[120px]" />

        <div className="relative mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-28 lg:px-12 lg:py-36">

          <div className="max-w-4xl">

            {/* Eyebrow */}
            <div className="mb-7 flex items-center gap-3">

              <span className="h-px w-10 bg-[#F26A21] sm:w-14" />

              <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-[#F26A21] sm:text-[10px]">
                Event Concierge
              </span>

            </div>

            {/* Heading */}
            <h1 className="font-serif text-5xl font-bold leading-[0.92] tracking-[-0.04em] sm:text-6xl md:text-7xl lg:text-8xl">

              Your Occasion.

              <span className="mt-3 block text-[#F26A21]">
                Our Culinary Craft.
              </span>

            </h1>

            {/* Description */}
            <p className="mt-8 max-w-2xl text-sm leading-7 text-white/65 sm:text-base sm:leading-8 lg:text-lg">
              A private table for the occasion you are hosting.
              Guests begin with appetizers — waffle boxes, a seafood platter
              of crabs, prawns, glazed corn, fish and sauce, and tapioca.
              Every appetizer starts at 10. Then the regular menu.
              Logistics is quoted for that event alone.
            </p>

            {/* Buttons */}
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">

              <a
                href="#request-quote"
                className="inline-flex min-h-[54px] items-center justify-center rounded-full bg-[#F26A21] px-8 text-sm font-bold text-white shadow-[0_15px_45px_rgba(242,106,33,0.2)] transition-all duration-300 hover:-translate-y-1 hover:bg-[#D95512]"
              >
                Plan My Event
                <span className="ml-2">→</span>
              </a>

              <Link
                href="/menu"
                className="inline-flex min-h-[54px] items-center justify-center rounded-full border border-white/30 bg-white/5 px-8 text-sm font-bold text-white backdrop-blur-sm transition-all duration-300 hover:border-white hover:bg-white hover:text-[#171717]"
              >
                Explore Our Menu
              </Link>

            </div>

          </div>

          {/* Bottom details */}
          <div className="mt-16 flex flex-wrap gap-x-7 gap-y-3 text-[8px] font-bold uppercase tracking-[0.25em] text-white/40 sm:text-[9px]">

            <span>Premium Catering</span>

            <span className="h-1 w-1 self-center rounded-full bg-[#F26A21]" />

            <span>Custom Menus</span>

            <span className="h-1 w-1 self-center rounded-full bg-[#F26A21]" />

            <span>Exceptional Service</span>

          </div>

        </div>

      </section>

      {/* =====================================================
          INTRODUCTION
      ====================================================== */}

      <section className="bg-white px-5 py-20 sm:px-8 md:py-24 lg:px-12">

        <div className="mx-auto max-w-4xl text-center">

          <p className="text-[9px] font-bold uppercase tracking-[0.35em] text-[#F26A21]">
            Designed Around You
          </p>

          <h2 className="mt-4 font-serif text-3xl font-bold leading-tight sm:text-4xl md:text-5xl">
            More Than Catering.
            <span className="block text-[#F26A21]">
              An Experience.
            </span>
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-black/55 sm:text-base sm:leading-8">
            Your event deserves more than ordinary food. We work with
            you to understand your occasion, your guests and your vision,
            then create a culinary experience that feels uniquely yours.
          </p>

        </div>

      </section>

      {/* =====================================================
          EVENT TYPES
      ====================================================== */}

      <section className="bg-[#F8F6F2] px-5 py-20 sm:px-8 md:py-24 lg:px-12">

        <div className="mx-auto max-w-7xl">

          <div className="mb-12 text-center">

            <p className="text-[9px] font-bold uppercase tracking-[0.35em] text-[#F26A21]">
              Your Celebration
            </p>

            <h2 className="mt-3 font-serif text-3xl font-bold sm:text-4xl md:text-5xl">
              Whatever The Occasion
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-black/50">
              From intimate gatherings to large-scale events,
              we'll help you create a menu that fits the moment.
            </p>

          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

            {eventTypes.map((event) => (

              <article
                key={event.title}
                className="group rounded-[28px] border border-black/[0.06] bg-white p-7 shadow-[0_10px_35px_rgba(0,0,0,0.04)] transition-all duration-500 hover:-translate-y-2 hover:border-[#F26A21]/30 hover:shadow-[0_25px_60px_rgba(0,0,0,0.08)] sm:p-8"
              >

                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FFF0E8] text-xl text-[#F26A21] transition-transform duration-500 group-hover:rotate-12">
                  {event.icon}
                </div>

                <h3 className="mt-6 font-serif text-2xl font-bold">
                  {event.title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-black/50">
                  {event.description}
                </p>

                <a
                  href="#request-quote"
                  className="mt-6 inline-flex items-center text-xs font-bold uppercase tracking-[0.15em] text-[#F26A21]"
                >
                  Plan This Event
                  <span className="ml-2 transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </a>

              </article>

            ))}

          </div>

        </div>

      </section>

      {/* =====================================================
          SERVICES
      ====================================================== */}

      <section className="bg-[#0B0B0B] px-5 py-20 text-white sm:px-8 md:py-24 lg:px-12">

        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2 lg:items-center">

          <div>

            <p className="text-[9px] font-bold uppercase tracking-[0.35em] text-[#F26A21]">
              The Rhennie Experience
            </p>

            <h2 className="mt-4 font-serif text-3xl font-bold leading-tight sm:text-4xl md:text-5xl">
              Crafted With
              <span className="block text-[#F26A21]">
                Intention.
              </span>
            </h2>

            <p className="mt-6 max-w-xl text-sm leading-7 text-white/55 sm:text-base sm:leading-8">
              Every celebration asks for its own menu and its own logistics.
              The fee to bring the table to your venue is set for that event,
              from the address, the hour and the number of guests.
            </p>

          </div>

          <div className="grid gap-3 sm:grid-cols-2">

            {services.map((service, index) => (

              <div
                key={service}
                className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-colors hover:border-[#F26A21]/40"
              >

                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F26A21] text-xs font-bold text-white">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <span className="text-sm font-semibold text-white/80">
                  {service}
                </span>

              </div>

            ))}

          </div>

        </div>

      </section>

      {/* =====================================================
          PARTY TABLE
      ====================================================== */}

      <section className="bg-[#F8F6F2] px-5 py-20 sm:px-8 md:py-24 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 max-w-2xl">
            <p className="text-[9px] font-bold uppercase tracking-[0.35em] text-[#F26A21]">
              Appetizers
            </p>
            <h2 className="mt-3 font-serif text-3xl font-bold sm:text-4xl md:text-5xl">
              Bites before the regular menu
            </h2>
            <p className="mt-4 text-sm leading-7 text-black/50 sm:text-base">
              Waffles come with grilled chicken, sausage and sauce.
              Every appetizer has a minimum order of 10. Pasta cups are
              ₦3,500, and the creamy and fire pastas are ₦4,500. The
              regular menu is still the meal. Logistics is written for
              this event.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PARTY_DISHES.map((dish) => (
              <AppetizerCard key={dish.name} dish={dish} />
            ))}
          </div>

          <div className="mt-10 flex flex-wrap gap-6">
            <Link
              href="/menu"
              className="text-xs font-bold uppercase tracking-[0.16em] text-[#171717]"
            >
              Regular menu →
            </Link>
            <Link
              href="/menu?category=appetizers"
              className="text-xs font-bold uppercase tracking-[0.16em] text-[#F26A21]"
            >
              Appetizers →
            </Link>
          </div>
        </div>
      </section>

      {/* =====================================================
          REQUEST QUOTE INTRO
      ====================================================== */}

      <section
        id="request-quote"
        className="bg-white px-5 py-20 sm:px-8 md:py-24 lg:px-12"
      >

        <div className="mx-auto max-w-4xl text-center">

          <p className="text-[9px] font-bold uppercase tracking-[0.35em] text-[#F26A21]">
            Let's Create Something Beautiful
          </p>

          <h2 className="mt-4 font-serif text-3xl font-bold sm:text-4xl md:text-5xl">
            Tell Us About Your Event
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-black/50 sm:text-base">
            Ready to start planning? Share a few details with us and
            our Event Concierge team will help you create the perfect
            culinary experience.
          </p>

          <div className="mt-9">

            <Link
              href="/event-concierge/request"
              className="inline-flex min-h-[54px] items-center justify-center rounded-full bg-[#F26A21] px-9 text-sm font-bold text-white shadow-[0_15px_40px_rgba(242,106,33,0.18)] transition-all duration-300 hover:-translate-y-1 hover:bg-[#D95512]"
            >
              Request A Quote
              <span className="ml-2">→</span>
            </Link>

          </div>

        </div>

      </section>

      {/* =====================================================
          FINAL CTA
      ====================================================== */}

      <section className="bg-[#F8F6F2] px-5 pb-20 sm:px-8 md:pb-28 lg:px-12">

        <div className="mx-auto max-w-5xl overflow-hidden rounded-[32px] bg-[#0B0B0B] px-6 py-14 text-center text-white sm:px-10 md:py-16">

          <p className="text-[9px] font-bold uppercase tracking-[0.35em] text-[#F26A21]">
            Rhennie Tasty Shack
          </p>

          <h2 className="mt-4 font-serif text-3xl font-bold sm:text-4xl">
            Your Guests Deserve
            <span className="block text-[#F26A21]">
              Exceptional Taste.
            </span>
          </h2>

          <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-white/50">
            Let's make your next celebration one your guests
            will be talking about long after the last plate.
          </p>

          <Link
            href="/event-concierge/request"
            className="mt-8 inline-flex min-h-[52px] items-center justify-center rounded-full bg-[#F26A21] px-8 text-sm font-bold text-white transition-all duration-300 hover:-translate-y-1 hover:bg-[#D95512]"
          >
            Start Planning
            <span className="ml-2">→</span>
          </Link>

        </div>

      </section>

    </main>
  );
}
"use client";

import Link from "next/link";

const services = [
  {
    title: "Private Events",
    description:
      "Elegant catering experiences for birthdays, intimate celebrations, anniversaries and special gatherings.",
    icon: "✨",
  },
  {
    title: "Corporate Catering",
    description:
      "Professional meals and catering solutions for meetings, conferences, office lunches and corporate events.",
    icon: "🏢",
  },
  {
    title: "Weddings & Celebrations",
    description:
      "Thoughtfully curated food experiences designed to make your most important celebrations unforgettable.",
    icon: "🥂",
  },
  {
    title: "Custom Experiences",
    description:
      "Have something unique in mind? Tell us what you need and we'll build a catering experience around it.",
    icon: "👑",
  },
];

export default function CateringPage() {
  return (
    <main className="min-h-screen bg-[#080808] text-white">

      {/* HERO */}
      <section className="relative overflow-hidden border-b border-[#D4AF37]/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.10),transparent_55%)]" />

        <div className="relative mx-auto max-w-7xl px-5 py-20 sm:px-6 md:px-8 md:py-28 lg:py-32">

          <Link
            href="/"
            className="inline-flex items-center text-sm text-[#888888] transition hover:text-[#D4AF37]"
          >
            ← Back to Home
          </Link>

          <div className="mx-auto mt-14 max-w-4xl text-center">

            <span className="inline-flex rounded-full border border-[#D4AF37]/30 bg-[#111111] px-5 py-2 text-[10px] font-bold uppercase tracking-[0.35em] text-[#D4AF37]">
              Premium Catering
            </span>

            <h1 className="mt-7 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              Catering Made
              <span className="block text-[#D4AF37]">
                Unforgettable.
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-[#999999] sm:text-base md:text-lg">
              From intimate celebrations to corporate events and grand
              occasions, Rhennie Tasty Shack creates premium food experiences
              designed around you.
            </p>

            <div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row">

              <Link
                href="/client-portal/event-concierge"
                className="rounded-full bg-[#D4AF37] px-8 py-4 text-sm font-bold text-black transition hover:bg-[#E5C65A]"
              >
                Plan My Event →
              </Link>

              <Link
                href="/menu"
                className="rounded-full border border-[#D4AF37]/40 px-8 py-4 text-sm font-bold text-[#D4AF37] transition hover:bg-[#D4AF37] hover:text-black"
              >
                Explore Our Menu
              </Link>

            </div>

          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-6 md:px-8 md:py-20">

        <div className="text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#D4AF37]">
            What We Cater
          </p>

          <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
            Created for every occasion.
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-[#777777]">
            Whatever you're celebrating, we'll help you create a food
            experience your guests will remember.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

          {services.map((service) => (
            <div
              key={service.title}
              className="rounded-[28px] border border-white/10 bg-[#111111] p-7 transition duration-300 hover:-translate-y-1 hover:border-[#D4AF37]/40"
            >

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#D4AF37]/20 bg-[#181818] text-xl">
                {service.icon}
              </div>

              <h3 className="mt-6 text-xl font-bold">
                {service.title}
              </h3>

              <p className="mt-3 text-sm leading-6 text-[#777777]">
                {service.description}
              </p>

            </div>
          ))}

        </div>
      </section>

      {/* EVENT CONCIERGE CTA */}
      <section className="mx-auto max-w-7xl px-5 pb-16 sm:px-6 md:px-8 md:pb-24">

        <div className="overflow-hidden rounded-[32px] border border-[#D4AF37]/20 bg-gradient-to-br from-[#1b180d] to-[#101010] p-7 sm:p-10 md:p-14">

          <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-center">

            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#D4AF37]">
                Event Concierge
              </p>

              <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
                Planning something special?
              </h2>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-[#888888] sm:text-base">
                Tell us about your event, your guests, your preferred menu
                and everything you have in mind. Our team will help you build
                the right catering experience.
              </p>
            </div>

            <Link
              href="/client-portal/event-concierge"
              className="inline-flex items-center justify-center rounded-full bg-[#D4AF37] px-8 py-4 text-sm font-bold text-black transition hover:bg-[#E5C65A]"
            >
              Start Consultation →
            </Link>

          </div>

        </div>

      </section>

    </main>
  );
}
"use client";

import Link from "next/link";

const plans = [
  {
    name: "Lunch Atelier",
    slug: "daily-lunch",
    description:
      "A private lunch menu, composed by you and served on the days you keep.",
    features: [
      "Your own lunch dishes",
      "Stay for a week, a season, or as long as you wish",
      "Delivery timed to your day",
      "Pay the menu price for each lunch",
    ],
    price: "From ₦5,500",
  },
  {
    name: "The Signature Table",
    slug: "weekly-plan",
    description:
      "Breakfast, lunch, and dinner arranged as your own timetable. The membership lasts exactly as long as you want it to.",
    features: [
      "Choose each course yourself",
      "A private weekly menu",
      "One week, several months, or open-ended",
      "Prepared and delivered to your address",
    ],
    price: "Menu price",
    featured: true,
  },
  {
    name: "A Private Table",
    slug: "custom",
    description:
      "For a household, a residence, or a table that needs a menu written only for them.",
    features: [
      "A menu composed around your table",
      "Any length of stay",
      "Dietary preferences kept on file",
      "A direct line to the kitchen",
    ],
    price: "By request",
    whatsapp: true,
  },
];

export default function SubscriptionPage() {
  return (
    <main className="min-h-screen bg-[#080808] px-4 py-14 text-white sm:px-6 md:px-8 lg:py-20">
      <div className="mx-auto max-w-7xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#999999] transition hover:text-[#D4AF37]"
        >
          ← Back to Home
        </Link>

        <section className="mt-10 text-center">
          <span className="inline-flex rounded-full border border-[#D4AF37]/30 bg-[#111111] px-5 py-2 text-[10px] font-bold uppercase tracking-[0.35em] text-[#D4AF37]">
            Meal Subscription
          </span>

          <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Eat Better.
            <span className="block text-[#D4AF37]">
              Every Day.
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-[#999999] sm:text-base">
            Enjoy freshly prepared meals from Rhennie Tasty Shack,
            delivered according to a schedule that works for you.
          </p>
        </section>

        <section className="mt-14">
          <div className="grid gap-6 lg:grid-cols-3">
            {plans.map((plan) => {
              const href = plan.whatsapp
                ? "https://wa.me/2348121577759?text=Hello%20Rhennie%20Tasty%20Shack,%20I%20want%20a%20custom%20meal%20subscription."
                : `/client-portal/subscriptions?plan=${encodeURIComponent(plan.slug)}`;

              return (
                <article
                  key={plan.name}
                  className={`relative rounded-[30px] border p-7 transition duration-300 hover:-translate-y-1 sm:p-8 ${
                    plan.featured
                      ? "border-[#D4AF37]/60 bg-gradient-to-br from-[#1b180d] to-[#111111] shadow-[0_0_40px_rgba(212,175,55,0.08)]"
                      : "border-white/10 bg-[#111111]"
                  }`}
                >
                  {plan.featured && (
                    <div className="absolute right-6 top-6 rounded-full bg-[#D4AF37] px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-black">
                      Popular
                    </div>
                  )}

                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#D4AF37]">
                    {plan.name}
                  </p>

                  <h2 className="mt-5 text-2xl font-bold sm:text-3xl">
                    {plan.price}
                  </h2>

                  <p className="mt-4 min-h-[80px] text-sm leading-6 text-[#888888]">
                    {plan.description}
                  </p>

                  <div className="my-7 h-px bg-white/10" />

                  <ul className="space-y-4">
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-3 text-sm text-[#cccccc]"
                      >
                        <span className="mt-0.5 text-[#D4AF37]">✓</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {plan.whatsapp ? (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-8 flex w-full items-center justify-center rounded-full border border-[#D4AF37]/50 px-6 py-3.5 text-sm font-bold text-[#D4AF37] transition hover:bg-[#D4AF37] hover:text-black"
                    >
                      Chat About Custom →
                    </a>
                  ) : (
                    <Link
                      href={href}
                      className={`mt-8 flex w-full items-center justify-center rounded-full px-6 py-3.5 text-sm font-bold transition ${
                        plan.featured
                          ? "bg-[#D4AF37] text-black hover:bg-[#E5C65A]"
                          : "border border-[#D4AF37]/50 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black"
                      }`}
                    >
                      Build This Plan →
                    </Link>
                  )}
                </article>
              );
            })}
          </div>
        </section>

        <section className="mt-16 rounded-[30px] border border-white/10 bg-[#111111] p-7 sm:p-10">
          <div className="text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#D4AF37]">
              How It Works
            </p>

            <h2 className="mt-3 text-2xl font-bold sm:text-3xl">
              A table kept for you.
            </h2>
          </div>

          <div className="mt-10 grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-[#D4AF37]/30 bg-[#181818] font-bold text-[#D4AF37]">
                1
              </div>
              <h3 className="mt-5 font-bold">Compose your menu</h3>
              <p className="mt-2 text-sm leading-6 text-[#777777]">
                Choose the courses, the dishes, the days, and how long you would like to stay.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-[#D4AF37]/30 bg-[#181818] font-bold text-[#D4AF37]">
                2
              </div>
              <h3 className="mt-5 font-bold">The kitchen confirms</h3>
              <p className="mt-2 text-sm leading-6 text-[#777777]">
                Dishes chosen from the menu are charged at their menu price, with delivery added for a platform rider. A custom table can pay that way too, or the kitchen can set the price.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-[#D4AF37]/30 bg-[#181818] font-bold text-[#D4AF37]">
                3
              </div>
              <h3 className="mt-5 font-bold">The table begins</h3>
              <p className="mt-2 text-sm leading-6 text-[#777777]">
                Pay securely, then your menu is prepared and delivered for as long as the membership runs.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-10 rounded-[30px] border border-[#D4AF37]/20 bg-gradient-to-br from-[#17150d] to-[#101010] p-8 text-center sm:p-12">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#D4AF37]">
            Need Something Custom?
          </p>

          <h2 className="mt-4 text-2xl font-bold sm:text-3xl">
            Let&apos;s create a plan that works for you.
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-[#888888]">
            Start with our digital builder, or chat with Rhennie Tasty Shack
            if you need a fully custom subscription.
          </p>

          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/client-portal/subscriptions?plan=weekly-plan"
              className="inline-flex rounded-full bg-[#D4AF37] px-8 py-3.5 text-sm font-bold text-black transition hover:bg-[#E5C65A]"
            >
              Start Meal Plan →
            </Link>

            <a
              href="https://wa.me/2348121577759?text=Hello%20Rhennie%20Tasty%20Shack,%20I%20want%20to%20ask%20about%20meal%20subscriptions."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex rounded-full border border-[#D4AF37]/50 px-8 py-3.5 text-sm font-bold text-[#D4AF37] transition hover:bg-[#D4AF37] hover:text-black"
            >
              Chat With Us →
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}

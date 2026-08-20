"use client";

import Link from "next/link";

const plans = [
  {
    name: "Lunch Plan",
    description:
      "Enjoy a freshly prepared premium lunch delivered on the days that work for you.",
    features: [
      "Freshly prepared meals",
      "Flexible delivery schedule",
      "Premium menu options",
      "Easy order management",
    ],
    price: "From ₦5,500",
  },
  {
    name: "3-Square Meal Plan",
    description:
      "A convenient daily meal experience designed for customers who want breakfast, lunch and dinner covered.",
    features: [
      "Breakfast, lunch & dinner",
      "Flexible meal schedule",
      "Premium meal selections",
      "Priority customer support",
    ],
    price: "Custom Plan",
    featured: true,
  },
  {
    name: "Custom Meal Plan",
    description:
      "Build a meal subscription around your lifestyle, preferences and delivery needs.",
    features: [
      "Personalized meal selection",
      "Flexible delivery frequency",
      "Custom dietary preferences",
      "Dedicated assistance",
    ],
    price: "Let's Talk",
  },
];

export default function SubscriptionPage() {
  return (
    <main className="min-h-screen bg-[#080808] px-4 py-14 text-white sm:px-6 md:px-8 lg:py-20">
      <div className="mx-auto max-w-7xl">

        {/* Back */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#999999] transition hover:text-[#D4AF37]"
        >
          ← Back to Home
        </Link>

        {/* Hero */}
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

        {/* Plans */}
        <section className="mt-14">
          <div className="grid gap-6 lg:grid-cols-3">

            {plans.map((plan) => (
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
                      <span className="mt-0.5 text-[#D4AF37]">
                        ✓
                      </span>

                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href="https://wa.me/2348121577759"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`mt-8 flex w-full items-center justify-center rounded-full px-6 py-3.5 text-sm font-bold transition ${
                    plan.featured
                      ? "bg-[#D4AF37] text-black hover:bg-[#E5C65A]"
                      : "border border-[#D4AF37]/50 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black"
                  }`}
                >
                  Choose This Plan →
                </a>
              </article>
            ))}

          </div>
        </section>

        {/* How it works */}
        <section className="mt-16 rounded-[30px] border border-white/10 bg-[#111111] p-7 sm:p-10">
          <div className="text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#D4AF37]">
              How It Works
            </p>

            <h2 className="mt-3 text-2xl font-bold sm:text-3xl">
              Your meals, made simple.
            </h2>
          </div>

          <div className="mt-10 grid gap-8 md:grid-cols-3">

            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-[#D4AF37]/30 bg-[#181818] font-bold text-[#D4AF37]">
                1
              </div>

              <h3 className="mt-5 font-bold">
                Choose Your Plan
              </h3>

              <p className="mt-2 text-sm leading-6 text-[#777777]">
                Select the meal plan that best fits your lifestyle.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-[#D4AF37]/30 bg-[#181818] font-bold text-[#D4AF37]">
                2
              </div>

              <h3 className="mt-5 font-bold">
                Set Your Schedule
              </h3>

              <p className="mt-2 text-sm leading-6 text-[#777777]">
                Tell us when and where you would like your meals delivered.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-[#D4AF37]/30 bg-[#181818] font-bold text-[#D4AF37]">
                3
              </div>

              <h3 className="mt-5 font-bold">
                Enjoy Your Meals
              </h3>

              <p className="mt-2 text-sm leading-6 text-[#777777]">
                Sit back and enjoy premium meals prepared by Rhennie Tasty Shack.
              </p>
            </div>

          </div>
        </section>

        {/* CTA */}
        <section className="mt-10 rounded-[30px] border border-[#D4AF37]/20 bg-gradient-to-br from-[#17150d] to-[#101010] p-8 text-center sm:p-12">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#D4AF37]">
            Need Something Custom?
          </p>

          <h2 className="mt-4 text-2xl font-bold sm:text-3xl">
            Let's create a plan that works for you.
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-[#888888]">
            Contact Rhennie Tasty Shack and we'll help you choose
            or customize the right meal subscription.
          </p>

          <a
            href="https://wa.me/2348121577759?text=Hello%20Rhennie%20Tasty%20Shack,%20I%20want%20to%20ask%20about%20meal%20subscriptions."
            target="_blank"
            rel="noopener noreferrer"
            className="mt-7 inline-flex rounded-full bg-[#D4AF37] px-8 py-3.5 text-sm font-bold text-black transition hover:bg-[#E5C65A]"
          >
            Chat With Us →
          </a>
        </section>

      </div>
    </main>
  );
}
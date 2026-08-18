"use client";

const plans = [
  {
    name: "Daily Lunch",
    label: "For busy days",
    description:
      "A freshly prepared premium lunch delivered whenever you need it.",
    features: [
      "Freshly prepared meal",
      "Flexible delivery",
      "Perfect for workdays",
    ],
  },
  {
    name: "Weekly Plan",
    label: "Most Popular",
    description:
      "Plan your meals for the week and enjoy delicious food without the daily stress.",
    features: [
      "Multiple meals weekly",
      "Priority meal planning",
      "Flexible delivery schedule",
    ],
    featured: true,
  },
  {
    name: "Corporate Plan",
    label: "For Teams",
    description:
      "Reliable meal solutions for offices, teams, meetings and corporate events.",
    features: [
      "Multiple meal portions",
      "Scheduled delivery",
      "Customised packages",
    ],
  },
];

export default function Subscription() {
  return (
    <section
      id="subscription"
      className="relative overflow-hidden bg-[#080808] py-20 text-white md:py-28"
    >
      {/* Decorative glows */}
      <div className="pointer-events-none absolute -left-40 top-20 h-96 w-96 rounded-full bg-yellow-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-40 bottom-20 h-96 w-96 rounded-full bg-yellow-500/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-5 md:px-8">

        {/* HEADER */}
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <div className="mb-5 flex items-center justify-center gap-4">
            <span className="h-px w-12 bg-yellow-500" />

            <span className="text-xs font-bold uppercase tracking-[0.35em] text-yellow-500">
              Meal Subscription
            </span>

            <span className="h-px w-12 bg-yellow-500" />
          </div>

          <h2 className="font-serif text-4xl font-bold leading-tight sm:text-5xl md:text-6xl">
            Eat Better.
            <br />
            <span className="text-yellow-500">Every Day.</span>
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-gray-400 md:text-base">
            Take the stress out of daily meals. Enjoy freshly prepared
            dishes delivered to your home, office or workplace on a schedule
            that works for you.
          </p>
        </div>

        {/* PLANS */}
        <div className="grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`group relative flex flex-col rounded-[30px] border p-7 transition-all duration-500 hover:-translate-y-2 md:p-8 ${
                plan.featured
                  ? "border-yellow-500 bg-gradient-to-b from-[#1c1a12] to-[#111111] shadow-[0_25px_80px_rgba(234,179,8,0.08)]"
                  : "border-white/10 bg-[#111111] hover:border-yellow-500/50"
              }`}
            >
              {/* Featured badge */}
              {plan.featured && (
                <div className="absolute right-6 top-6 rounded-full bg-yellow-500 px-3 py-1 text-[9px] font-extrabold uppercase tracking-wider text-black">
                  Most Popular
                </div>
              )}

              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-yellow-500">
                {plan.label}
              </span>

              <h3 className="mt-5 text-2xl font-bold">
                {plan.name}
              </h3>

              <p className="mt-4 min-h-[72px] text-sm leading-7 text-gray-400">
                {plan.description}
              </p>

              <div className="my-7 h-px bg-white/10" />

              <ul className="space-y-4">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-3 text-sm text-gray-300"
                  >
                    <span className="mt-0.5 text-yellow-500">✓</span>

                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <a
                href={`https://wa.me/2348121577759?text=${encodeURIComponent(
                  `Hello Rhennie Tasty Shack, I'm interested in the ${plan.name} meal subscription plan.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`mt-8 flex h-12 items-center justify-center rounded-xl text-sm font-bold transition-all duration-300 ${
                  plan.featured
                    ? "bg-yellow-500 text-black hover:bg-yellow-400"
                    : "border border-yellow-500/50 bg-transparent text-yellow-500 hover:bg-yellow-500 hover:text-black"
                }`}
              >
                Choose {plan.name}
                <span className="ml-2">→</span>
              </a>
            </div>
          ))}
        </div>

        {/* BENEFITS */}
        <div className="mt-12 rounded-[30px] border border-white/10 bg-[#111111] p-7 md:p-10">
          <div className="grid gap-8 md:grid-cols-4">

            <div>
              <span className="text-2xl">🍽️</span>

              <h4 className="mt-3 font-bold">
                Fresh Meals
              </h4>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Prepared fresh with quality ingredients.
              </p>
            </div>

            <div>
              <span className="text-2xl">⏰</span>

              <h4 className="mt-3 font-bold">
                Save Time
              </h4>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                No daily cooking or meal planning stress.
              </p>
            </div>

            <div>
              <span className="text-2xl">🚗</span>

              <h4 className="mt-3 font-bold">
                Reliable Delivery
              </h4>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Your meals delivered according to your schedule.
              </p>
            </div>

            <div>
              <span className="text-2xl">✨</span>

              <h4 className="mt-3 font-bold">
                Flexible Plans
              </h4>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Choose a plan that fits your lifestyle.
              </p>
            </div>

          </div>
        </div>

        {/* BOTTOM CTA */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500">
            Need something customised?
          </p>

          <a
            href="https://wa.me/2348121577759?text=Hello%20Rhennie%20Tasty%20Shack,%20I%20would%20like%20to%20discuss%20a%20custom%20meal%20subscription."
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-yellow-500 px-7 py-3.5 text-sm font-bold text-black transition-all duration-300 hover:bg-yellow-400"
          >
            Speak With Us
            <span>→</span>
          </a>
        </div>

      </div>
    </section>
  );
}
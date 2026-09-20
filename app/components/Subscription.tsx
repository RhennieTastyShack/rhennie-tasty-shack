"use client";

import Link from "next/link";

const plans = [
  {
    name: "Daily Lunch",
    slug: "daily-lunch",
    label: "For Busy Days",
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
    slug: "weekly-plan",
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
    slug: "corporate-plan",
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

const benefits = [
  {
    icon: "🍽️",
    title: "Fresh Meals",
    description: "Prepared fresh with quality ingredients.",
  },
  {
    icon: "⏰",
    title: "Save Time",
    description: "No daily cooking or meal planning stress.",
  },
  {
    icon: "🚗",
    title: "Reliable Delivery",
    description: "Your meals delivered according to your schedule.",
  },
  {
    icon: "✨",
    title: "Flexible Plans",
    description: "Choose a plan that fits your lifestyle.",
  },
];

export default function Subscription() {
  return (
    <section
      id="subscription"
      className="
        relative
        overflow-hidden
        bg-[#080808]
        px-5
        py-20
        text-white
        sm:px-6
        sm:py-24
        lg:px-8
        lg:py-28
      "
    >
      {/* =====================================================
          DECORATIVE GLOWS
      ====================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          -left-40
          top-20
          h-96
          w-96
          rounded-full
          bg-yellow-500/10
          blur-3xl
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          -right-40
          bottom-20
          h-96
          w-96
          rounded-full
          bg-yellow-500/10
          blur-3xl
        "
      />

      <div className="relative mx-auto max-w-7xl">
        {/* =====================================================
            HEADER
        ====================================================== */}

        <div
          className="
            mx-auto
            mb-12
            max-w-3xl
            text-center
            sm:mb-14
            lg:mb-16
          "
        >
          <div
            className="
              mb-5
              flex
              items-center
              justify-center
              gap-3
              sm:gap-4
            "
          >
            <span className="h-px w-8 bg-yellow-500 sm:w-12" />

            <span
              className="
                text-[9px]
                font-bold
                uppercase
                tracking-[0.28em]
                text-yellow-500
                sm:text-[10px]
                sm:tracking-[0.35em]
              "
            >
              Meal Subscription
            </span>

            <span className="h-px w-8 bg-yellow-500 sm:w-12" />
          </div>

          <h2
            className="
              font-serif
              text-4xl
              font-bold
              leading-[1.05]
              tracking-tight
              sm:text-5xl
              lg:text-6xl
            "
          >
            Eat Better.

            <span className="block text-yellow-500">
              Every Day.
            </span>
          </h2>

          <p
            className="
              mx-auto
              mt-6
              max-w-2xl
              text-sm
              leading-7
              text-gray-400
              sm:text-base
              sm:leading-8
            "
          >
            Take the stress out of daily meals. Enjoy freshly
            prepared dishes delivered to your home, office or
            workplace on a schedule that works for you.
          </p>
        </div>

        {/* =====================================================
            SUBSCRIPTION PLAN CARDS
        ====================================================== */}

        <div
          className="
            grid
            grid-cols-1
            items-stretch
            gap-6
            lg:grid-cols-3
            lg:gap-7
          "
        >
          {plans.map((plan) => {
            const planLink = `/client-portal/subscriptions?plan=${encodeURIComponent(
              plan.slug
            )}`;

            return (
              <article
                key={plan.name}
                className={`
                  group
                  relative
                  flex
                  h-full
                  min-w-0
                  flex-col
                  overflow-hidden
                  rounded-[28px]
                  border
                  transition-all
                  duration-500
                  hover:-translate-y-2
                  ${
                    plan.featured
                      ? "border-yellow-500 bg-gradient-to-b from-[#1c1a12] to-[#111111] shadow-[0_25px_80px_rgba(234,179,8,0.08)]"
                      : "border-white/10 bg-[#111111] hover:border-yellow-500/50"
                  }
                `}
              >
                {/* TOP ACCENT */}

                <div
                  className={`
                    h-1.5
                    w-full
                    shrink-0
                    ${
                      plan.featured
                        ? "bg-yellow-500"
                        : "bg-white/10"
                    }
                  `}
                />

                {/* =============================================
                    CARD BODY
                ============================================== */}

                <div
                  className="
                    flex
                    flex-1
                    flex-col
                    px-5
                    pb-6
                    pt-6
                    sm:px-6
                    sm:pb-7
                    sm:pt-7
                    lg:px-7
                    lg:pb-8
                    lg:pt-7
                  "
                >
                  {/* LABEL + POPULAR BADGE */}

                  <div
                    className="
                      flex
                      min-w-0
                      items-start
                      justify-between
                      gap-3
                    "
                  >
                    <span
                      className="
                        min-w-0
                        text-[9px]
                        font-bold
                        uppercase
                        tracking-[0.22em]
                        text-yellow-500
                      "
                    >
                      {plan.label}
                    </span>

                    {plan.featured && (
                      <span
                        className="
                          shrink-0
                          rounded-full
                          bg-yellow-500
                          px-3
                          py-1.5
                          text-[8px]
                          font-extrabold
                          uppercase
                          tracking-[0.12em]
                          text-black
                        "
                      >
                        Popular
                      </span>
                    )}
                  </div>

                  {/* PLAN NAME */}

                  <h3
                    className="
                      mt-5
                      break-words
                      pr-1
                      text-2xl
                      font-bold
                      leading-tight
                      text-white
                    "
                  >
                    {plan.name}
                  </h3>

                  {/* DESCRIPTION */}

                  <p
                    className="
                      mt-4
                      min-h-[84px]
                      break-words
                      pr-1
                      text-sm
                      leading-7
                      text-gray-400
                    "
                  >
                    {plan.description}
                  </p>

                  {/* DIVIDER */}

                  <div className="my-6 h-px bg-white/10 sm:my-7" />

                  {/* FEATURES */}

                  <ul className="space-y-4">
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className="
                          flex
                          min-w-0
                          items-start
                          gap-3
                          text-sm
                          leading-6
                          text-gray-300
                        "
                      >
                        <span
                          className="
                            mt-0.5
                            flex
                            h-5
                            w-5
                            shrink-0
                            items-center
                            justify-center
                            rounded-full
                            bg-yellow-500/10
                            text-xs
                            font-bold
                            text-yellow-500
                          "
                          aria-hidden="true"
                        >
                          ✓
                        </span>

                        <span className="break-words">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* ===========================================
                      APP CTA
                  ============================================ */}

                  <div
                    className="
                      mt-auto
                      pt-8
                    "
                  >
                    <Link
                      href={planLink}
                      aria-label={`Choose ${plan.name}`}
                      className={`
                        inline-flex
                        min-h-[50px]
                        w-full
                        items-center
                        justify-center
                        gap-2
                        rounded-full
                        px-5
                        py-3
                        text-center
                        text-sm
                        font-bold
                        transition-all
                        duration-300
                        focus-visible:outline
                        focus-visible:outline-2
                        focus-visible:outline-offset-2
                        focus-visible:outline-yellow-500
                        sm:px-6
                        ${
                          plan.featured
                            ? "bg-yellow-500 text-black shadow-[0_10px_30px_rgba(234,179,8,0.15)] hover:-translate-y-0.5 hover:bg-yellow-400"
                            : "border border-yellow-500/50 bg-transparent text-yellow-500 hover:-translate-y-0.5 hover:border-yellow-500 hover:bg-yellow-500 hover:text-black"
                        }
                      `}
                    >
                      Choose {plan.name}

                      <span aria-hidden="true">
                        →
                      </span>
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* =====================================================
            BENEFITS
        ====================================================== */}

        <div
          className="
            mt-10
            overflow-hidden
            rounded-[28px]
            border
            border-white/10
            bg-[#111111]
            sm:mt-12
          "
        >
          <div
            className="
              grid
              grid-cols-1
              divide-y
              divide-white/[0.08]
              sm:grid-cols-2
              sm:divide-x
              sm:divide-y-0
              lg:grid-cols-4
            "
          >
            {benefits.map((benefit) => (
              <div
                key={benefit.title}
                className="
                  px-5
                  py-6
                  sm:px-6
                  sm:py-7
                  lg:px-6
                  lg:py-8
                "
              >
                <span
                  className="
                    text-2xl
                    leading-none
                  "
                  aria-hidden="true"
                >
                  {benefit.icon}
                </span>

                <h4
                  className="
                    mt-4
                    text-base
                    font-bold
                    text-white
                  "
                >
                  {benefit.title}
                </h4>

                <p
                  className="
                    mt-2
                    text-sm
                    leading-6
                    text-gray-500
                  "
                >
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* =====================================================
            BOTTOM CTA
        ====================================================== */}

        <div
          className="
            mx-auto
            mt-12
            max-w-2xl
            text-center
            sm:mt-14
          "
        >
          <p
            className="
              text-sm
              leading-6
              text-gray-500
            "
          >
            Need something customised for your home, office or team?
          </p>

          <Link
            href="/client-portal/subscriptions?plan=custom"
            className="
              mt-5
              inline-flex
              min-h-[50px]
              w-full
              items-center
              justify-center
              gap-2
              rounded-full
              bg-yellow-500
              px-7
              py-3.5
              text-sm
              font-bold
              text-black
              transition-all
              duration-300
              hover:-translate-y-0.5
              hover:bg-yellow-400
              focus-visible:outline
              focus-visible:outline-2
              focus-visible:outline-offset-4
              focus-visible:outline-yellow-500
              sm:w-auto
            "
          >
            Create Custom Plan

            <span aria-hidden="true">
              →
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
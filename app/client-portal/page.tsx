"use client";

import Link from "next/link";

const quickLinks = [
  {
    title: "My Orders",
    description: "View and track your current and previous orders.",
    href: "/orders",
    icon: "📦",
  },
  {
    title: "Event Concierge",
    description: "Plan your next event with our team.",
    href: "/client-portal/event-concierge",
    icon: "✨",
  },
  {
    title: "Meal Plans",
    description: "Build a flexible meal subscription online.",
    href: "/client-portal/subscriptions?plan=weekly-plan",
    icon: "🍽️",
  },
  {
    title: "My Subscriptions",
    description: "Track plans, approvals and payments.",
    href: "/client-portal/my-subscriptions",
    icon: "🗓️",
  },
];

export default function ClientPortalPage() {
  return (
    <main className="min-h-screen bg-[#080808] px-4 py-14 text-white sm:px-6 md:px-8 lg:py-20">

      <div className="mx-auto max-w-6xl">

        {/* ================= HEADER ================= */}

        <div className="text-center">

          <span className="inline-flex rounded-full border border-[#D4AF37]/30 bg-[#111111] px-5 py-2 text-[10px] font-bold uppercase tracking-[0.35em] text-[#D4AF37]">
            Client Portal
          </span>

          <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Welcome Back.
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[#999999] sm:text-base">
            Manage your orders, plan your events and explore
            everything Rhennie Tasty Shack has to offer.
          </p>

        </div>

        {/* ================= QUICK ACTIONS ================= */}

        <section className="mt-12">

          <div className="mb-6">

            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#D4AF37]">
              Quick Access
            </p>

            <h2 className="mt-2 text-2xl font-bold">
              What would you like to do?
            </h2>

          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">

            {quickLinks.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="group rounded-[28px] border border-white/10 bg-[#111111] p-7 transition duration-300 hover:-translate-y-1 hover:border-[#D4AF37]/40 hover:bg-[#141414]"
              >

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#D4AF37]/20 bg-[#181818] text-xl">
                  {item.icon}
                </div>

                <h3 className="mt-6 text-xl font-bold">
                  {item.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-[#777777]">
                  {item.description}
                </p>

                <div className="mt-6 text-sm font-bold text-[#D4AF37] transition group-hover:text-[#E5C65A]">
                  Explore →
                </div>

              </Link>
            ))}

          </div>

        </section>

        {/* ================= ORDERS CTA ================= */}

        <section className="mt-10 rounded-[30px] border border-[#D4AF37]/20 bg-gradient-to-br from-[#17150d] to-[#101010] p-7 sm:p-9">

          <div className="flex flex-col gap-7 md:flex-row md:items-center md:justify-between">

            <div>

              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#D4AF37]">
                Your Orders
              </p>

              <h2 className="mt-3 text-2xl font-bold sm:text-3xl">
                Keep track of every order.
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-6 text-[#888888]">
                Check your order status, delivery progress and
                previous catering requests from one place.
              </p>

            </div>

            <Link
              href="/orders"
              className="inline-flex shrink-0 items-center justify-center rounded-full bg-[#D4AF37] px-7 py-3.5 text-sm font-bold text-black transition hover:bg-[#E5C65A]"
            >
              View My Orders →
            </Link>

          </div>

        </section>

        {/* ================= EVENT CONCIERGE ================= */}

        <section className="mt-8 rounded-[30px] border border-white/10 bg-[#111111] p-7 sm:p-9">

          <div className="flex flex-col gap-7 md:flex-row md:items-center md:justify-between">

            <div>

              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#D4AF37]">
                Event Concierge
              </p>

              <h2 className="mt-3 text-2xl font-bold sm:text-3xl">
                Planning something special?
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-6 text-[#888888]">
                Tell us about your event and our team will help
                create a premium catering experience tailored to you.
              </p>

            </div>

            <Link
              href="/client-portal/event-concierge"
              className="inline-flex shrink-0 items-center justify-center rounded-full border border-[#D4AF37]/50 px-7 py-3.5 text-sm font-bold text-[#D4AF37] transition hover:bg-[#D4AF37] hover:text-black"
            >
              Plan My Event →
            </Link>

          </div>

        </section>

        {/* ================= MEAL SUBSCRIPTION ================= */}

        <section className="mt-8 rounded-[30px] border border-white/10 bg-[#111111] p-7 sm:p-9">

          <div className="flex flex-col gap-7 md:flex-row md:items-center md:justify-between">

            <div>

              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#D4AF37]">
                Meal Subscription
              </p>

              <h2 className="mt-3 text-2xl font-bold sm:text-3xl">
                Eat better. Every day.
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-6 text-[#888888]">
                Enjoy freshly prepared meals delivered according to
                a schedule that works for you.
              </p>

            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:shrink-0">
              <Link
                href="/client-portal/subscriptions?plan=weekly-plan"
                className="inline-flex items-center justify-center rounded-full bg-[#D4AF37] px-7 py-3.5 text-sm font-bold text-black transition hover:bg-[#E5C65A]"
              >
                Build Meal Plan →
              </Link>

              <Link
                href="/client-portal/my-subscriptions"
                className="inline-flex items-center justify-center rounded-full border border-[#D4AF37]/50 px-7 py-3.5 text-sm font-bold text-[#D4AF37] transition hover:bg-[#D4AF37] hover:text-black"
              >
                My Subscriptions
              </Link>
            </div>

          </div>

        </section>

        {/* ================= HELP ================= */}

        <section className="mt-12 text-center">

          <p className="text-sm text-[#666666]">
            Need help with something?
          </p>

          <a
            href="https://wa.me/2348121577759?text=Hello%20Rhennie%20Tasty%20Shack,%20I%20need%20help%20with%20my%20client%20portal."
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex rounded-full bg-[#D4AF37] px-7 py-3.5 text-sm font-bold text-black transition hover:bg-[#E5C65A]"
          >
            Chat With Us →
          </a>

        </section>

      </div>

    </main>
  );
}
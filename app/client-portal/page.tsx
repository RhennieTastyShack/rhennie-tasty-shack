"use client";

import Link from "next/link";

const stats = [
  {
    title: "Active Orders",
    value: "2",
    description: "Orders currently in progress",
    href: "/client-portal/orders",
  },
  {
    title: "Pending Quotations",
    value: "1",
    description: "Awaiting your approval",
    href: "/client-portal/quotations",
  },
  {
    title: "Event Requests",
    value: "3",
    description: "Consultations in progress",
    href: "/client-portal/event-concierge",
  },
  {
    title: "Favourite Meals",
    value: "12",
    description: "Saved for quick ordering",
    href: "/client-portal/favourites",
  },
];

const quickActions = [
  {
    title: "Start Consultation",
    href: "/client-portal/event-concierge",
  },
  {
    title: "Browse Menu",
    href: "/menu",
  },
  {
    title: "View Orders",
    href: "/client-portal/orders",
  },
  {
    title: "My Quotations",
    href: "/client-portal/quotations",
  },
];

export default function ClientPortalDashboard() {
  return (
    <div className="space-y-10">

      {/* Welcome Banner */}

      <section className="rounded-[32px] border border-[#D4AF37]/20 bg-gradient-to-r from-[#171717] to-[#101010] p-10">

        <p className="text-[#D4AF37] uppercase tracking-[0.3em] text-sm">
          Client Portal
        </p>

        <h1 className="mt-4 text-5xl font-bold text-white">
          Welcome Back 👋
        </h1>

        <p className="mt-5 max-w-2xl text-lg text-[#B8B8B8]">
          Manage your food orders, celebrations, quotations and
          concierge requests from one beautiful dashboard.
        </p>

      </section>

      {/* Statistics */}

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

        {stats.map((item) => (

          <Link
            key={item.title}
            href={item.href}
            className="rounded-[24px] border border-[#D4AF37]/10 bg-[#171717] p-8 transition duration-300 hover:-translate-y-1 hover:border-[#D4AF37] hover:shadow-2xl"
          >

            <h3 className="text-[#B8B8B8]">
              {item.title}
            </h3>

            <p className="mt-4 text-5xl font-bold text-[#D4AF37]">
              {item.value}
            </p>

            <p className="mt-4 text-sm text-[#8F8F8F]">
              {item.description}
            </p>

          </Link>

        ))}

      </section>

      {/* Quick Actions */}

      <section className="rounded-[32px] border border-[#D4AF37]/10 bg-[#171717] p-8">

        <h2 className="text-3xl font-bold">
          Quick Actions
        </h2>

        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">

          {quickActions.map((action) => (

            <Link
              key={action.title}
              href={action.href}
              className="rounded-2xl bg-[#111111] p-6 transition hover:bg-[#D4AF37] hover:text-black"
            >
              <h3 className="text-xl font-semibold">
                {action.title}
              </h3>
            </Link>

          ))}

        </div>

      </section>

      {/* Recent Activity */}

      <section className="rounded-[32px] border border-[#D4AF37]/10 bg-[#171717] p-8">

        <h2 className="text-3xl font-bold">
          Recent Activity
        </h2>

        <div className="mt-8 space-y-5">

          <div className="rounded-xl bg-[#111111] p-5">
            ✅ Wedding consultation submitted successfully.
          </div>

          <div className="rounded-xl bg-[#111111] p-5">
            📦 Lunch order confirmed.
          </div>

          <div className="rounded-xl bg-[#111111] p-5">
            📄 Quotation ready for review.
          </div>

        </div>

      </section>

    </div>
  );
}
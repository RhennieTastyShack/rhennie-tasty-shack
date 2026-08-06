import Link from "next/link";

const cards = [
  {
    title: "Event Concierge",
    description: "Plan your next event and submit a consultation.",
    href: "/client-portal/event-concierge",
  },
  {
    title: "Orders",
    description: "Track your current and previous orders.",
    href: "/client-portal/orders",
  },
  {
    title: "Quotations",
    description: "View and manage your quotations.",
    href: "/client-portal/quotations",
  },
  {
    title: "Profile",
    description: "Manage your personal information.",
    href: "/client-portal/profile",
  },
];

export default function ClientPortalPage() {
  return (
    <main className="min-h-screen bg-[#0B0B0B] px-6 py-12 text-white">
      <div className="mx-auto max-w-7xl">
        <span className="rounded-full border border-[#D4AF37]/20 bg-[#171717] px-4 py-2 text-xs uppercase tracking-[0.3em] text-[#D4AF37]">
          Client Portal
        </span>

        <h1 className="mt-6 text-5xl font-bold">
          Welcome to your Dashboard
        </h1>

        <p className="mt-4 max-w-2xl text-[#B8B8B8]">
          Manage your consultations, quotations, orders and account from one
          place.
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className="rounded-3xl border border-[#D4AF37]/10 bg-[#171717] p-6 transition hover:border-[#D4AF37]"
            >
              <h2 className="text-2xl font-semibold text-white">
                {card.title}
              </h2>

              <p className="mt-3 text-sm leading-7 text-[#B8B8B8]">
                {card.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
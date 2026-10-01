import Link from "next/link";

const services = [
  {
    title: "Event Catering",
    description:
      "Full catering for celebrations, gatherings and special occasions.",
  },
  {
    title: "Corporate Catering",
    description:
      "Meetings, conferences, office lunches and professional events.",
  },
  {
    title: "Private Celebrations",
    description:
      "Birthdays, weddings and intimate occasions with curated menus.",
  },
  {
    title: "Large Orders",
    description:
      "Generous portions and food boxes for bigger guest lists.",
  },
];

export default function EventConciergePage() {
  return (
    <main className="min-h-screen bg-[#FAF8F4] text-[#171717]">
      <section className="relative overflow-hidden bg-[#080808] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.12),transparent_55%)]" />

        <div className="relative mx-auto max-w-7xl px-5 py-20 sm:px-6 md:px-8 md:py-28">
          <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-[#D4AF37]">
            Event Concierge
          </p>

          <h1 className="mt-5 max-w-3xl font-serif text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Exceptional food for unforgettable occasions.
          </h1>

          <p className="mt-5 max-w-2xl text-sm leading-7 text-white/65 sm:text-base">
            Catering, consultations and quotations — planned with care for
            birthdays, weddings, corporate events and private celebrations.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/event-concierge/request"
              className="inline-flex min-h-[52px] items-center justify-center rounded-full bg-[#D4AF37] px-8 text-sm font-bold text-black transition hover:bg-[#E5C65A]"
            >
              Request a Quote
            </Link>
            <Link
              href="/client-portal/event-concierge"
              className="inline-flex min-h-[52px] items-center justify-center rounded-full border border-white/30 px-8 text-sm font-bold text-white transition hover:border-[#D4AF37] hover:text-[#D4AF37]"
            >
              Open Event Concierge
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-6 md:px-8 md:py-20">
        <div className="max-w-2xl">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#D4AF37]">
            What we cover
          </p>
          <h2 className="mt-3 font-serif text-3xl font-bold sm:text-4xl">
            One destination for catering.
          </h2>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => (
            <article
              key={service.title}
              className="rounded-[24px] border border-black/8 bg-white p-7"
            >
              <h3 className="text-lg font-bold">{service.title}</h3>
              <p className="mt-3 text-sm leading-6 text-black/55">
                {service.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-20 sm:px-6 md:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          <Link
            href="/event-concierge/request"
            className="rounded-[24px] border border-black/8 bg-white p-7 transition hover:border-[#D4AF37]/40"
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#D4AF37]">
              Quote
            </p>
            <h3 className="mt-3 text-xl font-bold">Request a Quote</h3>
            <p className="mt-2 text-sm leading-6 text-black/55">
              Share your event details and preferred menu direction.
            </p>
          </Link>

          <Link
            href="/client-portal/event-concierge"
            className="rounded-[24px] border border-black/8 bg-white p-7 transition hover:border-[#D4AF37]/40"
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#D4AF37]">
              Consult
            </p>
            <h3 className="mt-3 text-xl font-bold">Event Consultation</h3>
            <p className="mt-2 text-sm leading-6 text-black/55">
              Review quotations and continue planning in your portal.
            </p>
          </Link>

          <Link
            href="/menu?category=food-boxes"
            className="rounded-[24px] border border-black/8 bg-white p-7 transition hover:border-[#D4AF37]/40"
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#D4AF37]">
              Browse
            </p>
            <h3 className="mt-3 text-xl font-bold">Food Boxes & Menu</h3>
            <p className="mt-2 text-sm leading-6 text-black/55">
              Explore curated boxes and meals while you plan.
            </p>
          </Link>
        </div>
      </section>
    </main>
  );
}

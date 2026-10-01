import Link from "next/link";

const faqs = [
  {
    q: "How do I place an order?",
    a: "Browse the Menu, add meals to your cart, then checkout. You can choose Ride with 701 delivery, your own rider, or pickup.",
  },
  {
    q: "Where can I find Food Boxes?",
    a: "Food Boxes live under Menu. Open Menu and select the Food Boxes collection.",
  },
  {
    q: "How do I plan catering or an event?",
    a: "Use Event Concierge to request a quote or open your Event Concierge portal for consultations and quotations.",
  },
  {
    q: "How do I get help with an existing order?",
    a: "Check Orders in your account, or contact us on WhatsApp / phone with your order details.",
  },
  {
    q: "What if I have a delivery question?",
    a: "Delivery timing and fees depend on your address and fulfilment choice. Message Customer Support if something looks wrong after checkout.",
  },
];

export default function CustomerCarePage() {
  return (
    <main className="min-h-screen bg-[#FAF8F4] text-[#171717]">
      <section className="border-b border-black/5 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 md:px-8 md:py-20">
          <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-[#D4AF37]">
            Customer Support
          </p>
          <h1 className="mt-4 max-w-2xl font-serif text-4xl font-bold tracking-tight sm:text-5xl">
            We’re here to help.
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-black/55 sm:text-base">
            Contact, order help and common questions — in one calm place.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-6 md:px-8">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <CareCard
            title="WhatsApp Support"
            body="Chat with the team for quick order and menu questions."
            href="https://wa.me/2348121577759"
            cta="Chat on WhatsApp"
            external
          />
          <CareCard
            title="Call Us"
            body="Speak with Rhennie Tasty Shack directly."
            href="tel:07049180363"
            cta="07049180363"
          />
          <CareCard
            title="Order Help"
            body="Review recent orders or continue in your account."
            href="/orders"
            cta="View orders"
          />
          <CareCard
            title="Event Concierge"
            body="Catering and event planning support."
            href="/event-concierge"
            cta="Plan an event"
          />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-10 sm:px-6 md:px-8">
        <div className="rounded-[28px] border border-black/8 bg-white p-7 sm:p-10">
          <h2 className="font-serif text-2xl font-bold sm:text-3xl">
            Contact details
          </h2>
          <div className="mt-6 grid gap-5 text-sm text-black/65 sm:grid-cols-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/35">
                Email
              </p>
              <a
                href="mailto:mohrhennie567@gmail.com"
                className="mt-2 block break-all transition hover:text-[#D4AF37]"
              >
                mohrhennie567@gmail.com
              </a>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/35">
                Location
              </p>
              <p className="mt-2">Alimosho, Lagos, Nigeria</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/35">
                Quick links
              </p>
              <div className="mt-2 flex flex-col gap-1">
                <Link href="/menu" className="hover:text-[#D4AF37]">
                  Menu
                </Link>
                <Link
                  href="/menu?category=food-boxes"
                  className="hover:text-[#D4AF37]"
                >
                  Food Boxes
                </Link>
                <Link href="/client-portal" className="hover:text-[#D4AF37]">
                  My Account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-20 sm:px-6 md:px-8">
        <h2 className="font-serif text-2xl font-bold sm:text-3xl">FAQs</h2>
        <div className="mt-6 space-y-3">
          {faqs.map((item) => (
            <details
              key={item.q}
              className="group rounded-2xl border border-black/8 bg-white px-5 py-4 open:border-[#D4AF37]/35"
            >
              <summary className="cursor-pointer list-none text-sm font-semibold marker:content-none [&::-webkit-details-marker]:hidden">
                <span className="flex items-center justify-between gap-4">
                  {item.q}
                  <span className="text-[#D4AF37] transition group-open:rotate-45">
                    +
                  </span>
                </span>
              </summary>
              <p className="mt-3 text-sm leading-7 text-black/55">{item.a}</p>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}

function CareCard({
  title,
  body,
  href,
  cta,
  external,
}: {
  title: string;
  body: string;
  href: string;
  cta: string;
  external?: boolean;
}) {
  const className =
    "flex h-full flex-col rounded-[24px] border border-black/8 bg-white p-7 transition duration-300 hover:-translate-y-1 hover:border-[#D4AF37]/35 hover:shadow-[0_16px_36px_rgba(0,0,0,0.05)]";

  const content = (
    <>
      <h3 className="text-lg font-bold">{title}</h3>
      <p className="mt-3 flex-1 text-sm leading-6 text-black/55">{body}</p>
      <span className="mt-6 text-sm font-bold text-[#D4AF37]">{cta} →</span>
    </>
  );

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {content}
    </Link>
  );
}

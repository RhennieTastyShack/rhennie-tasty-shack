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
    a: "Use Event Concierge to request a quote or continue in your Event Concierge portal.",
  },
  {
    q: "How do I get help with an existing order?",
    a: "Check Orders in your account, or contact us on WhatsApp or phone with your order details.",
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
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-12 xl:px-16">
          <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-[#F26A21]">
            Customer Support
          </p>
          <h1 className="mt-4 max-w-2xl font-serif text-4xl font-bold tracking-tight sm:text-5xl">
            We’re here to help.
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-black/55 sm:text-base">
            Order help, delivery questions and WhatsApp support — simply.
          </p>
          <a
            href="https://wa.me/2348121577759"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex min-h-[48px] items-center justify-center rounded-full bg-[#F26A21] px-7 text-sm font-bold text-white transition hover:bg-[#D95512]"
          >
            Chat on WhatsApp
          </a>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-12 xl:px-16">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <CareCard
            title="Order Help"
            body="Review recent orders or continue in your account."
            href="/orders"
            cta="View orders"
          />
          <CareCard
            title="Delivery Help"
            body="Questions about delivery fees, timing or Ride with 701."
            href="/customer-care#delivery"
            cta="Delivery FAQs"
          />
          <CareCard
            title="WhatsApp Support"
            body="Chat with the team for quick order and menu questions."
            href="https://wa.me/2348121577759"
            cta="Open WhatsApp"
            external
          />
          <CareCard
            title="General Enquiries"
            body="Call or email Rhennie Tasty Shack directly."
            href="tel:07049180363"
            cta="07049180363"
          />
        </div>
      </section>

      <section
        id="delivery"
        className="mx-auto w-full max-w-7xl px-4 pb-10 sm:px-6 lg:px-12 xl:px-16"
      >
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
                className="mt-2 block break-all transition hover:text-[#F26A21]"
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
                <Link href="/menu" className="hover:text-[#F26A21]">
                  Menu
                </Link>
                <Link href="/event-concierge" className="hover:text-[#F26A21]">
                  Event Concierge
                </Link>
                <Link href="/client-portal" className="hover:text-[#F26A21]">
                  My Account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6 lg:px-12 xl:px-16">
        <h2 className="font-serif text-2xl font-bold sm:text-3xl">FAQs</h2>
        <div className="mt-6 space-y-3">
          {faqs.map((item) => (
            <details
              key={item.q}
              className="group rounded-2xl border border-black/8 bg-white px-5 py-4 open:border-[#F26A21]/35"
            >
              <summary className="cursor-pointer list-none text-sm font-semibold marker:content-none [&::-webkit-details-marker]:hidden">
                <span className="flex items-center justify-between gap-4">
                  {item.q}
                  <span className="text-[#F26A21] transition group-open:rotate-45">
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
    "flex h-full flex-col rounded-[24px] border border-black/8 bg-white p-7 transition duration-300 hover:-translate-y-1 hover:border-[#F26A21]/35";

  const content = (
    <>
      <h3 className="text-lg font-bold">{title}</h3>
      <p className="mt-3 flex-1 text-sm leading-6 text-black/55">{body}</p>
      <span className="mt-6 text-sm font-bold text-[#F26A21]">{cta} →</span>
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

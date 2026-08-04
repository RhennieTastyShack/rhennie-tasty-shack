"use client";

const faqs = [
  {
    question: "Do you deliver within Lagos?",
    answer:
      "Yes. We deliver across Lagos. Delivery fees depend on your location.",
  },
  {
    question: "How do I place an order?",
    answer:
      "Simply click any 'Order on WhatsApp' button or contact us directly to place your order.",
  },
  {
    question: "Do you cater for weddings and events?",
    answer:
      "Absolutely! We cater for weddings, birthdays, corporate events, conferences, private parties and more.",
  },
  {
    question: "How early should I book catering?",
    answer:
      "We recommend booking at least 3–7 days in advance. Larger events should be booked earlier.",
  },
  {
    question: "Do you offer meal subscriptions?",
    answer:
      "Yes. We provide flexible daily, weekly and monthly meal plans for individuals and businesses.",
  },
];

export default function FAQ() {
  return (
    <section className="bg-[#111111] py-28">
      <div className="max-w-5xl mx-auto px-6">

        <div className="text-center mb-16">

          <span className="inline-block rounded-full border border-[#D4AF37]/20 bg-[#1A1A1A] px-6 py-2 text-sm tracking-[0.3em] text-[#D4AF37]">
            FAQ
          </span>

          <h2 className="text-5xl md:text-6xl font-bold text-white mt-6">
            Frequently Asked Questions
          </h2>

          <p className="text-[#B8B8B8] mt-6 leading-8">
            Everything you need to know before placing your order.
          </p>

        </div>

        <div className="space-y-6">

          {faqs.map((faq) => (
            <div
              key={faq.question}
              className="rounded-3xl border border-[#D4AF37]/15 bg-[#171717] p-8"
            >
              <h3 className="text-2xl font-bold text-white">
                {faq.question}
              </h3>

              <p className="mt-4 leading-8 text-[#B8B8B8]">
                {faq.answer}
              </p>
            </div>
          ))}

        </div>

      </div>
    </section>
  );
}
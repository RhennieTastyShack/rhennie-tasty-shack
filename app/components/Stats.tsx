"use client";

const stats = [
  {
    title: "Premium Quality",
    description: "Prepared with carefully selected ingredients.",
  },
  {
    title: "Fresh Daily",
    description: "Every order is freshly cooked with care.",
  },
  {
    title: "Fast Delivery",
    description: "Reliable delivery for homes, offices and events.",
  },
  {
    title: "Event Catering",
    description: "Weddings, birthdays, corporate events and more.",
  },
];

export default function Stats() {
  return (
    <section className="bg-[#111111] py-24">
      <div className="max-w-7xl mx-auto px-6">

        <div className="text-center mb-16">

          <span className="inline-block rounded-full border border-[#D4AF37]/20 bg-[#1A1A1A] px-6 py-2 text-sm tracking-[0.3em] text-[#D4AF37]">
            WHY WE STAND OUT
          </span>

          <h2 className="mt-6 text-5xl md:text-6xl font-bold text-white">
            Premium Experience
          </h2>

          <p className="mt-6 max-w-3xl mx-auto text-[#B8B8B8] leading-8">
            At Rhennie Tasty Shack, every meal is crafted with passion,
            premium ingredients and exceptional attention to detail.
          </p>

        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">

          {stats.map((stat) => (
            <div
              key={stat.title}
              className="rounded-[30px] border border-[#D4AF37]/15 bg-[#171717] p-8 text-center transition duration-300 hover:-translate-y-2 hover:border-[#D4AF37]"
            >
              <h3 className="text-2xl font-bold text-[#D4AF37]">
                {stat.title}
              </h3>

              <p className="mt-4 text-[#B8B8B8] leading-7">
                {stat.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
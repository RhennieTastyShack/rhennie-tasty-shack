"use client";

export default function MenuHero() {
  return (
    <section className="relative overflow-hidden border-b border-[#F26A21]/20 bg-[#0B0B0B]">
      
      {/* Decorative glow */}
      <div className="pointer-events-none absolute -left-32 top-10 h-72 w-72 rounded-full bg-[#F26A21]/10 blur-[100px]" />

      <div className="pointer-events-none absolute -right-32 bottom-0 h-72 w-72 rounded-full bg-[#F26A21]/10 blur-[100px]" />

      {/* Content */}
      <div className="relative mx-auto max-w-7xl px-5 py-16 text-center sm:px-8 sm:py-20 lg:px-12 lg:py-24">

        {/* Eyebrow */}
        <div className="flex items-center justify-center gap-3">

          <span className="h-px w-8 bg-[#D4AF37] sm:w-12" />

          <span className="text-[9px] font-bold uppercase tracking-[0.35em] text-[#D4AF37] sm:text-[10px] sm:tracking-[0.45em]">
            Rhennie Tasty Shack
          </span>

          <span className="h-px w-8 bg-[#D4AF37] sm:w-12" />

        </div>

        {/* Heading */}
        <h1 className="mt-7 font-serif text-4xl font-bold leading-[0.95] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
          The Menu
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-sm leading-7 text-white/60 sm:text-base">
          Signature meals, Food Boxes and party pots — browse and order with
          ease.
        </p>

        {/* Bottom details */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-3 text-[8px] font-bold uppercase tracking-[0.25em] text-white/40 sm:text-[9px]">

          <span>Premium Ingredients</span>

          <span className="h-1 w-1 rounded-full bg-[#F26A21]" />

          <span>Freshly Prepared</span>

          <span className="h-1 w-1 rounded-full bg-[#F26A21]" />

          <span>Fast Delivery</span>

        </div>

      </div>
    </section>
  );
}
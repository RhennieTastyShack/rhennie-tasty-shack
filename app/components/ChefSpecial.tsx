import Image from "next/image";

export default function ChefSpecial() {
  return (
    <section className="bg-[#111111] py-28">
      <div className="max-w-7xl mx-auto px-6">

        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Image */}
          <div className="relative">

            <div className="absolute -inset-6 bg-[#D4AF37]/10 blur-3xl rounded-full"></div>

            <Image
              src="/images/burger.jpg"
              alt="Chef's Special"
              width={700}
              height={700}
              className="relative rounded-[35px] border border-[#D4AF37]/20 shadow-2xl object-cover"
            />

          </div>

          {/* Content */}
          <div>

            <span className="inline-block rounded-full border border-[#D4AF37]/20 bg-[#1A1A1A] px-5 py-2 text-sm tracking-[0.25em] text-[#D4AF37]">
              CHEF'S RECOMMENDATION
            </span>

            <h2 className="mt-6 text-5xl font-bold text-white leading-tight">
              A Signature Experience
              <br />
              <span className="text-[#D4AF37]">
                Crafted Just for You
              </span>
            </h2>

            <p className="mt-8 text-lg leading-8 text-[#B8B8B8]">
              Every dish is thoughtfully prepared using fresh ingredients,
              rich flavours and careful attention to detail. Whether you're
              ordering for yourself, your family or a special event, our goal
              is to serve meals that people remember.
            </p>

            <div className="mt-10 flex flex-wrap gap-5">

              <div className="glass rounded-2xl px-6 py-5">
                🍽️ Fresh Ingredients
              </div>

              <div className="glass rounded-2xl px-6 py-5">
                ⭐ Premium Quality
              </div>

              <div className="glass rounded-2xl px-6 py-5">
                🚚 Fast Delivery
              </div>

            </div>

            <a
              href="https://wa.me/2348121577759"
              target="_blank"
              rel="noopener noreferrer"
              className="gold-btn inline-block mt-10 px-10 py-4"
            >
              Order This Special
            </a>

          </div>

        </div>

      </div>
    </section>
  );
}
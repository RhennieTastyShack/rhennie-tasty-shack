import Image from "next/image";

const features = [
  {
    icon: "🍽️",
    title: "Fresh Ingredients",
  },
  {
    icon: "⭐",
    title: "Premium Quality",
  },
  {
    icon: "🚚",
    title: "Fast Delivery",
  },
];

export default function ChefSpecial() {
  return (
    <section
      className="
        overflow-hidden
        bg-[#111111]
        px-5
        py-20
        sm:px-6
        sm:py-24
        lg:px-8
        lg:py-28
      "
    >
      <div className="mx-auto max-w-7xl">
        <div
          className="
            grid
            items-center
            gap-12
            lg:grid-cols-2
            lg:gap-16
            xl:gap-20
          "
        >
          {/* =====================================================
              IMAGE
          ====================================================== */}

          <div className="relative">
            {/* GOLD GLOW */}
            <div
              className="
                pointer-events-none
                absolute
                -inset-5
                rounded-full
                bg-[#D4AF37]/10
                blur-3xl
                sm:-inset-6
              "
            />

            <div
              className="
                relative
                aspect-square
                w-full
                overflow-hidden
                rounded-[28px]
                border
                border-[#D4AF37]/20
                bg-[#181818]
                shadow-2xl
                sm:rounded-[35px]
              "
            >
              <Image
                src="/images/burger.jpg"
                alt="Chef's Special"
                fill
                sizes="
                  (max-width: 1023px) 100vw,
                  50vw
                "
                className="
                  object-cover
                  transition-transform
                  duration-700
                  ease-out
                  hover:scale-[1.03]
                "
              />

              {/* IMAGE OVERLAY */}
              <div
                className="
                  pointer-events-none
                  absolute
                  inset-0
                  bg-gradient-to-t
                  from-black/30
                  via-transparent
                  to-transparent
                "
              />
            </div>
          </div>

          {/* =====================================================
              CONTENT
          ====================================================== */}

          <div className="min-w-0">
            {/* LABEL */}

            <span
              className="
                inline-flex
                max-w-full
                items-center
                rounded-full
                border
                border-[#D4AF37]/20
                bg-[#1A1A1A]
                px-4
                py-2.5
                text-[9px]
                font-bold
                uppercase
                tracking-[0.2em]
                text-[#D4AF37]
                sm:px-5
                sm:text-[10px]
                sm:tracking-[0.25em]
              "
            >
              Chef&apos;s Recommendation
            </span>

            {/* HEADING */}

            <h2
              className="
                mt-6
                max-w-2xl
                break-words
                text-4xl
                font-bold
                leading-[1.05]
                tracking-tight
                text-white
                sm:text-5xl
                lg:text-[52px]
                xl:text-6xl
              "
            >
              A Signature Experience
              <span className="mt-1 block text-[#D4AF37]">
                Crafted Just for You
              </span>
            </h2>

            {/* DESCRIPTION */}

            <p
              className="
                mt-6
                max-w-2xl
                break-words
                text-base
                leading-7
                text-[#B8B8B8]
                sm:mt-7
                sm:text-lg
                sm:leading-8
              "
            >
              Every dish is thoughtfully prepared using fresh
              ingredients, rich flavours and careful attention to
              detail. Whether you&apos;re ordering for yourself,
              your family or a special event, our goal is to serve
              meals that people remember.
            </p>

            {/* =================================================
                FEATURE CARDS
            ================================================== */}

            <div
              className="
                mt-8
                grid
                grid-cols-1
                gap-3
                sm:mt-10
                sm:grid-cols-3
                sm:gap-4
              "
            >
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="
                    flex
                    min-h-[96px]
                    items-center
                    gap-3
                    rounded-2xl
                    border
                    border-white/10
                    bg-white/[0.05]
                    px-5
                    py-5
                    backdrop-blur-md
                    transition-all
                    duration-300
                    hover:-translate-y-1
                    hover:border-[#D4AF37]/30
                    hover:bg-white/[0.07]
                    sm:flex-col
                    sm:items-start
                    sm:justify-center
                    sm:px-5
                    sm:py-5
                    lg:px-5
                    xl:px-6
                  "
                >
                  <span
                    className="
                      shrink-0
                      text-xl
                      leading-none
                    "
                    aria-hidden="true"
                  >
                    {feature.icon}
                  </span>

                  <span
                    className="
                      break-words
                      text-sm
                      font-semibold
                      leading-5
                      text-white/90
                    "
                  >
                    {feature.title}
                  </span>
                </div>
              ))}
            </div>

            {/* =================================================
                CTA
            ================================================== */}

            <div className="mt-8 sm:mt-10">
              <a
                href="https://wa.me/2348121577759"
                target="_blank"
                rel="noopener noreferrer"
                className="
                  inline-flex
                  min-h-[50px]
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-full
                  bg-[#D4AF37]
                  px-7
                  py-3.5
                  text-sm
                  font-bold
                  text-[#111111]
                  shadow-[0_12px_35px_rgba(212,175,55,0.18)]
                  transition-all
                  duration-300
                  hover:-translate-y-0.5
                  hover:bg-[#E2C25A]
                  hover:shadow-[0_16px_40px_rgba(212,175,55,0.25)]
                  focus-visible:outline
                  focus-visible:outline-2
                  focus-visible:outline-offset-4
                  focus-visible:outline-[#D4AF37]
                  sm:w-auto
                  sm:px-8
                "
              >
                Order This Special

                <span aria-hidden="true">
                  →
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
"use client";

import Image from "next/image";
import Link from "next/link";

const services = [
  {
    title: "Corporate Catering",
    image: "/images/catering-platter.jpeg",
    badge: "Corporate",
    description:
      "Premium catering for meetings, conferences, seminars, trainings and corporate events.",
    eventType: "Corporate Catering",
  },
  {
    title: "Luxury Food Boxes",
    image: "/images/food-box-2.png",
    badge: "Most Popular",
    description:
      "Beautifully curated food boxes for birthdays, bridal showers, anniversaries and celebrations.",
    eventType: "Luxury Food Boxes",
  },
  {
    title: "Premium Lunch Packs",
    image: "/images/jollofrice-turkey.jpeg",
    badge: "Daily Orders",
    description:
      "Freshly prepared lunch packs for offices, schools, businesses and private events.",
    eventType: "Premium Lunch Packs",
  },
];

export default function Catering() {
  return (
    <section
      id="catering"
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
        {/* =====================================================
            HEADING
        ====================================================== */}

        <div className="mx-auto mb-12 max-w-4xl text-center sm:mb-14 lg:mb-16">
          <span
            className="
              inline-flex
              items-center
              justify-center
              rounded-full
              border
              border-[#D4AF37]/30
              bg-[#1A1A1A]
              px-4
              py-2.5
              text-[9px]
              font-bold
              uppercase
              tracking-[0.25em]
              text-[#D4AF37]
              sm:px-5
              sm:text-[10px]
              sm:tracking-[0.3em]
            "
          >
            Luxury Catering
          </span>

          <h2
            className="
              mt-6
              text-3xl
              font-extrabold
              leading-tight
              tracking-tight
              text-white
              sm:text-4xl
              lg:text-5xl
            "
          >
            Catering Crafted For
            <span className="block text-[#D4AF37]">
              Every Occasion
            </span>
          </h2>

          <p
            className="
              mx-auto
              mt-5
              max-w-3xl
              text-sm
              leading-7
              text-[#B8B8B8]
              sm:mt-6
              sm:text-base
              sm:leading-8
              lg:text-lg
            "
          >
            Whether you&apos;re hosting an intimate gathering or a
            grand celebration, Rhennie Tasty Shack delivers
            exceptional meals and unforgettable experiences tailored
            to your event.
          </p>
        </div>

        {/* =====================================================
            SERVICE CARDS
        ====================================================== */}

        <div
          className="
            grid
            grid-cols-1
            items-stretch
            gap-6
            md:grid-cols-2
            lg:gap-7
            xl:grid-cols-3
          "
        >
          {services.map((service) => {
            const orderLink = `/event-concierge/request?service=${encodeURIComponent(
              service.eventType
            )}`;

            return (
              <article
                key={service.title}
                className="
                  group
                  flex
                  h-full
                  min-w-0
                  flex-col
                  overflow-hidden
                  rounded-[28px]
                  border
                  border-[#D4AF37]/15
                  bg-[#171717]
                  shadow-[0_15px_45px_rgba(0,0,0,0.22)]
                  transition-all
                  duration-500
                  hover:-translate-y-2
                  hover:border-[#D4AF37]/50
                  hover:shadow-[0_25px_65px_rgba(0,0,0,0.32)]
                "
              >
                {/* =============================================
                    IMAGE
                ============================================== */}

                <div
                  className="
                    relative
                    aspect-[4/3]
                    w-full
                    shrink-0
                    overflow-hidden
                    bg-[#202020]
                  "
                >
                  <Image
                    src={service.image}
                    alt={service.title}
                    fill
                    sizes="
                      (max-width: 767px) 100vw,
                      (max-width: 1279px) 50vw,
                      33vw
                    "
                    className="
                      object-cover
                      transition-transform
                      duration-700
                      ease-out
                      group-hover:scale-105
                    "
                  />

                  <div
                    className="
                      pointer-events-none
                      absolute
                      inset-0
                      bg-gradient-to-t
                      from-black/55
                      via-black/5
                      to-transparent
                    "
                  />

                  {/* BADGE */}

                  <span
                    className="
                      absolute
                      left-5
                      top-5
                      inline-flex
                      items-center
                      rounded-full
                      bg-[#D4AF37]
                      px-3.5
                      py-2
                      text-[9px]
                      font-extrabold
                      uppercase
                      tracking-[0.14em]
                      text-black
                      shadow-lg
                      sm:left-6
                      sm:top-6
                      sm:px-4
                    "
                  >
                    {service.badge}
                  </span>
                </div>

                {/* =============================================
                    CARD CONTENT
                ============================================== */}

                <div
                  className="
                    flex
                    flex-1
                    flex-col
                    px-5
                    pb-6
                    pt-6
                    sm:px-6
                    sm:pb-7
                    sm:pt-7
                    lg:px-7
                    lg:pb-8
                    lg:pt-7
                  "
                >
                  <h3
                    className="
                      break-words
                      pr-1
                      text-xl
                      font-bold
                      leading-tight
                      text-white
                      sm:text-2xl
                    "
                  >
                    {service.title}
                  </h3>

                  <p
                    className="
                      mt-4
                      min-h-[84px]
                      break-words
                      pr-1
                      text-sm
                      leading-7
                      text-[#B8B8B8]
                      sm:text-[15px]
                    "
                  >
                    {service.description}
                  </p>

                  {/* ===========================================
                      ORDER AREA
                  ============================================ */}

                  <div
                    className="
                      mt-auto
                      border-t
                      border-white/[0.08]
                      pt-5
                      sm:pt-6
                    "
                  >
                    <Link
                      href={orderLink}
                      aria-label={`Order ${service.title} on the app`}
                      className="
                        inline-flex
                        min-h-[50px]
                        w-full
                        items-center
                        justify-center
                        gap-2
                        rounded-full
                        bg-[#D4AF37]
                        px-5
                        py-3
                        text-center
                        text-sm
                        font-extrabold
                        text-black
                        shadow-[0_10px_30px_rgba(212,175,55,0.16)]
                        transition-all
                        duration-300
                        hover:-translate-y-0.5
                        hover:bg-[#E2C25A]
                        hover:shadow-[0_15px_35px_rgba(212,175,55,0.24)]
                        focus-visible:outline
                        focus-visible:outline-2
                        focus-visible:outline-offset-2
                        focus-visible:outline-[#D4AF37]
                        sm:px-6
                      "
                    >
                      Order on App

                      <span aria-hidden="true">
                        →
                      </span>
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* =====================================================
            EVENT CONCIERGE CTA
        ====================================================== */}

        <div
          className="
            mx-auto
            mt-12
            max-w-3xl
            border-t
            border-white/[0.08]
            pt-8
            text-center
            sm:mt-14
            sm:pt-10
          "
        >
          <p
            className="
              text-sm
              leading-7
              text-white/50
              sm:text-base
            "
          >
            Need something more tailored? Tell us about your event
            and we&apos;ll prepare a personalised quotation for you.
          </p>

          <Link
            href="/event-concierge/request"
            className="
              mt-5
              inline-flex
              min-h-[48px]
              items-center
              justify-center
              gap-2
              rounded-full
              border
              border-[#D4AF37]/30
              px-6
              py-3
              text-sm
              font-bold
              text-[#D4AF37]
              transition-all
              duration-300
              hover:border-[#D4AF37]
              hover:bg-[#D4AF37]
              hover:text-black
            "
          >
            Event Concierge

            <span aria-hidden="true">
              →
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const videos = [
  "/videos/hero1.mp4",
  "/videos/hero2.mp4",
  "/videos/hero3.mp4",
];

export default function Hero() {
  const [currentVideo, setCurrentVideo] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentVideo((prev) => (prev + 1) % videos.length);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-[calc(100svh-76px)] w-full overflow-hidden bg-black sm:min-h-[calc(100svh-80px)] lg:min-h-[calc(100svh-96px)]">

      {/* =====================================================
          BACKGROUND VIDEOS
      ====================================================== */}

      {videos.map((video, index) => (
        <video
          key={video}
          autoPlay
          muted
          loop
          playsInline
          preload={index === 0 ? "auto" : "metadata"}
          className={`absolute inset-0 h-full w-full object-cover transition-all duration-[1400ms] ease-out ${
            currentVideo === index
              ? "scale-105 opacity-100"
              : "scale-100 opacity-0"
          }`}
          aria-hidden="true"
        >
          <source src={video} type="video/mp4" />
        </video>
      ))}

      {/* =====================================================
          CINEMATIC OVERLAY
      ====================================================== */}

      {/* Main dark overlay */}
      <div className="absolute inset-0 bg-black/45" />

      {/* Stronger left side for typography */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-black/10" />

      {/* Mobile-specific readability overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-black/75 sm:hidden" />

      {/* Bottom cinematic fade */}
      <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-black via-black/40 to-transparent" />

      {/* Orange atmosphere */}
      <div className="pointer-events-none absolute -left-32 top-1/4 h-72 w-72 rounded-full bg-[#F26A21]/10 blur-[110px]" />

      {/* =====================================================
          HERO CONTENT
      ====================================================== */}

      <div className="relative z-20 flex min-h-[calc(100svh-76px)] items-center px-5 py-16 sm:min-h-[calc(100svh-80px)] sm:px-8 sm:py-20 lg:min-h-[calc(100svh-96px)] lg:px-12 xl:px-20">

        <div className="mx-auto w-full max-w-7xl">

          <div className="max-w-4xl">

            {/* =================================================
                BRAND EYEBROW
            ================================================== */}

            <div className="mb-5 flex items-center gap-3 sm:mb-7">

              <span className="h-px w-8 bg-[#F26A21] sm:w-14" />

              <span className="text-[8px] font-bold uppercase tracking-[0.32em] text-white/85 sm:text-[10px] sm:tracking-[0.45em]">
                Rhennie Tasty Shack
              </span>

            </div>

            {/* =================================================
                MAIN HEADING
            ================================================== */}

            <h1 className="font-serif font-bold leading-[0.88] tracking-[-0.045em] text-white">

              <span className="block text-[3.4rem] sm:text-6xl md:text-7xl lg:text-8xl xl:text-[7.5rem]">
                Crafted for
              </span>

              <span className="mt-2 block text-[3.5rem] text-[#F26A21] sm:mt-3 sm:text-6xl md:text-7xl lg:text-8xl xl:text-[7.5rem]">
                Exceptional
              </span>

              <span className="block text-[3.5rem] text-[#F26A21] sm:text-6xl md:text-7xl lg:text-8xl xl:text-[7.5rem]">
                Taste.
              </span>

            </h1>

            {/* =================================================
                DESCRIPTION
            ================================================== */}

            <p className="mt-6 max-w-xl text-[13px] leading-6 text-white/80 sm:mt-8 sm:text-base sm:leading-8 lg:text-lg">
              Freshly prepared meals made with premium ingredients,
              unforgettable flavours and exceptional service —
              delivered straight to your doorstep.
            </p>

            {/* =================================================
                ACTION BUTTONS
            ================================================== */}

            <div className="mt-7 flex w-full flex-col gap-3 sm:mt-10 sm:flex-row sm:items-center">

              <Link
                href="/menu"
                className="inline-flex min-h-[52px] w-full items-center justify-center rounded-full bg-[#F26A21] px-7 text-[13px] font-bold text-white shadow-[0_15px_45px_rgba(242,106,33,0.28)] transition-all duration-300 hover:-translate-y-1 hover:bg-[#D95512] hover:shadow-[0_20px_55px_rgba(242,106,33,0.35)] sm:w-auto sm:px-8 sm:text-sm"
              >
                Order Your Meal
                <span className="ml-2">→</span>
              </Link>

              <Link
                href="/menu"
                className="inline-flex min-h-[52px] w-full items-center justify-center rounded-full border border-white/60 bg-black/20 px-7 text-[13px] font-bold text-white backdrop-blur-md transition-all duration-300 hover:border-white hover:bg-white hover:text-black sm:w-auto sm:px-8 sm:text-sm"
              >
                Explore Our Menu
              </Link>

            </div>

            {/* =================================================
                PREMIUM DETAILS
            ================================================== */}

            <div className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-2 text-[8px] font-semibold uppercase tracking-[0.15em] text-white/60 sm:mt-10 sm:gap-x-7 sm:text-[10px]">

              <span>Premium Ingredients</span>

              <span className="h-1 w-1 rounded-full bg-[#F26A21]" />

              <span>Freshly Prepared</span>

              <span className="h-1 w-1 rounded-full bg-[#F26A21]" />

              <span>Fast Delivery</span>

            </div>

          </div>

        </div>
      </div>

      {/* =====================================================
          VIDEO INDICATORS
      ====================================================== */}

      <div className="absolute bottom-7 right-5 z-30 flex items-center gap-2 sm:bottom-10 sm:right-8 lg:right-12">

        <span className="mr-1 hidden text-[9px] font-bold uppercase tracking-[0.3em] text-white/60 sm:inline">
          0{currentVideo + 1}
        </span>

        {videos.map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => setCurrentVideo(index)}
            aria-label={`Show hero video ${index + 1}`}
            aria-current={currentVideo === index}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              currentVideo === index
                ? "w-9 bg-[#F26A21]"
                : "w-4 bg-white/40 hover:bg-white"
            }`}
          />
        ))}

      </div>

      {/* =====================================================
          MOBILE SCROLL INDICATOR
      ====================================================== */}

      <div className="absolute bottom-7 left-1/2 z-30 -translate-x-1/2 md:hidden">

        <div className="flex flex-col items-center gap-2">

          <span className="text-[7px] font-bold uppercase tracking-[0.35em] text-white/50">
            Scroll
          </span>

          <div className="flex h-8 w-5 justify-center rounded-full border border-white/40 p-1">

            <div className="h-1.5 w-1 rounded-full bg-[#F26A21] animate-bounce" />

          </div>

        </div>

      </div>

      {/* =====================================================
          DESKTOP SCROLL INDICATOR
      ====================================================== */}

      <div className="absolute bottom-9 left-1/2 z-30 hidden -translate-x-1/2 md:block">

        <div className="flex flex-col items-center gap-3">

          <span className="text-[8px] font-bold uppercase tracking-[0.35em] text-white/60">
            Scroll
          </span>

          <div className="flex h-10 w-6 justify-center rounded-full border border-white/50 p-1">

            <div className="h-2 w-1 rounded-full bg-[#F26A21] animate-bounce" />

          </div>

        </div>

      </div>

      {/* =====================================================
          DESKTOP SIDE BRAND DETAIL
      ====================================================== */}

      <div className="absolute right-6 top-1/2 z-20 hidden -translate-y-1/2 lg:block">

        <div className="flex items-center gap-3 [writing-mode:vertical-rl]">

          <span className="text-[9px] font-bold uppercase tracking-[0.35em] text-white/50">
            Luxury Dining At Your Doorstep
          </span>

          <span className="h-14 w-px bg-[#F26A21]/70" />

        </div>

      </div>

      {/* =====================================================
          MOBILE BRAND DETAIL
      ====================================================== */}

      <div className="absolute right-3 top-1/2 z-20 -translate-y-1/2 lg:hidden">

        <div className="flex items-center gap-2 [writing-mode:vertical-rl]">

          <span className="text-[7px] font-bold uppercase tracking-[0.3em] text-white/40">
            Premium Taste • Fast Delivery
          </span>

          <span className="h-10 w-px bg-[#F26A21]/60" />

        </div>

      </div>

    </section>
  );
}
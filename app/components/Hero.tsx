"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const videos = [
  "/videos/hero1.mp4",
  "/videos/hero2.mp4",
  "/videos/hero3.mp4",
];

function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function shouldLimitMedia() {
  if (typeof window === "undefined") return true;
  if (prefersReducedMotion()) return true;
  const connection = (
    navigator as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string };
    }
  ).connection;
  if (connection?.saveData) return true;
  if (
    connection?.effectiveType === "slow-2g" ||
    connection?.effectiveType === "2g"
  ) {
    return true;
  }
  return window.matchMedia("(max-width: 640px)").matches;
}

export default function Hero() {
  const [currentVideo, setCurrentVideo] = useState(0);
  const [limitMedia, setLimitMedia] = useState(true);
  const [inView, setInView] = useState(true);
  const sectionRef = useRef<HTMLElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    setLimitMedia(shouldLimitMedia());
  }, []);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => setInView(Boolean(entry?.isIntersecting)),
      { threshold: 0.15 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // On phones / save-data: keep a single looping video. Desktop rotates.
  useEffect(() => {
    if (limitMedia) return;
    const interval = window.setInterval(() => {
      setCurrentVideo((prev) => (prev + 1) % videos.length);
    }, 8000);
    return () => window.clearInterval(interval);
  }, [limitMedia]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (inView) {
      void el.play().catch(() => {
        /* autoplay may be blocked; muted + playsInline covers most devices */
      });
    } else {
      el.pause();
    }
  }, [currentVideo, inView, limitMedia]);

  const activeSrc = videos[limitMedia ? 0 : currentVideo];

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[calc(100svh-76px)] w-full overflow-hidden bg-black sm:min-h-[calc(100svh-80px)] lg:min-h-[calc(100svh-96px)]"
    >
      {/* One video element only — avoids Android/iPhone decoding 3 streams. */}
      <video
        key={activeSrc}
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster="/images/logo.png"
        className="absolute inset-0 h-full w-full scale-105 object-cover"
        aria-hidden="true"
      >
        <source src={activeSrc} type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-black/45" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-black/10" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-black/75 sm:hidden" />
      <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-black via-black/40 to-transparent" />
      <div className="pointer-events-none absolute -left-32 top-1/4 h-72 w-72 rounded-full bg-[#F26A21]/10 blur-[110px]" />

      <div className="relative z-20 flex min-h-[calc(100svh-76px)] items-center px-5 py-16 sm:min-h-[calc(100svh-80px)] sm:px-8 sm:py-20 lg:min-h-[calc(100svh-96px)] lg:px-12 xl:px-20">
        <div className="mx-auto w-full max-w-7xl">
          <div className="max-w-4xl">
            <div className="mb-5 flex items-center gap-3 sm:mb-7">
              <span className="h-px w-8 bg-[#F26A21] sm:w-14" />
              <span className="text-[8px] font-bold uppercase tracking-[0.32em] text-white/85 sm:text-[10px] sm:tracking-[0.45em]">
                Rhennie Tasty Shack
              </span>
            </div>

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

            <p className="mt-6 max-w-xl text-[13px] leading-6 text-white/80 sm:mt-8 sm:text-base sm:leading-8 lg:text-lg">
              Freshly prepared meals made with premium ingredients,
              unforgettable flavours and exceptional service — delivered
              straight to your doorstep.
            </p>

            <div className="mt-7 flex w-full flex-col gap-3 sm:mt-10 sm:flex-row sm:items-center">
              <Link
                href="/menu"
                className="inline-flex min-h-[52px] w-full touch-manipulation items-center justify-center rounded-full bg-[#F26A21] px-7 text-[13px] font-bold text-white shadow-[0_15px_45px_rgba(242,106,33,0.28)] transition-all duration-300 hover:-translate-y-1 hover:bg-[#D95512] sm:w-auto sm:px-8 sm:text-sm"
              >
                Order Your Meal
                <span className="ml-2">→</span>
              </Link>

              <Link
                href="/menu"
                className="inline-flex min-h-[52px] w-full touch-manipulation items-center justify-center rounded-full border border-white/60 bg-black/20 px-7 text-[13px] font-bold text-white backdrop-blur-md transition-all duration-300 hover:border-white hover:bg-white hover:text-black sm:w-auto sm:px-8 sm:text-sm"
              >
                Explore Our Menu
              </Link>
            </div>

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

      {!limitMedia ? (
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
              className={`h-1.5 touch-manipulation rounded-full transition-all duration-500 ${
                currentVideo === index
                  ? "w-9 bg-[#F26A21]"
                  : "w-4 bg-white/40 hover:bg-white"
              }`}
            />
          ))}
        </div>
      ) : null}

      <div className="absolute bottom-7 left-1/2 z-30 -translate-x-1/2 md:hidden">
        <div className="flex flex-col items-center gap-2">
          <span className="text-[7px] font-bold uppercase tracking-[0.35em] text-white/50">
            Scroll
          </span>
          <div className="flex h-8 w-5 justify-center rounded-full border border-white/40 p-1">
            <div className="h-1.5 w-1 rounded-full bg-[#F26A21] motion-safe:animate-bounce" />
          </div>
        </div>
      </div>
    </section>
  );
}

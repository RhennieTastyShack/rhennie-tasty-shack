"use client";

import Link from "next/link";
import { RIDE_BRAND } from "@/lib/ride-with-701";

function BikeIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="5.5" cy="17.5" r="3" />
      <circle cx="18.5" cy="17.5" r="3" />
      <path d="M5.5 17.5 9 9h3l2 4h3.5" />
      <path d="M12 9V6.5h2.5" />
      <path d="m9 9 3 4" />
    </svg>
  );
}

export default function RideWith701Button() {
  return (
    <Link
      href={RIDE_BRAND.joinPath}
      aria-label={`${RIDE_BRAND.name} — ${RIDE_BRAND.tagline}`}
      className="group fixed right-4 bottom-[calc(1rem+4.75rem+env(safe-area-inset-bottom,0px))] z-[60] flex h-14 w-14 touch-manipulation items-center justify-center rounded-full border-2 border-[#0B0B0B] bg-[#D4AF37] text-[#0B0B0B] shadow-[0_12px_32px_rgba(212,175,55,0.45)] transition-transform duration-300 will-change-transform hover:scale-105 hover:bg-[#E5C65A] sm:right-6 sm:bottom-[calc(1.5rem+5rem+env(safe-area-inset-bottom,0px))] sm:h-16 sm:w-16 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4AF37] motion-safe:animate-ride-float"
    >
      <BikeIcon className="h-7 w-7 sm:h-8 sm:w-8" />
      <span className="pointer-events-none absolute right-full mr-3 hidden whitespace-nowrap rounded-full border border-[#D4AF37]/40 bg-[#0B0B0B] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#D4AF37] opacity-0 shadow-lg transition-opacity duration-300 group-hover:opacity-100 lg:inline-block">
        {RIDE_BRAND.name}
      </span>
    </Link>
  );
}

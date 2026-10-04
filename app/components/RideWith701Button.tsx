"use client";

import Link from "next/link";
import { Motorbike } from "lucide-react";
import { RIDE_BRAND } from "@/lib/ride-with-701";
import { useShowFloatingActions } from "@/app/hooks/useShowFloatingActions";

export default function RideWith701Button() {
  const show = useShowFloatingActions();
  if (!show) return null;

  return (
    <Link
      href={RIDE_BRAND.joinPath}
      title="Partner with 701 — become a delivery partner"
      aria-label="Partner with 701 — become a delivery partner"
      className="group fixed right-4 bottom-[calc(1rem+4.75rem+env(safe-area-inset-bottom,0px))] z-[60] flex h-14 w-14 touch-manipulation items-center justify-center rounded-full bg-[#F26A21] text-white shadow-[0_12px_32px_rgba(242,106,33,0.45)] transition-transform duration-300 will-change-transform hover:scale-105 hover:bg-[#D95512] sm:right-6 sm:bottom-[calc(1.5rem+5rem+env(safe-area-inset-bottom,0px))] sm:h-16 sm:w-16 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F26A21] motion-safe:animate-ride-float"
    >
      <Motorbike
        size={30}
        color="#ffffff"
        strokeWidth={2.35}
        absoluteStrokeWidth
        aria-hidden="true"
        className="shrink-0"
      />
      <span className="pointer-events-none absolute right-full mr-3 hidden whitespace-nowrap rounded-full border border-[#F26A21]/35 bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#171717] opacity-0 shadow-lg transition-opacity duration-300 group-hover:opacity-100 lg:inline-block">
        Partner with 701
      </span>
    </Link>
  );
}

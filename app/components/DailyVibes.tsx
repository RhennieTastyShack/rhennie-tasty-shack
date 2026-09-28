"use client";

import { useEffect, useState } from "react";
import { pickDailyVibe } from "@/lib/daily-vibes";

const STORAGE_KEY = "rhennie-daily-vibe";

export default function DailyVibes() {
  const [vibe, setVibe] = useState("");

  useEffect(() => {
    const today = new Date().toDateString();
    const saved = sessionStorage.getItem(STORAGE_KEY);
    const [savedDay, savedVibe] = saved?.split("\n") || [];

    if (savedDay === today && savedVibe) {
      setVibe(savedVibe);
      return;
    }

    const next = pickDailyVibe();
    sessionStorage.setItem(STORAGE_KEY, `${today}\n${next}`);
    setVibe(next);
  }, []);

  if (!vibe) return null;

  return (
    <section className="mx-auto mt-8 max-w-2xl rounded-[28px] border border-[#D4AF37]/40 bg-[#141414] px-6 py-7 text-center">
      <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-[#D4AF37]">
        Daily vibe
      </p>
      <p className="mt-3 text-2xl font-bold leading-snug text-white sm:text-3xl">
        {vibe}
      </p>
    </section>
  );
}

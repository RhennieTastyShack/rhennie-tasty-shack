"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const navLinks = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "Our Menu",
    href: "/menu",
  },
  {
    label: "Food Boxes",
    href: "/#foodboxes",
  },
  {
    label: "Catering",
    href: "/menu?category=catering",
  },
  {
    label: "Event Concierge",
    href: "/client-portal/event-concierge",
  },
  {
    label: "Reviews",
    href: "/#reviews",
  },
  {
    label: "Meal Plans",
    href: "/subscription",
  },
  {
    label: "Contact",
    href: "/#footer",
  },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const closeMenu = () => {
    setOpen(false);
  };

  return (
    <header className="relative z-[9999] w-full border-b border-white/10 bg-[#080808]/95 text-white backdrop-blur-xl">

      {/* =====================================================
          MAIN NAVBAR
      ====================================================== */}

      <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:h-24 lg:px-8">

        {/* =================================================
            LOGO
        ================================================== */}

        <Link
          href="/"
          onClick={closeMenu}
          className="flex min-w-0 items-center gap-3"
        >
          <div className="relative h-14 w-14 shrink-0 sm:h-16 sm:w-16">
            <Image
              src="/images/logo.png"
              alt="Rhennie Tasty Shack"
              fill
              priority
              sizes="64px"
              className="object-contain"
            />
          </div>

          {/* Brand name - hidden on very small screens */}

          <div className="hidden min-w-0 sm:block">
            <h1 className="truncate text-base font-bold leading-tight text-white md:text-lg">
              Rhennie Tasty Shack
            </h1>

            <p className="mt-1 text-[8px] font-bold uppercase tracking-[0.28em] text-[#F26A21] md:text-[9px]">
              Premium Catering
            </p>
          </div>
        </Link>

        {/* =================================================
            DESKTOP NAVIGATION
        ================================================== */}

        <nav className="hidden items-center gap-5 lg:flex xl:gap-7">

          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="relative whitespace-nowrap text-sm font-medium text-white/80 transition-colors duration-300 hover:text-[#F26A21]"
            >
              {link.label}
            </Link>
          ))}

        </nav>

        {/* =================================================
            DESKTOP ORDER BUTTON
        ================================================== */}

        <a
          href="https://wa.me/2348121577759"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden rounded-full bg-[#F26A21] px-6 py-3 text-sm font-bold text-white shadow-[0_10px_30px_rgba(242,106,33,0.18)] transition-all duration-300 hover:-translate-y-1 hover:bg-[#D95512] hover:shadow-[0_15px_40px_rgba(242,106,33,0.28)] lg:inline-flex"
        >
          Order Now
        </a>

        {/* =================================================
            MOBILE MENU BUTTON
        ================================================== */}

        <button
          type="button"
          aria-label={open ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={open}
          onClick={() => setOpen((previous) => !previous)}
          className="relative z-[10000] flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white backdrop-blur-md transition-all duration-300 hover:border-[#F26A21] hover:bg-[#F26A21] lg:hidden"
        >
          {open ? (
            <X
              size={24}
              strokeWidth={2}
            />
          ) : (
            <Menu
              size={24}
              strokeWidth={2}
            />
          )}
        </button>

      </div>

      {/* =====================================================
          MOBILE MENU
      ====================================================== */}

      <div
        className={`absolute left-0 right-0 top-full z-[9998] border-b border-[#F26A21]/20 bg-[#080808]/98 shadow-[0_20px_60px_rgba(0,0,0,0.55)] backdrop-blur-2xl transition-all duration-300 lg:hidden ${
          open
            ? "visible translate-y-0 opacity-100"
            : "invisible pointer-events-none -translate-y-3 opacity-0"
        }`}
      >

        <nav className="mx-auto max-w-7xl px-5 pb-8 pt-5">

          {/* =================================================
              MOBILE MENU HEADER
          ================================================== */}

          <div className="mb-5 flex items-center gap-3">

            <span className="h-px w-8 bg-[#F26A21]" />

            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#F26A21]">
              Explore Rhennie
            </span>

          </div>

          {/* =================================================
              MOBILE NAVIGATION LINKS
          ================================================== */}

          <div className="flex flex-col">

            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={closeMenu}
                className="flex min-h-[52px] items-center justify-between border-b border-white/[0.08] text-[15px] font-medium text-white transition-colors duration-300 hover:text-[#F26A21]"
              >

                <span>
                  {link.label}
                </span>

                <span className="text-lg text-[#F26A21]">
                  →
                </span>

              </Link>
            ))}

          </div>

          {/* =================================================
              MOBILE ORDER BUTTON
          ================================================== */}

          <a
            href="https://wa.me/2348121577759"
            target="_blank"
            rel="noopener noreferrer"
            onClick={closeMenu}
            className="mt-6 flex min-h-[54px] w-full items-center justify-center rounded-full bg-[#F26A21] text-[14px] font-bold text-white shadow-[0_15px_40px_rgba(242,106,33,0.22)] transition-all duration-300 hover:bg-[#D95512]"
          >
            Order Your Meal

            <span className="ml-2 text-lg">
              →
            </span>
          </a>

          {/* =================================================
              MOBILE BRAND DETAILS
          ================================================== */}

          <div className="mt-7 flex items-center justify-center gap-3">

            <span className="text-[9px] font-semibold uppercase tracking-[0.25em] text-white/40">
              Premium Taste
            </span>

            <span className="h-1 w-1 rounded-full bg-[#F26A21]" />

            <span className="text-[9px] font-semibold uppercase tracking-[0.25em] text-white/40">
              Fast Delivery
            </span>

          </div>

        </nav>

      </div>

    </header>
  );
}
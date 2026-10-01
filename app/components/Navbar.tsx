"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, ShoppingBag, UserRound, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useCart } from "@/app/context/CartContext";

const mainLinks = [
  { label: "Menu", href: "/menu" },
  { label: "Event Concierge", href: "/event-concierge" },
  { label: "Customer Support", href: "/customer-care" },
] as const;

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const { totalItems, openCart } = useCart();

  const closeMenu = () => setOpen(false);

  const handleCartClick = () => {
    closeMenu();
    openCart();
  };

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (mounted) setSignedIn(Boolean(data.session));
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) setSignedIn(Boolean(session));
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-[9999] w-full border-b border-white/10 bg-[#080808]/95 pt-[env(safe-area-inset-top,0px)] text-white backdrop-blur-xl supports-[backdrop-filter]:bg-[#080808]/85">
      <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:h-24 lg:px-8">
        <Link
          href="/"
          onClick={closeMenu}
          className="flex min-w-0 shrink-0 items-center gap-2.5 sm:gap-3"
        >
          <div className="relative h-12 w-12 shrink-0 sm:h-16 sm:w-16">
            <Image
              src="/images/logo.png"
              alt="Rhennie Tasty Shack"
              fill
              priority
              sizes="64px"
              className="object-contain"
            />
          </div>

          <div className="hidden min-w-0 sm:block">
            <p className="truncate text-base font-bold leading-tight text-white md:text-lg">
              Rhennie Tasty Shack
            </p>
            <p className="mt-1 text-[10px] font-medium italic tracking-wide text-[#D4AF37]/90 md:text-[11px]">
              A Taste Above the Ordinary.
            </p>
          </div>
        </Link>

        <nav
          aria-label="Main"
          className="hidden items-center gap-10 lg:flex xl:gap-12"
        >
          {mainLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="relative whitespace-nowrap text-[13px] font-medium tracking-wide text-white/75 transition-colors duration-300 after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-[#D4AF37] after:transition-all after:duration-300 hover:text-white hover:after:w-full"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <Link
            href={signedIn ? "/client-portal" : "/login"}
            onClick={closeMenu}
            aria-label={signedIn ? "Open account" : "Sign in"}
            className="hidden h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition-all duration-300 hover:border-[#D4AF37] hover:text-[#D4AF37] sm:inline-flex"
          >
            <UserRound size={18} strokeWidth={2} />
          </Link>

          <button
            type="button"
            onClick={handleCartClick}
            aria-label={
              totalItems > 0
                ? `Open cart with ${totalItems} ${
                    totalItems === 1 ? "item" : "items"
                  }`
                : "Open cart"
            }
            className="relative flex h-11 w-11 touch-manipulation items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition-all duration-300 hover:border-[#D4AF37] hover:bg-[#D4AF37] hover:text-black"
          >
            <ShoppingBag size={19} strokeWidth={2} />
            {totalItems > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-[#080808] bg-[#D4AF37] px-1 text-[9px] font-extrabold text-black">
                {totalItems > 99 ? "99+" : totalItems}
              </span>
            )}
          </button>

          <Link
            href="/menu"
            className="hidden rounded-full bg-[#D4AF37] px-6 py-3 text-sm font-bold text-black transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#E5C65A] lg:inline-flex"
          >
            Order Now
          </Link>

          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((previous) => !previous)}
            className={`relative z-[10000] flex h-11 min-w-[44px] touch-manipulation items-center justify-center gap-2 rounded-full px-3.5 text-sm font-bold transition-all duration-300 lg:hidden ${
              open
                ? "bg-white text-[#171717]"
                : "border border-white/20 bg-white/5 text-white hover:border-[#D4AF37] hover:text-[#D4AF37]"
            }`}
          >
            {open ? (
              <X size={22} strokeWidth={2} />
            ) : (
              <Menu size={22} strokeWidth={2} />
            )}
          </button>
        </div>
      </div>

      <div
        className={`absolute left-0 right-0 top-full z-[9998] max-h-[min(85dvh,760px)] overflow-y-auto overscroll-contain border-b border-white/10 bg-[#080808]/98 shadow-[0_20px_60px_rgba(0,0,0,0.55)] backdrop-blur-2xl transition-all duration-300 [-webkit-overflow-scrolling:touch] lg:hidden ${
          open
            ? "visible translate-y-0 opacity-100"
            : "invisible pointer-events-none -translate-y-3 opacity-0"
        }`}
      >
        <nav className="mx-auto max-w-7xl px-5 pb-8 pt-5 sm:px-6" aria-label="Mobile">
          <div className="mb-6 grid gap-2">
            {mainLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={closeMenu}
                className="flex min-h-[52px] items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-5 text-[15px] font-semibold text-white transition-colors hover:border-[#D4AF37]/40 hover:text-[#D4AF37]"
              >
                <span>{link.label}</span>
                <span className="text-[#D4AF37]">→</span>
              </Link>
            ))}
          </div>

          <div className="grid gap-3">
            <Link
              href={signedIn ? "/client-portal" : "/login"}
              onClick={closeMenu}
              className="flex min-h-[52px] items-center justify-center rounded-full border border-white/25 text-[14px] font-bold text-white transition hover:border-[#D4AF37] hover:text-[#D4AF37]"
            >
              {signedIn ? "My Account" : "Sign In"}
            </Link>

            <button
              type="button"
              onClick={handleCartClick}
              className="flex min-h-[52px] items-center justify-center rounded-full border border-white/15 bg-white/[0.04] text-[14px] font-bold text-white"
            >
              Cart{totalItems > 0 ? ` · ${totalItems}` : ""}
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
}

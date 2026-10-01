"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, ShoppingBag, UserRound, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useCart } from "@/app/context/CartContext";
import { RIDE_BRAND } from "@/lib/ride-with-701";

const mainLinks = [
  { label: "Menu", href: "/menu" },
  { label: "Event Concierge", href: "/event-concierge" },
  { label: "Customer Support", href: "/customer-care" },
] as const;

type DrawerLink = {
  label: string;
  href: string;
};

export default function Navbar() {
  const router = useRouter();
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

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMenu();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  async function handleLogout() {
    closeMenu();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const exploreLinks: DrawerLink[] = [
    { label: "Home", href: "/" },
    ...mainLinks,
  ];

  const accountLinks: DrawerLink[] = signedIn
    ? [
        { label: "My Account", href: "/client-portal" },
        { label: "My Orders", href: "/orders" },
        { label: "Meal Plans", href: "/subscription" },
        { label: "Profile", href: "/client-portal/profile" },
      ]
    : [
        { label: "Login", href: "/login" },
        { label: "Create Account", href: "/signup" },
        { label: "Meal Plans", href: "/subscription" },
      ];

  const rideLinks: DrawerLink[] = [
    { label: RIDE_BRAND.name, href: RIDE_BRAND.joinPath },
    {
      label: RIDE_BRAND.partnerHeadline,
      href: RIDE_BRAND.joinPath,
    },
    { label: `${RIDE_BRAND.partnerLabel} Portal`, href: RIDE_BRAND.portalPath },
  ];

  return (
    <header className="sticky top-0 z-[9999] w-full border-b border-black/8 bg-white/95 pt-[env(safe-area-inset-top,0px)] text-[#171717] backdrop-blur-xl supports-[backdrop-filter]:bg-white/90">
      <div className="mx-auto flex h-[72px] w-full max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:h-[84px] lg:gap-4 lg:px-12 xl:px-16">
        <Link
          href="/"
          onClick={closeMenu}
          className="flex min-w-0 shrink-0 items-center gap-2.5 sm:gap-3"
        >
          <div className="relative h-11 w-11 shrink-0 sm:h-14 sm:w-14">
            <Image
              src="/images/logo.png"
              alt="Rhennie Tasty Shack"
              fill
              priority
              sizes="56px"
              className="object-contain"
            />
          </div>

          <div className="hidden min-w-0 sm:block">
            <p className="truncate text-base font-bold leading-tight text-[#171717] md:text-lg">
              Rhennie Tasty Shack
            </p>
            <p className="mt-1 text-[10px] font-medium italic tracking-wide text-[#F26A21] md:text-[11px]">
              A Taste Above the Ordinary.
            </p>
          </div>
        </Link>

        <nav
          aria-label="Main"
          className="hidden items-center gap-7 lg:flex xl:gap-10"
        >
          {mainLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="relative whitespace-nowrap text-[13px] font-medium tracking-wide text-black/65 transition-colors duration-300 after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-[#F26A21] after:transition-all after:duration-300 hover:text-[#F26A21] hover:after:w-full"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
          <Link
            href={signedIn ? "/client-portal" : "/login"}
            onClick={closeMenu}
            aria-label={signedIn ? "Open account" : "Sign in"}
            className="hidden h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-[#F8F6F2] text-[#171717] transition-all duration-300 hover:border-[#F26A21] hover:text-[#F26A21] sm:inline-flex"
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
            className="relative flex h-11 w-11 touch-manipulation items-center justify-center rounded-full border border-black/10 bg-[#F8F6F2] text-[#171717] transition-all duration-300 hover:border-[#F26A21] hover:bg-[#F26A21] hover:text-white"
          >
            <ShoppingBag size={19} strokeWidth={2} />
            {totalItems > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-[#F26A21] px-1 text-[9px] font-extrabold text-white">
                {totalItems > 99 ? "99+" : totalItems}
              </span>
            )}
          </button>

          <Link
            href="/menu"
            className="hidden rounded-full bg-[#F26A21] px-5 py-2.5 text-sm font-bold text-white transition-all duration-300 hover:bg-[#D95512] lg:inline-flex"
          >
            Order Now
          </Link>

          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="rts-nav-drawer"
            onClick={() => setOpen((previous) => !previous)}
            className={`relative z-[10001] flex h-11 w-11 touch-manipulation items-center justify-center rounded-full border transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F26A21] ${
              open
                ? "border-[#171717] bg-[#171717] text-white"
                : "border-[#F26A21] bg-[#F26A21] text-white hover:bg-[#D95512]"
            }`}
          >
            {open ? (
              <X size={22} strokeWidth={2.25} />
            ) : (
              <Menu size={22} strokeWidth={2.25} />
            )}
          </button>
        </div>
      </div>

      <button
        type="button"
        aria-label="Close menu overlay"
        tabIndex={open ? 0 : -1}
        onClick={closeMenu}
        className={`fixed inset-0 z-[10000] bg-black/40 transition-opacity duration-300 ${
          open
            ? "visible opacity-100"
            : "invisible pointer-events-none opacity-0"
        }`}
      />

      <aside
        id="rts-nav-drawer"
        aria-hidden={!open}
        className={`fixed right-0 top-0 z-[10002] flex h-[100dvh] w-[min(100vw,380px)] flex-col border-l border-black/8 bg-white shadow-[-20px_0_60px_rgba(0,0,0,0.18)] transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-black/8 px-5 py-5 pt-[calc(1.25rem+env(safe-area-inset-top,0px))]">
          <div className="flex min-w-0 items-center gap-3">
            <div className="relative h-11 w-11 shrink-0">
              <Image
                src="/images/logo.png"
                alt=""
                fill
                sizes="44px"
                className="object-contain"
              />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-[#171717]">
                Rhennie Tasty Shack
              </p>
              <p className="mt-0.5 truncate text-[10px] italic text-[#F26A21]">
                A Taste Above the Ordinary.
              </p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Close menu"
            onClick={closeMenu}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 text-[#171717] transition hover:border-[#F26A21] hover:text-[#F26A21]"
          >
            <X size={20} strokeWidth={2} />
          </button>
        </div>

        <nav
          aria-label="More navigation"
          className="flex-1 overflow-y-auto overscroll-contain px-5 py-6 [-webkit-overflow-scrolling:touch]"
        >
          <DrawerSection title="Explore" links={exploreLinks} onNavigate={closeMenu} />
          <DrawerSection title="Account" links={accountLinks} onNavigate={closeMenu} />
          <DrawerSection title="Ride with 701" links={rideLinks} onNavigate={closeMenu} />

          {signedIn ? (
            <button
              type="button"
              onClick={() => void handleLogout()}
              className="mt-4 w-full border-t border-black/8 pt-5 text-left text-[14px] font-medium text-black/60 transition hover:text-[#F26A21]"
            >
              Log out
            </button>
          ) : null}
        </nav>
      </aside>
    </header>
  );
}

function DrawerSection({
  title,
  links,
  onNavigate,
}: {
  title: string;
  links: DrawerLink[];
  onNavigate: () => void;
}) {
  return (
    <div className="mb-7">
      <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.28em] text-[#F26A21]">
        {title}
      </p>
      <ul className="space-y-1">
        {links.map((link) => (
          <li key={`${title}-${link.label}`}>
            <Link
              href={link.href}
              onClick={onNavigate}
              className="block rounded-lg px-1 py-2.5 text-[15px] font-medium text-[#171717]/90 transition-colors hover:text-[#F26A21]"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

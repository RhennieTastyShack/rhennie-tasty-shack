"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "@/app/context/CartContext";

const HIDDEN_PREFIXES = [
  "/checkout",
  "/login",
  "/signup",
  "/client-portal",
  "/forgot-password",
  "/reset-password",
  "/verify-phone",
  "/admin",
  "/admin-login",
  "/riders/portal",
  "/track",
];

function pathHidesFabs(pathname: string | null) {
  if (!pathname) return false;
  return HIDDEN_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

/** Hide floating action buttons on task flows and when overlays are open. */
export function useShowFloatingActions() {
  const pathname = usePathname();
  const { isCartOpen } = useCart();
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    const sync = () => {
      setNavOpen(
        document.documentElement.dataset.rtsNavOpen === "1"
      );
    };
    sync();
    window.addEventListener("rts-nav-open-change", sync);
    return () => {
      window.removeEventListener("rts-nav-open-change", sync);
    };
  }, []);

  if (isCartOpen || navOpen) return false;
  if (pathHidesFabs(pathname)) return false;
  return true;
}

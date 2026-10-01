"use client";

import { usePathname } from "next/navigation";
import Footer from "@/app/components/Footer";

const HIDDEN_PREFIXES = [
  "/admin",
  "/admin-login",
  "/admin-forgot-password",
  "/riders",
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/auth",
  "/verify-phone",
];

export default function SiteFooter() {
  const pathname = usePathname() || "/";
  const hide = HIDDEN_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (hide) return null;
  return <Footer />;
}

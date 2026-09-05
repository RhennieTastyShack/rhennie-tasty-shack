"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [checking, setChecking] = useState(true);
  const [adminEmail, setAdminEmail] = useState("");

  useEffect(() => {
    async function checkAdminAccess() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // No logged-in user
      if (!user) {
        router.replace("/admin-login");
        return;
      }

      // Check if this user exists in admin_users
      const { data: admin, error } = await supabase
        .from("admin_users")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Admin access check failed:", error);
        router.replace("/admin-login");
        return;
      }

      // Logged in but NOT an admin
      if (!admin) {
        await supabase.auth.signOut();
        router.replace("/admin-login");
        return;
      }

      // Admin confirmed
      setAdminEmail(user.email || "");
      setChecking(false);
    }

    checkAdminAccess();
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/admin-login");
  }

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0B0B0B] text-white">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-white/10 border-t-[#D4AF37]" />

          <p className="mt-4 text-xs font-bold uppercase tracking-[0.25em] text-[#D4AF37]">
            Rhennie Studio
          </p>

          <p className="mt-2 text-sm text-white/50">
            Verifying admin access...
          </p>
        </div>
      </div>
    );
  }

  const navigation = [
    {
      name: "Dashboard",
      href: "/admin",
    },
    {
      name: "Orders",
      href: "/admin/orders",
    },
    {
      name: "Customers",
      href: "/admin/customers",
    },
    {
      name: "Menu",
      href: "/admin/menu",
    },
    {
      name: "Gallery",
      href: "/admin/gallery",
    },
    {
      name: "Reviews",
      href: "/admin/reviews",
    },
    {
      name: "Subscriptions",
      href: "/admin/subscriptions",
    },
    {
      name: "Event Concierge",
      href: "/admin/event-concierge",
    },
    {
      name: "Settings",
      href: "/admin/settings",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F7F5F0] text-[#171717]">
      <div className="flex min-h-screen">

        {/* Sidebar */}
        <aside className="hidden w-64 shrink-0 border-r border-[#D4AF37]/20 bg-[#111111] text-white md:flex md:flex-col">

          {/* Brand */}
          <div className="border-b border-[#D4AF37]/20 p-6">
            <p className="text-[10px] uppercase tracking-[0.3em] text-[#D4AF37]">
              Rhennie Tasty Shack
            </p>

            <h2 className="mt-2 text-xl font-bold">
              Rhennie Studio
            </h2>

            <p className="mt-1 text-xs text-white/40">
              Premium Catering Admin
            </p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {navigation.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== "/admin" &&
                  pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block rounded-lg px-4 py-3 text-sm transition ${
                    active
                      ? "bg-[#D4AF37] text-black font-semibold"
                      : "text-white/70 hover:bg-[#D4AF37]/10 hover:text-[#D4AF37]"
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Admin Account */}
          <div className="border-t border-[#D4AF37]/20 p-4">

            <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.2em] text-[#D4AF37]">
              Logged In
            </p>

            <div className="mb-3 truncate rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/60">
              {adminEmail}
            </div>

            <button
              onClick={handleLogout}
              className="w-full rounded-lg border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm font-semibold text-red-400 transition hover:bg-red-500/10 hover:text-red-300"
            >
              Logout
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="min-w-0 flex-1">

          {/* Mobile Header */}
          <div className="flex items-center justify-between border-b border-black/10 bg-[#111111] px-4 py-4 text-white md:hidden">

            <div>
              <p className="text-[9px] uppercase tracking-[0.25em] text-[#D4AF37]">
                Rhennie Studio
              </p>

              <p className="mt-1 text-sm font-semibold">
                Premium Catering Admin
              </p>
            </div>

            <button
              onClick={handleLogout}
              className="rounded-lg border border-red-500/30 px-3 py-2 text-xs font-semibold text-red-400"
            >
              Logout
            </button>
          </div>

          {/* Page Content */}
          {children}
        </main>
      </div>
    </div>
  );
}
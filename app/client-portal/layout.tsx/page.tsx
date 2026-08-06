"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const menuItems = [
  { label: "Dashboard", href: "/client-portal" },
  { label: "My Orders", href: "/client-portal/orders" },
  { label: "Event Concierge", href: "/client-portal/event-concierge" },
  { label: "Quotations", href: "/client-portal/quotations" },
  { label: "Favourites", href: "/client-portal/favourites" },
  { label: "Notifications", href: "/client-portal/notifications" },
  { label: "Profile", href: "/client-portal/profile" },
  { label: "Settings", href: "/client-portal/settings" },
];

export default function ClientPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-white">

      <div className="flex min-h-screen">

        {/* Sidebar */}
        <aside className="hidden lg:flex w-72 flex-col border-r border-[#D4AF37]/10 bg-[#111111]">

          <div className="border-b border-[#D4AF37]/10 p-8">

            <h1 className="text-2xl font-bold">
              Rhennie
            </h1>

            <p className="mt-2 text-sm tracking-[0.3em] uppercase text-[#D4AF37]">
              Client Portal
            </p>

          </div>

          <nav className="flex-1 p-6">

            <div className="space-y-2">

              {menuItems.map((item) => (

                <Link
                  key={item.href}
                  href={item.href}
                  className={`block rounded-xl px-5 py-4 transition ${
                    pathname === item.href
                      ? "bg-[#D4AF37] text-black font-semibold"
                      : "text-gray-300 hover:bg-[#1C1C1C]"
                  }`}
                >
                  {item.label}
                </Link>

              ))}

            </div>

          </nav>

          <div className="border-t border-[#D4AF37]/10 p-6">

            <button
              onClick={handleLogout}
              className="w-full rounded-full bg-[#D4AF37] px-6 py-3 font-semibold text-black transition hover:opacity-90"
            >
              Logout
            </button>

          </div>

        </aside>

        {/* Main Content */}
        <div className="flex-1">

          <header className="border-b border-[#D4AF37]/10 bg-[#111111]/70 backdrop-blur-xl">

            <div className="flex items-center justify-between px-8 py-6">

              <div>

                <h2 className="text-3xl font-bold">
                  Welcome Back 👋
                </h2>

                <p className="mt-2 text-[#B8B8B8]">
                  Manage your orders, events and quotations.
                </p>

              </div>

            </div>

          </header>

          <main className="p-8">
            {children}
          </main>

        </div>

      </div>

    </div>
  );
}
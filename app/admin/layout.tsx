import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden w-64 shrink-0 border-r border-[#D4AF37]/20 bg-[#111111] md:block">
          <div className="border-b border-[#D4AF37]/20 p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-[#D4AF37]">
              Rhennie Tasty Shack
            </p>

            <h2 className="mt-2 text-xl font-bold">
              Admin Dashboard
            </h2>
          </div>

          <nav className="space-y-2 p-4">
            <Link
              href="/admin"
              className="block rounded-lg px-4 py-3 text-gray-300 transition hover:bg-[#D4AF37]/10 hover:text-[#D4AF37]"
            >
              Dashboard
            </Link>

            <Link
              href="/admin/orders"
              className="block rounded-lg px-4 py-3 text-gray-300 transition hover:bg-[#D4AF37]/10 hover:text-[#D4AF37]"
            >
              Orders
            </Link>

            <Link
              href="/admin/customers"
              className="block rounded-lg px-4 py-3 text-gray-300 transition hover:bg-[#D4AF37]/10 hover:text-[#D4AF37]"
            >
              Customers
            </Link>

            <Link
              href="/admin/menu"
              className="block rounded-lg px-4 py-3 text-gray-300 transition hover:bg-[#D4AF37]/10 hover:text-[#D4AF37]"
            >
              Menu
            </Link>

            <Link
              href="/admin/gallery"
              className="block rounded-lg px-4 py-3 text-gray-300 transition hover:bg-[#D4AF37]/10 hover:text-[#D4AF37]"
            >
              Gallery
            </Link>

            <Link
              href="/admin/reviews"
              className="block rounded-lg px-4 py-3 text-gray-300 transition hover:bg-[#D4AF37]/10 hover:text-[#D4AF37]"
            >
              Reviews
            </Link>

            <Link
              href="/admin/subscriptions"
              className="block rounded-lg px-4 py-3 text-gray-300 transition hover:bg-[#D4AF37]/10 hover:text-[#D4AF37]"
            >
              Subscriptions
            </Link>

            <Link
              href="/admin/settings"
              className="block rounded-lg px-4 py-3 text-gray-300 transition hover:bg-[#D4AF37]/10 hover:text-[#D4AF37]"
            >
              Settings
            </Link>
          </nav>
        </aside>

        {/* Main content */}
        <main className="min-w-0 flex-1">
          {/* Mobile header */}
          <div className="border-b border-[#D4AF37]/20 bg-[#111111] p-4 md:hidden">
            <p className="text-sm font-semibold text-[#D4AF37]">
              Rhennie Tasty Shack
            </p>
          </div>

          {/* THIS IS IMPORTANT */}
          {children}
        </main>
      </div>
    </div>
  );
}
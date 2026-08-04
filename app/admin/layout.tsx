"use client";

import Link from "next/link";
import {
  FaChartPie,
  FaUtensils,
  FaClipboardList,
  FaUsers,
  FaBoxOpen,
  FaImages,
  FaCog,
} from "react-icons/fa";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* Sidebar */}
      <aside className="w-72 bg-black text-white p-6">

        <h1 className="text-3xl font-bold text-yellow-400 mb-10">
          Rhennie Admin
        </h1>

        <nav className="space-y-2">

          <Link
            href="/admin"
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-yellow-500 hover:text-black transition"
          >
            <FaChartPie />
            Dashboard
          </Link>

          <Link
            href="/admin/meals"
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-yellow-500 hover:text-black transition"
          >
            <FaUtensils />
            Meals
          </Link>

          <Link
            href="/admin/orders"
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-yellow-500 hover:text-black transition"
          >
            <FaClipboardList />
            Orders
          </Link>

          <Link
            href="/admin/customers"
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-yellow-500 hover:text-black transition"
          >
            <FaUsers />
            Customers
          </Link>

          <Link
            href="/admin/subscriptions"
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-yellow-500 hover:text-black transition"
          >
            <FaBoxOpen />
            Subscriptions
          </Link>

          <Link
            href="/admin/gallery"
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-yellow-500 hover:text-black transition"
          >
            <FaImages />
            Gallery
          </Link>

          <Link
            href="/admin/settings"
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-yellow-500 hover:text-black transition"
          >
            <FaCog />
            Settings
          </Link>

        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}
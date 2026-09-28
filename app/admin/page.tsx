"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface Consultation {
  full_name?: string;
  phone?: string;
  email?: string;
}

interface Order {
  id: string;
  order_no: string;
  title: string;
  amount: number | null;
  status: string | null;
  order_date: string | null;
  created_at: string;
  consultation?: Consultation | null;
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadOrders() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        const headers: Record<string, string> = {};

        if (session?.access_token) {
          headers.Authorization = `Bearer ${session.access_token}`;
        }

        const response = await fetch("/api/orders", {
          cache: "no-store",
          headers,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.error || "Unable to load orders."
          );
        }

        setOrders(data);
      } catch (err) {
        console.error("Dashboard orders error:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load dashboard."
        );
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, []);

  const today = new Date().toISOString().split("T")[0];

  const todaysOrders = orders.filter((order) => {
    return (
      order.created_at?.split("T")[0] === today
    );
  });

  const endOfDaySales = todaysOrders.reduce(
    (total, order) => total + Number(order.amount || 0),
    0
  );

  const totalRevenue = orders.reduce(
    (total, order) =>
      total + Number(order.amount || 0),
    0
  );

  const uniqueCustomers = new Set(
    orders
      .map(
        (order) =>
          order.consultation?.email ||
          order.consultation?.phone
      )
      .filter(Boolean)
  ).size;

  const activeOrders = orders.filter((order) => {
    const status = order.status?.toUpperCase();

    return (
      status !== "COMPLETED" &&
      status !== "CANCELLED"
    );
  }).length;

  const recentOrders = orders.slice(0, 5);

  function formatAmount(amount: number | null) {
    return `₦${Number(amount || 0).toLocaleString(
      "en-NG"
    )}`;
  }

  function getStatusClass(status: string | null) {
    switch (status?.toUpperCase()) {
      case "COMPLETED":
        return "bg-green-100 text-green-700";

      case "CONFIRMED":
        return "bg-blue-100 text-blue-700";

      case "PREPARING":
        return "bg-yellow-100 text-yellow-700";

      case "OUT FOR DELIVERY":
        return "bg-indigo-100 text-indigo-700";

      case "CANCELLED":
        return "bg-red-100 text-red-700";

      case "IN REVIEW":
        return "bg-purple-100 text-purple-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <h1 className="text-4xl font-bold text-gray-900">
          Dashboard
        </h1>

        <div className="mt-10 rounded-xl bg-white p-10 text-center shadow">
          <p className="text-gray-500">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">

      {/* HEADER */}
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#B08D22]">
          Rhennie Tasty Shack
        </p>

        <h1 className="mt-2 text-4xl font-bold text-gray-900">
          Dashboard
        </h1>

        <p className="mt-2 text-gray-500">
          Overview of your orders and business activity.
        </p>
      </div>

      {/* ERROR */}
      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {/* STATS */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-5">

        <div className="rounded-xl border-l-4 border-[#B08D22] bg-white p-6 shadow-lg">
          <h3 className="text-gray-500">
            End of day sales
          </h3>

          <p className="mt-2 text-4xl font-bold text-gray-900">
            {formatAmount(endOfDaySales)}
          </p>

          <p className="mt-2 text-sm text-gray-400">
            Sales recorded today
          </p>
        </div>

        {/* TODAY'S ORDERS */}
        <div className="rounded-xl border-l-4 border-yellow-500 bg-white p-6 shadow-lg">
          <h3 className="text-gray-500">
            Today's Orders
          </h3>

          <p className="mt-2 text-4xl font-bold text-gray-900">
            {todaysOrders.length}
          </p>

          <p className="mt-2 text-sm text-gray-400">
            Orders created today
          </p>
        </div>

        {/* REVENUE */}
        <div className="rounded-xl border-l-4 border-green-500 bg-white p-6 shadow-lg">
          <h3 className="text-gray-500">
            Total Revenue
          </h3>

          <p className="mt-2 text-3xl font-bold text-gray-900">
            {formatAmount(totalRevenue)}
          </p>

          <p className="mt-2 text-sm text-gray-400">
            From recorded orders
          </p>
        </div>

        {/* CUSTOMERS */}
        <div className="rounded-xl border-l-4 border-blue-500 bg-white p-6 shadow-lg">
          <h3 className="text-gray-500">
            Customers
          </h3>

          <p className="mt-2 text-4xl font-bold text-gray-900">
            {uniqueCustomers}
          </p>

          <p className="mt-2 text-sm text-gray-400">
            Unique customers
          </p>
        </div>

        {/* ACTIVE ORDERS */}
        <div className="rounded-xl border-l-4 border-purple-500 bg-white p-6 shadow-lg">
          <h3 className="text-gray-500">
            Active Orders
          </h3>

          <p className="mt-2 text-4xl font-bold text-gray-900">
            {activeOrders}
          </p>

          <p className="mt-2 text-sm text-gray-400">
            Currently in progress
          </p>
        </div>

      </div>

      {/* RECENT ORDERS */}
      <div className="mt-10 rounded-xl bg-white p-6 shadow-lg">

        <div className="mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-center">

          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Recent Orders
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Your latest customer orders.
            </p>
          </div>

          <a
            href="/admin/orders"
            className="font-semibold text-[#B08D22] hover:underline"
          >
            View All Orders →
          </a>

        </div>

        {recentOrders.length === 0 ? (
          <div className="rounded-xl bg-gray-50 p-10 text-center">
            <p className="text-gray-500">
              No orders have been placed yet.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">

            <table className="w-full min-w-[800px]">

              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-3 text-left text-sm font-semibold text-gray-500">
                    Order
                  </th>

                  <th className="py-3 text-left text-sm font-semibold text-gray-500">
                    Customer
                  </th>

                  <th className="py-3 text-left text-sm font-semibold text-gray-500">
                    Service
                  </th>

                  <th className="py-3 text-left text-sm font-semibold text-gray-500">
                    Amount
                  </th>

                  <th className="py-3 text-left text-sm font-semibold text-gray-500">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>

                {recentOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-gray-100"
                  >

                    <td className="py-4 font-semibold text-gray-900">
                      <Link
                        href={`/admin/orders?open=${encodeURIComponent(order.id)}`}
                        className="text-[#B08D22] underline-offset-4 hover:underline"
                      >
                        {order.order_no}
                      </Link>
                    </td>

                    <td className="py-4 text-gray-700">
                      {order.consultation?.full_name ||
                        "Guest"}
                    </td>

                    <td className="py-4 text-gray-700">
                      {order.title}
                    </td>

                    <td className="py-4 font-semibold text-gray-900">
                      {formatAmount(order.amount)}
                    </td>

                    <td className="py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                          order.status
                        )}`}
                      >
                        {order.status || "IN REVIEW"}
                      </span>
                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

          </div>
        )}

      </div>

    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Order = {
  id: string;
  order_no: string;
  customer_id: string | null;
  title: string;
  order_date: string | null;
  amount: number | null;
  status: string | null;
  created_at: string;
};

const STATUS_STEPS = [
  "IN REVIEW",
  "CONFIRMED",
  "PREPARING",
  "OUT FOR DELIVERY",
  "COMPLETED",
];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadOrders() {
      try {
        const response = await fetch("/api/orders", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Unable to load orders");
        }

        const data = await response.json();

        setOrders(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Orders loading error:", error);
        setError("Unable to load your orders.");
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, []);

  function formatAmount(amount: number | null) {
    if (amount === null || amount === undefined) {
      return "₦0";
    }

    return `₦${Number(amount).toLocaleString("en-NG")}`;
  }

  function formatDate(date: string | null) {
    if (!date) return "";

    return new Date(date).toLocaleDateString("en-NG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  function getStatusIndex(status: string | null) {
    if (!status) return 0;

    const index = STATUS_STEPS.indexOf(status.toUpperCase());

    return index === -1 ? 0 : index;
  }

  function getStatusLabel(status: string | null) {
    if (!status) return "In Review";

    return status
      .toLowerCase()
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  function getProgressWidth(status: string | null) {
    const index = getStatusIndex(status);

    if (index === 0) return "20%";
    if (index === 1) return "40%";
    if (index === 2) return "60%";
    if (index === 3) return "80%";
    if (index === 4) return "100%";

    return "20%";
  }

  function isStepCompleted(
    status: string | null,
    stepIndex: number
  ) {
    return getStatusIndex(status) >= stepIndex;
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#080808] px-5 py-20 text-white">
        <div className="mx-auto max-w-5xl text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-[#D4AF37]/20 border-t-[#D4AF37]" />

          <p className="mt-5 text-sm text-[#D4AF37]">
            Loading your orders...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#080808] px-4 py-14 text-white sm:px-6 md:px-8 lg:py-20">

      <div className="mx-auto max-w-5xl">

        {/* ================= HEADER ================= */}

        <div className="mb-12 text-center">

          <span className="inline-flex rounded-full border border-[#D4AF37]/30 bg-[#111111] px-5 py-2 text-[10px] font-bold uppercase tracking-[0.35em] text-[#D4AF37]">
            Client Portal
          </span>

          <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            My Orders
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[#999999] sm:text-base">
            View and track your current and previous orders
            with Rhennie Tasty Shack.
          </p>

          <Link
            href="/client-portal"
            className="mt-6 inline-flex items-center text-sm font-medium text-[#D4AF37] transition hover:text-[#E5C65A]"
          >
            ← Back to Client Portal
          </Link>

        </div>

        {/* ================= ERROR ================= */}

        {error && (
          <div className="mb-8 rounded-2xl border border-red-500/20 bg-red-500/5 p-5 text-center text-sm text-red-300">
            {error}
          </div>
        )}

        {/* ================= EMPTY ================= */}

        {!error && orders.length === 0 && (
          <div className="rounded-[30px] border border-[#D4AF37]/15 bg-[#111111] px-6 py-20 text-center shadow-2xl">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[#D4AF37]/20 bg-[#181818] text-2xl">
              🍽️
            </div>

            <h2 className="mt-6 text-2xl font-bold">
              No orders yet
            </h2>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[#888888]">
              You don't have any orders yet. Start a consultation
              or place an order and it will appear here.
            </p>

            <Link
              href="/client-portal/event-concierge"
              className="mt-7 inline-flex rounded-full bg-[#D4AF37] px-7 py-3.5 text-sm font-bold text-black transition hover:bg-[#E5C65A]"
            >
              Start a Consultation →
            </Link>

          </div>
        )}

        {/* ================= ORDERS ================= */}

        {!error && orders.length > 0 && (
          <div className="space-y-8">

            {orders.map((order) => {
              const statusIndex = getStatusIndex(order.status);

              const isCancelled =
                order.status?.toUpperCase() === "CANCELLED";

              return (
                <article
                  key={order.id}
                  className="overflow-hidden rounded-[30px] border border-white/10 bg-[#111111] shadow-[0_20px_60px_rgba(0,0,0,0.35)] transition duration-300 hover:border-[#D4AF37]/25"
                >

                  {/* ================= ORDER TOP ================= */}

                  <div className="p-6 sm:p-8 md:p-10">

                    <div className="flex flex-col gap-7 md:flex-row md:items-start md:justify-between">

                      {/* ORDER INFO */}

                      <div className="min-w-0">

                        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#D4AF37]">
                          {order.order_no}
                        </p>

                        <h2 className="mt-3 text-2xl font-bold leading-tight sm:text-3xl">
                          {order.title}
                        </h2>

                        {order.order_date && (
                          <p className="mt-2 text-sm text-[#777777]">
                            {formatDate(order.order_date)}
                          </p>
                        )}

                      </div>

                      {/* ORDER VALUE */}

                      <div className="shrink-0 md:text-right">

                        <p className="text-[10px] uppercase tracking-[0.25em] text-[#666666]">
                          Order Value
                        </p>

                        <p className="mt-1 text-2xl font-bold text-[#D4AF37] sm:text-3xl">
                          {formatAmount(order.amount)}
                        </p>

                        <span
                          className={`mt-3 inline-flex rounded-full border px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] ${
                            isCancelled
                              ? "border-red-500/30 bg-red-500/5 text-red-400"
                              : "border-[#D4AF37]/30 bg-[#D4AF37]/5 text-[#D4AF37]"
                          }`}
                        >
                          {getStatusLabel(order.status)}
                        </span>

                      </div>

                    </div>

                    {/* ================= PROGRESS ================= */}

                    {!isCancelled && (
                      <div className="mt-10">

                        <div className="mb-4 flex items-center justify-between">

                          <div>
                            <p className="text-[10px] uppercase tracking-[0.25em] text-[#666666]">
                              Order Progress
                            </p>

                            <p className="mt-2 text-sm font-semibold text-white">
                              {getStatusLabel(order.status)}
                            </p>
                          </div>

                          <div className="text-right">

                            <p className="text-[9px] uppercase tracking-[0.2em] text-[#666666]">
                              Stage
                            </p>

                            <p className="mt-1 text-sm font-bold text-[#D4AF37]">
                              {statusIndex + 1} of 5
                            </p>

                          </div>

                        </div>

                        {/* BAR */}

                        <div className="relative h-1.5 overflow-hidden rounded-full bg-[#292929]">

                          <div
                            className="h-full rounded-full bg-[#D4AF37] transition-all duration-700"
                            style={{
                              width: getProgressWidth(order.status),
                            }}
                          />

                        </div>

                        {/* STEPS */}

                        <div className="mt-5 grid grid-cols-5 gap-1">

                          {STATUS_STEPS.map(
                            (step, index) => {
                              const completed =
                                isStepCompleted(
                                  order.status,
                                  index
                                );

                              const active =
                                index === statusIndex;

                              return (
                                <div
                                  key={step}
                                  className="flex flex-col items-center text-center"
                                >

                                  <div
                                    className={`flex h-8 w-8 items-center justify-center rounded-full border text-[10px] font-bold transition-all sm:h-9 sm:w-9 ${
                                      completed
                                        ? "border-[#D4AF37] bg-[#D4AF37] text-black"
                                        : "border-[#333333] bg-[#181818] text-[#555555]"
                                    } ${
                                      active
                                        ? "ring-4 ring-[#D4AF37]/10"
                                        : ""
                                    }`}
                                  >
                                    {completed
                                      ? "✓"
                                      : index + 1}
                                  </div>

                                  <p
                                    className={`mt-3 max-w-[90px] text-[8px] font-medium uppercase leading-3 tracking-wider sm:text-[9px] ${
                                      completed
                                        ? "text-[#D4AF37]"
                                        : "text-[#555555]"
                                    }`}
                                  >
                                    {step}
                                  </p>

                                </div>
                              );
                            }
                          )}

                        </div>

                      </div>
                    )}

                    {/* ================= CANCELLED ================= */}

                    {isCancelled && (
                      <div className="mt-8 rounded-2xl border border-red-500/20 bg-red-500/5 p-5">

                        <p className="text-sm leading-6 text-red-300">
                          This order has been cancelled. Please
                          contact Rhennie Tasty Shack if you need
                          further assistance.
                        </p>

                      </div>
                    )}

                    {/* ================= CURRENT STATUS ================= */}

                    {!isCancelled && (
                      <div className="mt-9 border-t border-white/5 pt-6">

                        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#666666]">
                          Current Status
                        </p>

                        <p className="mt-2 text-sm font-semibold text-white">
                          {getStatusLabel(order.status)}
                        </p>

                        <p className="mt-2 max-w-2xl text-xs leading-6 text-[#666666] sm:text-sm">
                          Your order status will update here as our
                          team processes your request.
                        </p>

                      </div>
                    )}

                  </div>

                </article>
              );
            })}

          </div>
        )}

        {/* ================= BOTTOM CTA ================= */}

        {!error && orders.length > 0 && (
          <div className="mt-14 text-center">

            <p className="text-sm text-[#666666]">
              Need help with an order?
            </p>

            <a
              href="https://wa.me/2348121577759?text=Hello%20Rhennie%20Tasty%20Shack,%20I%20need%20help%20with%20my%20order."
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex rounded-full bg-[#D4AF37] px-7 py-3.5 text-sm font-bold text-black transition hover:bg-[#E5C65A]"
            >
              Chat With Us →
            </a>

          </div>
        )}

      </div>

    </main>
  );
}
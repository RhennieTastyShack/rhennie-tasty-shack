"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { thankYouNote } from "@/lib/thank-you-notes";

type DeliveryInfo = {
  id: string;
  mode: string;
  status: string;
  tracking_token: string;
  order_code?: string | null;
  external_rider_name: string | null;
  external_rider_phone: string | null;
  riders?: {
    full_name: string;
    phone: string;
  } | null;
};

type Order = {
  id: string;
  order_no: string;
  customer_id: string | null;
  title: string;
  order_date: string | null;
  amount: number | null;
  status: string | null;
  created_at: string;
  deliveries?: DeliveryInfo | DeliveryInfo[] | null;
};

const STATUS_STEPS = [
  "IN REVIEW",
  "CONFIRMED",
  "PREPARING",
  "OUT FOR DELIVERY",
  "COMPLETED",
];

export default function OrdersPage() {
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadOrders() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.access_token) {
          router.replace(
            `/login?next=${encodeURIComponent("/client-portal/orders")}`
          );
          return;
        }

        const response = await fetch("/api/orders", {
          cache: "no-store",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Unable to load orders");
        }

        const data = await response.json();

        if (active) {
          setOrders(Array.isArray(data) ? data : data?.orders || []);
        }
      } catch (loadError) {
        console.error("Orders loading error:", loadError);

        if (active) {
          setError("Unable to load your orders.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadOrders();

    return () => {
      active = false;
    };
  }, [router]);

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

    const index = STATUS_STEPS.indexOf(
      status.toUpperCase()
    );

    return index === -1 ? 0 : index;
  }

  function getProgressWidth(status: string | null) {
    const index = getStatusIndex(status);

    if (index === 0) return "w-1/5";
    if (index === 1) return "w-2/5";
    if (index === 2) return "w-3/5";
    if (index === 3) return "w-4/5";
    if (index === 4) return "w-full";

    return "w-1/5";
  }

  function getStatusLabel(status: string | null) {
    if (!status) return "In Review";

    return status
      .toLowerCase()
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  }

  function isStepCompleted(
    status: string | null,
    stepIndex: number
  ) {
    return getStatusIndex(status) >= stepIndex;
  }

  function orderHref(order: Order) {
    const deliveryRaw = order.deliveries;
    const delivery = Array.isArray(deliveryRaw) ? deliveryRaw[0] : deliveryRaw;

    if (delivery?.tracking_token) {
      return `/track/${encodeURIComponent(delivery.tracking_token)}`;
    }

    return `/client-portal/event-concierge/quotation/${order.id}`;
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#080808] px-6 py-16 text-white">
        <div className="mx-auto max-w-6xl text-center">
          <p className="text-[#D4AF37]">
            Loading your orders...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#080808] px-6 py-12 text-white md:px-10">
      <div className="mx-auto max-w-6xl">

        {/* HEADER */}
        <div className="mb-10">
          <span className="inline-block rounded-full border border-[#D4AF37]/30 bg-[#111111] px-4 py-2 text-xs uppercase tracking-[0.3em] text-[#D4AF37]">
            Client Portal
          </span>

          <h1 className="mt-5 text-4xl font-bold md:text-5xl">
            My Orders
          </h1>

          <p className="mt-3 text-[#B8B8B8]">
            View and track your current and previous orders
            with Rhennie Tasty Shack.
          </p>

          <Link
            href="/client-portal"
            className="mt-5 inline-block text-sm text-[#D4AF37] hover:underline"
          >
            ← Back to Dashboard
          </Link>
        </div>

        {/* ERROR */}
        {error && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-red-300">
            {error}
          </div>
        )}

        {/* EMPTY STATE */}
        {!error && orders.length === 0 && (
          <div className="rounded-3xl border border-[#D4AF37]/20 bg-[#111111] px-6 py-16 text-center">

            <h2 className="text-2xl font-semibold">
              No orders yet
            </h2>

            <p className="mx-auto mt-3 max-w-xl text-[#A8A8A8]">
              You don't have any orders yet. Start a consultation
              or place an order and it will appear here.
            </p>

            <Link
              href="/client-portal/event-concierge"
              className="mt-7 inline-block rounded-full bg-[#D4AF37] px-6 py-3 font-semibold text-black transition hover:bg-[#E5C65A]"
            >
              Start a Consultation
            </Link>

          </div>
        )}

        {/* ORDERS */}
        {orders.length > 0 && (
          <div className="space-y-6">

            {orders.map((order) => {
              const statusIndex = getStatusIndex(
                order.status
              );

              const isCancelled =
                order.status?.toUpperCase() ===
                "CANCELLED";

              return (
                <Link
                  key={order.id}
                  href={orderHref(order)}
                  className="block rounded-3xl border border-[#D4AF37]/20 bg-[#111111] p-6 transition hover:border-[#D4AF37]/60 md:p-8"
                >

                  {/* ORDER HEADER */}
                  <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">

                    <div>
                      <p className="text-xs uppercase tracking-[0.25em] text-[#D4AF37]">
                        {order.order_no}
                      </p>

                      <h2 className="mt-2 text-2xl font-semibold">
                        {order.title}
                      </h2>

                      {order.order_date && (
                        <p className="mt-2 text-sm text-[#999999]">
                          {formatDate(order.order_date)}
                        </p>
                      )}
                    </div>

                    {/* AMOUNT / STATUS */}
                    <div className="text-left md:text-right">

                      <p className="text-2xl font-bold text-[#D4AF37]">
                        {formatAmount(order.amount)}
                      </p>

                      <span
                        className={`mt-2 inline-block rounded-full border px-4 py-1 text-xs uppercase tracking-wider ${
                          isCancelled
                            ? "border-red-500/40 text-red-400"
                            : "border-[#D4AF37]/30 text-[#D4AF37]"
                        }`}
                      >
                        {getStatusLabel(order.status)}
                      </span>

                    </div>

                  </div>

                  {/* STATUS PROGRESS */}
                  {!isCancelled && (
                    <div className="mt-8">

                      {/* BAR */}
                      <div className="relative h-1 overflow-hidden rounded-full bg-[#2A2A2A]">

                        <div
                          className={`h-full bg-[#D4AF37] transition-all duration-700 ${getProgressWidth(
                            order.status
                          )}`}
                        />

                      </div>

                      {/* STEPS */}
                      <div className="mt-4 grid grid-cols-5 gap-2">

                        {STATUS_STEPS.map(
                          (step, index) => {
                            const completed =
                              isStepCompleted(
                                order.status,
                                index
                              );

                            return (
                              <div
                                key={step}
                                className="text-center"
                              >

                                <div
                                  className={`mx-auto flex h-7 w-7 items-center justify-center rounded-full border text-xs ${
                                    completed
                                      ? "border-[#D4AF37] bg-[#D4AF37] text-black"
                                      : "border-[#444444] bg-[#181818] text-[#666666]"
                                  }`}
                                >
                                  {completed
                                    ? "✓"
                                    : index + 1}
                                </div>

                                <p
                                  className={`mt-2 text-[9px] uppercase tracking-wider md:text-[10px] ${
                                    completed
                                      ? "text-[#D4AF37]"
                                      : "text-[#666666]"
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

                  {/* CANCELLED MESSAGE */}
                  {isCancelled && (
                    <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/5 p-4">
                      <p className="text-sm text-red-300">
                        This order has been cancelled.
                        Please contact Rhennie Tasty Shack
                        if you need further assistance.
                      </p>
                    </div>
                  )}

                  {/* CURRENT STATUS */}
                  {!isCancelled && (
                    <div className="mt-7 border-t border-[#222222] pt-5">
                      <p className="text-xs uppercase tracking-[0.2em] text-[#777777]">
                        Current Status
                      </p>

                      <p className="mt-2 font-semibold text-white">
                        {getStatusLabel(order.status)}
                      </p>

                      <p className="mt-1 text-sm text-[#888888]">
                        Your order status will update here as
                        our team processes your request.
                      </p>
                      <p className="mt-3 text-sm leading-6 text-[#D4AF37]">
                        {thankYouNote(order.order_date || order.created_at)}
                      </p>
                    </div>
                  )}

                  {(() => {
                    const deliveryRaw = order.deliveries;
                    const delivery = Array.isArray(deliveryRaw)
                      ? deliveryRaw[0]
                      : deliveryRaw;

                    if (!delivery?.tracking_token) {
                      return (
                        <span className="mt-6 inline-flex min-h-[40px] items-center justify-center rounded-full bg-[#D4AF37] px-5 text-xs font-bold uppercase tracking-wider text-black">
                          Open order
                        </span>
                      );
                    }

                    const riderName =
                      delivery.riders?.full_name ||
                      delivery.external_rider_name;

                    return (
                      <div className="mt-6 rounded-2xl border border-[#D4AF37]/20 bg-[#0C0C0C] p-4">
                        <p className="text-xs uppercase tracking-[0.2em] text-[#D4AF37]">
                          Delivery tracking
                        </p>
                        <p className="mt-2 text-sm text-white">
                          {delivery.status.replaceAll("_", " ")}
                          {riderName ? ` · ${riderName}` : ""}
                        </p>
                        {delivery.order_code ? (
                          <p className="mt-3 text-sm text-white">
                            Delivery code{" "}
                            <span className="font-bold tracking-[0.2em] text-[#D4AF37]">
                              {delivery.order_code}
                            </span>
                            . Give this to the rider when the order arrives.
                          </p>
                        ) : null}
                        <span
                          className="mt-4 inline-flex min-h-[40px] items-center justify-center rounded-full bg-[#D4AF37] px-5 text-xs font-bold uppercase tracking-wider text-black"
                        >
                          Open tracking
                        </span>
                      </div>
                    );
                  })()}

                </Link>
              );
            })}

          </div>
        )}

      </div>
    </main>
  );
}
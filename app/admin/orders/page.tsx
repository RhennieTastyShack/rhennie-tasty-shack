"use client";

import { useEffect, useState } from "react";

type Consultation = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  event_type: string | null;
  event_date: string | null;
  event_time: string | null;
  guest_count: number | null;
  venue: string | null;
  budget: number | null;
  special_request: string | null;
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
  consultation?: Consultation | Consultation[] | null;
};

const STATUS_STEPS = [
  "IN REVIEW",
  "CONFIRMED",
  "PREPARING",
  "OUT FOR DELIVERY",
  "COMPLETED",
];

const STATUS_OPTIONS = [
  "IN REVIEW",
  "CONFIRMED",
  "PREPARING",
  "OUT FOR DELIVERY",
  "COMPLETED",
  "CANCELLED",
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);

  async function loadOrders() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/orders", {
        cache: "no-store",
      });

      const text = await response.text();

      let result: unknown = [];

      if (text) {
        try {
          result = JSON.parse(text);
        } catch {
          throw new Error("The server returned an invalid response.");
        }
      }

      if (!response.ok) {
        const errorMessage =
          typeof result === "object" &&
          result !== null &&
          "error" in result
            ? String(
                (result as { error?: unknown }).error ||
                  "Unable to load orders."
              )
            : "Unable to load orders.";

        throw new Error(errorMessage);
      }

      if (!Array.isArray(result)) {
        throw new Error("Invalid orders response.");
      }

      setOrders(result as Order[]);
    } catch (error) {
      console.error("Orders loading error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Unable to load orders."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  async function updateOrderStatus(
    orderId: string,
    status: string
  ) {
    try {
      setUpdatingOrder(orderId);
      setError("");

      const response = await fetch("/api/orders/status", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
          status,
        }),
      });

      const text = await response.text();

      let result: {
        success?: boolean;
        message?: string;
        error?: string;
        order?: Order;
      } = {};

      if (text) {
        try {
          result = JSON.parse(text);
        } catch {
          throw new Error(
            "The server returned an invalid response."
          );
        }
      }

      if (!response.ok) {
        throw new Error(
          result.error || "Unable to update order status."
        );
      }

      if (!result.success) {
        throw new Error(
          result.error || "Unable to update order status."
        );
      }

      setOrders((currentOrders: Order[]) =>
        currentOrders.map((order: Order) =>
          order.id === orderId
            ? {
                ...order,
                status: status,
              }
            : order
        )
      );
    } catch (error) {
      console.error(
        "Update order status error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Unable to update order status."
      );
    } finally {
      setUpdatingOrder(null);
    }
  }

  function formatAmount(amount: number | null) {
    if (amount === null || amount === undefined) {
      return "₦0";
    }

    return `₦${Number(amount).toLocaleString("en-NG")}`;
  }

  function formatDate(date: string | null) {
    if (!date) return "No date";

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

  function getStatusLabel(status: string | null) {
    if (!status) return "In Review";

    return status
      .toLowerCase()
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  }

  function getConsultation(
    consultation:
      | Consultation
      | Consultation[]
      | null
      | undefined
  ) {
    if (Array.isArray(consultation)) {
      return consultation[0] || null;
    }

    return consultation || null;
  }

  function getStatusBadgeClass(status: string | null) {
    switch (status?.toUpperCase()) {
      case "CONFIRMED":
        return "border-blue-500/30 bg-blue-500/10 text-blue-300";

      case "PREPARING":
        return "border-orange-500/30 bg-orange-500/10 text-orange-300";

      case "OUT FOR DELIVERY":
        return "border-purple-500/30 bg-purple-500/10 text-purple-300";

      case "COMPLETED":
        return "border-green-500/30 bg-green-500/10 text-green-300";

      case "CANCELLED":
        return "border-red-500/30 bg-red-500/10 text-red-300";

      default:
        return "border-[#D4AF37]/30 bg-[#D4AF37]/10 text-[#D4AF37]";
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#080808] px-6 py-16 text-white">
        <div className="mx-auto max-w-7xl text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-[#D4AF37]">
            Admin Orders
          </p>

          <h1 className="mt-4 text-4xl font-bold">
            Loading Orders...
          </h1>

          <p className="mt-3 text-[#888888]">
            Please wait while we load your orders.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#080808] px-5 py-10 text-white md:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}
        <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <span className="inline-block rounded-full border border-[#D4AF37]/30 bg-[#111111] px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#D4AF37]">
              Rhennie Studio
            </span>

            <h1 className="mt-5 text-4xl font-bold md:text-5xl">
              Orders
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#999999]">
              Manage customer orders, update order progress
              and keep track of every request.
            </p>
          </div>

          <button
            type="button"
            onClick={loadOrders}
            className="rounded-xl border border-[#D4AF37]/30 bg-[#111111] px-5 py-3 text-sm font-semibold text-[#D4AF37] transition hover:bg-[#D4AF37] hover:text-black"
          >
            ↻ Refresh Orders
          </button>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-5">
            <p className="text-sm font-semibold text-red-300">
              {error}
            </p>
          </div>
        )}

        {/* ORDER COUNT */}
        <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-5">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-[#777777]">
              Total Orders
            </p>

            <p className="mt-1 text-2xl font-bold text-[#D4AF37]">
              {orders.length}
            </p>
          </div>
        </div>

        {/* EMPTY */}
        {orders.length === 0 && (
          <div className="rounded-3xl border border-white/10 bg-[#111111] px-6 py-20 text-center">
            <div className="text-4xl">
              📦
            </div>

            <h2 className="mt-5 text-2xl font-bold">
              No Orders Yet
            </h2>

            <p className="mt-3 text-sm text-[#888888]">
              New customer orders will appear here.
            </p>
          </div>
        )}

        {/* ORDERS */}
        <div className="space-y-6">
          {orders.map((order) => {
            const consultation =
              getConsultation(order.consultation);

            const statusIndex =
              getStatusIndex(order.status);

            const isCancelled =
              order.status?.toUpperCase() ===
              "CANCELLED";

            return (
              <div
                key={order.id}
                className="overflow-hidden rounded-3xl border border-[#D4AF37]/20 bg-[#111111]"
              >

                {/* ORDER TOP */}
                <div className="border-b border-white/10 p-6 md:p-8">
                  <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-start">

                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#D4AF37]">
                        {order.order_no}
                      </p>

                      <h2 className="mt-3 text-2xl font-bold md:text-3xl">
                        {order.title}
                      </h2>

                      <p className="mt-2 text-sm text-[#777777]">
                        Created{" "}
                        {formatDate(order.created_at)}
                      </p>
                    </div>

                    <div className="lg:text-right">
                      <p className="text-xs uppercase tracking-[0.25em] text-[#666666]">
                        Order Value
                      </p>

                      <p className="mt-1 text-3xl font-bold text-[#D4AF37]">
                        {formatAmount(order.amount)}
                      </p>

                      <span
                        className={`mt-3 inline-block rounded-full border px-4 py-1.5 text-xs font-bold uppercase tracking-wider ${getStatusBadgeClass(
                          order.status
                        )}`}
                      >
                        {getStatusLabel(order.status)}
                      </span>
                    </div>

                  </div>
                </div>

                {/* CUSTOMER / EVENT DETAILS */}
                {consultation && (
                  <div className="grid gap-6 border-b border-white/10 p-6 md:grid-cols-2 md:p-8 lg:grid-cols-3">

                    <div>
                      <p className="text-[10px] uppercase tracking-[0.25em] text-[#666666]">
                        Customer
                      </p>

                      <p className="mt-2 font-semibold">
                        {consultation.full_name ||
                          "Not provided"}
                      </p>

                      <p className="mt-1 text-sm text-[#888888]">
                        {consultation.email ||
                          "No email"}
                      </p>

                      <p className="mt-1 text-sm text-[#888888]">
                        {consultation.phone ||
                          "No phone"}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] uppercase tracking-[0.25em] text-[#666666]">
                        Event
                      </p>

                      <p className="mt-2 font-semibold">
                        {consultation.event_type ||
                          "Not specified"}
                      </p>

                      <p className="mt-1 text-sm text-[#888888]">
                        {consultation.event_date
                          ? formatDate(
                              consultation.event_date
                            )
                          : "Date not specified"}
                      </p>

                      <p className="mt-1 text-sm text-[#888888]">
                        {consultation.event_time ||
                          "Time not specified"}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] uppercase tracking-[0.25em] text-[#666666]">
                        Guests / Venue
                      </p>

                      <p className="mt-2 font-semibold">
                        {consultation.guest_count
                          ? `${consultation.guest_count} guests`
                          : "Guest count not provided"}
                      </p>

                      <p className="mt-1 text-sm text-[#888888]">
                        {consultation.venue ||
                          "Venue not provided"}
                      </p>
                    </div>

                    {consultation.budget && (
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.25em] text-[#666666]">
                          Budget
                        </p>

                        <p className="mt-2 font-semibold text-[#D4AF37]">
                          {formatAmount(
                            consultation.budget
                          )}
                        </p>
                      </div>
                    )}

                    {consultation.special_request && (
                      <div className="md:col-span-2">
                        <p className="text-[10px] uppercase tracking-[0.25em] text-[#666666]">
                          Special Requests
                        </p>

                        <p className="mt-2 text-sm leading-6 text-[#AAAAAA]">
                          {consultation.special_request}
                        </p>
                      </div>
                    )}

                  </div>
                )}

                {/* PROGRESS */}
                {!isCancelled && (
                  <div className="p-6 md:p-8">

                    <div className="mb-6 flex items-center justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.25em] text-[#666666]">
                          Order Progress
                        </p>

                        <p className="mt-1 font-semibold">
                          {getStatusLabel(
                            order.status
                          )}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-[#666666]">
                          Stage
                        </p>

                        <p className="mt-1 font-bold text-[#D4AF37]">
                          {statusIndex + 1} of{" "}
                          {STATUS_STEPS.length}
                        </p>
                      </div>
                    </div>

                    {/* BAR */}
                    <div className="relative h-1 overflow-hidden rounded-full bg-[#2A2A2A]">
                      <div
                        className="h-full bg-[#D4AF37] transition-all duration-500"
                        style={{
                          width: `${
                            ((statusIndex + 1) /
                              STATUS_STEPS.length) *
                            100
                          }%`,
                        }}
                      />
                    </div>

                    {/* STEPS */}
                    <div className="mt-5 grid grid-cols-5 gap-2">
                      {STATUS_STEPS.map(
                        (step, index) => {
                          const completed =
                            statusIndex >= index;

                          return (
                            <div
                              key={step}
                              className="text-center"
                            >
                              <div
                                className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full border text-xs font-bold ${
                                  completed
                                    ? "border-[#D4AF37] bg-[#D4AF37] text-black"
                                    : "border-[#333333] bg-[#181818] text-[#666666]"
                                }`}
                              >
                                {completed
                                  ? "✓"
                                  : index + 1}
                              </div>

                              <p
                                className={`mt-2 text-[8px] uppercase tracking-wider md:text-[10px] ${
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

                {/* CANCELLED */}
                {isCancelled && (
                  <div className="p-6 md:p-8">
                    <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5">
                      <p className="text-sm font-semibold text-red-300">
                        This order has been cancelled.
                      </p>
                    </div>
                  </div>
                )}

                {/* STATUS CONTROL */}
                <div className="border-t border-white/10 bg-[#0D0D0D] p-6 md:p-8">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                    <div>
                      <p className="text-xs uppercase tracking-[0.25em] text-[#666666]">
                        Update Order Status
                      </p>

                      <p className="mt-1 text-sm text-[#888888]">
                        Changing this will also update the
                        customer's order tracker.
                      </p>
                    </div>

                    <select
                      value={
                        order.status || "IN REVIEW"
                      }
                      disabled={
                        updatingOrder === order.id
                      }
                      onChange={(event) =>
                        updateOrderStatus(
                          order.id,
                          event.target.value
                        )
                      }
                      className="min-w-[220px] rounded-xl border border-[#D4AF37]/30 bg-[#151515] px-4 py-3 text-sm font-semibold text-[#D4AF37] outline-none transition focus:border-[#D4AF37]"
                    >
                      {STATUS_OPTIONS.map(
                        (status) => (
                          <option
                            key={status}
                            value={status}
                            className="bg-[#151515] text-white"
                          >
                            {getStatusLabel(status)}
                          </option>
                        )
                      )}
                    </select>

                  </div>

                  {updatingOrder === order.id && (
                    <p className="mt-4 text-right text-xs text-[#D4AF37]">
                      Updating order status...
                    </p>
                  )}
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </main>
  );
}
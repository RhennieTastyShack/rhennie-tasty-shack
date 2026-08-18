"use client";

import { useEffect, useState } from "react";

interface Consultation {
  id?: string;
  full_name?: string;
  email?: string;
  phone?: string;
  event_type?: string;
  event_date?: string | null;
  event_time?: string;
  guest_count?: number;
  venue?: string;
  budget?: string;
  special_request?: string;
}

interface Order {
  id: string;
  order_no: string;
  customer_id: string | null;
  title: string;
  order_date: string | null;
  amount: number;
  status: string;
  created_at: string;
  consultation_id?: string | null;
  consultation?: Consultation | null;
}

const ORDER_STATUSES = [
  "IN REVIEW",
  "CONFIRMED",
  "PREPARING",
  "OUT FOR DELIVERY",
  "COMPLETED",
  "CANCELLED",
];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    async function loadOrders() {
      try {
        const response = await fetch("/api/orders", {
          cache: "no-store",
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result?.error || "Unable to load orders."
          );
        }

        setOrders(result);
      } catch (err) {
        console.error("Orders loading error:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load orders."
        );
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, []);

  function formatAmount(amount: number) {
    return `₦${Number(amount || 0).toLocaleString("en-NG")}`;
  }

  function formatDate(date: string | null | undefined) {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-NG", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  function getStatusClass(status: string) {
    switch (status?.toUpperCase()) {
      case "COMPLETED":
        return "bg-green-100 text-green-700";

      case "CONFIRMED":
        return "bg-blue-100 text-blue-700";

      case "PREPARING":
        return "bg-yellow-100 text-yellow-700";

      case "OUT FOR DELIVERY":
        return "bg-indigo-100 text-indigo-700";

      case "IN REVIEW":
        return "bg-purple-100 text-purple-700";

      case "CANCELLED":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  }

  async function updateOrderStatus(newStatus: string) {
    if (!selectedOrder) return;

    if (newStatus === selectedOrder.status) {
      return;
    }

    setUpdatingStatus(true);
    setStatusMessage("");
    setError("");

    try {
      const response = await fetch("/api/orders/status", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: selectedOrder.id,
          status: newStatus,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.error || "Unable to update order status."
        );
      }

      const updatedOrder: Order = result.order;

      // Update the orders table
      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === updatedOrder.id
            ? {
                ...order,
                ...updatedOrder,
                consultation: order.consultation,
              }
            : order
        )
      );

      // Update the open modal
      setSelectedOrder((currentOrder) =>
        currentOrder
          ? {
              ...currentOrder,
              ...updatedOrder,
              consultation: currentOrder.consultation,
            }
          : null
      );

      setStatusMessage(
        `Order status changed to ${newStatus}.`
      );
    } catch (err) {
      console.error("Status update error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to update order status."
      );
    } finally {
      setUpdatingStatus(false);
    }
  }

  function exportOrders() {
    if (!orders.length) return;

    const headers = [
      "Order Number",
      "Customer",
      "Phone",
      "Email",
      "Service",
      "Event Date",
      "Guests",
      "Venue",
      "Budget",
      "Amount",
      "Status",
    ];

    const rows = orders.map((order) => [
      order.order_no,
      order.consultation?.full_name || "Guest",
      order.consultation?.phone || "",
      order.consultation?.email || "",
      order.title,
      order.order_date || "",
      order.consultation?.guest_count || "",
      order.consultation?.venue || "",
      order.consultation?.budget || "",
      order.amount,
      order.status,
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((value) =>
            `"${String(value).replace(/"/g, '""')}"`
          )
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "rhennie-orders.csv";
    link.click();

    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* HEADER */}
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#D4AF37]">
            Rhennie Tasty Shack
          </p>

          <h1 className="mt-2 text-4xl font-bold text-black">
            Orders
          </h1>

          <p className="mt-2 text-gray-600">
            View and manage customer orders and Event Concierge requests.
          </p>
        </div>

        <button
          onClick={exportOrders}
          className="rounded-lg bg-[#D4AF37] px-6 py-3 font-semibold text-black transition hover:bg-[#c19b2f]"
        >
          Export Orders
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {/* LOADING */}
      {loading ? (
        <div className="rounded-xl bg-white p-10 text-center shadow">
          <p className="text-gray-600">
            Loading orders...
          </p>
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-xl bg-white p-10 text-center shadow">
          <h2 className="text-xl font-semibold text-black">
            No orders yet
          </h2>

          <p className="mt-2 text-gray-500">
            New customer orders will appear here automatically.
          </p>
        </div>
      ) : (
        /* ORDERS TABLE */
        <div className="overflow-hidden rounded-xl bg-white shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px]">
              <thead className="bg-black text-white">
                <tr>
                  <th className="p-4 text-left">Order</th>
                  <th className="p-4 text-left">Customer</th>
                  <th className="p-4 text-left">Phone</th>
                  <th className="p-4 text-left">Service</th>
                  <th className="p-4 text-left">Date</th>
                  <th className="p-4 text-left">Amount</th>
                  <th className="p-4 text-left">Status</th>
                  <th className="p-4 text-left">Action</th>
                </tr>
              </thead>

              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-t border-gray-200 transition hover:bg-gray-50"
                  >
                    <td className="p-4 font-semibold text-black">
                      {order.order_no}
                    </td>

                    <td className="p-4">
                      <div className="font-semibold text-black">
                        {order.consultation?.full_name || "Guest"}
                      </div>

                      {order.customer_id && (
                        <div className="text-xs text-gray-500">
                          {order.customer_id}
                        </div>
                      )}
                    </td>

                    <td className="p-4 text-gray-700">
                      {order.consultation?.phone || "—"}
                    </td>

                    <td className="p-4 font-medium text-black">
                      {order.title}
                    </td>

                    <td className="p-4 text-gray-600">
                      {formatDate(order.order_date)}
                    </td>

                    <td className="p-4 font-semibold text-black">
                      {formatAmount(order.amount)}
                    </td>

                    <td className="p-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase ${getStatusClass(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </td>

                    <td className="p-4">
                      <button
                        onClick={() => {
                          setStatusMessage("");
                          setError("");
                          setSelectedOrder(order);
                        }}
                        className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ORDER DETAILS MODAL */}
      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            {/* MODAL HEADER */}
            <div className="flex items-center justify-between border-b border-gray-200 bg-black px-6 py-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#D4AF37]">
                  Rhennie Tasty Shack
                </p>

                <h2 className="mt-1 text-2xl font-bold text-white">
                  Order Details
                </h2>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-2xl text-white transition hover:bg-white/20"
              >
                ×
              </button>
            </div>

            {/* MODAL CONTENT */}
            <div className="space-y-6 p-6">

              {/* ORDER SUMMARY */}
              <section>
                <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Order
                    </p>

                    <h3 className="text-xl font-bold text-black">
                      {selectedOrder.order_no}
                    </h3>
                  </div>

                  <span
                    className={`w-fit rounded-full px-4 py-2 text-xs font-bold uppercase ${getStatusClass(
                      selectedOrder.status
                    )}`}
                  >
                    {selectedOrder.status}
                  </span>
                </div>

                <div className="grid gap-4 rounded-xl bg-gray-50 p-5 md:grid-cols-2">
                  <div>
                    <p className="text-sm text-gray-500">
                      Service
                    </p>

                    <p className="mt-1 font-semibold text-black">
                      {selectedOrder.title}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">
                      Amount
                    </p>

                    <p className="mt-1 text-xl font-bold text-[#B08D22]">
                      {formatAmount(selectedOrder.amount)}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">
                      Order Date
                    </p>

                    <p className="mt-1 font-semibold text-black">
                      {formatDate(selectedOrder.order_date)}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">
                      Event Type
                    </p>

                    <p className="mt-1 font-semibold text-black">
                      {selectedOrder.consultation?.event_type ||
                        "—"}
                    </p>
                  </div>
                </div>
              </section>

              {/* CHANGE STATUS */}
              <section className="rounded-xl border border-[#D4AF37]/30 bg-[#D4AF37]/5 p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-black">
                      Update Order Status
                    </h3>

                    <p className="mt-1 text-sm text-gray-600">
                      Change the current progress of this order.
                    </p>
                  </div>

                  <div className="w-full md:w-64">
                    <select
                      value={selectedOrder.status}
                      disabled={updatingStatus}
                      onChange={(event) =>
                        updateOrderStatus(event.target.value)
                      }
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 font-semibold text-black outline-none transition focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {ORDER_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {updatingStatus && (
                  <p className="mt-3 text-sm font-medium text-[#B08D22]">
                    Updating order status...
                  </p>
                )}

                {statusMessage && (
                  <p className="mt-3 text-sm font-semibold text-green-600">
                    {statusMessage}
                  </p>
                )}
              </section>

              {/* CUSTOMER */}
              <section>
                <h3 className="mb-4 text-lg font-bold text-black">
                  Customer Information
                </h3>

                <div className="grid gap-4 rounded-xl border border-gray-200 p-5 md:grid-cols-2">
                  <div>
                    <p className="text-sm text-gray-500">
                      Full Name
                    </p>

                    <p className="mt-1 font-semibold text-black">
                      {selectedOrder.consultation?.full_name ||
                        "Guest"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">
                      Phone
                    </p>

                    <p className="mt-1 font-semibold text-black">
                      {selectedOrder.consultation?.phone ||
                        "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">
                      Email
                    </p>

                    <p className="mt-1 break-all font-semibold text-black">
                      {selectedOrder.consultation?.email ||
                        "—"}
                    </p>
                  </div>
                </div>
              </section>

              {/* EVENT */}
              <section>
                <h3 className="mb-4 text-lg font-bold text-black">
                  Event Information
                </h3>

                <div className="grid gap-4 rounded-xl border border-gray-200 p-5 md:grid-cols-2">
                  <div>
                    <p className="text-sm text-gray-500">
                      Event Date
                    </p>

                    <p className="mt-1 font-semibold text-black">
                      {formatDate(
                        selectedOrder.consultation?.event_date
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">
                      Event Time
                    </p>

                    <p className="mt-1 font-semibold text-black">
                      {selectedOrder.consultation?.event_time ||
                        "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">
                      Number of Guests
                    </p>

                    <p className="mt-1 font-semibold text-black">
                      {selectedOrder.consultation?.guest_count ||
                        "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">
                      Venue
                    </p>

                    <p className="mt-1 font-semibold text-black">
                      {selectedOrder.consultation?.venue ||
                        "—"}
                    </p>
                  </div>

                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-500">
                      Budget
                    </p>

                    <p className="mt-1 font-semibold text-black">
                      {selectedOrder.consultation?.budget ||
                        "—"}
                    </p>
                  </div>
                </div>
              </section>

              {/* SPECIAL REQUEST */}
              <section>
                <h3 className="mb-4 text-lg font-bold text-black">
                  Special Request
                </h3>

                <div className="rounded-xl border border-[#D4AF37]/30 bg-[#D4AF37]/5 p-5">
                  <p className="whitespace-pre-wrap text-gray-700">
                    {selectedOrder.consultation?.special_request ||
                      "No special request provided."}
                  </p>
                </div>
              </section>
            </div>

            {/* MODAL FOOTER */}
            <div className="flex justify-end gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4">
              <button
                onClick={() => setSelectedOrder(null)}
                className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 font-semibold text-gray-700 transition hover:bg-gray-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
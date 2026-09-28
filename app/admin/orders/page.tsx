"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { selectionLabel } from "@/lib/menu-choices";

interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string | null;
  name: string;
  collection: string | null;
  quantity: number;
  unit_price: number;
  selected_size: string | null;
  item_total: number;
  created_at: string;
}

interface Consultation {
  id?: string;
  full_name?: string;
  email?: string;
  phone?: string;
  event_type?: string;
  event_date?: string | null;
  event_time?: string | null;
  guest_count?: number | null;
  venue?: string;
  budget?: string | null;
  special_request?: string | null;
}

interface Order {
  id: string;
  order_no: string;
  customer_id: string | null;
  title: string;
  order_date: string | null;
  amount: number | null;
  status: string | null;
  created_at: string;

  quotation_status?: string | null;
  quotation_notes?: string | null;
  quoted_at?: string | null;

  subtotal?: number | null;
  delivery_fee?: number | null;
  total?: number | null;

  customer_name?: string | null;
  customer_email?: string | null;
  customer_phone?: string | null;

  delivery_type?: string | null;
  delivery_address?: string | null;
  notes?: string | null;

  payment_status?: string | null;
  payment_reference?: string | null;
  payment_channel?: string | null;

  consultation_id?: string | null;

  consultation?: Consultation | null;

  order_items?: OrderItem[];
}

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

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [selectedOrder, setSelectedOrder] =
    useState<Order | null>(null);

  const [updatingStatus, setUpdatingStatus] =
    useState<string | null>(null);

  const [search, setSearch] = useState("");

  // ============================================================
  // QUOTATION STATE
  // ============================================================

  const [quotationAmount, setQuotationAmount] =
    useState("");

  const [quotationDeliveryFee, setQuotationDeliveryFee] =
    useState("");

  const [quotationStatus, setQuotationStatus] =
    useState("QUOTED");

  const [quotationNotes, setQuotationNotes] =
    useState("");

  const [savingQuotation, setSavingQuotation] =
    useState(false);

  // ============================================================
  // DELIVERY TRACKING STATE
  // ============================================================

  type DeliveryRecord = {
    id: string;
    mode: string;
    status: string;
    tracking_token: string;
    external_rider_name: string | null;
    external_rider_phone: string | null;
    rider_id: string | null;
    riders?: {
      id: string;
      full_name: string;
      phone: string;
      vehicle_type: string | null;
    } | null;
  };

  type AvailableRider = {
    id: string;
    full_name: string;
    phone: string;
    vehicle_type: string | null;
    is_available: boolean;
  };

  const [orderDelivery, setOrderDelivery] =
    useState<DeliveryRecord | null>(null);
  const [availableRiders, setAvailableRiders] = useState<
    AvailableRider[]
  >([]);
  const [deliveryLoading, setDeliveryLoading] = useState(false);
  const [deliveryBusy, setDeliveryBusy] = useState(false);
  const [assignRiderId, setAssignRiderId] = useState("");
  const [editExternalName, setEditExternalName] = useState("");
  const [editExternalPhone, setEditExternalPhone] = useState("");
  const [deliveryStatusDraft, setDeliveryStatusDraft] =
    useState("");

  // ============================================================
  // LOAD ORDERS
  // ============================================================

  async function loadOrders(showRefreshing = false) {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

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

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.error || "Unable to load orders."
        );
      }

      setOrders(
        Array.isArray(result) ? result : []
      );

      const openId = new URLSearchParams(window.location.search).get(
        "open"
      );

      if (openId) {
        const list = Array.isArray(result) ? result : [];
        const match = list.find((order) => {
          const number = String(order.order_no || "").replace(/[^a-z0-9]/gi, "");
          const wanted = openId.replace(/[^a-z0-9]/gi, "");
          return order.id === openId || number.toLowerCase() === wanted.toLowerCase();
        });

        if (match) {
          openOrder(match);
        }
      }
    } catch (err) {
      console.error("Orders loading error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load orders."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  // ============================================================
  // FORMATTERS
  // ============================================================

  function formatAmount(
    amount: number | null | undefined
  ) {
    return `₦${Number(amount || 0).toLocaleString(
      "en-NG"
    )}`;
  }

  function formatDate(
    date: string | null | undefined
  ) {
    if (!date) return "—";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "—";
    }

    return parsed.toLocaleDateString(
      "en-NG",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  }

  function formatDateTime(
    date: string | null | undefined
  ) {
    if (!date) return "—";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "—";
    }

    return parsed.toLocaleString(
      "en-NG",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }
    );
  }

  function getStatusLabel(
    status: string | null | undefined
  ) {
    if (!status) {
      return "In Review";
    }

    return status
      .toLowerCase()
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  }

  function getStatusClass(
    status: string | null | undefined
  ) {
    switch (status?.toUpperCase()) {
      case "COMPLETED":
        return "bg-green-100 text-green-700";

      case "CONFIRMED":
        return "bg-blue-100 text-blue-700";

      case "PREPARING":
        return "bg-yellow-100 text-yellow-700";

      case "OUT FOR DELIVERY":
        return "bg-orange-100 text-orange-700";

      case "IN REVIEW":
        return "bg-purple-100 text-purple-700";

      case "CANCELLED":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  }

  // ============================================================
  // STATUS PROGRESS
  // ============================================================

  function getStatusIndex(
    status: string | null | undefined
  ) {
    if (!status) return 0;

    const index = STATUS_STEPS.indexOf(
      status.toUpperCase()
    );

    return index === -1 ? 0 : index;
  }

  function getProgressWidth(
    status: string | null | undefined
  ) {
    const index = getStatusIndex(status);

    switch (index) {
      case 0:
        return "w-1/5";

      case 1:
        return "w-2/5";

      case 2:
        return "w-3/5";

      case 3:
        return "w-4/5";

      case 4:
        return "w-full";

      default:
        return "w-1/5";
    }
  }

  function isStepCompleted(
    status: string | null | undefined,
    stepIndex: number
  ) {
    return (
      getStatusIndex(status) >= stepIndex
    );
  }

  // ============================================================
  // UPDATE ORDER STATUS
  // ============================================================

  async function authHeaders(
    extra?: Record<string, string>
  ) {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const headers: Record<string, string> = {
      ...(extra || {}),
    };

    if (session?.access_token) {
      headers.Authorization = `Bearer ${session.access_token}`;
    }

    return headers;
  }

  async function updateOrderStatus(
    orderId: string,
    status: string
  ) {
    try {
      setUpdatingStatus(orderId);
      setError("");

      const response = await fetch(
        "/api/orders/status",
        {
          method: "PATCH",
          headers: await authHeaders({
            "Content-Type": "application/json",
          }),
          body: JSON.stringify({
            orderId,
            status,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.error ||
            "Unable to update order status."
        );
      }

      setOrders((current) =>
        current.map((order) =>
          order.id === orderId
            ? {
                ...order,
                status,
              }
            : order
        )
      );

      setSelectedOrder((current) =>
        current &&
        current.id === orderId
          ? {
              ...current,
              status,
            }
          : current
      );
    } catch (err) {
      console.error(
        "Status update error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to update order status."
      );
    } finally {
      setUpdatingStatus(null);
    }
  }


  // ============================================================
  // QUOTATION
  // ============================================================

  function getCustomerBudget(order: Order | null) {
    return order?.consultation?.budget || "Not specified";
  }

  function openOrder(order: Order) {
    setSelectedOrder(order);

    setQuotationAmount(
      order.quotation_status &&
      order.amount !== null &&
      order.amount !== undefined
        ? String(order.amount)
        : ""
    );

    setQuotationDeliveryFee(
      order.delivery_fee !== null &&
      order.delivery_fee !== undefined
        ? String(order.delivery_fee)
        : "0"
    );

    setQuotationStatus(
      order.quotation_status || "QUOTED"
    );

    setQuotationNotes(
      order.quotation_notes || ""
    );

    setError("");
    void loadDeliveryForOrder(order);
  }

  async function loadDeliveryForOrder(order: Order) {
    setDeliveryLoading(true);
    setOrderDelivery(null);
    setAssignRiderId("");
    setEditExternalName("");
    setEditExternalPhone("");
    setDeliveryStatusDraft("");

    try {
      const headers = await authHeaders();
      const [deliveryRes, ridersRes] = await Promise.all([
        fetch(
          `/api/deliveries?order_id=${encodeURIComponent(order.id)}`,
          { cache: "no-store", headers }
        ),
        fetch("/api/riders?scope=available", {
          cache: "no-store",
          headers,
        }),
      ]);

      const deliveryJson = await deliveryRes.json();
      const ridersJson = await ridersRes.json();

      if (ridersJson?.success) {
        setAvailableRiders(ridersJson.riders || []);
      }

      if (deliveryJson?.success && deliveryJson.delivery) {
        const delivery = deliveryJson.delivery as DeliveryRecord;
        const rider = Array.isArray(delivery.riders)
          ? delivery.riders[0]
          : delivery.riders;

        setOrderDelivery({
          ...delivery,
          riders: rider || null,
        });
        setEditExternalName(delivery.external_rider_name || "");
        setEditExternalPhone(delivery.external_rider_phone || "");
        setDeliveryStatusDraft(delivery.status || "");
        setAssignRiderId(delivery.rider_id || "");
      }
    } catch (err) {
      console.error("Delivery load error:", err);
    } finally {
      setDeliveryLoading(false);
    }
  }

  async function patchDelivery(body: Record<string, unknown>) {
    if (!orderDelivery) return;

    setDeliveryBusy(true);
    setError("");

    try {
      const response = await fetch("/api/deliveries", {
        method: "PATCH",
        headers: await authHeaders({
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({
          delivery_id: orderDelivery.id,
          by: "admin",
          ...body,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result?.success) {
        throw new Error(
          result?.message || "Unable to update delivery."
        );
      }

      const delivery = result.delivery as DeliveryRecord;
      const rider = Array.isArray(delivery.riders)
        ? delivery.riders[0]
        : delivery.riders;

      setOrderDelivery({
        ...delivery,
        riders: rider || null,
      });
      setEditExternalName(delivery.external_rider_name || "");
      setEditExternalPhone(delivery.external_rider_phone || "");
      setDeliveryStatusDraft(delivery.status || "");
      setAssignRiderId(delivery.rider_id || "");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update delivery."
      );
    } finally {
      setDeliveryBusy(false);
    }
  }

  async function saveQuotation() {
    if (!selectedOrder) return;

    const quotedAmount = Number(quotationAmount);
    const deliveryFee = Number(
      quotationDeliveryFee || 0
    );

    if (
      !Number.isFinite(quotedAmount) ||
      quotedAmount < 0
    ) {
      setError("Please enter a valid quotation amount.");
      return;
    }

    if (
      !Number.isFinite(deliveryFee) ||
      deliveryFee < 0
    ) {
      setError("Please enter a valid delivery fee.");
      return;
    }

    try {
      setSavingQuotation(true);
      setError("");

      const response = await fetch(
        `/api/orders/${encodeURIComponent(
          selectedOrder.id
        )}/quotation`,
        {
          method: "PATCH",
          headers: await authHeaders({
            "Content-Type": "application/json",
          }),
          body: JSON.stringify({
            quoted_amount: quotedAmount,
            delivery_fee: deliveryFee,
            quotation_status: quotationStatus,
            quotation_notes: quotationNotes.trim(),
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.error || "Unable to save quotation."
        );
      }

      if (!result?.order) {
        throw new Error(
          "Quotation saved, but the updated order was not returned."
        );
      }

      const updatedOrder: Order = result.order;

      setOrders((current) =>
        current.map((order) =>
          order.id === updatedOrder.id
            ? { ...order, ...updatedOrder }
            : order
        )
      );

      setSelectedOrder((current) =>
        current && current.id === updatedOrder.id
          ? { ...current, ...updatedOrder }
          : current
      );

      setQuotationAmount(
        String(updatedOrder.amount ?? quotedAmount)
      );

      setQuotationDeliveryFee(
        String(updatedOrder.delivery_fee ?? deliveryFee)
      );

      setQuotationStatus(
        updatedOrder.quotation_status ||
          quotationStatus
      );

      setQuotationNotes(
        updatedOrder.quotation_notes ||
          quotationNotes.trim()
      );
    } catch (err) {
      console.error("Quotation save error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to save quotation."
      );
    } finally {
      setSavingQuotation(false);
    }
  }

  // ============================================================
  // SEARCH
  // ============================================================

  const filteredOrders = useMemo(() => {
    const value =
      search.trim().toLowerCase();

    if (!value) {
      return orders;
    }

    return orders.filter((order) => {
      return (
        order.order_no
          ?.toLowerCase()
          .includes(value) ||

        order.title
          ?.toLowerCase()
          .includes(value) ||

        order.status
          ?.toLowerCase()
          .includes(value) ||

        order.customer_name
          ?.toLowerCase()
          .includes(value) ||

        order.customer_email
          ?.toLowerCase()
          .includes(value) ||

        order.customer_phone
          ?.toLowerCase()
          .includes(value) ||

        order.consultation?.full_name
          ?.toLowerCase()
          .includes(value) ||

        order.consultation?.phone
          ?.toLowerCase()
          .includes(value) ||

        order.consultation?.event_type
          ?.toLowerCase()
          .includes(value) ||

        order.consultation?.venue
          ?.toLowerCase()
          .includes(value) ||

        order.order_items?.some(
          (item) =>
            item.name
              ?.toLowerCase()
              .includes(value)
        )
      );
    });
  }, [orders, search]);

  // ============================================================
  // STATISTICS
  // ============================================================

  const totalOrders = orders.length;

  const pendingOrders = orders.filter(
    (order) =>
      order.status?.toUpperCase() ===
      "IN REVIEW"
  ).length;

  const preparingOrders = orders.filter(
    (order) =>
      order.status?.toUpperCase() ===
      "PREPARING"
  ).length;

  const completedOrders = orders.filter(
    (order) =>
      order.status?.toUpperCase() ===
      "COMPLETED"
  ).length;

  // ============================================================
  // EXPORT
  // ============================================================

  function exportOrders() {
    if (!orders.length) {
      return;
    }

    const headers = [
      "Order Number",
      "Customer",
      "Phone",
      "Email",
      "Service",
      "Items",
      "Order Date",
      "Delivery Type",
      "Delivery Address",
      "Amount",
      "Customer Budget",
      "Quotation Status",
      "Quotation Notes",
      "Quoted Amount",
      "Delivery Fee",
      "Total",
      "Payment Status",
      "Status",
    ];

    const rows = orders.map((order) => {
      const items =
        order.order_items
          ?.map(
            (item) =>
              `${item.name} ${
                item.selected_size
                  ? `(${item.selected_size})`
                  : ""
              } x${item.quantity}`
          )
          .join(" | ") ||
        (order.consultation
          ? `Event Concierge - ${
              order.consultation.event_type ||
              "Catering"
            }`
          : "");

      return [
        order.order_no,

        order.customer_name ||
          order.consultation?.full_name ||
          "Guest",

        order.customer_phone ||
          order.consultation?.phone ||
          "",

        order.customer_email ||
          order.consultation?.email ||
          "",

        order.title,

        items,

        order.order_date || "",

        order.delivery_type || "",

        order.delivery_address ||
          order.consultation?.venue ||
          "",

        order.total ??
          order.amount ??
          0,

        order.consultation?.budget || "",

        order.quotation_status || "",

        order.quotation_notes || "",

        order.amount ?? 0,

        order.delivery_fee ?? 0,

        order.total ??
          order.amount ??
          0,

        order.payment_status || "",

        order.status || "",
      ];
    });

    const csv = [
      headers,
      ...rows,
    ]
      .map((row) =>
        row
          .map(
            (value) =>
              `"${String(
                value ?? ""
              ).replace(
                /"/g,
                '""'
              )}"`
          )
          .join(",")
      )
      .join("\n");

    const blob = new Blob(
      [csv],
      {
        type:
          "text/csv;charset=utf-8;",
      }
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;
    link.download =
      "rhennie-orders.csv";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <main className="min-h-screen bg-[#090909] px-4 py-12 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-[28px] border border-white/10 bg-[#111111] p-12 text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-[#D4AF37]/20 border-t-[#D4AF37]" />

            <p className="mt-5 text-sm text-white/60">
              Loading Rhennie Studio orders...
            </p>
          </div>
        </div>
      </main>
    );
  }

  // ============================================================
  // MAIN PAGE
  // ============================================================

  return (
    <main className="min-h-screen bg-[#090909] px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* ======================================================
            HEADER
        ======================================================= */}

        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-[#D4AF37]">
              Rhennie Studio
            </p>

            <h1 className="mt-2 font-serif text-4xl font-bold tracking-tight sm:text-5xl">
              Orders
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/45">
              Manage customer orders,
              monitor payment and delivery
              information, and keep track
              of every request.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">

            <button
              type="button"
              onClick={() =>
                loadOrders(true)
              }
              disabled={refreshing}
              className="rounded-xl border border-white/10 bg-[#111111] px-5 py-3 text-xs font-bold uppercase tracking-[0.15em] text-white transition hover:border-[#D4AF37]/50 hover:text-[#D4AF37] disabled:opacity-50"
            >
              {refreshing
                ? "Refreshing..."
                : "↻ Refresh Orders"}
            </button>

            <button
              type="button"
              onClick={exportOrders}
              disabled={!orders.length}
              className="rounded-xl bg-[#D4AF37] px-5 py-3 text-xs font-bold uppercase tracking-[0.15em] text-black transition hover:bg-[#E5C65A] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Export Orders
            </button>

          </div>
        </div>

        {/* ======================================================
            ERROR
        ======================================================= */}

        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* ======================================================
            STATS
        ======================================================= */}

        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">

          <div className="rounded-2xl border border-white/10 bg-[#111111] p-5">
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/35">
              Total Orders
            </p>

            <p className="mt-2 text-3xl font-bold text-white">
              {totalOrders}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#111111] p-5">
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/35">
              In Review
            </p>

            <p className="mt-2 text-3xl font-bold text-[#D4AF37]">
              {pendingOrders}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#111111] p-5">
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/35">
              Preparing
            </p>

            <p className="mt-2 text-3xl font-bold text-yellow-400">
              {preparingOrders}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#111111] p-5">
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/35">
              Completed
            </p>

            <p className="mt-2 text-3xl font-bold text-green-400">
              {completedOrders}
            </p>
          </div>

        </div>

        {/* ======================================================
            SEARCH
        ======================================================= */}

        <div className="mb-6">
          <input
            type="search"
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Search order number, customer, phone, meal, event..."
            className="min-h-[50px] w-full rounded-2xl border border-white/10 bg-[#111111] px-5 text-sm text-white outline-none placeholder:text-white/25 focus:border-[#D4AF37]"
          />
        </div>

        {/* ======================================================
            EMPTY
        ======================================================= */}

        {filteredOrders.length === 0 && (
          <div className="rounded-[28px] border border-white/10 bg-[#111111] px-6 py-16 text-center">

            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#D4AF37]">
              Rhennie Studio
            </p>

            <h2 className="mt-3 font-serif text-2xl font-bold">
              {orders.length === 0
                ? "No orders yet"
                : "No matching orders"}
            </h2>

            <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-white/40">
              {orders.length === 0
                ? "New customer orders will appear here automatically."
                : "Try another customer name, order number, phone number, meal name or event."}
            </p>

          </div>
        )}

        {/* ======================================================
            ORDER CARDS
        ======================================================= */}

        {filteredOrders.length > 0 && (
          <div className="space-y-5">

            {filteredOrders.map((order) => {
              const isCancelled =
                order.status?.toUpperCase() ===
                "CANCELLED";

              const isCatering =
                !!order.consultation;

              const customerName =
                order.customer_name ||
                order.consultation?.full_name ||
                "Guest";

              const customerPhone =
                order.customer_phone ||
                order.consultation?.phone ||
                "—";

              const customerEmail =
                order.customer_email ||
                order.consultation?.email ||
                "—";

              const amount =
                order.total ??
                order.amount ??
                0;

              return (
                <article
                  key={order.id}
                  onClick={(event) => {
                    const target = event.target as HTMLElement;
                    if (
                      target.closest(
                        "button, a, select, input, textarea, option, label"
                      )
                    ) {
                      return;
                    }
                    openOrder(order);
                  }}
                  className="cursor-pointer overflow-hidden rounded-[28px] border border-white/10 bg-[#111111] transition hover:border-[#D4AF37]/40"
                >

                  {/* ==================================================
                      ORDER TOP
                  =================================================== */}

                  <div className="border-b border-white/10 p-5 sm:p-7">

                    <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">

                      <div className="min-w-0">

                        <button
                          type="button"
                          onClick={() => openOrder(order)}
                          className="text-left"
                        >
                          <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#D4AF37] underline-offset-4 hover:underline">
                            {order.order_no}
                          </p>

                          <h2 className="mt-2 font-serif text-2xl font-bold sm:text-3xl">
                            {order.title ||
                              "Online Food Order"}
                          </h2>
                        </button>

                        <p className="mt-2 text-xs text-white/35">
                          Created{" "}
                          {formatDateTime(
                            order.created_at
                          )}
                        </p>

                      </div>

                      <div className="xl:text-right">

                        <p className="text-[8px] font-bold uppercase tracking-[0.25em] text-white/30">
                          Order Value
                        </p>

                        <p className="mt-1 text-3xl font-extrabold text-[#D4AF37]">
                          {formatAmount(
                            amount
                          )}
                        </p>

                        <span
                          className={`mt-2 inline-flex rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${getStatusClass(
                            order.status
                          )}`}
                        >
                          {getStatusLabel(
                            order.status
                          )}
                        </span>

                      </div>

                    </div>

                    {/* ==================================================
                        PROGRESS
                    =================================================== */}

                    {!isCancelled && (
                      <div className="mt-7">

                        <div className="flex items-center justify-between">

                          <p className="text-[8px] font-bold uppercase tracking-[0.25em] text-white/30">
                            Order Progress
                          </p>

                          <p className="text-xs font-bold text-[#D4AF37]">
                            Stage{" "}
                            {getStatusIndex(
                              order.status
                            ) + 1}{" "}
                            of{" "}
                            {STATUS_STEPS.length}
                          </p>

                        </div>

                        <div className="relative mt-3 h-1 overflow-hidden rounded-full bg-white/10">

                          <div
                            className={`h-full bg-[#D4AF37] transition-all duration-500 ${getProgressWidth(
                              order.status
                            )}`}
                          />

                        </div>

                        <div className="mt-4 grid grid-cols-5 gap-2">

                          {STATUS_STEPS.map(
                            (
                              step,
                              index
                            ) => {

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
                                    className={`mx-auto flex h-7 w-7 items-center justify-center rounded-full border text-[10px] font-bold ${
                                      completed
                                        ? "border-[#D4AF37] bg-[#D4AF37] text-black"
                                        : "border-white/10 bg-[#181818] text-white/30"
                                    }`}
                                  >
                                    {completed
                                      ? "✓"
                                      : index + 1}
                                  </div>

                                  <p
                                    className={`mt-2 text-[7px] uppercase tracking-wider sm:text-[8px] ${
                                      completed
                                        ? "text-[#D4AF37]"
                                        : "text-white/25"
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

                    {isCancelled && (
                      <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/5 p-4">
                        <p className="text-sm text-red-300">
                          This order has been
                          cancelled.
                        </p>
                      </div>
                    )}

                  </div>

                  {/* ==================================================
                      CUSTOMER + ORDER DETAILS
                  =================================================== */}

                  <div className="grid gap-0 lg:grid-cols-2">

                    {/* ==================================================
                        CUSTOMER
                    =================================================== */}

                    <div className="border-b border-white/10 p-5 lg:border-b-0 lg:border-r sm:p-7">

                      <p className="text-[8px] font-bold uppercase tracking-[0.25em] text-[#D4AF37]">
                        Customer
                      </p>

                      <h3 className="mt-2 text-lg font-bold">
                        {customerName}
                      </h3>

                      <div className="mt-4 space-y-2 text-xs text-white/45">

                        <p>
                          <span className="text-white/25">
                            Phone:
                          </span>{" "}
                          {customerPhone}
                        </p>

                        <p className="break-all">
                          <span className="text-white/25">
                            Email:
                          </span>{" "}
                          {customerEmail}
                        </p>

                      </div>

                      {!isCatering ? (
                        <div className="mt-5">

                          <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-white/25">
                            Receive Method
                          </p>

                          <p className="mt-1 text-sm font-semibold">
                            {order.delivery_type
                              ? order.delivery_type
                                  .toLowerCase()
                                  .replace(
                                    /^\w/,
                                    (letter) =>
                                      letter.toUpperCase()
                                  )
                              : "—"}
                          </p>

                        </div>
                      ) : (
                        <div className="mt-5">

                          <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-white/25">
                            Service Type
                          </p>

                          <p className="mt-1 text-sm font-semibold text-[#D4AF37]">
                            Event Concierge
                          </p>

                        </div>
                      )}

                    </div>

                    {/* ==================================================
                        FOOD ITEMS OR CATERING REQUEST
                    =================================================== */}

                    <div className="p-5 sm:p-7">

                      <div className="flex items-center justify-between">

                        <p className="text-[8px] font-bold uppercase tracking-[0.25em] text-[#D4AF37]">
                          {isCatering
                            ? "Catering Request"
                            : "Ordered Items"}
                        </p>

                        <span className="text-[10px] text-white/30">
                          {isCatering
                            ? "Event Concierge"
                            : `${
                                order.order_items
                                  ?.length || 0
                              } line ${
                                order.order_items
                                  ?.length ===
                                1
                                  ? "item"
                                  : "items"
                              }`}
                        </span>

                      </div>

                      <div className="mt-4">

                        {/* ==================================================
                            NORMAL FOOD ORDER
                        =================================================== */}

                        {!isCatering &&
                        order.order_items &&
                        order.order_items.length >
                          0 ? (
                          <div className="space-y-3">

                            {order.order_items
                              .slice(0, 4)
                              .map((item) => (
                                <div
                                  key={item.id}
                                  className="flex items-start justify-between gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-3"
                                >

                                  <div className="min-w-0">

                                    <p className="text-sm font-semibold">
                                      {item.name}
                                    </p>

                                    <p className="mt-1 text-[10px] text-white/35">
                                      {item.selected_size &&
                                        `${selectionLabel(item.name)}: ${item.selected_size} • `}

                                      Qty:{" "}
                                      {
                                        item.quantity
                                      }
                                    </p>

                                  </div>

                                  <p className="shrink-0 text-sm font-bold text-[#D4AF37]">
                                    {formatAmount(
                                      item.item_total
                                    )}
                                  </p>

                                </div>
                              ))}

                            {order.order_items.length >
                              4 && (
                              <p className="text-center text-[10px] text-white/30">
                                +
                                {order.order_items.length -
                                  4}{" "}
                                more item
                                {order.order_items.length -
                                  4 ===
                                1
                                  ? ""
                                  : "s"}
                              </p>
                            )}

                          </div>

                        ) : isCatering ? (

                          /* ==================================================
                              CATERING REQUEST
                          =================================================== */

                          <div className="rounded-2xl border border-[#D4AF37]/20 bg-[#D4AF37]/5 p-4">

                            <div className="grid gap-4 sm:grid-cols-2">

                              <div>
                                <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-white/30">
                                  Event
                                </p>

                                <p className="mt-1 text-sm font-semibold text-white">
                                  {order.consultation
                                    ?.event_type ||
                                    "—"}
                                </p>
                              </div>

                              <div>
                                <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-white/30">
                                  Guests
                                </p>

                                <p className="mt-1 text-sm font-semibold text-white">
                                  {order.consultation
                                    ?.guest_count
                                    ? `${order.consultation.guest_count} guests`
                                    : "—"}
                                </p>
                              </div>

                              <div>
                                <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-white/30">
                                  Event Date
                                </p>

                                <p className="mt-1 text-sm font-semibold text-white">
                                  {formatDate(
                                    order.consultation
                                      ?.event_date
                                  )}
                                </p>
                              </div>

                              <div>
                                <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-white/30">
                                  Event Time
                                </p>

                                <p className="mt-1 text-sm font-semibold text-white">
                                  {order.consultation
                                    ?.event_time ||
                                    "—"}
                                </p>
                              </div>

                              <div className="sm:col-span-2">
                                <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-white/30">
                                  Venue
                                </p>

                                <p className="mt-1 text-sm font-semibold text-white">
                                  {order.consultation
                                    ?.venue ||
                                    "—"}
                                </p>
                              </div>

                              <div className="sm:col-span-2">
                                <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-white/30">
                                  Budget
                                </p>

                                <p className="mt-1 text-lg font-bold text-[#D4AF37]">
                                  {order.consultation
                                    ?.budget ||
                                    "Not specified"}
                                </p>
                              </div>

                              {order.consultation
                                ?.special_request && (
                                <div className="sm:col-span-2">

                                  <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-white/30">
                                    Special Request
                                  </p>

                                  <p className="mt-1 text-sm leading-6 text-white/70">
                                    {
                                      order
                                        .consultation
                                        .special_request
                                    }
                                  </p>

                                </div>
                              )}

                            </div>

                          </div>

                        ) : (

                          /* ==================================================
                              EMPTY FOOD ORDER
                          =================================================== */

                          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 text-xs text-white/30">
                            No item details
                            available for
                            this order.
                          </div>
                        )}

                      </div>

                    </div>

                  </div>

                  {/* ==================================================
                      STATUS CONTROL
                  =================================================== */}

                  <div className="border-t border-white/10 bg-black/20 p-5 sm:p-7">

                    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">

                      <div>

                        <p className="text-[8px] font-bold uppercase tracking-[0.25em] text-white/30">
                          Update Order Status
                        </p>

                        <p className="mt-1 text-xs text-white/40">
                          Changing this will also
                          update the customer's
                          order tracker.
                        </p>

                      </div>

                      <div className="flex flex-col gap-3 sm:flex-row">

                        <select
                          value={
                            order.status ||
                            "IN REVIEW"
                          }
                          onChange={(event) =>
                            updateOrderStatus(
                              order.id,
                              event.target.value
                            )
                          }
                          disabled={
                            updatingStatus ===
                            order.id
                          }
                          className="min-h-[44px] rounded-xl border border-white/10 bg-[#171717] px-4 text-xs font-bold text-white outline-none focus:border-[#D4AF37] disabled:opacity-50"
                        >

                          {STATUS_OPTIONS.map(
                            (status) => (
                              <option
                                key={status}
                                value={status}
                                className="bg-[#171717]"
                              >
                                {getStatusLabel(
                                  status
                                )}
                              </option>
                            )
                          )}

                        </select>

                        <button
                          type="button"
                          onClick={() =>
                            openOrder(order)
                          }
                          className="min-h-[44px] rounded-xl border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-6 text-xs font-bold uppercase tracking-[0.12em] text-[#D4AF37] transition hover:bg-[#D4AF37] hover:text-black"
                        >
                          View Full Order
                        </button>

                      </div>

                    </div>

                  </div>

                </article>
              );
            })}

          </div>
        )}

      </div>

      {/* ============================================================
          FULL ORDER MODAL
      ============================================================ */}

      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() =>
            setSelectedOrder(null)
          }
        >

          <div
            className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-[28px] border border-white/10 bg-[#111111] shadow-2xl"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* ======================================================
                MODAL HEADER
            ======================================================= */}

            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#111111] px-5 py-5 sm:px-7">

              <div>

                <p className="text-[8px] font-bold uppercase tracking-[0.3em] text-[#D4AF37]">
                  Rhennie Studio
                </p>

                <h2 className="mt-1 font-serif text-2xl font-bold text-white">
                  Order Details
                </h2>

                <p className="mt-1 text-xs text-white/35">
                  {selectedOrder.order_no}
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedOrder(null)
                }
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-xl text-white/60 transition hover:bg-white/10 hover:text-white"
              >
                ×
              </button>

            </div>

            <div className="space-y-7 p-5 sm:p-7">

              {/* ====================================================
                  STATUS
              ===================================================== */}

              <section>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                  <div>

                    <p className="text-[8px] font-bold uppercase tracking-[0.25em] text-white/30">
                      Current Status
                    </p>

                    <p className="mt-1 text-lg font-bold">
                      {getStatusLabel(
                        selectedOrder.status
                      )}
                    </p>

                  </div>

                  <select
                    value={
                      selectedOrder.status ||
                      "IN REVIEW"
                    }
                    onChange={(event) =>
                      updateOrderStatus(
                        selectedOrder.id,
                        event.target.value
                      )
                    }
                    disabled={
                      updatingStatus ===
                      selectedOrder.id
                    }
                    className="min-h-[44px] rounded-xl border border-white/10 bg-[#181818] px-4 text-xs font-bold text-white outline-none focus:border-[#D4AF37] disabled:opacity-50"
                  >

                    {STATUS_OPTIONS.map(
                      (status) => (
                        <option
                          key={status}
                          value={status}
                          className="bg-[#181818]"
                        >
                          {getStatusLabel(
                            status
                          )}
                        </option>
                      )
                    )}

                  </select>

                </div>

              </section>

              {/* ====================================================
                  CUSTOMER
              ===================================================== */}

              <section>

                <div className="mb-4">

                  <p className="text-[8px] font-bold uppercase tracking-[0.25em] text-[#D4AF37]">
                    Customer
                  </p>

                  <h3 className="mt-1 font-serif text-xl font-bold">
                    Customer Information
                  </h3>

                </div>

                <div className="grid gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-5 sm:grid-cols-2">

                  <Info
                    label="Full Name"
                    value={
                      selectedOrder.customer_name ||
                      selectedOrder.consultation
                        ?.full_name ||
                      "Guest"
                    }
                  />

                  <Info
                    label="Phone"
                    value={
                      selectedOrder.customer_phone ||
                      selectedOrder.consultation
                        ?.phone ||
                      "—"
                    }
                  />

                  <Info
                    label="Email"
                    value={
                      selectedOrder.customer_email ||
                      selectedOrder.consultation
                        ?.email ||
                      "—"
                    }
                  />

                  <Info
                    label="Customer ID"
                    value={
                      selectedOrder.customer_id ||
                      "Guest checkout"
                    }
                  />

                </div>

              </section>

              {/* ====================================================
                  ORDER CONTENT
              ===================================================== */}

              <section>

                <div className="mb-4">

                  <p className="text-[8px] font-bold uppercase tracking-[0.25em] text-[#D4AF37]">
                    {selectedOrder.consultation
                      ? "Event Concierge"
                      : "Order"}
                  </p>

                  <h3 className="mt-1 font-serif text-xl font-bold">
                    {selectedOrder.consultation
                      ? "Catering Request"
                      : "Ordered Items"}
                  </h3>

                </div>

                {selectedOrder.consultation ? (

                  /* ==================================================
                      CATERING MODAL DETAILS
                  =================================================== */

                  <div className="grid gap-4 rounded-2xl border border-[#D4AF37]/20 bg-[#D4AF37]/5 p-5 sm:grid-cols-2">

                    <Info
                      label="Event Type"
                      value={
                        selectedOrder
                          .consultation
                          .event_type ||
                        "—"
                      }
                    />

                    <Info
                      label="Guests"
                      value={
                        selectedOrder
                          .consultation
                          .guest_count
                          ? `${selectedOrder.consultation.guest_count} guests`
                          : "—"
                      }
                    />

                    <Info
                      label="Event Date"
                      value={formatDate(
                        selectedOrder
                          .consultation
                          .event_date
                      )}
                    />

                    <Info
                      label="Event Time"
                      value={
                        selectedOrder
                          .consultation
                          .event_time ||
                        "—"
                      }
                    />

                    <Info
                      label="Venue"
                      value={
                        selectedOrder
                          .consultation
                          .venue ||
                        "—"
                      }
                    />

                    <Info
                      label="Budget"
                      value={
                        selectedOrder
                          .consultation
                          .budget ||
                        "Not specified"
                      }
                    />

                    <div className="sm:col-span-2">

                      <Info
                        label="Special Request"
                        value={
                          selectedOrder
                            .consultation
                            .special_request ||
                          "No special request."
                        }
                      />

                    </div>

                  </div>

                ) : (

                  /* ==================================================
                      FOOD ORDER MODAL ITEMS
                  =================================================== */

                  <div className="overflow-hidden rounded-2xl border border-white/10">

                    {selectedOrder.order_items &&
                    selectedOrder.order_items.length >
                      0 ? (

                      <div className="divide-y divide-white/10">

                        {selectedOrder.order_items.map(
                          (item) => (
                            <div
                              key={item.id}
                              className="flex flex-col gap-4 bg-white/[0.02] p-5 sm:flex-row sm:items-center sm:justify-between"
                            >

                              <div className="min-w-0">

                                <p className="text-base font-bold">
                                  {item.name}
                                </p>

                                <p className="mt-1 text-[10px] uppercase tracking-wider text-[#D4AF37]">
                                  {item.collection ||
                                    "Menu"}
                                </p>

                                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/40">

                                  <span>
                                    Qty:{" "}
                                    {
                                      item.quantity
                                    }
                                  </span>

                                  {item.selected_size && (
                                    <span>
                                      {selectionLabel(item.name)}:{" "}
                                      <strong className="text-white/70">
                                        {
                                          item.selected_size
                                        }
                                      </strong>
                                    </span>
                                  )}

                                  <span>
                                    Unit:{" "}
                                    {formatAmount(
                                      item.unit_price
                                    )}
                                  </span>

                                </div>

                              </div>

                              <p className="shrink-0 text-xl font-extrabold text-[#D4AF37]">
                                {formatAmount(
                                  item.item_total
                                )}
                              </p>

                            </div>
                          )
                        )}

                      </div>

                    ) : (

                      <div className="p-6 text-sm text-white/35">
                        No individual item
                        records were returned
                        for this food order.
                      </div>

                    )}

                  </div>
                )}

              </section>


              {/* ====================================================
                  QUOTATION EDITOR
              ===================================================== */}

              {selectedOrder.consultation && (
                <section>
                  <div className="mb-4">
                    <p className="text-[8px] font-bold uppercase tracking-[0.25em] text-[#D4AF37]">
                      Quotation
                    </p>

                    <h3 className="mt-1 font-serif text-xl font-bold">
                      Prepare Customer Quotation
                    </h3>

                    <p className="mt-2 text-xs leading-6 text-white/40">
                      The customer's budget is for reference only.
                      Enter the price Rhennie Tasty Shack will actually
                      charge for the event.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-[#D4AF37]/20 bg-[#D4AF37]/5 p-5">
                    <div className="grid gap-5 sm:grid-cols-2">

                      <div className="sm:col-span-2">
                        <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-white/30">
                          Customer Proposed Budget
                        </p>

                        <p className="mt-2 text-lg font-bold text-[#D4AF37]">
                          {getCustomerBudget(selectedOrder)}
                        </p>
                      </div>

                      <div>
                        <label
                          htmlFor="quotationAmount"
                          className="mb-2 block text-[9px] font-bold uppercase tracking-[0.18em] text-white/45"
                        >
                          Your Quotation
                        </label>

                        <div className="relative">
                          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-[#D4AF37]">
                            ₦
                          </span>

                          <input
                            id="quotationAmount"
                            type="number"
                            min="0"
                            step="1"
                            value={quotationAmount}
                            onChange={(event) =>
                              setQuotationAmount(event.target.value)
                            }
                            placeholder="Enter your price"
                            className="min-h-[52px] w-full rounded-xl border border-white/10 bg-[#181818] pl-9 pr-4 text-sm font-semibold text-white outline-none placeholder:text-white/20 focus:border-[#D4AF37]"
                          />
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="quotationDeliveryFee"
                          className="mb-2 block text-[9px] font-bold uppercase tracking-[0.18em] text-white/45"
                        >
                          Event logistics
                        </label>

                        <div className="relative">
                          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-[#D4AF37]">
                            ₦
                          </span>

                          <input
                            id="quotationDeliveryFee"
                            type="number"
                            min="0"
                            step="1"
                            value={quotationDeliveryFee}
                            onChange={(event) =>
                              setQuotationDeliveryFee(event.target.value)
                            }
                            placeholder="0"
                            className="min-h-[52px] w-full rounded-xl border border-white/10 bg-[#181818] pl-9 pr-4 text-sm font-semibold text-white outline-none placeholder:text-white/20 focus:border-[#D4AF37]"
                          />
                        </div>
                        <p className="mt-2 text-[11px] leading-5 text-white/35">
                          Set this for the event. Each venue, hour and guest count has its own logistics fee.
                        </p>
                      </div>

                      <div>
                        <label
                          htmlFor="quotationStatus"
                          className="mb-2 block text-[9px] font-bold uppercase tracking-[0.18em] text-white/45"
                        >
                          Quotation Status
                        </label>

                        <select
                          id="quotationStatus"
                          value={quotationStatus}
                          onChange={(event) =>
                            setQuotationStatus(event.target.value)
                          }
                          className="min-h-[52px] w-full rounded-xl border border-white/10 bg-[#181818] px-4 text-sm font-semibold text-white outline-none focus:border-[#D4AF37]"
                        >
                          <option value="NOT QUOTED" className="bg-[#181818]">
                            Not Quoted
                          </option>
                          <option value="QUOTED" className="bg-[#181818]">
                            Quoted
                          </option>
                          <option value="NEGOTIATING" className="bg-[#181818]">
                            Negotiating
                          </option>
                          <option value="ACCEPTED" className="bg-[#181818]">
                            Accepted
                          </option>
                          <option value="DECLINED" className="bg-[#181818]">
                            Declined
                          </option>
                        </select>
                      </div>

                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/35">
                          Final Total
                        </p>

                        <p className="mt-2 text-2xl font-extrabold text-[#D4AF37]">
                          {formatAmount(
                            (Number(quotationAmount) || 0) +
                              (Number(quotationDeliveryFee) || 0)
                          )}
                        </p>

                        <p className="mt-1 text-[10px] text-white/30">
                          Quotation + delivery/logistics
                        </p>
                      </div>

                      <div className="sm:col-span-2">
                        <label
                          htmlFor="quotationNotes"
                          className="mb-2 block text-[9px] font-bold uppercase tracking-[0.18em] text-white/45"
                        >
                          Quotation Notes
                          <span className="ml-1 font-normal normal-case tracking-normal text-white/25">
                            (Optional)
                          </span>
                        </label>

                        <textarea
                          id="quotationNotes"
                          value={quotationNotes}
                          onChange={(event) =>
                            setQuotationNotes(event.target.value)
                          }
                          placeholder="Add inclusions, exclusions, negotiation notes, or pricing details..."
                          rows={4}
                          className="w-full resize-none rounded-xl border border-white/10 bg-[#181818] px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-white/20 focus:border-[#D4AF37]"
                        />
                      </div>

                    </div>

                    <div className="mt-5 flex flex-col gap-3 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        {selectedOrder.quoted_at && (
                          <p className="text-[10px] text-white/30">
                            Last quoted{" "}
                            {formatDateTime(selectedOrder.quoted_at)}
                          </p>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={saveQuotation}
                        disabled={
                          savingQuotation ||
                          quotationAmount.trim() === ""
                        }
                        className="min-h-[48px] rounded-xl bg-[#D4AF37] px-7 text-xs font-bold uppercase tracking-[0.14em] text-black transition hover:bg-[#E5C65A] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {savingQuotation
                          ? "Saving Quotation..."
                          : "Save Quotation"}
                      </button>
                    </div>
                  </div>
                </section>
              )}

              {/* ====================================================
                  DELIVERY
              ===================================================== */}

              {!selectedOrder.consultation && (
                <section>

                  <div className="mb-4">

                    <p className="text-[8px] font-bold uppercase tracking-[0.25em] text-[#D4AF37]">
                      Fulfilment
                    </p>

                    <h3 className="mt-1 font-serif text-xl font-bold">
                      Delivery & Pickup
                    </h3>

                  </div>

                  <div className="grid gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-5 sm:grid-cols-2">

                    <Info
                      label="Order Type"
                      value={
                        selectedOrder.delivery_type ||
                        "—"
                      }
                    />

                    <Info
                      label="Order Date"
                      value={formatDate(
                        selectedOrder.order_date
                      )}
                    />

                    <div className="sm:col-span-2">

                      <Info
                        label="Delivery Address"
                        value={
                          selectedOrder.delivery_address ||
                          "Not provided"
                        }
                      />

                    </div>

                    <div className="sm:col-span-2">

                      <Info
                        label="Order Notes"
                        value={
                          selectedOrder.notes ||
                          "No special instructions."
                        }
                      />

                    </div>

                  </div>

                </section>
              )}

              {/* ====================================================
                  RIDER DELIVERY TRACKING
              ===================================================== */}

              {!selectedOrder.consultation &&
                selectedOrder.delivery_type === "delivery" && (
                <section>
                  <div className="mb-4">
                    <p className="text-[8px] font-bold uppercase tracking-[0.25em] text-[#D4AF37]">
                      Rider Dispatch
                    </p>
                    <h3 className="mt-1 font-serif text-xl font-bold">
                      Delivery Tracking
                    </h3>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                    {deliveryLoading ? (
                      <p className="text-sm text-white/50">
                        Loading delivery...
                      </p>
                    ) : !orderDelivery ? (
                      <p className="text-sm text-white/50">
                        No delivery record for this order yet.
                      </p>
                    ) : (
                      <div className="space-y-5">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <Info
                            label="Dispatch Mode"
                            value={
                              orderDelivery.mode ===
                              "CUSTOMER_DISPATCH"
                                ? "Customer own dispatch"
                                : "Platform rider"
                            }
                          />
                          <Info
                            label="Delivery Status"
                            value={orderDelivery.status.replaceAll(
                              "_",
                              " "
                            )}
                          />
                          <Info
                            label="Assigned Rider"
                            value={
                              orderDelivery.riders?.full_name ||
                              orderDelivery.external_rider_name ||
                              "Unassigned"
                            }
                          />
                          <Info
                            label="Rider Phone"
                            value={
                              orderDelivery.riders?.phone ||
                              orderDelivery.external_rider_phone ||
                              "—"
                            }
                          />
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={async () => {
                              const url = `${window.location.origin}/track/${orderDelivery.tracking_token}`;
                              try {
                                await navigator.clipboard.writeText(url);
                              } catch {
                                /* ignore */
                              }
                            }}
                            className="rounded-full border border-[#D4AF37]/40 px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#D4AF37]"
                          >
                            Copy tracking link
                          </button>
                          <a
                            href={`/track/${orderDelivery.tracking_token}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-full border border-white/15 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white/70"
                          >
                            Open track page
                          </a>
                        </div>

                        {orderDelivery.mode === "PLATFORM" && (
                          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                            <select
                              value={assignRiderId}
                              onChange={(e) =>
                                setAssignRiderId(e.target.value)
                              }
                              className="rounded-xl border border-white/10 bg-black/40 px-3 py-3 text-sm text-white"
                            >
                              <option value="">
                                Select available rider
                              </option>
                              {availableRiders.map((rider) => (
                                <option key={rider.id} value={rider.id}>
                                  {rider.full_name} · {rider.phone}
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              disabled={
                                deliveryBusy || !assignRiderId
                              }
                              onClick={() =>
                                patchDelivery({
                                  rider_id: assignRiderId,
                                  note: "Assigned by admin",
                                })
                              }
                              className="rounded-xl bg-[#D4AF37] px-4 py-3 text-xs font-bold uppercase tracking-wider text-black disabled:opacity-50"
                            >
                              Assign
                            </button>
                          </div>
                        )}

                        <div className="grid gap-3 sm:grid-cols-2">
                          <div>
                            <label className="mb-2 block text-xs text-white/50">
                              External rider name
                            </label>
                            <input
                              value={editExternalName}
                              onChange={(e) =>
                                setEditExternalName(e.target.value)
                              }
                              className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-3 text-sm text-white"
                            />
                          </div>
                          <div>
                            <label className="mb-2 block text-xs text-white/50">
                              External rider phone
                            </label>
                            <input
                              value={editExternalPhone}
                              onChange={(e) =>
                                setEditExternalPhone(e.target.value)
                              }
                              className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-3 text-sm text-white"
                            />
                          </div>
                        </div>

                        <button
                          type="button"
                          disabled={deliveryBusy}
                          onClick={() =>
                            patchDelivery({
                              external_rider_name: editExternalName,
                              external_rider_phone: editExternalPhone,
                              note: "Updated external rider contact",
                            })
                          }
                          className="rounded-xl border border-white/15 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white/70 disabled:opacity-50"
                        >
                          Save dispatch contact
                        </button>

                        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                          <select
                            value={deliveryStatusDraft}
                            onChange={(e) =>
                              setDeliveryStatusDraft(e.target.value)
                            }
                            className="rounded-xl border border-white/10 bg-black/40 px-3 py-3 text-sm text-white"
                          >
                            {[
                              "UNASSIGNED",
                              "ASSIGNED",
                              "PICKED_UP",
                              "ON_THE_WAY",
                              "DELIVERED",
                              "CANCELLED",
                            ].map((status) => (
                              <option key={status} value={status}>
                                {status.replaceAll("_", " ")}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            disabled={deliveryBusy || !deliveryStatusDraft}
                            onClick={() =>
                              patchDelivery({
                                status: deliveryStatusDraft,
                                note: `Status set to ${deliveryStatusDraft} by admin`,
                              })
                            }
                            className="rounded-xl bg-white px-4 py-3 text-xs font-bold uppercase tracking-wider text-black disabled:opacity-50"
                          >
                            Update status
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* ====================================================
                  PAYMENT
              ===================================================== */}

              <section>

                <div className="mb-4">

                  <p className="text-[8px] font-bold uppercase tracking-[0.25em] text-[#D4AF37]">
                    Payment
                  </p>

                  <h3 className="mt-1 font-serif text-xl font-bold">
                    Payment Information
                  </h3>

                </div>

                <div className="grid gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-5 sm:grid-cols-2">

                  <Info
                    label="Payment Status"
                    value={
                      selectedOrder.payment_status ||
                      "—"
                    }
                  />

                  <Info
                    label="Payment Channel"
                    value={
                      selectedOrder.payment_channel ||
                      "—"
                    }
                  />

                  <div className="sm:col-span-2">

                    <Info
                      label="Payment Reference"
                      value={
                        selectedOrder.payment_reference ||
                        "—"
                      }
                    />

                  </div>

                </div>

              </section>


              {/* ====================================================
                  QUOTATION SUMMARY
              ===================================================== */}

              {selectedOrder.consultation && (
                <section>
                  <div className="mb-4">
                    <p className="text-[8px] font-bold uppercase tracking-[0.25em] text-[#D4AF37]">
                      Quotation Summary
                    </p>
                  </div>

                  <div className="grid gap-4 rounded-2xl border border-[#D4AF37]/20 bg-[#D4AF37]/5 p-5 sm:grid-cols-2">
                    <Info
                      label="Customer Budget"
                      value={getCustomerBudget(selectedOrder)}
                    />

                    <Info
                      label="Quotation Status"
                      value={selectedOrder.quotation_status || "NOT QUOTED"}
                    />

                    <Info
                      label="Rhennie Quotation"
                      value={formatAmount(selectedOrder.amount)}
                    />

                    <Info
                      label="Event logistics"
                      value={formatAmount(selectedOrder.delivery_fee)}
                    />

                    <Info
                      label="Quotation Total"
                      value={formatAmount(
                        selectedOrder.total ?? selectedOrder.amount
                      )}
                    />

                    <Info
                      label="Quoted At"
                      value={
                        selectedOrder.quoted_at
                          ? formatDateTime(selectedOrder.quoted_at)
                          : "Not quoted yet"
                      }
                    />

                    <div className="sm:col-span-2">
                      <Info
                        label="Quotation Notes"
                        value={
                          selectedOrder.quotation_notes ||
                          "No quotation notes."
                        }
                      />
                    </div>
                  </div>
                </section>
              )}

              {/* ====================================================
                  TOTALS
              ===================================================== */}

              <section>

                <div className="rounded-2xl border border-[#D4AF37]/20 bg-[#D4AF37]/5 p-5">

                  <div className="space-y-3">

                    <div className="flex justify-between gap-4 text-sm">

                      <span className="text-white/40">
                        Subtotal
                      </span>

                      <span className="font-bold">
                        {formatAmount(
                          selectedOrder.subtotal ??
                            selectedOrder.amount
                        )}
                      </span>

                    </div>

                    <div className="flex justify-between gap-4 text-sm">

                      <span className="text-white/40">
                        {selectedOrder.consultation
                          ? "Event logistics"
                          : "Delivery Fee"}
                      </span>

                      <span className="font-bold">
                        {selectedOrder.delivery_fee
                          ? formatAmount(
                              selectedOrder.delivery_fee
                            )
                          : selectedOrder.consultation
                            ? "Set for this event"
                            : "Free"}
                      </span>

                    </div>

                    <div className="my-4 h-px bg-white/10" />

                    <div className="flex items-end justify-between gap-4">

                      <div>

                        <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-white/30">
                          Total
                        </p>

                        <p className="mt-1 text-xs text-white/30">
                          Order Value
                        </p>

                      </div>

                      <p className="text-3xl font-extrabold text-[#D4AF37]">
                        {formatAmount(
                          selectedOrder.total ??
                            selectedOrder.amount
                        )}
                      </p>

                    </div>

                  </div>

                </div>

              </section>

              {/* ====================================================
                  EVENT CONCIERGE INFORMATION
              ===================================================== */}

              {selectedOrder.consultation && (
                <section>

                  <div className="mb-4">

                    <p className="text-[8px] font-bold uppercase tracking-[0.25em] text-[#D4AF37]">
                      Event Concierge
                    </p>

                    <h3 className="mt-1 font-serif text-xl font-bold">
                      Event Information
                    </h3>

                  </div>

                  <div className="grid gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-5 sm:grid-cols-2">

                    <Info
                      label="Event Type"
                      value={
                        selectedOrder
                          .consultation
                          .event_type ||
                        "—"
                      }
                    />

                    <Info
                      label="Event Date"
                      value={formatDate(
                        selectedOrder
                          .consultation
                          .event_date
                      )}
                    />

                    <Info
                      label="Event Time"
                      value={
                        selectedOrder
                          .consultation
                          .event_time ||
                        "—"
                      }
                    />

                    <Info
                      label="Guests"
                      value={
                        selectedOrder
                          .consultation
                          .guest_count
                          ? `${selectedOrder.consultation.guest_count} guests`
                          : "—"
                      }
                    />

                    <Info
                      label="Venue"
                      value={
                        selectedOrder
                          .consultation
                          .venue ||
                        "—"
                      }
                    />

                    <Info
                      label="Budget"
                      value={
                        selectedOrder
                          .consultation
                          .budget ||
                        "—"
                      }
                    />

                    <div className="sm:col-span-2">

                      <Info
                        label="Special Request"
                        value={
                          selectedOrder
                            .consultation
                            .special_request ||
                          "No special request."
                        }
                      />

                    </div>

                  </div>

                </section>
              )}

            </div>

            {/* ======================================================
                MODAL FOOTER
            ======================================================= */}

            <div className="sticky bottom-0 flex justify-end border-t border-white/10 bg-[#111111] px-5 py-4 sm:px-7">

              <button
                type="button"
                onClick={() =>
                  setSelectedOrder(null)
                }
                className="rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-xs font-bold uppercase tracking-[0.12em] text-white/70 transition hover:bg-white/10 hover:text-white"
              >
                Close
              </button>

            </div>

          </div>

        </div>
      )}

    </main>
  );
}

// ============================================================
// SMALL INFO COMPONENT
// ============================================================

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/25">
        {label}
      </p>

      <p className="mt-1 whitespace-pre-wrap break-words text-sm font-semibold text-white/80">
        {value}
      </p>
    </div>
  );
}
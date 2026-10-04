"use client";

import Link from "next/link";
import {
  currentProgressIndex,
  currentProgressLabel,
  fulfilmentLabel,
  paymentStatusLabel,
  resolveFulfilmentKind,
  stepsForFulfilment,
} from "@/lib/order-progress";
import { getDeliveryStatusLabel } from "@/lib/delivery";
import { thankYouNote } from "@/lib/thank-you-notes";

export type CustomerOrderItem = {
  id?: string;
  name: string;
  quantity: number;
  unit_price?: number | null;
  item_total?: number | null;
  selected_size?: string | null;
};

export type CustomerOrderDelivery = {
  id: string;
  mode: string;
  status: string;
  tracking_token: string;
  order_code?: string | null;
  external_rider_name?: string | null;
  external_rider_phone?: string | null;
  riders?: {
    full_name?: string;
    phone?: string;
    vehicle_type?: string | null;
  } | null;
};

export type CustomerOrder = {
  id: string;
  order_no?: string | null;
  title?: string | null;
  order_date?: string | null;
  created_at: string;
  amount?: number | null;
  total?: number | null;
  status?: string | null;
  payment_status?: string | null;
  delivery_type?: string | null;
  fulfilment_method?: string | null;
  pickup_status?: string | null;
  order_items?: CustomerOrderItem[] | null;
  deliveries?: CustomerOrderDelivery | CustomerOrderDelivery[] | null;
};

function formatMoney(amount: number | null | undefined) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));
}

function formatWhen(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function firstDelivery(order: CustomerOrder) {
  const raw = order.deliveries;
  if (!raw) return null;
  return Array.isArray(raw) ? raw[0] || null : raw;
}

export default function OrderCard({
  order,
  tone = "light",
}: {
  order: CustomerOrder;
  tone?: "light" | "dark";
}) {
  const delivery = firstDelivery(order);
  const kind = resolveFulfilmentKind({
    fulfilmentMethod: order.fulfilment_method,
    deliveryType: order.delivery_type,
    deliveryMode: delivery?.mode,
  });
  const steps = stepsForFulfilment(kind);
  const progressInput = {
    status: order.status,
    paymentStatus: order.payment_status,
    fulfilmentMethod: order.fulfilment_method,
    deliveryType: order.delivery_type,
    pickupStatus: order.pickup_status,
    deliveryMode: delivery?.mode,
    deliveryStatus: delivery?.status,
  };
  const activeIndex = currentProgressIndex(progressInput);
  const cancelled = activeIndex < 0;
  const items = Array.isArray(order.order_items) ? order.order_items : [];
  const total = order.total ?? order.amount;
  const dark = tone === "dark";

  const shell = dark
    ? "rounded-[28px] border border-white/10 bg-[#111111] p-5 text-white"
    : "rounded-[28px] border border-black/[0.08] bg-white p-5 text-[#171717] shadow-sm";
  const muted = dark ? "text-[#999999]" : "text-black/50";
  const accent = dark ? "text-[#D4AF37]" : "text-[#F26A21]";
  const stepDone = dark ? "bg-[#D4AF37] text-black" : "bg-[#F26A21] text-white";
  const stepIdle = dark ? "bg-white/10 text-white/35" : "bg-black/[0.06] text-black/35";
  const barTrack = dark ? "bg-white/10" : "bg-black/[0.06]";
  const barFill = dark ? "bg-[#D4AF37]" : "bg-[#F26A21]";

  return (
    <article className={shell}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className={`text-[10px] font-bold uppercase tracking-[0.22em] ${accent}`}>
            Order {order.order_no || order.id.slice(0, 8)}
          </p>
          <p className={`mt-2 text-sm ${muted}`}>
            {formatWhen(order.created_at || order.order_date)}
          </p>
          {order.title ? (
            <p className="mt-1 text-sm font-semibold">{order.title}</p>
          ) : null}
        </div>
        <div className="text-right">
          <p className="text-lg font-extrabold">{formatMoney(total)}</p>
          <p className={`mt-1 text-xs font-semibold ${accent}`}>
            {paymentStatusLabel(order.payment_status)}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        <span
          className={`rounded-full px-3 py-1 font-semibold ${
            dark ? "bg-white/10 text-white/80" : "bg-[#F8F6F2] text-black/70"
          }`}
        >
          {fulfilmentLabel(kind)}
        </span>
        <span
          className={`rounded-full px-3 py-1 font-semibold ${
            dark ? "bg-[#D4AF37]/15 text-[#D4AF37]" : "bg-[#FFF7F2] text-[#F26A21]"
          }`}
        >
          {cancelled ? "Cancelled" : currentProgressLabel(progressInput)}
        </span>
      </div>

      {items.length > 0 ? (
        <ul className={`mt-5 space-y-2 border-t pt-4 ${dark ? "border-white/10" : "border-black/[0.06]"}`}>
          {items.map((item, index) => (
            <li
              key={item.id || `${item.name}-${index}`}
              className="flex items-start justify-between gap-3 text-sm"
            >
              <span className={muted}>
                {item.quantity}× {item.name}
                {item.selected_size ? ` (${item.selected_size})` : ""}
              </span>
              <span className="shrink-0 font-semibold">
                {formatMoney(item.item_total ?? (item.unit_price || 0) * item.quantity)}
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-6">
        <div className={`h-1.5 overflow-hidden rounded-full ${barTrack}`}>
          <div
            className={`h-full transition-all duration-500 ${barFill}`}
            style={{
              width: cancelled
                ? "100%"
                : `${Math.max(
                    8,
                    ((Math.max(activeIndex, 0) + 1) / steps.length) * 100
                  )}%`,
            }}
          />
        </div>
        <div className="mt-4 space-y-2">
          {steps.map((step, index) => {
            const done = !cancelled && activeIndex >= index;
            const current = !cancelled && activeIndex === index;
            return (
              <div
                key={step.id}
                className={`flex items-center gap-3 rounded-xl px-2 py-1.5 ${
                  current
                    ? dark
                      ? "bg-[#D4AF37]/10"
                      : "bg-[#FFF7F2]"
                    : ""
                }`}
              >
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                    done ? stepDone : stepIdle
                  }`}
                >
                  {index + 1}
                </span>
                <span className={`text-sm font-semibold ${done ? "" : muted}`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {delivery?.tracking_token ? (
        <div
          className={`mt-6 rounded-2xl border p-4 ${
            dark ? "border-[#D4AF37]/20 bg-[#0C0C0C]" : "border-black/[0.06] bg-[#F8F6F2]"
          }`}
        >
          <p className={`text-[10px] font-bold uppercase tracking-[0.2em] ${accent}`}>
            Delivery tracking
          </p>
          <p className="mt-2 text-sm">
            {getDeliveryStatusLabel(delivery.status)}
            {delivery.riders?.full_name || delivery.external_rider_name
              ? ` · ${delivery.riders?.full_name || delivery.external_rider_name}`
              : ""}
          </p>
          {delivery.order_code ? (
            <p className="mt-2 text-sm">
              Delivery code{" "}
              <span className={`font-bold tracking-[0.2em] ${accent}`}>
                {delivery.order_code}
              </span>
            </p>
          ) : null}
          <Link
            href={`/track/${encodeURIComponent(delivery.tracking_token)}`}
            className={`mt-4 inline-flex min-h-[40px] items-center justify-center rounded-full px-5 text-xs font-bold uppercase tracking-wider ${
              dark
                ? "bg-[#D4AF37] text-black"
                : "bg-[#F26A21] text-white"
            }`}
          >
            Open tracking
          </Link>
        </div>
      ) : null}

      <p className={`mt-5 text-sm leading-6 ${accent}`}>
        {thankYouNote(order.order_date || order.created_at)}
      </p>
    </article>
  );
}

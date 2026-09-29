"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Loader2, Share2 } from "lucide-react";

import {
  DELIVERY_STATUS_FLOW,
  DeliveryStatus,
  DeliveryStatusEvent,
  getDeliveryStatusLabel,
} from "@/lib/delivery";
import { thankYouNote } from "@/lib/thank-you-notes";

type TrackDelivery = {
  id: string;
  mode: string;
  status: DeliveryStatus;
  tracking_token: string;
  status_history: DeliveryStatusEvent[];
  external_rider_name: string | null;
  external_rider_phone: string | null;
  order_code?: string | null;
  tip_amount?: number | null;
  rider_latitude?: number | null;
  rider_longitude?: number | null;
  location_updated_at?: string | null;
  order: {
    id: string;
    order_no: string | null;
    customer_name: string;
    delivery_address: string | null;
    total: number | null;
    payment_status: string | null;
  } | null;
  rider: {
    id: string;
    full_name: string;
    phone: string;
    vehicle_type: string | null;
    plate_number?: string | null;
    vehicle_color?: string | null;
    vehicle_model?: string | null;
    photo_url?: string | null;
  } | null;
};

function formatMoney(amount: number | null | undefined) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));
}

function formatWhen(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-NG", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function TrackDeliveryPage() {
  const params = useParams();
  const token = String(params?.token || "");

  const [delivery, setDelivery] = useState<TrackDelivery | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [pageUrl, setPageUrl] = useState("");

  useEffect(() => {
    setPageUrl(window.location.href);
  }, []);

  useEffect(() => {
    if (!token) {
      setError("Missing tracking token.");
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      try {
        const response = await fetch(
          `/api/deliveries?token=${encodeURIComponent(token)}`,
          { cache: "no-store" }
        );
        const result = await response.json();

        if (cancelled) return;

        if (!response.ok || !result?.success) {
          setError(result?.message || "Tracking link not found.");
          setDelivery(null);
          return;
        }

        setDelivery(result.delivery);
        setError("");
      } catch {
        if (!cancelled) {
          setError("Unable to load tracking details.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();
    const interval = window.setInterval(load, 5000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [token]);

  async function copyLink() {
    try {
      const url = pageUrl || window.location.href;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F8F6F2] px-4">
        <Loader2 className="animate-spin text-[#F26A21]" size={36} />
      </main>
    );
  }

  if (error || !delivery) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F8F6F2] px-4">
        <div className="w-full max-w-md rounded-[28px] border border-black/10 bg-white p-8 text-center shadow-sm">
          <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#F26A21]">
            Rhennie Tasty Shack
          </p>
          <h1 className="mt-3 font-serif text-2xl font-bold">
            Tracking unavailable
          </h1>
          <p className="mt-3 text-sm text-black/50">
            {error || "This tracking link could not be found."}
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex min-h-[48px] items-center justify-center rounded-full bg-[#F26A21] px-6 text-sm font-bold text-white"
          >
            Back home
          </Link>
        </div>
      </main>
    );
  }

  const riderName =
    delivery.rider?.full_name || delivery.external_rider_name;
  const riderPhone =
    delivery.rider?.phone || delivery.external_rider_phone;

  const history = Array.isArray(delivery.status_history)
    ? [...delivery.status_history].sort(
        (a, b) => new Date(a.at).getTime() - new Date(b.at).getTime()
      )
    : [];

  const currentIndex = DELIVERY_STATUS_FLOW.indexOf(delivery.status);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#FFF4EC,_#F8F6F2_45%,_#F3EEE6)] px-4 py-10 text-[#171717] sm:px-6">
      <div className="mx-auto max-w-2xl">
        <div className="overflow-hidden rounded-[32px] border border-black/[0.08] bg-white shadow-[0_25px_80px_rgba(0,0,0,0.06)]">
          <div className="h-2 w-full bg-[#F26A21]" />

          <div className="px-6 py-8 sm:px-10">
            <p className="text-[9px] font-bold uppercase tracking-[0.35em] text-[#F26A21]">
              Delivery tracking
            </p>

            <h1 className="mt-3 font-serif text-3xl font-bold tracking-tight">
              {getDeliveryStatusLabel(delivery.status)}
            </h1>

            <p className="mt-2 text-sm text-black/50">
              Order {delivery.order?.order_no || "—"} ·{" "}
              {delivery.mode === "CUSTOMER_DISPATCH"
                ? "Customer dispatch"
                : "Platform rider"}
            </p>

            <div className="mt-5 rounded-2xl border border-[#F26A21]/20 bg-[#FFF7F2] px-5 py-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#F26A21]">
                A note from the kitchen
              </p>
              <p className="mt-2 text-sm leading-6 text-black/70">
                {thankYouNote()}
              </p>
            </div>

            {[
              "ASSIGNED",
              "HEADING_TO_RESTAURANT",
              "ARRIVED_AT_RESTAURANT",
              "PICKED_UP",
              "ON_THE_WAY",
              "ARRIVED_AT_CUSTOMER",
              "DELIVERED",
            ].includes(delivery.status) && (
              <div className="mt-5 overflow-hidden rounded-2xl border border-black/10">
                {delivery.rider_latitude != null &&
                delivery.rider_longitude != null ? (
                  <iframe
                    key={`${Number(delivery.rider_latitude).toFixed(5)}-${Number(delivery.rider_longitude).toFixed(5)}`}
                    title="Rider location"
                    className="h-72 w-full"
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${
                      Number(delivery.rider_longitude) - 0.008
                    }%2C${Number(delivery.rider_latitude) - 0.008}%2C${
                      Number(delivery.rider_longitude) + 0.008
                    }%2C${Number(delivery.rider_latitude) + 0.008}&layer=mapnik&marker=${delivery.rider_latitude}%2C${delivery.rider_longitude}`}
                  />
                ) : (
                  <div className="flex h-72 items-center justify-center bg-[#FAF9F7] px-6 text-center">
                    <p className="text-sm text-black/50">
                      Waiting for the rider&apos;s live location. The pin appears
                      here and moves as they travel.
                    </p>
                  </div>
                )}
                <p className="bg-[#FAF9F7] px-4 py-2 text-xs text-black/45">
                  {delivery.rider_latitude != null
                    ? `Live rider location${
                        delivery.location_updated_at
                          ? ` · updated ${formatWhen(delivery.location_updated_at)}`
                          : ""
                      }`
                    : "The rider must keep the rider portal open and allow location."}
                </p>
              </div>
            )}

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-[#FAF9F7] p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/35">
                  Customer
                </p>
                <p className="mt-2 text-sm font-semibold">
                  {delivery.order?.customer_name || "Customer"}
                </p>
                <p className="mt-1 text-xs text-black/45">
                  {delivery.order?.delivery_address || "Address on file"}
                </p>
              </div>

              <div className="rounded-2xl bg-[#FAF9F7] p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/35">
                  Rider
                </p>
                <p className="mt-2 text-sm font-semibold">
                  {riderName || "Awaiting assignment"}
                </p>
                {delivery.rider?.photo_url && (
                  <img
                    src={delivery.rider.photo_url}
                    alt=""
                    className="mt-3 h-16 w-16 rounded-full object-cover"
                  />
                )}
                <p className="mt-1 text-xs text-black/45">
                  {[
                    delivery.rider?.vehicle_model,
                    delivery.rider?.vehicle_color,
                    delivery.rider?.plate_number,
                  ]
                    .filter(Boolean)
                    .join(" · ") ||
                    riderPhone ||
                    (delivery.status === "UNASSIGNED"
                      ? "A rider will be assigned soon"
                      : "Contact unavailable")}
                </p>
              </div>
            </div>

            {delivery.order?.total != null && (
              <p className="mt-4 text-xs text-black/40">
                Order total {formatMoney(delivery.order.total)}
              </p>
            )}

            <div className="mt-8">
              <div className="relative h-1.5 overflow-hidden rounded-full bg-black/[0.06]">
                <div
                  className="h-full bg-[#F26A21] transition-all duration-700"
                  style={{
                    width:
                      delivery.status === "CANCELLED"
                        ? "100%"
                        : currentIndex <= 0
                          ? "8%"
                          : `${Math.min(
                              100,
                              (currentIndex /
                                (DELIVERY_STATUS_FLOW.length - 1)) *
                                100
                            )}%`,
                  }}
                />
              </div>

              <div className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-8">
                {DELIVERY_STATUS_FLOW.map((step, index) => {
                  const done =
                    delivery.status !== "CANCELLED" &&
                    currentIndex >= index;
                  return (
                    <div key={step} className="text-center">
                      <div
                        className={`mx-auto flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold ${
                          done
                            ? "bg-[#F26A21] text-white"
                            : "bg-black/[0.06] text-black/35"
                        }`}
                      >
                        {index + 1}
                      </div>
                      <p
                        className={`mt-2 text-[8px] font-semibold uppercase leading-3 tracking-wide ${
                          done ? "text-[#F26A21]" : "text-black/30"
                        }`}
                      >
                        {getDeliveryStatusLabel(step)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-10">
              <h2 className="font-serif text-xl font-bold">Status timeline</h2>
              <div className="mt-5 space-y-4">
                {history.length === 0 ? (
                  <p className="text-sm text-black/45">
                    No status updates yet.
                  </p>
                ) : (
                  history.map((event, index) => (
                    <div
                      key={`${event.status}-${event.at}-${index}`}
                      className="relative border-l-2 border-[#F26A21]/30 pl-5"
                    >
                      <span className="absolute -left-[5px] top-1.5 h-2 w-2 rounded-full bg-[#F26A21]" />
                      <p className="text-sm font-semibold">
                        {getDeliveryStatusLabel(event.status)}
                      </p>
                      <p className="mt-1 text-xs text-black/40">
                        {formatWhen(event.at)}
                        {event.by ? ` · ${event.by}` : ""}
                      </p>
                      {event.note && (
                        <p className="mt-1 text-xs text-black/50">
                          {event.note}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={copyLink}
                className="inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-5 text-sm font-bold text-black/65 transition hover:border-[#F26A21]/40 hover:text-[#F26A21]"
              >
                <Share2 size={16} />
                {copied ? "Link copied" : "Copy shareable link"}
              </button>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(
                  `Track this Rhennie Tasty Shack delivery: ${pageUrl || ""}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[48px] flex-1 items-center justify-center rounded-full bg-[#F26A21] px-5 text-sm font-bold text-white transition hover:bg-[#D95512]"
              >
                Share on WhatsApp
              </a>
            </div>

            <p className="mt-6 text-center text-[10px] text-black/30">
              Updates every 5 seconds · No login required
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

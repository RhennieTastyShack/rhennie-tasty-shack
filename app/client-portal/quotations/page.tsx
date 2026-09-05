"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Consultation = {
  full_name?: string | null;
  email?: string | null;
  phone?: string | null;
  event_type?: string | null;
  event_date?: string | null;
  event_time?: string | null;
  guest_count?: number | null;
  venue?: string | null;
  budget?: string | null;
  special_request?: string | null;
};

type Order = {
  id: string;
  order_no?: string | null;
  title?: string | null;

  customer_name?: string | null;
  customer_email?: string | null;
  customer_phone?: string | null;

  amount?: number | null;
  subtotal?: number | null;
  delivery_fee?: number | null;
  total?: number | null;

  quotation_status?: string | null;
  quotation_notes?: string | null;
  quoted_at?: string | null;

  status?: string | null;

  consultation?: Consultation | null;
};

function formatAmount(
  amount: number | null | undefined
) {
  return `₦${Number(amount || 0).toLocaleString("en-NG")}`;
}

function formatDate(
  date: string | null | undefined
) {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "—";
  }

  return parsed.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(
  date: string | null | undefined
) {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "—";
  }

  return parsed.toLocaleString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getStatusLabel(
  status: string | null | undefined
) {
  if (!status) {
    return "Quoted";
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
    case "QUOTED":
      return "border-green-500/20 bg-green-500/10 text-green-400";

    case "NEGOTIATING":
      return "border-yellow-500/20 bg-yellow-500/10 text-yellow-400";

    case "ACCEPTED":
      return "border-blue-500/20 bg-blue-500/10 text-blue-400";

    case "DECLINED":
      return "border-red-500/20 bg-red-500/10 text-red-400";

    default:
      return "border-white/10 bg-white/5 text-white/60";
  }
}

export default function QuotationsPage() {
  const [quotations, setQuotations] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadQuotations() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/orders", {
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.error ||
            "Unable to load quotations."
        );
      }

      const orders: Order[] = Array.isArray(result)
        ? result
        : [];

      const quotationOrders = orders.filter(
        (order) => {
          const quotationStatus =
            order.quotation_status?.toUpperCase();

          return (
            quotationStatus &&
            quotationStatus !== "NOT QUOTED"
          );
        }
      );

      setQuotations(quotationOrders);
    } catch (err) {
      console.error(
        "Quotation loading error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load quotations."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadQuotations();
  }, []);

  return (
    <main className="min-h-screen bg-[#0B0B0B] px-5 py-12 text-white sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">

        {/* =====================================================
            HEADER
        ====================================================== */}

        <div className="mb-10">
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#D4AF37]">
            Rhennie Tasty Shack
          </p>

          <h1 className="mt-3 font-serif text-4xl font-bold tracking-tight sm:text-5xl">
            My Quotations
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-white/50">
            Review quotations prepared for your
            Event Concierge requests.
          </p>
        </div>

        {/* =====================================================
            LOADING
        ====================================================== */}

        {loading && (
          <div className="flex min-h-[350px] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-white/10 border-t-[#D4AF37]" />

              <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.3em] text-white/40">
                Loading quotations
              </p>
            </div>
          </div>
        )}

        {/* =====================================================
            ERROR
        ====================================================== */}

        {!loading && error && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6">
            <p className="text-sm font-medium text-red-400">
              {error}
            </p>

            <button
              type="button"
              onClick={loadQuotations}
              className="mt-5 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-white/10"
            >
              Try Again
            </button>
          </div>
        )}

        {/* =====================================================
            EMPTY STATE
        ====================================================== */}

        {!loading &&
          !error &&
          quotations.length === 0 && (
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] px-6 py-16 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[#D4AF37]/20 bg-[#D4AF37]/10 text-2xl">
                ✦
              </div>

              <h2 className="mt-6 font-serif text-2xl font-bold">
                No quotations yet
              </h2>

              <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-white/45">
                Once our Event Concierge team prepares
                a quotation for your request, it will
                appear here.
              </p>

              <Link
                href="/client-portal/event-concierge/request"
                className="mt-7 inline-flex rounded-full bg-[#D4AF37] px-6 py-3 text-xs font-bold uppercase tracking-wider text-black transition hover:bg-[#E2C45A]"
              >
                Request Event Concierge
              </Link>
            </div>
          )}

        {/* =====================================================
            QUOTATIONS
        ====================================================== */}

        {!loading &&
          !error &&
          quotations.length > 0 && (
            <div className="grid gap-6 lg:grid-cols-2">
              {quotations.map((quotation) => {
                const consultation =
                  quotation.consultation;

                const customerName =
                  quotation.customer_name ||
                  consultation?.full_name ||
                  "Customer";

                const eventType =
                  quotation.title ||
                  consultation?.event_type ||
                  "Event Concierge";

                const total =
                  quotation.total ??
                  ((quotation.amount || 0) +
                    (quotation.delivery_fee || 0));

                return (
                  <article
                    key={quotation.id}
                    className="group overflow-hidden rounded-3xl border border-white/10 bg-[#111111] transition hover:border-[#D4AF37]/30"
                  >
                    {/* Card Top */}

                    <div className="border-b border-white/10 p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#D4AF37]">
                            Quotation
                          </p>

                          <h2 className="mt-2 font-serif text-2xl font-bold">
                            {eventType}
                          </h2>

                          <p className="mt-2 text-xs text-white/35">
                            {quotation.order_no ||
                              quotation.id}
                          </p>
                        </div>

                        <span
                          className={`shrink-0 rounded-full border px-3 py-2 text-[9px] font-bold uppercase tracking-wider ${getStatusClass(
                            quotation.quotation_status
                          )}`}
                        >
                          {getStatusLabel(
                            quotation.quotation_status
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Event Information */}

                    <div className="grid gap-px border-b border-white/10 bg-white/10 sm:grid-cols-2">
                      <div className="bg-[#111111] p-5">
                        <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/30">
                          Customer
                        </p>

                        <p className="mt-2 text-sm font-semibold text-white">
                          {customerName}
                        </p>
                      </div>

                      <div className="bg-[#111111] p-5">
                        <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/30">
                          Event Date
                        </p>

                        <p className="mt-2 text-sm font-semibold text-white">
                          {formatDate(
                            consultation?.event_date
                          )}
                        </p>
                      </div>

                      <div className="bg-[#111111] p-5">
                        <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/30">
                          Guests
                        </p>

                        <p className="mt-2 text-sm font-semibold text-white">
                          {consultation?.guest_count ??
                            "—"}
                        </p>
                      </div>

                      <div className="bg-[#111111] p-5">
                        <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/30">
                          Venue
                        </p>

                        <p className="mt-2 text-sm font-semibold text-white">
                          {consultation?.venue ||
                            "—"}
                        </p>
                      </div>
                    </div>

                    {/* Pricing */}

                    <div className="p-6">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-white/40">
                            Quotation
                          </span>

                          <span className="font-medium text-white">
                            {formatAmount(
                              quotation.amount
                            )}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <span className="text-white/40">
                            Delivery / Logistics
                          </span>

                          <span className="font-medium text-white">
                            {formatAmount(
                              quotation.delivery_fee
                            )}
                          </span>
                        </div>

                        <div className="my-4 border-t border-white/10" />

                        <div className="flex items-end justify-between gap-4">
                          <div>
                            <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#D4AF37]">
                              Final Total
                            </p>

                            <p className="mt-1 text-2xl font-bold text-[#D4AF37]">
                              {formatAmount(total)}
                            </p>
                          </div>

                          <Link
                            href={`/client-portal/event-concierge/quotation/${quotation.id}`}
                            className="rounded-full bg-[#D4AF37] px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-black transition hover:bg-[#E2C45A]"
                          >
                            View Quotation
                          </Link>
                        </div>
                      </div>

                      {/* Notes */}

                      {quotation.quotation_notes && (
                        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/30">
                            Quotation Notes
                          </p>

                          <p className="mt-2 text-sm leading-6 text-white/60">
                            {quotation.quotation_notes}
                          </p>
                        </div>
                      )}

                      {/* Quoted At */}

                      <p className="mt-5 text-[10px] text-white/25">
                        Last updated{" "}
                        {formatDateTime(
                          quotation.quoted_at
                        )}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
      </div>
    </main>
  );
}
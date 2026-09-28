"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  ArrowLeft,
  Check,
  Loader2,
  MessageCircle,
  CalendarDays,
  Clock,
  MapPin,
  Users,
  Sparkles,
} from "lucide-react";

type Consultation = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  event_type: string;
  event_date: string;
  event_time: string | null;
  guest_count: number;
  venue: string;
  budget: string | null;
  special_request: string | null;
};

type Order = {
  id: string;
  order_no: string;
  title: string;
  order_date: string | null;
  amount: number | null;
  subtotal: number | null;
  delivery_fee: number | null;
  total: number | null;
  status: string | null;
  quotation_status: string | null;
  quotation_notes: string | null;
  quoted_at: string | null;
  consultation: Consultation | null;
};

function formatPrice(
  amount: number | null | undefined
) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount ?? 0);
}

function formatDate(
  date: string | null | undefined
) {
  if (!date) {
    return "Not specified";
  }

  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export default function CustomerQuotationPage() {
  const params = useParams();

  const orderId =
    typeof params.id === "string"
      ? params.id
      : "";

  const [order, setOrder] =
    useState<Order | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [actionLoading, setActionLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [showDiscussion, setShowDiscussion] =
    useState(false);

  const [discussionMessage, setDiscussionMessage] =
    useState("");

  const [discussing, setDiscussing] =
    useState(false);

  // =====================================================
  // LOAD QUOTATION
  // =====================================================

  useEffect(() => {
    if (!orderId) {
      return;
    }

    async function loadQuotation() {
      try {
        setLoading(true);
        setError("");

        const {
          data: { session },
        } = await supabase.auth.getSession();

        const response = await fetch(
          `/api/orders/${encodeURIComponent(
            orderId
          )}`,
          {
            method: "GET",
            cache: "no-store",
            headers: session?.access_token
              ? { Authorization: `Bearer ${session.access_token}` }
              : {},
          }
        );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data?.error ||
              "Unable to load quotation."
          );
        }

        setOrder(data.order);
      } catch (err) {
        console.error(
          "Quotation loading error:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load quotation."
        );
      } finally {
        setLoading(false);
      }
    }

    loadQuotation();
  }, [orderId]);

  // =====================================================
  // TOTAL
  // =====================================================

  const total = useMemo(() => {
    if (!order) {
      return 0;
    }

    return (
      Number(order.total ?? 0) ||
      Number(order.amount ?? 0)
    );
  }, [order]);

  // =====================================================
  // ACCEPT QUOTATION
  // =====================================================

  async function handleAcceptQuotation() {
    if (!order) {
      return;
    }

    try {
      setActionLoading(true);
      setError("");
      setSuccess("");

      const {
        data: { session },
      } = await supabase.auth.getSession();

      const response = await fetch(
        `/api/orders/${encodeURIComponent(
          order.id
        )}/quotation`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...(session?.access_token
              ? { Authorization: `Bearer ${session.access_token}` }
              : {}),
          },
          body: JSON.stringify({
            quotation_status: "ACCEPTED",
            quoted_amount:
              order.amount ?? 0,
            delivery_fee:
              order.delivery_fee ?? 0,
            quotation_notes:
              order.quotation_notes || "",
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Unable to accept quotation."
        );
      }

      setOrder((current) =>
        current
          ? {
              ...current,
              ...data.order,
              status: "CONFIRMED",
            }
          : current
      );

      setSuccess(
        "Your quotation has been accepted successfully. Your event is now confirmed."
      );
    } catch (err) {
      console.error(
        "Accept quotation error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to accept quotation."
      );
    } finally {
      setActionLoading(false);
    }
  }

  // =====================================================
  // DISCUSS QUOTATION
  // =====================================================

  async function handleDiscussion() {
    if (!order) {
      return;
    }

    if (!discussionMessage.trim()) {
      setError(
        "Please enter a message before sending."
      );

      return;
    }

    try {
      setDiscussing(true);
      setError("");
      setSuccess("");

      const {
        data: { session },
      } = await supabase.auth.getSession();

      const response = await fetch(
        `/api/orders/${encodeURIComponent(
          order.id
        )}/quotation`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...(session?.access_token
              ? { Authorization: `Bearer ${session.access_token}` }
              : {}),
          },
          body: JSON.stringify({
            quotation_status:
              "NEGOTIATING",

            quoted_amount:
              order.amount ?? 0,

            delivery_fee:
              order.delivery_fee ?? 0,

            quotation_notes:
              `${order.quotation_notes || ""}\n\nCustomer message: ${discussionMessage.trim()}`,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Unable to send your message."
        );
      }

      setOrder((current) =>
        current
          ? {
              ...current,
              ...data.order,
            }
          : current
      );

      setDiscussionMessage("");
      setShowDiscussion(false);

      setSuccess(
        "Your message has been sent. Our Event Concierge team will review your request."
      );
    } catch (err) {
      console.error(
        "Quotation discussion error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to send your message."
      );
    } finally {
      setDiscussing(false);
    }
  }

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F8F6F2] px-5">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#FFF0E8] text-[#F26A21]">
            <Loader2
              size={28}
              className="animate-spin"
            />
          </div>

          <p className="mt-5 text-[9px] font-bold uppercase tracking-[0.3em] text-[#F26A21]">
            Rhennie Tasty Shack
          </p>

          <p className="mt-2 text-sm text-black/45">
            Loading your quotation...
          </p>
        </div>
      </main>
    );
  }

  // =====================================================
  // ERROR / NOT FOUND
  // =====================================================

  if (error && !order) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F8F6F2] px-5">
        <div className="w-full max-w-lg rounded-[28px] border border-black/10 bg-white p-8 text-center shadow-[0_25px_80px_rgba(0,0,0,0.08)]">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500">
            !
          </div>

          <p className="mt-6 text-[9px] font-bold uppercase tracking-[0.3em] text-[#F26A21]">
            Rhennie Tasty Shack
          </p>

          <h1 className="mt-2 font-serif text-3xl font-bold">
            Quotation Unavailable
          </h1>

          <p className="mt-4 text-sm leading-7 text-black/50">
            {error}
          </p>

          <Link
            href="/"
            className="mt-7 inline-flex min-h-[50px] items-center justify-center rounded-full bg-[#F26A21] px-7 text-sm font-bold text-white transition hover:bg-[#D95512]"
          >
            Back to Home
          </Link>
        </div>
      </main>
    );
  }

  if (!order) {
    return null;
  }

  const consultation =
    order.consultation;

  const quotationStatus =
    order.quotation_status ||
    "NOT QUOTED";

  const isAccepted =
    quotationStatus === "ACCEPTED";

  const isDeclined =
    quotationStatus === "DECLINED";

  const isQuoted =
    quotationStatus === "QUOTED" ||
    quotationStatus === "NEGOTIATING";

  return (
    <main className="min-h-screen bg-[#F8F6F2] text-[#171717]">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="border-b border-black/[0.07] bg-white">
        <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between px-5 sm:px-8">

          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-black/50 transition hover:text-[#F26A21]"
          >
            <ArrowLeft size={16} />
            Rhennie Tasty Shack
          </Link>

          <span className="text-[8px] font-bold uppercase tracking-[0.28em] text-[#F26A21]">
            Event Concierge
          </span>

        </div>
      </header>

      {/* =====================================================
          MAIN
      ====================================================== */}

      <section className="px-5 py-12 sm:px-8 sm:py-16">

        <div className="mx-auto max-w-5xl">

          {/* Intro */}

          <div className="text-center">

            <p className="text-[9px] font-bold uppercase tracking-[0.35em] text-[#F26A21]">
              Your Event Proposal
            </p>

            <h1 className="mt-3 font-serif text-4xl font-bold tracking-tight sm:text-5xl">
              Your Culinary Quotation
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-black/50">
              Thank you for choosing Rhennie Tasty
              Shack. We've reviewed your event
              requirements and prepared your quotation.
            </p>

          </div>

          {/* =================================================
              STATUS
          ================================================== */}

          <div className="mt-8 flex justify-center">

            <div
              className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[9px] font-bold uppercase tracking-[0.18em] ${
                isAccepted
                  ? "bg-green-100 text-green-700"
                  : isDeclined
                    ? "bg-red-100 text-red-700"
                    : quotationStatus ===
                        "NEGOTIATING"
                      ? "bg-amber-100 text-amber-700"
                      : isQuoted
                        ? "bg-[#FFF0E8] text-[#F26A21]"
                        : "bg-black/5 text-black/40"
              }`}
            >
              {isAccepted ? (
                <Check size={13} />
              ) : (
                <Sparkles size={13} />
              )}

              {quotationStatus}
            </div>

          </div>

          {/* =================================================
              ERROR / SUCCESS
          ================================================== */}

          {error && (
            <div className="mx-auto mt-6 max-w-3xl rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-center text-sm text-red-600">
              {error}
            </div>
          )}

          {success && (
            <div className="mx-auto mt-6 max-w-3xl rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-center text-sm text-green-700">
              {success}
            </div>
          )}

          {/* =================================================
              QUOTATION CARD
          ================================================== */}

          <div className="mt-10 overflow-hidden rounded-[32px] border border-black/[0.08] bg-white shadow-[0_25px_80px_rgba(0,0,0,0.08)]">

            {/* Dark heading */}

            <div className="bg-[#111111] px-6 py-8 text-white sm:px-10">

              <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

                <div>

                  <p className="text-[8px] font-bold uppercase tracking-[0.3em] text-[#D4AF37]">
                    Rhennie Tasty Shack
                  </p>

                  <h2 className="mt-2 font-serif text-3xl font-bold">
                    {order.title ||
                      "Event Catering"}
                  </h2>

                  <p className="mt-2 text-xs text-white/40">
                    Order #{order.order_no}
                  </p>

                </div>

                <div className="text-left sm:text-right">

                  <p className="text-[8px] font-bold uppercase tracking-[0.25em] text-white/30">
                    Total Quotation
                  </p>

                  <p className="mt-1 text-3xl font-extrabold text-[#D4AF37]">
                    {formatPrice(total)}
                  </p>

                </div>

              </div>

            </div>

            {/* Event details */}

            {consultation && (
              <div className="border-b border-black/[0.07] px-6 py-7 sm:px-10">

                <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-[#F26A21]">
                  Event Details
                </p>

                <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

                  <Detail
                    icon={<CalendarDays size={17} />}
                    label="Event Date"
                    value={formatDate(
                      consultation.event_date
                    )}
                  />

                  <Detail
                    icon={<Clock size={17} />}
                    label="Event Time"
                    value={
                      consultation.event_time ||
                      "Not specified"
                    }
                  />

                  <Detail
                    icon={<Users size={17} />}
                    label="Guests"
                    value={`${consultation.guest_count} ${
                      consultation.guest_count === 1
                        ? "Guest"
                        : "Guests"
                    }`}
                  />

                  <Detail
                    icon={<MapPin size={17} />}
                    label="Venue"
                    value={consultation.venue}
                  />

                </div>

              </div>
            )}

            {/* Pricing */}

            <div className="px-6 py-7 sm:px-10">

              <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-[#F26A21]">
                Quotation Breakdown
              </p>

              <div className="mt-5 space-y-4">

                <div className="flex items-center justify-between gap-4 text-sm">
                  <span className="text-black/45">
                    Catering
                  </span>

                  <span className="font-bold">
                    {formatPrice(
                      order.amount
                    )}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4 text-sm">
                  <span className="text-black/45">
                    Event logistics
                  </span>

                  <span className="font-bold">
                    {order.delivery_fee
                      ? formatPrice(
                          order.delivery_fee
                        )
                      : "Free"}
                  </span>
                </div>

                <div className="h-px bg-black/[0.08]" />

                <div className="flex items-end justify-between gap-4">

                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-black/35">
                      Final Total
                    </p>

                    <p className="mt-1 text-xs text-black/40">
                      Your Rhennie Tasty Shack quotation
                    </p>
                  </div>

                  <p className="text-2xl font-extrabold text-[#F26A21] sm:text-3xl">
                    {formatPrice(total)}
                  </p>

                </div>

              </div>

            </div>

            {/* Customer request */}

            {consultation?.special_request && (
              <div className="border-t border-black/[0.07] bg-[#FAF9F7] px-6 py-7 sm:px-10">

                <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-[#F26A21]">
                  Your Event Request
                </p>

                <p className="mt-4 text-sm leading-7 text-black/60">
                  {consultation.special_request}
                </p>

              </div>
            )}

            {/* Quotation notes */}

            {order.quotation_notes && (
              <div className="border-t border-black/[0.07] px-6 py-7 sm:px-10">

                <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-[#F26A21]">
                  From Our Team
                </p>

                <p className="mt-4 whitespace-pre-line text-sm leading-7 text-black/60">
                  {order.quotation_notes}
                </p>

              </div>
            )}

            {/* =================================================
                ACTIONS
            ================================================== */}

            {!isAccepted &&
              !isDeclined &&
              quotationStatus !==
                "NOT QUOTED" && (
                <div className="border-t border-black/[0.07] bg-[#111111] px-6 py-7 sm:px-10">

                  <div className="text-center">

                    <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#D4AF37]">
                      Ready To Proceed?
                    </p>

                    <h3 className="mt-2 font-serif text-2xl font-bold text-white">
                      Let's make your event memorable.
                    </h3>

                    <p className="mx-auto mt-3 max-w-xl text-xs leading-6 text-white/40">
                      Accept your quotation to confirm
                      your event, or contact our team if
                      you'd like to discuss the proposal.
                    </p>

                  </div>

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">

                    <button
                      type="button"
                      onClick={
                        handleAcceptQuotation
                      }
                      disabled={actionLoading}
                      className="inline-flex min-h-[54px] items-center justify-center rounded-full bg-[#F26A21] px-8 text-sm font-bold text-white shadow-[0_15px_35px_rgba(242,106,33,0.2)] transition hover:-translate-y-1 hover:bg-[#D95512] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {actionLoading ? (
                        <>
                          <Loader2
                            size={18}
                            className="mr-2 animate-spin"
                          />
                          Confirming...
                        </>
                      ) : (
                        <>
                          <Check
                            size={18}
                            className="mr-2"
                          />
                          Accept Quotation
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setShowDiscussion(
                          (current) =>
                            !current
                        )
                      }
                      className="inline-flex min-h-[54px] items-center justify-center rounded-full border border-white/15 bg-white/5 px-8 text-sm font-bold text-white transition hover:border-[#D4AF37] hover:text-[#D4AF37]"
                    >
                      <MessageCircle
                        size={18}
                        className="mr-2"
                      />
                      Discuss Quotation
                    </button>

                  </div>

                  {showDiscussion && (
                    <div className="mx-auto mt-6 max-w-2xl rounded-2xl border border-white/10 bg-white/[0.04] p-5">

                      <label
                        htmlFor="discussionMessage"
                        className="mb-2 block text-[9px] font-bold uppercase tracking-[0.2em] text-white/45"
                      >
                        Your Message
                      </label>

                      <textarea
                        id="discussionMessage"
                        value={
                          discussionMessage
                        }
                        onChange={(event) =>
                          setDiscussionMessage(
                            event.target.value
                          )
                        }
                        rows={4}
                        placeholder="Tell us what you'd like to discuss about the quotation..."
                        className="w-full resize-none rounded-xl border border-white/10 bg-[#181818] px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-white/20 focus:border-[#D4AF37]"
                      />

                      <button
                        type="button"
                        onClick={
                          handleDiscussion
                        }
                        disabled={discussing}
                        className="mt-4 min-h-[48px] rounded-xl bg-[#D4AF37] px-6 text-xs font-bold uppercase tracking-[0.15em] text-black transition hover:bg-[#E5C65A] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {discussing
                          ? "Sending..."
                          : "Send Message"}
                      </button>

                    </div>
                  )}

                </div>
              )}

            {/* Accepted */}

            {isAccepted && (
              <div className="border-t border-green-100 bg-green-50 px-6 py-10 text-center sm:px-10">

                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-600 text-white">
                  <Check size={30} />
                </div>

                <p className="mt-5 text-[9px] font-bold uppercase tracking-[0.3em] text-green-600">
                  Quotation Accepted
                </p>

                <h3 className="mt-2 font-serif text-3xl font-bold text-green-800">
                  Your Event Is Confirmed
                </h3>

                <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-green-700/70">
                  Thank you. Your quotation has been
                  accepted and your event is now
                  confirmed with Rhennie Tasty Shack.
                </p>

                <Link
                  href={`/client-portal/payment/${order.id}`}
                  className="mt-6 inline-flex min-h-[48px] items-center justify-center rounded-full bg-[#F26A21] px-8 text-xs font-bold uppercase tracking-[0.15em] text-white transition hover:bg-[#D95512]"
                >
                  Pay Now
                </Link>

              </div>
            )}

          </div>

          {/* Footer */}

          <div className="mt-8 text-center">

            <p className="text-[8px] font-bold uppercase tracking-[0.35em] text-black/25">
              Premium Taste
              <span className="mx-3 text-[#F26A21]">
                •
              </span>
              Fast Delivery
            </p>

          </div>

        </div>

      </section>

    </main>
  );
}

// =====================================================
// DETAIL COMPONENT
// =====================================================

function Detail({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-3">

      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FFF0E8] text-[#F26A21]">
        {icon}
      </div>

      <div className="min-w-0">

        <p className="text-[8px] font-bold uppercase tracking-[0.18em] text-black/30">
          {label}
        </p>

        <p className="mt-1 break-words text-sm font-semibold text-black/70">
          {value}
        </p>

      </div>

    </div>
  );
}
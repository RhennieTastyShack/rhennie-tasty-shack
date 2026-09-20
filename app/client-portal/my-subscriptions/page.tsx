"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

/* =========================================================
   TYPES
========================================================= */

type TimetableEntry = {
  day?: string;
  meal_preference?: string;
  delivery_time?: string;
  notes?: string;
};

type Subscription = {
  id: string;

  customer_id: string | null;
  customer_code: string | null;

  plan_slug: string | null;
  plan_name: string | null;

  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;

  delivery_days: string[] | null;
  delivery_time: string | null;
  delivery_address: string | null;

  timetable: TimetableEntry[] | null;

  special_requests: string | null;

  status: string | null;

  amount: number | null;
  currency: string | null;

  payment_status: string | null;
  payment_reference: string | null;

  admin_notes: string | null;

  start_date: string | null;
  end_date: string | null;

  created_at: string;
  updated_at: string | null;
};

type SubscriptionsResponse = {
  success?: boolean;
  message?: string;
  subscriptions?: Subscription[];
};

type PaymentResponse = {
  success?: boolean;
  message?: string;
  authorization_url?: string;
};

type RenewalResponse = {
  success?: boolean;
  message?: string;

  renewal?: {
    source_subscription_id?: string;
    customer_code?: string | null;
    customer_name?: string | null;
    customer_email?: string | null;
    customer_phone?: string | null;
    delivery_address?: string | null;
    plan_slug?: string | null;
    plan_name?: string | null;
  };
};

/* =========================================================
   SUPABASE
========================================================= */

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "";

const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";

const supabase = createClient(
  supabaseUrl,
  supabaseKey
);

/* =========================================================
   HELPERS
========================================================= */

function normalize(value?: string | null) {
  return String(value || "")
    .trim()
    .toUpperCase();
}

function formatMoney(
  amount?: number | null,
  currency?: string | null
) {
  if (
    amount === null ||
    amount === undefined
  ) {
    return "Awaiting quote";
  }

  const safeCurrency =
    currency || "NGN";

  try {
    return new Intl.NumberFormat(
      "en-NG",
      {
        style: "currency",
        currency: safeCurrency,
        maximumFractionDigits: 0,
      }
    ).format(amount);
  } catch {
    return `${safeCurrency} ${amount.toLocaleString()}`;
  }
}

function formatDate(
  value?: string | null
) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return date.toLocaleDateString(
    "en-NG",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
}

function formatTime(
  value?: string | null
) {
  if (!value) {
    return "No time";
  }

  const [
    hours,
    minutes,
  ] = value.split(":");

  const hour =
    Number(hours);

  if (
    Number.isNaN(hour)
  ) {
    return value;
  }

  const minute =
    Number(
      minutes || 0
    );

  const suffix =
    hour >= 12
      ? "PM"
      : "AM";

  const displayHour =
    hour % 12 || 12;

  return `${displayHour}:${String(
    minute
  ).padStart(
    2,
    "0"
  )} ${suffix}`;
}

function statusClass(
  value?: string | null
) {
  switch (
    normalize(value)
  ) {
    case "ACTIVE":
      return "bg-green-100 text-green-700 border-green-200";

    case "APPROVED":
      return "bg-blue-100 text-blue-700 border-blue-200";

    case "REVIEWING":
      return "bg-purple-100 text-purple-700 border-purple-200";

    case "PENDING":
      return "bg-amber-100 text-amber-700 border-amber-200";

    case "PAUSED":
      return "bg-orange-100 text-orange-700 border-orange-200";

    case "COMPLETED":
      return "bg-gray-100 text-gray-700 border-gray-200";

    case "CANCELLED":
      return "bg-red-100 text-red-700 border-red-200";

    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
}

function paymentClass(
  value?: string | null
) {
  switch (
    normalize(value)
  ) {
    case "PAID":
      return "bg-green-100 text-green-700 border-green-200";

    case "PENDING":
    case "PROCESSING":
      return "bg-amber-100 text-amber-700 border-amber-200";

    case "FAILED":
      return "bg-red-100 text-red-700 border-red-200";

    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
}

/* =========================================================
   PAGE COMPONENT
========================================================= */

export default function MySubscriptionsPage() {
  const [
    subscriptions,
    setSubscriptions,
  ] = useState<
    Subscription[]
  >([]);

  const [
    selected,
    setSelected,
  ] =
    useState<Subscription | null>(
      null
    );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    payingId,
    setPayingId,
  ] =
    useState<string | null>(
      null
    );

  const [
    renewingId,
    setRenewingId,
  ] =
    useState<string | null>(
      null
    );

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  /* =======================================================
     ACCESS TOKEN
  ======================================================= */

  async function getAccessToken() {
    const {
      data: { session },
    } =
      await supabase.auth.getSession();

    return (
      session?.access_token ||
      null
    );
  }

  /* =======================================================
     LOAD SUBSCRIPTIONS
  ======================================================= */

  async function loadSubscriptions() {
    setLoading(true);
    setErrorMessage("");

    try {
      const token =
        await getAccessToken();

      if (!token) {
        throw new Error(
          "Please sign in to view your subscriptions."
        );
      }

      const response =
        await fetch(
          "/api/subscriptions",
          {
            method: "GET",
            cache: "no-store",

            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      const result =
        (await response.json()) as SubscriptionsResponse;

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.message ||
            "Unable to load your subscriptions."
        );
      }

      setSubscriptions(
        result.subscriptions ||
          []
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to load subscriptions."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSubscriptions();
  }, []);

  /* =======================================================
     STATS
  ======================================================= */

  const stats =
    useMemo(
      () => ({
        total:
          subscriptions.length,

        active:
          subscriptions.filter(
            (item) =>
              normalize(
                item.status
              ) ===
              "ACTIVE"
          ).length,

        approved:
          subscriptions.filter(
            (item) =>
              normalize(
                item.status
              ) ===
              "APPROVED"
          ).length,

        awaitingPayment:
          subscriptions.filter(
            (item) =>
              normalize(
                item.status
              ) ===
                "APPROVED" &&
              normalize(
                item.payment_status
              ) !==
                "PAID"
          ).length,
      }),
      [subscriptions]
    );

  /* =======================================================
     PAYMENT
  ======================================================= */

  async function startPayment(
    subscription: Subscription
  ) {
    setErrorMessage("");

    setPayingId(
      subscription.id
    );

    try {
      const token =
        await getAccessToken();

      if (!token) {
        throw new Error(
          "Your session has expired. Please sign in again."
        );
      }

      const response =
        await fetch(
          `/api/subscriptions/${subscription.id}/payment`,
          {
            method: "POST",

            headers: {
              Authorization:
                `Bearer ${token}`,

              "Content-Type":
                "application/json",
            },
          }
        );

      const result =
        (await response.json()) as PaymentResponse;

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.message ||
            "Unable to start payment."
        );
      }

      if (
        !result.authorization_url
      ) {
        throw new Error(
          "Payment link was not returned."
        );
      }

      window.location.href =
        result.authorization_url;
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to start payment."
      );

      setPayingId(null);
    }
  }

  /* =======================================================
     RENEWAL
  ======================================================= */

  async function renewSubscription(
    subscription: Subscription
  ) {
    setErrorMessage("");

    setRenewingId(
      subscription.id
    );

    try {
      const token =
        await getAccessToken();

      if (!token) {
        throw new Error(
          "Your session has expired. Please sign in again."
        );
      }

      const response =
        await fetch(
          `/api/subscriptions/${subscription.id}/renew`,
          {
            method: "POST",

            headers: {
              Authorization:
                `Bearer ${token}`,

              "Content-Type":
                "application/json",
            },
          }
        );

      const result =
        (await response.json()) as RenewalResponse;

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.message ||
            "Unable to prepare this renewal."
        );
      }

      const sourceSubscriptionId =
        result.renewal
          ?.source_subscription_id;

      if (
        !sourceSubscriptionId
      ) {
        throw new Error(
          "The renewal source subscription was not returned."
        );
      }

      const planSlug =
        result.renewal
          ?.plan_slug ||
        subscription.plan_slug ||
        "weekly-plan";

      window.location.href =
        `/client-portal/subscriptions?plan=${encodeURIComponent(
          planSlug
        )}&source=${encodeURIComponent(
          sourceSubscriptionId
        )}&mode=renewal`;
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to prepare this renewal."
      );

      setRenewingId(null);
    }
  }

  /* =======================================================
     UI
  ======================================================= */

  return (
    <main className="min-h-screen bg-[#FAFAF8]">
      <div className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-6 lg:px-8 lg:py-10">
        {/* HEADER */}

        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-[#F26A21]">
              Client Portal
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl">
              My Subscriptions
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500">
              Manage your meal
              plans, payments and
              future renewals from
              one place.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/client-portal/subscriptions?plan=weekly-plan"
              className="inline-flex min-h-[46px] items-center justify-center rounded-full bg-[#F26A21] px-5 text-sm font-bold text-white"
            >
              Create New Plan
            </Link>

            <button
              type="button"
              onClick={
                loadSubscriptions
              }
              disabled={loading}
              className="min-h-[46px] rounded-full border border-gray-200 bg-white px-5 text-sm font-semibold text-gray-700 shadow-sm disabled:opacity-50"
            >
              {loading
                ? "Refreshing..."
                : "Refresh"}
            </button>
          </div>
        </div>

        {/* STATS */}

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[22px] border border-gray-200 bg-white px-5 py-5 shadow-sm">
            <p className="text-xs font-semibold text-gray-500">
              Total Plans
            </p>

            <p className="mt-2 text-3xl font-bold">
              {stats.total}
            </p>
          </div>

          <div className="rounded-[22px] border border-gray-200 bg-white px-5 py-5 shadow-sm">
            <p className="text-xs font-semibold text-gray-500">
              Active
            </p>

            <p className="mt-2 text-3xl font-bold">
              {stats.active}
            </p>
          </div>

          <div className="rounded-[22px] border border-gray-200 bg-white px-5 py-5 shadow-sm">
            <p className="text-xs font-semibold text-gray-500">
              Approved
            </p>

            <p className="mt-2 text-3xl font-bold">
              {stats.approved}
            </p>
          </div>

          <div className="rounded-[22px] border border-gray-200 bg-white px-5 py-5 shadow-sm">
            <p className="text-xs font-semibold text-gray-500">
              Awaiting Payment
            </p>

            <p className="mt-2 text-3xl font-bold">
              {
                stats.awaitingPayment
              }
            </p>
          </div>
        </div>

        {/* ERROR */}

        {errorMessage && (
          <div className="mt-6 rounded-[20px] border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        {/* LIST */}

        <div className="mt-8">
          {loading ? (
            <div className="rounded-[28px] border border-gray-200 bg-white px-6 py-20 text-center">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-black/10 border-t-[#F26A21]" />

              <p className="mt-4 text-sm text-gray-500">
                Loading subscriptions...
              </p>
            </div>
          ) : subscriptions.length ===
            0 ? (
            <div className="rounded-[28px] border border-gray-200 bg-white px-6 py-20 text-center">
              <h2 className="text-2xl font-bold">
                No meal plans yet
              </h2>

              <p className="mt-3 text-sm text-gray-500">
                Create your first
                meal subscription.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
              {subscriptions.map(
                (
                  subscription
                ) => {
                  const status =
                    normalize(
                      subscription.status
                    );

                  const paymentStatus =
                    normalize(
                      subscription.payment_status
                    );

                  const isPaid =
                    paymentStatus ===
                    "PAID";

                  const canPay =
                    status ===
                      "APPROVED" &&
                    !isPaid &&
                    Number(
                      subscription.amount
                    ) > 0;

                  const canRenew =
                    isPaid &&
                    [
                      "ACTIVE",
                      "COMPLETED",
                    ].includes(
                      status
                    );

                  return (
                    <article
                      key={
                        subscription.id
                      }
                      className="overflow-hidden rounded-[28px] border border-gray-200 bg-white shadow-sm"
                    >
                      {/* CARD HEADER */}

                      <div className="border-b border-gray-100 px-5 py-5 sm:px-6">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#F26A21]">
                              {subscription.customer_code ||
                                "Rhennie Customer"}
                            </p>

                            <h2 className="mt-2 text-2xl font-bold text-gray-950">
                              {subscription.plan_name ||
                                "Meal Subscription"}
                            </h2>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <span
                              className={`rounded-full border px-3 py-1.5 text-xs font-bold ${statusClass(
                                subscription.status
                              )}`}
                            >
                              {subscription.status ||
                                "PENDING"}
                            </span>

                            <span
                              className={`rounded-full border px-3 py-1.5 text-xs font-bold ${paymentClass(
                                subscription.payment_status
                              )}`}
                            >
                              {subscription.payment_status ||
                                "UNPAID"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* CARD BODY */}

                      <div className="px-5 py-5 sm:px-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="rounded-[18px] bg-gray-50 px-4 py-4">
                            <p className="text-[9px] font-bold uppercase text-gray-400">
                              Amount
                            </p>

                            <p className="mt-2 text-lg font-bold">
                              {formatMoney(
                                subscription.amount,
                                subscription.currency
                              )}
                            </p>
                          </div>

                          <div className="rounded-[18px] bg-gray-50 px-4 py-4">
                            <p className="text-[9px] font-bold uppercase text-gray-400">
                              Meal Days
                            </p>

                            <p className="mt-2 text-lg font-bold">
                              {subscription
                                .timetable
                                ?.length ||
                                subscription
                                  .delivery_days
                                  ?.length ||
                                0}
                            </p>
                          </div>

                          <div className="rounded-[18px] bg-gray-50 px-4 py-4">
                            <p className="text-[9px] font-bold uppercase text-gray-400">
                              Start
                            </p>

                            <p className="mt-2 text-sm font-semibold">
                              {formatDate(
                                subscription.start_date
                              )}
                            </p>
                          </div>

                          <div className="rounded-[18px] bg-gray-50 px-4 py-4">
                            <p className="text-[9px] font-bold uppercase text-gray-400">
                              End
                            </p>

                            <p className="mt-2 text-sm font-semibold">
                              {formatDate(
                                subscription.end_date
                              )}
                            </p>
                          </div>
                        </div>

                        {/* PAYMENT SUCCESS */}

                        {isPaid && (
                          <div className="mt-5 rounded-[18px] border border-green-200 bg-green-50 px-4 py-4">
                            <p className="text-sm font-bold text-green-700">
                              Payment Complete ✓
                            </p>

                            {subscription.payment_reference && (
                              <p className="mt-1 break-all text-xs text-green-700/70">
                                {
                                  subscription.payment_reference
                                }
                              </p>
                            )}
                          </div>
                        )}

                        {/* ACTIONS */}

                        <div className="mt-5 flex flex-wrap gap-3">
                          <button
                            type="button"
                            onClick={() =>
                              setSelected(
                                subscription
                              )
                            }
                            className="min-h-[46px] rounded-full border border-gray-200 bg-white px-5 text-sm font-bold"
                          >
                            View Details
                          </button>

                          {canPay && (
                            <button
                              type="button"
                              onClick={() =>
                                startPayment(
                                  subscription
                                )
                              }
                              disabled={
                                payingId ===
                                subscription.id
                              }
                              className="min-h-[46px] rounded-full bg-[#F26A21] px-5 text-sm font-bold text-white disabled:opacity-50"
                            >
                              {payingId ===
                              subscription.id
                                ? "Opening Payment..."
                                : `Pay ${formatMoney(
                                    subscription.amount,
                                    subscription.currency
                                  )}`}
                            </button>
                          )}

                          {canRenew && (
                            <button
                              type="button"
                              onClick={() =>
                                renewSubscription(
                                  subscription
                                )
                              }
                              disabled={
                                renewingId ===
                                subscription.id
                              }
                              className="min-h-[46px] rounded-full bg-black px-5 text-sm font-bold text-white disabled:opacity-50"
                            >
                              {renewingId ===
                              subscription.id
                                ? "Preparing Renewal..."
                                : "Renew Plan"}
                            </button>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                }
              )}
            </div>
          )}
        </div>

        {/* DETAILS MODAL */}

        {selected && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-[30px] bg-[#F8F6F2]">
              <div className="sticky top-0 flex items-center justify-between border-b border-gray-200 bg-white px-5 py-5">
                <div>
                  <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-[#F26A21]">
                    Subscription Details
                  </p>

                  <h2 className="mt-1 text-xl font-bold">
                    {selected.plan_name ||
                      "Meal Subscription"}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setSelected(null)
                  }
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200"
                >
                  ×
                </button>
              </div>

              <div className="space-y-5 px-5 py-6">
                <section className="rounded-[22px] border border-gray-200 bg-white px-5 py-5">
                  <p className="text-[9px] font-bold uppercase text-gray-400">
                    Customer ID
                  </p>

                  <p className="mt-2 text-lg font-bold text-[#F26A21]">
                    {selected.customer_code ||
                      "Not assigned"}
                  </p>
                </section>

                <section className="rounded-[22px] border border-gray-200 bg-white px-5 py-5">
                  <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-[#F26A21]">
                    Weekly Timetable
                  </p>

                  {!selected.timetable ||
                  selected.timetable
                    .length ===
                    0 ? (
                    <p className="mt-4 text-sm text-gray-500">
                      No timetable available.
                    </p>
                  ) : (
                    <div className="mt-5 space-y-3">
                      {selected.timetable.map(
                        (
                          item,
                          index
                        ) => (
                          <div
                            key={`${item.day}-${index}`}
                            className="rounded-[18px] border border-gray-200 bg-gray-50 px-4 py-4"
                          >
                            <p className="text-[9px] font-bold uppercase text-[#F26A21]">
                              {item.day}
                            </p>

                            <p className="mt-1 font-bold">
                              {item.meal_preference ||
                                "No meal"}
                            </p>

                            <p className="mt-1 text-xs text-gray-500">
                              {formatTime(
                                item.delivery_time
                              )}
                            </p>

                            {item.notes && (
                              <p className="mt-2 text-xs text-gray-500">
                                {item.notes}
                              </p>
                            )}
                          </div>
                        )
                      )}
                    </div>
                  )}
                </section>

                <button
                  type="button"
                  onClick={() =>
                    setSelected(null)
                  }
                  className="min-h-[48px] w-full rounded-full bg-black px-5 text-sm font-bold text-white"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
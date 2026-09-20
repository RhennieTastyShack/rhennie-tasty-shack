"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

/* =========================================================
   TYPES
========================================================= */

type TimetableEntry = {
  day?: string;
  delivery_time?: string;
  meal_preference?: string;
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

type ListResponse = {
  success?: boolean;
  message?: string;
  subscriptions?: Subscription[];
};

type UpdateResponse = {
  success?: boolean;
  message?: string;
  subscription?: Subscription;
};

/* =========================================================
   CONSTANTS
========================================================= */

const UNPAID_STATUSES = [
  "PENDING",
  "REVIEWING",
  "APPROVED",
  "ACTIVE",
  "PAUSED",
  "COMPLETED",
  "CANCELLED",
];

const PAID_STATUSES = [
  "ACTIVE",
  "PAUSED",
  "COMPLETED",
  "CANCELLED",
];

/* =========================================================
   HELPERS
========================================================= */

function formatMoney(
  amount?: number | null,
  currency?: string | null
) {
  if (
    amount === null ||
    amount === undefined
  ) {
    return "Not set";
  }

  const safeCurrency =
    currency || "NGN";

  try {
    return new Intl.NumberFormat(
      "en-NG",
      {
        style: "currency",
        currency:
          safeCurrency,
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

  const date =
    new Date(value);

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
    hourText,
    minuteText,
  ] = value.split(":");

  const hour =
    Number(hourText);

  const minute =
    Number(
      minuteText || "0"
    );

  if (
    Number.isNaN(hour)
  ) {
    return value;
  }

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
  status?: string | null
) {
  switch (
    String(
      status || ""
    ).toUpperCase()
  ) {
    case "ACTIVE":
      return "bg-green-100 text-green-700";

    case "APPROVED":
      return "bg-blue-100 text-blue-700";

    case "REVIEWING":
      return "bg-purple-100 text-purple-700";

    case "PENDING":
      return "bg-yellow-100 text-yellow-700";

    case "PAUSED":
      return "bg-orange-100 text-orange-700";

    case "COMPLETED":
      return "bg-gray-100 text-gray-700";

    case "CANCELLED":
      return "bg-red-100 text-red-700";

    default:
      return "bg-gray-100 text-gray-700";
  }
}

function paymentClass(
  status?: string | null
) {
  switch (
    String(
      status || ""
    ).toUpperCase()
  ) {
    case "PAID":
      return "bg-green-100 text-green-700";

    case "PENDING":
      return "bg-yellow-100 text-yellow-700";

    case "PROCESSING":
      return "bg-blue-100 text-blue-700";

    case "FAILED":
      return "bg-red-100 text-red-700";

    case "REFUNDED":
      return "bg-purple-100 text-purple-700";

    default:
      return "bg-gray-100 text-gray-700";
  }
}

/* =========================================================
   PAGE
========================================================= */

export default function AdminSubscriptionsPage() {
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
    updating,
    setUpdating,
  ] = useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");

  const [
    status,
    setStatus,
  ] = useState("PENDING");

  const [
    amount,
    setAmount,
  ] = useState("");

  const [
    adminNotes,
    setAdminNotes,
  ] = useState("");

  const [
    startDate,
    setStartDate,
  ] = useState("");

  const [
    endDate,
    setEndDate,
  ] = useState("");

  const modalScrollRef =
    useRef<HTMLDivElement | null>(
      null
    );

  /* =======================================================
     LOAD SUBSCRIPTIONS
  ======================================================= */

  async function loadSubscriptions() {
    setLoading(true);
    setErrorMessage("");

    try {
      const response =
        await fetch(
          "/api/admin/subscriptions",
          {
            method: "GET",
            cache:
              "no-store",
          }
        );

      const result =
        (await response.json()) as ListResponse;

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.message ||
            "Unable to load subscriptions."
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
     SELECTED FORM DATA
  ======================================================= */

  useEffect(() => {
    if (!selected) {
      return;
    }

    setStatus(
      selected.status ||
        "PENDING"
    );

    setAmount(
      selected.amount !==
          null &&
        selected.amount !==
          undefined
        ? String(
            selected.amount
          )
        : ""
    );

    setAdminNotes(
      selected.admin_notes ||
        ""
    );

    setStartDate(
      selected.start_date ||
        ""
    );

    setEndDate(
      selected.end_date ||
        ""
    );

    requestAnimationFrame(
      () => {
        modalScrollRef.current?.scrollTo(
          {
            top: 0,
            behavior:
              "auto",
          }
        );
      }
    );
  }, [selected]);

  /* =======================================================
     BODY SCROLL
  ======================================================= */

  useEffect(() => {
    if (!selected) {
      return;
    }

    const previous =
      document.body.style
        .overflow;

    document.body.style.overflow =
      "hidden";

    return () => {
      document.body.style.overflow =
        previous;
    };
  }, [selected]);

  /* =======================================================
     STATS
  ======================================================= */

  const stats =
    useMemo(
      () => ({
        total:
          subscriptions.length,

        pending:
          subscriptions.filter(
            (item) =>
              item.status?.toUpperCase() ===
              "PENDING"
          ).length,

        reviewing:
          subscriptions.filter(
            (item) =>
              item.status?.toUpperCase() ===
              "REVIEWING"
          ).length,

        approved:
          subscriptions.filter(
            (item) =>
              item.status?.toUpperCase() ===
              "APPROVED"
          ).length,

        active:
          subscriptions.filter(
            (item) =>
              item.status?.toUpperCase() ===
              "ACTIVE"
          ).length,

        paid:
          subscriptions.filter(
            (item) =>
              item.payment_status?.toUpperCase() ===
              "PAID"
          ).length,
      }),
      [subscriptions]
    );

  /* =======================================================
     PAID STATE
  ======================================================= */

  const selectedIsPaid =
    selected?.payment_status?.toUpperCase() ===
    "PAID";

  /* =======================================================
     SAVE
  ======================================================= */

  async function saveChanges() {
    if (!selected) {
      return;
    }

    setUpdating(true);
    setErrorMessage("");
    setSuccessMessage("");

    const parsedAmount =
      amount.trim() === ""
        ? null
        : Number(
            amount.replace(
              /,/g,
              ""
            )
          );

    if (
      !selectedIsPaid &&
      parsedAmount !== null &&
      (
        !Number.isFinite(
          parsedAmount
        ) ||
        parsedAmount < 0
      )
    ) {
      setErrorMessage(
        "Please enter a valid amount."
      );

      setUpdating(false);
      return;
    }

    if (
      startDate &&
      endDate &&
      new Date(
        endDate
      ).getTime() <
        new Date(
          startDate
        ).getTime()
    ) {
      setErrorMessage(
        "End date cannot be before start date."
      );

      setUpdating(false);
      return;
    }

    try {
      const body: Record<
        string,
        unknown
      > = {
        status,
        admin_notes:
          adminNotes.trim() ||
          null,
        start_date:
          startDate ||
          null,
        end_date:
          endDate ||
          null,
      };

      /*
        Do not send an editable
        amount for paid plans.
        The backend already protects
        this as well.
      */

      if (!selectedIsPaid) {
        body.amount =
          parsedAmount;
      }

      const response =
        await fetch(
          `/api/admin/subscriptions/${selected.id}`,
          {
            method:
              "PATCH",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify(
                body
              ),
          }
        );

      const result =
        (await response.json()) as UpdateResponse;

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.message ||
            "Unable to update subscription."
        );
      }

      if (
        !result.subscription
      ) {
        throw new Error(
          "Subscription update returned no record."
        );
      }

      const updated =
        result.subscription;

      setSubscriptions(
        (current) =>
          current.map(
            (item) =>
              item.id ===
              updated.id
                ? updated
                : item
          )
      );

      setSelected(updated);

      setSuccessMessage(
        selectedIsPaid
          ? "Subscription management updated successfully."
          : "Subscription updated successfully."
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to update subscription."
      );
    } finally {
      setUpdating(false);
    }
  }

  /* =======================================================
     OPEN MODAL
  ======================================================= */

  function openSubscription(
    subscription: Subscription
  ) {
    setErrorMessage("");
    setSuccessMessage("");
    setSelected(
      subscription
    );
  }

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div className="space-y-8">
      {/* HEADER */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-[#F26A21]">
            Rhennie Studio
          </p>

          <h1 className="mt-2 text-3xl font-bold text-gray-900 sm:text-4xl">
            Meal Subscriptions
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
            Review customer meal plans,
            manage approved subscriptions
            and monitor payments.
          </p>
        </div>

        <button
          type="button"
          onClick={
            loadSubscriptions
          }
          disabled={loading}
          className="min-h-[46px] rounded-full border border-gray-200 bg-white px-5 text-sm font-semibold text-gray-700 shadow-sm disabled:opacity-60"
        >
          {loading
            ? "Refreshing..."
            : "Refresh"}
        </button>
      </div>

      {/* STATS */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {[
          [
            "Total Requests",
            stats.total,
          ],
          [
            "Pending",
            stats.pending,
          ],
          [
            "Reviewing",
            stats.reviewing,
          ],
          [
            "Approved",
            stats.approved,
          ],
          [
            "Active",
            stats.active,
          ],
          [
            "Paid",
            stats.paid,
          ],
        ].map(
          ([label, value]) => (
            <div
              key={String(
                label
              )}
              className="rounded-[22px] border border-gray-200 bg-white px-5 py-5 shadow-sm"
            >
              <p className="text-xs font-semibold text-gray-500">
                {label}
              </p>

              <p className="mt-2 text-3xl font-bold text-gray-900">
                {value}
              </p>
            </div>
          )
        )}
      </div>

      {/* MESSAGES */}

      {errorMessage && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm text-green-700">
          {successMessage}
        </div>
      )}

      {/* TABLE */}

      {loading ? (
        <div className="rounded-[26px] border border-gray-200 bg-white px-6 py-20 text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-black/10 border-t-[#F26A21]" />

          <p className="mt-4 text-sm text-gray-500">
            Loading subscriptions...
          </p>
        </div>
      ) : subscriptions.length ===
        0 ? (
        <div className="rounded-[26px] border border-gray-200 bg-white px-6 py-20 text-center">
          <h2 className="text-xl font-bold">
            No subscriptions yet
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Customer meal plan
            requests will appear
            here.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-[26px] border border-gray-200 bg-white shadow-sm">
          <table className="w-full min-w-[1050px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 text-left text-xs font-bold uppercase text-gray-500">
                  Customer
                </th>

                <th className="p-4 text-left text-xs font-bold uppercase text-gray-500">
                  Plan
                </th>

                <th className="p-4 text-left text-xs font-bold uppercase text-gray-500">
                  Days
                </th>

                <th className="p-4 text-left text-xs font-bold uppercase text-gray-500">
                  Amount
                </th>

                <th className="p-4 text-left text-xs font-bold uppercase text-gray-500">
                  Status
                </th>

                <th className="p-4 text-left text-xs font-bold uppercase text-gray-500">
                  Payment
                </th>

                <th className="p-4 text-left text-xs font-bold uppercase text-gray-500">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {subscriptions.map(
                (
                  subscription
                ) => (
                  <tr
                    key={
                      subscription.id
                    }
                    className="border-t border-gray-100"
                  >
                    <td className="p-4">
                      <p className="font-semibold text-gray-900">
                        {subscription.customer_name ||
                          "Unnamed Customer"}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        {subscription.customer_email ||
                          "No email"}
                      </p>

                      <p className="mt-1 text-[10px] font-bold tracking-wide text-[#F26A21]">
                        {subscription.customer_code ||
                          "Not assigned"}
                      </p>
                    </td>

                    <td className="p-4">
                      <p className="font-medium">
                        {subscription.plan_name ||
                          "Meal Subscription"}
                      </p>
                    </td>

                    <td className="p-4">
                      {subscription
                        .timetable
                        ?.length ||
                        subscription
                          .delivery_days
                          ?.length ||
                        0}
                    </td>

                    <td className="p-4 font-semibold">
                      {formatMoney(
                        subscription.amount,
                        subscription.currency
                      )}
                    </td>

                    <td className="p-4">
                      <span
                        className={`
                          rounded-full
                          px-3
                          py-1.5
                          text-xs
                          font-semibold
                          ${statusClass(
                            subscription.status
                          )}
                        `}
                      >
                        {subscription.status ||
                          "PENDING"}
                      </span>
                    </td>

                    <td className="p-4">
                      <span
                        className={`
                          rounded-full
                          px-3
                          py-1.5
                          text-xs
                          font-semibold
                          ${paymentClass(
                            subscription.payment_status
                          )}
                        `}
                      >
                        {subscription.payment_status ||
                          "UNPAID"}
                      </span>
                    </td>

                    <td className="p-4">
                      <button
                        type="button"
                        onClick={() =>
                          openSubscription(
                            subscription
                          )
                        }
                        className="min-h-[42px] rounded-full bg-black px-5 text-sm font-semibold text-white"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ===================================================
          MODAL
      =================================================== */}

      {selected && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm sm:p-5">
          <div
            ref={
              modalScrollRef
            }
            className="max-h-[92vh] w-full max-w-6xl overflow-y-auto rounded-[30px] bg-[#F8F6F2] shadow-2xl"
          >
            {/* HEADER */}

            <div className="sticky top-0 z-20 flex items-center justify-between border-b border-gray-200 bg-white px-5 py-5 sm:px-7">
              <div>
                <p className="text-[8px] font-bold uppercase tracking-[0.25em] text-[#F26A21]">
                  {selectedIsPaid
                    ? "Subscription Management"
                    : "Subscription Review"}
                </p>

                <h2 className="mt-1 text-xl font-bold text-gray-900">
                  {selected.plan_name ||
                    "Meal Subscription"}
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelected(
                    null
                  )
                }
                className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-xl"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {/* BODY */}

            <div className="grid grid-cols-1 gap-6 px-5 py-6 sm:px-7 lg:grid-cols-[1.3fr_0.7fr]">
              {/* LEFT */}

              <div className="space-y-6">
                {/* CUSTOMER */}

                <section className="rounded-[24px] border border-gray-200 bg-white px-5 py-5">
                  <p className="text-[8px] font-bold uppercase tracking-[0.22em] text-[#F26A21]">
                    Customer Details
                  </p>

                  <h3 className="mt-3 text-2xl font-bold">
                    {selected.customer_name ||
                      "Unnamed Customer"}
                  </h3>

                  <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-wide text-gray-400">
                        Email
                      </p>

                      <p className="mt-1 text-sm text-gray-700">
                        {selected.customer_email ||
                          "—"}
                      </p>
                    </div>

                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-wide text-gray-400">
                        Phone
                      </p>

                      <p className="mt-1 text-sm text-gray-700">
                        {selected.customer_phone ||
                          "—"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5">
                    <p className="text-[9px] font-bold uppercase tracking-wide text-gray-400">
                      Delivery Address
                    </p>

                    <p className="mt-1 text-sm leading-6 text-gray-700">
                      {selected.delivery_address ||
                        "—"}
                    </p>
                  </div>

                  <div className="mt-5 rounded-xl bg-gray-50 px-4 py-4">
                    <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-gray-400">
                      Customer ID
                    </p>

                    <p className="mt-2 text-base font-bold tracking-wide text-[#F26A21]">
                      {selected.customer_code ||
                        "Not assigned"}
                    </p>
                  </div>
                </section>

                {/* TIMETABLE */}

                <section className="rounded-[24px] border border-gray-200 bg-white px-5 py-5">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="text-[8px] font-bold uppercase tracking-[0.22em] text-[#F26A21]">
                        Weekly Timetable
                      </p>

                      <h3 className="mt-2 text-xl font-bold">
                        Customer Meal
                        Schedule
                      </h3>
                    </div>

                    <span className="w-fit rounded-full bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-600">
                      {selected
                        .timetable
                        ?.length ||
                        0}{" "}
                      days
                    </span>
                  </div>

                  {!selected.timetable ||
                  selected.timetable
                    .length ===
                    0 ? (
                    <p className="mt-5 text-sm text-gray-500">
                      No timetable
                      available.
                    </p>
                  ) : (
                    <div className="mt-5 space-y-4">
                      {selected.timetable.map(
                        (
                          entry,
                          index
                        ) => (
                          <article
                            key={`${entry.day}-${index}`}
                            className="rounded-[20px] border border-gray-200 bg-[#FAFAFA] px-4 py-4 sm:px-5"
                          >
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                              <div>
                                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#F26A21]">
                                  {entry.day}
                                </p>

                                <h4 className="mt-1 text-lg font-bold text-gray-900">
                                  {entry.meal_preference ||
                                    "No meal preference"}
                                </h4>
                              </div>

                              <span className="w-fit rounded-full bg-[#FFF1E9] px-3 py-2 text-xs font-bold text-[#F26A21]">
                                {formatTime(
                                  entry.delivery_time
                                )}
                              </span>
                            </div>

                            {entry.notes && (
                              <div className="mt-4 border-t border-gray-200 pt-3">
                                <p className="text-[9px] font-bold uppercase tracking-wide text-gray-400">
                                  Note
                                </p>

                                <p className="mt-1 text-sm leading-6 text-gray-600">
                                  {entry.notes}
                                </p>
                              </div>
                            )}
                          </article>
                        )
                      )}
                    </div>
                  )}
                </section>

                {/* SPECIAL REQUEST */}

                {selected.special_requests && (
                  <section className="rounded-[24px] border border-gray-200 bg-white px-5 py-5">
                    <p className="text-[8px] font-bold uppercase tracking-[0.22em] text-[#F26A21]">
                      Special Requests
                    </p>

                    <p className="mt-3 text-sm leading-7 text-gray-600">
                      {
                        selected.special_requests
                      }
                    </p>
                  </section>
                )}
              </div>

              {/* RIGHT */}

              <div className="space-y-6">
                {/* ADMIN CONTROL */}

                <section className="rounded-[24px] bg-[#111111] px-5 py-6 text-white">
                  <p className="text-[8px] font-bold uppercase tracking-[0.22em] text-[#F26A21]">
                    Admin Controls
                  </p>

                  <h3 className="mt-2 text-xl font-bold">
                    {selectedIsPaid
                      ? "Subscription Management"
                      : "Review & Approve"}
                  </h3>

                  {selectedIsPaid && (
                    <div className="mt-4 rounded-[16px] border border-green-500/20 bg-green-500/10 px-4 py-3">
                      <p className="text-xs font-semibold leading-5 text-green-300">
                        This subscription
                        has been paid.
                        Financial details
                        are locked.
                      </p>
                    </div>
                  )}

                  {/* STATUS */}

                  <div className="mt-5">
                    <label className="text-sm font-semibold">
                      Status
                    </label>

                    <select
                      value={
                        status
                      }
                      onChange={(
                        event
                      ) =>
                        setStatus(
                          event
                            .target
                            .value
                        )
                      }
                      className="mt-2 min-h-[48px] w-full rounded-xl bg-white px-4 text-black"
                    >
                      {(selectedIsPaid
                        ? PAID_STATUSES
                        : UNPAID_STATUSES
                      ).map(
                        (
                          option
                        ) => (
                          <option
                            key={
                              option
                            }
                            value={
                              option
                            }
                          >
                            {
                              option
                            }
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  {/* AMOUNT */}

                  <div className="mt-5">
                    <label className="text-sm font-semibold">
                      Amount
                    </label>

                    <input
                      type="number"
                      min="0"
                      value={
                        amount
                      }
                      disabled={
                        selectedIsPaid
                      }
                      onChange={(
                        event
                      ) =>
                        setAmount(
                          event
                            .target
                            .value
                        )
                      }
                      className={`
                        mt-2
                        min-h-[48px]
                        w-full
                        rounded-xl
                        px-4
                        text-black
                        ${
                          selectedIsPaid
                            ? "cursor-not-allowed bg-gray-200 text-gray-500"
                            : "bg-white"
                        }
                      `}
                    />

                    {selectedIsPaid && (
                      <p className="mt-2 text-[11px] leading-5 text-white/45">
                        Amount locked
                        after successful
                        payment.
                      </p>
                    )}
                  </div>

                  {/* START */}

                  <div className="mt-5">
                    <label className="text-sm font-semibold">
                      Start Date
                    </label>

                    <input
                      type="date"
                      value={
                        startDate
                      }
                      onChange={(
                        event
                      ) =>
                        setStartDate(
                          event
                            .target
                            .value
                        )
                      }
                      className="mt-2 min-h-[48px] w-full rounded-xl bg-white px-4 text-black"
                    />
                  </div>

                  {/* END */}

                  <div className="mt-5">
                    <label className="text-sm font-semibold">
                      End Date
                    </label>

                    <input
                      type="date"
                      value={
                        endDate
                      }
                      onChange={(
                        event
                      ) =>
                        setEndDate(
                          event
                            .target
                            .value
                        )
                      }
                      className="mt-2 min-h-[48px] w-full rounded-xl bg-white px-4 text-black"
                    />
                  </div>

                  {/* NOTES */}

                  <div className="mt-5">
                    <label className="text-sm font-semibold">
                      Admin Notes
                    </label>

                    <textarea
                      rows={4}
                      value={
                        adminNotes
                      }
                      onChange={(
                        event
                      ) =>
                        setAdminNotes(
                          event
                            .target
                            .value
                        )
                      }
                      placeholder={
                        selectedIsPaid
                          ? "Add operational notes..."
                          : "Add a note for the customer..."
                      }
                      className="mt-2 w-full rounded-xl bg-white px-4 py-3 text-black"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={
                      saveChanges
                    }
                    disabled={
                      updating
                    }
                    className="mt-6 min-h-[50px] w-full rounded-full bg-[#F26A21] px-5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {updating
                      ? "Saving..."
                      : selectedIsPaid
                        ? "Update Subscription"
                        : "Save Changes"}
                  </button>
                </section>

                {/* PAYMENT */}

                <section className="rounded-[24px] border border-gray-200 bg-white px-5 py-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[8px] font-bold uppercase tracking-[0.22em] text-[#F26A21]">
                        Payment
                      </p>

                      <h3 className="mt-2 text-lg font-bold">
                        Payment Details
                      </h3>
                    </div>

                    <span
                      className={`
                        rounded-full
                        px-3
                        py-1.5
                        text-xs
                        font-semibold
                        ${paymentClass(
                          selected.payment_status
                        )}
                      `}
                    >
                      {selected.payment_status ||
                        "UNPAID"}
                    </span>
                  </div>

                  <div className="mt-5 space-y-4 text-sm">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-gray-500">
                        Amount
                      </span>

                      <strong>
                        {formatMoney(
                          selected.amount,
                          selected.currency
                        )}
                      </strong>
                    </div>

                    <div className="border-t border-gray-100 pt-4">
                      <p className="text-[9px] font-bold uppercase tracking-wide text-gray-400">
                        Payment
                        Reference
                      </p>

                      <p className="mt-2 break-all font-mono text-xs leading-5 text-gray-700">
                        {selected.payment_reference ||
                          "—"}
                      </p>
                    </div>

                    {selectedIsPaid && (
                      <div className="rounded-[16px] bg-green-50 px-4 py-3">
                        <p className="text-xs font-semibold leading-5 text-green-700">
                          ✓ Payment
                          confirmed and
                          subscription
                          activated.
                        </p>
                      </div>
                    )}
                  </div>
                </section>

                {/* RECORD DETAILS */}

                <section className="rounded-[24px] border border-gray-200 bg-white px-5 py-5">
                  <p className="text-[8px] font-bold uppercase tracking-[0.22em] text-[#F26A21]">
                    Record Details
                  </p>

                  <div className="mt-4 space-y-4 text-sm text-gray-600">
                    <div>
                      <p className="font-semibold text-gray-900">
                        Subscription
                        ID
                      </p>

                      <code className="mt-2 block break-all rounded-xl bg-gray-50 px-3 py-2 text-xs">
                        {
                          selected.id
                        }
                      </code>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <p className="text-[9px] font-bold uppercase text-gray-400">
                          Created
                        </p>

                        <p className="mt-1 font-medium text-gray-700">
                          {formatDate(
                            selected.created_at
                          )}
                        </p>
                      </div>

                      <div>
                        <p className="text-[9px] font-bold uppercase text-gray-400">
                          Updated
                        </p>

                        <p className="mt-1 font-medium text-gray-700">
                          {formatDate(
                            selected.updated_at
                          )}
                        </p>
                      </div>

                      <div>
                        <p className="text-[9px] font-bold uppercase text-gray-400">
                          Start Date
                        </p>

                        <p className="mt-1 font-medium text-gray-700">
                          {formatDate(
                            selected.start_date
                          )}
                        </p>
                      </div>

                      <div>
                        <p className="text-[9px] font-bold uppercase text-gray-400">
                          End Date
                        </p>

                        <p className="mt-1 font-medium text-gray-700">
                          {formatDate(
                            selected.end_date
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
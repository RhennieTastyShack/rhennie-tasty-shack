"use client";

import {
  Suspense,
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";

import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import {
  createClient,
} from "@supabase/supabase-js";

/* =========================================================
   TYPES
========================================================= */

type DayName =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

type TimetableEntry = {
  day: string;
  meal_preference: string;
  delivery_time: string;
  notes: string;
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

type SubscriptionResponse = {
  success?: boolean;
  message?: string;
  subscription?: Subscription;
};

type SessionUser = {
  id: string;

  email?: string | null;

  user_metadata?: {
    full_name?: string;
    name?: string;
    first_name?: string;
    last_name?: string;
  };
};

/* =========================================================
   CONSTANTS
========================================================= */

const DAYS: DayName[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const PLAN_NAMES: Record<string, string> = {
  "daily-lunch": "Daily Lunch",
  lunch: "Daily Lunch",

  "weekly-plan": "Weekly Plan",
  weekly: "Weekly Plan",

  "monthly-plan": "Monthly Plan",
  monthly: "Monthly Plan",

  "corporate-plan": "Corporate Plan",
  corporate: "Corporate Plan",

  custom: "Custom Meal Plan",
};

/* =========================================================
   SUPABASE
========================================================= */

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "";

const supabaseKey =
  process.env
    .NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";

const supabase = createClient(
  supabaseUrl,
  supabaseKey
);

/* =========================================================
   HELPERS
========================================================= */

function cleanText(
  value: unknown
) {
  return String(
    value ?? ""
  ).trim();
}

function getPlanName(
  planSlug: string
) {
  return (
    PLAN_NAMES[planSlug] ||
    "Weekly Plan"
  );
}

function getUserName(
  user: SessionUser | null
) {
  if (!user) {
    return "";
  }

  const metadata =
    user.user_metadata || {};

  const directName =
    cleanText(
      metadata.full_name
    ) ||
    cleanText(
      metadata.name
    );

  if (directName) {
    return directName;
  }

  const first =
    cleanText(
      metadata.first_name
    );

  const last =
    cleanText(
      metadata.last_name
    );

  return `${first} ${last}`.trim();
}

function createEmptyTimetable():
  Record<
    DayName,
    TimetableEntry
  > {
  return {
    Monday: {
      day: "Monday",
      meal_preference: "",
      delivery_time: "",
      notes: "",
    },

    Tuesday: {
      day: "Tuesday",
      meal_preference: "",
      delivery_time: "",
      notes: "",
    },

    Wednesday: {
      day: "Wednesday",
      meal_preference: "",
      delivery_time: "",
      notes: "",
    },

    Thursday: {
      day: "Thursday",
      meal_preference: "",
      delivery_time: "",
      notes: "",
    },

    Friday: {
      day: "Friday",
      meal_preference: "",
      delivery_time: "",
      notes: "",
    },

    Saturday: {
      day: "Saturday",
      meal_preference: "",
      delivery_time: "",
      notes: "",
    },

    Sunday: {
      day: "Sunday",
      meal_preference: "",
      delivery_time: "",
      notes: "",
    },
  };
}

function formatTime(
  value: string
) {
  if (!value) {
    return "";
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

  const suffix =
    hour >= 12
      ? "PM"
      : "AM";

  const displayHour =
    hour % 12 || 12;

  return `${displayHour}:${String(
    Number(
      minutes || "0"
    )
  ).padStart(
    2,
    "0"
  )} ${suffix}`;
}

/* =========================================================
   CONTENT
========================================================= */

function SubscriptionBuilderContent() {
  const router =
    useRouter();

  const searchParams =
    useSearchParams();

  /* =======================================================
     URL PARAMS
  ======================================================= */

  const requestedPlan =
    cleanText(
      searchParams.get(
        "plan"
      )
    ) ||
    "weekly-plan";

  const sourceSubscriptionId =
    cleanText(
      searchParams.get(
        "source"
      )
    );

  const mode =
    cleanText(
      searchParams.get(
        "mode"
      )
    ).toLowerCase();

  const isRenewal =
    mode ===
      "renewal" &&
    Boolean(
      sourceSubscriptionId
    );

  /* =======================================================
     PLAN STATE
  ======================================================= */

  const [
    planSlug,
    setPlanSlug,
  ] =
    useState(
      requestedPlan
    );

  const [
    planName,
    setPlanName,
  ] =
    useState(
      getPlanName(
        requestedPlan
      )
    );

  /* =======================================================
     FORM STATE
  ======================================================= */

  const [
    customerName,
    setCustomerName,
  ] = useState("");

  const [
    customerEmail,
    setCustomerEmail,
  ] = useState("");

  const [
    customerPhone,
    setCustomerPhone,
  ] = useState("");

  const [
    deliveryAddress,
    setDeliveryAddress,
  ] = useState("");

  const [
    customerCode,
    setCustomerCode,
  ] =
    useState<
      string | null
    >(null);

  const [
    specialRequests,
    setSpecialRequests,
  ] = useState("");

  const [
    selectedDays,
    setSelectedDays,
  ] =
    useState<
      DayName[]
    >([]);

  const [
    timetable,
    setTimetable,
  ] = useState<
    Record<
      DayName,
      TimetableEntry
    >
  >(
    createEmptyTimetable()
  );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    submitting,
    setSubmitting,
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
    submittedId,
    setSubmittedId,
  ] = useState("");

  /* =======================================================
     TOKEN
  ======================================================= */

  async function getAccessToken() {
    const {
      data: {
        session,
      },
    } =
      await supabase.auth.getSession();

    return (
      session?.access_token ||
      null
    );
  }

  /* =======================================================
     INITIALISE PAGE
  ======================================================= */

  useEffect(() => {
    let cancelled = false;

    async function initialise() {
      setLoading(true);
      setErrorMessage("");

      try {
        const {
          data: {
            session,
          },
        } =
          await supabase.auth.getSession();

        if (
          !session ||
          !session.user
        ) {
          const returnPath =
            typeof window !== "undefined"
              ? `${window.location.pathname}${window.location.search}`
              : "/client-portal/subscriptions";

          router.replace(
            `/login?next=${encodeURIComponent(returnPath)}`
          );
          return;
        }

        if (cancelled) {
          return;
        }

        const user =
          session.user as SessionUser;

        /*
          Base account details
        */

        setCustomerName(
          getUserName(user)
        );

        setCustomerEmail(
          user.email || ""
        );

        /*
          NORMAL PLAN
        */

        if (!isRenewal) {
          return;
        }

        /*
          RENEWAL MODE

          Load the old COMPLETED / PAID plan
          only as the source for customer details.

          We do NOT copy the old meal timetable.
        */

        const response =
          await fetch(
            `/api/subscriptions/${encodeURIComponent(
              sourceSubscriptionId
            )}`,
            {
              method: "GET",

              cache:
                "no-store",

              headers: {
                Authorization:
                  `Bearer ${session.access_token}`,
              },
            }
          );

        const result =
          (await response.json()) as SubscriptionResponse;

        if (
          !response.ok ||
          !result.success ||
          !result.subscription
        ) {
          throw new Error(
            result.message ||
              "Unable to load your previous subscription."
          );
        }

        const source =
          result.subscription;

        if (cancelled) {
          return;
        }

        /*
          Friendly customer ID
        */

        setCustomerCode(
          source.customer_code ||
            null
        );

        /*
          CUSTOMER NAME

          Use the name stored on the old
          subscription first.

          This fixes the blank Full Name
          you saw in the screenshot.
        */

        setCustomerName(
          cleanText(
            source.customer_name
          ) ||
            getUserName(
              user
            ) ||
            cleanText(
              user.email
            )
        );

        setCustomerEmail(
          cleanText(
            source.customer_email
          ) ||
            cleanText(
              user.email
            )
        );

        setCustomerPhone(
          cleanText(
            source.customer_phone
          )
        );

        setDeliveryAddress(
          cleanText(
            source.delivery_address
          )
        );

        /*
          Keep same plan
        */

        const sourcePlanSlug =
          cleanText(
            source.plan_slug
          ) ||
          requestedPlan ||
          "weekly-plan";

        setPlanSlug(
          sourcePlanSlug
        );

        setPlanName(
          cleanText(
            source.plan_name
          ) ||
            getPlanName(
              sourcePlanSlug
            )
        );

        /*
          IMPORTANT:
          Renewal gets a brand-new timetable.
        */

        setSelectedDays(
          []
        );

        setTimetable(
          createEmptyTimetable()
        );

        setSpecialRequests(
          ""
        );
      } catch (error) {
        if (cancelled) {
          return;
        }

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to prepare your meal plan."
        );
      } finally {
        if (!cancelled) {
          setLoading(
            false
          );
        }
      }
    }

    initialise();

    return () => {
      cancelled = true;
    };
  }, [
    isRenewal,
    sourceSubscriptionId,
    requestedPlan,
    router,
  ]);

  /* =======================================================
     SELECTED TIMETABLE
  ======================================================= */

  const selectedTimetable =
    useMemo(
      () =>
        DAYS.filter(
          (day) =>
            selectedDays.includes(
              day
            )
        ).map(
          (day) =>
            timetable[day]
        ),
      [
        selectedDays,
        timetable,
      ]
    );

  /* =======================================================
     TOGGLE DAY
  ======================================================= */

  function toggleDay(
    day: DayName
  ) {
    setErrorMessage("");
    setSuccessMessage("");

    setSelectedDays(
      (current) =>
        current.includes(
          day
        )
          ? current.filter(
              (item) =>
                item !==
                day
            )
          : [
              ...current,
              day,
            ]
    );
  }

  /* =======================================================
     UPDATE TIMETABLE
  ======================================================= */

  function updateTimetable(
    day: DayName,
    field:
      | "meal_preference"
      | "delivery_time"
      | "notes",
    value: string
  ) {
    setTimetable(
      (current) => ({
        ...current,

        [day]: {
          ...current[
            day
          ],

          [field]:
            value,
        },
      })
    );
  }

  /* =======================================================
     VALIDATE
  ======================================================= */

  function validate() {
    if (
      !customerName.trim()
    ) {
      return "Customer name is missing.";
    }

    if (
      !customerEmail.trim()
    ) {
      return "Customer email is missing.";
    }

    if (
      !customerPhone.trim()
    ) {
      return "Please enter your phone number.";
    }

    if (
      !deliveryAddress.trim()
    ) {
      return "Please enter your delivery address.";
    }

    if (
      selectedDays.length ===
      0
    ) {
      return "Please select at least one delivery day.";
    }

    for (
      const day of
        selectedDays
    ) {
      const entry =
        timetable[
          day
        ];

      if (
        !entry
          .meal_preference
          .trim()
      ) {
        return `Please enter your meal for ${day}.`;
      }

      if (
        !entry
          .delivery_time
          .trim()
      ) {
        return `Please choose a delivery time for ${day}.`;
      }
    }

    return null;
  }

  /* =======================================================
     SUBMIT

     Normal plan and renewal both POST.

     For renewal, the old plan is only a source.
     The NEW subscription is created now.
  ======================================================= */

  async function submitMealPlan(
    event:
      React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");
    setSubmittedId("");

    const validation =
      validate();

    if (validation) {
      setErrorMessage(
        validation
      );

      return;
    }

    setSubmitting(true);

    try {
      const token =
        await getAccessToken();

      if (!token) {
        throw new Error(
          "Your session has expired. Please sign in again."
        );
      }

      const payload = {
        plan_slug:
          planSlug,

        plan_name:
          planName,

        customer_name:
          customerName.trim(),

        customer_email:
          customerEmail.trim(),

        customer_phone:
          customerPhone.trim(),

        delivery_address:
          deliveryAddress.trim(),

        timetable:
          selectedTimetable.map(
            (
              entry
            ) => ({
              day:
                entry.day,

              meal_preference:
                entry
                  .meal_preference
                  .trim(),

              delivery_time:
                entry.delivery_time,

              notes:
                entry
                  .notes
                  .trim(),
            })
          ),

        special_requests:
          specialRequests.trim(),
      };

      const response =
        await fetch(
          "/api/subscriptions",
          {
            method:
              "POST",

            headers: {
              Authorization:
                `Bearer ${token}`,

              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify(
                payload
              ),
          }
        );

      const result =
        (await response.json()) as SubscriptionResponse;

      if (
        !response.ok ||
        !result.success ||
        !result.subscription
      ) {
        throw new Error(
          result.message ||
            "Unable to submit your meal plan."
        );
      }

      setCustomerCode(
        result.subscription
          .customer_code ||
          customerCode
      );

      setSubmittedId(
        result.subscription.id
      );

      setSuccessMessage(
        isRenewal
          ? "Your renewal has been submitted to Rhennie Studio for review and pricing."
          : "Your meal plan has been submitted to Rhennie Studio for review and pricing."
      );

      /*
        Return to My Subscriptions so the customer
        can track pricing, approval and payment.
      */

      window.setTimeout(
        () => {
          router.push(
            "/client-portal/my-subscriptions"
          );
        },
        1500
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to submit your meal plan."
      );
    } finally {
      setSubmitting(
        false
      );
    }
  }

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <main className="min-h-screen bg-[#FAFAF8]">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-6 lg:px-8">
          <div className="rounded-[30px] border border-gray-200 bg-white px-6 py-24 text-center shadow-sm">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-black/10 border-t-[#F26A21]" />

            <p className="mt-4 text-sm text-gray-500">
              {isRenewal
                ? "Preparing your renewal..."
                : "Preparing your meal plan..."}
            </p>
          </div>
        </div>
      </main>
    );
  }

  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <main className="min-h-screen bg-[#FAFAF8]">
      <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-6 lg:px-8 lg:py-12">
        {/* HEADER */}

        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-[#F26A21]">
              {isRenewal
                ? "Renew Meal Plan"
                : "Meal Subscription"}
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl">
              {isRenewal
                ? "Create Your Next Week"
                : "Build Your Meal Plan"}
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500">
              {isRenewal
                ? "Choose fresh meals, delivery days and times for your next subscription."
                : "Tell us what you would like to eat and when you would like each meal delivered."}
            </p>
          </div>

          <Link
            href="/client-portal/my-subscriptions"
            className="inline-flex min-h-[46px] w-fit items-center justify-center rounded-full border border-gray-200 bg-white px-5 text-sm font-bold text-gray-800 shadow-sm"
          >
            My Subscriptions
          </Link>
        </div>

        {/* RENEWAL BANNER */}

        {isRenewal && (
          <div className="mt-7 rounded-[24px] border border-[#F6D8C8] bg-[#FFF7F2] px-5 py-5 sm:px-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#F26A21]">
                  Renewal
                </p>

                <h2 className="mt-1 text-lg font-bold text-gray-950">
                  {planName}
                </h2>

                <p className="mt-1 text-sm leading-6 text-gray-600">
                  Your previous paid subscription and payment history remain unchanged.
                </p>
              </div>

              {customerCode && (
                <span className="w-fit rounded-full bg-white px-4 py-2 text-xs font-bold tracking-wide text-[#F26A21] shadow-sm">
                  {customerCode}
                </span>
              )}
            </div>
          </div>
        )}

        {/* ERROR */}

        {errorMessage && (
          <div className="mt-6 rounded-[20px] border border-red-200 bg-red-50 px-5 py-4 text-sm leading-6 text-red-700">
            {errorMessage}
          </div>
        )}

        {/* SUCCESS */}

        {successMessage && (
          <div className="mt-6 rounded-[24px] border border-green-200 bg-green-50 px-5 py-5 sm:px-6">
            <p className="font-bold text-green-800">
              Meal plan submitted ✓
            </p>

            <p className="mt-1 text-sm leading-6 text-green-700">
              {successMessage}
            </p>

            {customerCode && (
              <p className="mt-3 text-xs font-bold text-green-800">
                Customer ID:{" "}
                {customerCode}
              </p>
            )}

            {submittedId && (
              <p className="mt-1 break-all text-[11px] text-green-700/70">
                Subscription ID:{" "}
                {submittedId}
              </p>
            )}
          </div>
        )}

        {/* FORM */}

        <form
          onSubmit={
            submitMealPlan
          }
          className="mt-8 space-y-6"
        >
          {/* CUSTOMER DETAILS */}

          <section className="rounded-[28px] border border-gray-200 bg-white px-5 py-6 shadow-sm sm:px-6 lg:px-8 lg:py-8">
            <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-[#F26A21]">
              Customer Information
            </p>

            <h2 className="mt-2 text-2xl font-bold text-gray-950">
              Delivery Details
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Confirm where we should contact you and deliver your meals.
            </p>

            <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
              {/* NAME */}

              <div>
                <label className="text-sm font-bold text-gray-800">
                  Full Name
                </label>

                <input
                  type="text"
                  value={
                    customerName
                  }
                  readOnly
                  className="mt-2 min-h-[50px] w-full rounded-[16px] border border-gray-200 bg-gray-50 px-4 text-sm text-gray-700"
                />
              </div>

              {/* EMAIL */}

              <div>
                <label className="text-sm font-bold text-gray-800">
                  Email Address
                </label>

                <input
                  type="email"
                  value={
                    customerEmail
                  }
                  readOnly
                  className="mt-2 min-h-[50px] w-full rounded-[16px] border border-gray-200 bg-gray-50 px-4 text-sm text-gray-700"
                />
              </div>

              {/* PHONE */}

              <div>
                <label className="text-sm font-bold text-gray-800">
                  Phone Number
                </label>

                <input
                  type="tel"
                  value={
                    customerPhone
                  }
                  onChange={(
                    event
                  ) =>
                    setCustomerPhone(
                      event.target.value
                    )
                  }
                  placeholder="+234..."
                  className="mt-2 min-h-[50px] w-full rounded-[16px] border border-gray-200 bg-white px-4 text-sm outline-none focus:border-[#F26A21]"
                />
              </div>

              {/* PLAN */}

              <div>
                <label className="text-sm font-bold text-gray-800">
                  Plan
                </label>

                <input
                  type="text"
                  value={
                    planName
                  }
                  readOnly
                  className="mt-2 min-h-[50px] w-full rounded-[16px] border border-gray-200 bg-gray-50 px-4 text-sm font-semibold text-gray-700"
                />
              </div>

              {/* ADDRESS */}

              <div className="md:col-span-2">
                <label className="text-sm font-bold text-gray-800">
                  Delivery Address
                </label>

                <textarea
                  rows={3}
                  value={
                    deliveryAddress
                  }
                  onChange={(
                    event
                  ) =>
                    setDeliveryAddress(
                      event.target.value
                    )
                  }
                  placeholder="Enter your full delivery address"
                  className="mt-2 w-full rounded-[16px] border border-gray-200 bg-white px-4 py-3 text-sm leading-6 outline-none focus:border-[#F26A21]"
                />
              </div>
            </div>
          </section>

          {/* DAYS */}

          <section className="rounded-[28px] border border-gray-200 bg-white px-5 py-6 shadow-sm sm:px-6 lg:px-8 lg:py-8">
            <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-[#F26A21]">
              Delivery Days
            </p>

            <h2 className="mt-2 text-2xl font-bold text-gray-950">
              Choose Your Days
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Select every day you want your meals delivered.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              {DAYS.map(
                (day) => {
                  const active =
                    selectedDays.includes(
                      day
                    );

                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() =>
                        toggleDay(
                          day
                        )
                      }
                      className={`min-h-[46px] rounded-full border px-5 text-sm font-bold transition ${
                        active
                          ? "border-[#F26A21] bg-[#F26A21] text-white"
                          : "border-gray-200 bg-white text-gray-700 hover:border-[#F26A21]"
                      }`}
                    >
                      {day}
                    </button>
                  );
                }
              )}
            </div>
          </section>

          {/* TIMETABLE */}

          {selectedDays.length >
            0 && (
            <section className="rounded-[28px] border border-gray-200 bg-white px-5 py-6 shadow-sm sm:px-6 lg:px-8 lg:py-8">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-[#F26A21]">
                    Weekly Timetable
                  </p>

                  <h2 className="mt-2 text-2xl font-bold text-gray-950">
                    Your Meal Schedule
                  </h2>
                </div>

                <span className="w-fit rounded-full bg-gray-100 px-4 py-2 text-xs font-bold text-gray-600">
                  {selectedDays.length}{" "}
                  {selectedDays.length ===
                  1
                    ? "day"
                    : "days"}
                </span>
              </div>

              <div className="mt-6 space-y-5">
                {DAYS.filter(
                  (day) =>
                    selectedDays.includes(
                      day
                    )
                ).map(
                  (day) => (
                    <div
                      key={day}
                      className="rounded-[22px] border border-gray-200 bg-[#FAFAFA] px-4 py-5 sm:px-5"
                    >
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <h3 className="text-xl font-bold text-gray-950">
                          {day}
                        </h3>

                        {timetable[
                          day
                        ]
                          .delivery_time && (
                          <span className="w-fit rounded-full bg-[#FFF1E9] px-3 py-2 text-xs font-bold text-[#F26A21]">
                            {formatTime(
                              timetable[
                                day
                              ]
                                .delivery_time
                            )}
                          </span>
                        )}
                      </div>

                      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-[1.5fr_0.7fr]">
                        {/* MEAL */}

                        <div>
                          <label className="text-sm font-bold text-gray-800">
                            Meal
                          </label>

                          <input
                            type="text"
                            value={
                              timetable[
                                day
                              ]
                                .meal_preference
                            }
                            onChange={(
                              event
                            ) =>
                              updateTimetable(
                                day,
                                "meal_preference",
                                event.target.value
                              )
                            }
                            placeholder="e.g. Jollof rice & turkey"
                            className="mt-2 min-h-[50px] w-full rounded-[16px] border border-gray-200 bg-white px-4 text-sm outline-none focus:border-[#F26A21]"
                          />
                        </div>

                        {/* TIME */}

                        <div>
                          <label className="text-sm font-bold text-gray-800">
                            Delivery Time
                          </label>

                          <input
                            type="time"
                            value={
                              timetable[
                                day
                              ]
                                .delivery_time
                            }
                            onChange={(
                              event
                            ) =>
                              updateTimetable(
                                day,
                                "delivery_time",
                                event.target.value
                              )
                            }
                            className="mt-2 min-h-[50px] w-full rounded-[16px] border border-gray-200 bg-white px-4 text-sm"
                          />
                        </div>

                        {/* NOTES */}

                        <div className="md:col-span-2">
                          <label className="text-sm font-bold text-gray-800">
                            Notes{" "}
                            <span className="font-normal text-gray-400">
                              (optional)
                            </span>
                          </label>

                          <input
                            type="text"
                            value={
                              timetable[
                                day
                              ].notes
                            }
                            onChange={(
                              event
                            ) =>
                              updateTimetable(
                                day,
                                "notes",
                                event.target.value
                              )
                            }
                            placeholder="No pepper, extra protein, allergies..."
                            className="mt-2 min-h-[50px] w-full rounded-[16px] border border-gray-200 bg-white px-4 text-sm outline-none focus:border-[#F26A21]"
                          />
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            </section>
          )}

          {/* SPECIAL REQUEST */}

          <section className="rounded-[28px] border border-gray-200 bg-white px-5 py-6 shadow-sm sm:px-6 lg:px-8 lg:py-8">
            <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-[#F26A21]">
              Special Request
            </p>

            <h2 className="mt-2 text-2xl font-bold text-gray-950">
              Anything Else?
            </h2>

            <textarea
              rows={4}
              value={
                specialRequests
              }
              onChange={(
                event
              ) =>
                setSpecialRequests(
                  event.target.value
                )
              }
              placeholder="Optional request..."
              className="mt-5 w-full rounded-[18px] border border-gray-200 bg-white px-4 py-4 text-sm leading-6 outline-none focus:border-[#F26A21]"
            />
          </section>

          {/* SUBMIT */}

          <section className="rounded-[28px] bg-[#111111] px-5 py-7 text-white sm:px-6 lg:px-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-[#F26A21]">
                  {isRenewal
                    ? "Renewal Request"
                    : "Meal Plan Request"}
                </p>

                <h2 className="mt-2 text-2xl font-bold">
                  {isRenewal
                    ? "Ready For Your Next Week?"
                    : "Ready To Submit?"}
                </h2>

                <p className="mt-2 max-w-xl text-sm leading-6 text-white/60">
                  Rhennie Studio will review your meals, confirm the dates and set the amount before payment.
                </p>
              </div>

              <button
                type="submit"
                disabled={
                  submitting ||
                  selectedDays.length ===
                    0
                }
                className="min-h-[50px] rounded-full bg-[#F26A21] px-7 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting
                  ? "Submitting..."
                  : isRenewal
                    ? "Submit Renewal"
                    : "Submit Meal Plan"}
              </button>
            </div>
          </section>
        </form>
      </div>
    </main>
  );
}

/* =========================================================
   EXPORT
========================================================= */

export default function SubscriptionBuilderPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#FAFAF8]">
          <div className="mx-auto max-w-6xl px-5 py-20 text-center sm:px-6 lg:px-8">
            <div className="rounded-[28px] border border-gray-200 bg-white px-6 py-20 shadow-sm">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-black/10 border-t-[#F26A21]" />

              <p className="mt-4 text-sm text-gray-500">
                Preparing your meal plan...
              </p>
            </div>
          </div>
        </main>
      }
    >
      <SubscriptionBuilderContent />
    </Suspense>
  );
}
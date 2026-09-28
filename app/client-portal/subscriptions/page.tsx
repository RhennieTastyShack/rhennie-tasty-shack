"use client";

import {
  Suspense,
  useEffect,
  useMemo,
  useRef,
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

import {
  quoteSubscription,
  type DispatchMode,
} from "@/lib/subscription-price";

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

type CourseName = "Breakfast" | "Lunch" | "Dinner";

type SelectedDish = {
  menuItemId: string;
  name: string;
  unitPrice: number;
};

type CourseEntry = {
  selected: boolean;
  dish: string;
  time: string;
  dishes: SelectedDish[];
};

type MenuChoice = {
  id: string;
  name: string;
  price: number;
  collection: string;
  available?: boolean;
};

type TimetableEntry = {
  day: string;
  meal_preference: string;
  delivery_time: string;
  notes: string;
  courses: Record<CourseName, CourseEntry>;
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

const COURSES: CourseName[] = ["Breakfast", "Lunch", "Dinner"];

const DURATIONS = [
  { id: "1-week", label: "1 week" },
  { id: "2-weeks", label: "2 weeks" },
  { id: "1-month", label: "1 month" },
  { id: "3-months", label: "3 months" },
  { id: "ongoing", label: "As long as I wish" },
];

const PLAN_NAMES: Record<string, string> = {
  "daily-lunch": "Lunch Atelier",
  lunch: "Lunch Atelier",

  "weekly-plan": "The Signature Table",
  weekly: "The Signature Table",

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

function emptyCourses(): Record<CourseName, CourseEntry> {
  return {
    Breakfast: { selected: false, dish: "", time: "", dishes: [] },
    Lunch: { selected: false, dish: "", time: "", dishes: [] },
    Dinner: { selected: false, dish: "", time: "", dishes: [] },
  };
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
      courses: emptyCourses(),
    },

    Tuesday: {
      day: "Tuesday",
      meal_preference: "",
      delivery_time: "",
      notes: "",
      courses: emptyCourses(),
    },

    Wednesday: {
      day: "Wednesday",
      meal_preference: "",
      delivery_time: "",
      notes: "",
      courses: emptyCourses(),
    },

    Thursday: {
      day: "Thursday",
      meal_preference: "",
      delivery_time: "",
      notes: "",
      courses: emptyCourses(),
    },

    Friday: {
      day: "Friday",
      meal_preference: "",
      delivery_time: "",
      notes: "",
      courses: emptyCourses(),
    },

    Saturday: {
      day: "Saturday",
      meal_preference: "",
      delivery_time: "",
      notes: "",
      courses: emptyCourses(),
    },

    Sunday: {
      day: "Sunday",
      meal_preference: "",
      delivery_time: "",
      notes: "",
      courses: emptyCourses(),
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

function coursesForPlan(planSlug: string): CourseName[] {
  if (planSlug === "daily-lunch" || planSlug === "lunch") {
    return ["Lunch"];
  }
  return COURSES;
}

function subscriptionEnd(start: string, durationId: string) {
  if (durationId === "ongoing" || !start) return null;
  const date = new Date(`${start}T12:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  if (durationId === "1-week") date.setDate(date.getDate() + 6);
  else if (durationId === "2-weeks") date.setDate(date.getDate() + 13);
  else if (durationId === "1-month") {
    date.setMonth(date.getMonth() + 1);
    date.setDate(date.getDate() - 1);
  } else if (durationId === "3-months") {
    date.setMonth(date.getMonth() + 3);
    date.setDate(date.getDate() - 1);
  }
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
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

  const isCustom = planSlug === "custom";

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

  const [customPaysNow, setCustomPaysNow] = useState(false);
  const paysNow = !isCustom || customPaysNow;
  const [durationId, setDurationId] = useState("ongoing");
  const [dispatchMode, setDispatchMode] = useState<DispatchMode>("PLATFORM");
  const [startDate, setStartDate] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );

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

  const paySectionRef = useRef<HTMLElement>(null);

  function revealError(message: string) {
    setErrorMessage(message);
    window.setTimeout(() => {
      paySectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 0);
  }

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");

  const [
    submittedId,
    setSubmittedId,
  ] = useState("");

  const [menuChoices, setMenuChoices] = useState<MenuChoice[]>([]);

  /* =======================================================
     TOKEN
  ======================================================= */

  const priceQuote = useMemo(() => {
    const offered = coursesForPlan(planSlug);
    const meals = selectedDays.flatMap((day) =>
      offered
        .filter((course) => timetable[day].courses[course].selected)
        .flatMap((course) =>
          timetable[day].courses[course].dishes.map((dish) => ({
            day,
            meal_service: course,
            unitPrice: dish.unitPrice,
          }))
        )
    );

    return quoteSubscription({
      meals,
      address: deliveryAddress,
      dispatchMode,
      startDate,
      endDate: subscriptionEnd(startDate, durationId),
    });
  }, [
    deliveryAddress,
    dispatchMode,
    durationId,
    planSlug,
    selectedDays,
    startDate,
    timetable,
  ]);

  function naira(value: number) {
    return `₦${value.toLocaleString("en-NG")}`;
  }

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

  useEffect(() => {
    let cancelled = false;

    async function loadMenu() {
      try {
        const response = await fetch("/api/menu", { cache: "no-store" });
        const data = await response.json();
        if (cancelled || !Array.isArray(data)) return;

        const choices = data
          .filter((item) => {
            const collection = String(item.collection || "");
            const price = Number(item.price);
            return (
              item.available !== false &&
              Number.isFinite(price) &&
              price > 0 &&
              !/box|litre|party|appetizer/i.test(collection)
            );
          })
          .map((item) => ({
            id: String(item.id),
            name: String(item.name || ""),
            price: Number(item.price),
            collection: String(item.collection || "Menu"),
            available: item.available !== false,
          }))
          .filter((item) => item.id && item.name);

        setMenuChoices(choices);
      } catch {
        if (!cancelled) setMenuChoices([]);
      }
    }

    loadMenu();

    return () => {
      cancelled = true;
    };
  }, []);

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

    if (!startDate) {
      return "Please choose the day your subscription begins.";
    }

    const offered = coursesForPlan(planSlug);

    for (const day of selectedDays) {
      const chosen = offered.filter(
        (course) => timetable[day].courses[course].selected
      );

      if (chosen.length === 0) {
        return `Choose at least one course for ${day}.`;
      }

      for (const course of chosen) {
        const item = timetable[day].courses[course];
        if (!paysNow) {
          if (!item.dish.trim()) {
            return `Name the ${course.toLowerCase()} dish for ${day}.`;
          }
        } else if (item.dishes.length === 0) {
          return `Choose at least one ${course.toLowerCase()} dish from the menu for ${day}.`;
        }
        if (!item.time.trim()) {
          return `Choose a ${course.toLowerCase()} delivery time for ${day}.`;
        }
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
    event?: React.FormEvent<HTMLFormElement>
  ) {
    event?.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");
    setSubmittedId("");

    const validation =
      validate();

    if (validation) {
      revealError(validation);
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

      const offered = coursesForPlan(planSlug);
      const endDate = subscriptionEnd(startDate, durationId);
      const durationLabel =
        DURATIONS.find((item) => item.id === durationId)?.label ||
        "As long as I wish";
      const lengthNote =
        durationId === "ongoing"
          ? `Subscription length: as long as I wish, starting ${startDate}.`
          : `Subscription length: ${durationLabel}, ${startDate} to ${endDate}.`;
      const menu = selectedDays.flatMap((day) =>
        offered
          .filter((course) => timetable[day].courses[course].selected)
          .flatMap((course) => {
            const item = timetable[day].courses[course];
            if (!paysNow) {
              return [
                {
                  day,
                  meal_service: course,
                  meal_preference: `${course} — ${item.dish.trim()}`,
                  menu_item_id: "",
                  delivery_time: item.time,
                  notes: timetable[day].notes.trim(),
                },
              ];
            }
            return item.dishes.map((dish) => ({
              day,
              meal_service: course,
              meal_preference: `${course} — ${dish.name}`,
              menu_item_id: dish.menuItemId,
              delivery_time: item.time,
              notes: timetable[day].notes.trim(),
            }));
          })
      );

      const payload = {
        plan_slug:
          planSlug,

        plan_name:
          planName,

        start_date: startDate,
        end_date: endDate,

        customer_name:
          customerName.trim(),

        customer_email:
          customerEmail.trim(),

        customer_phone:
          customerPhone.trim(),

        delivery_address:
          deliveryAddress.trim(),

        timetable: menu,

        dispatch_mode: dispatchMode,

        payment_mode: paysNow ? "AUTOMATIC" : "QUOTE",

        special_requests: [lengthNote, specialRequests.trim()]
          .filter(Boolean)
          .join("\n\n"),
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

      if (paysNow) {
        const priced = naira(result.subscription.amount || priceQuote.total);
        setSuccessMessage(`Opening payment for ${priced}.`);

        const paymentResponse = await fetch(
          `/api/subscriptions/${result.subscription.id}/payment`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        const payment = (await paymentResponse.json()) as {
          success?: boolean;
          message?: string;
          authorization_url?: string;
        };

        if (!paymentResponse.ok || !payment.authorization_url) {
          throw new Error(
            payment.message ||
              "Your plan is saved. Open My Subscriptions to pay."
          );
        }

        window.location.href = payment.authorization_url;
        return;
      }

      setSuccessMessage(
        "Your custom table is with the kitchen. They will set the price before payment."
      );

      window.setTimeout(
        () => {
          router.push(
            "/client-portal/my-subscriptions"
          );
        },
        1500
      );
    } catch (error) {
      revealError(
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
                : "Compose your own menu, choose how long you would like to stay, and we will prepare it for you."}
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
                  value={customerName}
                  onChange={(event) => setCustomerName(event.target.value)}
                  placeholder="Your full name"
                  className="mt-2 min-h-[50px] w-full rounded-[16px] border border-gray-200 bg-white px-4 text-sm outline-none focus:border-[#F26A21]"
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

          <section className="rounded-[28px] border border-gray-200 bg-white px-5 py-6 shadow-sm sm:px-6 lg:px-8 lg:py-8">
            <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-[#F26A21]">
              Membership
            </p>
            <h2 className="mt-2 text-2xl font-bold text-gray-950">
              Stay as long as you wish
            </h2>
            <p className="mt-2 text-sm leading-6 text-gray-500">
              Choose a set period, or keep the table open until you decide to stop.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {DURATIONS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setDurationId(item.id)}
                  className={`min-h-[46px] rounded-full border px-5 text-sm font-bold transition ${
                    durationId === item.id
                      ? "border-[#1A120B] bg-[#1A120B] text-white"
                      : "border-gray-200 bg-white text-gray-700 hover:border-[#1A120B]"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <div className="mt-5 max-w-xs">
              <label className="text-sm font-bold text-gray-800">
                Begins
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                className="mt-2 min-h-[50px] w-full rounded-[16px] border border-gray-200 bg-white px-4 text-sm"
              />
            </div>
          </section>

          {isCustom && (
            <section className="rounded-[28px] border border-gray-200 bg-white px-5 py-6 shadow-sm sm:px-6 lg:px-8 lg:py-8">
              <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-[#F26A21]">
                Payment
              </p>
              <h2 className="mt-2 text-2xl font-bold text-gray-950">
                How this table is paid
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500">
                Automatic payment uses the menu price and opens payment when you continue. A kitchen quote waits until the amount is set.
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setCustomPaysNow(true)}
                  className={`rounded-2xl border p-4 text-left ${
                    customPaysNow
                      ? "border-[#F26A21] bg-[#FFF7F2]"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <p className="text-sm font-bold text-gray-950">Automatic payment</p>
                  <p className="mt-1 text-xs leading-5 text-gray-500">
                    Choose each dish from the menu and pay that total now.
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => setCustomPaysNow(false)}
                  className={`rounded-2xl border p-4 text-left ${
                    customPaysNow
                      ? "border-gray-200 bg-white"
                      : "border-[#F26A21] bg-[#FFF7F2]"
                  }`}
                >
                  <p className="text-sm font-bold text-gray-950">Kitchen quote</p>
                  <p className="mt-1 text-xs leading-5 text-gray-500">
                    Describe the dish. The kitchen sets the price before payment.
                  </p>
                </button>
              </div>
            </section>
          )}

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
                    Your private menu
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

                      <div className="mt-5 space-y-4">
                        {coursesForPlan(planSlug).map((course) => {
                          const item = timetable[day].courses[course];
                          return (
                            <div
                              key={course}
                              className="rounded-2xl border border-gray-200 bg-white p-4"
                            >
                              <label className="flex items-center gap-3 text-sm font-bold text-gray-900">
                                <input
                                  type="checkbox"
                                  checked={item.selected}
                                  onChange={(event) => {
                                    const selected = event.target.checked;
                                    setTimetable((current) => ({
                                      ...current,
                                      [day]: {
                                        ...current[day],
                                        courses: {
                                          ...current[day].courses,
                                          [course]: {
                                            ...current[day].courses[course],
                                            selected,
                                          },
                                        },
                                      },
                                    }));
                                  }}
                                />
                                {course}
                              </label>
                              {item.selected && (
                                <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-[1.5fr_0.7fr]">
                                  {!paysNow ? (
                                    <input
                                      type="text"
                                      value={item.dish}
                                      onChange={(event) => {
                                        const dish = event.target.value;
                                        setTimetable((current) => ({
                                          ...current,
                                          [day]: {
                                            ...current[day],
                                            courses: {
                                              ...current[day].courses,
                                              [course]: {
                                                ...current[day].courses[course],
                                                dish,
                                                dishes: [],
                                              },
                                            },
                                          },
                                        }));
                                      }}
                                      placeholder="Describe the custom dish"
                                      className="min-h-[48px] rounded-[16px] border border-gray-200 px-4 text-sm outline-none focus:border-[#F26A21]"
                                    />
                                  ) : (
                                    <div>
                                      {item.dishes.length > 0 && (
                                        <ul className="mb-3 space-y-2">
                                          {item.dishes.map((dish) => (
                                            <li
                                              key={dish.menuItemId}
                                              className="flex items-center justify-between gap-3 rounded-2xl border border-[#F26A21]/20 bg-[#FFF7F2] px-3 py-2"
                                            >
                                              <span className="text-sm font-semibold text-gray-900">
                                                {dish.name}
                                                <span className="ml-2 font-medium text-gray-500">
                                                  {naira(dish.unitPrice)}
                                                </span>
                                              </span>
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  setTimetable((current) => ({
                                                    ...current,
                                                    [day]: {
                                                      ...current[day],
                                                      courses: {
                                                        ...current[day].courses,
                                                        [course]: {
                                                          ...current[day].courses[course],
                                                          dishes: current[day].courses[course].dishes.filter(
                                                            (chosen) =>
                                                              chosen.menuItemId !== dish.menuItemId
                                                          ),
                                                        },
                                                      },
                                                    },
                                                  }));
                                                }}
                                                className="text-xs font-bold text-[#F26A21]"
                                              >
                                                Remove
                                              </button>
                                            </li>
                                          ))}
                                        </ul>
                                      )}
                                      <select
                                        value=""
                                        onChange={(event) => {
                                          const menuItemId = event.target.value;
                                          const choice = menuChoices.find(
                                            (meal) => meal.id === menuItemId
                                          );
                                          if (!choice) return;
                                          setTimetable((current) => {
                                            const existing =
                                              current[day].courses[course].dishes;
                                            if (
                                              existing.some(
                                                (chosen) =>
                                                  chosen.menuItemId === choice.id
                                              )
                                            ) {
                                              return current;
                                            }
                                            return {
                                              ...current,
                                              [day]: {
                                                ...current[day],
                                                courses: {
                                                  ...current[day].courses,
                                                  [course]: {
                                                    ...current[day].courses[course],
                                                    dishes: [
                                                      ...existing,
                                                      {
                                                        menuItemId: choice.id,
                                                        name: choice.name,
                                                        unitPrice: choice.price,
                                                      },
                                                    ],
                                                  },
                                                },
                                              },
                                            };
                                          });
                                        }}
                                        className="min-h-[48px] w-full rounded-[16px] border border-gray-200 bg-white px-4 text-sm outline-none focus:border-[#F26A21]"
                                      >
                                        <option value="">
                                          {item.dishes.length
                                            ? "Add another dish"
                                            : "Choose from the menu"}
                                        </option>
                                        {menuChoices
                                          .filter(
                                            (meal) =>
                                              !item.dishes.some(
                                                (chosen) =>
                                                  chosen.menuItemId === meal.id
                                              )
                                          )
                                          .map((meal) => (
                                            <option key={meal.id} value={meal.id}>
                                              {meal.name} — {naira(meal.price)}
                                            </option>
                                          ))}
                                      </select>
                                    </div>
                                  )}
                                  <input
                                    type="time"
                                    value={item.time}
                                    onChange={(event) => {
                                      const time = event.target.value;
                                      setTimetable((current) => ({
                                        ...current,
                                        [day]: {
                                          ...current[day],
                                          courses: {
                                            ...current[day].courses,
                                            [course]: {
                                              ...current[day].courses[course],
                                              time,
                                            },
                                          },
                                        },
                                      }));
                                    }}
                                    className="min-h-[48px] rounded-[16px] border border-gray-200 px-4 text-sm"
                                  />
                                </div>
                              )}
                            </div>
                          );
                        })}

                        {/* NOTES */}

                        <div>
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

          <section className="rounded-[28px] border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
            <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-[#F26A21]">
              Delivery
            </p>
            <h2 className="mt-2 text-2xl font-bold text-gray-950">
              Who brings it
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500">
              A platform rider adds the Lagos delivery fee to every drop. Your own rider leaves delivery off the bill.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setDispatchMode("PLATFORM")}
                className={`rounded-2xl border p-4 text-left ${
                  dispatchMode === "PLATFORM"
                    ? "border-[#F26A21] bg-[#FFF7F2]"
                    : "border-gray-200 bg-white"
                }`}
              >
                <p className="text-sm font-bold text-gray-950">Platform rider</p>
                <p className="mt-1 text-xs leading-5 text-gray-500">
                  {priceQuote.deliveryFeeEach
                    ? `${naira(priceQuote.deliveryFeeEach)} each drop`
                    : "₦2,500 to ₦9,900 each drop, from the area in your address"}
                </p>
              </button>
              <button
                type="button"
                onClick={() => setDispatchMode("CUSTOMER_DISPATCH")}
                className={`rounded-2xl border p-4 text-left ${
                  dispatchMode === "CUSTOMER_DISPATCH"
                    ? "border-[#F26A21] bg-[#FFF7F2]"
                    : "border-gray-200 bg-white"
                }`}
              >
                <p className="text-sm font-bold text-gray-950">My own rider</p>
                <p className="mt-1 text-xs leading-5 text-gray-500">
                  No delivery fee on this plan
                </p>
              </button>
            </div>

            {!paysNow ? (
              <p className="mt-6 border-t border-gray-100 pt-5 text-sm leading-6 text-gray-500">
                A custom table is priced by the kitchen before payment.
              </p>
            ) : (
            <div className="mt-6 space-y-2 border-t border-gray-100 pt-5 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>
                  Menu
                  {priceQuote.perWeek ? " this week" : ""}
                </span>
                <span>{naira(priceQuote.mealTotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>
                  Delivery
                  {dispatchMode === "PLATFORM" && priceQuote.drops
                    ? ` · ${priceQuote.drops} drop${priceQuote.drops === 1 ? "" : "s"}`
                    : ""}
                </span>
                <span>{naira(priceQuote.deliveryTotal)}</span>
              </div>
              <div className="flex justify-between pt-2 text-base font-bold text-gray-950">
                <span>{priceQuote.perWeek ? "Each week" : "Total"}</span>
                <span>{naira(priceQuote.total)}</span>
              </div>
              <p className="pt-2 text-xs leading-5 text-gray-400">
                Every dish you add is charged at its menu price. One delivery fee covers all the dishes in the same course. Name the area in your address so the delivery fee matches the drop.
              </p>
            </div>
            )}
          </section>

          {/* SUBMIT */}

          <section
            ref={paySectionRef}
            className="relative z-20 rounded-[28px] bg-[#111111] px-5 py-7 text-white sm:px-6 lg:px-8"
          >
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
                  {!paysNow
                    ? "The kitchen will set the price for this custom table before payment."
                    : priceQuote.total
                      ? `${priceQuote.perWeek ? "Each week" : "Total"} ${naira(priceQuote.total)}. Payment opens as soon as you continue.`
                      : "Choose dishes from the menu and the price appears here."}
                </p>
                {errorMessage ? (
                  <p className="mt-3 max-w-xl text-sm leading-6 text-red-300">
                    {errorMessage}
                  </p>
                ) : null}
              </div>

              <button
                type="button"
                onClick={() => {
                  void submitMealPlan();
                }}
                disabled={
                  submitting ||
                  selectedDays.length ===
                    0
                }
                className="min-h-[50px] rounded-full bg-[#F26A21] px-7 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting
                  ? paysNow
                    ? "Opening payment..."
                    : "Submitting..."
                  : paysNow
                    ? isRenewal
                      ? "Pay For Renewal"
                      : "Pay Now"
                    : "Submit Custom Plan"}
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
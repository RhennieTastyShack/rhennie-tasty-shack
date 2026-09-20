import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* =========================================================
   TYPES
========================================================= */

type TimetableEntry = {
  day?: string;
  meal_preference?: string;
  delivery_time?: string;
  notes?: string;
};

type CreateSubscriptionBody = {
  plan_slug?: string;
  plan_name?: string;

  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;

  delivery_address?: string;

  timetable?: TimetableEntry[];

  special_requests?: string;
};

/* =========================================================
   SUPABASE ADMIN
========================================================= */

function getSupabaseAdmin() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL"
    );
  }

  if (!serviceRoleKey) {
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE_KEY"
    );
  }

  return createClient(
    supabaseUrl,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

/* =========================================================
   HELPERS
========================================================= */

function cleanText(value: unknown) {
  return String(
    value ?? ""
  ).trim();
}

function getAccessToken(
  request: NextRequest
) {
  const authorization =
    request.headers.get(
      "authorization"
    );

  if (!authorization) {
    return null;
  }

  const [type, token] =
    authorization.split(" ");

  if (
    type?.toLowerCase() !== "bearer" ||
    !token
  ) {
    return null;
  }

  return token.trim();
}

function cleanTimetable(
  value: unknown
): TimetableEntry[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry) => {
      const item =
        entry as Record<
          string,
          unknown
        >;

      return {
        day:
          cleanText(
            item.day
          ),

        meal_preference:
          cleanText(
            item.meal_preference
          ),

        delivery_time:
          cleanText(
            item.delivery_time
          ),

        notes:
          cleanText(
            item.notes
          ),
      };
    })
    .filter(
      (entry) =>
        entry.day &&
        entry.meal_preference &&
        entry.delivery_time
    );
}

/* =========================================================
   AUTHENTICATE CUSTOMER
========================================================= */

async function authenticateCustomer(
  request: NextRequest
) {
  const token =
    getAccessToken(request);

  if (!token) {
    return {
      user: null,

      response:
        NextResponse.json(
          {
            success: false,
            message:
              "Authentication required.",
          },
          {
            status: 401,
          }
        ),
    };
  }

  const supabaseAdmin =
    getSupabaseAdmin();

  const {
    data: { user },
    error,
  } =
    await supabaseAdmin.auth.getUser(
      token
    );

  if (
    error ||
    !user
  ) {
    console.error(
      "Subscription authentication error:",
      error
    );

    return {
      user: null,

      response:
        NextResponse.json(
          {
            success: false,
            message:
              "Your session is invalid or has expired.",
          },
          {
            status: 401,
          }
        ),
    };
  }

  return {
    user,
    response: null,
  };
}

/* =========================================================
   GET /api/subscriptions

   Returns only the signed-in customer's subscriptions.
========================================================= */

export async function GET(
  request: NextRequest
) {
  try {
    const auth =
      await authenticateCustomer(
        request
      );

    if (
      auth.response ||
      !auth.user
    ) {
      return auth.response;
    }

    const supabaseAdmin =
      getSupabaseAdmin();

    const {
      data: subscriptions,
      error,
    } =
      await supabaseAdmin
        .from("subscriptions")
        .select("*")
        .eq(
          "customer_id",
          auth.user.id
        )
        .order(
          "created_at",
          {
            ascending: false,
          }
        );

    if (error) {
      console.error(
        "Subscriptions GET error:",
        error
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Unable to load your subscriptions.",
          error:
            error.message,
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json({
      success: true,
      subscriptions:
        subscriptions || [],
    });
  } catch (error) {
    console.error(
      "Subscriptions GET unexpected error:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error instanceof Error
            ? error.message
            : "Unable to load your subscriptions.",
      },
      {
        status: 500,
      }
    );
  }
}

/* =========================================================
   CUSTOMER CODE

   Reuse RTS-CUS-#### for the same customer.

   This supports renewals because one customer can now
   have multiple subscription rows with the same code.
========================================================= */

async function getOrCreateCustomerCode(
  customerId: string
) {
  const supabaseAdmin =
    getSupabaseAdmin();

  /* =====================================================
     1. REUSE EXISTING CODE
  ===================================================== */

  const {
    data: existing,
    error: existingError,
  } =
    await supabaseAdmin
      .from("subscriptions")
      .select("customer_code")
      .eq(
        "customer_id",
        customerId
      )
      .not(
        "customer_code",
        "is",
        null
      )
      .order(
        "created_at",
        {
          ascending: true,
        }
      )
      .limit(1)
      .maybeSingle();

  if (existingError) {
    console.error(
      "Existing customer code lookup error:",
      existingError
    );

    throw new Error(
      "Unable to load customer ID."
    );
  }

  if (
    existing?.customer_code
  ) {
    return existing.customer_code;
  }

  /* =====================================================
     2. GENERATE NEXT RTS-CUS-####
  ===================================================== */

  const {
    data: rows,
    error: codesError,
  } =
    await supabaseAdmin
      .from("subscriptions")
      .select("customer_code")
      .not(
        "customer_code",
        "is",
        null
      );

  if (codesError) {
    console.error(
      "Customer code generation error:",
      codesError
    );

    throw new Error(
      "Unable to generate customer ID."
    );
  }

  let highest = 0;

  for (
    const row of rows || []
  ) {
    const code =
      cleanText(
        row.customer_code
      );

    const match =
      code.match(
        /^RTS-CUS-(\d+)$/
      );

    if (!match) {
      continue;
    }

    const number =
      Number(match[1]);

    if (
      Number.isFinite(number) &&
      number > highest
    ) {
      highest =
        number;
    }
  }

  const next =
    highest + 1;

  return `RTS-CUS-${String(
    next
  ).padStart(
    4,
    "0"
  )}`;
}

/* =========================================================
   POST /api/subscriptions

   Creates a NEW subscription.

   Used for:
   - normal new meal plans
   - renewals after the customer finishes the new timetable

   Renewal does NOT overwrite the old paid plan.
========================================================= */

export async function POST(
  request: NextRequest
) {
  try {
    /* =====================================================
       AUTHENTICATE
    ===================================================== */

    const auth =
      await authenticateCustomer(
        request
      );

    if (
      auth.response ||
      !auth.user
    ) {
      return auth.response;
    }

    const user =
      auth.user;

    /* =====================================================
       BODY
    ===================================================== */

    let body:
      CreateSubscriptionBody;

    try {
      body =
        await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid request body.",
        },
        {
          status: 400,
        }
      );
    }

    /* =====================================================
       CUSTOMER
    ===================================================== */

    const customerName =
      cleanText(
        body.customer_name
      ) ||
      cleanText(
        user.user_metadata
          ?.full_name
      ) ||
      cleanText(
        user.user_metadata
          ?.name
      );

    const customerEmail =
      cleanText(
        body.customer_email
      ) ||
      cleanText(
        user.email
      );

    const customerPhone =
      cleanText(
        body.customer_phone
      );

    const deliveryAddress =
      cleanText(
        body.delivery_address
      );

    if (!customerName) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Customer name is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (!customerEmail) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Customer email is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (!customerPhone) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Phone number is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (!deliveryAddress) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Delivery address is required.",
        },
        {
          status: 400,
        }
      );
    }

    /* =====================================================
       PLAN
    ===================================================== */

    const planSlug =
      cleanText(
        body.plan_slug
      ) ||
      "weekly-plan";

    const planName =
      cleanText(
        body.plan_name
      ) ||
      "Weekly Plan";

    /* =====================================================
       TIMETABLE
    ===================================================== */

    const timetable =
      cleanTimetable(
        body.timetable
      );

    if (
      timetable.length ===
      0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please select at least one meal day.",
        },
        {
          status: 400,
        }
      );
    }

    /* =====================================================
       DUPLICATE DAY CHECK
    ===================================================== */

    const usedDays =
      new Set<string>();

    for (
      const entry of timetable
    ) {
      const day =
        cleanText(
          entry.day
        ).toLowerCase();

      if (
        usedDays.has(day)
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Each delivery day can only appear once.",
          },
          {
            status: 400,
          }
        );
      }

      usedDays.add(day);
    }

    /* =====================================================
       DELIVERY DAYS
    ===================================================== */

    const deliveryDays =
      timetable.map(
        (entry) =>
          cleanText(
            entry.day
          )
      );

    /* =====================================================
       DELIVERY TIME
    ===================================================== */

    const deliveryTimes = [
      ...new Set(
        timetable
          .map(
            (entry) =>
              cleanText(
                entry.delivery_time
              )
          )
          .filter(Boolean)
      ),
    ];

    const commonDeliveryTime =
      deliveryTimes.length === 1
        ? deliveryTimes[0]
        : null;

    /* =====================================================
       SPECIAL REQUEST
    ===================================================== */

    const specialRequests =
      cleanText(
        body.special_requests
      ) || null;

    /* =====================================================
       CUSTOMER CODE
    ===================================================== */

    const customerCode =
      await getOrCreateCustomerCode(
        user.id
      );

    /* =====================================================
       INSERT
    ===================================================== */

    const supabaseAdmin =
      getSupabaseAdmin();

    const {
      data: subscription,
      error: insertError,
    } =
      await supabaseAdmin
        .from("subscriptions")
        .insert({
          customer_id:
            user.id,

          customer_code:
            customerCode,

          plan_slug:
            planSlug,

          plan_name:
            planName,

          customer_name:
            customerName,

          customer_email:
            customerEmail,

          customer_phone:
            customerPhone,

          delivery_days:
            deliveryDays,

          delivery_time:
            commonDeliveryTime,

          delivery_address:
            deliveryAddress,

          timetable,

          special_requests:
            specialRequests,

          status:
            "PENDING",

          amount:
            null,

          currency:
            "NGN",

          payment_status:
            "UNPAID",

          payment_reference:
            null,

          admin_notes:
            null,

          start_date:
            null,

          end_date:
            null,

          updated_at:
            new Date().toISOString(),
        })
        .select()
        .single();

    if (insertError) {
      console.error(
        "Subscription POST insert error:",
        insertError
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Unable to submit your meal plan.",
          error:
            insertError.message,
        },
        {
          status: 500,
        }
      );
    }

    /* =====================================================
       SUCCESS
    ===================================================== */

    return NextResponse.json(
      {
        success: true,

        message:
          "Meal plan submitted successfully.",

        subscription,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "Subscriptions POST unexpected error:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error instanceof Error
            ? error.message
            : "Unable to submit your meal plan.",
      },
      {
        status: 500,
      }
    );
  }
}
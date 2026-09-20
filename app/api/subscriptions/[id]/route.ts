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

function normalize(value: unknown) {
  return cleanText(
    value
  ).toUpperCase();
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
        day: cleanText(
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

        notes: cleanText(
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
      "Subscription auth error:",
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
   GET ONE SUBSCRIPTION
========================================================= */

export async function GET(
  request: NextRequest,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    const { id } =
      await context.params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Subscription ID is required.",
        },
        {
          status: 400,
        }
      );
    }

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
      data: subscription,
      error,
    } =
      await supabaseAdmin
        .from("subscriptions")
        .select("*")
        .eq("id", id)
        .eq(
          "customer_id",
          auth.user.id
        )
        .maybeSingle();

    if (error) {
      console.error(
        "Subscription GET error:",
        error
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Unable to load subscription.",
          error:
            error.message,
        },
        {
          status: 500,
        }
      );
    }

    if (!subscription) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Subscription not found.",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      success: true,
      subscription,
    });
  } catch (error) {
    console.error(
      "Subscription GET unexpected error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to load subscription.",
      },
      {
        status: 500,
      }
    );
  }
}

/* =========================================================
   PATCH PENDING SUBSCRIPTION
========================================================= */

export async function PATCH(
  request: NextRequest,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    const { id } =
      await context.params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Subscription ID is required.",
        },
        {
          status: 400,
        }
      );
    }

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

    /* =====================================================
       LOAD CURRENT SUBSCRIPTION
    ===================================================== */

    const {
      data: current,
      error: currentError,
    } =
      await supabaseAdmin
        .from("subscriptions")
        .select("*")
        .eq("id", id)
        .eq(
          "customer_id",
          auth.user.id
        )
        .maybeSingle();

    if (currentError) {
      console.error(
        "Subscription PATCH lookup error:",
        currentError
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Unable to load subscription.",
          error:
            currentError.message,
        },
        {
          status: 500,
        }
      );
    }

    if (!current) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Subscription not found.",
        },
        {
          status: 404,
        }
      );
    }

    /* =====================================================
       EDIT PROTECTION
    ===================================================== */

    const status =
      normalize(
        current.status
      );

    const paymentStatus =
      normalize(
        current.payment_status
      );

    if (
      paymentStatus === "PAID"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "A paid subscription cannot be edited.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      status !== "PENDING"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This subscription is already being reviewed and can no longer be edited.",
        },
        {
          status: 400,
        }
      );
    }

    /* =====================================================
       BODY
    ===================================================== */

    let body:
      Record<
        string,
        unknown
      >;

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
       TIMETABLE
    ===================================================== */

    const timetable =
      cleanTimetable(
        body.timetable
      );

    if (
      timetable.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please add at least one meal day.",
        },
        {
          status: 400,
        }
      );
    }

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
       CUSTOMER DETAILS
    ===================================================== */

    const customerPhone =
      Object.prototype.hasOwnProperty.call(
        body,
        "customer_phone"
      )
        ? cleanText(
            body.customer_phone
          )
        : cleanText(
            current.customer_phone
          );

    const deliveryAddress =
      Object.prototype.hasOwnProperty.call(
        body,
        "delivery_address"
      )
        ? cleanText(
            body.delivery_address
          )
        : cleanText(
            current.delivery_address
          );

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
       DELIVERY FIELDS
    ===================================================== */

    const deliveryDays =
      timetable.map(
        (entry) =>
          cleanText(
            entry.day
          )
      );

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

    const specialRequests =
      Object.prototype.hasOwnProperty.call(
        body,
        "special_requests"
      )
        ? cleanText(
            body.special_requests
          ) || null
        : current.special_requests;

    /* =====================================================
       UPDATE
    ===================================================== */

    const {
      data: updated,
      error: updateError,
    } =
      await supabaseAdmin
        .from("subscriptions")
        .update({
          customer_phone:
            customerPhone,

          delivery_address:
            deliveryAddress,

          timetable,

          delivery_days:
            deliveryDays,

          delivery_time:
            commonDeliveryTime,

          special_requests:
            specialRequests,

          updated_at:
            new Date().toISOString(),
        })
        .eq("id", id)
        .eq(
          "customer_id",
          auth.user.id
        )
        .select()
        .single();

    if (updateError) {
      console.error(
        "Subscription PATCH update error:",
        updateError
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Unable to update subscription.",
          error:
            updateError.message,
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json({
      success: true,
      message:
        "Meal plan updated successfully.",
      subscription:
        updated,
    });
  } catch (error) {
    console.error(
      "Subscription PATCH unexpected error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to update subscription.",
      },
      {
        status: 500,
      }
    );
  }
}
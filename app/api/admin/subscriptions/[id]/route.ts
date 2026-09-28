import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase-admin";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* =========================================================
   SUPABASE ADMIN
========================================================= */

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
  }

  if (!serviceRoleKey) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/* =========================================================
   CONSTANTS
========================================================= */

const ALL_STATUSES = [
  "PENDING",
  "REVIEWING",
  "APPROVED",
  "ACTIVE",
  "PAUSED",
  "COMPLETED",
  "CANCELLED",
] as const;

const UNPAID_ALLOWED_STATUSES = [
  "PENDING",
  "REVIEWING",
  "APPROVED",
  "CANCELLED",
] as const;

const PAID_ALLOWED_STATUSES = [
  "ACTIVE",
  "PAUSED",
  "COMPLETED",
  "CANCELLED",
] as const;

/* =========================================================
   HELPERS
========================================================= */

function cleanText(value: unknown) {
  return String(value ?? "").trim();
}

function normalize(value: unknown) {
  return cleanText(value).toUpperCase();
}

function parseAmount(value: unknown) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return "__INVALID_AMOUNT__";
  }

  return parsed;
}

function parseDate(value: unknown) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const text = cleanText(value);
  const date = new Date(text);

  if (Number.isNaN(date.getTime())) {
    return "__INVALID_DATE__";
  }

  return text;
}

/* =========================================================
   SAFE ROUTE PARAM
========================================================= */

async function getRouteId(
  context:
    | {
        params?:
          | Promise<{ id?: string }>
          | { id?: string };
      }
    | undefined
) {
  if (!context?.params) {
    return "";
  }

  const params = await Promise.resolve(context.params);

  return cleanText(params?.id);
}

/* =========================================================
   GET ONE SUBSCRIPTION
========================================================= */

export async function GET(
  request: NextRequest,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const id = await getRouteId(context);

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Subscription ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    const admin = await requireAdmin(request);

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message: "Only the kitchen can view a subscription.",
        },
        { status: 401 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();

    const {
      data: subscription,
      error,
    } = await supabaseAdmin
      .from("subscriptions")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error(
        "Admin subscription GET error:",
        error
      );

      return NextResponse.json(
        {
          success: false,
          message: "Unable to load subscription.",
          error: error.message,
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
          message: "Subscription not found.",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(
      {
        success: true,
        subscription,
      },
      {
        status: 200,
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error(
      "Admin subscription GET unexpected error:",
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
   PATCH SUBSCRIPTION
========================================================= */

export async function PATCH(
  request: NextRequest,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const id = await getRouteId(context);

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Subscription ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    const admin = await requireAdmin(request);

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message: "Only the kitchen can update a subscription.",
        },
        { status: 401 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();

    /* =====================================================
       LOAD CURRENT SUBSCRIPTION
    ===================================================== */

    const {
      data: current,
      error: currentError,
    } = await supabaseAdmin
      .from("subscriptions")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (currentError) {
      console.error(
        "Admin subscription lookup error:",
        currentError
      );

      return NextResponse.json(
        {
          success: false,
          message: "Unable to load subscription.",
          error: currentError.message,
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
          message: "Subscription not found.",
        },
        {
          status: 404,
        }
      );
    }

    /* =====================================================
       REQUEST BODY
    ===================================================== */

    let body: Record<string, unknown>;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid request body.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !body ||
      typeof body !== "object" ||
      Array.isArray(body)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid request body.",
        },
        {
          status: 400,
        }
      );
    }

    const currentStatus = normalize(current.status);

    const paymentStatus = normalize(
      current.payment_status
    );

    const isPaid = paymentStatus === "PAID";

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    /* =====================================================
       STATUS
    ===================================================== */

    let requestedStatus = currentStatus;

    if (
      Object.prototype.hasOwnProperty.call(
        body,
        "status"
      )
    ) {
      requestedStatus = normalize(body.status);

      if (
        !ALL_STATUSES.includes(
          requestedStatus as
            (typeof ALL_STATUSES)[number]
        )
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid subscription status.",
          },
          {
            status: 400,
          }
        );
      }

      if (isPaid) {
        if (
          !PAID_ALLOWED_STATUSES.includes(
            requestedStatus as
              (typeof PAID_ALLOWED_STATUSES)[number]
          )
        ) {
          return NextResponse.json(
            {
              success: false,
              message:
                "A paid subscription can only be Active, Paused, Completed or Cancelled.",
            },
            {
              status: 400,
            }
          );
        }
      } else {
        if (
          !UNPAID_ALLOWED_STATUSES.includes(
            requestedStatus as
              (typeof UNPAID_ALLOWED_STATUSES)[number]
          )
        ) {
          return NextResponse.json(
            {
              success: false,
              message:
                "An unpaid subscription cannot be Active, Paused or Completed.",
            },
            {
              status: 400,
            }
          );
        }
      }

      updateData.status = requestedStatus;
    }

    /* =====================================================
       AMOUNT
    ===================================================== */

    let finalAmount =
      current.amount === null ||
      current.amount === undefined
        ? null
        : Number(current.amount);

    if (
      Object.prototype.hasOwnProperty.call(
        body,
        "amount"
      )
    ) {
      const parsedAmount = parseAmount(body.amount);

      if (
        parsedAmount === "__INVALID_AMOUNT__"
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Please enter a valid amount.",
          },
          {
            status: 400,
          }
        );
      }

      if (isPaid) {
        const currentAmount = Number(
          current.amount
        );

        /*
         * A paid subscription is financially locked.
         * Sending the same amount is harmless.
         */
        if (
          parsedAmount !== null &&
          parsedAmount !== currentAmount
        ) {
          return NextResponse.json(
            {
              success: false,
              message:
                "The amount cannot be changed after payment.",
            },
            {
              status: 400,
            }
          );
        }
      } else {
        if (
          parsedAmount !== null &&
          parsedAmount < 0
        ) {
          return NextResponse.json(
            {
              success: false,
              message: "Amount cannot be negative.",
            },
            {
              status: 400,
            }
          );
        }

        finalAmount = parsedAmount;
        updateData.amount = parsedAmount;
      }
    }

    /* =====================================================
       START DATE
    ===================================================== */

    let finalStartDate =
      current.start_date || null;

    if (
      Object.prototype.hasOwnProperty.call(
        body,
        "start_date"
      )
    ) {
      const startDate = parseDate(
        body.start_date
      );

      if (
        startDate === "__INVALID_DATE__"
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Start date is invalid.",
          },
          {
            status: 400,
          }
        );
      }

      /*
       * We allow operational date adjustments even after
       * payment, but payment fields remain protected.
       */
      finalStartDate = startDate;
      updateData.start_date = startDate;
    }

    /* =====================================================
       END DATE
    ===================================================== */

    let finalEndDate =
      current.end_date || null;

    if (
      Object.prototype.hasOwnProperty.call(
        body,
        "end_date"
      )
    ) {
      const endDate = parseDate(body.end_date);

      if (
        endDate === "__INVALID_DATE__"
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "End date is invalid.",
          },
          {
            status: 400,
          }
        );
      }

      finalEndDate = endDate;
      updateData.end_date = endDate;
    }

    /* =====================================================
       DATE RANGE VALIDATION
    ===================================================== */

    if (
      finalStartDate &&
      finalEndDate
    ) {
      const start = new Date(finalStartDate);
      const end = new Date(finalEndDate);

      if (
        end.getTime() <
        start.getTime()
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "End date cannot be before start date.",
          },
          {
            status: 400,
          }
        );
      }
    }

    /* =====================================================
       ADMIN NOTES
    ===================================================== */

    if (
      Object.prototype.hasOwnProperty.call(
        body,
        "admin_notes"
      )
    ) {
      const notes = cleanText(
        body.admin_notes
      );

      updateData.admin_notes =
        notes || null;
    }

    /* =====================================================
       APPROVAL VALIDATION
    ===================================================== */

    if (
      requestedStatus === "APPROVED"
    ) {
      if (isPaid) {
        return NextResponse.json(
          {
            success: false,
            message:
              "A paid subscription cannot be moved back to Approved.",
          },
          {
            status: 400,
          }
        );
      }

      if (
        finalAmount === null ||
        !Number.isFinite(Number(finalAmount)) ||
        Number(finalAmount) <= 0
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Set a valid amount before approving the subscription.",
          },
          {
            status: 400,
          }
        );
      }

      if (
        !finalStartDate ||
        !finalEndDate
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Set both start and end dates before approving the subscription.",
          },
          {
            status: 400,
          }
        );
      }
    }

    /* =====================================================
       ACTIVE VALIDATION

       Only a paid subscription may be ACTIVE.
       Paystack verification normally performs activation.
    ===================================================== */

    if (
      requestedStatus === "ACTIVE" &&
      !isPaid
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "An unpaid subscription cannot be activated. Payment must be verified first.",
        },
        {
          status: 400,
        }
      );
    }

    /* =====================================================
       FINANCIAL PROTECTION

       Never allow this admin route to directly modify
       payment verification information.
    ===================================================== */

    delete updateData.payment_status;
    delete updateData.payment_reference;

    /* =====================================================
       UPDATE
    ===================================================== */

    const {
      data: updated,
      error: updateError,
    } = await supabaseAdmin
      .from("subscriptions")
      .update(updateData)
      .eq("id", id)
      .select("*")
      .single();

    if (updateError) {
      console.error(
        "Admin subscription PATCH error:",
        updateError
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Unable to update subscription.",
          error: updateError.message,
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json({
      success: true,

      message: isPaid
        ? "Subscription management updated successfully."
        : "Subscription review updated successfully.",

      subscription: updated,
    });
  } catch (error) {
    console.error(
      "Admin subscription PATCH unexpected error:",
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
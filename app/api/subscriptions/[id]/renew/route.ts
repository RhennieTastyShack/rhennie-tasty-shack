import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

function cleanText(
  value: unknown
) {
  return String(
    value ?? ""
  ).trim();
}

function normalize(
  value: unknown
) {
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
    type?.toLowerCase() !==
      "bearer" ||
    !token
  ) {
    return null;
  }

  return token.trim();
}

/* =========================================================
   POST — PREPARE RENEWAL

   IMPORTANT:
   This route does NOT create an empty database row.

   It verifies:
   - customer owns the old subscription
   - old subscription is PAID
   - old subscription is ACTIVE or COMPLETED

   Then it sends the customer to the builder.

   The actual new subscription will only be inserted
   after the customer fills the new timetable.
========================================================= */

export async function POST(
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

    /* =====================================================
       AUTHENTICATE
    ===================================================== */

    const token =
      getAccessToken(
        request
      );

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Authentication required.",
        },
        {
          status: 401,
        }
      );
    }

    const supabaseAdmin =
      getSupabaseAdmin();

    const {
      data: { user },
      error: userError,
    } =
      await supabaseAdmin.auth.getUser(
        token
      );

    if (
      userError ||
      !user
    ) {
      console.error(
        "Renew authentication error:",
        userError
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Your session is invalid or has expired.",
        },
        {
          status: 401,
        }
      );
    }

    /* =====================================================
       LOAD ORIGINAL SUBSCRIPTION
    ===================================================== */

    const {
      data: original,
      error: originalError,
    } =
      await supabaseAdmin
        .from("subscriptions")
        .select("*")
        .eq("id", id)
        .eq(
          "customer_id",
          user.id
        )
        .maybeSingle();

    if (originalError) {
      console.error(
        "Renew subscription lookup error:",
        originalError
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Unable to load your subscription.",
          error:
            originalError.message,
        },
        {
          status: 500,
        }
      );
    }

    if (!original) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Subscription not found or you do not have access to it.",
        },
        {
          status: 404,
        }
      );
    }

    /* =====================================================
       VALIDATE PAYMENT
    ===================================================== */

    const paymentStatus =
      normalize(
        original.payment_status
      );

    if (
      paymentStatus !==
      "PAID"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Only a paid subscription can be renewed.",
        },
        {
          status: 400,
        }
      );
    }

    /* =====================================================
       VALIDATE STATUS
    ===================================================== */

    const status =
      normalize(
        original.status
      );

    if (
      ![
        "ACTIVE",
        "COMPLETED",
      ].includes(status)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Only an active or completed subscription can be renewed.",
        },
        {
          status: 400,
        }
      );
    }

    /* =====================================================
       SUCCESS

       No INSERT occurs here.

       The original subscription becomes the renewal source.
       The customer fills a fresh timetable first.
    ===================================================== */

    return NextResponse.json({
      success: true,

      message:
        "Renewal ready.",

      renewal: {
        source_subscription_id:
          original.id,

        customer_code:
          original.customer_code,

        customer_name:
          original.customer_name,

        customer_email:
          original.customer_email,

        customer_phone:
          original.customer_phone,

        delivery_address:
          original.delivery_address,

        plan_slug:
          original.plan_slug ||
          "weekly-plan",

        plan_name:
          original.plan_name ||
          "Weekly Plan",
      },
    });
  } catch (error) {
    console.error(
      "Renew subscription unexpected error:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error instanceof Error
            ? error.message
            : "Unable to prepare your renewal.",
      },
      {
        status: 500,
      }
    );
  }
}
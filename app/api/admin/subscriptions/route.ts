import { NextResponse } from "next/server";
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
   HELPERS
========================================================= */

function cleanText(value: unknown) {
  return String(value ?? "").trim();
}

function normalizeStatus(value: unknown) {
  return cleanText(value).toUpperCase();
}

/* =========================================================
   GET ALL SUBSCRIPTIONS
========================================================= */

export async function GET() {
  try {
    const supabaseAdmin = getSupabaseAdmin();

    const { data, error } = await supabaseAdmin
      .from("subscriptions")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error(
        "Admin subscriptions GET error:",
        error
      );

      return NextResponse.json(
        {
          success: false,
          message: "Unable to load subscriptions.",
          error: error.message,
          subscriptions: [],
          stats: {
            total: 0,
            pending: 0,
            reviewing: 0,
            approved: 0,
            active: 0,
            paid: 0,
          },
        },
        {
          status: 500,
        }
      );
    }

    const subscriptions = Array.isArray(data)
      ? data
      : [];

    /* =====================================================
       DASHBOARD STATS
    ===================================================== */

    const stats = subscriptions.reduce(
      (acc, subscription) => {
        const status = normalizeStatus(
          subscription?.status
        );

        const paymentStatus = normalizeStatus(
          subscription?.payment_status
        );

        acc.total += 1;

        if (status === "PENDING") {
          acc.pending += 1;
        }

        if (status === "REVIEWING") {
          acc.reviewing += 1;
        }

        if (status === "APPROVED") {
          acc.approved += 1;
        }

        if (status === "ACTIVE") {
          acc.active += 1;
        }

        if (paymentStatus === "PAID") {
          acc.paid += 1;
        }

        return acc;
      },
      {
        total: 0,
        pending: 0,
        reviewing: 0,
        approved: 0,
        active: 0,
        paid: 0,
      }
    );

    /* =====================================================
       SUCCESS
    ===================================================== */

    return NextResponse.json(
      {
        success: true,
        subscriptions,
        stats,
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
      "Admin subscriptions GET unexpected error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to load subscriptions.",
        subscriptions: [],
        stats: {
          total: 0,
          pending: 0,
          reviewing: 0,
          approved: 0,
          active: 0,
          paid: 0,
        },
      },
      {
        status: 500,
      }
    );
  }
}
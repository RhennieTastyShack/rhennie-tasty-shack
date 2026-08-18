import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL is missing");
}

if (!serviceRoleKey) {
  throw new Error("SUPABASE_SERVICE_ROLE_KEY is missing");
}

const supabaseAdmin = createClient(
  supabaseUrl,
  serviceRoleKey
);

const VALID_STATUSES = [
  "IN REVIEW",
  "CONFIRMED",
  "PREPARING",
  "OUT FOR DELIVERY",
  "COMPLETED",
  "CANCELLED",
];

export async function PATCH(request: Request) {
  try {
    const body = await request.json();

    const orderId = body.orderId;
    const status = body.status;

    if (!orderId) {
      return NextResponse.json(
        {
          error: "Order ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (!status) {
      return NextResponse.json(
        {
          error: "Order status is required.",
        },
        {
          status: 400,
        }
      );
    }

    const normalizedStatus = String(status)
      .trim()
      .toUpperCase();

    if (!VALID_STATUSES.includes(normalizedStatus)) {
      return NextResponse.json(
        {
          error: `Invalid order status: ${normalizedStatus}`,
        },
        {
          status: 400,
        }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("orders")
      .update({
        status: normalizedStatus,
      })
      .eq("id", orderId)
      .select()
      .single();

    if (error) {
      console.error(
        "Order Status Update Error:",
        error
      );

      return NextResponse.json(
        {
          error: error.message,
        },
        {
          status: 500,
        }
      );
    }

    if (!data) {
      return NextResponse.json(
        {
          error: "Order not found.",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(
      {
        success: true,
        order: data,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "Order Status API Error:",
      error
    );

    return NextResponse.json(
      {
        error: "Unable to update order status.",
      },
      {
        status: 500,
      }
    );
  }
}
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

export async function GET(
  request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Order ID is required.",
        },
        { status: 400 }
      );
    }

    const {
      data: order,
      error: orderError,
    } = await supabaseAdmin
      .from("orders")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (orderError) {
      console.error(
        "Get single order error:",
        orderError
      );

      return NextResponse.json(
        {
          success: false,
          error: orderError.message,
        },
        { status: 500 }
      );
    }

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          error: "Order not found.",
        },
        { status: 404 }
      );
    }

    let consultation = null;

    if (order.consultation_id) {
      const {
        data: consultationData,
        error: consultationError,
      } = await supabaseAdmin
        .from("consultations")
        .select("*")
        .eq("id", order.consultation_id)
        .maybeSingle();

      if (consultationError) {
        console.error(
          "Consultation lookup error:",
          consultationError
        );
      } else {
        consultation = consultationData;
      }
    }

    const combinedOrder = {
      ...order,

      order_number:
        order.order_number ??
        order.order_no ??
        null,

      full_name:
        order.customer_name ??
        consultation?.full_name ??
        null,

      email:
        order.customer_email ??
        consultation?.email ??
        null,

      phone:
        order.customer_phone ??
        consultation?.phone ??
        null,

      event_type:
        consultation?.event_type ??
        null,

      event_date:
        consultation?.event_date ??
        null,

      event_time:
        consultation?.event_time ??
        null,

      guest_count:
        consultation?.guest_count ??
        null,

      venue:
        consultation?.venue ??
        order.delivery_address ??
        null,

      budget:
        consultation?.budget ??
        null,

      special_request:
        consultation?.special_request ??
        order.notes ??
        null,

      consultation,
    };

    return NextResponse.json(
      {
        success: true,
        order: combinedOrder,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "Order GET API error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to fetch order.",
      },
      { status: 500 }
    );
  }
}
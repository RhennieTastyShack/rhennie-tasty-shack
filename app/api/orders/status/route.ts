import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { PICKUP_STATUSES, type PickupStatus } from "@/lib/delivery";
import { cleanText, requireAdmin } from "@/lib/supabase-admin";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL is missing");
}

if (!serviceRoleKey) {
  throw new Error("SUPABASE_SERVICE_ROLE_KEY is missing");
}

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

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
    const admin = await requireAdmin(request);

    if (!admin) {
      return NextResponse.json(
        { error: "Only the kitchen can change an order status." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const orderId = cleanText(body.orderId || body.order_id);

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required." },
        { status: 400 }
      );
    }

    const { data: existing, error: lookupError } = await supabaseAdmin
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .maybeSingle();

    if (lookupError || !existing) {
      return NextResponse.json(
        { error: "Order not found." },
        { status: 404 }
      );
    }

    /* =====================================================
       PICKUP / OWN-RIDER CODE VERIFICATION
    ====================================================== */
    if (body.confirm_pickup === true || body.confirmPickup === true) {
      const supplied = cleanText(body.pickup_code || body.pickupCode);
      const expected = cleanText(existing.pickup_code);

      if (!expected) {
        return NextResponse.json(
          {
            error:
              "This order has no pickup code. It may not be a pickup or own-rider order.",
          },
          { status: 400 }
        );
      }

      if (supplied !== expected) {
        return NextResponse.json(
          {
            error: "Pickup code does not match. Do not release the order.",
          },
          { status: 400 }
        );
      }

      const collectorName = cleanText(body.collector_name || body.collectorName);
      const staffName =
        cleanText(body.collected_by_staff || body.collectedByStaff) ||
        admin.email ||
        "kitchen";

      const pickupPayload: Record<string, unknown> = {
        pickup_status: "Collected",
        status: "COMPLETED",
        order_status: "COMPLETED",
        updated_at: new Date().toISOString(),
      };

      let orderData = existing;
      for (let attempt = 0; attempt < 5; attempt += 1) {
        const { data, error } = await supabaseAdmin
          .from("orders")
          .update(pickupPayload)
          .eq("id", orderId)
          .select()
          .single();

        if (!error && data) {
          orderData = data;
          break;
        }

        const missing = error?.message?.match(
          /Could not find the '([^']+)' column/i
        )?.[1];

        if (!missing || !(missing in pickupPayload)) {
          return NextResponse.json(
            { error: error?.message || "Unable to confirm pickup." },
            { status: 500 }
          );
        }

        delete pickupPayload[missing];
      }

      const { data: delivery } = await supabaseAdmin
        .from("deliveries")
        .select("id, status, external_rider_name")
        .eq("order_id", orderId)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (delivery) {
        const deliveryUpdate: Record<string, unknown> = {
          collected_at: new Date().toISOString(),
          collected_by_staff: staffName,
          collector_name:
            collectorName || delivery.external_rider_name || null,
          updated_at: new Date().toISOString(),
        };

        if (delivery.status !== "DELIVERED" && delivery.status !== "CANCELLED") {
          deliveryUpdate.status = "PICKED_UP";
        }

        for (let attempt = 0; attempt < 4; attempt += 1) {
          const { error } = await supabaseAdmin
            .from("deliveries")
            .update(deliveryUpdate)
            .eq("id", delivery.id);

          if (!error) break;

          const missing = error.message.match(
            /Could not find the '([^']+)' column/i
          )?.[1];
          if (!missing || !(missing in deliveryUpdate)) break;
          delete deliveryUpdate[missing];
        }
      }

      try {
        const { notifyOrderStatusChange } = await import(
          "@/lib/notify/hooks"
        );
        void notifyOrderStatusChange({
          id: orderData.id,
          order_no: orderData.order_no,
          order_number: orderData.order_number,
          customer_id: orderData.customer_id,
          customer_email: orderData.customer_email,
          customer_phone: orderData.customer_phone,
          customer_name: orderData.customer_name,
          status: orderData.status || "COMPLETED",
        });
      } catch (notifyError) {
        console.error("Pickup confirm notify error:", notifyError);
      }

      return NextResponse.json({
        success: true,
        order: orderData,
        message: "Pickup verified. Order may be released.",
      });
    }

    /* =====================================================
       PICKUP STATUS ONLY (Preparing → Ready for Pickup)
    ====================================================== */
    if (body.pickup_status || body.pickupStatus) {
      const nextPickup = cleanText(
        body.pickup_status || body.pickupStatus
      ) as PickupStatus;

      if (!PICKUP_STATUSES.includes(nextPickup)) {
        return NextResponse.json(
          { error: `Invalid pickup status: ${nextPickup}` },
          { status: 400 }
        );
      }

      if (nextPickup === "Collected") {
        return NextResponse.json(
          {
            error:
              "Use confirm_pickup with the secure pickup code to mark Collected.",
          },
          { status: 400 }
        );
      }

      const { data, error } = await supabaseAdmin
        .from("orders")
        .update({
          pickup_status: nextPickup,
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, order: data });
    }

    /* =====================================================
       FOOD ORDER STATUS
    ====================================================== */
    const status = body.status;

    if (!status) {
      return NextResponse.json(
        { error: "Order status is required." },
        { status: 400 }
      );
    }

    const normalizedStatus = String(status).trim().toUpperCase();

    if (!VALID_STATUSES.includes(normalizedStatus)) {
      return NextResponse.json(
        { error: `Invalid order status: ${normalizedStatus}` },
        { status: 400 }
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
      console.error("Order Status Update Error:", error);

      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    try {
      const { notifyOrderStatusChange } = await import(
        "@/lib/notify/hooks"
      );
      void notifyOrderStatusChange({
        id: data.id,
        order_no: data.order_no,
        order_number: data.order_number,
        customer_id: data.customer_id,
        customer_email: data.customer_email,
        customer_phone: data.customer_phone,
        customer_name: data.customer_name,
        status: data.status || normalizedStatus,
      });
    } catch (notifyError) {
      console.error("Order status notify error:", notifyError);
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
    console.error("Order Status API Error:", error);

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

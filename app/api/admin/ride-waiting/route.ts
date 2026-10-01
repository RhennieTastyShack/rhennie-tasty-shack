import { NextRequest, NextResponse } from "next/server";
import { calculateWaitingFeeNgn } from "@/lib/ride-with-701";
import { getRideWaitingConfig } from "@/lib/platform-settings";
import {
  cleanText,
  getAuthUser,
  getSupabaseAdmin,
  requireAdmin,
} from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_CAUSES = new Set(["customer", "sender", "receiver"]);

export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Only Rhennie Studio can review waiting fees." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const deliveryId = cleanText(searchParams.get("delivery_id"));
    const supabase = getSupabaseAdmin();

    let query = supabase
      .from("delivery_waiting_charges")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (deliveryId) {
      query = query.eq("delivery_id", deliveryId);
    }

    const { data, error } = await query;
    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, charges: data || [] });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to load waiting charges.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Please sign in." },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const deliveryId = cleanText(body?.delivery_id);
    const cause = cleanText(body?.cause).toLowerCase() || "customer";
    const reason = cleanText(body?.reason);
    const evidenceNote = cleanText(body?.evidence_note);
    const arrivedAt = cleanText(body?.arrived_at) || null;
    const waitingStartedAt =
      cleanText(body?.waiting_started_at) || new Date().toISOString();
    const chargeableMinutes = Math.max(
      0,
      Math.floor(Number(body?.chargeable_minutes) || 0)
    );

    if (!deliveryId || !reason) {
      return NextResponse.json(
        {
          success: false,
          message: "Delivery ID and a clear waiting reason are required.",
        },
        { status: 400 }
      );
    }

    if (!ALLOWED_CAUSES.has(cause)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Waiting fees apply only for customer, sender, or receiver delays.",
        },
        { status: 400 }
      );
    }

    const waitingConfig = await getRideWaitingConfig();
    if (!waitingConfig.enabled) {
      return NextResponse.json(
        { success: false, message: "Waiting fees are currently disabled." },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();
    const admin = await requireAdmin(request);

    const { data: delivery, error: deliveryError } = await supabase
      .from("deliveries")
      .select("id, order_id, rider_id, status, mode")
      .eq("id", deliveryId)
      .maybeSingle();

    if (deliveryError || !delivery) {
      return NextResponse.json(
        { success: false, message: "Delivery not found." },
        { status: 404 }
      );
    }

    if (!admin) {
      const { data: rider } = await supabase
        .from("riders")
        .select("id, status")
        .eq("auth_user_id", user.id)
        .maybeSingle();

      if (
        !rider ||
        rider.status !== "APPROVED" ||
        rider.id !== delivery.rider_id
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Only the assigned partner or Studio can record waiting.",
          },
          { status: 403 }
        );
      }
    }

    const freeMinutes = waitingConfig.freeWaitingMinutes;
    const fee = calculateWaitingFeeNgn({
      chargeableMinutes,
      feePerMinuteNgn: waitingConfig.feePerMinuteNgn,
      maxFeeNgn: waitingConfig.maxFeeNgn,
    });

    if (fee <= 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "No chargeable waiting yet. Free waiting period may still apply.",
        },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("delivery_waiting_charges")
      .insert({
        delivery_id: delivery.id,
        order_id: delivery.order_id,
        rider_id: delivery.rider_id,
        arrived_at: arrivedAt,
        waiting_started_at: waitingStartedAt,
        free_waiting_minutes: freeMinutes,
        chargeable_minutes: chargeableMinutes,
        fee_per_minute_ngn: waitingConfig.feePerMinuteNgn,
        waiting_fee_ngn: fee,
        cause,
        reason,
        evidence_note: evidenceNote || null,
        status: "pending",
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      charge: data,
      message:
        "Waiting charge recorded as pending. Studio can apply it after review.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to record waiting charge.",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Only Rhennie Studio can update waiting fees." },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const chargeId = cleanText(body?.charge_id);
    const status = cleanText(body?.status).toLowerCase();

    if (!chargeId || !["applied", "waived", "disputed", "pending"].includes(status)) {
      return NextResponse.json(
        { success: false, message: "Valid charge_id and status are required." },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();
    const { data: charge, error: lookupError } = await supabase
      .from("delivery_waiting_charges")
      .select("*")
      .eq("id", chargeId)
      .maybeSingle();

    if (lookupError || !charge) {
      return NextResponse.json(
        { success: false, message: "Waiting charge not found." },
        { status: 404 }
      );
    }

    const { data, error } = await supabase
      .from("delivery_waiting_charges")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", chargeId)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    if (status === "applied" && charge.order_id) {
      const fee = Number(charge.waiting_fee_ngn) || 0;
      const { data: order } = await supabase
        .from("orders")
        .select("id, delivery_fee, total, amount, notes")
        .eq("id", charge.order_id)
        .maybeSingle();

      if (order && fee > 0) {
        const nextDeliveryFee = Number(order.delivery_fee || 0) + fee;
        const nextTotal = Number(order.total ?? order.amount ?? 0) + fee;
        const noteLine = `Customer waiting fee ₦${fee.toLocaleString("en-NG")}: ${charge.reason}`;
        const notes = [order.notes, noteLine].filter(Boolean).join("\n");

        await supabase
          .from("orders")
          .update({
            delivery_fee: nextDeliveryFee,
            total: nextTotal,
            amount: nextTotal,
            notes,
            updated_at: new Date().toISOString(),
          })
          .eq("id", order.id);

        await supabase
          .from("deliveries")
          .update({
            customer_delivery_charge: nextDeliveryFee,
            gross_delivery_earning: nextDeliveryFee,
            updated_at: new Date().toISOString(),
          })
          .eq("id", charge.delivery_id);
      }
    }

    return NextResponse.json({
      success: true,
      charge: data,
      message: `Waiting charge marked ${status}.`,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to update waiting charge.",
      },
      { status: 500 }
    );
  }
}

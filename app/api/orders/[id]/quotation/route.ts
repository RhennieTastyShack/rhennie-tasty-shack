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

// =====================================================
// SAVE / UPDATE QUOTATION
// PATCH /api/orders/[id]/quotation
// =====================================================

export async function PATCH(
  request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    // =================================================
    // GET ORDER ID
    // =================================================

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        {
          error: "Order ID is required.",
        },
        { status: 400 }
      );
    }

    // =================================================
    // READ REQUEST BODY
    // =================================================

    const body = await request.json();

    const {
      quoted_amount,
      delivery_fee,
      quotation_status,
      quotation_notes,
    } = body;

    // =================================================
    // VALIDATE QUOTATION AMOUNT
    // =================================================

    const quotedAmount = Number(quoted_amount);

    if (
      !Number.isFinite(quotedAmount) ||
      quotedAmount < 0
    ) {
      return NextResponse.json(
        {
          error:
            "Please enter a valid quotation amount.",
        },
        { status: 400 }
      );
    }

    // =================================================
    // VALIDATE DELIVERY FEE
    // =================================================

    const deliveryFee = Number(
      delivery_fee ?? 0
    );

    if (
      !Number.isFinite(deliveryFee) ||
      deliveryFee < 0
    ) {
      return NextResponse.json(
        {
          error:
            "Please enter a valid delivery fee.",
        },
        { status: 400 }
      );
    }

    // =================================================
    // VALIDATE QUOTATION STATUS
    // =================================================

    const allowedQuotationStatuses = [
      "NOT QUOTED",
      "QUOTED",
      "NEGOTIATING",
      "ACCEPTED",
      "DECLINED",
    ];

    const finalQuotationStatus =
      typeof quotation_status === "string" &&
      quotation_status.trim()
        ? quotation_status
            .trim()
            .toUpperCase()
        : "QUOTED";

    if (
      !allowedQuotationStatuses.includes(
        finalQuotationStatus
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid quotation status.",
        },
        { status: 400 }
      );
    }

    // =================================================
    // CHECK ORDER EXISTS
    // =================================================

    const {
      data: existingOrder,
      error: orderLookupError,
    } = await supabaseAdmin
      .from("orders")
      .select(
        `
        id,
        status,
        order_status,
        quotation_status
        `
      )
      .eq("id", id)
      .maybeSingle();

    if (orderLookupError) {
      console.error(
        "Order lookup error:",
        orderLookupError
      );

      return NextResponse.json(
        {
          error:
            orderLookupError.message,
        },
        { status: 500 }
      );
    }

    if (!existingOrder) {
      return NextResponse.json(
        {
          error: "Order not found.",
        },
        { status: 404 }
      );
    }

    // =================================================
    // CALCULATE TOTAL
    // =================================================

    const subtotal = quotedAmount;
    const total = subtotal + deliveryFee;

    const now =
      new Date().toISOString();

    // =================================================
    // BUILD UPDATE OBJECT
    // =================================================

    const orderUpdate: Record<
      string,
      unknown
    > = {
      amount: quotedAmount,

      subtotal,

      delivery_fee:
        deliveryFee,

      total,

      quotation_status:
        finalQuotationStatus,

      quotation_notes:
        typeof quotation_notes === "string"
          ? quotation_notes.trim() || null
          : null,

      quoted_at: now,

      updated_at: now,
    };

    // =================================================
    // CUSTOMER ACCEPTS QUOTATION
    // =================================================
    //
    // When quotation is accepted:
    //
    // quotation_status = ACCEPTED
    // status            = CONFIRMED
    // order_status      = CONFIRMED
    //
    // We update BOTH status fields because your
    // existing project currently uses both.
    // =================================================

    if (
      finalQuotationStatus ===
      "ACCEPTED"
    ) {
      orderUpdate.status =
        "CONFIRMED";

      orderUpdate.order_status =
        "CONFIRMED";
    }

    // =================================================
    // DECLINED QUOTATION
    // =================================================
    //
    // Do NOT cancel the order automatically.
    //
    // This allows:
    // - renegotiation
    // - revised quotation
    // - another admin offer
    // =================================================

    if (
      finalQuotationStatus ===
      "DECLINED"
    ) {
      // Keep current order status unchanged.
    }

    // =================================================
    // UPDATE ORDER
    // =================================================

    const {
      data: order,
      error: updateError,
    } = await supabaseAdmin
      .from("orders")
      .update(orderUpdate)
      .eq("id", id)
      .select("*")
      .single();

    if (updateError) {
      console.error(
        "Quotation update error:",
        updateError
      );

      return NextResponse.json(
        {
          error:
            updateError.message,
        },
        { status: 500 }
      );
    }

    // =================================================
    // SUCCESS MESSAGE
    // =================================================

    let message =
      "Quotation saved successfully.";

    if (
      finalQuotationStatus ===
      "ACCEPTED"
    ) {
      message =
        "Quotation accepted and order confirmed successfully.";
    }

    if (
      finalQuotationStatus ===
      "DECLINED"
    ) {
      message =
        "Quotation declined successfully.";
    }

    // =================================================
    // RETURN RESULT
    // =================================================

    return NextResponse.json(
      {
        success: true,
        message,
        order,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "Quotation API error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to save quotation.",
      },
      { status: 500 }
    );
  }
}
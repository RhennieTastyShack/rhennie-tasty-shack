import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireAdmin, getAuthUser, userOwnsOrder } from "@/lib/supabase-admin";

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

    const quotedAmount = Number(quoted_amount);
    const deliveryFee = Number(delivery_fee ?? 0);

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

    let {
      data: existingOrder,
      error: orderLookupError,
    } = await supabaseAdmin
      .from("orders")
      .select(
        `
        id,
        customer_id,
        customer_email,
        status,
        order_status,
        quotation_status,
        consultation_id
        `
      )
      .eq("id", id)
      .maybeSingle();

    if (
      orderLookupError?.message?.match(/consultation_id/i)
    ) {
      const fallback = await supabaseAdmin
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

      existingOrder = fallback.data
        ? {
            ...fallback.data,
            customer_id: null,
            customer_email: null,
            consultation_id: null,
          }
        : null;
      orderLookupError = fallback.error;
    }

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

    const admin = await requireAdmin(request);
    const now = new Date().toISOString();

    const orderUpdate: Record<string, unknown> = {
      updated_at: now,
    };

    if (!admin) {
      const user = await getAuthUser(request);

      if (!user || !userOwnsOrder(user, existingOrder)) {
        return NextResponse.json(
          {
            error: "Please sign in with the account that placed this order.",
          },
          { status: 401 }
        );
      }

      const currentQuote = String(
        existingOrder.quotation_status || ""
      ).toUpperCase();

      if (
        finalQuotationStatus !== "ACCEPTED" &&
        finalQuotationStatus !== "DECLINED" &&
        finalQuotationStatus !== "NEGOTIATING"
      ) {
        return NextResponse.json(
          {
            error: "Only the kitchen can change the quotation price.",
          },
          { status: 401 }
        );
      }

      if (
        currentQuote !== "QUOTED" &&
        currentQuote !== "NEGOTIATING"
      ) {
        return NextResponse.json(
          {
            error: "This quotation can no longer be changed.",
          },
          { status: 400 }
        );
      }

      orderUpdate.quotation_status = finalQuotationStatus;

      if (
        finalQuotationStatus === "NEGOTIATING" &&
        typeof quotation_notes === "string"
      ) {
        orderUpdate.quotation_notes =
          quotation_notes.trim() || null;
      }
    } else {
      if (
        !Number.isFinite(quotedAmount) ||
        quotedAmount < 0
      ) {
        return NextResponse.json(
          {
            error: "Please enter a valid quotation amount.",
          },
          { status: 400 }
        );
      }

      if (
        !Number.isFinite(deliveryFee) ||
        deliveryFee < 0
      ) {
        return NextResponse.json(
          {
            error: "Please enter a valid delivery fee.",
          },
          { status: 400 }
        );
      }

      const subtotal = quotedAmount;
      const total = subtotal + deliveryFee;

      orderUpdate.amount = quotedAmount;
      orderUpdate.subtotal = subtotal;
      orderUpdate.delivery_fee = deliveryFee;
      orderUpdate.total = total;
      orderUpdate.quotation_status = finalQuotationStatus;
      orderUpdate.quotation_notes =
        typeof quotation_notes === "string"
          ? quotation_notes.trim() || null
          : null;
      orderUpdate.quoted_at = now;
    }

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
      const currentOrderStatus = String(
        existingOrder.status || existingOrder.order_status || ""
      ).toUpperCase();

      if (currentOrderStatus !== "COMPLETED") {
        orderUpdate.status =
          "CONFIRMED";

        orderUpdate.order_status =
          "CONFIRMED";
      }
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

    const consultationStatus =
      finalQuotationStatus === "ACCEPTED"
        ? "confirmed"
        : finalQuotationStatus === "QUOTED"
          ? "quoted"
          : null;

    if (existingOrder.consultation_id && consultationStatus) {
      const consultationUpdate: Record<string, unknown> = {
        status: consultationStatus,
        quotation_status: finalQuotationStatus,
        updated_at: now,
      };

      for (let attempt = 0; attempt < 4; attempt += 1) {
        const { error: consultationError } = await supabaseAdmin
          .from("consultations")
          .update(consultationUpdate)
          .eq("id", existingOrder.consultation_id);

        if (!consultationError) {
          break;
        }

        const missing = consultationError.message.match(
          /Could not find the '([^']+)' column/i
        )?.[1];

        if (!missing || !(missing in consultationUpdate)) {
          console.error(
            "Consultation status sync error:",
            consultationError
          );
          break;
        }

        delete consultationUpdate[missing];
      }
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
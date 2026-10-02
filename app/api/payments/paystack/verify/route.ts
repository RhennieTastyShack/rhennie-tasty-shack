import { NextResponse } from "next/server";
import { getPaystackSecretKey } from "@/lib/env";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

// =====================================================
// VERIFY PAYSTACK PAYMENT
// GET /api/payments/paystack/verify?reference=...
// =====================================================

export async function GET(request: Request) {
  try {
    const paystackSecretKey = getPaystackSecretKey();
    if (!paystackSecretKey) {
      return NextResponse.json(
        {
          success: false,
          error: "Payment provider is not configured.",
        },
        { status: 503 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();

    const { searchParams } =
      new URL(request.url);

    const reference =
      searchParams.get("reference");

    // =================================================
    // VALIDATE REFERENCE
    // =================================================

    if (!reference) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Payment reference is required.",
        },
        { status: 400 }
      );
    }

    // =================================================
    // FIND LOCAL PAYMENT RECORD
    // =================================================

    const {
      data: payment,
      error: paymentLookupError,
    } = await supabaseAdmin
      .from("payments")
      .select("*")
      .eq(
        "payment_reference",
        reference
      )
      .maybeSingle();

    if (paymentLookupError) {
      console.error(
        "Payment lookup error:",
        paymentLookupError
      );

      return NextResponse.json(
        {
          success: false,
          error:
            paymentLookupError.message,
        },
        { status: 500 }
      );
    }

    if (!payment) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Payment record not found.",
        },
        { status: 404 }
      );
    }

    let trackingToken: string | null = null;

    if (payment.order_id) {
      const { data: delivery } = await supabaseAdmin
        .from("deliveries")
        .select("tracking_token")
        .eq("order_id", payment.order_id)
        .maybeSingle();

      trackingToken = delivery?.tracking_token || null;
    }

    // =================================================
    // ALREADY VERIFIED
    // =================================================

    if (
      payment.payment_status === "paid"
    ) {
      return NextResponse.json(
        {
          success: true,

          already_verified: true,

          message:
            "Payment has already been verified.",

          payment,

          order_id:
            payment.order_id,

          tracking_token: trackingToken,

          reference:
            payment.payment_reference,

          channel:
            payment.payment_method,

          paid_at:
            payment.paid_at,
        },
        { status: 200 }
      );
    }

    // =================================================
    // VERIFY WITH PAYSTACK
    // =================================================

    const paystackResponse =
      await fetch(
        `https://api.paystack.co/transaction/verify/${encodeURIComponent(
          reference
        )}`,
        {
          method: "GET",

          headers: {
            Authorization:
              `Bearer ${paystackSecretKey}`,
          },

          cache: "no-store",
        }
      );

    const paystackData =
      await paystackResponse.json();

    // =================================================
    // PAYSTACK API ERROR
    // =================================================

    if (
      !paystackResponse.ok ||
      !paystackData.status
    ) {
      console.error(
        "Paystack verification error:",
        paystackData
      );

      return NextResponse.json(
        {
          success: false,

          error:
            paystackData.message ||
            "Unable to verify payment with Paystack.",
        },
        {
          status:
            paystackResponse.status || 500,
        }
      );
    }

    const transaction =
      paystackData.data;

    // =================================================
    // CHECK TRANSACTION STATUS
    // =================================================

    if (
      transaction.status !== "success"
    ) {
      await supabaseAdmin
        .from("payments")
        .update({
          payment_status:
            transaction.status ||
            "failed",

          provider_transaction_id:
            transaction.id
              ? String(
                  transaction.id
                )
              : null,

          provider_metadata:
            transaction,

          updated_at:
            new Date().toISOString(),
        })
        .eq("id", payment.id);

      await supabaseAdmin
        .from("orders")
        .update({
          payment_status:
            transaction.status ||
            "failed",

          updated_at:
            new Date().toISOString(),
        })
        .eq(
          "id",
          payment.order_id
        );

      return NextResponse.json(
        {
          success: false,

          error:
            "Payment has not been completed successfully.",

          payment_status:
            transaction.status,
        },
        { status: 400 }
      );
    }

    // =================================================
    // CHECK REFERENCE
    // =================================================

    if (
      transaction.reference !==
      payment.payment_reference
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Payment reference mismatch.",
        },
        { status: 400 }
      );
    }

    // =================================================
    // CHECK CURRENCY
    // =================================================

    const transactionCurrency =
      String(
        transaction.currency || ""
      ).toUpperCase();

    const paymentCurrency =
      String(
        payment.currency || ""
      ).toUpperCase();

    if (
      transactionCurrency !==
      paymentCurrency
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Payment currency mismatch.",
        },
        { status: 400 }
      );
    }

    // =================================================
    // CHECK AMOUNT
    // =================================================
    //
    // Paystack returns amount in subunit:
    //
    // NGN -> Kobo
    // USD -> Cents
    //
    // Example:
    // ₦1,000,000 = 100000000
    // =================================================

    const expectedAmount =
      Math.round(
        Number(payment.amount) * 100
      );

    const paidAmount =
      Number(transaction.amount);

    if (
      !Number.isFinite(
        expectedAmount
      ) ||
      expectedAmount <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid expected payment amount.",
        },
        { status: 500 }
      );
    }

    if (
      !Number.isFinite(paidAmount)
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid amount returned by Paystack.",
        },
        { status: 400 }
      );
    }

    if (
      paidAmount !== expectedAmount
    ) {
      console.error(
        "Payment amount mismatch:",
        {
          reference,
          expectedAmount,
          paidAmount,
        }
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Payment amount mismatch.",
        },
        { status: 400 }
      );
    }

    // =================================================
    // PAYMENT VERIFIED
    // =================================================

    const now =
      new Date().toISOString();

    const paidAt =
      transaction.paid_at ||
      transaction.paidAt ||
      now;

    // =================================================
    // UPDATE PAYMENT RECORD
    // =================================================

    const {
      data: updatedPayment,
      error: paymentUpdateError,
    } = await supabaseAdmin
      .from("payments")
      .update({
        payment_status:
          "paid",

        payment_method:
          transaction.channel ||
          payment.payment_method ||
          "PAYSTACK",

        payment_provider:
          "PAYSTACK",

        provider_transaction_id:
          transaction.id
            ? String(
                transaction.id
              )
            : null,

        provider_metadata:
          transaction,

        paid_at:
          paidAt,

        updated_at:
          now,
      })
      .eq(
        "id",
        payment.id
      )
      .select("*")
      .single();

    if (paymentUpdateError) {
      console.error(
        "Payment update error:",
        paymentUpdateError
      );

      return NextResponse.json(
        {
          success: false,
          error:
            paymentUpdateError.message,
        },
        { status: 500 }
      );
    }

    // =================================================
    // UPDATE ORDER PAYMENT SUMMARY
    // =================================================

    const {
      error: orderUpdateError,
    } = await supabaseAdmin
      .from("orders")
      .update({
        payment_status:
          "paid",

        payment_reference:
          reference,

        payment_channel:
          transaction.channel ||
          "PAYSTACK",

        updated_at:
          now,
      })
      .eq(
        "id",
        payment.order_id
      );

    if (orderUpdateError) {
      console.error(
        "Order payment update error:",
        orderUpdateError
      );

      return NextResponse.json(
        {
          success: false,
          error:
            orderUpdateError.message,
        },
        { status: 500 }
      );
    }

    // =================================================
    // CUSTOMER NOTIFICATIONS (non-blocking)
    // =================================================

    try {
      const { awardOrderPoints } = await import("@/lib/loyalty");
      void awardOrderPoints(payment.order_id);
    } catch (loyaltyError) {
      console.error("Loyalty points error:", loyaltyError);
    }

    try {
      const { notifyOrderPaid } = await import(
        "@/lib/notify/hooks"
      );
      void notifyOrderPaid(payment.order_id);
    } catch (notifyError) {
      console.error(
        "Order paid notify error:",
        notifyError
      );
    }

    // =================================================
    // SUCCESS
    // =================================================

    return NextResponse.json(
      {
        success: true,

        message:
          "Payment verified successfully.",

        payment:
          updatedPayment,

        order_id:
          payment.order_id,

        tracking_token: trackingToken,

        reference,

        channel:
          transaction.channel,

        paid_at:
          paidAt,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "Paystack verification API error:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        error:
          error instanceof Error
            ? error.message
            : "Unable to verify payment.",
      },
      { status: 500 }
    );
  }
}
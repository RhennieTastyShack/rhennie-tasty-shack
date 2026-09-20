import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

function verifyPaystackSignature(
  rawBody: string,
  signature: string,
  secret: string
) {
  const hash = crypto
    .createHmac("sha512", secret)
    .update(rawBody)
    .digest("hex");

  if (
    hash.length !== signature.length
  ) {
    return false;
  }

  try {
    return crypto.timingSafeEqual(
      Buffer.from(hash, "utf8"),
      Buffer.from(signature, "utf8")
    );
  } catch {
    return false;
  }
}

/* =========================================================
   HEALTH CHECK
========================================================= */

export async function GET() {
  return NextResponse.json({
    success: true,
    message:
      "Rhennie Tasty Shack Paystack webhook is active.",
  });
}

/* =========================================================
   PAYSTACK WEBHOOK
========================================================= */

export async function POST(
  request: Request
) {
  try {
    const paystackSecret =
      process.env.PAYSTACK_SECRET_KEY;

    if (!paystackSecret) {
      console.error(
        "PAYSTACK_SECRET_KEY is missing."
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Paystack is not configured.",
        },
        {
          status: 500,
        }
      );
    }

    /*
      IMPORTANT:
      Read the raw body BEFORE parsing JSON.
      Paystack's signature is calculated from
      the exact request payload.
    */

    const rawBody =
      await request.text();

    const signature =
      request.headers.get(
        "x-paystack-signature"
      );

    if (!signature) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Missing Paystack signature.",
        },
        {
          status: 401,
        }
      );
    }

    const signatureIsValid =
      verifyPaystackSignature(
        rawBody,
        signature,
        paystackSecret
      );

    if (!signatureIsValid) {
      console.error(
        "Invalid Paystack webhook signature."
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid webhook signature.",
        },
        {
          status: 401,
        }
      );
    }

    let event: any;

    try {
      event =
        JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid JSON payload.",
        },
        {
          status: 400,
        }
      );
    }

    /*
      We currently only need successful
      Paystack charges.
    */

    if (
      event?.event !==
      "charge.success"
    ) {
      return NextResponse.json({
        success: true,
        received: true,
        ignored: true,
        event:
          event?.event || null,
      });
    }

    const transaction =
      event?.data;

    if (!transaction) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Transaction data is missing.",
        },
        {
          status: 400,
        }
      );
    }

    const reference =
      transaction.reference;

    if (!reference) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Transaction reference is missing.",
        },
        {
          status: 400,
        }
      );
    }

    const supabaseAdmin =
      getSupabaseAdmin();

    /* =====================================================
       FIND LOCAL PAYMENT
    ===================================================== */

    const {
      data: payment,
      error: paymentError,
    } =
      await supabaseAdmin
        .from("payments")
        .select("*")
        .eq(
          "payment_reference",
          reference
        )
        .maybeSingle();

    if (paymentError) {
      console.error(
        "Webhook payment lookup error:",
        paymentError
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Unable to load payment.",
        },
        {
          status: 500,
        }
      );
    }

    /*
      The webhook may receive transactions
      that were not created by this app.

      Acknowledge them instead of repeatedly
      asking Paystack to retry.
    */

    if (!payment) {
      console.warn(
        "Webhook payment not found:",
        reference
      );

      return NextResponse.json({
        success: true,
        received: true,
        ignored: true,
        reason:
          "Payment record not found.",
      });
    }

    /* =====================================================
       VALIDATE AMOUNT
    ===================================================== */

    const expectedAmount =
      Math.round(
        Number(payment.amount) *
          100
      );

    const receivedAmount =
      Number(
        transaction.amount
      );

    if (
      !Number.isFinite(
        expectedAmount
      ) ||
      expectedAmount !==
        receivedAmount
    ) {
      console.error(
        "Webhook amount mismatch:",
        {
          reference,
          expectedAmount,
          receivedAmount,
        }
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Payment amount mismatch.",
        },
        {
          status: 400,
        }
      );
    }

    /* =====================================================
       VALIDATE CURRENCY
    ===================================================== */

    const expectedCurrency =
      String(
        payment.currency ||
          "NGN"
      ).toUpperCase();

    const receivedCurrency =
      String(
        transaction.currency ||
          ""
      ).toUpperCase();

    if (
      expectedCurrency !==
      receivedCurrency
    ) {
      console.error(
        "Webhook currency mismatch:",
        {
          reference,
          expectedCurrency,
          receivedCurrency,
        }
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Payment currency mismatch.",
        },
        {
          status: 400,
        }
      );
    }

    /* =====================================================
       IDEMPOTENCY
    ===================================================== */

    const alreadyPaid =
      String(
        payment.payment_status ||
          ""
      ).toLowerCase() ===
      "paid";

    /*
      Even if the payment row is already PAID,
      we still make sure its associated order
      or subscription is correctly updated.
    */

    if (!alreadyPaid) {
      const {
        error:
          paymentUpdateError,
      } =
        await supabaseAdmin
          .from("payments")
          .update({
            payment_status:
              "paid",

            payment_provider:
              "paystack",

            payment_method:
              transaction.channel ||
              "paystack",

            provider_transaction_id:
              transaction.id
                ? String(
                    transaction.id
                  )
                : null,

            provider_metadata:
              transaction,

            paid_at:
              transaction.paid_at ||
              transaction.paidAt ||
              new Date().toISOString(),

            updated_at:
              new Date().toISOString(),
          })
          .eq(
            "id",
            payment.id
          );

      if (
        paymentUpdateError
      ) {
        console.error(
          "Webhook payment update error:",
          paymentUpdateError
        );

        return NextResponse.json(
          {
            success: false,
            message:
              "Unable to update payment.",
          },
          {
            status: 500,
          }
        );
      }
    }

    /* =====================================================
       SUBSCRIPTION PAYMENT
    ===================================================== */

    if (
      payment.subscription_id
    ) {
      const {
        error:
          subscriptionUpdateError,
      } =
        await supabaseAdmin
          .from("subscriptions")
          .update({
            payment_status:
              "PAID",

            payment_reference:
              reference,

            status:
              "ACTIVE",

            updated_at:
              new Date().toISOString(),
          })
          .eq(
            "id",
            payment.subscription_id
          );

      if (
        subscriptionUpdateError
      ) {
        console.error(
          "Webhook subscription update error:",
          subscriptionUpdateError
        );

        return NextResponse.json(
          {
            success: false,
            message:
              "Payment was recorded but subscription could not be activated.",
          },
          {
            status: 500,
          }
        );
      }

      return NextResponse.json({
        success: true,
        received: true,
        payment_type:
          "subscription",
        reference,
      });
    }

    /* =====================================================
       ORDER PAYMENT
    ===================================================== */

    if (payment.order_id) {
      /*
        Keep the existing order behaviour:
        payment is marked PAID and the order's
        payment fields are updated.

        We do NOT alter quotation/order workflow
        fields here.
      */

      const {
        error:
          orderUpdateError,
      } =
        await supabaseAdmin
          .from("orders")
          .update({
            payment_status:
              "PAID",

            payment_reference:
              reference,

            payment_channel:
              transaction.channel ||
              "paystack",

            updated_at:
              new Date().toISOString(),
          })
          .eq(
            "id",
            payment.order_id
          );

      if (
        orderUpdateError
      ) {
        console.error(
          "Webhook order update error:",
          orderUpdateError
        );

        return NextResponse.json(
          {
            success: false,
            message:
              "Payment was recorded but order could not be updated.",
          },
          {
            status: 500,
          }
        );
      }

      return NextResponse.json({
        success: true,
        received: true,
        payment_type:
          "order",
        reference,
      });
    }

    /* =====================================================
       PAYMENT HAS NO OWNER
    ===================================================== */

    console.warn(
      "Payment has neither order_id nor subscription_id:",
      payment.id
    );

    return NextResponse.json({
      success: true,
      received: true,
      payment_type:
        "unlinked",
      reference,
    });
  } catch (error) {
    console.error(
      "Paystack webhook error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Webhook processing failed.",
      },
      {
        status: 500,
      }
    );
  }
}
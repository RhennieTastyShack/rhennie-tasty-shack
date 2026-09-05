import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

// =====================================================
// ENVIRONMENT VARIABLES
// =====================================================

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL;

const serviceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY;

const paystackSecretKey =
  process.env.PAYSTACK_SECRET_KEY;

// =====================================================
// VALIDATE ENVIRONMENT VARIABLES
// =====================================================

if (!supabaseUrl) {
  throw new Error(
    "NEXT_PUBLIC_SUPABASE_URL is missing"
  );
}

if (!serviceRoleKey) {
  throw new Error(
    "SUPABASE_SERVICE_ROLE_KEY is missing"
  );
}

if (!paystackSecretKey) {
  throw new Error(
    "PAYSTACK_SECRET_KEY is missing"
  );
}

// Create definite string constants after validation.
// This prevents TypeScript from treating them as
// string | undefined later in the file.

const SUPABASE_URL: string =
  supabaseUrl;

const SUPABASE_SERVICE_ROLE_KEY: string =
  serviceRoleKey;

const PAYSTACK_SECRET_KEY: string =
  paystackSecretKey;

// =====================================================
// SUPABASE ADMIN CLIENT
// =====================================================

const supabaseAdmin = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

// =====================================================
// GET HEALTH CHECK
// GET /api/payments/paystack/webhook
// =====================================================
//
// Paystack itself will NOT use this GET handler.
// This only allows us to open the endpoint in a browser
// and confirm that the route is deployed correctly.
// =====================================================

export async function GET() {
  return NextResponse.json(
    {
      success: true,
      message:
        "Paystack webhook endpoint is active.",
      method: "POST",
    },
    { status: 200 }
  );
}

// =====================================================
// PAYSTACK WEBHOOK
// POST /api/payments/paystack/webhook
// =====================================================

export async function POST(
  request: Request
) {
  try {
    // =================================================
    // READ RAW REQUEST BODY
    // =================================================
    //
    // IMPORTANT:
    // The raw body must be used when checking the
    // Paystack signature.
    // =================================================

    const rawBody =
      await request.text();

    // =================================================
    // GET PAYSTACK SIGNATURE
    // =================================================

    const signature =
      request.headers.get(
        "x-paystack-signature"
      );

    if (!signature) {
      console.error(
        "Paystack webhook: signature missing"
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Missing Paystack signature.",
        },
        { status: 401 }
      );
    }

    // =================================================
    // GENERATE EXPECTED SIGNATURE
    // =================================================

    const expectedSignature =
      crypto
        .createHmac(
          "sha512",
          PAYSTACK_SECRET_KEY
        )
        .update(rawBody)
        .digest("hex");

    // =================================================
    // SECURELY COMPARE SIGNATURES
    // =================================================

    const providedSignature =
      signature.trim();

    const expectedBuffer =
      Buffer.from(
        expectedSignature,
        "utf8"
      );

    const providedBuffer =
      Buffer.from(
        providedSignature,
        "utf8"
      );

    if (
      expectedBuffer.length !==
        providedBuffer.length ||
      !crypto.timingSafeEqual(
        expectedBuffer,
        providedBuffer
      )
    ) {
      console.error(
        "Paystack webhook: invalid signature"
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid webhook signature.",
        },
        { status: 401 }
      );
    }

    // =================================================
    // PARSE PAYSTACK EVENT
    // =================================================

    let event: any;

    try {
      event =
        JSON.parse(rawBody);
    } catch {
      console.error(
        "Paystack webhook: invalid JSON"
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid webhook payload.",
        },
        { status: 400 }
      );
    }

    console.log(
      "Paystack webhook event:",
      event.event
    );

    // =================================================
    // ONLY PROCESS SUCCESSFUL PAYMENTS
    // =================================================

    if (
      event.event !==
      "charge.success"
    ) {
      return NextResponse.json(
        {
          success: true,
          received: true,
          ignored: true,
          event:
            event.event || null,
        },
        { status: 200 }
      );
    }

    // =================================================
    // GET TRANSACTION
    // =================================================

    const transaction =
      event.data;

    if (!transaction) {
      console.error(
        "Paystack webhook: transaction data missing"
      );

      return NextResponse.json(
        {
          success: true,
          received: true,
          ignored: true,
        },
        { status: 200 }
      );
    }

    // =================================================
    // GET REFERENCE
    // =================================================

    const reference =
      String(
        transaction.reference || ""
      );

    if (!reference) {
      console.error(
        "Paystack webhook: reference missing"
      );

      return NextResponse.json(
        {
          success: true,
          received: true,
          ignored: true,
        },
        { status: 200 }
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
        "Webhook payment lookup error:",
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

    // =================================================
    // PAYMENT RECORD NOT FOUND
    // =================================================

    if (!payment) {
      console.error(
        "Webhook payment record not found:",
        reference
      );

      // Acknowledge the event so Paystack does not
      // repeatedly retry an unknown old reference.

      return NextResponse.json(
        {
          success: true,
          received: true,
          payment_found: false,
        },
        { status: 200 }
      );
    }

    // =================================================
    // IDEMPOTENCY CHECK
    // =================================================
    //
    // Paystack can send the same webhook more than once.
    // If this payment is already marked paid, we simply
    // acknowledge the event.
    // =================================================

    if (
      payment.payment_status ===
      "paid"
    ) {
      return NextResponse.json(
        {
          success: true,
          received: true,
          already_processed: true,
          reference,
        },
        { status: 200 }
      );
    }

    // =================================================
    // VERIFY TRANSACTION STATUS
    // =================================================

    if (
      transaction.status !==
      "success"
    ) {
      console.log(
        "Webhook ignored because transaction is not successful:",
        transaction.status
      );

      return NextResponse.json(
        {
          success: true,
          received: true,
          ignored: true,
          transaction_status:
            transaction.status || null,
        },
        { status: 200 }
      );
    }

    // =================================================
    // VERIFY REFERENCE
    // =================================================

    if (
      reference !==
      payment.payment_reference
    ) {
      console.error(
        "Webhook reference mismatch:",
        {
          received:
            reference,
          expected:
            payment.payment_reference,
        }
      );

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
    // VERIFY CURRENCY
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
      console.error(
        "Webhook currency mismatch:",
        {
          received:
            transactionCurrency,
          expected:
            paymentCurrency,
        }
      );

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
    // VERIFY AMOUNT
    // =================================================
    //
    // Paystack transaction amounts are returned in the
    // currency's subunit.
    //
    // NGN -> kobo
    // USD -> cents
    //
    // ₦1,000 = 100000 kobo
    // =================================================

    const expectedAmount =
      Math.round(
        Number(payment.amount) *
          100
      );

    const paidAmount =
      Number(
        transaction.amount
      );

    if (
      !Number.isFinite(
        expectedAmount
      ) ||
      expectedAmount <= 0
    ) {
      console.error(
        "Webhook invalid expected amount:",
        payment.amount
      );

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
      !Number.isFinite(
        paidAmount
      )
    ) {
      console.error(
        "Webhook invalid Paystack amount:",
        transaction.amount
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid payment amount returned by Paystack.",
        },
        { status: 400 }
      );
    }

    if (
      paidAmount !==
      expectedAmount
    ) {
      console.error(
        "Webhook amount mismatch:",
        {
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
    // PREPARE PAYMENT DATA
    // =================================================

    const now =
      new Date().toISOString();

    const paidAt =
      transaction.paid_at ||
      transaction.paidAt ||
      now;

    const paymentChannel =
      transaction.channel ||
      payment.payment_method ||
      "PAYSTACK";

    const providerTransactionId =
      transaction.id
        ? String(
            transaction.id
          )
        : null;

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

        payment_provider:
          "PAYSTACK",

        payment_method:
          paymentChannel,

        provider_transaction_id:
          providerTransactionId,

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
          error:
            paymentUpdateError.message,
        },
        { status: 500 }
      );
    }

    // =================================================
    // UPDATE ORDER PAYMENT RECORD
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
          paymentChannel,

        updated_at:
          now,
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
          error:
            orderUpdateError.message,
        },
        { status: 500 }
      );
    }

    // =================================================
    // SUCCESS
    // =================================================

    console.log(
      "Paystack webhook processed successfully:",
      {
        reference,
        order_id:
          payment.order_id,
        payment_id:
          payment.id,
      }
    );

    return NextResponse.json(
      {
        success: true,
        received: true,
        processed: true,
        reference,
        payment_id:
          updatedPayment.id,
        order_id:
          payment.order_id,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "Paystack webhook API error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Webhook processing failed.",
      },
      { status: 500 }
    );
  }
}
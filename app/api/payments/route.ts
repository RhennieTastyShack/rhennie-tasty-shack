import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL;

const serviceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY;

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

const supabaseAdmin = createClient(
  supabaseUrl,
  serviceRoleKey
);

// =====================================================
// CREATE PAYMENT RECORD
// POST /api/payments
// =====================================================

export async function POST(
  request: Request
) {
  try {
    const body = await request.json();

    const {
      order_id,
      amount,
      currency,
      payment_method,
      payment_provider,
      base_currency,
      base_amount,
      exchange_rate,

      crypto_currency,
      crypto_network,
      crypto_amount,
      crypto_wallet_address,
    } = body;

    // =================================================
    // VALIDATE ORDER ID
    // =================================================

    if (!order_id) {
      return NextResponse.json(
        {
          error: "Order ID is required.",
        },
        { status: 400 }
      );
    }

    // =================================================
    // CHECK ORDER EXISTS
    // =================================================

    const {
      data: order,
      error: orderError,
    } = await supabaseAdmin
      .from("orders")
      .select(`
        id,
        order_no,
        total,
        status,
        order_status,
        quotation_status,
        payment_status
      `)
      .eq("id", order_id)
      .maybeSingle();

    if (orderError) {
      console.error(
        "Payment order lookup error:",
        orderError
      );

      return NextResponse.json(
        {
          error: orderError.message,
        },
        { status: 500 }
      );
    }

    if (!order) {
      return NextResponse.json(
        {
          error: "Order not found.",
        },
        { status: 404 }
      );
    }

    // =================================================
    // ONLY ACCEPTED QUOTATIONS CAN BE PAID
    // =================================================

    if (
      order.quotation_status !==
      "ACCEPTED"
    ) {
      return NextResponse.json(
        {
          error:
            "This quotation must be accepted before payment.",
        },
        { status: 400 }
      );
    }

    // =================================================
    // VALIDATE AMOUNT
    // =================================================

    const paymentAmount =
      Number(amount);

    if (
      !Number.isFinite(paymentAmount) ||
      paymentAmount <= 0
    ) {
      return NextResponse.json(
        {
          error:
            "Please enter a valid payment amount.",
        },
        { status: 400 }
      );
    }

    // =================================================
    // VALIDATE CURRENCY
    // =================================================

    const finalCurrency =
      typeof currency === "string"
        ? currency
            .trim()
            .toUpperCase()
        : "NGN";

    const allowedCurrencies = [
      "NGN",
      "USD",
      "CRYPTO",
    ];

    if (
      !allowedCurrencies.includes(
        finalCurrency
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Unsupported payment currency.",
        },
        { status: 400 }
      );
    }

    // =================================================
    // CREATE INTERNAL PAYMENT REFERENCE
    // =================================================

    const timestamp =
      Date.now();

    const random =
      Math.floor(
        1000 +
          Math.random() * 9000
      );

    const paymentReference =
      `RTS-PAY-${timestamp}-${random}`;

    // =================================================
    // CREATE PAYMENT
    // =================================================

    const {
      data: payment,
      error: paymentError,
    } = await supabaseAdmin
      .from("payments")
      .insert({
        order_id,

        amount:
          paymentAmount,

        currency:
          finalCurrency,

        payment_method:
          payment_method || null,

        payment_provider:
          payment_provider || null,

        payment_status:
          "pending",

        payment_reference:
          paymentReference,

        base_currency:
          base_currency || "NGN",

        base_amount:
          base_amount ?? order.total,

        exchange_rate:
          exchange_rate ?? null,

        crypto_currency:
          crypto_currency || null,

        crypto_network:
          crypto_network || null,

        crypto_amount:
          crypto_amount ?? null,

        crypto_wallet_address:
          crypto_wallet_address || null,
      })
      .select()
      .single();

    if (paymentError) {
      console.error(
        "Payment creation error:",
        paymentError
      );

      return NextResponse.json(
        {
          error:
            paymentError.message,
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
          "pending",

        payment_reference:
          paymentReference,

        payment_channel:
          payment_method ||
          finalCurrency,

        updated_at:
          new Date().toISOString(),
      })
      .eq("id", order_id);

    if (orderUpdateError) {
      console.error(
        "Order payment summary update error:",
        orderUpdateError
      );
    }

    // =================================================
    // SUCCESS
    // =================================================

    return NextResponse.json(
      {
        success: true,

        message:
          "Payment record created successfully.",

        payment,

        order: {
          id: order.id,
          order_no:
            order.order_no,
          total:
            order.total,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Payment API error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to create payment.",
      },
      { status: 500 }
    );
  }
}
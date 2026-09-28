import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { createClient } from "@supabase/supabase-js";
import {
  NGN_PER_USD,
  ngnToUsd,
} from "@/lib/payment-currency";
import { getAuthUser, requireAdmin, userOwnsOrder } from "@/lib/supabase-admin";

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
      currency,
      payment_method,
      payment_provider,

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
        customer_id,
        customer_email,
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

    const user = await getAuthUser(request);
    const admin = user ? await requireAdmin(request) : null;

    if (!user || (!admin && !userOwnsOrder(user, order))) {
      return NextResponse.json(
        {
          error: "Please sign in with the account that placed this order.",
        },
        { status: 401 }
      );
    }

    if (
      String(order.payment_status || "")
        .toLowerCase() === "paid"
    ) {
      return NextResponse.json(
        {
          error:
            "This order has already been paid.",
        },
        { status: 400 }
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

    const orderTotal = Number(order.total);

    if (
      !Number.isFinite(orderTotal) ||
      orderTotal <= 0
    ) {
      return NextResponse.json(
        {
          error:
            "This order has no amount to pay.",
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

    const timestamp = Date.now();
    const paymentReference = `RTS-PAY-${timestamp}-${randomBytes(8).toString("hex")}`;

    const isCrypto =
      finalCurrency === "CRYPTO";

    const paymentAmount =
      finalCurrency === "USD"
        ? ngnToUsd(orderTotal)
        : orderTotal;

    const baseNgn = orderTotal;

    const usdtAmount = isCrypto
      ? ngnToUsd(baseNgn)
      : null;

    const usdtNetwork =
      process.env.USDT_NETWORK || "TRC20";

    const usdtWallet =
      process.env.USDT_WALLET_ADDRESS?.trim() ||
      null;

    if (
      isCrypto &&
      (
        !Number.isFinite(usdtAmount) ||
        Number(usdtAmount) <= 0
      )
    ) {
      return NextResponse.json(
        {
          error:
            "This order has no amount to convert to USDT.",
        },
        { status: 400 }
      );
    }

    // =================================================
    // CREATE PAYMENT
    // =================================================

    const paymentRow: Record<string, unknown> = {
      order_id,

      amount: isCrypto
        ? usdtAmount
        : paymentAmount,

      currency: isCrypto
        ? "USDT"
        : finalCurrency,

      payment_method: isCrypto
        ? "crypto"
        : payment_method || null,

      payment_provider: isCrypto
        ? "crypto"
        : payment_provider || null,

      payment_status: "pending",

      payment_reference: paymentReference,

      base_currency: "NGN",

      base_amount: baseNgn,

      exchange_rate:
        isCrypto || finalCurrency === "USD"
          ? NGN_PER_USD
          : null,

      crypto_currency: isCrypto
        ? "USDT"
        : crypto_currency || null,

      crypto_network: isCrypto
        ? usdtNetwork
        : crypto_network || null,

      crypto_amount: isCrypto
        ? usdtAmount
        : crypto_amount ?? null,

      crypto_wallet_address: isCrypto
        ? usdtWallet
        : crypto_wallet_address || null,

      provider_metadata: isCrypto
        ? {
            crypto_currency: "USDT",
            crypto_network: usdtNetwork,
            crypto_amount: usdtAmount,
            crypto_wallet_address: usdtWallet,
          }
        : null,

      updated_at: new Date().toISOString(),
    };

    let payment: Record<string, unknown> | null =
      null;
    let paymentError: { message?: string } | null =
      null;

    for (let attempt = 0; attempt < 12; attempt += 1) {
      const inserted = await supabaseAdmin
        .from("payments")
        .insert(paymentRow)
        .select()
        .single();

      if (!inserted.error) {
        payment = inserted.data;
        paymentError = null;
        break;
      }

      const missingColumn = String(
        inserted.error.message || ""
      ).match(
        /Could not find the '([^']+)' column of 'payments'/
      );

      if (
        missingColumn &&
        missingColumn[1] in paymentRow
      ) {
        delete paymentRow[missingColumn[1]];
        continue;
      }

      paymentError = inserted.error;
      break;
    }

    if (paymentError || !payment) {
      console.error(
        "Payment creation error:",
        paymentError
      );

      return NextResponse.json(
        {
          error:
            paymentError?.message ||
            "Unable to create payment record.",
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

        payment_channel: isCrypto
          ? "crypto"
          : payment_method ||
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

        crypto: isCrypto,

        usdtAmount,

        amountNgn: isCrypto
          ? baseNgn
          : null,

        wallet: isCrypto
          ? usdtWallet
          : null,

        network: isCrypto
          ? usdtNetwork
          : null,

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
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* =========================================================
   SUPABASE ADMIN
========================================================= */

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

/* =========================================================
   HELPERS
========================================================= */

function cleanText(value: unknown) {
  return String(
    value ?? ""
  ).trim();
}

function normalize(value: unknown) {
  return cleanText(
    value
  ).toUpperCase();
}

function toNumber(value: unknown) {
  const number =
    Number(value);

  return Number.isFinite(number)
    ? number
    : 0;
}

function getPaystackSecretKey() {
  const secretKey =
    process.env.PAYSTACK_SECRET_KEY;

  if (!secretKey) {
    throw new Error(
      "Missing PAYSTACK_SECRET_KEY"
    );
  }

  return secretKey;
}

/* =========================================================
   PAYSTACK VERIFY
========================================================= */

async function verifyWithPaystack(
  reference: string
) {
  const secretKey =
    getPaystackSecretKey();

  const response =
    await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(
        reference
      )}`,
      {
        method: "GET",

        headers: {
          Authorization:
            `Bearer ${secretKey}`,

          "Content-Type":
            "application/json",
        },

        cache: "no-store",
      }
    );

  let result: any;

  try {
    result =
      await response.json();
  } catch {
    throw new Error(
      "Paystack returned an invalid response."
    );
  }

  if (
    !response.ok ||
    !result?.status ||
    !result?.data
  ) {
    throw new Error(
      result?.message ||
        "Unable to verify payment with Paystack."
    );
  }

  return result;
}

/* =========================================================
   SYNC SUBSCRIPTION

   This is the key repair step.

   It is safe to run multiple times.
========================================================= */

async function syncSubscriptionFromPayment({
  supabaseAdmin,
  payment,
  reference,
  paidAmount,
}: {
  supabaseAdmin: ReturnType<
    typeof getSupabaseAdmin
  >;
  payment: any;
  reference: string;
  paidAmount: number;
}) {
  if (!payment.subscription_id) {
    throw new Error(
      "This payment is not linked to a subscription."
    );
  }

  const {
    data: currentSubscription,
    error: subscriptionLookupError,
  } =
    await supabaseAdmin
      .from("subscriptions")
      .select("*")
      .eq(
        "id",
        payment.subscription_id
      )
      .maybeSingle();

  if (subscriptionLookupError) {
    throw new Error(
      subscriptionLookupError.message
    );
  }

  if (!currentSubscription) {
    throw new Error(
      "Linked subscription was not found."
    );
  }

  const updateData: Record<
    string,
    unknown
  > = {
    status: "ACTIVE",

    payment_status: "PAID",

    payment_reference:
      reference,

    updated_at:
      new Date().toISOString(),
  };

  /*
    If the subscription amount is missing,
    repair it from the verified payment.

    This fixes your current renewal where:
    amount = null
    but payment.amount = 200000
  */

  if (
    currentSubscription.amount === null ||
    currentSubscription.amount ===
      undefined
  ) {
    updateData.amount =
      paidAmount;
  }

  const {
    data: updatedSubscription,
    error: subscriptionUpdateError,
  } =
    await supabaseAdmin
      .from("subscriptions")
      .update(updateData)
      .eq(
        "id",
        payment.subscription_id
      )
      .select()
      .single();

  if (subscriptionUpdateError) {
    throw new Error(
      subscriptionUpdateError.message
    );
  }

  return updatedSubscription;
}

/* =========================================================
   GET
========================================================= */

export async function GET(
  request: NextRequest
) {
  try {
    const reference =
      cleanText(
        request.nextUrl.searchParams.get(
          "reference"
        )
      );

    if (!reference) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Payment reference is required.",
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
        "Subscription payment lookup error:",
        paymentError
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Unable to load payment record.",
          error:
            paymentError.message,
        },
        {
          status: 500,
        }
      );
    }

    if (!payment) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Payment record not found.",
        },
        {
          status: 404,
        }
      );
    }

    if (!payment.subscription_id) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This payment is not linked to a subscription.",
        },
        {
          status: 400,
        }
      );
    }

    /* =====================================================
       VERIFY WITH PAYSTACK

       Even if local payment says PAID, we still verify
       and then sync the subscription.
    ===================================================== */

    const paystackResult =
      await verifyWithPaystack(
        reference
      );

    const transaction =
      paystackResult.data;

    const transactionStatus =
      normalize(
        transaction.status
      );

    if (
      transactionStatus !==
      "SUCCESS"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Paystack has not confirmed this payment as successful.",
          transaction,
        },
        {
          status: 400,
        }
      );
    }

    /* =====================================================
       AMOUNT VALIDATION
    ===================================================== */

    const expectedAmount =
      toNumber(
        payment.amount
      );

    const paystackAmountInSubunit =
      toNumber(
        transaction.amount
      );

    const paystackAmount =
      paystackAmountInSubunit /
      100;

    if (
      expectedAmount > 0 &&
      paystackAmount !==
        expectedAmount
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Payment amount does not match the expected subscription amount.",
          expected_amount:
            expectedAmount,
          received_amount:
            paystackAmount,
        },
        {
          status: 400,
        }
      );
    }

    /* =====================================================
       CURRENCY VALIDATION
    ===================================================== */

    const expectedCurrency =
      normalize(
        payment.currency ||
          "NGN"
      );

    const receivedCurrency =
      normalize(
        transaction.currency
      );

    if (
      expectedCurrency &&
      receivedCurrency &&
      expectedCurrency !==
        receivedCurrency
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Payment currency does not match the expected currency.",
          expected_currency:
            expectedCurrency,
          received_currency:
            receivedCurrency,
        },
        {
          status: 400,
        }
      );
    }

    /* =====================================================
       UPDATE PAYMENT

       This is safe even if already paid.
    ===================================================== */

    const paymentAlreadyPaid =
      normalize(
        payment.payment_status
      ) === "PAID";

    let updatedPayment =
      payment;

    if (!paymentAlreadyPaid) {
      const {
        data: paymentUpdate,
        error:
          paymentUpdateError,
      } =
        await supabaseAdmin
          .from("payments")
          .update({
            payment_status:
              "paid",

            payment_method:
              transaction.channel ||
              payment.payment_method ||
              "paystack",

            payment_provider:
              "paystack",

            provider_transaction_id:
              transaction.id
                ? String(
                    transaction.id
                  )
                : payment.provider_transaction_id,

            provider_metadata:
              transaction,

            paid_at:
              transaction.paid_at ||
              new Date().toISOString(),

            updated_at:
              new Date().toISOString(),
          })
          .eq(
            "id",
            payment.id
          )
          .select()
          .single();

      if (
        paymentUpdateError
      ) {
        console.error(
          "Payment update error:",
          paymentUpdateError
        );

        return NextResponse.json(
          {
            success: false,
            message:
              "Payment was verified, but the local payment record could not be updated.",
            error:
              paymentUpdateError.message,
          },
          {
            status: 500,
          }
        );
      }

      updatedPayment =
        paymentUpdate;
    }

    /* =====================================================
       ALWAYS SYNC SUBSCRIPTION

       THIS FIXES YOUR CURRENT BUG.

       Even if payment was already PAID,
       the subscription gets repaired here.
    ===================================================== */

    let updatedSubscription;

    try {
      updatedSubscription =
        await syncSubscriptionFromPayment({
          supabaseAdmin,

          payment:
            updatedPayment,

          reference,

          paidAmount:
            expectedAmount > 0
              ? expectedAmount
              : paystackAmount,
        });
    } catch (error) {
      console.error(
        "Subscription sync error:",
        error
      );

      return NextResponse.json(
        {
          success: false,

          message:
            "Payment was verified, but the subscription could not be activated.",

          error:
            error instanceof Error
              ? error.message
              : "Unknown subscription sync error.",

          payment:
            updatedPayment,

          transaction,
        },
        {
          status: 500,
        }
      );
    }

    /* =====================================================
       SUCCESS
    ===================================================== */

    return NextResponse.json({
      success: true,

      message:
        paymentAlreadyPaid
          ? "Payment already verified. Subscription synchronized successfully."
          : "Subscription payment verified successfully.",

      payment:
        updatedPayment,

      transaction,

      subscription:
        updatedSubscription,
    });
  } catch (error) {
    console.error(
      "Subscription Paystack verification error:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error instanceof Error
            ? error.message
            : "Unable to verify subscription payment.",
      },
      {
        status: 500,
      }
    );
  }
}
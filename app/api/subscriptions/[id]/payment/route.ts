import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

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

function getBearerToken(request: Request) {
  const authorization =
    request.headers.get("authorization");

  if (
    !authorization ||
    !authorization
      .toLowerCase()
      .startsWith("bearer ")
  ) {
    return null;
  }

  return authorization.slice(7).trim();
}

function createPaymentReference() {
  return `RTS-SUB-${Date.now()}-${Math.floor(
    Math.random() * 10000
  )}`;
}

export async function POST(
  request: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Subscription ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    const accessToken =
      getBearerToken(request);

    if (!accessToken) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please log in before making payment.",
        },
        {
          status: 401,
        }
      );
    }

    const supabaseAdmin =
      getSupabaseAdmin();

    /* =========================================
       AUTHENTICATE CUSTOMER
    ========================================== */

    const {
      data: userData,
      error: userError,
    } =
      await supabaseAdmin.auth.getUser(
        accessToken
      );

    if (
      userError ||
      !userData.user
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Your session is invalid or has expired.",
        },
        {
          status: 401,
        }
      );
    }

    const user = userData.user;

    /* =========================================
       LOAD SUBSCRIPTION
    ========================================== */

    const {
      data: subscription,
      error:
        subscriptionError,
    } =
      await supabaseAdmin
        .from("subscriptions")
        .select("*")
        .eq("id", id)
        .eq(
          "customer_id",
          user.id
        )
        .maybeSingle();

    if (subscriptionError) {
      console.error(
        "Subscription lookup error:",
        subscriptionError
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Unable to load subscription.",
          error:
            subscriptionError.message,
        },
        {
          status: 500,
        }
      );
    }

    if (!subscription) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Subscription not found.",
        },
        {
          status: 404,
        }
      );
    }

    /* =========================================
       VALIDATE SUBSCRIPTION
    ========================================== */

    const subscriptionStatus =
      String(
        subscription.status || ""
      ).toUpperCase();

    const subscriptionPaymentStatus =
      String(
        subscription.payment_status || ""
      ).toUpperCase();

    if (
      subscriptionPaymentStatus ===
      "PAID"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This subscription has already been paid.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      subscriptionStatus !==
      "APPROVED"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This subscription is not yet approved for payment.",
        },
        {
          status: 400,
        }
      );
    }

    const amount =
      Number(
        subscription.amount
      );

    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "A valid subscription amount has not been set.",
        },
        {
          status: 400,
        }
      );
    }

    const currency =
      String(
        subscription.currency ||
          "NGN"
      ).toUpperCase();

    if (
      !["NGN", "USD"].includes(
        currency
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This subscription currency is not supported by Paystack.",
        },
        {
          status: 400,
        }
      );
    }

    const email =
      subscription.customer_email ||
      user.email;

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Customer email is required for payment.",
        },
        {
          status: 400,
        }
      );
    }

    /* =========================================
       CHECK FOR EXISTING UNPAID PAYMENT
    ========================================== */

    const {
      data:
        existingPayment,
      error:
        existingPaymentError,
    } =
      await supabaseAdmin
        .from("payments")
        .select("*")
        .eq(
          "subscription_id",
          subscription.id
        )
        .in(
          "payment_status",
          [
            "pending",
            "processing",
          ]
        )
        .order(
          "updated_at",
          {
            ascending: false,
          }
        )
        .limit(1)
        .maybeSingle();

    if (
      existingPaymentError
    ) {
      console.error(
        "Existing subscription payment lookup error:",
        existingPaymentError
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Unable to check existing payment.",
          error:
            existingPaymentError.message,
        },
        {
          status: 500,
        }
      );
    }

    let payment =
      existingPayment;

    /* =========================================
       CREATE PAYMENT IF NEEDED
    ========================================== */

    if (!payment) {
      const reference =
        createPaymentReference();

      const {
        data:
          newPayment,
        error:
          paymentInsertError,
      } =
        await supabaseAdmin
          .from("payments")
          .insert({
            order_id: null,

            subscription_id:
              subscription.id,

            amount,

            currency,

            payment_method:
              "paystack",

            payment_provider:
              "paystack",

            payment_status:
              "pending",

            payment_reference:
              reference,

            base_currency:
              currency,

            base_amount:
              amount,

            exchange_rate:
              1,

            provider_metadata:
              null,

            paid_at:
              null,

            updated_at:
              new Date().toISOString(),
          })
          .select()
          .single();

      if (
        paymentInsertError
      ) {
        console.error(
          "Subscription payment insert error:",
          paymentInsertError
        );

        return NextResponse.json(
          {
            success: false,
            message:
              "Unable to create payment record.",
            error:
              paymentInsertError.message,
          },
          {
            status: 500,
          }
        );
      }

      payment =
        newPayment;
    }

    /* =========================================
       PAYSTACK CONFIG
    ========================================== */

    const paystackSecret =
      process.env.PAYSTACK_SECRET_KEY;

    if (!paystackSecret) {
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

    const origin =
      new URL(
        request.url
      ).origin;

    const callbackUrl =
      `${origin}/client-portal/subscription-pay/callback`;

    /* =========================================
       INITIALIZE PAYSTACK
    ========================================== */

    const paystackResponse =
      await fetch(
        "https://api.paystack.co/transaction/initialize",
        {
          method: "POST",

          headers: {
            Authorization:
              `Bearer ${paystackSecret}`,

            "Content-Type":
              "application/json",
          },

          body:
            JSON.stringify({
              email,

              amount:
                Math.round(
                  amount * 100
                ),

              currency,

              reference:
                payment.payment_reference,

              callback_url:
                callbackUrl,

              metadata: {
                payment_id:
                  payment.id,

                subscription_id:
                  subscription.id,

                customer_id:
                  user.id,

                customer_code:
                  subscription.customer_code ||
                  null,

                customer_name:
                  subscription.customer_name ||
                  null,

                plan_slug:
                  subscription.plan_slug ||
                  null,

                plan_name:
                  subscription.plan_name ||
                  null,

                payment_type:
                  "subscription",
              },
            }),
        }
      );

    const paystackData =
      await paystackResponse.json();

    if (
      !paystackResponse.ok ||
      !paystackData.status ||
      !paystackData.data
    ) {
      console.error(
        "Paystack initialization error:",
        paystackData
      );

      return NextResponse.json(
        {
          success: false,
          message:
            paystackData.message ||
            "Unable to initialize Paystack payment.",
        },
        {
          status: 500,
        }
      );
    }

    /* =========================================
       UPDATE PAYMENT AS PROCESSING
    ========================================== */

    const {
      error:
        paymentUpdateError,
    } =
      await supabaseAdmin
        .from("payments")
        .update({
          payment_status:
            "processing",

          provider_metadata:
            paystackData.data,

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
        "Payment processing update error:",
        paymentUpdateError
      );
    }

    /* =========================================
       UPDATE SUBSCRIPTION REFERENCE
    ========================================== */

    const {
      error:
        subscriptionUpdateError,
    } =
      await supabaseAdmin
        .from("subscriptions")
        .update({
          payment_status:
            "PENDING",

          payment_reference:
            payment.payment_reference,

          updated_at:
            new Date().toISOString(),
        })
        .eq(
          "id",
          subscription.id
        );

    if (
      subscriptionUpdateError
    ) {
      console.error(
        "Subscription payment reference update error:",
        subscriptionUpdateError
      );
    }

    /* =========================================
       SUCCESS RESPONSE
    ========================================== */

    return NextResponse.json(
      {
        success: true,

        message:
          "Payment initialized successfully.",

        payment: {
          id:
            payment.id,

          reference:
            payment.payment_reference,

          amount,

          currency,
        },

        authorization_url:
          paystackData.data
            .authorization_url,

        access_code:
          paystackData.data
            .access_code,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "Subscription payment API error:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error instanceof Error
            ? error.message
            : "Something went wrong while starting payment.",
      },
      {
        status: 500,
      }
    );
  }
}
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;

if (!supabaseUrl) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL is missing");
}

if (!serviceRoleKey) {
  throw new Error("SUPABASE_SERVICE_ROLE_KEY is missing");
}

if (!paystackSecretKey) {
  throw new Error("PAYSTACK_SECRET_KEY is missing");
}

const supabaseAdmin = createClient(
  supabaseUrl,
  serviceRoleKey
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { payment_id } = body;

    if (!payment_id) {
      return NextResponse.json(
        {
          success: false,
          error: "Payment ID is required.",
        },
        { status: 400 }
      );
    }

    const {
      data: payment,
      error: paymentError,
    } = await supabaseAdmin
      .from("payments")
      .select("*")
      .eq("id", payment_id)
      .maybeSingle();

    if (paymentError) {
      return NextResponse.json(
        {
          success: false,
          error: paymentError.message,
        },
        { status: 500 }
      );
    }

    if (!payment) {
      return NextResponse.json(
        {
          success: false,
          error: "Payment record not found.",
        },
        { status: 404 }
      );
    }

    if (payment.payment_status === "paid") {
      return NextResponse.json(
        {
          success: false,
          error: "This payment has already been completed.",
        },
        { status: 400 }
      );
    }

    if (!["NGN", "USD"].includes(payment.currency)) {
      return NextResponse.json(
        {
          success: false,
          error: "Paystack can only process NGN or USD.",
        },
        { status: 400 }
      );
    }

    const {
      data: order,
      error: orderError,
    } = await supabaseAdmin
      .from("orders")
      .select(`
        id,
        order_no,
        order_number,
        customer_name,
        customer_email,
        consultation_id,
        quotation_status
      `)
      .eq("id", payment.order_id)
      .maybeSingle();

    if (orderError) {
      return NextResponse.json(
        {
          success: false,
          error: orderError.message,
        },
        { status: 500 }
      );
    }

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          error: "Order not found.",
        },
        { status: 404 }
      );
    }

    if (order.quotation_status !== "ACCEPTED") {
      return NextResponse.json(
        {
          success: false,
          error:
            "Quotation must be accepted before payment.",
        },
        { status: 400 }
      );
    }

    let customerEmail = order.customer_email;

    if (!customerEmail && order.consultation_id) {
      const {
        data: consultation,
      } = await supabaseAdmin
        .from("consultations")
        .select("email")
        .eq("id", order.consultation_id)
        .maybeSingle();

      customerEmail = consultation?.email ?? null;
    }

    if (!customerEmail) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Customer email is required before Paystack payment can be initialized.",
        },
        { status: 400 }
      );
    }

    const amount = Number(payment.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid payment amount.",
        },
        { status: 400 }
      );
    }

    const amountInSubunit =
      Math.round(amount * 100);

    const origin =
      new URL(request.url).origin;

    const callbackUrl =
      `${origin}/client-portal/payment/callback`;

    const paystackResponse = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${paystackSecretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: customerEmail,
          amount: amountInSubunit.toString(),
          currency: payment.currency,
          reference: payment.payment_reference,
          callback_url: callbackUrl,
          metadata: {
            payment_id: payment.id,
            order_id: order.id,
            order_number:
              order.order_number ||
              order.order_no,
            customer_name:
              order.customer_name,
            source: "rhennie_tasty_shack",
          },
        }),
      }
    );

    const paystackData =
      await paystackResponse.json();

    if (
      !paystackResponse.ok ||
      !paystackData.status
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            paystackData.message ||
            "Unable to initialize Paystack payment.",
        },
        {
          status: paystackResponse.status || 500,
        }
      );
    }

    await supabaseAdmin
      .from("payments")
      .update({
        payment_provider: "PAYSTACK",
        payment_method: "PAYSTACK_CHECKOUT",
        payment_status: "processing",
        provider_metadata: {
          paystack_access_code:
            paystackData.data?.access_code,
          authorization_url:
            paystackData.data?.authorization_url,
          initialized_at:
            new Date().toISOString(),
        },
        updated_at:
          new Date().toISOString(),
      })
      .eq("id", payment.id);

    await supabaseAdmin
      .from("orders")
      .update({
        payment_status: "processing",
        payment_reference:
          payment.payment_reference,
        payment_channel: "PAYSTACK",
        updated_at:
          new Date().toISOString(),
      })
      .eq("id", order.id);

    return NextResponse.json({
      success: true,
      authorization_url:
        paystackData.data.authorization_url,
      access_code:
        paystackData.data.access_code,
      reference:
        paystackData.data.reference,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to initialize payment.",
      },
      { status: 500 }
    );
  }
}
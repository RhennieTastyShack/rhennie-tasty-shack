import { NextResponse } from "next/server";
import { getPaystackSecretKey } from "@/lib/env";
import {
  getAuthUser,
  getSupabaseAdmin,
  requireAdmin,
  userOwnsOrder,
} from "@/lib/supabase-admin";

export async function POST(request: Request) {
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
        customer_id,
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

    const user = await getAuthUser(request);
    const admin = user ? await requireAdmin(request) : null;

    if (!user || (!admin && !userOwnsOrder(user, order))) {
      return NextResponse.json(
        {
          success: false,
          error: "Please sign in with the account that placed this order.",
        },
        { status: 401 }
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

    let paystackResponse = await fetch(
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
          ...(String(payment.currency || "NGN").toUpperCase() === "NGN"
            ? { channels: ["card", "bank_transfer"] }
            : {}),
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

    let paystackData =
      await paystackResponse.json();

    if (
      (!paystackResponse.ok || !paystackData.status) &&
      String(payment.currency || "NGN").toUpperCase() === "NGN" &&
      /channel/i.test(String(paystackData?.message || ""))
    ) {
      const retry = await fetch(
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
              order_number: order.order_number || order.order_no,
              customer_name: order.customer_name,
              source: "rhennie_tasty_shack",
            },
          }),
        }
      );
      paystackResponse = retry;
      paystackData = await retry.json();
    }

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
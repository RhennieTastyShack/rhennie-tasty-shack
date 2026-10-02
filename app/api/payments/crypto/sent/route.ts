import { NextResponse } from "next/server";
import { lazySupabaseAdmin as supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const reference =
      typeof body.reference === "string"
        ? body.reference.trim()
        : "";
    const orderId =
      typeof body.order_id === "string"
        ? body.order_id.trim()
        : "";

    if (!reference || !orderId) {
      return NextResponse.json(
        { error: "Payment reference is required." },
        { status: 400 }
      );
    }

    const { data: payment, error: paymentError } =
      await supabaseAdmin
        .from("payments")
        .select(
          "id, order_id, currency, payment_method, payment_status, payment_reference"
        )
        .eq("payment_reference", reference)
        .eq("order_id", orderId)
        .maybeSingle();

    if (paymentError) {
      return NextResponse.json(
        { error: paymentError.message },
        { status: 500 }
      );
    }

    if (!payment) {
      return NextResponse.json(
        { error: "Payment was not found." },
        { status: 404 }
      );
    }

    const currency = String(payment.currency || "").toUpperCase();
    const method = String(payment.payment_method || "").toLowerCase();
    const isUsdt =
      currency === "USDT" ||
      currency === "CRYPTO" ||
      method === "crypto";

    if (!isUsdt) {
      return NextResponse.json(
        { error: "This payment is not a USDT transfer." },
        { status: 400 }
      );
    }

    const current = String(payment.payment_status || "").toLowerCase();

    if (current === "paid") {
      return NextResponse.json({
        success: true,
        status: "paid",
      });
    }

    if (current !== "submitted") {
      const paymentUpdate: Record<string, unknown> = {
        payment_status: "submitted",
        updated_at: new Date().toISOString(),
      };

      let updateError: { message?: string } | null = null;

      for (let attempt = 0; attempt < 4; attempt += 1) {
        const updated = await supabaseAdmin
          .from("payments")
          .update(paymentUpdate)
          .eq("id", payment.id);

        if (!updated.error) {
          updateError = null;
          break;
        }

        const missingColumn = String(
          updated.error.message || ""
        ).match(
          /Could not find the '([^']+)' column of 'payments'/
        );

        if (
          missingColumn &&
          missingColumn[1] in paymentUpdate
        ) {
          delete paymentUpdate[missingColumn[1]];
          continue;
        }

        updateError = updated.error;
        break;
      }

      if (updateError) {
        return NextResponse.json(
          { error: updateError.message },
          { status: 500 }
        );
      }
    }

    if (payment.order_id) {
      const { data: order } = await supabaseAdmin
        .from("orders")
        .select("payment_status")
        .eq("id", payment.order_id)
        .maybeSingle();

      if (
        String(order?.payment_status || "").toLowerCase() !==
        "paid"
      ) {
        await supabaseAdmin
          .from("orders")
          .update({
            payment_status: "submitted",
            payment_channel: "crypto",
            payment_reference: payment.payment_reference,
            updated_at: new Date().toISOString(),
          })
          .eq("id", payment.order_id);
      }
    }

    return NextResponse.json({
      success: true,
      status: "submitted",
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to record the USDT transfer.",
      },
      { status: 500 }
    );
  }
}

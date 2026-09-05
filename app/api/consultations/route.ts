import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
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
// CREATE EVENT CONCIERGE REQUEST
// =====================================================

export async function POST(request: Request) {
  let consultationId: string | null = null;

  try {
    // =================================================
    // READ REQUEST BODY
    // =================================================

    const body = await request.json();

    const {
      customer_id,
      full_name,
      email,
      phone,
      event_type,
      event_date,
      event_time,
      guest_count,
      venue,
      budget,
      special_request,
    } = body;

    // =================================================
    // VALIDATION
    // =================================================

    if (!full_name?.trim()) {
      return NextResponse.json(
        {
          error: "Full name is required.",
        },
        { status: 400 }
      );
    }

    if (!email?.trim()) {
      return NextResponse.json(
        {
          error: "Email address is required.",
        },
        { status: 400 }
      );
    }

    if (!phone?.trim()) {
      return NextResponse.json(
        {
          error: "Phone number is required.",
        },
        { status: 400 }
      );
    }

    if (!event_type?.trim()) {
      return NextResponse.json(
        {
          error: "Event type is required.",
        },
        { status: 400 }
      );
    }

    if (!event_date) {
      return NextResponse.json(
        {
          error: "Event date is required.",
        },
        { status: 400 }
      );
    }

    if (!venue?.trim()) {
      return NextResponse.json(
        {
          error: "Event venue is required.",
        },
        { status: 400 }
      );
    }

    const guestCount = Number(guest_count);

    if (
      !Number.isFinite(guestCount) ||
      guestCount < 1
    ) {
      return NextResponse.json(
        {
          error:
            "Please enter a valid number of guests.",
        },
        { status: 400 }
      );
    }

    // =================================================
    // CREATE CONSULTATION
    // =================================================

    const { data: consultation, error: consultationError } =
      await supabaseAdmin
        .from("consultations")
        .insert({
          customer_id:
            customer_id || null,

          full_name:
            full_name.trim(),

          email:
            email.trim(),

          phone:
            phone.trim(),

          event_type:
            event_type.trim(),

          event_date,

          event_time:
            event_time || null,

          guest_count:
            guestCount,

          venue:
            venue.trim(),

          budget:
            budget?.trim() || null,

          special_request:
            special_request?.trim() || null,
        })
        .select()
        .single();

    if (consultationError) {
      console.error(
        "Consultation creation error:",
        consultationError
      );

      return NextResponse.json(
        {
          error:
            consultationError.message,
        },
        { status: 500 }
      );
    }

    consultationId = consultation.id;

    // =================================================
    // GENERATE ORDER NUMBER
    // =================================================

    const year = new Date()
      .getFullYear();

    const randomPart =
      Math.floor(
        1000 +
          Math.random() * 9000
      );

    const orderNo =
      `RTS-${year}-${randomPart}`;

    // =================================================
    // CREATE ORDER
    // =================================================
    //
    // Event Concierge requests do not have
    // a confirmed price yet.
    //
    // Therefore:
    //
    // amount       = 0
    // subtotal     = 0
    // delivery_fee = 0
    // total        = 0
    //
    // Admin will later enter the real quotation.
    // =================================================

    const { data: order, error: orderError } =
      await supabaseAdmin
        .from("orders")
        .insert({
          order_no:
            orderNo,

          customer_id:
            customer_id || null,

          title:
            `${event_type.trim()} Catering`,

          order_date:
            event_date,

          amount:
            0,

          status:
            "pending",

          consultation_id:
            consultation.id,

          order_number:
            orderNo,

          customer_name:
            full_name.trim(),

          customer_email:
            email.trim(),

          customer_phone:
            phone.trim(),

          delivery_type:
            "event",

          delivery_address:
            venue.trim(),

          notes:
            special_request?.trim() ||
            null,

          subtotal:
            0,

          delivery_fee:
            0,

          total:
            0,

          payment_status:
            "pending",

          payment_reference:
            null,

          payment_channel:
            null,

          order_status:
            "pending",

          updated_at:
            new Date().toISOString(),
        })
        .select()
        .single();

    // =================================================
    // IF ORDER CREATION FAILS
    // =================================================

    if (orderError) {
      console.error(
        "Order creation error:",
        orderError
      );

      // Remove consultation that was just created
      // so we do not leave an orphan consultation.
      if (consultationId) {
        await supabaseAdmin
          .from("consultations")
          .delete()
          .eq("id", consultationId);
      }

      return NextResponse.json(
        {
          error:
            orderError.message,
        },
        { status: 500 }
      );
    }

    // =================================================
    // SUCCESS
    // =================================================

    return NextResponse.json(
      {
        success: true,

        message:
          "Event Concierge request submitted successfully.",

        consultation,

        order,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Consultation API error:",
      error
    );

    // =================================================
    // CLEANUP IF SOMETHING UNEXPECTED HAPPENS
    // =================================================

    if (consultationId) {
      try {
        await supabaseAdmin
          .from("consultations")
          .delete()
          .eq("id", consultationId);
      } catch (cleanupError) {
        console.error(
          "Consultation cleanup error:",
          cleanupError
        );
      }
    }

    return NextResponse.json(
      {
        error:
          "Unable to submit event request.",
      },
      { status: 500 }
    );
  }
}
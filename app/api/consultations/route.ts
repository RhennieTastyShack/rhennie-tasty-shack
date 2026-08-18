import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL is missing");
}

if (!serviceRoleKey) {
  throw new Error("SUPABASE_SERVICE_ROLE_KEY is missing");
}

const supabaseAdmin = createClient(
  supabaseUrl,
  serviceRoleKey
);

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
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

    // -----------------------------
    // VALIDATION
    // -----------------------------

    if (
      !full_name ||
      !email ||
      !phone ||
      !event_type ||
      !event_date ||
      !guest_count ||
      !venue
    ) {
      return NextResponse.json(
        {
          error:
            "Please fill in all required fields.",
        },
        { status: 400 }
      );
    }

    // -----------------------------
    // SAVE CONSULTATION
    // -----------------------------

    const { data: consultation, error: consultationError } =
      await supabaseAdmin
        .from("consultations")
        .insert({
          full_name,
          email,
          phone,
          event_type,
          event_date,
          event_time: event_time || null,
          guest_count: Number(guest_count),
          venue,
          budget: budget || null,
          special_request: special_request || null,
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
          error: consultationError.message,
        },
        { status: 500 }
      );
    }

    // -----------------------------
    // CREATE ORDER NUMBER
    // -----------------------------

    const year = new Date().getFullYear();

    const randomNumber = Math.floor(
      1000 + Math.random() * 9000
    );

    const orderNo = `RTS-${year}-${randomNumber}`;

    // -----------------------------
    // CONVERT BUDGET
    // -----------------------------

    let amount: number | null = null;

    if (budget) {
      const cleanedBudget = String(budget)
        .replace(/₦/g, "")
        .replace(/,/g, "")
        .replace(/[^\d.]/g, "");

      const parsedBudget = Number(cleanedBudget);

      if (!Number.isNaN(parsedBudget)) {
        amount = parsedBudget;
      }
    }

    // -----------------------------
    // CREATE ORDER
    // -----------------------------

    const { data: order, error: orderError } =
      await supabaseAdmin
        .from("orders")
        .insert({
          order_no: orderNo,
          customer_id: null,
          consultation_id: consultation.id,
          title: `${event_type} Catering`,
          order_date: event_date,
          amount,
          status: "IN REVIEW",
        })
        .select()
        .single();

    if (orderError) {
      console.error(
        "Order creation error:",
        orderError
      );

      return NextResponse.json(
        {
          error: orderError.message,
        },
        { status: 500 }
      );
    }

    // -----------------------------
    // SUCCESS
    // -----------------------------

    return NextResponse.json(
      {
        success: true,
        message:
          "Your event request has been submitted successfully.",
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

    return NextResponse.json(
      {
        error:
          "Unable to submit your event request.",
      },
      { status: 500 }
    );
  }
}
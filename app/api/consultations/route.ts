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

    const year = new Date().getFullYear();
    const randomPart = Math.floor(1000 + Math.random() * 9000);
    const consultationPayload: Record<string, unknown> = {
      customer_id: customer_id || null,
      consultation_no: `RTS-${year}-${randomPart}`,
      full_name: full_name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      event_type: event_type.trim(),
      event_date,
      event_time: event_time || null,
      guest_count: guestCount,
      venue: venue.trim(),
      budget: budget?.trim() || null,
      special_request: special_request?.trim() || null,
    };

    let consultation: Record<string, unknown> | null = null;
    let consultationError: { message: string } | null = null;

    for (let attempt = 0; attempt < 12; attempt += 1) {
      const inserted = await supabaseAdmin
        .from("consultations")
        .insert(consultationPayload)
        .select()
        .single();

      if (!inserted.error) {
        consultation = inserted.data;
        consultationError = null;
        break;
      }

      consultationError = inserted.error;
      const missing = inserted.error.message.match(
        /Could not find the '([^']+)' column/i
      )?.[1];

      if (!missing || !(missing in consultationPayload)) {
        break;
      }

      delete consultationPayload[missing];
    }

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

    if (!consultation?.id) {
      return NextResponse.json(
        { error: "Unable to submit event request." },
        { status: 500 }
      );
    }

    consultationId = String(consultation.id);

    // =================================================
    // GENERATE ORDER NUMBER
    // =================================================

    const orderNo = String(
      consultation.consultation_no || `RTS-${year}-${randomPart}`
    );

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

    const orderPayload: Record<string, unknown> = {
      order_no: orderNo,
      customer_id: customer_id || null,
      title: `${event_type.trim()} Catering`,
      order_date: event_date,
      amount: 0,
      status: "pending",
      consultation_id: consultationId,
      order_number: orderNo,
      customer_name: full_name.trim(),
      customer_email: email.trim(),
      customer_phone: phone.trim(),
      delivery_type: "event",
      delivery_address: venue.trim(),
      notes: special_request?.trim() || null,
      subtotal: 0,
      delivery_fee: 0,
      total: 0,
      payment_status: "pending",
      payment_reference: null,
      payment_channel: null,
      order_status: "pending",
      updated_at: new Date().toISOString(),
    };

    let order: Record<string, unknown> | null = null;
    let orderError: { message: string } | null = null;

    for (let attempt = 0; attempt < 16; attempt += 1) {
      const inserted = await supabaseAdmin
        .from("orders")
        .insert(orderPayload)
        .select()
        .single();

      if (!inserted.error) {
        order = inserted.data;
        orderError = null;
        break;
      }

      orderError = inserted.error;
      const missing = inserted.error.message.match(
        /Could not find the '([^']+)' column/i
      )?.[1];

      if (!missing || !(missing in orderPayload)) {
        break;
      }

      delete orderPayload[missing];
    }

    // =================================================
    // IF ORDER CREATION FAILS
    // =================================================

    if (orderError) {
      console.error(
        "Order creation error:",
        orderError
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

async function requireAdmin(request: Request) {
  const authorization = request.headers.get("authorization");

  if (!authorization?.toLowerCase().startsWith("bearer ")) {
    return null;
  }

  const accessToken = authorization.slice(7).trim();

  if (!accessToken) {
    return null;
  }

  const { data: userData, error: userError } =
    await supabaseAdmin.auth.getUser(accessToken);

  if (userError || !userData.user) {
    return null;
  }

  const { data: adminRow } = await supabaseAdmin
    .from("admin_users")
    .select("user_id")
    .eq("user_id", userData.user.id)
    .maybeSingle();

  return adminRow ? userData.user : null;
}

export async function GET(request: Request) {
  const admin = await requireAdmin(request);

  if (!admin) {
    return NextResponse.json(
      { error: "Unauthorized." },
      { status: 401 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("consultations")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  const ids = (data || []).map((row) => row.id).filter(Boolean);
  const ordersByConsultation = new Map<string, Record<string, unknown>>();

  if (ids.length) {
    const { data: orders } = await supabaseAdmin
      .from("orders")
      .select("consultation_id, quotation_status, status, order_status")
      .in("consultation_id", ids);

    for (const order of orders || []) {
      if (order.consultation_id) {
        ordersByConsultation.set(String(order.consultation_id), order);
      }
    }
  }

  return NextResponse.json({
    requests: (data || []).map((row) => {
      const order = ordersByConsultation.get(String(row.id));
      const quotation = String(order?.quotation_status || "").toUpperCase();
      const orderStatus = String(
        order?.status || order?.order_status || ""
      ).toUpperCase();
      let status = String(row.status || "new").trim().toLowerCase();

      if (orderStatus === "COMPLETED") {
        status = "completed";
      } else if (quotation === "ACCEPTED" || orderStatus === "CONFIRMED") {
        status = "confirmed";
      } else if (quotation === "DECLINED" || orderStatus === "CANCELLED") {
        status = "cancelled";
      } else if (quotation === "QUOTED" || quotation === "NEGOTIATING") {
        status = "quoted";
      }

      return {
        id: row.id,
        created_at: row.created_at,
        name: row.full_name || row.name,
        email: row.email,
        phone: row.phone,
        event_type: row.event_type,
        event_date: row.event_date,
        guest_count: row.guest_count,
        location: row.venue || row.location,
        budget: row.budget,
        message: row.special_request || row.message,
        status,
      };
    }),
  });
}

export async function PATCH(request: Request) {
  const admin = await requireAdmin(request);

  if (!admin) {
    return NextResponse.json(
      { error: "Unauthorized." },
      { status: 401 }
    );
  }

  const body = await request.json();
  const id = String(body.id || "").trim();
  const status = String(body.status || "").trim().toLowerCase();
  const allowed = [
    "new",
    "contacted",
    "quoted",
    "confirmed",
    "completed",
    "cancelled",
  ];

  if (!id || !allowed.includes(status)) {
    return NextResponse.json(
      { error: "Choose a valid request status." },
      { status: 400 }
    );
  }

  const consultationUpdate: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
  };

  for (let attempt = 0; attempt < 4; attempt += 1) {
    const { error } = await supabaseAdmin
      .from("consultations")
      .update(consultationUpdate)
      .eq("id", id);

    if (!error) {
      break;
    }

    const missing = error.message.match(
      /Could not find the '([^']+)' column/i
    )?.[1];

    if (!missing || !(missing in consultationUpdate)) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    delete consultationUpdate[missing];

    if (Object.keys(consultationUpdate).length === 0) {
      break;
    }
  }

  const orderUpdate: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (status === "quoted") {
    orderUpdate.quotation_status = "QUOTED";
  }

  if (status === "confirmed") {
    orderUpdate.quotation_status = "ACCEPTED";
    orderUpdate.status = "CONFIRMED";
    orderUpdate.order_status = "CONFIRMED";
  }

  if (status === "cancelled") {
    orderUpdate.quotation_status = "DECLINED";
  }

  if (orderUpdate.quotation_status) {
    for (let attempt = 0; attempt < 4; attempt += 1) {
      const { error } = await supabaseAdmin
        .from("orders")
        .update(orderUpdate)
        .eq("consultation_id", id);

      if (!error) {
        break;
      }

      const missing = error.message.match(
        /Could not find the '([^']+)' column/i
      )?.[1];

      if (!missing || !(missing in orderUpdate)) {
        break;
      }

      delete orderUpdate[missing];
    }
  }

  return NextResponse.json({ success: true });
}
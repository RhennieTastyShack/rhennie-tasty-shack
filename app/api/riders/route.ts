import { NextRequest, NextResponse } from "next/server";
import {
  cleanText,
  getAuthUser,
  getSupabaseAdmin,
  requireAdmin,
} from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    const supabaseAdmin = getSupabaseAdmin();
    const { searchParams } = new URL(request.url);
    const scope = searchParams.get("scope") || "me";

    async function withIdLinks<
      T extends {
        id_document_path?: string | null;
        photo_path?: string | null;
      },
    >(rows: T[]) {
      return Promise.all(
        rows.map(async (row) => {
          let id_document_url: string | null = null;
          let photo_url: string | null = null;

          if (row.id_document_path) {
            const { data } = await supabaseAdmin.storage
              .from("rider-documents")
              .createSignedUrl(row.id_document_path, 60 * 60);
            id_document_url = data?.signedUrl || null;
          }

          if (row.photo_path) {
            const { data } = await supabaseAdmin.storage
              .from("rider-documents")
              .createSignedUrl(row.photo_path, 60 * 60);
            photo_url = data?.signedUrl || null;
          }

          return {
            ...row,
            id_document_url,
            photo_url,
          };
        })
      );
    }

    if (scope === "available" || scope === "all") {
      const admin = await requireAdmin(request);

      if (!admin) {
        return NextResponse.json(
          { success: false, message: "Only the kitchen can view riders." },
          { status: 401 }
        );
      }
    }

    if (scope === "available") {
      const { data, error } = await supabaseAdmin
        .from("riders")
        .select(
          "id, full_name, phone, vehicle_type, is_available, status"
        )
        .eq("status", "APPROVED")
        .eq("is_available", true)
        .order("full_name", { ascending: true });

      if (error) {
        return NextResponse.json(
          { success: false, message: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        riders: data || [],
      });
    }

    if (scope === "all") {
      const { data, error } = await supabaseAdmin
        .from("riders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        return NextResponse.json(
          { success: false, message: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        riders: await withIdLinks(data || []),
      });
    }

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Please sign in." },
        { status: 401 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("riders")
      .select("*")
      .eq("auth_user_id", user.id)
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    const [rider] = data ? await withIdLinks([data]) : [null];

    return NextResponse.json({
      success: true,
      rider: rider || null,
    });
  } catch (error) {
    console.error("Riders GET error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to load riders.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Please sign in to join as a rider." },
        { status: 401 }
      );
    }

    const body = await request.json();

    if (body?.platform_fee_accepted !== true) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Accept the rider terms, including the 15% platform fee, before submitting your application.",
        },
        { status: 400 }
      );
    }

    const fullName = cleanText(body?.full_name);
    const phone = cleanText(body?.phone);
    const vehicleType = cleanText(body?.vehicle_type) || "bike";
    const email = cleanText(body?.email || user.email).toLowerCase();
    const address = cleanText(body?.address);
    const city = cleanText(body?.city);
    const idType = cleanText(body?.id_type).toUpperCase();
    const idNumber = cleanText(body?.id_number);
    const idDocumentPath = cleanText(body?.id_document_path);
    const photoPath = cleanText(body?.photo_path);
    const plateNumber = cleanText(body?.plate_number).toUpperCase();
    const vehicleColor = cleanText(body?.vehicle_color);
    const vehicleModel = cleanText(body?.vehicle_model);

    const allowedIds = new Set([
      "NIN",
      "DRIVERS_LICENSE",
      "VOTERS_CARD",
      "PASSPORT",
    ]);

    if (!fullName) {
      return NextResponse.json(
        { success: false, message: "Full name is required." },
        { status: 400 }
      );
    }

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { success: false, message: "A valid email is required." },
        { status: 400 }
      );
    }

    if (!phone || phone.replace(/\D/g, "").length < 10) {
      return NextResponse.json(
        { success: false, message: "A valid phone number is required." },
        { status: 400 }
      );
    }

    if (address.length < 8 || !city) {
      return NextResponse.json(
        { success: false, message: "Home address and city are required." },
        { status: 400 }
      );
    }

    if (!allowedIds.has(idType) || idNumber.length < 5 || !idDocumentPath) {
      return NextResponse.json(
        {
          success: false,
          message: "Upload a valid identity card and enter the ID number.",
        },
        { status: 400 }
      );
    }

    if (!idDocumentPath.startsWith(`${user.id}/`)) {
      return NextResponse.json(
        { success: false, message: "Identity upload does not match this account." },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();

    const { data: existing } = await supabaseAdmin
      .from("riders")
      .select("id, status")
      .eq("auth_user_id", user.id)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          message: "You already have a rider profile.",
          rider: existing,
        },
        { status: 409 }
      );
    }

    const payload: Record<string, unknown> = {
      auth_user_id: user.id,
      full_name: fullName,
      phone,
      email,
      address,
      city,
      id_type: idType,
      id_number: idNumber,
      id_document_path: idDocumentPath,
      photo_path: photoPath || null,
      plate_number: plateNumber || null,
      vehicle_color: vehicleColor || null,
      vehicle_model: vehicleModel || null,
      vehicle_type: vehicleType,
      platform_fee_accepted: body?.platform_fee_accepted === true,
      platform_fee_percent: 15,
      status: "PENDING",
      is_available: false,
      updated_at: new Date().toISOString(),
    };

    let data: unknown = null;
    let error: { message: string } | null = null;

    for (let attempt = 0; attempt < 12; attempt += 1) {
      const result = await supabaseAdmin
        .from("riders")
        .insert(payload)
        .select()
        .single();
      data = result.data;
      error = result.error;
      if (!error) break;

      const missing = error.message.match(
        /Could not find the '([^']+)' column|column [\w.]+\.(\w+) does not exist/i
      );
      const column = missing?.[1] || missing?.[2];
      if (!column || !(column in payload)) break;
      delete payload[column];
    }

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      rider: data,
      message:
        "Rider application submitted. Rhennie Studio will review and approve you.",
    });
  } catch (error) {
    console.error("Riders POST error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to submit rider application.",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getAuthUser(request);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Please sign in." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const riderId = cleanText(body?.rider_id);
    const supabaseAdmin = getSupabaseAdmin();

    if (riderId && (body?.status || typeof body?.is_available === "boolean")) {
      const admin = await requireAdmin(request);

      if (!admin) {
        return NextResponse.json(
          { success: false, message: "Only the kitchen can update a rider." },
          { status: 401 }
        );
      }

      const updateData: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };

      if (body?.status) {
        updateData.status = cleanText(body.status).toUpperCase();
      }

      if (typeof body?.is_available === "boolean") {
        updateData.is_available = body.is_available;
      }

      if (body?.notes !== undefined) {
        updateData.notes = cleanText(body.notes) || null;
      }

      const { data, error } = await supabaseAdmin
        .from("riders")
        .update(updateData)
        .eq("id", riderId)
        .select()
        .single();

      if (error) {
        return NextResponse.json(
          { success: false, message: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, rider: data });
    }

    // Rider self-update (availability / profile)
    const { data: rider, error: riderError } = await supabaseAdmin
      .from("riders")
      .select("*")
      .eq("auth_user_id", user.id)
      .maybeSingle();

    if (riderError || !rider) {
      return NextResponse.json(
        { success: false, message: "Rider profile not found." },
        { status: 404 }
      );
    }

    if (rider.status !== "APPROVED" && typeof body?.is_available === "boolean") {
      return NextResponse.json(
        {
          success: false,
          message: "Only approved riders can toggle availability.",
        },
        { status: 403 }
      );
    }

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (typeof body?.is_available === "boolean") {
      updateData.is_available = body.is_available;
    }

    if (body?.full_name) {
      if (body?.platform_fee_accepted !== true) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Accept the rider terms, including the 15% platform fee, before submitting your application.",
          },
          { status: 400 }
        );
      }

      updateData.full_name = cleanText(body.full_name);
      updateData.platform_fee_accepted = true;
      updateData.platform_fee_percent = 15;
    }

    if (body?.phone) {
      updateData.phone = cleanText(body.phone);
    }

    if (body?.vehicle_type) {
      updateData.vehicle_type = cleanText(body.vehicle_type);
    }

    if (body?.email) {
      updateData.email = cleanText(body.email).toLowerCase();
    }

    if (body?.address) {
      updateData.address = cleanText(body.address);
    }

    if (body?.city) {
      updateData.city = cleanText(body.city);
    }

    if (body?.id_type) {
      updateData.id_type = cleanText(body.id_type).toUpperCase();
    }

    if (body?.id_number) {
      updateData.id_number = cleanText(body.id_number);
    }

    if (body?.photo_path) {
      const path = cleanText(body.photo_path);
      if (!path.startsWith(`${user.id}/`)) {
        return NextResponse.json(
          { success: false, message: "Photo upload does not match this account." },
          { status: 400 }
        );
      }
      updateData.photo_path = path;
    }

    if (body?.plate_number !== undefined) {
      updateData.plate_number = cleanText(body.plate_number).toUpperCase() || null;
    }

    if (body?.vehicle_color !== undefined) {
      updateData.vehicle_color = cleanText(body.vehicle_color) || null;
    }

    if (body?.vehicle_model !== undefined) {
      updateData.vehicle_model = cleanText(body.vehicle_model) || null;
    }

    if (body?.bank_name !== undefined) {
      updateData.bank_name = cleanText(body.bank_name) || null;
    }

    if (body?.bank_code !== undefined) {
      updateData.bank_code = cleanText(body.bank_code) || null;
    }

    if (body?.bank_account_name !== undefined) {
      updateData.bank_account_name = cleanText(body.bank_account_name) || null;
    }

    if (body?.bank_account_number !== undefined) {
      const account = cleanText(body.bank_account_number).replace(/\D/g, "");
      if (account && account.length < 10) {
        return NextResponse.json(
          { success: false, message: "Enter a valid 10-digit account number." },
          { status: 400 }
        );
      }
      updateData.bank_account_number = account || null;
    }

    if (body?.id_document_path) {
      const path = cleanText(body.id_document_path);
      if (!path.startsWith(`${user.id}/`)) {
        return NextResponse.json(
          { success: false, message: "Identity upload does not match this account." },
          { status: 400 }
        );
      }
      updateData.id_document_path = path;
    }

    let data: unknown = null;
    let error: { message: string } | null = null;

    for (let attempt = 0; attempt < 8; attempt += 1) {
      const result = await supabaseAdmin
        .from("riders")
        .update(updateData)
        .eq("id", rider.id)
        .select()
        .single();
      data = result.data;
      error = result.error;
      if (!error) break;

      const missing = error.message.match(
        /Could not find the '([^']+)' column|column [\w.]+\.(\w+) does not exist/i
      );
      const column = missing?.[1] || missing?.[2];
      if (!column || !(column in updateData)) break;
      delete updateData[column];
    }

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, rider: data });
  } catch (error) {
    console.error("Riders PATCH error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to update rider.",
      },
      { status: 500 }
    );
  }
}

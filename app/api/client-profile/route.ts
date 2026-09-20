import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
  }

  if (!serviceRoleKey) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

function cleanText(value: unknown) {
  return String(value ?? "").trim();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const authUserId = cleanText(body?.auth_user_id);
    const fullName = cleanText(body?.full_name);
    const email = cleanText(body?.email).toLowerCase();

    if (!authUserId) {
      return NextResponse.json(
        {
          success: false,
          message: "Auth user ID is required.",
        },
        { status: 400 }
      );
    }

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          message: "Email address is required.",
        },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();

    // Confirm the supplied user ID is a real Supabase Auth user.
    const {
      data: authData,
      error: authError,
    } = await supabaseAdmin.auth.admin.getUserById(authUserId);

    if (authError || !authData?.user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unable to verify the new account.",
        },
        { status: 401 }
      );
    }

    const authEmail = cleanText(
      authData.user.email
    ).toLowerCase();

    if (!authEmail || authEmail !== email) {
      return NextResponse.json(
        {
          success: false,
          message: "Account email verification failed.",
        },
        { status: 400 }
      );
    }

    // Reuse an existing profile if this auth account already has one.
    const {
      data: existingByAuth,
      error: existingAuthError,
    } = await supabaseAdmin
      .from("client_profiles")
      .select("*")
      .eq("auth_user_id", authUserId)
      .maybeSingle();

    if (existingAuthError) {
      console.error(
        "Client profile lookup error:",
        existingAuthError
      );

      return NextResponse.json(
        {
          success: false,
          message: "Unable to check client profile.",
        },
        { status: 500 }
      );
    }

    if (existingByAuth) {
      return NextResponse.json({
        success: true,
        profile: existingByAuth,
        created: false,
      });
    }

    // Also check email so an existing customer is not duplicated.
    const {
      data: existingByEmail,
      error: existingEmailError,
    } = await supabaseAdmin
      .from("client_profiles")
      .select("*")
      .ilike("email", email)
      .maybeSingle();

    if (existingEmailError) {
      console.error(
        "Client profile email lookup error:",
        existingEmailError
      );

      return NextResponse.json(
        {
          success: false,
          message: "Unable to check client profile.",
        },
        { status: 500 }
      );
    }

    if (existingByEmail) {
      const {
        data: linkedProfile,
        error: linkError,
      } = await supabaseAdmin
        .from("client_profiles")
        .update({
          auth_user_id: authUserId,
          full_name:
            fullName ||
            existingByEmail.full_name,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingByEmail.id)
        .select("*")
        .single();

      if (linkError) {
        console.error(
          "Client profile linking error:",
          linkError
        );

        return NextResponse.json(
          {
            success: false,
            message:
              "Account was created, but the client profile could not be linked.",
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        profile: linkedProfile,
        created: false,
      });
    }

    // customer_code is omitted intentionally.
    // Supabase will use generate_client_customer_code().
    const {
      data: profile,
      error: profileError,
    } = await supabaseAdmin
      .from("client_profiles")
      .insert({
        auth_user_id: authUserId,
        full_name: fullName || null,
        email,
        status: "ACTIVE",
      })
      .select("*")
      .single();

    if (profileError) {
      console.error(
        "Client profile creation error:",
        profileError
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Account was created, but the client profile could not be created.",
          error: profileError.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        profile,
        created: true,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Client profile POST error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to create client profile.",
      },
      { status: 500 }
    );
  }
}
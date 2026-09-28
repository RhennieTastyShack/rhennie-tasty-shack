import { NextRequest, NextResponse } from "next/server";
import {
  cleanText,
  getAuthUser,
  getSupabaseAdmin,
} from "@/lib/supabase-admin";
import { hashOtpCode, normalizeNgPhone, notifyCustomer } from "@/lib/notify";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_ATTEMPTS = 5;

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    const body = await request.json().catch(() => ({}));

    const code = cleanText(body?.code);
    const purpose =
      cleanText(body?.purpose).toUpperCase() || "SIGNUP";
    let authUserId = user?.id || cleanText(body?.auth_user_id);

    if (!authUserId) {
      return NextResponse.json(
        { success: false, message: "Please sign in." },
        { status: 401 }
      );
    }

    if (user?.id) {
      authUserId = user.id;
    }

    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json(
        { success: false, message: "Enter the 6-digit code." },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    const { data: challenge, error: lookupError } = await supabase
      .from("otp_challenges")
      .select("*")
      .eq("auth_user_id", authUserId)
      .eq("purpose", purpose)
      .is("consumed_at", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (lookupError || !challenge) {
      return NextResponse.json(
        {
          success: false,
          message: "No active verification code. Please request a new one.",
        },
        { status: 404 }
      );
    }

    if (new Date(challenge.expires_at).getTime() < Date.now()) {
      return NextResponse.json(
        {
          success: false,
          message: "This code has expired. Please request a new one.",
        },
        { status: 400 }
      );
    }

    if (Number(challenge.attempts || 0) >= MAX_ATTEMPTS) {
      return NextResponse.json(
        {
          success: false,
          message: "Too many attempts. Please request a new code.",
        },
        { status: 429 }
      );
    }

    const matches = challenge.code_hash === hashOtpCode(code);

    if (!matches) {
      await supabase
        .from("otp_challenges")
        .update({ attempts: Number(challenge.attempts || 0) + 1 })
        .eq("id", challenge.id);

      return NextResponse.json(
        { success: false, message: "Incorrect code. Please try again." },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    await supabase
      .from("otp_challenges")
      .update({ consumed_at: now })
      .eq("id", challenge.id);

    const phone = normalizeNgPhone(challenge.phone) || challenge.phone;

    const { data: profile } = await supabase
      .from("client_profiles")
      .update({
        phone,
        phone_verified_at: now,
        updated_at: now,
      })
      .eq("auth_user_id", authUserId)
      .select("*")
      .maybeSingle();

    const { data: authData } = await supabase.auth.admin.getUserById(
      authUserId
    );

    const emailConfirmed = Boolean(authData?.user?.email_confirmed_at);

    if (emailConfirmed) {
      await notifyCustomer({
        event: "WELCOME",
        authUserId,
        email: authData?.user?.email || profile?.email,
        phone,
        name: profile?.full_name || null,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Phone verified successfully.",
      phone_verified: true,
      email_confirmed: emailConfirmed,
      fully_verified: emailConfirmed,
    });
  } catch (error) {
    console.error("OTP verify error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to verify code.",
      },
      { status: 500 }
    );
  }
}

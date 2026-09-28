import { NextRequest, NextResponse } from "next/server";
import {
  cleanText,
  getAuthUser,
  getSupabaseAdmin,
} from "@/lib/supabase-admin";
import {
  generateOtpCode,
  hashOtpCode,
  normalizeNgPhone,
} from "@/lib/notify";
import { sendTermiiSms } from "@/lib/notify/termii";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const COOLDOWN_SECONDS = 60;
const OTP_TTL_MINUTES = 10;

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    const body = await request.json().catch(() => ({}));

    const purpose =
      cleanText(body?.purpose).toUpperCase() || "SIGNUP";
    let phone = cleanText(body?.phone);
    let authUserId = user?.id || cleanText(body?.auth_user_id);

    if (!authUserId) {
      return NextResponse.json(
        { success: false, message: "Please sign in or provide auth_user_id." },
        { status: 401 }
      );
    }

    // If authenticated, always use the session user.
    if (user?.id) {
      authUserId = user.id;
    }

    const supabase = getSupabaseAdmin();

    const {
      data: authData,
      error: authLookupError,
    } = await supabase.auth.admin.getUserById(authUserId);

    if (authLookupError || !authData?.user) {
      return NextResponse.json(
        { success: false, message: "Account not found." },
        { status: 404 }
      );
    }

    // Unauthenticated callers may only request OTP for freshly created accounts.
    if (!user) {
      const createdAt = authData.user.created_at
        ? new Date(authData.user.created_at).getTime()
        : 0;
      const ageMs = Date.now() - createdAt;

      if (!createdAt || ageMs > 30 * 60 * 1000) {
        return NextResponse.json(
          {
            success: false,
            message: "Please sign in to request a verification code.",
          },
          { status: 401 }
        );
      }
    }

    if (!phone) {
      const { data: profile } = await supabase
        .from("client_profiles")
        .select("phone")
        .eq("auth_user_id", authUserId)
        .maybeSingle();

      phone = cleanText(profile?.phone);
    }

    const normalized = normalizeNgPhone(phone);

    if (!normalized) {
      return NextResponse.json(
        {
          success: false,
          message: "A valid Nigerian phone number is required.",
        },
        { status: 400 }
      );
    }

    // Rate limit: one active challenge per phone within cooldown.
    const cooldownIso = new Date(
      Date.now() - COOLDOWN_SECONDS * 1000
    ).toISOString();

    const { data: recent } = await supabase
      .from("otp_challenges")
      .select("id, created_at")
      .eq("phone", normalized)
      .eq("purpose", purpose)
      .is("consumed_at", null)
      .gte("created_at", cooldownIso)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (recent) {
      return NextResponse.json(
        {
          success: false,
          message: `Please wait ${COOLDOWN_SECONDS} seconds before requesting another code.`,
        },
        { status: 429 }
      );
    }

    const code = generateOtpCode();
    const expiresAt = new Date(
      Date.now() + OTP_TTL_MINUTES * 60 * 1000
    ).toISOString();

    const sms = await sendTermiiSms({
      to: normalized,
      message: `Rhennie Tasty Shack: Your verification code is ${code}. It expires in 10 minutes.`,
    });

    if (!sms.ok || sms.skipped) {
      return NextResponse.json(
        {
          success: false,
          message: sms.skipped
            ? "Text messages are not connected yet, so the code cannot be sent to your phone."
            : sms.error || "Unable to text your phone.",
        },
        { status: 503 }
      );
    }

    const { error: insertError } = await supabase
      .from("otp_challenges")
      .insert({
        auth_user_id: authUserId,
        phone: normalized,
        purpose,
        code_hash: hashOtpCode(code),
        expires_at: expiresAt,
        attempts: 0,
      });

    if (insertError) {
      console.error("OTP insert error:", insertError);
      return NextResponse.json(
        { success: false, message: insertError.message },
        { status: 500 }
      );
    }

    await supabase
      .from("client_profiles")
      .update({
        phone: normalized,
        updated_at: new Date().toISOString(),
      })
      .eq("auth_user_id", authUserId);

    return NextResponse.json({
      success: true,
      message: "Verification code sent by text to your phone.",
      expires_at: expiresAt,
      phone_hint: `***${normalized.slice(-4)}`,
    });
  } catch (error) {
    console.error("OTP send error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to send verification code.",
      },
      { status: 500 }
    );
  }
}

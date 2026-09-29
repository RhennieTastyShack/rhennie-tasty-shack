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
import { sendResendEmail } from "@/lib/notify/resend";
import { buildOtpTemplate } from "@/lib/notify/templates";

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

    const { data: profile } = await supabase
      .from("client_profiles")
      .select("phone, email")
      .eq("auth_user_id", authUserId)
      .maybeSingle();

    if (!phone) {
      phone = cleanText(profile?.phone);
    }

    const normalized = normalizeNgPhone(phone);
    const authEmail = cleanText(authData.user.email).toLowerCase();
    const profileEmail = cleanText(profile?.email).toLowerCase();
    // The login address is the primary mailbox. Never use an address from the request.
    const email = authEmail.includes("@")
      ? authEmail
      : profileEmail;

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        {
          success: false,
          message: "This account has no primary email for the verification code.",
        },
        { status: 400 }
      );
    }

    const [local, domain] = email.split("@");
    const emailHint = domain
      ? `${local.slice(0, 1)}***@${domain}`
      : "your primary email";

    // Rate limit: one active challenge per account within cooldown.
    const cooldownIso = new Date(
      Date.now() - COOLDOWN_SECONDS * 1000
    ).toISOString();

    const { data: recent } = await supabase
      .from("otp_challenges")
      .select("id, created_at")
      .eq("auth_user_id", authUserId)
      .eq("purpose", purpose)
      .is("consumed_at", null)
      .gte("created_at", cooldownIso)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (recent?.created_at) {
      const elapsedMs = Date.now() - new Date(recent.created_at).getTime();
      const retryAfter = Math.max(
        1,
        Math.ceil((COOLDOWN_SECONDS * 1000 - elapsedMs) / 1000)
      );

      return NextResponse.json(
        {
          success: false,
          message: `A code was just sent to your primary email. You can resend it in ${retryAfter} seconds.`,
          retry_after_seconds: retryAfter,
          email_hint: emailHint,
          email: user ? email : undefined,
        },
        { status: 429 }
      );
    }

    const code = generateOtpCode();
    const expiresAt = new Date(
      Date.now() + OTP_TTL_MINUTES * 60 * 1000
    ).toISOString();

    const template = buildOtpTemplate(code);
    const emailResult = await sendResendEmail({
      to: email,
      subject: template.emailSubject,
      html: template.emailHtml,
      text: template.emailText,
    });

    if (!emailResult.ok || emailResult.skipped) {
      return NextResponse.json(
        {
          success: false,
          message: emailResult.skipped
            ? "Email is turned off, so the verification code cannot be sent."
            : emailResult.error || "Unable to email your verification code.",
        },
        { status: 503 }
      );
    }

    await supabase
      .from("otp_challenges")
      .update({ consumed_at: new Date().toISOString() })
      .eq("auth_user_id", authUserId)
      .eq("purpose", purpose)
      .is("consumed_at", null);

    const { error: insertError } = await supabase
      .from("otp_challenges")
      .insert({
        auth_user_id: authUserId,
        phone: normalized || `email:${email}`,
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

    if (normalized) {
      await supabase
        .from("client_profiles")
        .update({
          phone: normalized,
          updated_at: new Date().toISOString(),
        })
        .eq("auth_user_id", authUserId);
    }

    return NextResponse.json({
      success: true,
      message: `Verification code sent to your primary email ${emailHint}.`,
      expires_at: expiresAt,
      email_hint: emailHint,
      email: user ? email : undefined,
      retry_after_seconds: COOLDOWN_SECONDS,
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

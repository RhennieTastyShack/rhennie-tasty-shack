import { NextRequest, NextResponse } from "next/server";
import { cleanText, getSupabaseAdmin } from "@/lib/supabase-admin";
import { sendResendEmail } from "@/lib/notify/resend";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = cleanText(body?.email).toLowerCase();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { success: false, message: "Enter a valid email address." },
        { status: 400 }
      );
    }

    const origin =
      process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
      new URL(request.url).origin;

    const redirectTo = `${origin}/reset-password`;
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase.auth.admin.generateLink({
      type: "recovery",
      email,
      options: { redirectTo },
    });

    const actionLink = data?.properties?.action_link;

    if (!error && actionLink) {
      const sent = await sendResendEmail({
        to: email,
        subject: "Reset your Rhennie password",
        text: `Reset your Rhennie Tasty Shack password: ${actionLink}`,
        html: `<p>Reset your Rhennie Tasty Shack password.</p>
          <p><a href="${actionLink}">Choose a new password</a></p>
          <p>If you did not ask for this, you can ignore this email.</p>`,
      });

      if (!sent.ok) {
        return NextResponse.json(
          {
            success: false,
            message: sent.error || "Unable to send the reset email.",
          },
          { status: 502 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message:
        "If an account exists for that email, a password reset link is on the way.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to send the reset email.",
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { notifyCustomer } from "@/lib/notify";
import { cleanText, getSupabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const COOLDOWN_MS = 60_000;

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

    const since = new Date(Date.now() - COOLDOWN_MS).toISOString();
    const { data: recent } = await supabase
      .from("notification_log")
      .select("id")
      .eq("event", "PASSWORD_RESET")
      .eq("channel", "email")
      .contains("payload", { to: email })
      .gte("created_at", since)
      .limit(1)
      .maybeSingle();

    if (recent?.id) {
      return NextResponse.json({
        success: true,
        message:
          "If an account exists for that email, a password reset link is on the way.",
      });
    }

    const { data, error } = await supabase.auth.admin.generateLink({
      type: "recovery",
      email,
      options: { redirectTo },
    });

    const actionLink = data?.properties?.action_link;

    if (!error && actionLink) {
      const sent = await notifyCustomer({
        event: "PASSWORD_RESET",
        email,
        dedupeKey: `PASSWORD_RESET:${email}:${Math.floor(Date.now() / COOLDOWN_MS)}`,
        skipChannels: ["sms", "whatsapp", "inbox"],
        data: { resetUrl: actionLink },
      });

      if (!sent.ok && !("skipped" in sent && sent.skipped)) {
        return NextResponse.json(
          {
            success: false,
            message: "Unable to send the reset email right now. Please try again shortly.",
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
        message: "Unable to send the reset email right now. Please try again shortly.",
      },
      { status: 500 }
    );
  }
}

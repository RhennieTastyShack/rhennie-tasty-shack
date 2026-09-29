import { NextRequest, NextResponse } from "next/server";
import {
  getTransactionalFrom,
  sendResendEmail,
} from "@/lib/notify/resend";
import { requireAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Admin-only Resend connectivity test.
 * Sends only to the signed-in admin email — never an arbitrary recipient.
 */
export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);

    if (!admin?.email) {
      return NextResponse.json(
        { success: false, message: "Only Rhennie Studio can send a test email." },
        { status: 401 }
      );
    }

    const from = getTransactionalFrom();
    const sent = await sendResendEmail({
      to: admin.email,
      subject: "Rhennie Tasty Shack — Resend test",
      text: `This is a transactional test from ${from}.\n\nIf you received this, Resend is delivering from your verified domain.`,
      html: `<p style="font-family:Georgia,serif;">This is a transactional test from <strong>${from}</strong>.</p>
        <p style="font-family:Arial,sans-serif;color:#444;">If you received this, Resend is delivering from your verified domain.</p>`,
      idempotencyKey: `EMAIL_TEST:${admin.id}:${Math.floor(Date.now() / 300_000)}`,
    });

    if (!sent.ok) {
      return NextResponse.json(
        {
          success: false,
          message: sent.error || "Unable to send test email.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Test email sent to ${admin.email}`,
      from,
      messageId: sent.id || null,
      skipped: Boolean(sent.skipped),
    });
  } catch (error) {
    console.error("Admin email test error:", error);
    return NextResponse.json(
      { success: false, message: "Unable to send test email." },
      { status: 500 }
    );
  }
}

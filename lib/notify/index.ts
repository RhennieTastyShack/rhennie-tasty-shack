import { createHash, randomInt } from "crypto";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { sendResendEmail } from "@/lib/notify/resend";
import {
  normalizeNgPhone,
  sendTermiiSms,
  sendTermiiWhatsApp,
} from "@/lib/notify/termii";
import {
  NotifyEvent,
  NotifyTemplate,
  buildDeliveryStatusTemplate,
  buildOrderPaidTemplate,
  buildOrderStatusTemplate,
  buildOtpTemplate,
  buildWelcomeTemplate,
} from "@/lib/notify/templates";

export { normalizeNgPhone };

export type NotifyCustomerInput = {
  event: NotifyEvent;
  authUserId?: string | null;
  clientProfileId?: string | null;
  email?: string | null;
  phone?: string | null;
  name?: string | null;
  data?: {
    code?: string;
    orderNo?: string | null;
    total?: number | null;
    status?: string;
    trackingUrl?: string | null;
    riderName?: string | null;
  };
  /** Channels to skip (e.g. OTP may skip email if desired — default sends all) */
  skipChannels?: Array<"email" | "sms" | "whatsapp" | "inbox">;
};

function resolveTemplate(input: NotifyCustomerInput): NotifyTemplate | null {
  switch (input.event) {
    case "OTP":
      if (!input.data?.code) return null;
      return buildOtpTemplate(input.data.code);
    case "WELCOME":
      return buildWelcomeTemplate(input.name || undefined);
    case "ORDER_PAID":
      return buildOrderPaidTemplate({
        orderNo: input.data?.orderNo,
        total: input.data?.total,
        trackingUrl: input.data?.trackingUrl,
      });
    case "ORDER_STATUS":
      if (!input.data?.status) return null;
      return buildOrderStatusTemplate({
        orderNo: input.data?.orderNo,
        status: input.data.status,
      });
    case "DELIVERY_STATUS":
      if (!input.data?.status) return null;
      return buildDeliveryStatusTemplate({
        orderNo: input.data?.orderNo,
        status: input.data.status,
        trackingUrl: input.data?.trackingUrl,
        riderName: input.data?.riderName,
      });
    default:
      return null;
  }
}

async function logSend(params: {
  authUserId?: string | null;
  clientProfileId?: string | null;
  channel: string;
  event: string;
  payload: Record<string, unknown>;
  status: string;
  providerId?: string;
  error?: string;
}) {
  try {
    const supabase = getSupabaseAdmin();
    await supabase.from("notification_log").insert({
      auth_user_id: params.authUserId || null,
      client_profile_id: params.clientProfileId || null,
      channel: params.channel,
      event: params.event,
      payload: params.payload,
      status: params.status,
      provider_id: params.providerId || null,
      error: params.error || null,
    });
  } catch (error) {
    console.error("notification_log insert failed:", error);
  }
}

async function writeInbox(params: {
  authUserId?: string | null;
  title: string;
  message: string;
  event: string;
}) {
  if (!params.authUserId) return;

  try {
    const supabase = getSupabaseAdmin();
    await supabase.from("notifications").insert({
      auth_user_id: params.authUserId,
      title: params.title,
      message: params.message,
      type: "info",
      event: params.event,
      is_read: false,
    });
  } catch (error) {
    console.error("notifications inbox insert failed:", error);
  }
}

/**
 * Fan-out customer notification. Never throws to callers —
 * failures are logged and swallowed so payments/orders stay resilient.
 */
export async function notifyCustomer(input: NotifyCustomerInput) {
  try {
    const template = resolveTemplate(input);

    if (!template) {
      console.error("notifyCustomer: missing template data", input.event);
      return { ok: false, error: "Missing template data." };
    }

    const skip = new Set(input.skipChannels || []);
    const phone = input.phone ? normalizeNgPhone(input.phone) : null;
    const email = input.email?.trim().toLowerCase() || null;

    if (!skip.has("inbox")) {
      await writeInbox({
        authUserId: input.authUserId,
        title: template.title,
        message: template.sms,
        event: input.event,
      });
    }

    if (!skip.has("email") && email) {
      const result = await sendResendEmail({
        to: email,
        subject: template.emailSubject,
        html: template.emailHtml,
        text: template.emailText,
      });

      await logSend({
        authUserId: input.authUserId,
        clientProfileId: input.clientProfileId,
        channel: "email",
        event: input.event,
        payload: { to: email, subject: template.emailSubject },
        status: result.skipped ? "skipped" : result.ok ? "sent" : "failed",
        providerId: result.id,
        error: result.error,
      });
    }

    if (!skip.has("sms") && phone) {
      const result = await sendTermiiSms({
        to: phone,
        message: template.sms,
      });

      await logSend({
        authUserId: input.authUserId,
        clientProfileId: input.clientProfileId,
        channel: "sms",
        event: input.event,
        payload: { to: phone },
        status: result.skipped ? "skipped" : result.ok ? "sent" : "failed",
        providerId: result.id,
        error: result.error,
      });
    }

    if (!skip.has("whatsapp") && phone) {
      const result = await sendTermiiWhatsApp({
        to: phone,
        message: template.whatsapp,
      });

      await logSend({
        authUserId: input.authUserId,
        clientProfileId: input.clientProfileId,
        channel: "whatsapp",
        event: input.event,
        payload: { to: phone },
        status: result.skipped ? "skipped" : result.ok ? "sent" : "failed",
        providerId: result.id,
        error: result.error,
      });
    }

    return { ok: true };
  } catch (error) {
    console.error("notifyCustomer unexpected error:", error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Notify failed.",
    };
  }
}

export function generateOtpCode() {
  return String(randomInt(100000, 999999));
}

export function hashOtpCode(code: string) {
  return createHash("sha256").update(code).digest("hex");
}

export function siteOrigin() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "http://localhost:3000"
  );
}

export function trackingUrlForToken(token: string) {
  return `${siteOrigin()}/track/${encodeURIComponent(token)}`;
}

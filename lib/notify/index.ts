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
  OrderEmailItem,
  buildDeliveryStatusTemplate,
  buildOrderPaidTemplate,
  buildOrderStatusTemplate,
  buildOwnRiderTemplate,
  buildOtpTemplate,
  buildPartnerRegisteredTemplate,
  buildPartnerStatusTemplate,
  buildPasswordChangedTemplate,
  buildPasswordResetTemplate,
  buildPickupReadyTemplate,
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
  /** Prevents duplicate transactional emails for the same business event. */
  dedupeKey?: string | null;
  data?: {
    code?: string;
    resetUrl?: string;
    orderNo?: string | null;
    total?: number | null;
    subtotal?: number | null;
    deliveryFee?: number | null;
    tipAmount?: number | null;
    fulfilmentMethod?: string | null;
    deliveryType?: string | null;
    paymentStatus?: string | null;
    paymentReference?: string | null;
    pickupCode?: string | null;
    pickupLocation?: string | null;
    instructions?: string | null;
    items?: OrderEmailItem[];
    status?: string;
    trackingUrl?: string | null;
    riderName?: string | null;
    note?: string | null;
  };
  skipChannels?: Array<"email" | "sms" | "whatsapp" | "inbox" | "push">;
};

function resolveTemplate(input: NotifyCustomerInput): NotifyTemplate | null {
  switch (input.event) {
    case "OTP":
      if (!input.data?.code) return null;
      return buildOtpTemplate(input.data.code);
    case "WELCOME":
      return buildWelcomeTemplate(input.name || undefined);
    case "PASSWORD_RESET":
      if (!input.data?.resetUrl) return null;
      return buildPasswordResetTemplate(input.data.resetUrl);
    case "PASSWORD_CHANGED":
      return buildPasswordChangedTemplate();
    case "ORDER_PAID":
      return buildOrderPaidTemplate({
        orderNo: input.data?.orderNo,
        customerName: input.name,
        total: input.data?.total,
        subtotal: input.data?.subtotal,
        deliveryFee: input.data?.deliveryFee,
        tipAmount: input.data?.tipAmount,
        fulfilmentMethod: input.data?.fulfilmentMethod,
        deliveryType: input.data?.deliveryType,
        paymentStatus: input.data?.paymentStatus,
        paymentReference: input.data?.paymentReference,
        pickupCode: input.data?.pickupCode,
        pickupLocation: input.data?.pickupLocation,
        items: input.data?.items,
        trackingUrl: input.data?.trackingUrl,
      });
    case "ORDER_STATUS":
      if (!input.data?.status) return null;
      return buildOrderStatusTemplate({
        orderNo: input.data?.orderNo,
        status: input.data.status,
      });
    case "PICKUP_READY":
      return buildPickupReadyTemplate({
        orderNo: input.data?.orderNo,
        pickupCode: input.data?.pickupCode,
        pickupLocation: input.data?.pickupLocation,
        instructions: input.data?.instructions,
      });
    case "OWN_RIDER_CODE":
      return buildOwnRiderTemplate({
        orderNo: input.data?.orderNo,
        pickupCode: input.data?.pickupCode,
        pickupLocation: input.data?.pickupLocation,
      });
    case "DELIVERY_STATUS":
      if (!input.data?.status) return null;
      return buildDeliveryStatusTemplate({
        orderNo: input.data?.orderNo,
        status: input.data.status,
        trackingUrl: input.data?.trackingUrl,
        riderName: input.data?.riderName,
      });
    case "PARTNER_REGISTERED":
      return buildPartnerRegisteredTemplate({ name: input.name });
    case "PARTNER_STATUS":
      if (!input.data?.status) return null;
      return buildPartnerStatusTemplate({
        name: input.name,
        status: input.data.status,
        note: input.data.note,
      });
    default:
      return null;
  }
}

async function alreadySentDedupe(event: string, dedupeKey: string) {
  try {
    const supabase = getSupabaseAdmin();
    const { data } = await supabase
      .from("notification_log")
      .select("id")
      .eq("event", event)
      .eq("channel", "email")
      .eq("status", "sent")
      .contains("payload", { dedupeKey })
      .limit(1)
      .maybeSingle();

    return Boolean(data?.id);
  } catch {
    return false;
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
 * Fan-out customer/partner notification. Never throws to callers —
 * failures are logged so payments/orders stay resilient.
 */
export async function notifyCustomer(input: NotifyCustomerInput) {
  try {
    const template = resolveTemplate(input);

    if (!template) {
      console.error("notifyCustomer: missing template data", input.event);
      return { ok: false, error: "Missing template data." };
    }

    const dedupeKey = cleanDedupe(input.dedupeKey);
    if (dedupeKey && (await alreadySentDedupe(input.event, dedupeKey))) {
      return { ok: true, skipped: true, reason: "duplicate" as const };
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
      const safePayload: Record<string, unknown> = {
        to: email,
        subject: template.emailSubject,
        ...(dedupeKey ? { dedupeKey } : {}),
      };

      const result = await sendResendEmail({
        to: email,
        subject: template.emailSubject,
        html: template.emailHtml,
        text: template.emailText,
        idempotencyKey: dedupeKey || undefined,
      });

      await logSend({
        authUserId: input.authUserId,
        clientProfileId: input.clientProfileId,
        channel: "email",
        event: input.event,
        payload: safePayload,
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
        payload: { to: phone, ...(dedupeKey ? { dedupeKey } : {}) },
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
        payload: { to: phone, ...(dedupeKey ? { dedupeKey } : {}) },
        status: result.skipped ? "skipped" : result.ok ? "sent" : "failed",
        providerId: result.id,
        error: result.error,
      });
    }

    // Web push for signed-in customers (order/delivery events only — no OTP spam).
    const pushEvents = new Set([
      "ORDER_PAID",
      "ORDER_STATUS",
      "PICKUP_READY",
      "DELIVERY_STATUS",
      "OWN_RIDER_CODE",
    ]);
    if (
      !skip.has("push") &&
      input.authUserId &&
      pushEvents.has(input.event)
    ) {
      const { sendWebPushToUser } = await import("@/lib/notify/push");
      const pushUrl =
        input.data?.trackingUrl ||
        `${siteOrigin()}/client-portal/orders`;
      const result = await sendWebPushToUser(input.authUserId, {
        title: template.title,
        body: template.sms,
        url: pushUrl,
        tag: `${input.event}:${input.data?.orderNo || "rts"}`,
      });

      await logSend({
        authUserId: input.authUserId,
        clientProfileId: input.clientProfileId,
        channel: "push",
        event: input.event,
        payload: {
          url: pushUrl,
          ...(dedupeKey ? { dedupeKey } : {}),
        },
        status:
          "skipped" in result && result.skipped
            ? "skipped"
            : result.ok
              ? "sent"
              : "failed",
        error: "error" in result ? result.error : undefined,
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

function cleanDedupe(value?: string | null) {
  const key = String(value || "").trim();
  return key ? key.slice(0, 200) : "";
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

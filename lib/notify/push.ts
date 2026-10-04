import webpush from "web-push";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

function siteOrigin() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "https://rhennietastyshack.com"
  );
}

function vapidConfigured() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim();
  const privateKey = process.env.VAPID_PRIVATE_KEY?.trim();
  const subject =
    process.env.VAPID_SUBJECT?.trim() || "mailto:mohrhennie567@gmail.com";
  if (!publicKey || !privateKey) return null;
  if (process.env.NOTIFY_PUSH === "false") return null;
  return { publicKey, privateKey, subject };
}

export function getVapidPublicKey() {
  return process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim() || null;
}

export type PushPayload = {
  title: string;
  body: string;
  url?: string | null;
  tag?: string | null;
};

/**
 * Send web push to all active subscriptions for a signed-in customer.
 * Never throws — failures are logged only.
 */
export async function sendWebPushToUser(
  authUserId: string | null | undefined,
  payload: PushPayload
) {
  const vapid = vapidConfigured();
  if (!vapid || !authUserId) {
    return { ok: true, skipped: true as const, reason: "disabled_or_guest" };
  }

  try {
    webpush.setVapidDetails(vapid.subject, vapid.publicKey, vapid.privateKey);

    const supabase = getSupabaseAdmin();
    const { data: rows, error } = await supabase
      .from("push_subscriptions")
      .select("id, endpoint, p256dh, auth")
      .eq("auth_user_id", authUserId)
      .is("revoked_at", null);

    if (error || !rows?.length) {
      return { ok: true, skipped: true as const, reason: "no_subscriptions" };
    }

    const origin = siteOrigin();
    const body = JSON.stringify({
      title: payload.title,
      body: payload.body,
      url: payload.url || `${origin}/client-portal/notifications`,
      tag: payload.tag || "rts-order",
      icon: "/icon-192.png",
      badge: "/icon-192.png",
    });

    let sent = 0;
    for (const row of rows) {
      try {
        await webpush.sendNotification(
          {
            endpoint: row.endpoint,
            keys: { p256dh: row.p256dh, auth: row.auth },
          },
          body,
          { TTL: 60 * 60 }
        );
        sent += 1;
        await supabase
          .from("push_subscriptions")
          .update({ last_used_at: new Date().toISOString() })
          .eq("id", row.id);
      } catch (err: unknown) {
        const statusCode =
          err && typeof err === "object" && "statusCode" in err
            ? Number((err as { statusCode?: number }).statusCode)
            : 0;
        if (statusCode === 404 || statusCode === 410) {
          await supabase
            .from("push_subscriptions")
            .update({ revoked_at: new Date().toISOString() })
            .eq("id", row.id);
        }
        console.error("web push send failed:", err);
      }
    }

    return { ok: true, sent };
  } catch (error) {
    console.error("sendWebPushToUser error:", error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Push failed",
    };
  }
}

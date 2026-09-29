/**
 * Server-side Resend transactional email client.
 * Secrets never leave this module / server routes.
 */

export const DEFAULT_TRANSACTIONAL_FROM =
  "Rhennie Tasty Shack <noreply@rhennietastyshack.com>";

function isEmailEnabled() {
  return (process.env.NOTIFY_EMAIL || "true").toLowerCase() !== "false";
}

/**
 * Official transactional From.
 * Prefer EMAIL_FROM, then RESEND_FROM_EMAIL, then verified default.
 * Do not set Reply-To to hello@ until a real mailbox exists.
 */
export function getTransactionalFrom() {
  const configured =
    process.env.EMAIL_FROM?.trim() ||
    process.env.RESEND_FROM_EMAIL?.trim() ||
    DEFAULT_TRANSACTIONAL_FROM;

  return configured.includes("<")
    ? configured
    : `Rhennie Tasty Shack <${configured}>`;
}

/** Optional Reply-To — only when RESEND_REPLY_TO / EMAIL_REPLY_TO is set. */
export function getTransactionalReplyTo(override?: string | null) {
  const value = String(
    override || process.env.EMAIL_REPLY_TO || process.env.RESEND_REPLY_TO || ""
  )
    .trim()
    .toLowerCase();

  if (!value.includes("@")) return null;
  // Guard: do not silently use a mailbox that has not been purchased yet.
  if (value === "hello@rhennietastyshack.com") return null;
  return value;
}

function sanitizeProviderError(raw: string) {
  const text = String(raw || "Unable to send email.");
  if (/api[_ ]?key|authorization|bearer|secret/i.test(text)) {
    return "Unable to send email right now. Please try again shortly.";
  }
  if (/testing emails|verify a domain/i.test(text)) {
    return "Unable to send email from this domain right now.";
  }
  if (text.length > 180) {
    return "Unable to send email right now. Please try again shortly.";
  }
  return text;
}

export async function sendResendEmail(params: {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
  /** Stable key so Resend / our logs can de-dupe retries. */
  idempotencyKey?: string;
}): Promise<{ ok: boolean; id?: string; error?: string; skipped?: boolean }> {
  if (!isEmailEnabled()) {
    return { ok: true, skipped: true };
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = getTransactionalFrom();

  if (!apiKey) {
    return { ok: false, error: "RESEND_API_KEY is missing." };
  }

  const to = String(params.to || "").trim().toLowerCase();

  if (!to || !to.includes("@")) {
    return { ok: false, error: "Invalid email address." };
  }

  try {
    const headers: Record<string, string> = {
      "X-Entity-Ref-ID":
        params.idempotencyKey || `rts-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    };

    const payload: Record<string, unknown> = {
      from,
      to: [to],
      subject: params.subject,
      html: params.html,
      text: params.text,
      headers,
    };

    const replyTo = getTransactionalReplyTo(params.replyTo);
    if (replyTo) {
      payload.reply_to = replyTo;
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        ...(params.idempotencyKey
          ? { "Idempotency-Key": params.idempotencyKey.slice(0, 256) }
          : {}),
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const raw = String(
        data?.message ||
          data?.error?.message ||
          `Resend failed (${response.status})`
      );
      console.error("Resend send failed:", {
        status: response.status,
        toDomain: to.split("@")[1] || null,
      });
      return { ok: false, error: sanitizeProviderError(raw) };
    }

    return { ok: true, id: String(data?.id || "") };
  } catch (error) {
    console.error("Resend request error:", {
      message: error instanceof Error ? error.message : "unknown",
    });
    return {
      ok: false,
      error: "Unable to send email right now. Please try again shortly.",
    };
  }
}

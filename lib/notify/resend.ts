function isEmailEnabled() {
  return (process.env.NOTIFY_EMAIL || "true").toLowerCase() !== "false";
}

export async function sendResendEmail(params: {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
}): Promise<{ ok: boolean; id?: string; error?: string; skipped?: boolean }> {
  if (!isEmailEnabled()) {
    return { ok: true, skipped: true };
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from =
    process.env.RESEND_FROM_EMAIL ||
    "Rhennie Tasty Shack <noreply@rhennietastyshack.com>";

  if (!apiKey) {
    return { ok: false, error: "RESEND_API_KEY is missing." };
  }

  const to = String(params.to || "").trim().toLowerCase();

  if (!to || !to.includes("@")) {
    return { ok: false, error: "Invalid email address." };
  }

  try {
    const payload: Record<string, unknown> = {
      from,
      to: [to],
      subject: params.subject,
      html: params.html,
      text: params.text,
      headers: {
        "X-Entity-Ref-ID": `rts-${Date.now()}`,
      },
    };

    const replyTo = String(params.replyTo || process.env.RESEND_REPLY_TO || "")
      .trim()
      .toLowerCase();
    if (replyTo.includes("@")) {
      payload.reply_to = replyTo;
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const raw =
        data?.message ||
        data?.error?.message ||
        `Resend failed (${response.status})`;
      const testingOnly = /testing emails|verify a domain/i.test(String(raw));

      return {
        ok: false,
        error: testingOnly
          ? "Customer emails cannot send until rhennietastyshack.com is verified in Resend DNS."
          : raw,
      };
    }

    return { ok: true, id: String(data?.id || "") };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error ? error.message : "Resend request failed.",
    };
  }
}

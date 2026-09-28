function isEmailEnabled() {
  return (process.env.NOTIFY_EMAIL || "true").toLowerCase() !== "false";
}

export async function sendResendEmail(params: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<{ ok: boolean; id?: string; error?: string; skipped?: boolean }> {
  if (!isEmailEnabled()) {
    return { ok: true, skipped: true };
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from =
    process.env.RESEND_FROM_EMAIL ||
    "Rhennie Tasty Shack <onboarding@resend.dev>";

  if (!apiKey) {
    return { ok: false, error: "RESEND_API_KEY is missing." };
  }

  const to = String(params.to || "").trim().toLowerCase();

  if (!to || !to.includes("@")) {
    return { ok: false, error: "Invalid email address." };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: params.subject,
        html: params.html,
        text: params.text,
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return {
        ok: false,
        error:
          data?.message ||
          data?.error?.message ||
          `Resend failed (${response.status})`,
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

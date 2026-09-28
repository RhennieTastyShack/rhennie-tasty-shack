export function normalizeNgPhone(raw: string): string | null {
  const digits = String(raw || "").replace(/\D/g, "");

  if (!digits) {
    return null;
  }

  let normalized = digits;

  if (normalized.startsWith("0") && normalized.length === 11) {
    normalized = `234${normalized.slice(1)}`;
  } else if (normalized.startsWith("234") && normalized.length === 13) {
    // already ok
  } else if (normalized.length === 10) {
    normalized = `234${normalized}`;
  } else {
    return null;
  }

  if (!/^234[789]\d{9}$/.test(normalized)) {
    return null;
  }

  return normalized;
}

function termiiBaseUrl() {
  return (
    process.env.TERMII_BASE_URL?.replace(/\/$/, "") ||
    "https://api.ng.termii.com"
  );
}

function isSmsEnabled() {
  return (process.env.NOTIFY_SMS || "false").toLowerCase() === "true";
}

function isWhatsappEnabled() {
  return (process.env.NOTIFY_WHATSAPP || "false").toLowerCase() === "true";
}

export async function sendTermiiSms(params: {
  to: string;
  message: string;
}): Promise<{ ok: boolean; id?: string; error?: string; skipped?: boolean }> {
  if (!isSmsEnabled()) {
    return { ok: true, skipped: true };
  }

  const apiKey = process.env.TERMII_API_KEY;
  const from = process.env.TERMII_SENDER_ID;

  if (!apiKey || !from) {
    return {
      ok: false,
      error: "TERMII_API_KEY or TERMII_SENDER_ID is missing.",
    };
  }

  const to = normalizeNgPhone(params.to);

  if (!to) {
    return { ok: false, error: "Invalid phone number." };
  }

  try {
    const response = await fetch(`${termiiBaseUrl()}/api/sms/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: apiKey,
        to,
        from,
        sms: params.message,
        type: "plain",
        channel: "generic",
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return {
        ok: false,
        error:
          data?.message ||
          data?.error ||
          `Termii SMS failed (${response.status})`,
      };
    }

    return {
      ok: true,
      id: String(data?.message_id || data?.messageId || data?.code || ""),
    };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error ? error.message : "Termii SMS request failed.",
    };
  }
}

export async function sendTermiiWhatsApp(params: {
  to: string;
  message: string;
}): Promise<{ ok: boolean; id?: string; error?: string; skipped?: boolean }> {
  if (!isWhatsappEnabled()) {
    return { ok: true, skipped: true };
  }

  const apiKey = process.env.TERMII_API_KEY;
  const from = process.env.TERMII_WHATSAPP_FROM || process.env.TERMII_SENDER_ID;

  if (!apiKey || !from) {
    return {
      ok: false,
      error: "TERMII_API_KEY or TERMII_WHATSAPP_FROM is missing.",
    };
  }

  const to = normalizeNgPhone(params.to);

  if (!to) {
    return { ok: false, error: "Invalid phone number." };
  }

  try {
    // Termii WhatsApp messaging endpoint (device / media channel).
    const response = await fetch(`${termiiBaseUrl()}/api/sms/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: apiKey,
        to,
        from,
        sms: params.message,
        type: "plain",
        channel: "whatsapp",
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return {
        ok: false,
        error:
          data?.message ||
          data?.error ||
          `Termii WhatsApp failed (${response.status})`,
      };
    }

    return {
      ok: true,
      id: String(data?.message_id || data?.messageId || data?.code || ""),
    };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Termii WhatsApp request failed.",
    };
  }
}

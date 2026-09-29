import { getSupabaseAdmin } from "@/lib/supabase-admin";
import {
  DEFAULT_PLATFORM_COMMISSION_PERCENT,
} from "@/lib/ride-with-701";

const COMMISSION_KEY = "ride_platform_commission";

/**
 * Reads the configurable RTS share of a delivery partner's gross earning.
 * Falls back to env RIDE_PLATFORM_COMMISSION then 5.
 */
export async function getRidePlatformCommissionPercent(): Promise<number> {
  const fromEnv = Number(process.env.RIDE_PLATFORM_COMMISSION);
  if (Number.isFinite(fromEnv) && fromEnv >= 0 && fromEnv <= 100) {
    // Prefer DB when available; env is a boot fallback only if DB fails.
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data } = await supabase
      .from("platform_settings")
      .select("value")
      .eq("key", COMMISSION_KEY)
      .maybeSingle();

    const parsed = Number(data?.value);
    if (Number.isFinite(parsed) && parsed >= 0 && parsed <= 100) {
      return parsed;
    }
  } catch {
    // Table may not exist yet — use env/default.
  }

  if (Number.isFinite(fromEnv) && fromEnv >= 0 && fromEnv <= 100) {
    return fromEnv;
  }

  return DEFAULT_PLATFORM_COMMISSION_PERCENT;
}

export async function setRidePlatformCommissionPercent(
  percent: number
): Promise<{ ok: boolean; message?: string }> {
  const value = Math.min(100, Math.max(0, Math.round(Number(percent))));
  if (!Number.isFinite(value)) {
    return { ok: false, message: "Enter a valid commission percent." };
  }

  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("platform_settings").upsert(
      {
        key: COMMISSION_KEY,
        value: String(value),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "key" }
    );

    if (error) {
      return { ok: false, message: error.message };
    }

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to save commission setting.",
    };
  }
}

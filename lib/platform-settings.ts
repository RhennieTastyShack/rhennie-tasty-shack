import { getSupabaseAdmin } from "@/lib/supabase-admin";
import {
  DEFAULT_PLATFORM_COMMISSION_PERCENT,
  VEHICLE_PRICING,
  type VehicleCategory,
  type VehiclePricingProfile,
} from "@/lib/ride-with-701";

const COMMISSION_KEY = "ride_platform_commission";

/**
 * Reads the configurable RTS share of a delivery partner's gross earning.
 * Falls back to env RIDE_PLATFORM_COMMISSION then 5.
 */
export async function getRidePlatformCommissionPercent(): Promise<number> {
  const fromEnv = Number(process.env.RIDE_PLATFORM_COMMISSION);

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

function rowToProfile(row: Record<string, unknown>): VehiclePricingProfile | null {
  const category = String(row.category || "") as VehicleCategory;
  if (!(category in VEHICLE_PRICING)) return null;

  return {
    category,
    label: String(row.label || VEHICLE_PRICING[category].label),
    baseFeeNgn: Math.max(0, Math.round(Number(row.base_fee_ngn) || 0)),
    perKmNgn: Math.max(0, Math.round(Number(row.per_km_ngn) || 0)),
    minimumFeeNgn: Math.max(0, Math.round(Number(row.minimum_fee_ngn) || 0)),
    minimumPartnerEarningNgn: Math.max(
      0,
      Math.round(Number(row.minimum_partner_earning_ngn) || 0)
    ),
    maxDistanceKm: Math.max(1, Number(row.max_distance_km) || 40),
    maxCapacityNote: String(
      row.max_capacity_note || VEHICLE_PRICING[category].maxCapacityNote
    ),
    largeOrderAdjustmentNgn: Math.max(
      0,
      Math.round(Number(row.large_order_adjustment_ngn) || 0)
    ),
    waitingFeePer15MinNgn: Math.max(
      0,
      Math.round(Number(row.waiting_fee_per_15_min_ngn) || 0)
    ),
    surgeMultiplier: Math.max(1, Number(row.surge_multiplier) || 1),
  };
}

/**
 * Vehicle pricing catalog from delivery_vehicle_pricing, merged over code defaults.
 */
export async function getVehiclePricingCatalog(): Promise<
  Record<VehicleCategory, VehiclePricingProfile>
> {
  const catalog: Record<VehicleCategory, VehiclePricingProfile> = {
    ...VEHICLE_PRICING,
  };

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("delivery_vehicle_pricing")
      .select("*");

    if (error || !data?.length) {
      return catalog;
    }

    for (const row of data) {
      const profile = rowToProfile(row as Record<string, unknown>);
      if (profile) {
        catalog[profile.category] = profile;
      }
    }
  } catch {
    // Table may not exist yet.
  }

  return catalog;
}

export async function upsertVehiclePricingProfile(
  profile: VehiclePricingProfile
): Promise<{ ok: boolean; message?: string }> {
  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("delivery_vehicle_pricing").upsert(
      {
        category: profile.category,
        label: profile.label,
        base_fee_ngn: profile.baseFeeNgn,
        per_km_ngn: profile.perKmNgn,
        minimum_fee_ngn: profile.minimumFeeNgn,
        minimum_partner_earning_ngn: profile.minimumPartnerEarningNgn,
        max_distance_km: profile.maxDistanceKm,
        max_capacity_note: profile.maxCapacityNote,
        large_order_adjustment_ngn: profile.largeOrderAdjustmentNgn,
        waiting_fee_per_15_min_ngn: profile.waitingFeePer15MinNgn,
        surge_multiplier: profile.surgeMultiplier,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "category" }
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
          : "Unable to save vehicle pricing.",
    };
  }
}

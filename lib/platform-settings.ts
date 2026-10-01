import { getSupabaseAdmin } from "@/lib/supabase-admin";
import {
  DEFAULT_PLATFORM_COMMISSION_PERCENT,
  DEFAULT_RIDE_BASE_LOCATION,
  DEFAULT_RIDE_SERVICE_LOCATIONS,
  DEFAULT_STARTING_DELIVERY_FEE_NGN,
  VEHICLE_PRICING,
  type VehicleCategory,
  type VehiclePricingProfile,
} from "@/lib/ride-with-701";

const COMMISSION_KEY = "ride_platform_commission";
const BASE_LOCATION_KEY = "ride_base_location";
const SERVICE_LOCATIONS_KEY = "ride_service_locations";
const STARTING_FEE_KEY = "ride_starting_fee_ngn";
const SURGE_KEY = "ride_surge_config";
const WAITING_KEY = "ride_waiting_config";

export type RideSurgeConfig = {
  enabled: boolean;
  multiplier: number;
  reason: string;
  startsAt: string | null;
  endsAt: string | null;
  areas: string;
  vehicleCategories: string;
};

export type RideWaitingConfig = {
  enabled: boolean;
  freeWaitingMinutes: number;
  feePerMinuteNgn: number;
  maxFeeNgn: number;
};

export const DEFAULT_SURGE_CONFIG: RideSurgeConfig = {
  enabled: false,
  multiplier: 1,
  reason: "",
  startsAt: null,
  endsAt: null,
  areas: "",
  vehicleCategories: "",
};

export const DEFAULT_WAITING_CONFIG: RideWaitingConfig = {
  enabled: true,
  freeWaitingMinutes: 10,
  feePerMinuteNgn: 40,
  maxFeeNgn: 2000,
};

async function readSetting(key: string): Promise<string | null> {
  try {
    const supabase = getSupabaseAdmin();
    const { data } = await supabase
      .from("platform_settings")
      .select("value")
      .eq("key", key)
      .maybeSingle();
    return data?.value != null ? String(data.value) : null;
  } catch {
    return null;
  }
}

async function writeSetting(
  key: string,
  value: string
): Promise<{ ok: boolean; message?: string }> {
  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("platform_settings").upsert(
      {
        key,
        value,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "key" }
    );
    if (error) return { ok: false, message: error.message };
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : "Unable to save setting.",
    };
  }
}

export async function getRideBaseLocation(): Promise<string> {
  const value = (await readSetting(BASE_LOCATION_KEY))?.trim();
  return value || DEFAULT_RIDE_BASE_LOCATION;
}

export async function setRideBaseLocation(location: string) {
  const value = String(location || "").trim() || DEFAULT_RIDE_BASE_LOCATION;
  return writeSetting(BASE_LOCATION_KEY, value);
}

function parseServiceLocations(raw: string | null): string[] {
  if (!raw?.trim()) return [...DEFAULT_RIDE_SERVICE_LOCATIONS];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      const list = parsed
        .map((item) => String(item || "").trim())
        .filter(Boolean);
      return list.length ? list : [...DEFAULT_RIDE_SERVICE_LOCATIONS];
    }
  } catch {
    // Allow newline / semicolon separated plain text.
  }
  const list = raw
    .split(/\n|;/)
    .map((part) => part.trim())
    .filter(Boolean);
  return list.length ? list : [...DEFAULT_RIDE_SERVICE_LOCATIONS];
}

export async function getRideServiceLocations(): Promise<string[]> {
  const raw = await readSetting(SERVICE_LOCATIONS_KEY);
  const locations = parseServiceLocations(raw);
  const base = await getRideBaseLocation();
  if (!locations.some((item) => item.toLowerCase() === base.toLowerCase())) {
    return [base, ...locations];
  }
  return locations;
}

export async function setRideServiceLocations(locations: string[]) {
  const list = (Array.isArray(locations) ? locations : [])
    .map((item) => String(item || "").trim())
    .filter(Boolean);
  const value = JSON.stringify(
    list.length ? list : [...DEFAULT_RIDE_SERVICE_LOCATIONS]
  );
  return writeSetting(SERVICE_LOCATIONS_KEY, value);
}

export async function getRideStartingFeeNgn(): Promise<number> {
  const parsed = Number(await readSetting(STARTING_FEE_KEY));
  if (Number.isFinite(parsed) && parsed >= 0) return Math.round(parsed);
  return DEFAULT_STARTING_DELIVERY_FEE_NGN;
}

export async function setRideStartingFeeNgn(amount: number) {
  const value = Math.max(0, Math.round(Number(amount) || 0));
  return writeSetting(STARTING_FEE_KEY, String(value));
}

export async function getRideSurgeConfig(): Promise<RideSurgeConfig> {
  const raw = await readSetting(SURGE_KEY);
  if (!raw) return { ...DEFAULT_SURGE_CONFIG };
  try {
    const parsed = JSON.parse(raw) as Partial<RideSurgeConfig>;
    return {
      enabled: Boolean(parsed.enabled),
      multiplier: Math.max(1, Number(parsed.multiplier) || 1),
      reason: String(parsed.reason || ""),
      startsAt: parsed.startsAt ? String(parsed.startsAt) : null,
      endsAt: parsed.endsAt ? String(parsed.endsAt) : null,
      areas: String(parsed.areas || ""),
      vehicleCategories: String(parsed.vehicleCategories || ""),
    };
  } catch {
    return { ...DEFAULT_SURGE_CONFIG };
  }
}

export async function setRideSurgeConfig(config: RideSurgeConfig) {
  const value: RideSurgeConfig = {
    enabled: Boolean(config.enabled),
    multiplier: Math.max(1, Number(config.multiplier) || 1),
    reason: String(config.reason || "").trim(),
    startsAt: config.startsAt ? String(config.startsAt) : null,
    endsAt: config.endsAt ? String(config.endsAt) : null,
    areas: String(config.areas || "").trim(),
    vehicleCategories: String(config.vehicleCategories || "").trim(),
  };
  return writeSetting(SURGE_KEY, JSON.stringify(value));
}

export function isSurgeActiveNow(
  config: RideSurgeConfig,
  options?: { vehicleCategory?: string | null; address?: string | null }
): boolean {
  if (!config.enabled || config.multiplier <= 1) return false;
  const now = Date.now();
  if (config.startsAt) {
    const start = Date.parse(config.startsAt);
    if (Number.isFinite(start) && now < start) return false;
  }
  if (config.endsAt) {
    const end = Date.parse(config.endsAt);
    if (Number.isFinite(end) && now > end) return false;
  }
  if (config.vehicleCategories.trim() && options?.vehicleCategory) {
    const allowed = config.vehicleCategories
      .split(",")
      .map((part) => part.trim().toLowerCase())
      .filter(Boolean);
    if (
      allowed.length &&
      !allowed.includes(String(options.vehicleCategory).toLowerCase())
    ) {
      return false;
    }
  }
  if (config.areas.trim() && options?.address) {
    const areas = config.areas
      .split(",")
      .map((part) => part.trim().toLowerCase())
      .filter(Boolean);
    const address = String(options.address).toLowerCase();
    if (areas.length && !areas.some((area) => address.includes(area))) {
      return false;
    }
  }
  return true;
}

export async function getRideWaitingConfig(): Promise<RideWaitingConfig> {
  const raw = await readSetting(WAITING_KEY);
  if (!raw) return { ...DEFAULT_WAITING_CONFIG };
  try {
    const parsed = JSON.parse(raw) as Partial<RideWaitingConfig>;
    return {
      enabled: parsed.enabled !== false,
      freeWaitingMinutes: Math.max(
        0,
        Math.round(Number(parsed.freeWaitingMinutes) || 0)
      ),
      feePerMinuteNgn: Math.max(
        0,
        Math.round(Number(parsed.feePerMinuteNgn) || 0)
      ),
      maxFeeNgn: Math.max(0, Math.round(Number(parsed.maxFeeNgn) || 0)),
    };
  } catch {
    return { ...DEFAULT_WAITING_CONFIG };
  }
}

export async function setRideWaitingConfig(config: RideWaitingConfig) {
  const value: RideWaitingConfig = {
    enabled: Boolean(config.enabled),
    freeWaitingMinutes: Math.max(
      0,
      Math.round(Number(config.freeWaitingMinutes) || 0)
    ),
    feePerMinuteNgn: Math.max(
      0,
      Math.round(Number(config.feePerMinuteNgn) || 0)
    ),
    maxFeeNgn: Math.max(0, Math.round(Number(config.maxFeeNgn) || 0)),
  };
  return writeSetting(WAITING_KEY, JSON.stringify(value));
}

/**
 * Reads the configurable RTS share of a delivery partner's gross earning.
 * Falls back to env RIDE_PLATFORM_COMMISSION then 6.6.
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
  // Allow one decimal place (e.g. 6.6). Do not integer-round.
  const value = Math.min(
    100,
    Math.max(0, Math.round(Number(percent) * 10) / 10)
  );
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
    maxBags: Math.max(
      1,
      Math.round(Number(row.max_bags) || VEHICLE_PRICING[category].maxBags)
    ),
    maxItems: Math.max(
      1,
      Math.round(Number(row.max_items) || VEHICLE_PRICING[category].maxItems)
    ),
    maxWeightKg: Math.max(
      1,
      Number(row.max_weight_kg) || VEHICLE_PRICING[category].maxWeightKg
    ),
    maxVolumeLitres: Math.max(
      1,
      Number(row.max_volume_litres) ||
        VEHICLE_PRICING[category].maxVolumeLitres
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
        max_bags: profile.maxBags,
        max_items: profile.maxItems,
        max_weight_kg: profile.maxWeightKg,
        max_volume_litres: profile.maxVolumeLitres,
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

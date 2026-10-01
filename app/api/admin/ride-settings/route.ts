import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, requireAdmin } from "@/lib/supabase-admin";
import {
  getRideBaseLocation,
  getRidePlatformCommissionPercent,
  getRideServiceLocations,
  getRideStartingFeeNgn,
  getRideSurgeConfig,
  getRideWaitingConfig,
  getVehiclePricingCatalog,
  isSurgeActiveNow,
  setRideBaseLocation,
  setRidePlatformCommissionPercent,
  setRideServiceLocations,
  setRideStartingFeeNgn,
  setRideSurgeConfig,
  setRideWaitingConfig,
  upsertVehiclePricingProfile,
  type RideSurgeConfig,
  type RideWaitingConfig,
} from "@/lib/platform-settings";
import {
  DEFAULT_PLATFORM_COMMISSION_PERCENT,
  DEFAULT_RIDE_BASE_LOCATION,
  DEFAULT_RIDE_SERVICE_LOCATIONS,
  DEFAULT_STARTING_DELIVERY_FEE_NGN,
  normalizeVehicleCategory,
  type VehiclePricingProfile,
} from "@/lib/ride-with-701";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Please sign in." },
        { status: 401 }
      );
    }

    const [
      percent,
      catalog,
      baseLocation,
      serviceLocations,
      startingFee,
      surge,
      waiting,
    ] = await Promise.all([
      getRidePlatformCommissionPercent(),
      getVehiclePricingCatalog(),
      getRideBaseLocation(),
      getRideServiceLocations(),
      getRideStartingFeeNgn(),
      getRideSurgeConfig(),
      getRideWaitingConfig(),
    ]);

    return NextResponse.json({
      success: true,
      ride_platform_commission: percent,
      default_percent: DEFAULT_PLATFORM_COMMISSION_PERCENT,
      vehicle_pricing: Object.values(catalog),
      ride_base_location: baseLocation,
      default_base_location: DEFAULT_RIDE_BASE_LOCATION,
      ride_service_locations: serviceLocations,
      default_service_locations: [...DEFAULT_RIDE_SERVICE_LOCATIONS],
      ride_starting_fee_ngn: startingFee,
      default_starting_fee_ngn: DEFAULT_STARTING_DELIVERY_FEE_NGN,
      surge,
      surge_active: isSurgeActiveNow(surge),
      waiting,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to load Ride with 701 settings.",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message: "Only Rhennie Studio can change Ride with 701 settings.",
        },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => ({}));

    if (
      body?.ride_base_location != null ||
      body?.ride_service_locations != null ||
      body?.ride_starting_fee_ngn != null
    ) {
      if (body?.ride_base_location != null) {
        const result = await setRideBaseLocation(
          String(body.ride_base_location)
        );
        if (!result.ok) {
          return NextResponse.json(
            { success: false, message: result.message },
            { status: 400 }
          );
        }
      }

      if (body?.ride_service_locations != null) {
        const raw = body.ride_service_locations;
        const list = Array.isArray(raw)
          ? raw.map((item) => String(item || "").trim()).filter(Boolean)
          : String(raw || "")
              .split(/\n|;/)
              .map((item) => item.trim())
              .filter(Boolean);
        const result = await setRideServiceLocations(list);
        if (!result.ok) {
          return NextResponse.json(
            { success: false, message: result.message },
            { status: 400 }
          );
        }
      }

      if (body?.ride_starting_fee_ngn != null) {
        const result = await setRideStartingFeeNgn(
          Number(body.ride_starting_fee_ngn)
        );
        if (!result.ok) {
          return NextResponse.json(
            { success: false, message: result.message },
            { status: 400 }
          );
        }
      }

      return NextResponse.json({
        success: true,
        ride_base_location: await getRideBaseLocation(),
        ride_service_locations: await getRideServiceLocations(),
        ride_starting_fee_ngn: await getRideStartingFeeNgn(),
        message: "Ride with 701 location and pricing settings updated.",
      });
    }

    if (body?.surge != null) {
      const raw = body.surge as Partial<RideSurgeConfig>;
      const current = await getRideSurgeConfig();
      const next: RideSurgeConfig = {
        enabled: raw.enabled != null ? Boolean(raw.enabled) : current.enabled,
        multiplier: Math.max(
          1,
          Number(raw.multiplier ?? current.multiplier) || 1
        ),
        reason: String(raw.reason ?? current.reason),
        startsAt:
          raw.startsAt !== undefined
            ? raw.startsAt
              ? String(raw.startsAt)
              : null
            : current.startsAt,
        endsAt:
          raw.endsAt !== undefined
            ? raw.endsAt
              ? String(raw.endsAt)
              : null
            : current.endsAt,
        areas: String(raw.areas ?? current.areas),
        vehicleCategories: String(
          raw.vehicleCategories ?? current.vehicleCategories
        ),
      };
      const result = await setRideSurgeConfig(next);
      if (!result.ok) {
        return NextResponse.json(
          { success: false, message: result.message },
          { status: 400 }
        );
      }
      return NextResponse.json({
        success: true,
        surge: next,
        surge_active: isSurgeActiveNow(next),
        message: "Surge pricing settings updated.",
      });
    }

    if (body?.waiting != null) {
      const raw = body.waiting as Partial<RideWaitingConfig>;
      const current = await getRideWaitingConfig();
      const next: RideWaitingConfig = {
        enabled: raw.enabled != null ? Boolean(raw.enabled) : current.enabled,
        freeWaitingMinutes: Math.max(
          0,
          Math.round(
            Number(raw.freeWaitingMinutes ?? current.freeWaitingMinutes) || 0
          )
        ),
        feePerMinuteNgn: Math.max(
          0,
          Math.round(
            Number(raw.feePerMinuteNgn ?? current.feePerMinuteNgn) || 0
          )
        ),
        maxFeeNgn: Math.max(
          0,
          Math.round(Number(raw.maxFeeNgn ?? current.maxFeeNgn) || 0)
        ),
      };
      const result = await setRideWaitingConfig(next);
      if (!result.ok) {
        return NextResponse.json(
          { success: false, message: result.message },
          { status: 400 }
        );
      }
      return NextResponse.json({
        success: true,
        waiting: next,
        message: "Waiting fee settings updated.",
      });
    }

    if (body?.vehicle_pricing) {
      const raw = body.vehicle_pricing as Partial<VehiclePricingProfile>;
      const category = normalizeVehicleCategory(raw.category);
      const catalog = await getVehiclePricingCatalog();
      const current = catalog[category];

      const profile: VehiclePricingProfile = {
        category,
        label: String(raw.label || current.label),
        baseFeeNgn: Math.max(
          0,
          Math.round(Number(raw.baseFeeNgn ?? current.baseFeeNgn) || 0)
        ),
        perKmNgn: Math.max(
          0,
          Math.round(Number(raw.perKmNgn ?? current.perKmNgn) || 0)
        ),
        minimumFeeNgn: Math.max(
          0,
          Math.round(Number(raw.minimumFeeNgn ?? current.minimumFeeNgn) || 0)
        ),
        minimumPartnerEarningNgn: Math.max(
          0,
          Math.round(
            Number(
              raw.minimumPartnerEarningNgn ?? current.minimumPartnerEarningNgn
            ) || 0
          )
        ),
        maxDistanceKm: Math.max(
          1,
          Number(raw.maxDistanceKm ?? current.maxDistanceKm) || 40
        ),
        maxCapacityNote: String(
          raw.maxCapacityNote || current.maxCapacityNote
        ),
        maxBags: Math.max(
          1,
          Math.round(Number(raw.maxBags ?? current.maxBags) || 1)
        ),
        maxItems: Math.max(
          1,
          Math.round(Number(raw.maxItems ?? current.maxItems) || 1)
        ),
        maxWeightKg: Math.max(
          1,
          Number(raw.maxWeightKg ?? current.maxWeightKg) || 1
        ),
        maxVolumeLitres: Math.max(
          1,
          Number(raw.maxVolumeLitres ?? current.maxVolumeLitres) || 1
        ),
        largeOrderAdjustmentNgn: Math.max(
          0,
          Math.round(
            Number(
              raw.largeOrderAdjustmentNgn ?? current.largeOrderAdjustmentNgn
            ) || 0
          )
        ),
        waitingFeePer15MinNgn: Math.max(
          0,
          Math.round(
            Number(
              raw.waitingFeePer15MinNgn ?? current.waitingFeePer15MinNgn
            ) || 0
          )
        ),
        surgeMultiplier: Math.max(
          1,
          Number(raw.surgeMultiplier ?? current.surgeMultiplier) || 1
        ),
      };

      const saved = await upsertVehiclePricingProfile(profile);
      if (!saved.ok) {
        return NextResponse.json(
          { success: false, message: saved.message },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        vehicle_pricing: profile,
        message: `${profile.label} pricing updated.`,
      });
    }

    const percent = Number(body?.ride_platform_commission);
    const result = await setRidePlatformCommissionPercent(percent);
    if (!result.ok) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      ride_platform_commission: Math.min(
        100,
        Math.max(0, Math.round(Number(percent) * 10) / 10)
      ),
      message: "Ride with 701 platform commission updated.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to update Ride with 701 settings.",
      },
      { status: 500 }
    );
  }
}

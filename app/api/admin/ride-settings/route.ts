import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, requireAdmin } from "@/lib/supabase-admin";
import {
  getRidePlatformCommissionPercent,
  getVehiclePricingCatalog,
  setRidePlatformCommissionPercent,
  upsertVehiclePricingProfile,
} from "@/lib/platform-settings";
import {
  DEFAULT_PLATFORM_COMMISSION_PERCENT,
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

    const [percent, catalog] = await Promise.all([
      getRidePlatformCommissionPercent(),
      getVehiclePricingCatalog(),
    ]);

    return NextResponse.json({
      success: true,
      ride_platform_commission: percent,
      default_percent: DEFAULT_PLATFORM_COMMISSION_PERCENT,
      vehicle_pricing: Object.values(catalog),
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
        Math.max(0, Math.round(percent))
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

import { NextResponse } from "next/server";
import {
  getRideBaseLocation,
  getRideServiceLocations,
  getRideStartingFeeNgn,
  getRideSurgeConfig,
  getRideWaitingConfig,
  getVehiclePricingCatalog,
  isSurgeActiveNow,
} from "@/lib/platform-settings";
import { DEFAULT_STARTING_DELIVERY_FEE_NGN } from "@/lib/ride-with-701";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Public Ride with 701 pricing context for checkout quotes (no secrets). */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get("address");
    const vehicleCategory = searchParams.get("vehicle");

    const [
      catalog,
      baseLocation,
      serviceLocations,
      startingFromNgn,
      surge,
      waiting,
    ] = await Promise.all([
      getVehiclePricingCatalog(),
      getRideBaseLocation(),
      getRideServiceLocations(),
      getRideStartingFeeNgn(),
      getRideSurgeConfig(),
      getRideWaitingConfig(),
    ]);

    const surgeActive = isSurgeActiveNow(surge, {
      address,
      vehicleCategory,
    });

    return NextResponse.json({
      success: true,
      starting_from_ngn: startingFromNgn || DEFAULT_STARTING_DELIVERY_FEE_NGN,
      base_location: baseLocation,
      service_locations: serviceLocations,
      vehicle_pricing: Object.values(catalog).map((row) => ({
        category: row.category,
        label: row.label,
        baseFeeNgn: row.baseFeeNgn,
        perKmNgn: row.perKmNgn,
        minimumFeeNgn: row.minimumFeeNgn,
        maxDistanceKm: row.maxDistanceKm,
        surgeMultiplier: row.surgeMultiplier,
      })),
      surge: {
        active: surgeActive,
        multiplier: surgeActive ? surge.multiplier : 1,
        reason: surgeActive ? surge.reason : "",
      },
      waiting: {
        enabled: waiting.enabled,
        freeWaitingMinutes: waiting.freeWaitingMinutes,
        // Fee rates are not shown on initial quote — waiting is post-arrival only.
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to load Ride with 701 pricing.",
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, requireAdmin } from "@/lib/supabase-admin";
import {
  getRidePlatformCommissionPercent,
  setRidePlatformCommissionPercent,
} from "@/lib/platform-settings";
import { DEFAULT_PLATFORM_COMMISSION_PERCENT } from "@/lib/ride-with-701";

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

    const percent = await getRidePlatformCommissionPercent();

    return NextResponse.json({
      success: true,
      ride_platform_commission: percent,
      default_percent: DEFAULT_PLATFORM_COMMISSION_PERCENT,
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
          message: "Only Rhennie Studio can change platform commission.",
        },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => ({}));
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
            : "Unable to save commission setting.",
      },
      { status: 500 }
    );
  }
}

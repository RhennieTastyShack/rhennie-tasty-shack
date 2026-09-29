import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, getSupabaseAdmin } from "@/lib/supabase-admin";
import { getRidePlatformCommissionPercent } from "@/lib/platform-settings";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Rhennie Studio access required." },
        { status: 403 }
      );
    }

    const supabase = getSupabaseAdmin();
    const commissionPercent = await getRidePlatformCommissionPercent();

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const [
      ridersRes,
      deliveriesRes,
      todayRes,
      payoutsRes,
    ] = await Promise.all([
      supabase.from("riders").select("id, status, is_available"),
      supabase
        .from("deliveries")
        .select(
          "id, status, customer_delivery_charge, gross_delivery_earning, platform_commission_amount, partner_net_earning, mode, created_at"
        ),
      supabase
        .from("deliveries")
        .select("id", { count: "exact", head: true })
        .gte("created_at", startOfDay.toISOString()),
      supabase
        .from("rider_payouts")
        .select("id, amount, status, delivery_fee, tip_amount"),
    ]);

    const riders = ridersRes.data || [];
    const deliveries = deliveriesRes.data || [];
    const payouts = payoutsRes.data || [];

    const platformDeliveries = deliveries.filter(
      (row) => row.mode === "PLATFORM"
    );

    const foodOrders = await supabase
      .from("orders")
      .select("subtotal, total, delivery_fee, payment_status")
      .in("payment_status", ["paid", "success", "SUCCESS", "PAID"]);

    const paidOrders = foodOrders.data || [];
    const foodRevenue = paidOrders.reduce(
      (sum, row) =>
        sum +
        Math.max(
          0,
          Number(row.subtotal ?? Number(row.total || 0) - Number(row.delivery_fee || 0))
        ),
      0
    );

    const deliveryVolume = platformDeliveries.reduce(
      (sum, row) =>
        sum +
        Number(
          row.customer_delivery_charge ??
            row.gross_delivery_earning ??
            0
        ),
      0
    );

    const commissionEarned = platformDeliveries.reduce(
      (sum, row) => sum + Number(row.platform_commission_amount || 0),
      0
    );

    const partnerGross = deliveryVolume;
    const partnerNet = platformDeliveries.reduce(
      (sum, row) => sum + Number(row.partner_net_earning || 0),
      0
    );

    const pendingPayouts = payouts
      .filter((row) => String(row.status || "").toLowerCase() === "pending")
      .reduce((sum, row) => sum + Number(row.amount || 0), 0);

    const completedPayouts = payouts
      .filter((row) => String(row.status || "").toLowerCase() === "paid")
      .reduce((sum, row) => sum + Number(row.amount || 0), 0);

    return NextResponse.json({
      success: true,
      ride_platform_commission: commissionPercent,
      totals: {
        registered_partners: riders.length,
        pending_verification: riders.filter((r) => r.status === "PENDING")
          .length,
        approved_partners: riders.filter((r) => r.status === "APPROVED")
          .length,
        online_partners: riders.filter(
          (r) => r.status === "APPROVED" && r.is_available
        ).length,
        suspended_partners: riders.filter((r) => r.status === "SUSPENDED")
          .length,
        deliveries_today: todayRes.count || 0,
        deliveries_in_progress: deliveries.filter((d) =>
          ["UNASSIGNED", "ASSIGNED", "PICKED_UP", "ON_THE_WAY"].includes(
            d.status
          )
        ).length,
        completed_deliveries: deliveries.filter((d) => d.status === "DELIVERED")
          .length,
        food_revenue: foodRevenue,
        delivery_volume: deliveryVolume,
        platform_commission_earned: commissionEarned,
        partner_gross_earnings: partnerGross,
        partner_net_earnings: partnerNet,
        pending_partner_payouts: pendingPayouts,
        completed_partner_payouts: completedPayouts,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to load Ride with 701 finance summary.",
      },
      { status: 500 }
    );
  }
}

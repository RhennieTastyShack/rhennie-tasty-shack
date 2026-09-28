import {
  notifyCustomer,
  trackingUrlForToken,
} from "@/lib/notify";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

/**
 * Fire-and-forget order paid notifications.
 * Safe to call after payment is marked paid.
 */
export async function notifyOrderPaid(orderId: string) {
  try {
    const supabase = getSupabaseAdmin();

    const { data: order } = await supabase
      .from("orders")
      .select(
        `
        id,
        order_no,
        order_number,
        customer_id,
        customer_name,
        customer_email,
        customer_phone,
        total,
        amount,
        delivery_type
      `
      )
      .eq("id", orderId)
      .maybeSingle();

    if (!order) return;

    const { data: delivery } = await supabase
      .from("deliveries")
      .select("tracking_token")
      .eq("order_id", orderId)
      .maybeSingle();

    const trackingUrl = delivery?.tracking_token
      ? trackingUrlForToken(delivery.tracking_token)
      : null;

    await notifyCustomer({
      event: "ORDER_PAID",
      authUserId: order.customer_id || null,
      email: order.customer_email,
      phone: order.customer_phone,
      name: order.customer_name,
      data: {
        orderNo: order.order_no || order.order_number,
        total: order.total ?? order.amount,
        trackingUrl,
      },
    });
  } catch (error) {
    console.error("notifyOrderPaid failed:", error);
  }
}

export async function notifyOrderStatusChange(order: {
  id: string;
  order_no?: string | null;
  order_number?: string | null;
  customer_id?: string | null;
  customer_email?: string | null;
  customer_phone?: string | null;
  customer_name?: string | null;
  status: string;
}) {
  try {
    await notifyCustomer({
      event: "ORDER_STATUS",
      authUserId: order.customer_id || null,
      email: order.customer_email,
      phone: order.customer_phone,
      name: order.customer_name,
      data: {
        orderNo: order.order_no || order.order_number,
        status: order.status,
      },
    });
  } catch (error) {
    console.error("notifyOrderStatusChange failed:", error);
  }
}

export async function notifyDeliveryStatusChange(deliveryId: string) {
  try {
    const supabase = getSupabaseAdmin();

    const { data: delivery } = await supabase
      .from("deliveries")
      .select(
        `
        id,
        status,
        tracking_token,
        external_rider_name,
        riders (
          full_name
        ),
        orders (
          id,
          order_no,
          order_number,
          customer_id,
          customer_name,
          customer_email,
          customer_phone
        )
      `
      )
      .eq("id", deliveryId)
      .maybeSingle();

    if (!delivery) return;

    const order = Array.isArray(delivery.orders)
      ? delivery.orders[0]
      : delivery.orders;

    if (!order) return;

    const rider = Array.isArray(delivery.riders)
      ? delivery.riders[0]
      : delivery.riders;

    const riderName =
      rider?.full_name || delivery.external_rider_name || null;

    const trackingUrl = delivery.tracking_token
      ? trackingUrlForToken(delivery.tracking_token)
      : null;

    await notifyCustomer({
      event: "DELIVERY_STATUS",
      authUserId: order.customer_id || null,
      email: order.customer_email,
      phone: order.customer_phone,
      name: order.customer_name,
      data: {
        orderNo: order.order_no || order.order_number,
        status: delivery.status,
        trackingUrl,
        riderName,
      },
    });
  } catch (error) {
    console.error("notifyDeliveryStatusChange failed:", error);
  }
}

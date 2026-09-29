import {
  notifyCustomer,
  trackingUrlForToken,
} from "@/lib/notify";
import { shouldEmailDeliveryStatus } from "@/lib/notify/templates";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

const DEFAULT_PICKUP_LOCATION =
  "Rhennie Tasty Shack kitchen — details on your order confirmation / client portal.";

/**
 * Fire-and-forget payment + order confirmation after payment is verified.
 * Safe to call after payment is marked paid (idempotent via dedupeKey).
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
        subtotal,
        delivery_fee,
        tip_amount,
        delivery_type,
        fulfilment_method,
        payment_status,
        payment_reference,
        pickup_code,
        delivery_address
      `
      )
      .eq("id", orderId)
      .maybeSingle();

    if (!order) return;

    const [{ data: delivery }, { data: items }] = await Promise.all([
      supabase
        .from("deliveries")
        .select("tracking_token, mode")
        .eq("order_id", orderId)
        .maybeSingle(),
      supabase
        .from("order_items")
        .select("name, quantity, unit_price, item_total")
        .eq("order_id", orderId),
    ]);

    const trackingUrl = delivery?.tracking_token
      ? trackingUrlForToken(delivery.tracking_token)
      : null;

    const fulfilment = String(
      order.fulfilment_method ||
        (order.delivery_type === "pickup" ? "pickup" : "ride_with_701")
    );

    const lineItems = (items || []).map((item) => ({
      name: String(item.name || "Item"),
      quantity: Number(item.quantity) || 1,
      unitPrice: item.unit_price,
      lineTotal: item.item_total,
    }));

    await notifyCustomer({
      event: "ORDER_PAID",
      authUserId: order.customer_id || null,
      email: order.customer_email,
      phone: order.customer_phone,
      name: order.customer_name,
      dedupeKey: `ORDER_PAID:${order.id}`,
      data: {
        orderNo: order.order_no || order.order_number,
        total: order.total ?? order.amount,
        subtotal: order.subtotal,
        deliveryFee: order.delivery_fee,
        tipAmount: order.tip_amount,
        fulfilmentMethod: fulfilment,
        deliveryType: order.delivery_type,
        paymentStatus: order.payment_status || "paid",
        paymentReference: order.payment_reference,
        pickupCode:
          fulfilment === "pickup" || fulfilment === "own_rider"
            ? order.pickup_code
            : null,
        pickupLocation:
          fulfilment === "pickup" || fulfilment === "own_rider"
            ? DEFAULT_PICKUP_LOCATION
            : null,
        items: lineItems,
        trackingUrl:
          fulfilment === "ride_with_701" || delivery?.mode === "PLATFORM"
            ? trackingUrl
            : null,
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
    const status = String(order.status || "").toUpperCase();
    const meaningful = new Set([
      "CONFIRMED",
      "PREPARING",
      "OUT FOR DELIVERY",
      "COMPLETED",
      "READY FOR PICKUP",
    ]);

    if (!meaningful.has(status)) {
      return;
    }

    await notifyCustomer({
      event: "ORDER_STATUS",
      authUserId: order.customer_id || null,
      email: order.customer_email,
      phone: order.customer_phone,
      name: order.customer_name,
      dedupeKey: `ORDER_STATUS:${order.id}:${status}`,
      data: {
        orderNo: order.order_no || order.order_number,
        status: order.status,
      },
    });
  } catch (error) {
    console.error("notifyOrderStatusChange failed:", error);
  }
}

export async function notifyPickupReady(orderId: string) {
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
        pickup_code,
        fulfilment_method,
        delivery_type,
        pickup_status
      `
      )
      .eq("id", orderId)
      .maybeSingle();

    if (!order) return;

    const fulfilment = String(
      order.fulfilment_method ||
        (order.delivery_type === "pickup" ? "pickup" : "")
    );

    if (fulfilment !== "pickup" && order.delivery_type !== "pickup") {
      return;
    }

    await notifyCustomer({
      event: "PICKUP_READY",
      authUserId: order.customer_id || null,
      email: order.customer_email,
      phone: order.customer_phone,
      name: order.customer_name,
      dedupeKey: `PICKUP_READY:${order.id}`,
      data: {
        orderNo: order.order_no || order.order_number,
        pickupCode: order.pickup_code,
        pickupLocation: DEFAULT_PICKUP_LOCATION,
        instructions:
          "Bring your secure pickup code. Staff must verify it before releasing food.",
      },
    });
  } catch (error) {
    console.error("notifyPickupReady failed:", error);
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
        mode,
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
          customer_phone,
          fulfilment_method
        )
      `
      )
      .eq("id", deliveryId)
      .maybeSingle();

    if (!delivery) return;

    // Own-rider / customer dispatch is not Ride with 701 logistics email.
    if (String(delivery.mode || "").toUpperCase() === "CUSTOMER_DISPATCH") {
      return;
    }

    if (!shouldEmailDeliveryStatus(delivery.status)) {
      return;
    }

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
      dedupeKey: `DELIVERY_STATUS:${delivery.id}:${String(delivery.status).toUpperCase()}`,
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

export async function notifyPartnerRegistered(rider: {
  id: string;
  auth_user_id?: string | null;
  email?: string | null;
  phone?: string | null;
  full_name?: string | null;
}) {
  try {
    if (!rider.email) return;

    await notifyCustomer({
      event: "PARTNER_REGISTERED",
      authUserId: rider.auth_user_id || null,
      email: rider.email,
      phone: rider.phone,
      name: rider.full_name,
      dedupeKey: `PARTNER_REGISTERED:${rider.id}`,
      skipChannels: ["sms", "whatsapp"],
    });
  } catch (error) {
    console.error("notifyPartnerRegistered failed:", error);
  }
}

export async function notifyPartnerStatusChange(rider: {
  id: string;
  auth_user_id?: string | null;
  email?: string | null;
  phone?: string | null;
  full_name?: string | null;
  status: string;
  notes?: string | null;
}) {
  try {
    if (!rider.email) return;

    const status = String(rider.status || "").toUpperCase();
    const emailable = new Set([
      "APPROVED",
      "REJECTED",
      "SUSPENDED",
      "PENDING",
      "UNDER_REVIEW",
    ]);

    if (!emailable.has(status)) return;

    await notifyCustomer({
      event: "PARTNER_STATUS",
      authUserId: rider.auth_user_id || null,
      email: rider.email,
      phone: rider.phone,
      name: rider.full_name,
      dedupeKey: `PARTNER_STATUS:${rider.id}:${status}`,
      skipChannels: ["sms", "whatsapp"],
      data: {
        status,
        note: rider.notes || null,
      },
    });
  } catch (error) {
    console.error("notifyPartnerStatusChange failed:", error);
  }
}

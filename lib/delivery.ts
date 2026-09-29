export type RiderStatus = "PENDING" | "APPROVED" | "SUSPENDED";

export type DeliveryMode = "CUSTOMER_DISPATCH" | "PLATFORM";

export type DeliveryStatus =
  | "UNASSIGNED"
  | "ASSIGNED"
  | "HEADING_TO_RESTAURANT"
  | "ARRIVED_AT_RESTAURANT"
  | "PICKED_UP"
  | "ON_THE_WAY"
  | "ARRIVED_AT_CUSTOMER"
  | "DELIVERED"
  | "CANCELLED";

export type DeliveryStatusEvent = {
  status: DeliveryStatus;
  at: string;
  note?: string;
  by?: string;
};

export const DELIVERY_STATUS_FLOW: DeliveryStatus[] = [
  "UNASSIGNED",
  "ASSIGNED",
  "HEADING_TO_RESTAURANT",
  "ARRIVED_AT_RESTAURANT",
  "PICKED_UP",
  "ON_THE_WAY",
  "ARRIVED_AT_CUSTOMER",
  "DELIVERED",
];

export const PICKUP_STATUSES = [
  "Preparing",
  "Ready for Pickup",
  "Collected",
] as const;

export type PickupStatus = (typeof PICKUP_STATUSES)[number];

export function createOrderCode() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

export function createTrackingToken() {
  const random = Math.random().toString(36).slice(2, 10);
  const time = Date.now().toString(36);
  return `rts-${time}${random}`;
}

export function buildStatusHistoryEntry(
  status: DeliveryStatus,
  by: string,
  note?: string
): DeliveryStatusEvent {
  return {
    status,
    at: new Date().toISOString(),
    by,
    ...(note ? { note } : {}),
  };
}

export function canAdvanceDeliveryStatus(
  current: DeliveryStatus,
  next: DeliveryStatus
) {
  if (next === "CANCELLED") {
    return current !== "DELIVERED" && current !== "CANCELLED";
  }

  const currentIndex = DELIVERY_STATUS_FLOW.indexOf(current);
  const nextIndex = DELIVERY_STATUS_FLOW.indexOf(next);

  if (currentIndex === -1 || nextIndex === -1) {
    return false;
  }

  return nextIndex === currentIndex + 1 || nextIndex === currentIndex;
}

export function getDeliveryStatusLabel(status: DeliveryStatus | string) {
  switch (status) {
    case "UNASSIGNED":
      return "Searching for Partner";
    case "ASSIGNED":
      return "Partner Assigned";
    case "HEADING_TO_RESTAURANT":
      return "Heading to Restaurant";
    case "ARRIVED_AT_RESTAURANT":
      return "Arrived at Restaurant";
    case "PICKED_UP":
      return "Order Collected";
    case "ON_THE_WAY":
      return "On the Way";
    case "ARRIVED_AT_CUSTOMER":
      return "Arrived at Customer";
    case "DELIVERED":
      return "Delivered";
    case "CANCELLED":
      return "Cancelled";
    default:
      return String(status || "—").replaceAll("_", " ");
  }
}

/** Food order statuses that sync from delivery progress — keep separate otherwise. */
export function foodStatusForDelivery(deliveryStatus: string): string | null {
  if (deliveryStatus === "DELIVERED") return "COMPLETED";
  if (
    deliveryStatus === "PICKED_UP" ||
    deliveryStatus === "ON_THE_WAY" ||
    deliveryStatus === "ARRIVED_AT_CUSTOMER"
  ) {
    return "OUT FOR DELIVERY";
  }
  return null;
}

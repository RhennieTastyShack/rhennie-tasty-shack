export type RiderStatus = "PENDING" | "APPROVED" | "SUSPENDED";

export type DeliveryMode = "CUSTOMER_DISPATCH" | "PLATFORM";

export type DeliveryStatus =
  | "UNASSIGNED"
  | "ASSIGNED"
  | "PICKED_UP"
  | "ON_THE_WAY"
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
  "PICKED_UP",
  "ON_THE_WAY",
  "DELIVERED",
];

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

export function getDeliveryStatusLabel(status: DeliveryStatus) {
  switch (status) {
    case "UNASSIGNED":
      return "Awaiting Rider";
    case "ASSIGNED":
      return "Rider Assigned";
    case "PICKED_UP":
      return "Picked Up";
    case "ON_THE_WAY":
      return "On The Way";
    case "DELIVERED":
      return "Delivered";
    case "CANCELLED":
      return "Cancelled";
    default:
      return status;
  }
}

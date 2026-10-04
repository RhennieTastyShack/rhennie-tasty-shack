export type OrderProgressStep = {
  id: string;
  label: string;
};

export type OrderProgressInput = {
  status?: string | null;
  paymentStatus?: string | null;
  fulfilmentMethod?: string | null;
  deliveryType?: string | null;
  pickupStatus?: string | null;
  deliveryMode?: string | null;
  deliveryStatus?: string | null;
};

function norm(value?: string | null) {
  return String(value || "")
    .trim()
    .toUpperCase()
    .replace(/_/g, " ");
}

export function resolveFulfilmentKind(input: OrderProgressInput) {
  const method = String(input.fulfilmentMethod || "").toLowerCase();
  const deliveryType = String(input.deliveryType || "").toLowerCase();
  const mode = String(input.deliveryMode || "").toUpperCase();

  if (method === "pickup" || deliveryType === "pickup") return "pickup" as const;
  if (
    method === "own_rider" ||
    method === "customer_dispatch" ||
    mode === "CUSTOMER_DISPATCH"
  ) {
    return "own_rider" as const;
  }
  return "ride_with_701" as const;
}

export function fulfilmentLabel(kind: ReturnType<typeof resolveFulfilmentKind>) {
  if (kind === "pickup") return "Customer pickup";
  if (kind === "own_rider") return "Your own rider";
  return "Ride with 701";
}

export function paymentStatusLabel(status?: string | null) {
  const value = norm(status);
  if (!value) return "Pending";
  if (value === "PAID" || value === "SUCCESS" || value === "SUCCESSFUL") {
    return "Paid";
  }
  if (value.includes("FAIL") || value.includes("CANCEL")) return "Failed";
  if (value.includes("PENDING") || value.includes("AWAITING")) return "Pending";
  if (value.includes("REFUND")) return "Refunded";
  return value
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function stepsForFulfilment(
  kind: ReturnType<typeof resolveFulfilmentKind>
): OrderProgressStep[] {
  if (kind === "pickup") {
    return [
      { id: "placed", label: "Order Placed" },
      { id: "confirmed", label: "Confirmed" },
      { id: "preparing", label: "Preparing" },
      { id: "ready", label: "Ready for Pickup" },
      { id: "collected", label: "Collected" },
    ];
  }

  if (kind === "own_rider") {
    return [
      { id: "placed", label: "Order Placed" },
      { id: "confirmed", label: "Confirmed" },
      { id: "preparing", label: "Preparing" },
      { id: "ready", label: "Ready" },
      { id: "picked_up", label: "Picked Up" },
      { id: "completed", label: "Completed" },
    ];
  }

  return [
    { id: "placed", label: "Order Placed" },
    { id: "confirmed", label: "Confirmed" },
    { id: "preparing", label: "Preparing" },
    { id: "ready", label: "Ready" },
    { id: "picked_up", label: "Picked Up" },
    { id: "on_the_way", label: "On the Way" },
    { id: "delivered", label: "Delivered" },
  ];
}

function kitchenIndex(status?: string | null) {
  const value = norm(status);
  if (!value || value === "IN REVIEW" || value === "PENDING") return 0;
  if (value.includes("CANCEL")) return -1;
  if (value.includes("CONFIRM")) return 1;
  if (value.includes("PREPAR")) return 2;
  if (value.includes("READY") || value.includes("PICKUP")) return 3;
  if (value.includes("OUT FOR DELIVERY")) return 4;
  if (value.includes("COMPLETE") || value.includes("DELIVER")) return 5;
  return 0;
}

function pickupIndex(pickupStatus?: string | null, orderStatus?: string | null) {
  const pickup = String(pickupStatus || "").toLowerCase();
  const kitchen = kitchenIndex(orderStatus);
  if (kitchen < 0) return -1;
  if (pickup.includes("collected")) return 4;
  if (pickup.includes("ready")) return 3;
  if (kitchen >= 2 || pickup.includes("prepar")) return 2;
  if (kitchen >= 1) return 1;
  return Math.max(0, kitchen);
}

function rideIndex(
  orderStatus?: string | null,
  deliveryStatus?: string | null
) {
  const kitchen = kitchenIndex(orderStatus);
  if (kitchen < 0) return -1;

  const delivery = String(deliveryStatus || "").toUpperCase();
  if (delivery === "DELIVERED") return 6;
  if (delivery === "ARRIVED_AT_CUSTOMER" || delivery === "ON_THE_WAY") return 5;
  if (delivery === "PICKED_UP") return 4;
  if (
    delivery === "ARRIVED_AT_RESTAURANT" ||
    delivery === "HEADING_TO_RESTAURANT" ||
    delivery === "ASSIGNED"
  ) {
    return Math.max(3, kitchen >= 3 ? 3 : kitchen);
  }

  if (kitchen >= 5) return 6;
  if (kitchen >= 4) return 5;
  if (kitchen >= 3) return 3;
  return kitchen;
}

function ownRiderIndex(
  orderStatus?: string | null,
  pickupStatus?: string | null,
  deliveryStatus?: string | null
) {
  const kitchen = kitchenIndex(orderStatus);
  if (kitchen < 0) return -1;
  const pickup = String(pickupStatus || "").toLowerCase();
  const delivery = String(deliveryStatus || "").toUpperCase();
  if (delivery === "DELIVERED" || kitchen >= 5) return 5;
  if (delivery === "PICKED_UP" || pickup.includes("collected")) return 4;
  if (pickup.includes("ready") || kitchen >= 3) return 3;
  if (kitchen >= 2) return 2;
  if (kitchen >= 1) return 1;
  return 0;
}

export function currentProgressIndex(input: OrderProgressInput) {
  const kind = resolveFulfilmentKind(input);
  if (kind === "pickup") {
    return pickupIndex(input.pickupStatus, input.status);
  }
  if (kind === "own_rider") {
    return ownRiderIndex(
      input.status,
      input.pickupStatus,
      input.deliveryStatus
    );
  }
  return rideIndex(input.status, input.deliveryStatus);
}

export function currentProgressLabel(input: OrderProgressInput) {
  const kind = resolveFulfilmentKind(input);
  const steps = stepsForFulfilment(kind);
  const index = currentProgressIndex(input);
  if (index < 0) return "Cancelled";
  return steps[Math.min(index, steps.length - 1)]?.label || "Order Placed";
}

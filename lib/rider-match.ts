import {
  FOOD_VEHICLE_LADDER,
  normalizeVehicleCategory,
  type VehicleCategory,
} from "@/lib/ride-with-701";

/** Capacity rank — higher may substitute for lower when rules allow. */
const VEHICLE_RANK: VehicleCategory[] = [
  "bicycle",
  "electric_bicycle",
  ...FOOD_VEHICLE_LADDER,
  "other",
];

function rankOf(category: VehicleCategory) {
  const index = VEHICLE_RANK.indexOf(category);
  return index === -1 ? VEHICLE_RANK.indexOf("motorcycle") : index;
}

/**
 * True when a partner's vehicle can take a job that requires `requiredVehicle`.
 * Higher-capacity vehicles may substitute for lower ones on the food ladder.
 */
export function partnerMeetsVehicleRequirement(
  partnerVehicleType: string | null | undefined,
  requiredVehicle: string | null | undefined
) {
  if (!requiredVehicle) return true;

  const partner = normalizeVehicleCategory(partnerVehicleType);
  const required = normalizeVehicleCategory(requiredVehicle);

  if (partner === "other") {
    return required === "other" || required === "motorcycle";
  }

  if (required === "other") {
    return false;
  }

  return rankOf(partner) >= rankOf(required);
}

export function isEligibleDeliveryPartner(rider: {
  status?: string | null;
  is_available?: boolean | null;
  vehicle_type?: string | null;
}, requiredVehicle?: string | null) {
  if (String(rider.status || "").toUpperCase() !== "APPROVED") {
    return false;
  }
  if (!rider.is_available) {
    return false;
  }
  return partnerMeetsVehicleRequirement(rider.vehicle_type, requiredVehicle);
}

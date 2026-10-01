/**
 * Ride with 701 — delivery/logistics brand on the Rhennie Tasty Shack platform.
 * Keep internal DB field names (riders, deliveries) stable; brand in the UI.
 */

export const RIDE_BRAND = {
  name: "Ride with 701",
  tagline: "Move. Deliver. Earn.",
  partnerLabel: "Delivery Partner",
  partnerHeadline: "Partner With Ride With 701",
  joinPath: "/riders/join",
  portalPath: "/riders/portal",
  supportCopy:
    "Whether you ride, drive or deliver, there’s a place for you on Ride With 701.",
} as const;

/** Default RTS platform share of a partner's GROSS delivery earning. Configurable via settings. */
export const DEFAULT_PLATFORM_COMMISSION_PERCENT = 5;

/** Fallback only — override via platform_settings.ride_base_location. */
export const DEFAULT_RIDE_BASE_LOCATION =
  "12 Olorunisola Road, Opp. Alowonle Hotel, Ayobo, Lagos, Nigeria";

/** Fallback operating locations — override via platform_settings.ride_service_locations. */
export const DEFAULT_RIDE_SERVICE_LOCATIONS = [
  "12 Olorunisola Road, Opp. Alowonle Hotel, Ayobo, Lagos, Nigeria",
  "16B Unity Street, Off Kekerejesu, Ikola, Alagbado, Lagos",
] as const;

/** Marketing / starting delivery fee — actual quotes vary by distance & vehicle. */
export const DEFAULT_STARTING_DELIVERY_FEE_NGN = 800;

export type VehicleCategory =
  | "bicycle"
  | "electric_bicycle"
  | "motorcycle"
  | "tricycle"
  | "car"
  | "mini_van"
  | "van"
  | "bus"
  | "other";

export type VehiclePricingProfile = {
  category: VehicleCategory;
  label: string;
  baseFeeNgn: number;
  perKmNgn: number;
  minimumFeeNgn: number;
  minimumPartnerEarningNgn: number;
  maxDistanceKm: number;
  maxCapacityNote: string;
  /** Soft capacity limits used to upgrade vehicle instead of inflating motorcycle price. */
  maxBags: number;
  maxItems: number;
  maxWeightKg: number;
  maxVolumeLitres: number;
  largeOrderAdjustmentNgn: number;
  waitingFeePer15MinNgn: number;
  surgeMultiplier: number;
};

/** Central vehicle pricing defaults. Motorcycle starts from ₦800 + ₦200/km. */
export const VEHICLE_PRICING: Record<VehicleCategory, VehiclePricingProfile> = {
  bicycle: {
    category: "bicycle",
    label: "Bicycle",
    baseFeeNgn: 800,
    perKmNgn: 150,
    minimumFeeNgn: 800,
    minimumPartnerEarningNgn: 700,
    maxDistanceKm: 8,
    maxCapacityNote: "Light parcels only",
    maxBags: 1,
    maxItems: 3,
    maxWeightKg: 5,
    maxVolumeLitres: 8,
    largeOrderAdjustmentNgn: 0,
    waitingFeePer15MinNgn: 100,
    surgeMultiplier: 1,
  },
  electric_bicycle: {
    category: "electric_bicycle",
    label: "Electric Bicycle",
    baseFeeNgn: 800,
    perKmNgn: 170,
    minimumFeeNgn: 800,
    minimumPartnerEarningNgn: 750,
    maxDistanceKm: 12,
    maxCapacityNote: "Light to medium parcels",
    maxBags: 2,
    maxItems: 5,
    maxWeightKg: 8,
    maxVolumeLitres: 12,
    largeOrderAdjustmentNgn: 200,
    waitingFeePer15MinNgn: 100,
    surgeMultiplier: 1,
  },
  motorcycle: {
    category: "motorcycle",
    label: "Motorcycle / Bike",
    baseFeeNgn: 800,
    perKmNgn: 200,
    minimumFeeNgn: 800,
    minimumPartnerEarningNgn: 750,
    maxDistanceKm: 40,
    maxCapacityNote: "Standard food bags",
    maxBags: 4,
    maxItems: 10,
    maxWeightKg: 15,
    maxVolumeLitres: 25,
    largeOrderAdjustmentNgn: 300,
    waitingFeePer15MinNgn: 150,
    surgeMultiplier: 1,
  },
  tricycle: {
    category: "tricycle",
    label: "Tricycle",
    baseFeeNgn: 800,
    perKmNgn: 280,
    minimumFeeNgn: 1400,
    minimumPartnerEarningNgn: 1200,
    maxDistanceKm: 35,
    maxCapacityNote: "Bulk bags and trays",
    maxBags: 8,
    maxItems: 20,
    maxWeightKg: 40,
    maxVolumeLitres: 60,
    largeOrderAdjustmentNgn: 500,
    waitingFeePer15MinNgn: 200,
    surgeMultiplier: 1,
  },
  car: {
    category: "car",
    label: "Car",
    baseFeeNgn: 1500,
    perKmNgn: 350,
    minimumFeeNgn: 2500,
    minimumPartnerEarningNgn: 2200,
    maxDistanceKm: 50,
    maxCapacityNote: "Large orders and catering trays",
    maxBags: 12,
    maxItems: 30,
    maxWeightKg: 60,
    maxVolumeLitres: 100,
    largeOrderAdjustmentNgn: 800,
    waitingFeePer15MinNgn: 250,
    surgeMultiplier: 1,
  },
  mini_van: {
    category: "mini_van",
    label: "Mini Van",
    baseFeeNgn: 2500,
    perKmNgn: 450,
    minimumFeeNgn: 4000,
    minimumPartnerEarningNgn: 3500,
    maxDistanceKm: 60,
    maxCapacityNote: "Event and multi-bag loads",
    maxBags: 20,
    maxItems: 50,
    maxWeightKg: 120,
    maxVolumeLitres: 220,
    largeOrderAdjustmentNgn: 1200,
    waitingFeePer15MinNgn: 300,
    surgeMultiplier: 1,
  },
  van: {
    category: "van",
    label: "Van",
    baseFeeNgn: 3500,
    perKmNgn: 550,
    minimumFeeNgn: 5500,
    minimumPartnerEarningNgn: 4800,
    maxDistanceKm: 80,
    maxCapacityNote: "Full catering and bulk logistics",
    maxBags: 40,
    maxItems: 100,
    maxWeightKg: 250,
    maxVolumeLitres: 500,
    largeOrderAdjustmentNgn: 2000,
    waitingFeePer15MinNgn: 400,
    surgeMultiplier: 1,
  },
  bus: {
    category: "bus",
    label: "Bus",
    baseFeeNgn: 5000,
    perKmNgn: 650,
    minimumFeeNgn: 7000,
    minimumPartnerEarningNgn: 6000,
    maxDistanceKm: 100,
    maxCapacityNote: "Large group catering and bulk logistics",
    maxBags: 60,
    maxItems: 150,
    maxWeightKg: 400,
    maxVolumeLitres: 800,
    largeOrderAdjustmentNgn: 2500,
    waitingFeePer15MinNgn: 500,
    surgeMultiplier: 1,
  },
  other: {
    category: "other",
    label: "Other approved vehicle",
    baseFeeNgn: 800,
    perKmNgn: 200,
    minimumFeeNgn: 800,
    minimumPartnerEarningNgn: 750,
    maxDistanceKm: 40,
    maxCapacityNote: "As approved by Rhennie Studio",
    maxBags: 4,
    maxItems: 10,
    maxWeightKg: 15,
    maxVolumeLitres: 25,
    largeOrderAdjustmentNgn: 300,
    waitingFeePer15MinNgn: 150,
    surgeMultiplier: 1,
  },
};

/** Food delivery upgrade ladder — do not inflate motorcycle rates past capacity. */
export const FOOD_VEHICLE_LADDER: VehicleCategory[] = [
  "motorcycle",
  "tricycle",
  "car",
  "mini_van",
  "van",
  "bus",
];

/** Join-form options. Values persist on riders.vehicle_type. Truck / pickup truck excluded. */
export const VEHICLE_OPTIONS: {
  value: string;
  label: string;
  category: VehicleCategory;
}[] = [
  { value: "bicycle", label: "Bicycle", category: "bicycle" },
  { value: "electric_bicycle", label: "Electric Bicycle", category: "electric_bicycle" },
  { value: "bike", label: "Motorcycle / Bike", category: "motorcycle" },
  { value: "motorcycle", label: "Motorcycle / Bike", category: "motorcycle" },
  { value: "tricycle", label: "Tricycle", category: "tricycle" },
  { value: "car", label: "Car", category: "car" },
  { value: "mini_van", label: "Mini Van", category: "mini_van" },
  { value: "van", label: "Van", category: "van" },
  { value: "bus", label: "Bus", category: "bus" },
  { value: "other", label: "Other approved vehicle", category: "other" },
];

const BLOCKED_VEHICLES = new Set([
  "truck",
  "pickup",
  "pickup_truck",
  "pickup-truck",
  "lorry",
]);

export function normalizeVehicleCategory(
  vehicleType: string | null | undefined
): VehicleCategory {
  const raw = String(vehicleType || "bike").toLowerCase().trim();
  if (BLOCKED_VEHICLES.has(raw)) return "van";
  const match = VEHICLE_OPTIONS.find((option) => option.value === raw);
  if (match) return match.category;
  if (raw === "walk" || raw === "on_foot") return "bicycle";
  if (raw in VEHICLE_PRICING) return raw as VehicleCategory;
  return "motorcycle";
}

export function getVehiclePricing(
  vehicleType: string | null | undefined,
  catalog: Record<VehicleCategory, VehiclePricingProfile> = VEHICLE_PRICING
): VehiclePricingProfile {
  return catalog[normalizeVehicleCategory(vehicleType)];
}

export type DeliveryQuoteInput = {
  distanceKm: number;
  vehicleType?: string | null;
  itemCount?: number;
  bagCount?: number;
  estimatedWeightKg?: number;
  estimatedVolumeLitres?: number;
  waitingBlocks?: number;
  applySurge?: boolean;
  /** Platform surge multiplier when applySurge is true (defaults to vehicle profile). */
  surgeMultiplier?: number;
  /** Optional override catalog (e.g. rows loaded from delivery_vehicle_pricing). */
  catalog?: Record<VehicleCategory, VehiclePricingProfile>;
};

/** Rough bag estimate when the customer does not enter a bag count. */
export function estimateBagCount(itemCount: number) {
  const items = Math.max(0, Math.round(Number(itemCount) || 0));
  if (items <= 0) return 0;
  return Math.max(1, Math.ceil(items / 3));
}

export type OrderLoad = {
  bags: number;
  items: number;
  weightKg: number;
  volumeLitres: number;
};

export function estimateOrderLoad(input: {
  itemCount?: number;
  bagCount?: number;
  estimatedWeightKg?: number;
  estimatedVolumeLitres?: number;
}): OrderLoad {
  const items = Math.max(0, Math.round(Number(input.itemCount) || 0));
  const bags =
    Math.max(0, Math.round(Number(input.bagCount) || 0)) ||
    estimateBagCount(items);
  return {
    bags,
    items,
    weightKg: Math.max(0, Number(input.estimatedWeightKg) || 0),
    volumeLitres: Math.max(0, Number(input.estimatedVolumeLitres) || 0),
  };
}

export function vehicleFitsLoad(
  vehicle: VehiclePricingProfile,
  load: OrderLoad
) {
  return (
    load.bags <= vehicle.maxBags &&
    load.items <= vehicle.maxItems &&
    load.weightKg <= vehicle.maxWeightKg &&
    load.volumeLitres <= vehicle.maxVolumeLitres
  );
}

/**
 * Pick the smallest vehicle on the food ladder that can carry the order.
 * Never inflate motorcycle price past capacity — upgrade the vehicle instead.
 */
export function recommendFoodVehicle(
  loadInput: {
    itemCount?: number;
    bagCount?: number;
    estimatedWeightKg?: number;
    estimatedVolumeLitres?: number;
  },
  catalog: Record<VehicleCategory, VehiclePricingProfile> = VEHICLE_PRICING
): {
  vehicle: VehiclePricingProfile;
  upgraded: boolean;
  load: OrderLoad;
  partnersSuggested: number;
} {
  const load = estimateOrderLoad(loadInput);
  let chosen = catalog.motorcycle;

  for (const category of FOOD_VEHICLE_LADDER) {
    const candidate = catalog[category];
    if (vehicleFitsLoad(candidate, load)) {
      chosen = candidate;
      break;
    }
    chosen = candidate;
  }

  const upgraded = chosen.category !== "motorcycle";
  const partnersSuggested =
    !vehicleFitsLoad(catalog.van, load)
      ? Math.max(2, Math.ceil(load.bags / catalog.motorcycle.maxBags))
      : 1;

  return {
    vehicle: chosen,
    upgraded,
    load,
    partnersSuggested,
  };
}

/**
 * Quote a customer-facing Ride with 701 delivery fee for one vehicle profile.
 * Initial quotes MUST pass waitingBlocks=0 — waiting is post-arrival only.
 * Customer sees ONE delivery amount — never a separate RTS commission line.
 */
export function quoteRideDeliveryFee(input: DeliveryQuoteInput): {
  feeNgn: number;
  distanceKm: number;
  vehicle: VehiclePricingProfile;
  breakdown: {
    base: number;
    distance: number;
    vehicleFee: number;
    largeOrder: number;
    bulk: number;
    surge: number;
    waiting: number;
    beforeSurge: number;
  };
} {
  const vehicle = getVehiclePricing(input.vehicleType, input.catalog);
  const distanceKm = Math.max(0, Number(input.distanceKm) || 0);
  const cappedKm = Math.min(distanceKm, vehicle.maxDistanceKm);

  const base = vehicle.baseFeeNgn;
  const distance = Math.round(cappedKm * vehicle.perKmNgn);
  const items = Math.max(0, Number(input.itemCount) || 0);
  const bags =
    Math.max(0, Number(input.bagCount) || 0) || estimateBagCount(items);
  const weightKg = Math.max(0, Number(input.estimatedWeightKg) || 0);
  const volumeL = Math.max(0, Number(input.estimatedVolumeLitres) || 0);

  const largeOrder =
    bags >= 4 || items >= 8 ? vehicle.largeOrderAdjustmentNgn : 0;

  let bulk = 0;
  if (weightKg >= 25 || volumeL >= 40) {
    bulk += Math.round(vehicle.largeOrderAdjustmentNgn * 1.5);
  } else if (weightKg >= 12 || volumeL >= 20) {
    bulk += vehicle.largeOrderAdjustmentNgn;
  }

  const vehicleFee = largeOrder + bulk;

  // Waiting is NEVER part of the initial booking quote unless explicitly passed
  // after customer-caused waiting has been recorded.
  const waiting =
    Math.max(0, Number(input.waitingBlocks) || 0) *
    vehicle.waitingFeePer15MinNgn;

  const beforeSurge = base + distance + vehicleFee;
  const multiplier = Math.max(
    1,
    Number(input.surgeMultiplier ?? vehicle.surgeMultiplier) || 1
  );
  const surgedTotal = input.applySurge
    ? Math.round(beforeSurge * multiplier)
    : beforeSurge;
  const surge = Math.max(0, surgedTotal - beforeSurge);
  const feeNgn = Math.max(vehicle.minimumFeeNgn, surgedTotal + waiting);

  return {
    feeNgn,
    distanceKm: cappedKm,
    vehicle,
    breakdown: {
      base,
      distance,
      vehicleFee,
      largeOrder,
      bulk,
      surge,
      waiting,
      beforeSurge,
    },
  };
}

/** Customer-caused waiting fee after free period (not used in initial quotes). */
export function calculateWaitingFeeNgn(input: {
  chargeableMinutes: number;
  feePerMinuteNgn: number;
  maxFeeNgn: number;
}) {
  const minutes = Math.max(0, Math.floor(Number(input.chargeableMinutes) || 0));
  const perMin = Math.max(0, Math.round(Number(input.feePerMinuteNgn) || 0));
  const maxFee = Math.max(0, Math.round(Number(input.maxFeeNgn) || 0));
  const raw = minutes * perMin;
  return maxFee > 0 ? Math.min(maxFee, raw) : raw;
}

export function splitDeliveryEarning(
  grossDeliveryFeeNgn: number,
  platformCommissionPercent: number = DEFAULT_PLATFORM_COMMISSION_PERCENT
) {
  const gross = Math.max(0, Math.round(Number(grossDeliveryFeeNgn) || 0));
  const percent = Math.min(
    100,
    Math.max(0, Number(platformCommissionPercent) || 0)
  );
  const platformShare = Math.round((gross * percent) / 100);
  const partnerShare = Math.max(0, gross - platformShare);

  return {
    gross,
    percent,
    platformShare,
    partnerShare,
  };
}

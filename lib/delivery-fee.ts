import {
  getVehiclePricing,
  quoteRideDeliveryFee,
  type VehicleCategory,
  type VehiclePricingProfile,
} from "@/lib/ride-with-701";

export const DELIVERY_FEE_MIN_NGN = 900;
export const DELIVERY_FEE_MAX_NGN = 9900;

/**
 * Kitchen is on the Lagos mainland.
 * Areas map to estimated road kilometres so vehicle profiles (base + ₦/km) can price fairly.
 * Motorcycle reference: fee ≈ ₦500 + ₦200/km (published Ride with 701 bike rates).
 */
const AREA_KM: { phrase: string; km: number }[] = [
  { phrase: "isolo", km: 10 },
  { phrase: "ajao estate", km: 10 },
  { phrase: "mafoluku", km: 10 },
  { phrase: "shogunle", km: 10 },
  { phrase: "oshodi", km: 10 },
  { phrase: "ikeja", km: 10 },
  { phrase: "allen avenue", km: 10 },
  { phrase: "ogba", km: 10 },
  { phrase: "maryland", km: 10 },
  { phrase: "ilupeju", km: 10 },
  { phrase: "anthony", km: 10 },
  { phrase: "gbagada", km: 10 },
  { phrase: "mushin", km: 10 },
  { phrase: "ilasamaja", km: 10 },
  { phrase: "okota", km: 10 },
  { phrase: "surulere", km: 10 },
  { phrase: "ojuelegba", km: 10 },
  { phrase: "yaba", km: 10 },
  { phrase: "ebute metta", km: 10 },
  { phrase: "itire", km: 10 },
  { phrase: "lawanson", km: 10 },

  { phrase: "ejigbo", km: 15 },
  { phrase: "ikotun", km: 15 },
  { phrase: "festac", km: 15 },
  { phrase: "amuwo", km: 15 },
  { phrase: "mile 2", km: 15 },
  { phrase: "apapa", km: 15 },
  { phrase: "ojodu", km: 15 },
  { phrase: "ogudu", km: 15 },
  { phrase: "ojota", km: 15 },
  { phrase: "ketu", km: 15 },
  { phrase: "magodo", km: 15 },
  { phrase: "omole", km: 15 },
  { phrase: "berger", km: 15 },
  { phrase: "agege", km: 15 },
  { phrase: "dopemu", km: 15 },
  { phrase: "egbeda", km: 15 },
  { phrase: "palmgrove", km: 15 },
  { phrase: "somolu", km: 15 },
  { phrase: "shomolu", km: 15 },
  { phrase: "bariga", km: 15 },

  { phrase: "abule egba", km: 20 },
  { phrase: "iyana ipaja", km: 20 },
  { phrase: "igando", km: 20 },
  { phrase: "idimu", km: 20 },
  { phrase: "ipaja", km: 20 },
  { phrase: "alimosho", km: 20 },
  { phrase: "mile 12", km: 20 },
  { phrase: "ikorodu", km: 20 },
  { phrase: "badagry", km: 20 },
  { phrase: "agbara", km: 20 },
  { phrase: "ojo", km: 20 },
  { phrase: "agbado", km: 20 },
  { phrase: "alagbado", km: 20 },

  { phrase: "ikoyi", km: 20 },
  { phrase: "victoria island", km: 25 },
  { phrase: "lagos island", km: 20 },
  { phrase: "oniru", km: 25 },
  { phrase: "lekki phase 1", km: 30 },
  { phrase: "admiralty", km: 30 },

  { phrase: "ikota", km: 35 },
  { phrase: "chevron", km: 35 },
  { phrase: "lekki", km: 35 },
  { phrase: "ajah", km: 40 },

  { phrase: "abraham adesanya", km: 47 },
  { phrase: "sangotedo", km: 47 },
  { phrase: "awoyaya", km: 47 },
  { phrase: "lakowe", km: 47 },
  { phrase: "bogije", km: 47 },
  { phrase: "ibeju", km: 47 },
  { phrase: "epe", km: 47 },
];

const RULES = [...AREA_KM].sort((a, b) => b.phrase.length - a.phrase.length);

export function estimateLagosDistanceKm(address: string): number {
  const normalized = address.toLowerCase().replace(/\s+/g, " ").trim();

  if (!normalized) {
    return 0;
  }

  const match = RULES.find((rule) => {
    const escaped = rule.phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`).test(
      normalized
    );
  });

  return match?.km ?? 10;
}

/** Legacy helper: motorcycle Ride with 701 fee for an address. */
export function getLagosDeliveryFee(address: string) {
  if (!address.trim()) {
    return 0;
  }

  const quote = quoteRideDeliveryFee({
    distanceKm: estimateLagosDistanceKm(address),
    vehicleType: "motorcycle",
  });

  return Math.min(DELIVERY_FEE_MAX_NGN, quote.feeNgn);
}

export type FulfilmentMethod =
  | "ride_with_701"
  | "own_rider"
  | "pickup";

export function getCheckoutDeliveryFee(
  deliveryType: "delivery" | "pickup",
  address = "",
  options?: {
    dispatchMode?: "PLATFORM" | "CUSTOMER_DISPATCH";
    fulfilment?: FulfilmentMethod;
    vehicleType?: string | null;
    itemCount?: number;
    bagCount?: number;
    estimatedWeightKg?: number;
    estimatedVolumeLitres?: number;
    catalog?: Record<VehicleCategory, VehiclePricingProfile>;
  }
) {
  const fulfilment =
    options?.fulfilment ||
    (deliveryType === "pickup"
      ? "pickup"
      : options?.dispatchMode === "CUSTOMER_DISPATCH"
        ? "own_rider"
        : "ride_with_701");

  if (fulfilment !== "ride_with_701") {
    return 0;
  }

  if (!address.trim()) {
    return 0;
  }

  const quote = quoteRideDeliveryFee({
    distanceKm: estimateLagosDistanceKm(address),
    vehicleType: options?.vehicleType || "motorcycle",
    itemCount: options?.itemCount,
    bagCount: options?.bagCount,
    estimatedWeightKg: options?.estimatedWeightKg,
    estimatedVolumeLitres: options?.estimatedVolumeLitres,
    catalog: options?.catalog,
  });

  return Math.min(DELIVERY_FEE_MAX_NGN, quote.feeNgn);
}

export function describeVehicleFeeRange(
  vehicleType: string | null | undefined = "motorcycle"
) {
  const profile = getVehiclePricing(vehicleType);
  const low = quoteRideDeliveryFee({
    distanceKm: 2,
    vehicleType: profile.category,
  }).feeNgn;
  const high = quoteRideDeliveryFee({
    distanceKm: Math.min(20, profile.maxDistanceKm),
    vehicleType: profile.category,
  }).feeNgn;

  return { low, high, category: profile.category as VehicleCategory };
}

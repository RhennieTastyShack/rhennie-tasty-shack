import {
  getVehiclePricing,
  quoteRideDeliveryFee,
  recommendFoodVehicle,
  type VehicleCategory,
  type VehiclePricingProfile,
} from "@/lib/ride-with-701";

export const DELIVERY_FEE_MIN_NGN = 800;
export const DELIVERY_FEE_MAX_NGN = 9900;

/**
 * Distances are estimated road km from the Ride with 701 base
 * (configurable; default Ayobo). Used with vehicle base + ₦/km pricing.
 */
const AREA_KM: { phrase: string; km: number }[] = [
  { phrase: "ayobo", km: 3 },
  { phrase: "olorunisola", km: 2 },
  { phrase: "alagbado", km: 4 },
  { phrase: "ikola", km: 4 },
  { phrase: "kekerejesu", km: 4 },
  { phrase: "command", km: 5 },
  { phrase: "unity street", km: 4 },
  { phrase: "ipaja", km: 6 },
  { phrase: "iyana ipaja", km: 7 },
  { phrase: "egbeda", km: 10 },
  { phrase: "ikotun", km: 12 },
  { phrase: "igando", km: 12 },
  { phrase: "idimu", km: 12 },
  { phrase: "abule egba", km: 14 },
  { phrase: "agege", km: 14 },
  { phrase: "dopemu", km: 14 },
  { phrase: "alimosho", km: 10 },

  { phrase: "isolo", km: 16 },
  { phrase: "ajao estate", km: 16 },
  { phrase: "mafoluku", km: 16 },
  { phrase: "shogunle", km: 16 },
  { phrase: "oshodi", km: 16 },
  { phrase: "ikeja", km: 18 },
  { phrase: "allen avenue", km: 18 },
  { phrase: "ogba", km: 16 },
  { phrase: "maryland", km: 20 },
  { phrase: "ilupeju", km: 18 },
  { phrase: "anthony", km: 20 },
  { phrase: "gbagada", km: 22 },
  { phrase: "mushin", km: 18 },
  { phrase: "ilasamaja", km: 16 },
  { phrase: "okota", km: 16 },
  { phrase: "surulere", km: 22 },
  { phrase: "ojuelegba", km: 22 },
  { phrase: "yaba", km: 24 },
  { phrase: "ebute metta", km: 24 },
  { phrase: "itire", km: 20 },
  { phrase: "lawanson", km: 20 },

  { phrase: "ejigbo", km: 14 },
  { phrase: "festac", km: 22 },
  { phrase: "amuwo", km: 22 },
  { phrase: "mile 2", km: 22 },
  { phrase: "apapa", km: 28 },
  { phrase: "ojodu", km: 18 },
  { phrase: "ogudu", km: 22 },
  { phrase: "ojota", km: 22 },
  { phrase: "ketu", km: 24 },
  { phrase: "magodo", km: 22 },
  { phrase: "omole", km: 18 },
  { phrase: "berger", km: 20 },
  { phrase: "palmgrove", km: 22 },
  { phrase: "somolu", km: 24 },
  { phrase: "shomolu", km: 24 },
  { phrase: "bariga", km: 24 },

  { phrase: "mile 12", km: 28 },
  { phrase: "ikorodu", km: 35 },
  { phrase: "badagry", km: 40 },
  { phrase: "agbara", km: 40 },
  { phrase: "ojo", km: 28 },
  { phrase: "agbado", km: 16 },
  { phrase: "alagbado", km: 16 },

  { phrase: "ikoyi", km: 35 },
  { phrase: "victoria island", km: 38 },
  { phrase: "lagos island", km: 36 },
  { phrase: "oniru", km: 38 },
  { phrase: "lekki phase 1", km: 42 },
  { phrase: "admiralty", km: 42 },

  { phrase: "ikota", km: 48 },
  { phrase: "chevron", km: 48 },
  { phrase: "lekki", km: 48 },
  { phrase: "ajah", km: 52 },

  { phrase: "abraham adesanya", km: 58 },
  { phrase: "sangotedo", km: 58 },
  { phrase: "awoyaya", km: 58 },
  { phrase: "lakowe", km: 60 },
  { phrase: "bogije", km: 60 },
  { phrase: "ibeju", km: 60 },
  { phrase: "epe", km: 70 },
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

  return match?.km ?? 12;
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

export type CheckoutQuoteBreakdown = {
  base: number;
  distance: number;
  vehicleFee: number;
  surge: number;
  waiting: number;
  total: number;
  distanceKm: number;
  surgeReason?: string | null;
};

export type CheckoutDeliveryQuote = {
  feeNgn: number;
  recommendedVehicle: VehiclePricingProfile | null;
  upgraded: boolean;
  partnersSuggested: number;
  capacityNote: string | null;
  breakdown: CheckoutQuoteBreakdown | null;
  startingFromNgn: number;
};

export function getCheckoutDeliveryQuote(
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
    applySurge?: boolean;
    surgeMultiplier?: number;
    surgeReason?: string | null;
    /** Waiting must stay 0 for initial quotes. */
    waitingBlocks?: number;
    startingFromNgn?: number;
  }
): CheckoutDeliveryQuote {
  const startingFromNgn = Math.max(
    DELIVERY_FEE_MIN_NGN,
    Math.round(Number(options?.startingFromNgn) || DELIVERY_FEE_MIN_NGN)
  );

  const fulfilment =
    options?.fulfilment ||
    (deliveryType === "pickup"
      ? "pickup"
      : options?.dispatchMode === "CUSTOMER_DISPATCH"
        ? "own_rider"
        : "ride_with_701");

  if (fulfilment !== "ride_with_701") {
    return {
      feeNgn: 0,
      recommendedVehicle: null,
      upgraded: false,
      partnersSuggested: 0,
      capacityNote: null,
      breakdown: null,
      startingFromNgn,
    };
  }

  if (!address.trim()) {
    return {
      feeNgn: 0,
      recommendedVehicle: null,
      upgraded: false,
      partnersSuggested: 0,
      capacityNote: null,
      breakdown: null,
      startingFromNgn,
    };
  }

  const catalog = options?.catalog;
  const recommendation = recommendFoodVehicle(
    {
      itemCount: options?.itemCount,
      bagCount: options?.bagCount,
      estimatedWeightKg: options?.estimatedWeightKg,
      estimatedVolumeLitres: options?.estimatedVolumeLitres,
    },
    catalog
  );

  const forced = options?.vehicleType
    ? getVehiclePricing(options.vehicleType, catalog)
    : null;
  const vehicle = forced || recommendation.vehicle;

  // Initial quotes never include waiting — waiting is post-arrival only.
  const quote = quoteRideDeliveryFee({
    distanceKm: estimateLagosDistanceKm(address),
    vehicleType: vehicle.category,
    itemCount: options?.itemCount,
    bagCount: options?.bagCount,
    estimatedWeightKg: options?.estimatedWeightKg,
    estimatedVolumeLitres: options?.estimatedVolumeLitres,
    catalog,
    applySurge: Boolean(options?.applySurge),
    surgeMultiplier: options?.surgeMultiplier,
    waitingBlocks: 0,
  });

  const upgraded =
    !forced && recommendation.upgraded
      ? true
      : forced
        ? forced.category !== "motorcycle"
        : false;

  const feeNgn = Math.min(DELIVERY_FEE_MAX_NGN, quote.feeNgn);

  return {
    feeNgn,
    recommendedVehicle: vehicle,
    upgraded,
    partnersSuggested: recommendation.partnersSuggested,
    capacityNote: upgraded
      ? "Delivery adjusted based on order size and required vehicle capacity."
      : null,
    startingFromNgn,
    breakdown: {
      base: quote.breakdown.base,
      distance: quote.breakdown.distance,
      vehicleFee: quote.breakdown.vehicleFee,
      surge: quote.breakdown.surge,
      waiting: 0,
      total: feeNgn,
      distanceKm: quote.distanceKm,
      surgeReason:
        quote.breakdown.surge > 0 ? options?.surgeReason || "Surge pricing" : null,
    },
  };
}

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
    applySurge?: boolean;
  }
) {
  return getCheckoutDeliveryQuote(deliveryType, address, options).feeNgn;
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

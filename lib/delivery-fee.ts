export const DELIVERY_FEE_MIN_NGN = 2500;
export const DELIVERY_FEE_MAX_NGN = 9900;

/**
 * Kitchen is on the Lagos mainland.
 * Mainland stays ₦2,500–₦4,500.
 * Mainland to island runs ₦4,500–₦9,900 by how far the island drop is.
 */
const AREA_FEES: { phrase: string; fee: number }[] = [
  { phrase: "isolo", fee: 2500 },
  { phrase: "ajao estate", fee: 2500 },
  { phrase: "mafoluku", fee: 2500 },
  { phrase: "shogunle", fee: 2500 },
  { phrase: "oshodi", fee: 2500 },
  { phrase: "ikeja", fee: 2500 },
  { phrase: "allen avenue", fee: 2500 },
  { phrase: "ogba", fee: 2500 },
  { phrase: "maryland", fee: 2500 },
  { phrase: "ilupeju", fee: 2500 },
  { phrase: "anthony", fee: 2500 },
  { phrase: "gbagada", fee: 2500 },
  { phrase: "mushin", fee: 2500 },
  { phrase: "ilasamaja", fee: 2500 },
  { phrase: "okota", fee: 2500 },
  { phrase: "surulere", fee: 2500 },
  { phrase: "ojuelegba", fee: 2500 },
  { phrase: "yaba", fee: 2500 },
  { phrase: "ebute metta", fee: 2500 },
  { phrase: "itire", fee: 2500 },
  { phrase: "lawanson", fee: 2500 },

  { phrase: "ejigbo", fee: 3500 },
  { phrase: "ikotun", fee: 3500 },
  { phrase: "festac", fee: 3500 },
  { phrase: "amuwo", fee: 3500 },
  { phrase: "mile 2", fee: 3500 },
  { phrase: "apapa", fee: 3500 },
  { phrase: "ojodu", fee: 3500 },
  { phrase: "ogudu", fee: 3500 },
  { phrase: "ojota", fee: 3500 },
  { phrase: "ketu", fee: 3500 },
  { phrase: "magodo", fee: 3500 },
  { phrase: "omole", fee: 3500 },
  { phrase: "berger", fee: 3500 },
  { phrase: "agege", fee: 3500 },
  { phrase: "dopemu", fee: 3500 },
  { phrase: "egbeda", fee: 3500 },
  { phrase: "palmgrove", fee: 3500 },
  { phrase: "somolu", fee: 3500 },
  { phrase: "shomolu", fee: 3500 },
  { phrase: "bariga", fee: 3500 },

  { phrase: "abule egba", fee: 4500 },
  { phrase: "iyana ipaja", fee: 4500 },
  { phrase: "igando", fee: 4500 },
  { phrase: "idimu", fee: 4500 },
  { phrase: "ipaja", fee: 4500 },
  { phrase: "alimosho", fee: 4500 },
  { phrase: "mile 12", fee: 4500 },
  { phrase: "ikorodu", fee: 4500 },
  { phrase: "badagry", fee: 4500 },
  { phrase: "agbara", fee: 4500 },
  { phrase: "ojo", fee: 4500 },
  { phrase: "agbado", fee: 4500 },
  { phrase: "alagbado", fee: 4500 },

  { phrase: "ikoyi", fee: 4500 },
  { phrase: "victoria island", fee: 5500 },
  { phrase: "lagos island", fee: 4500 },
  { phrase: "oniru", fee: 5500 },
  { phrase: "lekki phase 1", fee: 6500 },
  { phrase: "admiralty", fee: 6500 },

  { phrase: "ikota", fee: 7500 },
  { phrase: "chevron", fee: 7500 },
  { phrase: "lekki", fee: 7500 },
  { phrase: "ajah", fee: 8500 },

  { phrase: "abraham adesanya", fee: 9900 },
  { phrase: "sangotedo", fee: 9900 },
  { phrase: "awoyaya", fee: 9900 },
  { phrase: "lakowe", fee: 9900 },
  { phrase: "bogije", fee: 9900 },
  { phrase: "ibeju", fee: 9900 },
  { phrase: "epe", fee: 9900 },
];

const RULES = [...AREA_FEES].sort(
  (a, b) => b.phrase.length - a.phrase.length
);

export function getLagosDeliveryFee(address: string) {
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

  if (match) {
    return match.fee;
  }

  return DELIVERY_FEE_MIN_NGN;
}

export function getCheckoutDeliveryFee(
  deliveryType: "delivery" | "pickup",
  address = ""
) {
  if (deliveryType !== "delivery") {
    return 0;
  }

  return getLagosDeliveryFee(address);
}

export type Promo = {
  code: string;
  label: string;
  percent: number;
  note: string;
};

/** Kitchen-edited codes. A discount applies only to the food subtotal. */
export const PROMOS: Promo[] = [
  {
    code: "RHENNIE14",
    label: "5% off your food",
    percent: 5,
    note: "Delivery and the rider tip stay full price.",
  },
];

export function quotePromo(code: string) {
  const cleaned = code.trim();

  if (!cleaned) {
    return { code: "", percent: 0, label: "", error: null as string | null };
  }

  const match = PROMOS.find(
    (promo) => promo.code.toLowerCase() === cleaned.toLowerCase()
  );

  if (!match || match.percent <= 0) {
    return {
      code: cleaned,
      percent: 0,
      label: "",
      error: "That promo code is not active.",
    };
  }

  return {
    code: match.code,
    percent: match.percent,
    label: match.label,
    error: null,
  };
}

export function promoDiscount(subtotal: number, percent: number) {
  if (percent <= 0) return 0;
  return Math.min(subtotal, Math.round((subtotal * percent) / 100));
}

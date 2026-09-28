export type PaymentCurrency = "NGN" | "USD" | "CRYPTO" | "WALLET";

/** Naira per 1 US dollar. Used for dollar and USDT checkout. */
export const NGN_PER_USD = 1600;

export function ngnToUsd(amountNgn: number) {
  return Math.round((amountNgn / NGN_PER_USD) * 100) / 100;
}

export function isPaymentCurrency(value: string): value is PaymentCurrency {
  return value === "NGN" || value === "USD" || value === "CRYPTO" || value === "WALLET";
}

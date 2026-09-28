export const NIGERIAN_BANKS = [
  { name: "Access Bank", code: "044" },
  { name: "GTBank", code: "058" },
  { name: "UBA", code: "033" },
  { name: "Zenith Bank", code: "057" },
  { name: "First Bank", code: "011" },
  { name: "Opay", code: "999992" },
  { name: "PalmPay", code: "999991" },
  { name: "Kuda", code: "50211" },
  { name: "Moniepoint", code: "50515" },
] as const;

export function findBank(code: string) {
  return NIGERIAN_BANKS.find((bank) => bank.code === code) || null;
}

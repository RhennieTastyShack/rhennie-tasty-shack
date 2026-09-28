import { getLagosDeliveryFee } from "@/lib/delivery-fee";

export type DispatchMode = "PLATFORM" | "CUSTOMER_DISPATCH";

const WEEKDAY_INDEX: Record<string, number> = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};

export type PricedMeal = {
  day: string;
  meal_service: string;
  unitPrice: number;
};

function countWeekday(
  startIso: string,
  endIso: string | null,
  dayName: string
) {
  const target = WEEKDAY_INDEX[dayName];
  if (target === undefined) return 0;
  if (!endIso) return 1;

  const start = new Date(`${startIso}T12:00:00`);
  const end = new Date(`${endIso}T12:00:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) {
    return 0;
  }

  let count = 0;
  for (
    const cursor = new Date(start);
    cursor <= end;
    cursor.setDate(cursor.getDate() + 1)
  ) {
    if (cursor.getDay() === target) count += 1;
  }
  return count;
}

export function quoteSubscription(input: {
  meals: PricedMeal[];
  address: string;
  dispatchMode: DispatchMode;
  startDate: string;
  endDate: string | null;
}) {
  let mealTotal = 0;
  const dropDays = new Set<string>();

  for (const meal of input.meals) {
    const price = Number(meal.unitPrice);
    if (!Number.isFinite(price) || price <= 0) continue;
    const times = countWeekday(input.startDate, input.endDate, meal.day);
    mealTotal += price * times;
    dropDays.add(`${meal.day}|${meal.meal_service}`);
  }

  let drops = 0;
  for (const key of dropDays) {
    const day = key.slice(0, key.indexOf("|"));
    drops += countWeekday(input.startDate, input.endDate, day);
  }

  const deliveryFeeEach =
    input.dispatchMode === "CUSTOMER_DISPATCH"
      ? 0
      : getLagosDeliveryFee(input.address);
  const deliveryTotal = deliveryFeeEach * drops;

  return {
    mealTotal,
    drops,
    deliveryFeeEach,
    deliveryTotal,
    total: mealTotal + deliveryTotal,
    perWeek: !input.endDate,
  };
}

import { APPETIZER_MINIMUM, isAppetizerDish } from "@/lib/party-menu";

export type Weekday =
  | "Sunday"
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday";

type MenuOrderRule = {
  availableDays?: Weekday[];
  minOrder?: number;
};

function normalizeName(name: string) {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

const RULES: Record<string, MenuOrderRule> = {
  "rts chicken sandwich": {
    availableDays: ["Friday"],
  },
  "rts pasta box": {
    availableDays: ["Wednesday"],
  },
  "party jollof pack": {
    minOrder: 10,
  },
};

export function getMenuOrderRule(name: string): MenuOrderRule {
  return RULES[normalizeName(name)] || {};
}

/** Current weekday in Africa/Lagos (WAT). */
export function lagosWeekday(date: Date = new Date()): Weekday {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    timeZone: "Africa/Lagos",
  }).format(date) as Weekday;
}

export function menuItemAvailableDays(name: string): Weekday[] | null {
  const days = getMenuOrderRule(name).availableDays;
  return days?.length ? days : null;
}

export function isMenuItemAvailableToday(
  name: string,
  date: Date = new Date()
): boolean {
  const days = menuItemAvailableDays(name);
  if (!days) return true;
  return days.includes(lagosWeekday(date));
}

export function minOrderQuantity(name: string): number {
  const ruleMin = getMenuOrderRule(name).minOrder;
  if (typeof ruleMin === "number" && ruleMin > 1) return ruleMin;
  if (isAppetizerDish(name)) return APPETIZER_MINIMUM;
  return 1;
}

export function availabilityNote(name: string): string | null {
  const days = menuItemAvailableDays(name);
  if (!days) return null;
  if (days.length === 1) return `Available ${days[0]}s only.`;
  return `Available on ${days.join(", ")} only.`;
}

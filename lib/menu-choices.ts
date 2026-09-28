import { partyChoiceLabel } from "@/lib/party-menu";

const ANY_RICE = [
  "Jollof Rice",
  "Fried Rice",
  "Special Fried Rice",
  "Coconut Rice",
  "Chinese Rice",
  "Veggie Rice",
  "Jambalaya Rice",
  "White Rice",
];

const ASUN_RICE = ["Native Rice", "Asun Rice", "Prawn Rice"];

const SWALLOWS = ["Eba", "Poundo", "Amala", "Semo", "Fufu"];
const SOUPS = ["Egusi Soup", "Okro Soup", "Efo Riro", "Ewedu"];
const SWALLOW_AND_SOUP = SWALLOWS.flatMap((swallow) =>
  SOUPS.map((soup) => `${swallow} + ${soup}`)
);

type ChoiceGroup = {
  names: string[];
  label: string;
  choose: string;
  hide: string;
  hint: string;
  options: string[];
};

const GROUPS: ChoiceGroup[] = [
  {
    names: [
      "Any Rice + Chicken",
      "Any Rice + Turkey",
      "Any Rice + Chicken Drumstick",
    ],
    label: "Rice",
    choose: "Choose rice",
    hide: "Hide rice",
    hint: "Native rice, asun rice, and prawn rice are on the Asun Combo. Each rice is its own plate.",
    options: ANY_RICE,
  },
  {
    names: ["Any Spaghetti with Chicken"],
    label: "Spaghetti",
    choose: "Choose spaghetti",
    hide: "Hide spaghetti",
    hint: "Chicken is included. Each spaghetti is its own plate.",
    options: [
      "Spaghetti",
      "Fishgetti",
      "Native Spaghetti",
      "Jollof Spaghetti",
      "Stir Fry Spaghetti",
    ],
  },
  {
    names: ["Swallow, Soup & Beef"],
    label: "Plate",
    choose: "Choose swallow and soup",
    hide: "Hide plates",
    hint: "Beef is included. Each plate is ordered on its own.",
    options: SWALLOW_AND_SOUP,
  },
  {
    names: [
      "Chief's Heritage Feast (Turkey)",
      "Chief's Heritage Feast (Swallow & Turkey)",
    ],
    label: "Plate",
    choose: "Choose swallow and soup",
    hide: "Hide plates",
    hint: "Turkey is included. Choose the swallow and soup for this plate.",
    options: SWALLOW_AND_SOUP,
  },
  {
    names: ["Royal Native Bowl (Swallow & Chicken)"],
    label: "Plate",
    choose: "Choose swallow and soup",
    hide: "Hide plates",
    hint: "Chicken is included. Choose the swallow and soup for this plate.",
    options: SWALLOW_AND_SOUP,
  },
  {
    names: [
      "Asun Combo",
      "Asun Rice + Titus Fish",
      "1 Portion Asun Rice + Titus Fish",
    ],
    label: "Rice",
    choose: "Choose rice",
    hide: "Hide rice",
    hint: "Choose Native Rice, Asun Rice, or Prawn Rice. Each rice is its own plate.",
    options: ASUN_RICE,
  },
  {
    names: ["Mixed Pasta"],
    label: "Pasta",
    choose: "Mix pastas",
    hide: "Hide pastas",
    hint: "Pick the pastas to mix on this one plate. One portion is ₦2,500.",
    options: [
      "Spaghetti",
      "Reload Spaghetti",
      "Fishgetti",
      "Penne Pasta",
      "Shredded Beef Pasta",
      "Native Pasta",
    ],
  },
];

function normalizeChoiceName(value: string) {
  return value
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function groupFor(name: string) {
  const normalized = normalizeChoiceName(name);

  return GROUPS.find((group) =>
    group.names.some((item) => normalizeChoiceName(item) === normalized)
  );
}

export function dishChoices(name: string) {
  return groupFor(name)?.options || [];
}

export function dishChoiceUi(name: string) {
  const group = groupFor(name);

  if (!group) return null;

  return {
    label: group.label,
    choose: group.choose,
    hide: group.hide,
    hint: group.hint,
  };
}

export function selectionLabel(name: string) {
  return groupFor(name)?.label || partyChoiceLabel(name);
}

export type PartyDish = {
  name: string;
  description: string;
  price: number;
  image: string;
  kind: "Appetizer";
  unit: string;
  choices?: string[];
  previousNames?: string[];
  hundredServings?: number;
  minimumServings?: number;
};

export const PARTY_COLLECTION = "Appetizers";

export const APPETIZER_MINIMUM = 10;

export const RETIRED_PARTY_DISHES = [
  "Celebration Cake Platter",
  "Beef Chowmein",
  "Beef Deluxe",
  "BBQ Chicken",
  "Meatball Tomato Pasta",
  "Festival Noodle",
  "Spicy Sausage Noodle",
  "Afripot Noodle",
  "Spicy Sausage Pasta",
  "Spicy Chicken Chow Mein",
  "Asun Fire Pasta",
  "Seafood Pasta",
  "Gizdodo Pasta",
  "Double Chicken Alfredo",
  "Meatball & Suya Creamy Pasta",
  "Prawn Alfredo",
  "Turkey Coconut Creamy Pasta",
  "Chocolate Brownie Bites",
  "Puff-Puff Dessert Tower",
];

const PASTA_CUPS: PartyDish[] = [
  {
    name: "Pasta Cups",
    description: "Choose any cups. Every cup in this list is the same price.",
    price: 3500,
    image: "/images/pasta-cups.jpg",
    kind: "Appetizer",
    unit: "each",
    choices: [
      "Beef Chowmein",
      "Beef Deluxe",
      "BBQ Chicken",
      "Meatball Tomato Pasta",
      "Festival Noodle",
      "Spicy Sausage Noodle",
      "Afripot Noodle",
      "Spicy Sausage Pasta",
      "Spicy Chicken Chow Mein",
    ],
  },
  {
    name: "Premium Pasta Cups",
    description: "Choose any cups. Every cup in this list is the same price.",
    price: 4500,
    image: "/images/pasta-cups.jpg",
    kind: "Appetizer",
    unit: "each",
    choices: [
      "Asun Fire Pasta",
      "Seafood Pasta",
      "Gizdodo Pasta",
      "Double Chicken Alfredo",
      "Meatball & Suya Creamy Pasta",
      "Prawn Alfredo",
      "Turkey Coconut Creamy Pasta",
    ],
  },
];

export const PARTY_DISHES: PartyDish[] = [
  {
    name: "Waffles",
    description:
      "Waffles, grilled chicken, sausage and sauce, packed as a box.",
    price: 8000,
    image: "/images/waffle.jpeg",
    kind: "Appetizer",
    unit: "per box",
  },
  {
    name: "Fruit & Cream Dessert",
    description: "Fruit and cream, served as a party dessert.",
    price: 3000,
    image: "/images/fruit-and-cream.jpg",
    kind: "Appetizer",
    unit: "each",
  },
  {
    name: "RTS Ocean Royale",
    description:
      "Rice with prawn, shellfish and grilled meat, served in a cup.",
    price: 6500,
    image: "/images/ocean-royale.jpg",
    kind: "Appetizer",
    unit: "each",
    previousNames: ["Chocolate Brownie Bites"],
  },
  {
    name: "RTS Suya Jollof Bowl",
    description:
      "Suya skewer with peppers and onions over jollof, served in a bowl.",
    price: 6000,
    image: "/images/suya-jollof-bowl.jpg",
    kind: "Appetizer",
    unit: "each",
    previousNames: ["Puff-Puff Dessert Tower"],
  },
  {
    name: "Seafood Platter",
    description: "Crabs, prawns, glazed corn, fish and sauce.",
    price: 45000,
    image: "/images/seafood-platter.jpg",
    kind: "Appetizer",
    unit: "per platter",
  },
  {
    name: "Chinese Rice Platter",
    description:
      "White rice, fried rice, corn, rice noodles, peppered beef, chicken and prawns on one plate. Minimum order of 10.",
    price: 15000,
    image: "/images/chinese-rice-platter.jpg",
    kind: "Appetizer",
    unit: "per plate",
  },
  {
    name: "Tapioca, Fish, Fries & Coleslaw",
    description: "Tapioca with fish, fries and coleslaw.",
    price: 5500,
    image: "/images/fish-fries-coleslaw.jpg",
    kind: "Appetizer",
    unit: "per serving",
    previousNames: ["BBQ Tapioca & Fish"],
    hundredServings: 550000,
  },
  {
    name: "Tapioca, Shrimps & Eja Yoyo",
    description: "Tapioca with shrimps and eja yoyo.",
    price: 2000,
    image: "/images/tapioca-shrimps-eja-yoyo.jpg",
    kind: "Appetizer",
    unit: "each",
  },
  {
    name: "Grilled Fish",
    description: "Grilled fish, finished for the table.",
    price: 15000,
    image: "/images/grilled-fish-platter.jpg",
    kind: "Appetizer",
    unit: "each",
    previousNames: ["Grilled Croaker Platter"],
  },
  {
    name: "Peppered Snail Platter",
    description: "Snail, fries and sauce.",
    price: 10000,
    image: "/images/snail.jpeg",
    kind: "Appetizer",
    unit: "each",
  },
  {
    name: "Asun Party Bowl",
    description: "Peppered goat, prepared as a bowl for guests.",
    price: 3500,
    image: "/images/asun.jpeg",
    kind: "Appetizer",
    unit: "each",
  },
  {
    name: "Small Chops",
    description: "Spring rolls, samosa and bites for a reception.",
    price: 3500,
    image: "/images/small-chops.jpg",
    kind: "Appetizer",
    unit: "each",
    previousNames: ["Small Chops Tower"],
  },
  {
    name: "Pepper Soup & Bread Rolls",
    description: "Pepper soup served with bread rolls.",
    price: 5500,
    image: "/images/pepper-soup-bread-rolls.jpg",
    kind: "Appetizer",
    unit: "each",
  },
  {
    name: "Abula on the Spot with Assorted",
    description:
      "Amala, ewedu and gbegiri with assorted meat and ponmo. Minimum order of 10.",
    price: 5500,
    image: "/images/abula-assorted.jpg",
    kind: "Appetizer",
    unit: "per person",
  },
  {
    name: "Abula on the Spot with Fish",
    description:
      "Amala, ewedu and gbegiri with fish. Minimum order of 10.",
    price: 8000,
    image: "/images/abula-fish.jpg",
    kind: "Appetizer",
    unit: "per person",
  },
  {
    name: "Cocktails",
    description:
      "Event cocktails, served by the glass. Minimum order of 10.",
    price: 4500,
    image: "/images/cocktails.jpg",
    kind: "Appetizer",
    unit: "per glass",
  },
  {
    name: "Prawn Kebab",
    description: "A prawn kebab for a standing reception.",
    price: 10000,
    image: "/images/prawn kebab.jpeg",
    kind: "Appetizer",
    unit: "per kebab",
    previousNames: ["Prawn Kebab Platter"],
  },
  ...PASTA_CUPS,
];

function naira(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function partyChoices(name: string) {
  const normalized = name.trim().toLowerCase();
  const dish = PARTY_DISHES.find(
    (item) => item.name.toLowerCase() === normalized
  );

  return dish?.choices || [];
}

export function partyChoiceLabel(name: string) {
  return partyChoices(name).length > 0 ? "Cup" : "Size";
}

export function isAppetizerDish(name: string) {
  const normalized = name.trim().toLowerCase();

  return PARTY_DISHES.some(
    (dish) =>
      dish.name.toLowerCase() === normalized ||
      (dish.previousNames || []).some(
        (previous) => previous.toLowerCase() === normalized
      )
  );
}

export function formatPartyPrice(dish: PartyDish) {
  const minimum = `minimum ${APPETIZER_MINIMUM}`;

  return `${naira(dish.price)} ${dish.unit} · ${minimum}`;
}

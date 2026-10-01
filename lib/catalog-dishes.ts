export type CatalogDish = {
  name: string;
  previousNames?: string[];
  /** Match this old price when the new price is different. */
  previousPrice?: number;
  /** Update one existing row when several share the old name. */
  replaceOne?: boolean;
  collection: string;
  collectionMatch: string[];
  description: string;
  price: number;
  image: string;
  displayOrder: number;
  sortOrder: number;
};

export const STIR_FRY_TRAY_NAME = "RTS Crave Combo";

export const LOADED_SINGAPORE_NAME = "Loaded Singapore Noodles";

export const RETIRED_CATALOG_NAMES = [
  "Executive Stir-Fry Tray",
  "Stir-Fry Pasta & Turkey",
  "₦32K Jollof Pasta Food Box",
  "₦50K Premium Food Box",
  "₦45K Premium Platter",
  "Titus Pepper Soup",
  "Fisherman's Titus Pepper Soup",
  "Fisherman's Catfish Pepper Soup",
];

const EXECUTIVE_LUNCH = ["executive lunch", "executive-lunch"];

const FOOD_BY_LITRE = [
  "food by litre",
  "food-by-litre",
  "food by liter",
  "grand pot",
  "grand-pot",
];

const SINGAPORE_DESCRIPTION =
  "Prawns, sausage, peppers and mushrooms tossed through Singapore noodles.";

const SINGAPORE_IMAGE = "/images/loaded-singapore-noodles.jpg";

const SINGAPORE_LITRE_PRICES = [25000, 47000, 58000, 70000, 92000, 115000];

const ANY_RICE_NOTE =
  "Native rice, asun rice, and prawn rice are on the Asun Combo.";

const FOOD_BOXES = ["food boxes", "food-boxes"];

export function applyMenuWording(value: string) {
  return portionPlateName(value).replace(/pounded yam/gi, "Poundo");
}

export function portionPlateName(name: string) {
  return name
    .replace(/\b[12]\s+spoons?\s+of\b/gi, "")
    .replace(/\b[12]\s+portions?\s+of\b/gi, "")
    .replace(/\b[12]\s+spoons?\b/gi, "")
    .replace(/\b[12]\s+portions?\b/gi, "")
    .replace(/(\s*\+\s*)2\s+beef\b/gi, "$1Beef")
    .replace(/(\s*\+\s*)1\s+beef\b/gi, "$1Beef")
    .replace(/\b2\s+beef\b/gi, "Beef")
    .replace(/\b1\s+beef\b/gi, "Beef")
    .replace(/\s+/g, " ")
    .replace(/\s+\+\s+/g, " + ")
    .trim();
}

export const CATALOG_DISHES: CatalogDish[] = [
  {
    name: STIR_FRY_TRAY_NAME,
    previousNames: RETIRED_CATALOG_NAMES,
    collection: "Executive Lunch",
    collectionMatch: EXECUTIVE_LUNCH,
    description:
      "Stir fry pasta, one fried turkey, fried plantain and a bottled water.",
    price: 7500,
    image: "/images/stir-fry-pasta-tray.jpg",
    displayOrder: 40,
    sortOrder: 0,
  },
  {
    name: LOADED_SINGAPORE_NAME,
    collection: "Executive Lunch",
    collectionMatch: EXECUTIVE_LUNCH,
    description: SINGAPORE_DESCRIPTION,
    price: 15000,
    image: SINGAPORE_IMAGE,
    displayOrder: 41,
    sortOrder: 0,
  },
  ...SINGAPORE_LITRE_PRICES.map((price, index) => ({
    name: LOADED_SINGAPORE_NAME,
    collection: "Food By Litre",
    collectionMatch: FOOD_BY_LITRE,
    description: SINGAPORE_DESCRIPTION,
    price,
    image: SINGAPORE_IMAGE,
    displayOrder: 20,
    sortOrder: index,
  })),
  {
    name: "Asun Combo",
    previousPrice: 7100,
    collection: "Executive Lunch",
    collectionMatch: EXECUTIVE_LUNCH,
    description:
      "Choose Native Rice, Asun Rice, or Prawn Rice. Each plate is charged on its own.",
    price: 8000,
    image: "/images/asun.jpeg",
    displayOrder: 12,
    sortOrder: 0,
  },
  {
    name: "Mixed Pasta",
    collection: "Pasta",
    collectionMatch: ["pasta"],
    description:
      "Mix spaghetti, reload spaghetti, fishgetti, penne, shredded beef pasta and native pasta on one plate.",
    price: 2500,
    image: "/images/spaghetti.jpeg",
    displayOrder: 9,
    sortOrder: 0,
  },
  {
    name: "Shaki",
    previousNames: [
      "1 Portion Shaki",
      "2 Portions Shaki",
      "1 Spoon Shaki",
      "2 Spoons Shaki",
    ],
    collection: "Build Your Plate",
    collectionMatch: ["build your plate", "build-your-plate"],
    description: "Peppered shaki, one portion.",
    price: 1500,
    image: "/images/shaki.jpeg",
    displayOrder: 20,
    sortOrder: 0,
  },
  {
    name: "Loaded Turkey Pasta",
    collection: "Executive Lunch",
    collectionMatch: EXECUTIVE_LUNCH,
    description:
      "Spaghetti tossed with peppered beef and peppers, served with a glazed turkey piece.",
    price: 13500,
    image: "/images/loaded-turkey-pasta.jpg",
    displayOrder: 8,
    sortOrder: 0,
  },
  {
    name: "Asun Rice + Titus Fish",
    previousNames: [
      "1 Portion Asun Rice + Titus Fish",
      "1 Spoon Asun Rice + Titus Fish",
    ],
    collection: "Executive Lunch",
    collectionMatch: EXECUTIVE_LUNCH,
    description:
      "Titus fish with Native Rice, Asun Rice, or Prawn Rice.",
    price: 6500,
    previousPrice: 7100,
    image: "/images/asunrice+titus.jpeg",
    displayOrder: 11,
    sortOrder: 0,
  },
  {
    name: "Any Rice + Chicken Drumstick",
    previousNames: [
      "2 Spoons of Jollof Rice + 1 Chicken Drumstick",
      "2 Portions of Jollof Rice + 1 Chicken Drumstick",
    ],
    collection: "Executive Lunch",
    collectionMatch: EXECUTIVE_LUNCH,
    description: `Pick any rice. ${ANY_RICE_NOTE} A chicken drumstick is included with every plate.`,
    price: 5800,
    image: "/images/jollofrice withdrumstick.jpeg",
    displayOrder: 17,
    sortOrder: 0,
  },
  {
    name: "Any Spaghetti with Chicken",
    collection: "Executive Lunch",
    collectionMatch: EXECUTIVE_LUNCH,
    description:
      "Pick any spaghetti. Chicken is included with every plate.",
    price: 5500,
    image: "/images/any-spaghetti-chicken.jpg",
    displayOrder: 13,
    sortOrder: 0,
  },
  {
    name: "Asun Pasta",
    collection: "Build Your Plate",
    collectionMatch: ["build your plate", "build-your-plate"],
    description: "Asun pasta, one portion.",
    price: 3000,
    image: "/images/any-spaghetti-chicken.jpg",
    displayOrder: 21,
    sortOrder: 0,
  },
  {
    name: "Swallow, Soup & Beef",
    previousNames: ["Okro Soup + 2 Eba + 2 Beef"],
    previousPrice: 4900,
    collection: "Executive Lunch",
    collectionMatch: EXECUTIVE_LUNCH,
    description:
      "Choose the swallow and soup. Beef is included with every plate.",
    price: 5800,
    image: "/images/okra.jpeg",
    displayOrder: 14,
    sortOrder: 0,
  },
  {
    name: "Any Rice + Chicken",
    previousNames: ["Jollof Rice + Chicken"],
    collection: "Executive Lunch",
    collectionMatch: EXECUTIVE_LUNCH,
    description: `Pick any rice. ${ANY_RICE_NOTE} Chicken is included with every plate.`,
    previousPrice: 5500,
    price: 6500,
    image: "/images/jollof-chicken.jpeg",
    displayOrder: 15,
    sortOrder: 0,
  },
  {
    name: "Any Rice + Turkey",
    previousNames: ["Jollof Rice + Turkey"],
    collection: "Executive Lunch",
    collectionMatch: EXECUTIVE_LUNCH,
    description: `Pick any rice. ${ANY_RICE_NOTE} Turkey is included with every plate.`,
    price: 8000,
    image: "/images/jollofrice-turkey.jpeg",
    displayOrder: 16,
    sortOrder: 0,
  },
  {
    name: "RTS Chicken Sandwich",
    collection: "Executive Lunch",
    collectionMatch: EXECUTIVE_LUNCH,
    description:
      "Branded RTS sandwich pack with creamy chicken filling, fresh lettuce and tomato. Available Fridays only.",
    price: 10000,
    image: "/images/rts-chicken-sandwich.jpg",
    displayOrder: 18,
    sortOrder: 0,
  },
  {
    name: "RTS Pasta Box",
    collection: "Food Boxes",
    collectionMatch: FOOD_BOXES,
    description:
      "Stir-fry pasta with sausage, grilled chicken, fried plantain, fries, dipping sauces and Chivita juice. Available Wednesdays only.",
    price: 15000,
    image: "/images/rts-pasta-box.jpg",
    displayOrder: 58,
    sortOrder: 0,
  },
  {
    name: "Party Jollof Pack",
    collection: "Food Boxes",
    collectionMatch: FOOD_BOXES,
    description:
      "Individual party pack with jollof rice, fried plantain and chicken. Minimum order of 10 packs.",
    price: 6200,
    image: "/images/party-jollof-pack.jpg",
    displayOrder: 59,
    sortOrder: 0,
  },
  {
    name: "Jollof & Pasta Feast Box",
    collection: "Food Boxes",
    collectionMatch: FOOD_BOXES,
    description:
      "A luxurious three-meal experience featuring jollof rice, fried rice and pasta, served with four generous pieces of seasoned chicken.",
    price: 32000,
    image: "/images/Jollof & Pasta Feast Box.png",
    displayOrder: 60,
    sortOrder: 0,
  },
  {
    name: "RTS Treat Box",
    collection: "Food Boxes",
    collectionMatch: FOOD_BOXES,
    description:
      "Jollof rice, special fried rice, grilled chicken, fried plantain, fresh apples, McVitie's and Chivita juice.",
    price: 65000,
    image: "/images/rts-treat-box.jpg",
    displayOrder: 69,
    sortOrder: 0,
  },
  {
    name: "RTS Feast Box",
    collection: "Food Boxes",
    collectionMatch: FOOD_BOXES,
    description:
      "Jollof rice, special fried rice, stir-fry pasta, grilled and fried chicken, small chops, chicken sandwiches, puff-puff, plantain, fresh fruit, juice and sparkling drink.",
    price: 280000,
    image: "/images/rts-feast-box.jpg",
    displayOrder: 70,
    sortOrder: 0,
  },
  {
    name: "RTS Grand Feast Box",
    collection: "Food Boxes",
    collectionMatch: FOOD_BOXES,
    description:
      "Jollof rice, special fried rice, stir-fry pasta, assorted chicken, small chops, sandwiches, puff-puff, plantain, salad, cake, fresh fruit, juice and sparkling drink.",
    price: 260000,
    image: "/images/rts-grand-feast-box.jpg",
    displayOrder: 71,
    sortOrder: 0,
  },
  {
    name: "Luxury Brunch Box",
    collection: "Food Boxes",
    collectionMatch: FOOD_BOXES,
    // Verified seed copy from database/menu.sql — expand contents when confirmed.
    description: "A premium brunch box curated by Rhennie Tasty Shack.",
    price: 35000,
    image: "/images/Luxury Brunch Box.png",
    displayOrder: 61,
    sortOrder: 0,
  },
  {
    name: "Weekend Treat Box",
    collection: "Food Boxes",
    collectionMatch: FOOD_BOXES,
    description:
      "Fried rice, stir fry pasta, 2 pieces of peppered turkey, 1 mini bottled water, 1 fruit juice, 5 samosa, 5 spring rolls, 10 puff-puff, 2 chocolates and 2 McVitie's.",
    price: 40000,
    image: "/images/box-45-turkey.jpg",
    displayOrder: 62,
    sortOrder: 0,
  },
  {
    // CONTENT REVIEW: previously duplicated Weekend Treat Box ingredients.
    // Keep product live with a safe name-based description until contents are confirmed.
    name: "Peppered Turkey Box",
    collection: "Food Boxes",
    collectionMatch: FOOD_BOXES,
    description:
      "A premium food box featuring peppered turkey. Full contents available on request.",
    price: 45000,
    image: "/images/box-45-turkey.jpg",
    displayOrder: 63,
    sortOrder: 0,
  },
  {
    name: "Family Feast Box",
    collection: "Food Boxes",
    collectionMatch: FOOD_BOXES,
    description:
      "2 apples, 2 pieces of peppered turkey, 10 pieces of peppered beef, 10 samosa, 10 spring rolls, 15 puff-puff, 1 fruit juice, fried rice and jollof rice.",
    price: 50000,
    image: "/images/box-50-family.jpg",
    displayOrder: 64,
    sortOrder: 0,
  },
  {
    name: "Plantain Feast Box",
    collection: "Food Boxes",
    collectionMatch: FOOD_BOXES,
    description:
      "2 pieces of peppered turkey, stir fry pasta, fried rice, fried plantain, 10 puff-puff, 5 samosa, 5 spring rolls, 1 fruit juice, 1 Pringles, 1 Vitamilk and 3 McVitie's.",
    price: 50000,
    image: "/images/box-50-plantain.jpg",
    displayOrder: 65,
    sortOrder: 0,
  },
  {
    name: "Bento Celebration Box",
    collection: "Food Boxes",
    collectionMatch: FOOD_BOXES,
    description:
      "A bento cake, 2 pieces of peppered turkey, stir fry pasta, fried rice, 5 samosa, 5 spring rolls, 10 puff-puff, 2 cookies, 2 chocolates, 1 fruit juice and 1 mini bottled water.",
    price: 55000,
    image: "/images/box-55-bento.jpg",
    displayOrder: 66,
    sortOrder: 0,
  },
  {
    name: "Heritage Feast Box",
    collection: "Food Boxes",
    collectionMatch: FOOD_BOXES,
    description:
      "Stir fry pasta, fried rice, 5 waffles, 4 pieces of peppered turkey, 2 fruit juices, 2 chocolates, 2 cookies, 5 samosa, 5 spring rolls, 10 puff-puff and 1 Pringles.",
    price: 60000,
    image: "/images/box-60-waffles.jpg",
    displayOrder: 67,
    sortOrder: 0,
  },
  {
    name: "Efo Riro Feast Platter",
    collection: "Food Boxes",
    collectionMatch: FOOD_BOXES,
    description:
      "1L efo riro, 4 pieces of poundo, 1L jollof rice, 1L fried rice, 1L stir fry pasta, 4 pieces of peppered turkey, 5 samosa, 5 spring rolls, 10 puff-puff, fried plantain, 4 mini bottled water and 1 grapefruit wine.",
    price: 100000,
    image: "/images/efo-riro-tray.jpg",
    displayOrder: 68,
    sortOrder: 0,
  },
];

/**
 * Resolve menu meal images from Supabase URLs or local /public/images fallbacks.
 */

function normalizeName(value: string) {
  return value
    .toLowerCase()
    .replace(/₦/g, "")
    .replace(/&/g, " and ")
    .replace(/\+/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function toPublicImagePath(fileName: string) {
  const clean = fileName.trim().replace(/^\/images\//, "");
  return `/images/${encodeURIComponent(clean)}`;
}

/**
 * More specific keywords must come before generic ones.
 */
const IMAGE_MATCHES: Array<{
  keywords: string[];
  image: string;
}> = [
  {
    keywords: [
      "rts crave combo",
      "crave combo",
      "stir fry pasta and turkey",
      "stir fry pasta",
      "executive stir fry tray",
      "stir fry tray",
    ],
    image: "stir-fry-pasta-tray.jpg",
  },
  {
    keywords: ["loaded singapore noodles", "singapore noodles"],
    image: "loaded-singapore-noodles.jpg",
  },

  /* PARTY TABLE */
  {
    keywords: ["abula on the spot with fish"],
    image: "abula-fish.jpg",
  },
  {
    keywords: ["abula on the spot with assorted", "abula on the spot"],
    image: "abula-assorted.jpg",
  },
  {
    keywords: ["cocktails"],
    image: "cocktails.jpg",
  },
  {
    keywords: ["pasta cups"],
    image: "pasta-cups.jpg",
  },
  {
    keywords: ["ocean royale"],
    image: "ocean-royale.jpg",
  },
  {
    keywords: ["suya jollof"],
    image: "suya-jollof-bowl.jpg",
  },
  {
    keywords: ["chinese rice platter"],
    image: "chinese-rice-platter.jpg",
  },
  {
    keywords: ["seafood platter"],
    image: "seafood-platter.jpg",
  },
  {
    keywords: ["tapioca fish fries"],
    image: "fish-fries-coleslaw.jpg",
  },
  {
    keywords: ["tapioca shrimps", "eja yoyo"],
    image: "tapioca-shrimps-eja-yoyo.jpg",
  },
  {
    keywords: ["bbq tapioca", "tapioca and fish", "tapioca & fish"],
    image: "bbq fish.jpeg",
  },
  {
    keywords: ["grilled fish"],
    image: "grilled-fish-platter.jpg",
  },
  {
    keywords: ["fruit and cream", "fruit cream"],
    image: "fruit-and-cream.jpg",
  },
  {
    keywords: ["small chops"],
    image: "small-chops.jpg",
  },
  {
    keywords: ["prawn kebab"],
    image: "prawn kebab.jpeg",
  },

  /* FOOD BOXES & PLATTERS */
  {
    keywords: ["jollof pasta food box", "jollof and pasta feast", "32k jollof"],
    image: "Luxury Brunch Box.png",
  },
  {
    keywords: ["plantain feast box"],
    image: "box-50-plantain.jpg",
  },
  {
    keywords: ["50k premium food box", "family feast box"],
    image: "box-50-family.jpg",
  },
  {
    keywords: ["peppered turkey box"],
    image: "box-45-turkey.jpg",
  },
  {
    keywords: ["bento celebration box"],
    image: "box-55-bento.jpg",
  },
  {
    keywords: ["70k luxury food box", "ultimate brunch box"],
    image: "Ultimate Brunch Box.png",
  },
  {
    keywords: ["80k grand food box", "grand celebration box"],
    image: "Grand Celebration Box.png",
  },
  {
    keywords: ["heritage feast box"],
    image: "box-60-waffles.jpg",
  },
  {
    keywords: ["chief s heritage feast", "chief s heritage"],
    image: "turkey.jpeg",
  },
  {
    keywords: ["luxury brunch box"],
    image: "Luxury Brunch Box.png",
  },
  {
    keywords: ["weekend treat box"],
    image: "box-45-turkey.jpg",
  },
  {
    keywords: ["45k premium platter", "chicken and small chops platter"],
    image: "Chicken & Small Chops Platter.png",
  },
  {
    keywords: ["turkey and small chops platter"],
    image: "Turkey & Small Chops Platter.png",
  },
  {
    keywords: ["efo riro feast platter"],
    image: "efo-riro-tray.jpg",
  },

  /* SIGNATURE / COMBOS */
  {
    keywords: ["ayamase royal"],
    image: "ayamaseroyal.jpeg",
  },
  {
    keywords: ["any rice turkey", "jollof rice turkey", "jollof turkey", "imperial jollof"],
    image: "jollofrice-turkey.jpeg",
  },
  {
    keywords: ["any rice chicken drumstick", "chicken drumstick"],
    image: "jollofrice withdrumstick.jpeg",
  },
  {
    keywords: ["any rice chicken"],
    image: "jollof-chicken.jpeg",
  },
  {
    keywords: ["any spaghetti with chicken"],
    image: "any-spaghetti-chicken.jpg",
  },
  {
    keywords: ["swallow soup and beef", "swallow soup"],
    image: "okra.jpeg",
  },
  {
    keywords: ["king s asun feast"],
    image: "asun rice.jpeg",
  },
  {
    keywords: ["asun combo"],
    image: "asun.jpeg",
  },
  {
    keywords: ["jollof rice chicken", "jollof chicken"],
    image: "jollof-chicken.jpeg",
  },
  {
    keywords: ["jollof rice drumstick", "jollof with drumstick"],
    image: "jollofrice withdrumstick.jpeg",
  },
  {
    keywords: ["fried rice turkey", "friedrice with turkey"],
    image: "friedrice with turkey.jpeg",
  },
  {
    keywords: ["asun rice titus", "asunrice titus"],
    image: "asunrice+titus.jpeg",
  },
  {
    keywords: ["asun rice"],
    image: "asun rice.jpeg",
  },
  {
    keywords: ["asun delight"],
    image: "asun delight.jpeg",
  },
  {
    keywords: ["asun"],
    image: "asun.jpeg",
  },

  /* RICE */
  {
    keywords: ["seafood rice"],
    image: "seafood-rice.jpg",
  },
  {
    keywords: ["chinese delight"],
    image: "chineserice.jpeg",
  },
  {
    keywords: ["chinese prawn rice", "prawn rice"],
    image: "prawn rice.jpeg",
  },
  {
    keywords: ["chinese rice"],
    image: "chineserice.jpeg",
  },
  {
    keywords: ["coconut rice"],
    image: "coconut rice.jpeg",
  },
  {
    keywords: ["native rice"],
    image: "nativerice.jpeg",
  },
  {
    keywords: ["jambalaya"],
    image: "jambalaya rice.jpeg",
  },
  {
    keywords: ["pilaf rice", "pilaf"],
    image: "pilaf rice.jpeg",
  },
  {
    keywords: ["ofada"],
    image: "ofada.jpeg",
  },
  {
    keywords: ["white rice"],
    image: "white rice.jpeg",
  },
  {
    keywords: ["rice and beans", "rice beans"],
    image: "rice and beans.jpeg",
  },
  {
    keywords: ["beef rice"],
    image: "beef rice.jpeg",
  },
  {
    keywords: ["veggie rice", "vegetable rice"],
    image: "white rice.jpeg",
  },
  {
    keywords: ["fried rice", "golden harvest"],
    image: "friedrice.jpeg",
  },
  {
    keywords: ["party jollof", "jollof rice", "jollof"],
    image: "jollof-rice.jpg",
  },

  /* PASTA */
  {
    keywords: ["loaded turkey pasta"],
    image: "loaded-turkey-pasta.jpg",
  },
  {
    keywords: ["asun pasta"],
    image: "any-spaghetti-chicken.jpg",
  },
  {
    keywords: ["mixed pasta"],
    image: "spaghetti.jpeg",
  },
  {
    keywords: ["reload spag", "reload spaghetti"],
    image: "reload spag.jpeg",
  },
  {
    keywords: ["fishgetti"],
    image: "fishgetti.jpeg",
  },
  {
    keywords: ["native spaghetti", "native pasta"],
    image: "native pasta.jpeg",
  },
  {
    keywords: [
      "creamy penne",
      "executive penne",
      "penne royale",
      "penne supreme",
      "penne pasta",
      "penne",
    ],
    image: "penne pasta.jpeg",
  },
  {
    keywords: ["shredded beef pasta", "shredded pasta"],
    image: "shredded pasta.jpeg",
  },
  {
    keywords: ["cravings pasta"],
    image: "cravings-pasta.jpg",
  },
  {
    keywords: ["premium beefghetti", "beefghetti deluxe"],
    image: "premium-beefghetti-deluxe.jpg",
  },
  {
    keywords: ["smoky beefghetti"],
    image: "smoky-beefghetti-chicken-clean.jpg",
  },
  {
    keywords: ["royale pasta", "pasta", "spaghetti", "spag"],
    image: "pasta.jpg",
  },

  /* SOUPS & SWALLOWS */
  {
    keywords: ["seafood okra", "seafood okro"],
    image: "seafoodokra.jpeg",
  },
  {
    keywords: ["pepper soup and bread", "peppersoup and bread"],
    image: "pepper-soup-bread-rolls.jpg",
  },
  {
    keywords: ["assorted pepper soup", "assorted peppersoup"],
    image: "assortedpeppersoup.jpeg",
  },
  {
    keywords: ["catfish pepper", "catfish peppersoup"],
    image: "catfish peppersoup.jpeg",
  },
  {
    keywords: ["chicken pepper", "chicken peppersoup"],
    image: "chicken peppersoup.jpeg",
  },
  {
    keywords: ["croaker pepper", "croaker peppersoup"],
    image: "croaker peppersoup.jpeg",
  },
  {
    keywords: ["mullet pepper", "mullet peppersoup"],
    image: "mullet peppersoup.jpeg",
  },
  {
    keywords: ["turkey pepper", "turkey peppersoup"],
    image: "turkeypeppersoup.jpeg",
  },
  {
    keywords: ["afang", "efo riro"],
    image: "efo riro.jpeg",
  },
  {
    keywords: ["egusi"],
    image: "egusi.jpeg",
  },
  {
    keywords: ["okro", "okra"],
    image: "okra.jpeg",
  },
  {
    keywords: ["amala"],
    image: "amala.jpeg",
  },
  {
    keywords: ["poundo", "pounded yam"],
    image: "pounded yam.jpeg",
  },
  {
    keywords: ["porridge yam"],
    image: "porridge yam.jpeg",
  },
  {
    keywords: ["semo"],
    image: "semo.jpeg",
  },
  {
    keywords: ["eba"],
    image: "eba.jpeg",
  },
  {
    keywords: ["wheat"],
    image: "wheat.jpeg",
  },

  /* FISH */
  {
    keywords: ["peppered fish"],
    image: "peppered-fish.jpg",
  },
  {
    keywords: ["croaker fish"],
    image: "fried croaker.jpeg",
  },
  {
    keywords: ["peppered stew fish", "tilapia in stew"],
    image: "tilapia in stew.jpeg",
  },
  {
    keywords: ["peppered grilled fish", "bbq fish", "flame grilled ocean"],
    image: "bbq fish.jpeg",
  },
  {
    keywords: ["bbq catfish"],
    image: "bbq catfish.jpeg",
  },
  {
    keywords: ["croakeer in stew", "croaker in stew"],
    image: "croakeer in stew.jpeg",
  },
  {
    keywords: ["fried croaker"],
    image: "fried croaker.jpeg",
  },
  {
    keywords: ["owere fish with fries"],
    image: "owere fish with fries.jpeg",
  },
  {
    keywords: ["owere"],
    image: "owere.jpeg",
  },
  {
    keywords: ["sweet and sour fish", "sweet sour fish"],
    image: "sweet&sour fish.jpeg",
  },
  {
    keywords: ["titus pepper", "titus fish", "titus"],
    image: "titus fish.jpeg",
  },
  {
    keywords: ["white fish"],
    image: "fried croaker.jpeg",
  },

  /* PROTEINS & SIDES */
  {
    keywords: ["ayamase sauce", "ayamase", "designer stew"],
    image: "ayamase.jpeg",
  },
  {
    keywords: ["mix meat sauce", "mixed meat"],
    image: "cabbage sauce.jpeg",
  },
  {
    keywords: ["curry sauce"],
    image: "currysauce.jpeg",
  },
  {
    keywords: ["combination sauce", "cabbage sauce"],
    image: "cabbage sauce.jpeg",
  },
  {
    keywords: ["egg sauce"],
    image: "egg sauce.jpeg",
  },
  {
    keywords: ["prawn sauce"],
    image: "prawn sauce.jpeg",
  },
  {
    keywords: ["prawn kebab"],
    image: "prawn kebab.jpeg",
  },
  {
    keywords: ["sausage kebab"],
    image: "sausage-kebab.jpg",
  },
  {
    keywords: ["peppered goat", "goat meat"],
    image: "peppered goatmeat.jpeg",
  },
  {
    keywords: ["peppered turkey"],
    image: "peppered turkey.jpeg",
  },
  {
    keywords: ["grilled turkey", "big turkey"],
    image: "grilled turkey.jpeg",
  },
  {
    keywords: ["turkey"],
    image: "turkey.jpeg",
  },
  {
    keywords: ["chili chicken"],
    image: "chili chicken.jpeg",
  },
  {
    keywords: ["chicken and fries", "chicken fries"],
    image: "chicken&fries.jpeg",
  },
  {
    keywords: ["chicken wrap"],
    image: "chicken wrap.jpeg",
  },
  {
    keywords: ["beef wrap"],
    image: "beef wrap.jpeg",
  },
  {
    keywords: ["chinese shredded beef", "shredded beef"],
    image: "chineses shredded beef.jpeg",
  },
  {
    keywords: ["drumstick"],
    image: "drumstick.jpeg",
  },
  {
    keywords: ["chicken"],
    image: "chicken.jpeg",
  },
  {
    keywords: ["gizzard kebab", "gizzard"],
    image: "gizzard.jpeg",
  },
  {
    keywords: ["snail"],
    image: "snail.jpeg",
  },
  {
    keywords: ["shaki"],
    image: "shaki.jpeg",
  },
  {
    keywords: ["kpomo"],
    image: "kpomo.jpeg",
  },
  {
    keywords: ["cow leg"],
    image: "cow leg.jpeg",
  },
  {
    keywords: ["beef"],
    image: "beef.jpeg",
  },
  {
    keywords: ["plantain porridge"],
    image: "plantain porridge.jpeg",
  },
  {
    keywords: ["plantain"],
    image: "plantain.jpeg",
  },
  {
    keywords: ["beans and corn"],
    image: "beans and corn.jpeg",
  },
  {
    keywords: ["porridge beans", "beans porridge"],
    image: "beans porridge.jpeg",
  },
  {
    keywords: ["moi moi", "moimoi"],
    image: "moimoi.jpeg",
  },
  {
    keywords: ["small chops", "smallchops"],
    image: "smallchops.jpeg",
  },

  /* STREET / BREAKFAST */
  {
    keywords: ["shawarma", "breadwarma"],
    image: "shawarma.jpeg",
  },
  {
    keywords: ["bread warma", "breadwarma"],
    image: "breadwarma.jpeg",
  },
  {
    keywords: ["garden salad"],
    image: "garden-salad.jpg",
  },
  {
    keywords: ["sunrise brunch"],
    image: "signature brunch.jpeg",
  },
  {
    keywords: ["pancake"],
    image: "pancake.jpeg",
  },
  {
    keywords: ["waffle"],
    image: "waffle.jpeg",
  },
  {
    keywords: ["custard and moi", "custard moi"],
    image: "custard&moimoi.jpeg",
  },
  {
    keywords: ["pap and moi", "pap moi"],
    image: "pap&moimoi.jpeg",
  },
  {
    keywords: ["oat and moi", "oat moi"],
    image: "oat&moimoi.jpeg",
  },
  {
    keywords: ["burger"],
    image: "burger.jpg",
  },
];

const GENERIC_IMAGE_TOKENS = new Set([
  "box",
  "feast",
  "with",
  "and",
  "the",
  "for",
  "meal",
  "food",
]);

function significantTokens(value: string) {
  return normalizeName(value)
    .split(" ")
    .filter(
      (token) => token.length >= 4 && !GENERIC_IMAGE_TOKENS.has(token)
    );
}

function imageSharesMeal(mealName: string, imagePath: string) {
  const nameTokens = significantTokens(mealName);
  const file = decodeURIComponent(imagePath.split("/").pop() || "").replace(
    /\.[a-z0-9]+$/i,
    ""
  );

  return significantTokens(file).some((token) =>
    nameTokens.some(
      (nameToken) =>
        nameToken.includes(token) || token.includes(nameToken)
    )
  );
}

function matchLocalImage(
  mealName: string
): { path: string; length: number } | null {
  const normalized = normalizeName(mealName);

  if (!normalized) {
    return null;
  }

  let bestImage: string | null = null;
  let bestLength = 0;

  for (const { keywords, image } of IMAGE_MATCHES) {
    for (const keyword of keywords) {
      const normalizedKeyword = normalizeName(keyword);

      if (
        normalizedKeyword &&
        normalized.includes(normalizedKeyword) &&
        normalizedKeyword.length > bestLength
      ) {
        bestImage = image;
        bestLength = normalizedKeyword.length;
      }
    }
  }

  return bestImage
    ? { path: toPublicImagePath(bestImage), length: bestLength }
    : null;
}

function normalizeStoredImageUrl(imageUrl?: string | null): string | null {
  if (!imageUrl) {
    return null;
  }

  const clean = imageUrl.trim();

  if (!clean) {
    return null;
  }

  if (
    clean.startsWith("http://") ||
    clean.startsWith("https://") ||
    clean.startsWith("/")
  ) {
    return clean;
  }

  return toPublicImagePath(clean);
}

/**
 * Prefer a curated local match for known meal names, then fall back to DB URL.
 * This covers missing Supabase image_url values and a few incorrect mappings.
 */
export function resolveMenuImage(
  mealName: string,
  imageUrl?: string | null
): string | null {
  const localMatch = matchLocalImage(mealName);
  const stored = normalizeStoredImageUrl(imageUrl);
  const localPath = localMatch?.path || null;

  // Prefer local curated match when the meal name is clearly mapped
  // and the stored URL is empty, generic, or a different food.
  if (localPath) {
    if (!stored) {
      return localPath;
    }

    if (
      localMatch &&
      localMatch.length >= 8 &&
      imageSharesMeal(mealName, localPath) &&
      !imageSharesMeal(mealName, stored)
    ) {
      return localPath;
    }

    const storedNormalized = stored.toLowerCase();
    const localIsProductBox =
      /box-|box\.png|platter\.png/i.test(localPath);
    const mealIsProductBox = /\bbox\b|\bplatter\b/i.test(mealName);
    const genericBrunch = storedNormalized.includes("food-brunch.jpeg");
    const genericPasta =
      storedNormalized.includes("pasta.jpg") &&
      /box|platter|feast|jollof|rice|soup|fish|shawarma|amala/i.test(
        mealName
      );

    const localIsSpecificPasta =
      /reload%20spag|shredded%20pasta|native%20pasta|penne%20pasta|fishgetti|cravings-pasta|beefghetti-deluxe|smoky-beefghetti/i.test(
        localPath
      );

    if (
      ((genericBrunch || genericPasta) &&
        !(localIsProductBox && !mealIsProductBox)) ||
      (storedNormalized.includes("pasta.jpg") && localIsSpecificPasta)
    ) {
      return localPath;
    }
  }

  return stored || localPath;
}

export function polishCollectionName(
  mealName: string,
  collection: string
): string {
  const collectionName = (collection || "").trim();
  const normalizedCollection = collectionName.toLowerCase();

  if (
    !collectionName ||
    normalizedCollection === "rhennie tasty shack"
  ) {
    const name = mealName.toLowerCase();

    if (/box|platter|feast/.test(name)) {
      return "Luxury Food Boxes";
    }

    if (/fish|sauce|soup|stew/.test(name)) {
      return "Soups, Sides & Sauces";
    }

    return "Signature Feast Collection";
  }

  return collectionName;
}

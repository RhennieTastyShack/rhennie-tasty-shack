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
  /* FOOD BOXES & PLATTERS */
  {
    keywords: ["jollof pasta food box", "jollof and pasta feast", "32k jollof"],
    image: "Jollof & Pasta Feast Box.png",
  },
  {
    keywords: ["50k premium food box", "family feast box"],
    image: "Family Feast Box.png",
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
    keywords: ["heritage feast", "chief s heritage"],
    image: "Heritage Feast Box.png",
  },
  {
    keywords: ["luxury brunch box"],
    image: "Luxury Brunch Box.png",
  },
  {
    keywords: ["weekend treat box"],
    image: "Weekend Treat Box.png",
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
    image: "efo riro.jpeg",
  },

  /* SIGNATURE / COMBOS */
  {
    keywords: ["ayamase royal"],
    image: "ayamaseroyal.jpeg",
  },
  {
    keywords: ["jollof rice turkey", "jollof turkey", "imperial jollof"],
    image: "jollofrice-turkey.jpeg",
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
    keywords: ["reload spag", "reload spaghetti"],
    image: "reload spag.jpeg",
  },
  {
    keywords: ["fishgetti"],
    image: "fishgetti.jpeg",
  },
  {
    keywords: ["native pasta"],
    image: "native pasta.jpeg",
  },
  {
    keywords: ["penne pasta", "penne"],
    image: "penne pasta.jpeg",
  },
  {
    keywords: ["shredded pasta"],
    image: "shredded pasta.jpeg",
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
    keywords: ["efo riro"],
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
    keywords: ["pounded yam"],
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
    keywords: ["cabbage sauce"],
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
    image: "sausage kebab.jpeg",
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
    keywords: ["gizzard"],
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
    keywords: ["beans porridge"],
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

function matchLocalImage(mealName: string): string | null {
  const normalized = normalizeName(mealName);

  if (!normalized) {
    return null;
  }

  const match = IMAGE_MATCHES.find(({ keywords }) =>
    keywords.some((keyword) =>
      normalized.includes(normalizeName(keyword))
    )
  );

  return match ? toPublicImagePath(match.image) : null;
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

  // Prefer local curated match when the meal name is clearly mapped
  // and the stored URL is empty or a generic pasta/fallback.
  if (localMatch) {
    if (!stored) {
      return localMatch;
    }

    const storedNormalized = stored.toLowerCase();
    const isGenericFallback =
      storedNormalized.includes("pasta.jpg") &&
      /box|platter|feast|jollof|rice|soup|fish|shawarma|amala/i.test(
        mealName
      );

    if (isGenericFallback) {
      return localMatch;
    }
  }

  return stored || localMatch;
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

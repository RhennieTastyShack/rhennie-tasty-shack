import { NextResponse } from "next/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  CATALOG_DISHES,
  RETIRED_CATALOG_NAMES,
  applyMenuWording,
  type CatalogDish,
} from "@/lib/catalog-dishes";
import {
  PARTY_COLLECTION,
  PARTY_DISHES,
  RETIRED_PARTY_DISHES,
  type PartyDish,
} from "@/lib/party-menu";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL is missing");
}

if (!serviceRoleKey) {
  throw new Error("SUPABASE_SERVICE_ROLE_KEY is missing");
}

const supabaseAdmin = createClient(
  supabaseUrl,
  serviceRoleKey
);

async function ensurePartyMenu(client: SupabaseClient) {
  await client
    .from("menu")
    .update({ collection: PARTY_COLLECTION })
    .eq("collection", "Party Table")
    .in(
      "name",
      PARTY_DISHES.map((dish) => dish.name)
    );

  await client
    .from("collections")
    .update({
      name: PARTY_COLLECTION,
      slug: "appetizers",
    })
    .eq("slug", "party-table");

  for (const dish of PARTY_DISHES) {
    await syncPartyDish(client, dish);
  }

  if (RETIRED_PARTY_DISHES.length > 0) {
    await client
      .from("menu")
      .update({ available: false })
      .in("name", RETIRED_PARTY_DISHES);

    await client
      .from("menu_items")
      .update({ available: false })
      .in("name", RETIRED_PARTY_DISHES);
  }

  const { data: collection } = await client
    .from("collections")
    .select("id")
    .eq("slug", "appetizers")
    .maybeSingle();

  let collectionId = collection?.id as string | undefined;

  if (!collectionId) {
    const created = await client
      .from("collections")
      .insert({
        name: PARTY_COLLECTION,
        slug: "appetizers",
        active: true,
        display_order: 12,
      })
      .select("id")
      .maybeSingle();

    collectionId = created.data?.id as string | undefined;
  }

  if (!collectionId) return;

  const { data: currentItems } = await client
    .from("menu_items")
    .select("name")
    .eq("collection_id", collectionId);

  const currentNames = new Set(
    (currentItems || []).map((row) => String(row.name))
  );

  for (const [index, dish] of PARTY_DISHES.entries()) {
    const names = [dish.name, ...(dish.previousNames || [])];
    const { data: rows } = await client
      .from("menu_items")
      .select("id, name, collection_id, description, price, available, image_url")
      .in("name", names);

    const match =
      (rows || []).find(
        (row) =>
          row.name === dish.name && row.collection_id === collectionId
      ) ||
      (rows || []).find((row) =>
        (dish.previousNames || []).includes(String(row.name))
      );

    const values: Record<string, unknown> = {
      name: dish.name,
      description: dish.description,
      price: dish.price,
      available: true,
      collection_id: collectionId,
    };

    if (dish.image) values.image_url = dish.image;

    if (match?.id) {
      const unchanged =
        match.name === dish.name &&
        match.collection_id === collectionId &&
        match.description === dish.description &&
        Number(match.price) === dish.price &&
        match.available !== false &&
        (!dish.image || match.image_url === dish.image);

      if (!unchanged) {
        await writeFlexible(client, "menu_items", values, match.id);
      }
      continue;
    }

    if (currentNames.has(dish.name)) continue;

    values.featured = false;
    values.display_order = 80 + index;
    values.sort_order = index;
    await writeFlexible(client, "menu_items", values);
  }
}

async function syncPartyDish(client: SupabaseClient, dish: PartyDish) {
  const names = [dish.name, ...(dish.previousNames || [])];
  const { data: rows, error } = await client
    .from("menu")
    .select("id, name, collection, description, price, available, image_url")
    .in("name", names);

  if (error) return;

  const match =
    (rows || []).find(
      (row) =>
        row.name === dish.name &&
        (row.collection === PARTY_COLLECTION ||
          row.collection === "Party Table")
    ) ||
    (rows || []).find((row) =>
      (dish.previousNames || []).includes(String(row.name))
    );

  const values: Record<string, unknown> = {
    name: dish.name,
    collection: PARTY_COLLECTION,
    description: dish.description,
    price: dish.price,
    available: true,
  };

  if (dish.image) values.image_url = dish.image;

  if (match?.id) {
    const unchanged =
      match.name === dish.name &&
      match.collection === PARTY_COLLECTION &&
      match.description === dish.description &&
        Number(match.price) === dish.price &&
        match.available !== false &&
        (!dish.image || match.image_url === dish.image);

    if (!unchanged) {
      await writeFlexible(client, "menu", values, match.id);
    }
    return;
  }

  await writeFlexible(client, "menu", values);
}

async function writeFlexible(
  client: SupabaseClient,
  table: "menu" | "menu_items",
  values: Record<string, unknown>,
  id?: string
) {
  const payload = { ...values };

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const query = client.from(table);
    const result = id
      ? await query.update(payload).eq("id", id)
      : await query.insert(payload);

    if (!result.error) return;

    const missingColumn = String(result.error.message || "").match(
      /Could not find the '([^']+)' column/
    );

    if (missingColumn && missingColumn[1] in payload) {
      delete payload[missingColumn[1]];
      continue;
    }

    return;
  }
}

async function ensureCatalog(client: SupabaseClient) {
  const { data: collections } = await client
    .from("collections")
    .select("id, name, slug");

  for (const dish of CATALOG_DISHES) {
    await syncCatalogMenu(client, dish);

    const collectionId = collectionIdFor(
      collections || [],
      dish.collectionMatch
    );

    if (collectionId) {
      await syncCatalogMenuItem(client, dish, collectionId);
    }
  }

  for (const table of ["menu", "menu_items"] as const) {
    await client
      .from(table)
      .update({ name: "Jambalaya Rice" })
      .eq("name", "Jamalaya Rice");
    await client
      .from(table)
      .update({ name: "Shredded Beef Pasta" })
      .eq("name", "Shredded Pasta");
    await collapseCatfishPepperSoup(client, table);
    await hideTitusPepperSoup(client, table);
  }

  if (RETIRED_CATALOG_NAMES.length > 0) {
    await client
      .from("menu")
      .update({ available: false })
      .in("name", RETIRED_CATALOG_NAMES);

    await client
      .from("menu_items")
      .update({ available: false })
      .in("name", RETIRED_CATALOG_NAMES);
  }

  const pricesByName = new Map<string, number[]>();

  for (const dish of CATALOG_DISHES) {
    const prices = pricesByName.get(dish.name) || [];

    if (!prices.includes(dish.price)) prices.push(dish.price);

    pricesByName.set(dish.name, prices);
  }

  for (const [name, prices] of pricesByName) {
    await retireOtherPrices(client, "menu", name, prices);
    await retireOtherPrices(client, "menu_items", name, prices);
    await keepOneRowPerPrice(client, "menu", name, prices);
    await keepOneRowPerPrice(client, "menu_items", name, prices);
  }

  await renamePortionWording(client, "menu");
  await renamePortionWording(client, "menu_items");

  for (const table of ["menu", "menu_items"] as const) {
    await setPortionPrices(client, table);
  }
}

const PORTION_PRICES: Array<[string, number, string?]> = [
  ["White Rice", 500],
  ["Reload Spaghetti", 1100],
  [
    "Mixed Pasta",
    2500,
    "Mix spaghetti, reload spaghetti, fishgetti, penne, shredded beef pasta and native pasta on one plate.",
  ],
  ["Shaki", 1500],
  ["Asun Sauce", 3500],
  ["Asun Pasta", 3000, "Asun pasta, one portion."],
];

async function setPortionPrices(
  client: SupabaseClient,
  table: "menu" | "menu_items"
) {
  for (const [name, price, description] of PORTION_PRICES) {
    const { data, error } = await client
      .from(table)
      .select("id, available")
      .eq("name", name);

    if (error || !data?.length) continue;

    const keeper =
      data.find((row) => row.available !== false) || data[0];
    const values: Record<string, unknown> = { price, available: true };
    if (description) values.description = description;

    await client.from(table).update(values).eq("id", keeper.id);

    for (const row of data) {
      if (row.id === keeper.id) continue;
      await client.from(table).update({ available: false }).eq("id", row.id);
    }
  }
}

async function hideTitusPepperSoup(
  client: SupabaseClient,
  table: "menu" | "menu_items"
) {
  const { data, error } = await client
    .from(table)
    .select("id, name, available")
    .ilike("name", "%titus%pepper%");

  if (error || !data) return;

  for (const row of data) {
    if (row.available === false) continue;

    await client.from(table).update({ available: false }).eq("id", row.id);
  }
}

async function collapseCatfishPepperSoup(
  client: SupabaseClient,
  table: "menu" | "menu_items"
) {
  const { data, error } = await client
    .from(table)
    .select("id, name, available")
    .ilike("name", "%catfish pepper%");

  if (error || !data || data.length < 2) return;

  const keeper =
    data.find(
      (row) =>
        String(row.name).trim().toLowerCase() === "catfish pepper soup" &&
        row.available !== false
    ) ||
    data.find((row) => row.available !== false) ||
    data[0];

  for (const row of data) {
    if (row.id === keeper.id) continue;

    await client.from(table).update({ available: false }).eq("id", row.id);
  }
}

async function renamePortionWording(
  client: SupabaseClient,
  table: "menu" | "menu_items"
) {
  const { data: rows, error } = await client
    .from(table)
    .select("id, name, description");

  if (error) return;

  for (const row of rows || []) {
    const name = applyMenuWording(String(row.name || ""));
    const description = applyMenuWording(String(row.description || ""));

    if (!name || (name === row.name && description === (row.description || ""))) {
      continue;
    }

    await client
      .from(table)
      .update({ name, description })
      .eq("id", row.id);
  }
}

async function keepOneRowPerPrice(
  client: SupabaseClient,
  table: "menu" | "menu_items",
  name: string,
  prices: number[]
) {
  const { data: rows, error } = await client
    .from(table)
    .select("id, price")
    .eq("name", name)
    .eq("available", true);

  if (error) return;

  const seen = new Set<number>();

  for (const row of rows || []) {
    const price = Number(row.price);

    if (!prices.includes(price)) continue;

    if (seen.has(price)) {
      await client.from(table).update({ available: false }).eq("id", row.id);
      continue;
    }

    seen.add(price);
  }
}

async function retireOtherPrices(
  client: SupabaseClient,
  table: "menu" | "menu_items",
  name: string,
  prices: number[]
) {
  const { data: rows, error } = await client
    .from(table)
    .select("id, price")
    .eq("name", name);

  if (error) return;

  for (const row of rows || []) {
    if (prices.includes(Number(row.price))) continue;

    await client
      .from(table)
      .update({ available: false })
      .eq("id", row.id);
  }
}

function findCatalogMatch<
  T extends {
    name?: string;
    price?: number | string;
    collection?: string;
    collection_id?: string;
  },
>(rows: T[], dish: CatalogDish, collectionId?: string) {
  const inCollection = collectionId
    ? rows.filter((row) => row.collection_id === collectionId)
    : rows.filter(
        (row) => String(row.collection || "") === dish.collection
      );
  const pool = inCollection.length > 0 ? inCollection : rows;

  const exact = pool.find(
    (row) =>
      row.name === dish.name && Number(row.price) === dish.price
  );

  if (exact) return exact;

  if (dish.previousPrice != null) {
    const sameName = pool.find(
      (row) =>
        row.name === dish.name &&
        Number(row.price) === dish.previousPrice
    );

    if (sameName) return sameName;
  }

  const named = pool.filter((row) => row.name === dish.name);

  if (named.length === 1) return named[0];

  const previous = pool.filter((row) =>
    (dish.previousNames || []).includes(String(row.name))
  );
  const priced =
    dish.previousPrice == null
      ? previous.find((row) => Number(row.price) === dish.price)
      : previous.find((row) => Number(row.price) === dish.previousPrice);

  if (priced) return priced;
  if (dish.replaceOne && previous[0]) return previous[0];
  if (previous.length === 1) return previous[0];

  return undefined;
}

function collectionIdFor(
  collections: Array<{ id?: string; name?: string; slug?: string }>,
  matchers: string[]
) {
  const found = collections.find((collection) => {
    const name = String(collection.name || "").toLowerCase();
    const slug = String(collection.slug || "").toLowerCase();

    return matchers.some(
      (matcher) => name.includes(matcher) || slug.includes(matcher)
    );
  });

  return found?.id;
}

async function syncCatalogMenu(
  client: SupabaseClient,
  dish: CatalogDish
) {
  const names = [dish.name, ...(dish.previousNames || [])];
  const { data: rows, error } = await client
    .from("menu")
    .select("id, name, collection, description, price, available, image_url")
    .in("name", names);

  if (error) return;

  const match = findCatalogMatch(rows || [], dish);

  const values: Record<string, unknown> = {
    name: dish.name,
    collection: dish.collection,
    description: dish.description,
    price: dish.price,
    available: true,
  };

  if (dish.image) values.image_url = dish.image;

  if (match?.id) {
    const unchanged =
      match.name === dish.name &&
      match.collection === dish.collection &&
      match.description === dish.description &&
      Number(match.price) === dish.price &&
      match.available !== false &&
      (!dish.image || match.image_url === dish.image);

    if (!unchanged) {
      await writeFlexible(client, "menu", values, match.id);
    }
    return;
  }

  await writeFlexible(client, "menu", values);
}

async function syncCatalogMenuItem(
  client: SupabaseClient,
  dish: CatalogDish,
  collectionId: string
) {
  const names = [dish.name, ...(dish.previousNames || [])];
  const { data: rows, error } = await client
    .from("menu_items")
    .select(
      "id, name, collection_id, description, price, available, image_url, display_order, sort_order"
    )
    .in("name", names);

  if (error) return;

  const match = findCatalogMatch(rows || [], dish, collectionId);

  const values: Record<string, unknown> = {
    name: dish.name,
    description: dish.description,
    price: dish.price,
    available: true,
    collection_id: collectionId,
    display_order: match?.display_order ?? dish.displayOrder,
    sort_order: match?.sort_order ?? dish.sortOrder,
  };

  if (dish.image) values.image_url = dish.image;

  if (match?.id) {
    const unchanged =
      match.name === dish.name &&
      match.collection_id === collectionId &&
      match.description === dish.description &&
      Number(match.price) === dish.price &&
      match.available !== false &&
      (!dish.image || match.image_url === dish.image);

    if (!unchanged) {
      await writeFlexible(client, "menu_items", values, match.id);
    }
    return;
  }

  values.featured = false;
  values.display_order = dish.displayOrder;
  values.sort_order = dish.sortOrder;
  await writeFlexible(client, "menu_items", values);
}

let catalogSync: Promise<void> | null = null;
let catalogSyncedAt = 0;
const CATALOG_SYNC_GAP_MS = 15 * 60 * 1000;

function startCatalogSync() {
  if (catalogSync || Date.now() - catalogSyncedAt < CATALOG_SYNC_GAP_MS) {
    return;
  }

  catalogSync = (async () => {
    try {
      await ensurePartyMenu(supabaseAdmin);
      await ensureCatalog(supabaseAdmin);
      catalogSyncedAt = Date.now();
    } catch (error) {
      console.error("Menu sync error:", error);
    } finally {
      catalogSync = null;
    }
  })();
}

export async function GET() {
  try {
    startCatalogSync();

    const { data, error } = await supabaseAdmin
      .from("menu")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Menu API Error:", error);

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Menu API Error:", error);

    return NextResponse.json(
      { error: "Unable to load menu." },
      { status: 500 }
    );
  }
}
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

type AdminClient = SupabaseClient;

function lazyClient(factory: () => AdminClient): AdminClient {
  return new Proxy({} as AdminClient, {
    get(_target, prop, receiver) {
      const client = factory();
      const value = Reflect.get(client as object, prop, receiver);
      return typeof value === "function"
        ? (value as (...args: unknown[]) => unknown).bind(client)
        : value;
    },
  });
}

export function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
  }

  if (!serviceRoleKey) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export function getPublishableClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !publishableKey) {
    throw new Error("Missing Supabase public credentials");
  }

  return createClient(supabaseUrl, publishableKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/** Drop-in for module-scope clients — resolves on first property access. */
export const lazySupabaseAdmin = lazyClient(getSupabaseAdmin);
export const lazyPublishableClient = lazyClient(getPublishableClient);

export function cleanText(value: unknown) {
  return String(value ?? "").trim();
}

export function getBearerToken(request: Request) {
  const authorization = request.headers.get("authorization");

  if (!authorization) {
    return null;
  }

  const [type, token] = authorization.split(" ");

  if (type?.toLowerCase() !== "bearer" || !token) {
    return null;
  }

  return token.trim();
}

export async function getAuthUser(request: Request) {
  const token = getBearerToken(request);

  if (!token) {
    return null;
  }

  const supabase = getPublishableClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) {
    return null;
  }

  return user;
}

export function userOwnsOrder(
  user: { id: string; email?: string | null },
  order: { customer_id?: string | null; customer_email?: string | null }
) {
  if (order.customer_id && order.customer_id === user.id) {
    return true;
  }

  const email = user.email?.trim().toLowerCase();
  const orderEmail = String(order.customer_email || "").trim().toLowerCase();

  return Boolean(email && orderEmail && email === orderEmail);
}

export async function requireAdmin(request: Request) {
  const user = await getAuthUser(request);

  if (!user) {
    return null;
  }

  const { data: adminRow } = await getSupabaseAdmin()
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  return adminRow ? user : null;
}

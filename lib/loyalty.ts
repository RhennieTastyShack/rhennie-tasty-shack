import { getSupabaseAdmin } from "@/lib/supabase-admin";

const WEEK_BONUS = 200;
const MONTH_BONUS = 1000;
const YEAR_BONUS = 5000;

function weekKey(date: Date) {
  const start = new Date(Date.UTC(date.getFullYear(), 0, 1));
  const day = Math.floor((date.getTime() - start.getTime()) / 86400000);
  const week = Math.ceil((day + start.getUTCDay() + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

function monthKey(date: Date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function pointsForSpend(amountNgn: number) {
  return Math.max(0, Math.floor(amountNgn / 100));
}

export async function awardOrderPoints(orderId: string) {
  const supabase = getSupabaseAdmin();
  const { data: order } = await supabase
    .from("orders")
    .select("id, customer_email, customer_name, customer_id, total, amount, payment_status")
    .eq("id", orderId)
    .maybeSingle();

  if (!order?.customer_email) return;

  const email = String(order.customer_email).trim().toLowerCase();
  const spend = Number(order.total ?? order.amount ?? 0);
  const points = pointsForSpend(spend);

  if (!email || points <= 0) return;

  const { data: existing } = await supabase
    .from("loyalty_ledger")
    .select("id")
    .eq("order_id", orderId)
    .eq("reason", "order")
    .maybeSingle();

  if (existing) return;

  const { error: ledgerError } = await supabase.from("loyalty_ledger").insert({
    customer_email: email,
    order_id: orderId,
    points,
    reason: "order",
  });

  if (ledgerError) return;

  const { data: account } = await supabase
    .from("loyalty_accounts")
    .select("id, points, lifetime_spend")
    .eq("customer_email", email)
    .maybeSingle();

  if (account) {
    await supabase
      .from("loyalty_accounts")
      .update({
        points: Number(account.points || 0) + points,
        lifetime_spend: Number(account.lifetime_spend || 0) + spend,
        customer_name: order.customer_name || null,
        auth_user_id: order.customer_id || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", account.id);
  } else {
    await supabase.from("loyalty_accounts").insert({
      customer_email: email,
      auth_user_id: order.customer_id || null,
      customer_name: order.customer_name || null,
      points,
      lifetime_spend: spend,
      updated_at: new Date().toISOString(),
    });
  }

  await closeFinishedPeriods(supabase);
}

type OrderRow = {
  customer_email: string | null;
  customer_name: string | null;
  total: number | null;
  amount: number | null;
  created_at: string;
  payment_status: string | null;
};

async function closeFinishedPeriods(
  supabase: ReturnType<typeof getSupabaseAdmin>
) {
  const now = new Date();
  const previousWeek = new Date(now.getTime() - 7 * 86400000);
  const previousMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
  const previousYear = new Date(Date.UTC(now.getUTCFullYear() - 1, 0, 1));

  await awardPeriod(supabase, "week", weekKey(previousWeek), WEEK_BONUS);
  await awardPeriod(supabase, "month", monthKey(previousMonth), MONTH_BONUS);
  await awardPeriod(supabase, "year", String(previousYear.getUTCFullYear()), YEAR_BONUS);
}

async function awardPeriod(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  periodType: "week" | "month" | "year",
  periodKey: string,
  bonus: number
) {
  const { data: already } = await supabase
    .from("customer_period_rewards")
    .select("id")
    .eq("period_type", periodType)
    .eq("period_key", periodKey)
    .maybeSingle();

  if (already) return;

  const { data: orders } = await supabase
    .from("orders")
    .select("customer_email, customer_name, total, amount, created_at, payment_status")
    .eq("payment_status", "paid");

  const winner = topCustomer(
    (orders || []) as OrderRow[],
    periodType,
    periodKey
  );

  if (!winner) return;

  const { error } = await supabase.from("customer_period_rewards").insert({
    period_type: periodType,
    period_key: periodKey,
    customer_email: winner.email,
    customer_name: winner.name,
    spend: winner.spend,
    bonus_points: bonus,
  });

  if (error) return;

  const { data: account } = await supabase
    .from("loyalty_accounts")
    .select("id, points")
    .eq("customer_email", winner.email)
    .maybeSingle();

  if (account) {
    await supabase
      .from("loyalty_accounts")
      .update({
        points: Number(account.points || 0) + bonus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", account.id);
  }

  await supabase.from("loyalty_ledger").insert({
    customer_email: winner.email,
    order_id: null,
    points: bonus,
    reason: `${periodType}-best-${periodKey}`,
  });
}

function topCustomer(
  orders: OrderRow[],
  periodType: "week" | "month" | "year",
  periodKey: string
) {
  const totals = new Map<string, { email: string; name: string; spend: number }>();

  for (const order of orders) {
    if (String(order.payment_status || "").toLowerCase() !== "paid") continue;
    const email = String(order.customer_email || "").trim().toLowerCase();
    if (!email) continue;
    const created = new Date(order.created_at);
    if (Number.isNaN(created.getTime())) continue;

    const key =
      periodType === "week"
        ? weekKey(created)
        : periodType === "month"
          ? monthKey(created)
          : String(created.getUTCFullYear());

    if (key !== periodKey) continue;

    const current = totals.get(email) || {
      email,
      name: order.customer_name || email,
      spend: 0,
    };
    current.spend += Number(order.total ?? order.amount ?? 0);
    if (order.customer_name) current.name = order.customer_name;
    totals.set(email, current);
  }

  return [...totals.values()].sort((a, b) => b.spend - a.spend)[0] || null;
}

export async function getLoyaltyBoard(email: string | null) {
  const supabase = getSupabaseAdmin();

  const { data: paidOrders } = await supabase
    .from("orders")
    .select("id")
    .eq("payment_status", "paid")
    .order("created_at", { ascending: false })
    .limit(40);

  for (const order of paidOrders || []) {
    await awardOrderPoints(order.id);
  }

  await closeFinishedPeriods(supabase);

  const { data: orders } = await supabase
    .from("orders")
    .select("customer_email, customer_name, total, amount, created_at, payment_status")
    .eq("payment_status", "paid");

  const now = new Date();
  const rows = (orders || []) as OrderRow[];

  const accountEmail = email?.trim().toLowerCase() || "";
  const { data: account } = accountEmail
    ? await supabase
        .from("loyalty_accounts")
        .select("points, lifetime_spend, customer_name")
        .eq("customer_email", accountEmail)
        .maybeSingle()
    : { data: null };

  return {
    points: Number(account?.points || 0),
    lifetimeSpend: Number(account?.lifetime_spend || 0),
    week: rankPeriod(rows, "week", weekKey(now), accountEmail),
    month: rankPeriod(rows, "month", monthKey(now), accountEmail),
    year: rankPeriod(rows, "year", String(now.getUTCFullYear()), accountEmail),
    rewards: {
      week: "200 bonus points and a thank-you from the kitchen",
      month: "1,000 bonus points",
      year: "5,000 bonus points",
    },
  };
}

function rankPeriod(
  orders: OrderRow[],
  periodType: "week" | "month" | "year",
  periodKey: string,
  email: string
) {
  const totals = new Map<string, { email: string; name: string; spend: number }>();

  for (const order of orders) {
    const customerEmail = String(order.customer_email || "").trim().toLowerCase();
    if (!customerEmail) continue;
    const created = new Date(order.created_at);
    if (Number.isNaN(created.getTime())) continue;
    const key =
      periodType === "week"
        ? weekKey(created)
        : periodType === "month"
          ? monthKey(created)
          : String(created.getUTCFullYear());
    if (key !== periodKey) continue;
    const current = totals.get(customerEmail) || {
      email: customerEmail,
      name: order.customer_name || "Customer",
      spend: 0,
    };
    current.spend += Number(order.total ?? order.amount ?? 0);
    totals.set(customerEmail, current);
  }

  const ranked = [...totals.values()].sort((a, b) => b.spend - a.spend);
  const leader = ranked[0] || null;
  const mine = ranked.findIndex((row) => row.email === email);

  return {
    leader: leader
      ? {
          name: leader.name,
          spend: leader.spend,
          you: leader.email === email,
        }
      : null,
    yourRank: mine >= 0 ? mine + 1 : null,
    yourSpend: mine >= 0 ? ranked[mine].spend : 0,
  };
}

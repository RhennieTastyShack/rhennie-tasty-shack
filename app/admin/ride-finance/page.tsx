"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Totals = {
  registered_partners: number;
  pending_verification: number;
  approved_partners: number;
  online_partners: number;
  suspended_partners: number;
  deliveries_today: number;
  deliveries_in_progress: number;
  completed_deliveries: number;
  food_revenue: number;
  delivery_volume: number;
  platform_commission_earned: number;
  partner_gross_earnings: number;
  partner_net_earnings: number;
  pending_partner_payouts: number;
  completed_partner_payouts: number;
};

function money(value: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

export default function RideFinancePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [commission, setCommission] = useState(5);
  const [totals, setTotals] = useState<Totals | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session?.access_token) {
          throw new Error("Sign in to Rhennie Studio.");
        }

        const response = await fetch("/api/admin/ride-finance", {
          headers: { Authorization: `Bearer ${session.access_token}` },
          cache: "no-store",
        });
        const result = await response.json();
        if (!response.ok || !result?.success) {
          throw new Error(result?.message || "Unable to load finance.");
        }
        if (!active) return;
        setCommission(Number(result.ride_platform_commission) || 6.6);
        setTotals(result.totals);
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Unable to load.");
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <main className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="animate-spin text-[#C89B3C]" size={32} />
      </main>
    );
  }

  const cards = totals
    ? [
        ["Food revenue", money(totals.food_revenue)],
        ["Ride with 701 volume", money(totals.delivery_volume)],
        [
          `RTS platform commission (${commission}%)`,
          money(totals.platform_commission_earned),
        ],
        ["Partner gross earnings", money(totals.partner_gross_earnings)],
        ["Partner net earnings", money(totals.partner_net_earnings)],
        ["Pending partner payouts", money(totals.pending_partner_payouts)],
        ["Completed partner payouts", money(totals.completed_partner_payouts)],
        ["Registered partners", String(totals.registered_partners)],
        ["Pending verification", String(totals.pending_verification)],
        ["Approved partners", String(totals.approved_partners)],
        ["Online partners", String(totals.online_partners)],
        ["Suspended partners", String(totals.suspended_partners)],
        ["Deliveries today", String(totals.deliveries_today)],
        ["In progress", String(totals.deliveries_in_progress)],
        ["Completed deliveries", String(totals.completed_deliveries)],
      ]
    : [];

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#C89B3C]">
            Ride with 701
          </p>
          <h1 className="mt-2 font-serif text-3xl font-bold text-[#171717]">
            Logistics finance
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-black/50">
            Food sales and Ride with 701 platform commission are shown
            separately. Customers never see a second commission line.
          </p>
        </div>
        <Link
          href="/admin/settings"
          className="rounded-full border border-black/10 px-5 py-2.5 text-xs font-bold uppercase tracking-[0.14em] text-[#171717]"
        >
          Pricing settings
        </Link>
      </div>

      {error ? (
        <p className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
      ) : null}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(([label, value]) => (
          <div
            key={label}
            className="rounded-2xl border border-black/5 bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-black/40">
              {label}
            </p>
            <p className="mt-3 text-2xl font-bold text-[#171717]">{value}</p>
          </div>
        ))}
      </div>
    </main>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Leader = {
  name: string;
  spend: number;
  you: boolean;
};

type Period = {
  leader: Leader | null;
  yourRank: number | null;
  yourSpend: number;
};

type Board = {
  points: number;
  lifetimeSpend: number;
  week: Period;
  month: Period;
  year: Period;
  rewards: { week: string; month: string; year: string };
};

const money = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

export default function RewardsPage() {
  const [board, setBoard] = useState<Board | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) {
        setError("Sign in to see your rewards.");
        return;
      }
      const response = await fetch("/api/loyalty", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result?.message || "Rewards are unavailable.");
        return;
      }
      setBoard(result);
    }
    void load();
  }, []);

  return (
    <main className="min-h-screen bg-[#1A120B] px-4 py-10 text-white">
      <div className="mx-auto max-w-3xl">
        <Link href="/client-portal" className="text-sm text-white/50 hover:text-white">
          Back to portal
        </Link>
        <h1 className="mt-4 text-4xl font-bold">Rewards</h1>
        <p className="mt-2 text-white/60">
          You earn 1 point for every ₦100 you spend. The top customer each week,
          month, and year also receives a bonus.
        </p>

        {error && (
          <p className="mt-6 rounded-xl bg-red-500/15 px-4 py-3 text-sm text-red-200">
            {error}
          </p>
        )}

        {board && (
          <>
            <section className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6">
              <p className="text-sm uppercase tracking-[0.2em] text-white/45">
                Your points
              </p>
              <p className="mt-2 text-5xl font-bold text-[#F26A21]">{board.points}</p>
              <p className="mt-2 text-sm text-white/55">
                Lifetime spend {money.format(board.lifetimeSpend)}
              </p>
            </section>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <LeaderCard
                title="This week"
                reward={board.rewards.week}
                period={board.week}
              />
              <LeaderCard title="This month" reward={board.rewards.month} period={board.month} />
              <LeaderCard title="This year" reward={board.rewards.year} period={board.year} />
            </div>
          </>
        )}
      </div>
    </main>
  );
}

function LeaderCard({
  title,
  reward,
  period,
}: {
  title: string;
  reward: string;
  period: Period;
}) {
  const leader = period?.leader;
  return (
    <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <p className="text-xs uppercase tracking-[0.18em] text-white/40">{title}</p>
      <p className="mt-3 text-lg font-semibold">
        {leader ? leader.name : "No orders yet"}
        {leader?.you ? " (you)" : ""}
      </p>
      <p className="mt-1 text-sm text-white/55">
        {leader ? money.format(leader.spend) : "Be the first paid order"}
      </p>
      {period?.yourRank ? (
        <p className="mt-2 text-sm text-white/70">Your rank #{period.yourRank}</p>
      ) : null}
      <p className="mt-4 text-sm text-[#F26A21]">{reward}</p>
    </article>
  );
}

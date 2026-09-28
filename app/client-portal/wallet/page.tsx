"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { NIGERIAN_BANKS } from "@/lib/banks";
import { supabase } from "@/lib/supabase";

type LedgerRow = {
  id: string;
  kind: string;
  amount_ngn: number;
  status: string;
  note: string | null;
  created_at: string;
};

const money = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

export default function WalletPage() {
  const [balance, setBalance] = useState(0);
  const [held, setHeld] = useState(0);
  const [available, setAvailable] = useState(0);
  const [ledger, setLedger] = useState<LedgerRow[]>([]);
  const [fundAmount, setFundAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [bankCode, setBankCode] = useState<string>(NIGERIAN_BANKS[0].code);
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function token() {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token || "";
  }

  async function load() {
    const access = await token();
    if (!access) {
      setError("Sign in to open your RTS wallet.");
      return;
    }

    const response = await fetch("/api/wallet", {
      headers: { Authorization: `Bearer ${access}` },
    });
    const result = await response.json();

    if (!response.ok) {
      setError(result?.message || "Unable to open the RTS wallet.");
      return;
    }

    setError("");
    setBalance(result.balance || 0);
    setHeld(result.held || 0);
    setAvailable(result.available || 0);
    setLedger(result.ledger || []);
  }

  async function confirmReference(reference: string) {
    const access = await token();
    if (!access) return;

    const response = await fetch("/api/wallet", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access}`,
      },
      body: JSON.stringify({ action: "confirm", reference }),
    });
    const result = await response.json();

    if (result?.success) {
      setError("");
      setMessage(result.message || "Your wallet has been funded.");
      await load();
      return;
    }

    setMessage("");
    setError(result?.message || "The payment is not confirmed yet.");
  }

  useEffect(() => {
    async function start() {
      await load();
      const params = new URLSearchParams(window.location.search);
      const reference = params.get("reference") || params.get("trxref");
      if (reference?.startsWith("RTS-WALLET-")) {
        setMessage("Checking your card or bank payment...");
        await confirmReference(reference);
      }
    }

    void start();
  }, []);

  async function fund(channel: "card" | "bank") {
    const amount = Math.round(Number(fundAmount));
    if (!Number.isFinite(amount) || amount < 100) {
      setError("Enter ₦100 or more.");
      return;
    }

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const access = await token();
      const response = await fetch("/api/wallet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access}`,
        },
        body: JSON.stringify({
          action: "fund",
          channel,
          amount,
        }),
      });
      const result = await response.json();

      if (!response.ok || !result.authorizationUrl) {
        throw new Error(result?.message || "Unable to fund the wallet.");
      }

      window.location.href = result.authorizationUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to fund the wallet.");
      setLoading(false);
    }
  }

  async function withdraw(event: FormEvent) {
    event.preventDefault();
    const amount = Math.round(Number(withdrawAmount));
    if (!Number.isFinite(amount) || amount < 100) {
      setError("Enter ₦100 or more.");
      return;
    }

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const access = await token();
      const response = await fetch("/api/wallet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access}`,
        },
        body: JSON.stringify({
          action: "send",
          amount,
          bankCode,
          accountNumber,
          accountName,
        }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.message || "Unable to request a withdrawal.");
      }

      setMessage(result.message);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to request a withdrawal.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#080808] px-4 py-14 text-white">
      <div className="mx-auto max-w-3xl">
        <Link href="/client-portal" className="text-sm text-white/50">
          Back to portal
        </Link>
        <h1 className="mt-4 text-4xl font-bold">RTS Wallet</h1>
        <p className="mt-3 text-sm leading-7 text-white/70">
          Fund with your card or a bank transfer. Send money from the wallet
          to a Nigerian bank, or pay with RTS Wallet at checkout.
        </p>

        {error && (
          <p className="mt-6 rounded-2xl bg-red-500/15 px-4 py-3 text-sm text-red-200">
            {error}
          </p>
        )}
        {message && (
          <p className="mt-6 rounded-2xl bg-emerald-500/15 px-4 py-3 text-sm text-emerald-100">
            {message}
          </p>
        )}

        <section className="mt-8 grid gap-4 sm:grid-cols-3">
          <article className="rounded-3xl border border-[#D4AF37]/30 bg-[#171717] p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-white/45">Balance</p>
            <p className="mt-2 text-2xl font-bold">{money.format(balance)}</p>
          </article>
          <article className="rounded-3xl border border-white/10 bg-[#171717] p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-white/45">Held</p>
            <p className="mt-2 text-2xl font-bold">{money.format(held)}</p>
          </article>
          <article className="rounded-3xl border border-white/10 bg-[#171717] p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-white/45">Available</p>
            <p className="mt-2 text-2xl font-bold">{money.format(available)}</p>
          </article>
        </section>

        <form
          onSubmit={(event) => event.preventDefault()}
          className="mt-8 rounded-3xl border border-white/10 bg-[#111] p-6"
        >
          <h2 className="text-xl font-bold">Fund wallet</h2>
          <p className="mt-2 text-sm text-white/60">
            The smallest top-up is ₦100. Card opens Paystack card checkout. Bank opens a transfer. The balance updates when that payment is confirmed.
          </p>
          <label className="mt-4 block text-sm text-white/60">
            Amount (₦)
            <input
              value={fundAmount}
              onChange={(event) => setFundAmount(event.target.value)}
              inputMode="numeric"
              min={100}
              placeholder="100"
              className="mt-2 w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white"
            />
          </label>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              disabled={loading}
              onClick={() => void fund("card")}
              className="rounded-full bg-[#F26A21] px-6 py-3 text-sm font-bold disabled:opacity-60"
            >
              Fund with card
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => void fund("bank")}
              className="rounded-full border border-[#D4AF37] px-6 py-3 text-sm font-bold text-[#D4AF37] disabled:opacity-60"
            >
              Fund with bank
            </button>
          </div>
        </form>

        <form onSubmit={withdraw} className="mt-6 rounded-3xl border border-white/10 bg-[#111] p-6">
          <h2 className="text-xl font-bold">Send from wallet</h2>
          <p className="mt-2 text-sm text-white/60">
            This sends the amount from your RTS balance to the bank account below.
          </p>
          <div className="mt-4 grid gap-3">
            <input
              value={withdrawAmount}
              onChange={(event) => setWithdrawAmount(event.target.value)}
              inputMode="numeric"
              min={100}
              placeholder="100"
              className="rounded-xl border border-white/10 bg-black px-4 py-3"
            />
            <select
              value={bankCode}
              onChange={(event) => setBankCode(event.target.value)}
              className="rounded-xl border border-white/10 bg-black px-4 py-3"
            >
              {NIGERIAN_BANKS.map((bank) => (
                <option key={bank.code} value={bank.code}>
                  {bank.name}
                </option>
              ))}
            </select>
            <input
              value={accountNumber}
              onChange={(event) => setAccountNumber(event.target.value)}
              placeholder="10-digit account number"
              className="rounded-xl border border-white/10 bg-black px-4 py-3"
            />
            <input
              value={accountName}
              onChange={(event) => setAccountName(event.target.value)}
              placeholder="Account name"
              className="rounded-xl border border-white/10 bg-black px-4 py-3"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-4 rounded-full border border-[#D4AF37] px-6 py-3 text-sm font-bold text-[#D4AF37] disabled:opacity-60"
          >
            Send to bank
          </button>
        </form>

        <section className="mt-8">
          <h2 className="text-xl font-bold">Recent wallet activity</h2>
          <ul className="mt-4 space-y-3">
            {ledger.length === 0 && (
              <li className="text-sm text-white/50">No wallet activity yet.</li>
            )}
            {ledger.map((row) => (
              <li key={row.id} className="rounded-2xl border border-white/10 px-4 py-3 text-sm">
                <span className="font-bold capitalize">{row.kind}</span>
                {" · "}
                {money.format(row.amount_ngn)}
                {" · "}
                {row.status}
                {row.note ? ` · ${row.note}` : ""}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}

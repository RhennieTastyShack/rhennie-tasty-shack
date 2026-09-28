import { randomBytes } from "crypto";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export type WalletSnapshot = {
  balance: number;
  held: number;
  available: number;
};

type LedgerRow = {
  id: string;
  auth_user_id: string;
  kind: string;
  amount_ngn: number;
  reference: string | null;
  status: string;
  note: string | null;
  bank_name: string | null;
  account_number: string | null;
  account_name: string | null;
  created_at: string;
};

function missingTable(message: string) {
  return /does not exist|schema cache/i.test(message);
}

async function ensureWallet(userId: string) {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from("customer_wallets")
    .select("id, balance_ngn, held_ngn")
    .eq("auth_user_id", userId)
    .maybeSingle();

  if (error) {
    return { wallet: null, error: error.message, missing: missingTable(error.message) };
  }

  if (data) {
    return { wallet: data, error: null, missing: false };
  }

  const created = await admin
    .from("customer_wallets")
    .insert({ auth_user_id: userId, balance_ngn: 0, held_ngn: 0 })
    .select("id, balance_ngn, held_ngn")
    .single();

  if (created.error || !created.data) {
    return {
      wallet: null,
      error: created.error?.message || "Unable to open the RTS wallet.",
      missing: created.error ? missingTable(created.error.message) : false,
    };
  }

  return { wallet: created.data, error: null, missing: false };
}

export function snapshot(wallet: {
  balance_ngn: number;
  held_ngn: number;
}): WalletSnapshot {
  const balance = Math.max(0, Math.round(Number(wallet.balance_ngn) || 0));
  const held = Math.max(0, Math.round(Number(wallet.held_ngn) || 0));
  return {
    balance,
    held,
    available: Math.max(0, balance - held),
  };
}

export async function readWallet(userId: string) {
  const opened = await ensureWallet(userId);

  if (!opened.wallet) {
    return {
      snapshot: null as WalletSnapshot | null,
      ledger: [] as LedgerRow[],
      error: opened.error,
      missing: opened.missing,
    };
  }

  const admin = getSupabaseAdmin();
  const { data: ledger, error } = await admin
    .from("wallet_ledger")
    .select(
      "id, auth_user_id, kind, amount_ngn, reference, status, note, bank_name, account_number, account_name, created_at"
    )
    .eq("auth_user_id", userId)
    .order("created_at", { ascending: false })
    .limit(20);

  return {
    snapshot: snapshot(opened.wallet),
    ledger: (ledger || []) as LedgerRow[],
    error: error?.message || null,
    missing: error ? missingTable(error.message) : false,
  };
}

export function walletReference() {
  return `RTS-WALLET-${Date.now()}-${randomBytes(6).toString("hex")}`;
}

export async function startTopup(userId: string, amount: number) {
  const opened = await ensureWallet(userId);

  if (!opened.wallet) {
    return { ok: false as const, message: opened.error || "Wallet is unavailable.", missing: opened.missing };
  }

  const reference = walletReference();
  const admin = getSupabaseAdmin();
  const { error } = await admin.from("wallet_ledger").insert({
    auth_user_id: userId,
    kind: "fund",
    amount_ngn: amount,
    reference,
    status: "pending",
    note: "Waiting for Paystack.",
  });

  if (error) {
    return {
      ok: false as const,
      message: missingTable(error.message)
        ? "RTS wallet tables are not in the database yet."
        : error.message,
      missing: missingTable(error.message),
    };
  }

  return { ok: true as const, reference };
}

export async function creditWalletTopup(reference: string, amountNgn: number) {
  if (!reference.startsWith("RTS-WALLET-")) {
    return { handled: false as const };
  }

  const admin = getSupabaseAdmin();
  const { data: row, error } = await admin
    .from("wallet_ledger")
    .select("id, auth_user_id, amount_ngn, status")
    .eq("reference", reference)
    .maybeSingle();

  if (error) {
    return {
      handled: true as const,
      ok: false,
      message: error.message,
      retry: missingTable(error.message),
    };
  }

  if (!row) {
    return { handled: true as const, ok: false, message: "Wallet top-up was not found.", retry: false };
  }

  if (row.status === "posted") {
    return { handled: true as const, ok: true, message: "Already credited." };
  }

  const expected = Math.round(Number(row.amount_ngn));
  if (expected !== Math.round(amountNgn)) {
    return {
      handled: true as const,
      ok: false,
      message: "Top-up amount does not match.",
      retry: false,
    };
  }

  const opened = await ensureWallet(row.auth_user_id);
  if (!opened.wallet) {
    return {
      handled: true as const,
      ok: false,
      message: opened.error || "Wallet is unavailable.",
      retry: true,
    };
  }

  const nextBalance = Math.round(Number(opened.wallet.balance_ngn)) + expected;
  const { data: updated, error: updateError } = await admin
    .from("customer_wallets")
    .update({
      balance_ngn: nextBalance,
      updated_at: new Date().toISOString(),
    })
    .eq("id", opened.wallet.id)
    .eq("balance_ngn", opened.wallet.balance_ngn)
    .select("id")
    .maybeSingle();

  if (updateError || !updated) {
    return {
      handled: true as const,
      ok: false,
      message: updateError?.message || "Wallet balance changed. Try the webhook again.",
      retry: true,
    };
  }

  await admin
    .from("wallet_ledger")
    .update({ status: "posted", note: "Paystack payment received." })
    .eq("id", row.id)
    .eq("status", "pending");

  return { handled: true as const, ok: true, message: "Wallet funded." };
}

export async function confirmWalletTopup(userId: string, reference: string) {
  if (!reference.startsWith("RTS-WALLET-")) {
    return { ok: false as const, message: "That payment is not a wallet top-up." };
  }

  const admin = getSupabaseAdmin();
  const { data: row, error } = await admin
    .from("wallet_ledger")
    .select("auth_user_id, status")
    .eq("reference", reference)
    .maybeSingle();

  if (error || !row || row.auth_user_id !== userId) {
    return { ok: false as const, message: "This top-up is not on your wallet." };
  }

  if (row.status === "posted") {
    return { ok: true as const, message: "Your wallet has been funded." };
  }

  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    return { ok: false as const, message: "Paystack is not connected to confirm this payment." };
  }

  const verify = await fetch(
    `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
    {
      headers: { Authorization: `Bearer ${secret}` },
      cache: "no-store",
    }
  );
  const result = await verify.json().catch(() => null);
  const status = String(result?.data?.status || "");

  if (status !== "success") {
    return {
      ok: false as const,
      pending: status === "pending" || status === "ongoing" || status === "abandoned",
      message:
        status === "pending" || status === "ongoing"
          ? "Paystack has not confirmed the bank transfer yet. Check again in a moment."
          : "This payment is not confirmed yet.",
    };
  }

  const amountNgn = Math.round(Number(result?.data?.amount || 0) / 100);
  const credited = await creditWalletTopup(reference, amountNgn);

  if (!credited.handled || !credited.ok) {
    return {
      ok: false as const,
      message: credited.handled ? credited.message : "Unable to credit the wallet.",
    };
  }

  return { ok: true as const, message: "Your wallet has been funded." };
}

export async function debitWallet(userId: string, amount: number, reference: string) {
  const opened = await ensureWallet(userId);

  if (!opened.wallet) {
    return {
      ok: false as const,
      message: opened.missing
        ? "RTS wallet tables are not in the database yet."
        : opened.error || "Wallet is unavailable.",
    };
  }

  const current = snapshot(opened.wallet);
  if (current.available < amount) {
    return {
      ok: false as const,
      message: `RTS wallet has ₦${current.available.toLocaleString("en-NG")} available.`,
    };
  }

  const admin = getSupabaseAdmin();
  const nextBalance = current.balance - amount;
  const { data: updated, error } = await admin
    .from("customer_wallets")
    .update({
      balance_ngn: nextBalance,
      updated_at: new Date().toISOString(),
    })
    .eq("id", opened.wallet.id)
    .eq("balance_ngn", opened.wallet.balance_ngn)
    .select("id")
    .maybeSingle();

  if (error || !updated) {
    return { ok: false as const, message: "Wallet balance changed. Try the payment again." };
  }

  await admin.from("wallet_ledger").insert({
    auth_user_id: userId,
    kind: "order",
    amount_ngn: amount,
    reference,
    status: "posted",
    note: "Paid an order from the RTS wallet.",
  });

  return { ok: true as const };
}

export async function requestWithdrawal(input: {
  userId: string;
  amount: number;
  bankName: string;
  accountNumber: string;
  accountName: string;
}) {
  const opened = await ensureWallet(input.userId);

  if (!opened.wallet) {
    return {
      ok: false as const,
      message: opened.missing
        ? "RTS wallet tables are not in the database yet."
        : opened.error || "Wallet is unavailable.",
    };
  }

  const current = snapshot(opened.wallet);
  if (current.available < input.amount) {
    return {
      ok: false as const,
      message: `RTS wallet has ₦${current.available.toLocaleString("en-NG")} available.`,
    };
  }

  const admin = getSupabaseAdmin();
  const nextHeld = current.held + input.amount;
  const { data: updated, error } = await admin
    .from("customer_wallets")
    .update({
      held_ngn: nextHeld,
      updated_at: new Date().toISOString(),
    })
    .eq("id", opened.wallet.id)
    .eq("held_ngn", opened.wallet.held_ngn)
    .select("id")
    .maybeSingle();

  if (error || !updated) {
    return { ok: false as const, message: "Wallet balance changed. Try the withdrawal again." };
  }

  const reference = `RTS-WITHDRAW-${Date.now()}-${randomBytes(4).toString("hex")}`;
  const { error: ledgerError } = await admin.from("wallet_ledger").insert({
    auth_user_id: input.userId,
    kind: "withdraw",
    amount_ngn: input.amount,
    reference,
    status: "pending",
    note: "Sending to the bank account.",
    bank_name: input.bankName,
    account_number: input.accountNumber,
    account_name: input.accountName,
  });

  if (ledgerError) {
    await admin
      .from("customer_wallets")
      .update({
        held_ngn: current.held,
        updated_at: new Date().toISOString(),
      })
      .eq("id", opened.wallet.id);

    return { ok: false as const, message: ledgerError.message };
  }

  return { ok: true as const, reference };
}

async function releaseHold(userId: string, amount: number, reference: string, note: string) {
  const admin = getSupabaseAdmin();
  const opened = await ensureWallet(userId);
  if (!opened.wallet) return;

  const current = snapshot(opened.wallet);
  await admin
    .from("customer_wallets")
    .update({
      held_ngn: Math.max(0, current.held - amount),
      updated_at: new Date().toISOString(),
    })
    .eq("id", opened.wallet.id);

  await admin.from("wallet_ledger").update({ status: "failed", note }).eq("reference", reference);
}

async function settleSend(userId: string, amount: number, reference: string) {
  const admin = getSupabaseAdmin();
  const opened = await ensureWallet(userId);
  if (!opened.wallet) return false;

  const current = snapshot(opened.wallet);
  const { data: updated } = await admin
    .from("customer_wallets")
    .update({
      balance_ngn: Math.max(0, current.balance - amount),
      held_ngn: Math.max(0, current.held - amount),
      updated_at: new Date().toISOString(),
    })
    .eq("id", opened.wallet.id)
    .eq("balance_ngn", opened.wallet.balance_ngn)
    .select("id")
    .maybeSingle();

  if (!updated) return false;

  await admin
    .from("wallet_ledger")
    .update({ status: "posted", note: "Sent to the bank account." })
    .eq("reference", reference);

  return true;
}

export async function sendFromWallet(input: {
  userId: string;
  amount: number;
  bankName: string;
  bankCode: string;
  accountNumber: string;
  accountName: string;
}) {
  const started = await requestWithdrawal(input);
  if (!started.ok || !started.reference) return started;

  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    return {
      ok: true as const,
      reference: started.reference,
      sent: false,
      message: "The amount is held. Paystack is not connected, so the bank send is waiting.",
    };
  }

  try {
    const recipientResponse = await fetch("https://api.paystack.co/transferrecipient", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "nuban",
        name: input.accountName,
        account_number: input.accountNumber,
        bank_code: input.bankCode,
        currency: "NGN",
      }),
    });
    const recipient = await recipientResponse.json();
    const recipientCode = recipient?.data?.recipient_code;

    if (!recipientCode) {
      const message = recipient?.message || "That bank account could not be verified.";
      await releaseHold(input.userId, input.amount, started.reference, message);
      return { ok: false as const, message };
    }

    const transferResponse = await fetch("https://api.paystack.co/transfer", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        source: "balance",
        amount: Math.round(input.amount * 100),
        recipient: recipientCode,
        reference: started.reference,
        reason: "RTS wallet send",
      }),
    });
    const transfer = await transferResponse.json();

    if (!transfer?.status) {
      const message = transfer?.message || "The bank send was not completed.";
      await releaseHold(input.userId, input.amount, started.reference, message);
      return { ok: false as const, message };
    }

    await settleSend(input.userId, input.amount, started.reference);

    return {
      ok: true as const,
      reference: started.reference,
      sent: true,
      message: `₦${input.amount.toLocaleString("en-NG")} is on the way to ${input.accountName}.`,
    };
  } catch {
    await releaseHold(
      input.userId,
      input.amount,
      started.reference,
      "The bank send could not be started."
    );
    return { ok: false as const, message: "The bank send could not be started." };
  }
}
